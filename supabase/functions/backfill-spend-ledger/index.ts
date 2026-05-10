import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// One-shot backfill: read existing metrics rows and mirror their spend into
// balance_transactions as negative campaign_spend entries. Idempotent thanks
// to the UNIQUE(source_type, source_ref) constraint.
serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    // Page through metrics joined with campaigns to get org_id + platform.
    let from = 0;
    const pageSize = 1000;
    let processed = 0;
    let written = 0;
    let skipped = 0;

    while (true) {
      const { data, error } = await supabase
        .from("metrics")
        .select("id, campaign_id, date, spend, campaigns!inner(name, org_id, platform)")
        .gt("spend", 0)
        .range(from, from + pageSize - 1);

      if (error) throw error;
      if (!data || data.length === 0) break;

      for (const row of data as any[]) {
        processed++;
        const orgId = row.campaigns?.org_id;
        const platform = (row.campaigns?.platform || "meta").toLowerCase();
        const name = row.campaigns?.name || "campaign";
        if (!orgId) { skipped++; continue; }

        // Meta sync stores a single aggregated row per campaign; use date-less ref.
        // TikTok stores per-day; include date in ref.
        const sourceRef = platform === "meta"
          ? `meta:${row.campaign_id}`
          : `tiktok:${row.campaign_id}:${row.date}`;

        const { error: upErr } = await supabase
          .from("balance_transactions")
          .upsert({
            org_id: orgId,
            source_type: "campaign_spend",
            source_ref: sourceRef,
            amount: -Number(row.spend),
            currency: "EUR",
            occurred_at: new Date(row.date).toISOString(),
            description: `${platform === "meta" ? "Meta" : "TikTok"} spend: ${name}`,
          }, { onConflict: "source_type,source_ref" });

        if (upErr) {
          console.error("Backfill upsert failed", sourceRef, upErr);
          skipped++;
        } else {
          written++;
        }
      }

      if (data.length < pageSize) break;
      from += pageSize;
    }

    return new Response(
      JSON.stringify({ success: true, processed, written, skipped }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e: any) {
    console.error("backfill-spend-ledger error", e);
    return new Response(JSON.stringify({ success: false, error: e.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

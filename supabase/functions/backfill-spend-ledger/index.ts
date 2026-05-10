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

    // Load all campaigns once (id -> { org_id, platform, name }).
    const campaignMap = new Map<string, { org_id: string; platform: string; name: string }>();
    let cFrom = 0;
    while (true) {
      const { data, error } = await supabase
        .from("campaigns")
        .select("id, org_id, platform, name")
        .range(cFrom, cFrom + 999);
      if (error) throw error;
      if (!data || data.length === 0) break;
      for (const c of data) {
        if (c.org_id) campaignMap.set(c.id, { org_id: c.org_id, platform: (c.platform || "meta").toLowerCase(), name: c.name || "campaign" });
      }
      if (data.length < 1000) break;
      cFrom += 1000;
    }

    let from = 0;
    const pageSize = 1000;
    let processed = 0;
    let written = 0;
    let skipped = 0;

    while (true) {
      const { data, error } = await supabase
        .from("metrics")
        .select("id, campaign_id, date, spend")
        .gt("spend", 0)
        .range(from, from + pageSize - 1);

      if (error) throw error;
      if (!data || data.length === 0) break;

      for (const row of data) {
        processed++;
        const c = campaignMap.get(row.campaign_id);
        if (!c) { skipped++; continue; }

        const sourceRef = c.platform === "meta"
          ? `meta:${row.campaign_id}`
          : `tiktok:${row.campaign_id}:${row.date}`;

        const { error: upErr } = await supabase
          .from("balance_transactions")
          .upsert({
            org_id: c.org_id,
            source_type: "campaign_spend",
            source_ref: sourceRef,
            amount: -Number(row.spend),
            currency: "EUR",
            occurred_at: new Date(row.date).toISOString(),
            description: `${c.platform === "meta" ? "Meta" : "TikTok"} spend: ${c.name}`,
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

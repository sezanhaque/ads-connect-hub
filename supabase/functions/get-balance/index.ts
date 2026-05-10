import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("Missing authorization header");

    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userErr } = await userClient.auth.getUser(token);
    if (userErr || !userData?.user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const userId = userData.user.id;

    const admin = createClient(supabaseUrl, serviceKey);

    const { data: members } = await admin
      .from("members")
      .select("org_id, role")
      .eq("user_id", userId);

    if (!members || members.length === 0) {
      return new Response(
        JSON.stringify({ balance: 0, totalTopups: 0, totalCosts: 0, currency: "EUR" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }
    const primary = members.find((m: any) => m.role === "owner") ||
      members.find((m: any) => m.role === "admin") || members[0];
    const orgId = primary.org_id;

    const { data: row } = await admin
      .from("client_balances")
      .select("*")
      .eq("org_id", orgId)
      .maybeSingle();

    // All-time spend: only campaigns from THIS user's connected Meta/TikTok integrations.
    const { data: userIntegrations } = await admin
      .from("integrations")
      .select("org_id, integration_type")
      .eq("user_id", userId)
      .eq("status", "active")
      .in("integration_type", ["meta", "tiktok"]);

    let totalCosts = 0;
    if (userIntegrations && userIntegrations.length > 0) {
      // Build (org_id, platform) pairs from user's own integrations.
      const platformsByOrg = new Map<string, Set<string>>();
      for (const i of userIntegrations as any[]) {
        if (!i.org_id) continue;
        const set = platformsByOrg.get(i.org_id) ?? new Set<string>();
        set.add(i.integration_type);
        platformsByOrg.set(i.org_id, set);
      }

      // Fetch campaigns the user created in those orgs, restricted to integrated platforms.
      const campaignIds: string[] = [];
      for (const [oid, platforms] of platformsByOrg.entries()) {
        const { data: camps } = await admin
          .from("campaigns")
          .select("id, platform")
          .eq("org_id", oid)
          .eq("created_by", userId)
          .in("platform", Array.from(platforms));
        if (camps) for (const c of camps as any[]) campaignIds.push(c.id);
      }

      if (campaignIds.length > 0) {
        const [{ data: m1 }, { data: m2 }] = await Promise.all([
          admin.from("metrics").select("spend").in("campaign_id", campaignIds),
          admin.from("campaign_metrics").select("spend").in("campaign_id", campaignIds),
        ]);
        for (const r of (m1 || []) as any[]) totalCosts += Number(r?.spend ?? 0);
        for (const r of (m2 || []) as any[]) totalCosts += Number(r?.spend ?? 0);
      }
    }

    return new Response(
      JSON.stringify({
        orgId,
        balance: Number(row?.current_balance ?? 0),
        totalTopups: Number(row?.total_topups ?? 0),
        totalCosts,
        currency: row?.currency ?? "EUR",
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (error: any) {
    console.error("get-balance error", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

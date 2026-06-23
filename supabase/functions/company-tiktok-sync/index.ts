import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const STATUS_MAP: Record<string, string> = {
  CAMPAIGN_STATUS_ENABLE: "active",
  CAMPAIGN_STATUS_DISABLE: "paused",
  CAMPAIGN_STATUS_DELETE: "deleted",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    const userClient = createClient(supabaseUrl, anonKey, { global: { headers: { Authorization: authHeader } } });
    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userErr } = await userClient.auth.getUser(token);
    if (userErr || !userData?.user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    const userId = userData.user.id;

    const admin = createClient(supabaseUrl, serviceKey);

    const body = await req.json().catch(() => ({}));
    let companyId: string | null = body?.company_id ? String(body.company_id) : null;
    if (!companyId) {
      const { data: cm } = await admin
        .from("company_members")
        .select("company_id")
        .eq("user_id", userId)
        .limit(1)
        .maybeSingle();
      companyId = cm?.company_id ?? null;
    }
    if (!companyId) {
      return new Response(JSON.stringify({ success: false, error: "No company linked to this user" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const { data: membership } = await admin
      .from("company_members")
      .select("company_id")
      .eq("company_id", companyId)
      .eq("user_id", userId)
      .maybeSingle();
    if (!membership) {
      return new Response(JSON.stringify({ error: "Forbidden" }), { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const { data: integ } = await admin
      .from("company_integrations")
      .select("access_token, ad_account_ids")
      .eq("company_id", companyId)
      .eq("integration_type", "tiktok")
      .maybeSingle();

    const accessToken = integ?.access_token;
    const advertiserId = (integ?.ad_account_ids ?? [])[0];
    if (!accessToken || !advertiserId) {
      return new Response(JSON.stringify({ success: false, error: "Company TikTok token or advertiser ID not configured" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const { data: callerMember } = await admin
      .from("members")
      .select("org_id, role")
      .eq("user_id", userId)
      .order("role", { ascending: true })
      .limit(1)
      .maybeSingle();
    const orgId = callerMember?.org_id ?? null;

    // Fetch campaigns
    const campRes = await fetch(
      `https://business-api.tiktok.com/open_api/v1.3/campaign/get/?advertiser_id=${advertiserId}&page_size=100`,
      { headers: { "Access-Token": accessToken, "Content-Type": "application/json" } },
    );
    const campJson = await campRes.json();
    if (campJson.code !== 0) {
      return new Response(JSON.stringify({ success: false, error: `TikTok API: ${campJson.message}` }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    const campaigns = (campJson.data?.list || []) as Array<{ campaign_id: string; campaign_name: string; status: string; objective_type: string; budget: number }>;

    let syncedCount = 0;
    for (const c of campaigns) {
      const status = STATUS_MAP[c.status] || "paused";

      const { data: existing } = await admin
        .from("campaigns")
        .select("id")
        .eq("company_id", companyId)
        .eq("platform", "tiktok")
        .eq("name", c.campaign_name)
        .maybeSingle();

      let campaignId: string;
      if (existing) {
        await admin.from("campaigns").update({
          status,
          objective: c.objective_type || "TRAFFIC",
          updated_at: new Date().toISOString(),
        }).eq("id", existing.id);
        campaignId = existing.id;
      } else {
        const { data: created, error: insErr } = await admin.from("campaigns").insert({
          name: c.campaign_name,
          company_id: companyId,
          org_id: orgId,
          platform: "tiktok",
          status,
          objective: c.objective_type || "TRAFFIC",
          budget: c.budget || 0,
          created_by: userId,
          location_targeting: {},
          audience_targeting: {},
        }).select("id").single();
        if (insErr || !created) { console.error("insert campaign", insErr); continue; }
        campaignId = created.id;
      }

      // Fetch insights (last 2 years, daily)
      const endDate = new Date().toISOString().split("T")[0];
      const startDate = new Date(Date.now() - 730 * 86400000).toISOString().split("T")[0];
      const insightsRes = await fetch("https://business-api.tiktok.com/open_api/v1.3/report/integrated/get/", {
        method: "POST",
        headers: { "Access-Token": accessToken, "Content-Type": "application/json" },
        body: JSON.stringify({
          advertiser_id: advertiserId,
          service_type: "AUCTION",
          report_type: "BASIC",
          data_level: "AUCTION_CAMPAIGN",
          dimensions: ["campaign_id", "stat_time_day"],
          metrics: ["spend", "impressions", "clicks", "conversion"],
          start_date: startDate,
          end_date: endDate,
          filters: [{ field_name: "campaign_ids", filter_type: "IN", filter_value: JSON.stringify([c.campaign_id]) }],
        }),
      });
      const insightsJson = await insightsRes.json().catch(() => ({}));
      if (insightsJson.code === 0 && insightsJson.data?.list) {
        await admin.from("metrics").delete().eq("campaign_id", campaignId);
        for (const row of insightsJson.data.list) {
          const dim = row.dimensions;
          const m = row.metrics;
          const spendEur = parseFloat(m.spend || "0") / 100;
          await admin.from("metrics").insert({
            campaign_id: campaignId,
            date: dim.stat_time_day,
            impressions: parseInt(m.impressions || "0"),
            clicks: parseInt(m.clicks || "0"),
            spend: spendEur,
            leads: parseInt(m.conversion || "0"),
          });
        }
      }

      syncedCount++;
    }

    await admin
      .from("company_integrations")
      .update({ last_sync_at: new Date().toISOString() })
      .eq("company_id", companyId)
      .eq("integration_type", "tiktok");

    return new Response(JSON.stringify({ success: true, synced_count: syncedCount, total_campaigns: campaigns.length, company_id: companyId }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("company-tiktok-sync error", error);
    return new Response(JSON.stringify({ success: false, error: error.message }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});

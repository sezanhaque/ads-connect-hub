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
      .select("ad_account_ids")
      .eq("company_id", companyId)
      .eq("integration_type", "tiktok")
      .maybeSingle();

    const advertiserIds: string[] = integ?.ad_account_ids ?? [];
    if (advertiserIds.length === 0) {
      return new Response(JSON.stringify({ success: false, error: "No TikTok advertiser IDs configured for this company" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // Source access token from any active admin-org TikTok integration (shared platform token)
    const { data: tokenRow } = await admin
      .from("integrations")
      .select("access_token")
      .eq("integration_type", "tiktok")
      .eq("status", "active")
      .not("access_token", "is", null)
      .order("updated_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    const accessToken = tokenRow?.access_token;
    if (!accessToken) {
      return new Response(JSON.stringify({ success: false, error: "No shared TikTok access token available. An admin must connect TikTok first." }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const { data: callerMember } = await admin
      .from("members")
      .select("org_id, role")
      .eq("user_id", userId)
      .order("role", { ascending: true })
      .limit(1)
      .maybeSingle();
    const orgId = callerMember?.org_id ?? null;

    let syncedCount = 0;
    let totalCampaigns = 0;
    const errors: Array<{ advertiser_id: string; stage: string; message: string }> = [];

    const safeJson = async (res: Response): Promise<any> => {
      const text = await res.text();
      try {
        return JSON.parse(text);
      } catch {
        return { code: -1, message: `Non-JSON response (HTTP ${res.status}): ${text.slice(0, 300)}` };
      }
    };

    for (const advertiserId of advertiserIds) {
      const campRes = await fetch(
        `https://business-api.tiktok.com/open_api/v1.3/campaign/get/?advertiser_id=${advertiserId}&page_size=100`,
        { headers: { "Access-Token": accessToken, "Content-Type": "application/json" } },
      );
      const campJson = await safeJson(campRes);
      if (campJson.code !== 0) {
        console.error(`TikTok campaign/get error for ${advertiserId}:`, campJson.message);
        errors.push({ advertiser_id: advertiserId, stage: "campaign/get", message: String(campJson.message ?? "unknown") });
        continue;
      }
      const campaigns = (campJson.data?.list || []) as Array<{ campaign_id: string; campaign_name: string; status: string; objective_type: string; budget: number }>;
      totalCampaigns += campaigns.length;

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

        const endDate = new Date().toISOString().split("T")[0];
        // TikTok rejects stat_time_day reports over 30 days. For the company dashboard,
        // store a campaign-level aggregate for the recent performance window instead.
        const startDate = new Date(Date.now() - 29 * 86400000).toISOString().split("T")[0];
        let insightsRes: Response;
        try {
          const reportParams = new URLSearchParams({
            advertiser_id: advertiserId,
            service_type: "AUCTION",
            report_type: "BASIC",
            data_level: "AUCTION_CAMPAIGN",
            dimensions: JSON.stringify(["campaign_id"]),
            metrics: JSON.stringify(["spend", "impressions", "clicks", "conversion", "ctr", "cpc"]),
            start_date: startDate,
            end_date: endDate,
            filters: JSON.stringify([{ field_name: "campaign_ids", filter_type: "IN", filter_value: JSON.stringify([c.campaign_id]) }]),
          });

          insightsRes = await fetch(`https://business-api.tiktok.com/open_api/v1.3/report/integrated/get/?${reportParams.toString()}`, {
            method: "GET",
            headers: { "Access-Token": accessToken, "Content-Type": "application/json" },
          });
        } catch (e: any) {
          errors.push({ advertiser_id: advertiserId, stage: "report/fetch", message: e?.message ?? String(e) });
          syncedCount++;
          continue;
        }
        const insightsJson = await safeJson(insightsRes);
        if (insightsJson.code === 0 && insightsJson.data?.list) {
          await admin.from("metrics").delete().eq("campaign_id", campaignId);
          for (const row of insightsJson.data.list) {
            const m = row.metrics;
            const spendEur = parseFloat(m.spend || "0");
            await admin.from("metrics").insert({
              campaign_id: campaignId,
              date: endDate,
              impressions: parseInt(m.impressions || "0"),
              clicks: parseInt(m.clicks || "0"),
              spend: spendEur,
              leads: parseInt(m.conversion || "0"),
            });
          }
        } else if (insightsJson.code !== 0) {
          console.error(`TikTok report error for ${advertiserId}/${c.campaign_id}:`, insightsJson.message);
          errors.push({ advertiser_id: advertiserId, stage: "report/get", message: String(insightsJson.message ?? "unknown") });
        }

        syncedCount++;
      }
    }

    await admin
      .from("company_integrations")
      .update({ last_sync_at: new Date().toISOString() })
      .eq("company_id", companyId)
      .eq("integration_type", "tiktok");

    return new Response(JSON.stringify({ success: true, synced_count: syncedCount, total_campaigns: totalCampaigns, company_id: companyId, errors }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("company-tiktok-sync error", error);
    return new Response(JSON.stringify({ success: false, error: error.message }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});

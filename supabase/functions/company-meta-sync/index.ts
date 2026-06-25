import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const mapStatus = (s: string) => {
  switch (s) {
    case "ACTIVE": return "active";
    case "PAUSED": return "paused";
    case "DELETED": return "deleted";
    case "ARCHIVED": return "archived";
    default: return "draft";
  }
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

    // Resolve company: from body, or from the caller's company_members row
    const body = await req.json().catch(() => ({}));
    let companyId: string | null = body?.company_id ? String(body.company_id) : null;
    const bodyStart: string | null = body?.start_date ? String(body.start_date) : null;
    const bodyEnd: string | null = body?.end_date ? String(body.end_date) : null;
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


    // Verify caller is a member of that company
    const { data: membership } = await admin
      .from("company_members")
      .select("company_id")
      .eq("company_id", companyId)
      .eq("user_id", userId)
      .maybeSingle();
    if (!membership) {
      return new Response(JSON.stringify({ error: "Forbidden" }), { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // Load shared Meta integration (ad account IDs for the company)
    const { data: integ } = await admin
      .from("company_integrations")
      .select("ad_account_ids")
      .eq("company_id", companyId)
      .eq("integration_type", "meta")
      .maybeSingle();

    const adAccountIds: string[] = integ?.ad_account_ids ?? [];
    if (adAccountIds.length === 0) {
      return new Response(JSON.stringify({ success: false, error: "No Meta ad accounts configured for this company" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // Source access token from any active admin-org Meta integration (shared platform token)
    const { data: tokenRow } = await admin
      .from("integrations")
      .select("access_token")
      .eq("integration_type", "meta")
      .eq("status", "active")
      .not("access_token", "is", null)
      .order("updated_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    const accessToken = tokenRow?.access_token;
    if (!accessToken) {
      return new Response(JSON.stringify({ success: false, error: "No shared Meta access token available. An admin must connect Meta first." }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
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
    const liveCampaigns: Array<{
      id: string;
      name: string;
      status: string;
      objective: string;
      impressions: number;
      clicks: number;
      spend: number;
      ctr: number;
      cpc: number;
      platform: "meta";
    }> = [];

    for (const adAccountId of adAccountIds) {
      const campaignsUrl = `https://graph.facebook.com/v19.0/${adAccountId}/campaigns?access_token=${encodeURIComponent(accessToken)}&fields=id,name,status,objective`;
      const campaignsRes = await fetch(campaignsUrl);
      const campaignsJson = await campaignsRes.json();
      if (campaignsJson.error) {
        console.error(`Meta API error for ${adAccountId}:`, campaignsJson.error.message);
        continue;
      }
      const campaigns = (campaignsJson.data || []) as Array<{ id: string; name: string; status: string; objective: string }>;
      totalCampaigns += campaigns.length;

      for (const c of campaigns) {
        const dateRangeParam = bodyStart && bodyEnd
          ? `&time_range=${encodeURIComponent(JSON.stringify({ since: bodyStart, until: bodyEnd }))}`
          : `&date_preset=maximum`;
        const insightsUrl = `https://graph.facebook.com/v19.0/${c.id}/insights?access_token=${encodeURIComponent(accessToken)}&fields=campaign_id,campaign_name,impressions,clicks,spend,actions,inline_link_clicks,ctr,cpc${dateRangeParam}`;
        const insightsRes = await fetch(insightsUrl);
        const insightsJson = await insightsRes.json();
        const insight = (insightsJson.data || [])[0] || { impressions: "0", clicks: "0", spend: "0", actions: [] };

        const { data: existing } = await admin
          .from("campaigns")
          .select("id")
          .eq("company_id", companyId)
          .eq("platform", "meta")
          .eq("name", c.name)
          .maybeSingle();

        let campaignId: string;
        if (existing) {
          await admin.from("campaigns").update({
            status: mapStatus(c.status),
            objective: c.objective || "OUTCOME_TRAFFIC",
            updated_at: new Date().toISOString(),
          }).eq("id", existing.id);
          campaignId = existing.id;
        } else {
          const { data: created, error: insErr } = await admin.from("campaigns").insert({
            name: c.name,
            company_id: companyId,
            org_id: orgId,
            platform: "meta",
            status: mapStatus(c.status),
            objective: c.objective || "OUTCOME_TRAFFIC",
            budget: 0,
            created_by: userId,
            location_targeting: {},
            audience_targeting: {},
          }).select("id").single();
          if (insErr || !created) { console.error("insert campaign", insErr); continue; }
          campaignId = created.id;
        }

        const leads = insight.actions?.find((a: any) => a.action_type === "lead")?.value || "0";
        const metricDate = bodyEnd || new Date().toISOString().split("T")[0];

        const impressions = parseInt(insight.impressions) || 0;
        const clicks = parseInt(insight.inline_link_clicks ?? insight.clicks) || 0;
        const spend = parseFloat(insight.spend) || 0;
        const ctr = insight.ctr != null ? parseFloat(insight.ctr) || 0 : (impressions > 0 ? (clicks / impressions) * 100 : 0);
        const cpc = insight.cpc != null ? parseFloat(insight.cpc) || 0 : (clicks > 0 ? spend / clicks : 0);

        await admin.from("metrics").delete().eq("campaign_id", campaignId);
        await admin.from("metrics").insert({
          campaign_id: campaignId,
          date: metricDate,
          impressions,
          clicks,
          spend,
          leads: parseInt(leads) || 0,
        });

        liveCampaigns.push({
          id: campaignId,
          name: c.name,
          status: mapStatus(c.status),
          objective: (c.objective || "OUTCOME_TRAFFIC").replace("OUTCOME_", "").replace(/_/g, " ").toLowerCase(),
          impressions,
          clicks,
          spend,
          ctr,
          cpc,
          platform: "meta",
        });

        syncedCount++;
      }
    }


    await admin
      .from("company_integrations")
      .update({ last_sync_at: new Date().toISOString() })
      .eq("company_id", companyId)
      .eq("integration_type", "meta");

    return new Response(JSON.stringify({ success: true, synced_count: syncedCount, total_campaigns: totalCampaigns, company_id: companyId, campaigns: liveCampaigns }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error: any) {
    console.error("company-meta-sync error", error);
    return new Response(JSON.stringify({ success: false, error: error.message }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});

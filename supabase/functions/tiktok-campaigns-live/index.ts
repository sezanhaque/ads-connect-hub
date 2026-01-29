import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface TikTokCampaignInsight {
  campaign_id: string;
  campaign_name: string;
  spend: string;
  impressions: string;
  clicks: string;
  conversion?: string;
  ctr?: string;
  cpc?: string;
}

interface TikTokCampaignData {
  campaign_id: string;
  campaign_name: string;
  status: string;
  objective_type: string;
  budget_mode?: string;
  schedule_end_time?: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get user from auth header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("No authorization header");
    }

    const token = authHeader.replace("Bearer ", "");
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser(token);

    if (userError || !user) {
      throw new Error("Invalid user token");
    }

    const { org_id, date_range } = await req.json();

    console.log("Fetching TikTok campaigns for org:", org_id);

    // Fetch TikTok integration credentials
    const { data: integration, error: intError } = await supabase
      .from("integrations")
      .select("access_token, ad_account_id")
      .eq("org_id", org_id)
      .eq("integration_type", "tiktok")
      .eq("status", "active")
      .or(`user_id.eq.${user.id},user_id.is.null`)
      .order("user_id", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (intError || !integration) {
      throw new Error("No active TikTok integration found");
    }

    const accessToken = integration.access_token;
    const advertiserIds = integration.ad_account_id || [];

    if (advertiserIds.length === 0) {
      throw new Error("No advertiser IDs configured");
    }

    // Map date range to TikTok time range
    const now = new Date();
    let startDate: string;
    let endDate = now.toISOString().split("T")[0];

    switch (date_range) {
      case "last_7d":
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
        break;
      case "last_30d":
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
        break;
      case "last_90d":
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
        break;
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
    }

    const allCampaigns: any[] = [];

    // Fetch campaigns from each advertiser
    for (const advertiserId of advertiserIds) {
      // Fetch campaigns list
      const campaignsResponse = await fetch(
        `https://business-api.tiktok.com/open_api/v1.3/campaign/get/?advertiser_id=${advertiserId}`,
        {
          method: "GET",
          headers: {
            "Access-Token": accessToken,
            "Content-Type": "application/json",
          },
        },
      );

      // Check response status before parsing
      if (!campaignsResponse.ok) {
        console.error("TikTok campaigns API error:", campaignsResponse.status);
        continue;
      }

      let campaignsData;
      try {
        const responseText = await campaignsResponse.text();
        campaignsData = JSON.parse(responseText);
      } catch (parseError) {
        console.error("Failed to parse campaigns response");
        continue;
      }

      if (campaignsData.code !== 0) {
        console.error("TikTok campaigns fetch error:", campaignsData.message);
        continue;
      }

      const campaigns = campaignsData.data?.list || [];

      // Fetch insights for all campaigns
      if (campaigns.length > 0) {
        const campaignIds = campaigns.map((c: TikTokCampaignData) => c.campaign_id);

        // Use GET method with query parameters for TikTok reporting API
        const reportParams = new URLSearchParams({
          advertiser_id: advertiserId,
          service_type: "AUCTION",
          report_type: "BASIC",
          data_level: "AUCTION_CAMPAIGN",
          dimensions: JSON.stringify(["campaign_id"]),
          metrics: JSON.stringify(["spend", "impressions", "clicks", "conversion", "ctr", "cpc"]),
          start_date: startDate,
          end_date: endDate,
        });

        const insightsResponse = await fetch(
          `https://business-api.tiktok.com/open_api/v1.3/report/integrated/get/?${reportParams.toString()}`,
          {
            method: "GET",
            headers: {
              "Access-Token": accessToken,
              "Content-Type": "application/json",
            },
          },
        );

        let insightsData = { code: -1, data: { list: [] } };

        if (insightsResponse.ok) {
          try {
            const insightsText = await insightsResponse.text();
            insightsData = JSON.parse(insightsText);
          } catch (parseError) {
            console.error("Failed to parse insights response");
          }
        } else {
          console.error("TikTok insights API error:", insightsResponse.status);
        }

        // Merge campaign data with insights
        for (const campaign of campaigns) {
          const campaignData: TikTokCampaignData = campaign;

          // Find matching insights
          let insights: any = { metrics: {} };
          if (insightsData.code === 0 && insightsData.data?.list) {
            insights = insightsData.data.list.find(
              (i: any) => i.dimensions.campaign_id === campaignData.campaign_id,
            ) || { metrics: {} };
          }

          const metrics = insights.metrics || {};

          // Map TikTok status, checking end_date for "finished"
          const mapTikTokStatus = (tiktokStatus: string, scheduleEndTime?: string) => {
            const statusMap: { [key: string]: string } = {
              CAMPAIGN_STATUS_ENABLE: "active",
              CAMPAIGN_STATUS_DISABLE: "paused",
              CAMPAIGN_STATUS_DELETE: "deleted",
            };
            
            const baseStatus = statusMap[tiktokStatus] || "paused";
            
            // If status is active or paused, check if end_date has passed
            if ((baseStatus === 'active' || baseStatus === 'paused') && scheduleEndTime) {
              const endDate = new Date(scheduleEndTime);
              const now = new Date();
              if (endDate < now) {
                return 'finished';
              }
            }
            
            return baseStatus;
          };

          const spend = parseFloat(metrics.spend || "0");
          const impressions = parseInt(metrics.impressions || "0");
          const clicks = parseInt(metrics.clicks || "0");
          const conversions = parseInt(metrics.conversion || "0");
          const ctr = parseFloat(metrics.ctr || "0");
          const cpc = parseFloat(metrics.cpc || "0");

          allCampaigns.push({
            id: campaignData.campaign_id,
            name: campaignData.campaign_name,
            status: mapTikTokStatus(campaignData.status, campaignData.schedule_end_time),
            objective: campaignData.objective_type || "TRAFFIC",
            impressions,
            clicks,
            ctr: ctr > 0 ? ctr : clicks > 0 && impressions > 0 ? (clicks / impressions) * 100 : 0,
            spend,
            cpc: cpc > 0 ? cpc : clicks > 0 ? spend / clicks : 0,
            conversions,
            platform: "tiktok",
            end_date: campaignData.schedule_end_time || null,
          });
        }
      }
    }

    console.log(`Returning ${allCampaigns.length} TikTok campaigns`);

    return new Response(
      JSON.stringify({
        success: true,
        campaigns: allCampaigns,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      },
    );
  } catch (error: any) {
    console.error("TikTok campaigns live error:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
        campaigns: [],
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      },
    );
  }
});

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface MetaCampaignInsight {
  campaign_id: string;
  campaign_name: string;
  impressions: string;
  clicks: string;
  inline_link_clicks: string;
  inline_link_click_ctr: string;
  cost_per_inline_link_click: Array<{ value: string }>;
  spend: string;
  actions?: Array<{ action_type: string; value: string }>;
  date_start: string;
  date_stop: string;
}

interface MetaCampaignData {
  id: string;
  name: string;
  status: string;
  objective: string;
  start_time?: string;
  stop_time?: string;
}

serve(async (req) => {
  console.log('Meta campaigns live function called:', req.method);
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const authHeader = req.headers.get('Authorization');
    
    if (!authHeader) {
      console.error('No authorization header provided');
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Authorization header is required' 
      }), {
        status: 401,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: { headers: { Authorization: authHeader } },
    });

    // Extract user id from JWT
    const rawToken = authHeader.replace('Bearer ', '').trim();
    let userId = '';
    try {
      const base64Url = rawToken.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const payload = JSON.parse(atob(base64));
      userId = payload.sub as string;
    } catch (e) {
      console.error('Failed to decode JWT:', e);
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Unauthorized - invalid token' 
      }), {
        status: 401,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    if (!userId) {
      console.error('JWT missing sub');
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Unauthorized - no user' 
      }), {
        status: 401,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    console.log('Authenticated user:', userId);

    // Parse request body
    const { date_range = 'last_7d', org_id } = await req.json();
    
    console.log('Request params:', { 
      dateRange: date_range,
      orgId: org_id
    });

    if (!org_id) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Organization ID is required' 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    // Get stored Meta integration credentials
    let { data: integration, error: integrationError } = await supabase
      .from('integrations')
      .select('access_token, ad_account_id, account_name, status')
      .eq('org_id', org_id)
      .eq('integration_type', 'meta')
      .eq('status', 'active')
      .eq('user_id', userId)
      .maybeSingle();

    // If no user-specific integration, check for org-level integration
    if (!integration && !integrationError) {
      const { data: orgIntegration, error: orgError } = await supabase
        .from('integrations')
        .select('access_token, ad_account_id, account_name, status')
        .eq('org_id', org_id)
        .eq('integration_type', 'meta')
        .eq('status', 'active')
        .is('user_id', null)
        .maybeSingle();
      
      integration = orgIntegration;
      integrationError = orgError;
    }

    if (integrationError) {
      console.error('Error fetching integration:', integrationError);
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Failed to fetch stored credentials' 
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    if (!integration) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'No Meta integration found' 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    const accessToken = integration.access_token;
    let adAccountIds = integration.ad_account_id;

    // Handle ad_account_id as array and remove duplicates
    if (Array.isArray(adAccountIds)) {
      adAccountIds = [...new Set(adAccountIds)]; // Remove duplicates
    } else {
      adAccountIds = [adAccountIds]; // Convert single value to array
    }

    console.log('Using stored credentials for accounts:', adAccountIds);

    // Map date range to Meta API format
    let metaDateParam = '';
    if (date_range === 'today') {
      metaDateParam = 'date_preset=today';
    } else if (date_range === 'yesterday') {
      metaDateParam = 'date_preset=yesterday';
    } else if (date_range === 'last_7d') {
      metaDateParam = 'date_preset=last_7d';
    } else if (date_range === 'last_14d') {
      metaDateParam = 'date_preset=last_14d';
    } else if (date_range === 'last_30d') {
      metaDateParam = 'date_preset=last_30d';
    } else if (date_range.includes('|')) {
      // Custom date range format: "YYYY-MM-DD|YYYY-MM-DD"
      const [startDate, endDate] = date_range.split('|');
      metaDateParam = `time_range={'since':'${startDate}','until':'${endDate}'}`;
    } else {
      metaDateParam = 'date_preset=last_7d'; // fallback
    }

    console.log('Meta date parameter:', metaDateParam);

    // Step 1: Get campaigns from all ad accounts
    console.log('Fetching campaigns from', adAccountIds.length, 'ad account(s)...');
    const allCampaigns: MetaCampaignData[] = [];

    for (const adAccountId of adAccountIds) {
      try {
        const campaignsUrl = `https://graph.facebook.com/v19.0/${adAccountId}/campaigns?access_token=${accessToken}&fields=id,name,status,objective,start_time,stop_time`;
        const campaignsResponse = await fetch(campaignsUrl);
        const campaignsData = await campaignsResponse.json();

        if (campaignsData.error) {
          console.error(`Error fetching campaigns from ${adAccountId}:`, campaignsData.error);
          continue; // Skip this account and try the next one
        }

        const campaigns: MetaCampaignData[] = campaignsData.data || [];
        console.log(`Found ${campaigns.length} campaigns in ${adAccountId}`);
        allCampaigns.push(...campaigns);
      } catch (error) {
        console.error(`Failed to fetch campaigns from ${adAccountId}:`, error);
        continue;
      }
    }

    const campaigns = allCampaigns;
    console.log(`Total: ${campaigns.length} campaigns across all accounts`);

    if (campaigns.length === 0) {
      return new Response(JSON.stringify({ 
        success: true, 
        campaigns: [],
        message: 'No campaigns found in this ad account'
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    // Step 2: Get insights for each campaign with the specified date range
    const campaignResults = [];
    
    for (const campaign of campaigns) {
      try {
        console.log(`Fetching insights for campaign: ${campaign.name}`);
        const insightsUrl = `https://graph.facebook.com/v19.0/${campaign.id}/insights?access_token=${accessToken}&fields=campaign_id,campaign_name,impressions,clicks,inline_link_clicks,inline_link_click_ctr,cost_per_inline_link_click,spend,actions&${metaDateParam}`;
        const insightsResponse = await fetch(insightsUrl);
        const insightsData = await insightsResponse.json();

        let totalImpressions = 0;
        let totalClicks = 0;
        let totalLinkClicks = 0;
        let totalSpend = 0;
        let totalLeads = 0;
        let weightedCtr = 0;
        let weightedCpc = 0;

        if (insightsData.data && insightsData.data.length > 0) {
          // Aggregate metrics across all insight periods
          insightsData.data.forEach((insight: MetaCampaignInsight) => {
            const impressions = parseInt(insight.impressions) || 0;
            const linkClicks = parseInt(insight.inline_link_clicks) || 0;
            const spend = parseFloat(insight.spend) || 0;
            
            totalImpressions += impressions;
            totalClicks += parseInt(insight.clicks) || 0;
            totalLinkClicks += linkClicks;
            totalSpend += spend;
            
            // Get leads count from actions
            const leads = insight.actions?.find(action => action.action_type === 'lead')?.value || '0';
            totalLeads += parseInt(leads) || 0;
          });
        }

        // Map Meta status to our status, checking end_date for "finished"
        const mapStatus = (metaStatus: string, stopTime?: string) => {
          const baseStatus = (() => {
            switch (metaStatus) {
              case 'ACTIVE': return 'active';
              case 'PAUSED': return 'paused';
              case 'DELETED': return 'deleted';
              case 'ARCHIVED': return 'archived';
              default: return 'draft';
            }
          })();
          
          // If status is active or paused, check if end_date has passed
          if ((baseStatus === 'active' || baseStatus === 'paused') && stopTime) {
            const endDate = new Date(stopTime);
            const now = new Date();
            if (endDate < now) {
              return 'finished';
            }
          }
          
          return baseStatus;
        };

        // Calculate link CTR and link CPC
        const linkCtr = totalImpressions > 0 ? (totalLinkClicks / totalImpressions) * 100 : 0;
        const linkCpc = totalLinkClicks > 0 ? totalSpend / totalLinkClicks : 0;

        campaignResults.push({
          id: campaign.id,
          name: campaign.name,
          status: mapStatus(campaign.status, campaign.stop_time),
          objective: campaign.objective,
          total_impressions: totalImpressions,
          total_clicks: totalLinkClicks, // Now using link clicks
          total_spend: totalSpend,
          total_leads: totalLeads,
          link_ctr: linkCtr,
          link_cpc: linkCpc,
          end_date: campaign.stop_time || null,
        });

      } catch (error) {
        console.error(`Error fetching insights for campaign ${campaign.id}:`, error);
        // Add campaign with zero metrics if insights fail
        campaignResults.push({
          id: campaign.id,
          name: campaign.name,
          status: campaign.status.toLowerCase(),
          objective: campaign.objective,
          total_impressions: 0,
          total_clicks: 0,
          total_spend: 0,
          total_leads: 0,
        });
      }
    }

    console.log(`Successfully fetched live data for ${campaignResults.length} campaigns`);

    return new Response(JSON.stringify({
      success: true,
      campaigns: campaignResults,
      date_range: date_range,
      total_campaigns: campaignResults.length,
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });

  } catch (error: any) {
    console.error('Meta campaigns live function error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: 'Internal server error',
      message: error.message,
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  }
});
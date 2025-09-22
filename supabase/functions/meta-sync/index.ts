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
}

serve(async (req) => {
  console.log('Meta sync function called:', req.method);
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const authHeader = req.headers.get('Authorization');
    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: { headers: authHeader ? { Authorization: authHeader } : {} },
    });

    // Get the authenticated user
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData?.user) {
      console.error('Authentication error:', userError);
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Unauthorized - invalid authentication' 
      }), {
        status: 401,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    const userId = userData.user.id;
    console.log('Authenticated user:', userId);

    // Parse request body
    const { access_token, ad_account_id, org_id } = await req.json();
    console.log('Request params:', { 
      hasToken: !!access_token, 
      adAccountId: ad_account_id, 
      orgId: org_id 
    });

    if (!access_token) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Access token is required' 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    if (!org_id) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Organization ID is required' 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    // Validate Meta access token format
    if (!access_token.startsWith('EAA') && !access_token.startsWith('EAAG')) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Invalid Meta access token format. Must start with EAA or EAAG.' 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    console.log('Starting Meta API calls...');

    // Step 1: Get ad accounts if no specific account provided
    let targetAdAccountId = ad_account_id;
    
    if (!targetAdAccountId) {
      console.log('Fetching ad accounts...');
      const adAccountsUrl = `https://graph.facebook.com/v19.0/me/adaccounts?access_token=${access_token}&fields=id,name`;
      const adAccountsResponse = await fetch(adAccountsUrl);
      const adAccountsData = await adAccountsResponse.json();

      if (adAccountsData.error) {
        console.error('Ad accounts error:', adAccountsData.error);
        return new Response(JSON.stringify({ 
          success: false, 
          error: `Meta API Error: ${adAccountsData.error.message}`,
          details: adAccountsData.error
        }), {
          status: 400,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        });
      }

      if (!adAccountsData.data || adAccountsData.data.length === 0) {
        return new Response(JSON.stringify({ 
          success: false, 
          error: 'No ad accounts found for this Meta token' 
        }), {
          status: 400,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        });
      }

      targetAdAccountId = adAccountsData.data[0].id;
      console.log('Using ad account:', targetAdAccountId);
    }

    // Step 2: Get campaigns from the ad account
    console.log('Fetching campaigns...');
    const campaignsUrl = `https://graph.facebook.com/v19.0/${targetAdAccountId}/campaigns?access_token=${access_token}&fields=id,name,status,objective`;
    const campaignsResponse = await fetch(campaignsUrl);
    const campaignsData = await campaignsResponse.json();

    if (campaignsData.error) {
      console.error('Campaigns error:', campaignsData.error);
      return new Response(JSON.stringify({ 
        success: false, 
        error: `Meta API Error: ${campaignsData.error.message}`,
        details: campaignsData.error
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    const campaigns: MetaCampaignData[] = campaignsData.data || [];
    console.log(`Found ${campaigns.length} campaigns`);

    if (campaigns.length === 0) {
      return new Response(JSON.stringify({ 
        success: true, 
        message: 'No campaigns found in this ad account',
        synced_count: 0
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    // Step 3: Get insights for each campaign
    const insights: MetaCampaignInsight[] = [];
    
    for (const campaign of campaigns) {
      try {
        console.log(`Fetching insights for campaign: ${campaign.name}`);
        const insightsUrl = `https://graph.facebook.com/v19.0/${campaign.id}/insights?access_token=${access_token}&fields=campaign_id,campaign_name,impressions,clicks,spend,actions&date_preset=last_7_days`;
        const insightsResponse = await fetch(insightsUrl);
        const insightsData = await insightsResponse.json();

        if (insightsData.data && insightsData.data.length > 0) {
          insights.push(...insightsData.data);
        } else {
          // If no insights, create a placeholder with zero metrics
          insights.push({
            campaign_id: campaign.id,
            campaign_name: campaign.name,
            impressions: '0',
            clicks: '0',
            spend: '0',
            date_start: new Date().toISOString().split('T')[0],
            date_stop: new Date().toISOString().split('T')[0],
          });
        }
      } catch (error) {
        console.error(`Error fetching insights for campaign ${campaign.id}:`, error);
      }
    }

    console.log(`Collected ${insights.length} insight records`);

    // Step 4: Save campaigns and metrics to database
    let syncedCount = 0;
    
    for (const insight of insights) {
      try {
        // Find or create campaign
        const { data: existingCampaign } = await supabase
          .from('campaigns')
          .select('id')
          .eq('name', insight.campaign_name)
          .eq('org_id', org_id)
          .eq('created_by', userId)
          .maybeSingle();

        let campaignId: string;

        if (!existingCampaign) {
          // Create new campaign
          const { data: newCampaign, error: campaignError } = await supabase
            .from('campaigns')
            .insert({
              name: insight.campaign_name,
              org_id: org_id,
              status: 'active',
              objective: 'OUTCOME_TRAFFIC',
              budget: 0,
              created_by: userId,
              location_targeting: {},
              audience_targeting: {},
            })
            .select('id')
            .single();

          if (campaignError) {
            console.error('Campaign creation error:', campaignError);
            continue;
          }

          campaignId = newCampaign.id;
          console.log(`Created campaign: ${insight.campaign_name}`);
        } else {
          campaignId = existingCampaign.id;
          console.log(`Found existing campaign: ${insight.campaign_name}`);
        }

        // Get leads count from actions
        const leads = insight.actions?.find(action => action.action_type === 'lead')?.value || '0';

        // Insert or update metrics
        const { data: existingMetric } = await supabase
          .from('metrics')
          .select('id')
          .eq('campaign_id', campaignId)
          .eq('date', insight.date_start)
          .maybeSingle();

        const metricsData = {
          campaign_id: campaignId,
          date: insight.date_start,
          impressions: parseInt(insight.impressions) || 0,
          clicks: parseInt(insight.clicks) || 0,
          spend: parseFloat(insight.spend) || 0,
          leads: parseInt(leads) || 0,
        };

        if (existingMetric) {
          await supabase
            .from('metrics')
            .update(metricsData)
            .eq('id', existingMetric.id);
        } else {
          await supabase
            .from('metrics')
            .insert(metricsData);
        }

        syncedCount++;
      } catch (error) {
        console.error('Error saving campaign/metrics:', error);
      }
    }

    console.log(`Successfully synced ${syncedCount} campaigns`);

    return new Response(JSON.stringify({
      success: true,
      message: 'Meta campaigns synced successfully',
      synced_count: syncedCount,
      total_campaigns: campaigns.length,
      total_insights: insights.length,
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });

  } catch (error: any) {
    console.error('Meta sync function error:', error);
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
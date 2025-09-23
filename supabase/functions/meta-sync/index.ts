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

    // Extract user id from JWT without extra auth call (platform already verifies JWT)
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
    const { access_token, ad_account_id, org_id, save_connection = true } = await req.json();
    
    console.log('Request params:', { 
      hasToken: !!access_token, 
      adAccountId: ad_account_id, 
      orgId: org_id,
      saveConnection: save_connection
    });

    // Check if we have stored credentials if no access token provided
    let actualAccessToken = access_token;
    let actualAdAccountId = ad_account_id;
    let accountName = '';
    
    if (!access_token && org_id) {
      console.log('No access token provided, checking for stored credentials...');
      
      // First check for user-specific integration
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

      if (integration) {
        actualAccessToken = integration.access_token;
        actualAdAccountId = integration.ad_account_id;
        accountName = integration.account_name || '';
        console.log('Using stored credentials for account:', accountName);
      } else {
        return new Response(JSON.stringify({ 
          success: false, 
          error: 'No access token provided and no stored credentials found' 
        }), {
          status: 400,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        });
      }
    }

    if (!actualAccessToken) {
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
    if (!actualAccessToken.startsWith('EAA') && !actualAccessToken.startsWith('EAAG')) {
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
    let targetAdAccountId = actualAdAccountId;
    
    if (!targetAdAccountId) {
      console.log('Fetching ad accounts...');
      const adAccountsUrl = `https://graph.facebook.com/v19.0/me/adaccounts?access_token=${actualAccessToken}&fields=id,name`;
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
      accountName = adAccountsData.data[0].name;
      console.log('Using ad account:', targetAdAccountId, accountName);
    }

    // Save or update integration credentials if this is a new connection
    if (access_token && save_connection) {
      try {
        console.log('Saving integration credentials...');
        
        // Check if integration already exists
        const { data: existingIntegration } = await supabase
          .from('integrations')
          .select('id')
          .eq('org_id', org_id)
          .eq('integration_type', 'meta')
          .eq('user_id', userId)
          .maybeSingle();

        if (existingIntegration) {
          // Update existing integration
          const { error: updateError } = await supabase
            .from('integrations')
            .update({
              access_token: actualAccessToken,
              ad_account_id: targetAdAccountId,
              account_name: accountName,
              status: 'active',
              last_sync_at: new Date().toISOString(),
            })
            .eq('id', existingIntegration.id);

          if (updateError) {
            console.error('Error updating integration:', updateError);
          } else {
            console.log('Integration credentials updated successfully');
          }
        } else {
          // Insert new integration
          const { error: insertError } = await supabase
            .from('integrations')
            .insert({
              org_id: org_id,
              integration_type: 'meta',
              access_token: actualAccessToken,
              ad_account_id: targetAdAccountId,
              account_name: accountName,
              status: 'active',
              last_sync_at: new Date().toISOString(),
              user_id: userId,
            });

          if (insertError) {
            console.error('Error inserting integration:', insertError);
          } else {
            console.log('Integration credentials inserted successfully');
          }
        }
      } catch (error) {
        console.error('Error saving integration credentials:', error);
        // Don't fail the sync, just log the error
      }
    }

    // Step 2: Get campaigns from the ad account
    console.log('Fetching campaigns...');
    const campaignsUrl = `https://graph.facebook.com/v19.0/${targetAdAccountId}/campaigns?access_token=${actualAccessToken}&fields=id,name,status,objective,start_time,stop_time`;
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
        const insightsUrl = `https://graph.facebook.com/v19.0/${campaign.id}/insights?access_token=${actualAccessToken}&fields=campaign_id,campaign_name,impressions,clicks,spend,actions&date_preset=last_30d`;
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
    const clearedCampaigns = new Set<string>();
    
    for (const insight of insights) {
      try {
        // Find the corresponding Meta campaign data for status and objective
        const metaCampaign = campaigns.find(c => c.id === insight.campaign_id);
        
        // Find or create campaign
        const { data: existingCampaign } = await supabase
          .from('campaigns')
          .select('id')
          .eq('name', insight.campaign_name)
          .eq('org_id', org_id)
          .maybeSingle();

        let campaignId: string;

        // Map Meta status to our status
        const mapStatus = (metaStatus: string) => {
          switch (metaStatus) {
            case 'ACTIVE': return 'active';
            case 'PAUSED': return 'paused';
            case 'DELETED': return 'deleted';
            case 'ARCHIVED': return 'archived';
            default: return 'draft';
          }
        };

        const campaignStatus = metaCampaign ? mapStatus(metaCampaign.status) : 'active';
        const campaignObjective = metaCampaign?.objective || 'OUTCOME_TRAFFIC';

        if (!existingCampaign) {
          // Create new campaign
          const { data: newCampaign, error: campaignError } = await supabase
            .from('campaigns')
            .insert({
              name: insight.campaign_name,
              org_id: org_id,
              status: campaignStatus,
              objective: campaignObjective,
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
          console.log(`Created campaign: ${insight.campaign_name} with status: ${campaignStatus}`);
        } else {
          // Update existing campaign status and objective
          await supabase
            .from('campaigns')
            .update({
              status: campaignStatus,
              objective: campaignObjective,
            })
            .eq('id', existingCampaign.id);

          campaignId = existingCampaign.id;
          console.log(`Updated existing campaign: ${insight.campaign_name} with status: ${campaignStatus}`);
        }

        // Get leads count from actions
        const leads = insight.actions?.find(action => action.action_type === 'lead')?.value || '0';

        // Clear previous metrics for this campaign once per run
        if (!clearedCampaigns.has(campaignId)) {
          const { error: deleteError } = await supabase
            .from('metrics')
            .delete()
            .eq('campaign_id', campaignId);
          if (deleteError) {
            console.error('Error clearing old metrics:', deleteError);
          }
          clearedCampaigns.add(campaignId);
        }

        // Insert fresh aggregated metrics (last 30 days)
        const metricsData = {
          campaign_id: campaignId,
          impressions: parseInt(insight.impressions) || 0,
          clicks: parseInt(insight.clicks) || 0,
          spend: parseFloat(insight.spend) || 0,
          leads: parseInt(leads) || 0,
        };

        const { error: insertError } = await supabase
          .from('metrics')
          .insert(metricsData);
        if (insertError) {
          console.error('Error inserting metrics:', insertError);
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
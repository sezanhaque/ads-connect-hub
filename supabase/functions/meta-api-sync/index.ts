import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface MetaInsights {
  campaign_id: string;
  campaign_name: string;
  date_start: string;
  date_stop: string;
  spend: string;
  impressions: string;
  clicks: string;
  actions?: Array<{ action_type: string; value: string }>;
  objective?: string;
}

interface MetaCampaign {
  id: string;
  name: string;
  objective: string;
  status: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const metaAccessToken = Deno.env.get('META_ACCESS_TOKEN')!;

    const authHeader = req.headers.get('Authorization');
    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: { headers: authHeader ? { Authorization: authHeader } : {} },
    });

    const { organization_id, access_token, date_range = 'last_7_days', ad_account_id } = await req.json();

    // Identify caller so we can populate created_by
    const { data: userData, error: userErr } = await supabase.auth.getUser();
    if (userErr || !userData?.user) {
      return new Response(JSON.stringify({ success: false, message: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }
    const createdBy = userData.user.id;

    // Use provided access_token or fall back to stored one
    const tokenToUse = access_token || metaAccessToken;
    
    if (!tokenToUse) {
      return new Response(JSON.stringify({ success: false, message: 'Meta access token is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    console.log('Starting Meta API sync for organization:', organization_id, 'range:', date_range);

    let campaigns: MetaCampaign[] = [];
    let insights: MetaInsights[] = [];

    // Fetch campaigns from Meta API or use mock data
    try {
      if (tokenToUse === 'demo' || !tokenToUse.startsWith('EAA')) {
        // Use mock data for demo purposes
        console.log('Using mock Meta API data for demonstration');
        
        const mockInsights: MetaInsights[] = [
          {
            campaign_id: 'meta_123456',
            campaign_name: 'Summer Sale Campaign',
            date_start: new Date().toISOString().split('T')[0],
            date_stop: new Date().toISOString().split('T')[0],
            spend: '150.75',
            impressions: '12500',
            clicks: '340',
            objective: 'OUTCOME_TRAFFIC',
            actions: [{ action_type: 'lead', value: '25' }],
          },
          {
            campaign_id: 'meta_789012',
            campaign_name: 'Brand Awareness Q1',
            date_start: new Date().toISOString().split('T')[0],
            date_stop: new Date().toISOString().split('T')[0],
            spend: '275.50',
            impressions: '18750',
            clicks: '425',
            objective: 'OUTCOME_AWARENESS',
            actions: [{ action_type: 'lead', value: '18' }],
          },
          {
            campaign_id: 'meta_345678',
            campaign_name: 'Product Launch Campaign',
            date_start: new Date().toISOString().split('T')[0],
            date_stop: new Date().toISOString().split('T')[0],
            spend: '95.25',
            impressions: '8900',
            clicks: '210',
            objective: 'OUTCOME_LEADS',
            actions: [{ action_type: 'lead', value: '42' }],
          },
        ];
        
        insights = mockInsights;
      } else {
        // Real Meta API calls
        let campaignUrl = `https://graph.facebook.com/v19.0/me/adaccounts`;
        
        if (ad_account_id) {
          campaignUrl = `https://graph.facebook.com/v19.0/${ad_account_id}/campaigns`;
        } else {
          // First get ad accounts, then campaigns
          const adAccountsResponse = await fetch(`${campaignUrl}?access_token=${tokenToUse}&fields=id,name`);
          const adAccountsData = await adAccountsResponse.json();
          
          if (adAccountsData.error) {
            console.error('Meta API Error (Ad Accounts):', adAccountsData.error);
            return new Response(JSON.stringify({ success: false, message: `Meta API Error: ${adAccountsData.error.message}` }), {
              status: 400,
              headers: { 'Content-Type': 'application/json', ...corsHeaders },
            });
          }

          if (adAccountsData.data && adAccountsData.data.length > 0) {
            // Use the first ad account
            const adAccountId = adAccountsData.data[0].id;
            campaignUrl = `https://graph.facebook.com/v19.0/${adAccountId}/campaigns`;
          } else {
            return new Response(JSON.stringify({ success: false, message: 'No ad accounts found' }), {
              status: 400,
              headers: { 'Content-Type': 'application/json', ...corsHeaders },
            });
          }
        }

        const campaignsResponse = await fetch(`${campaignUrl}?access_token=${tokenToUse}&fields=id,name,objective,status`);
        const campaignsData = await campaignsResponse.json();

        if (campaignsData.error) {
          console.error('Meta API Error (Campaigns):', campaignsData.error);
          return new Response(JSON.stringify({ success: false, message: `Meta API Error: ${campaignsData.error.message}` }), {
            status: 400,
            headers: { 'Content-Type': 'application/json', ...corsHeaders },
          });
        }

        campaigns = campaignsData.data || [];

        // Fetch insights for each campaign
        for (const campaign of campaigns) {
          try {
            const insightsUrl = `https://graph.facebook.com/v19.0/${campaign.id}/insights`;
            const insightsResponse = await fetch(
              `${insightsUrl}?access_token=${tokenToUse}&fields=campaign_name,campaign_id,objective,impressions,clicks,spend,actions&date_preset=${date_range}`
            );
            const insightsData = await insightsResponse.json();

            if (insightsData.data && insightsData.data.length > 0) {
              insights.push(...insightsData.data);
            }
          } catch (insightError) {
            console.error(`Error fetching insights for campaign ${campaign.id}:`, insightError);
          }
        }
      }
    } catch (apiError) {
      console.error('Meta API Error:', apiError);
      return new Response(JSON.stringify({ success: false, message: 'Failed to connect to Meta API' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    const syncResults: Array<Record<string, unknown>> = [];

    for (const insight of insights) {
      // Find or create campaign by name + org + creator
      let campQuery = supabase
        .from('campaigns')
        .select('id')
        .eq('name', insight.campaign_name)
        .eq('created_by', createdBy);

      if (organization_id) campQuery = campQuery.eq('organization_id', organization_id);
      else campQuery = campQuery.is('organization_id', null);

      const { data: foundCampaign } = await campQuery.maybeSingle();

      let campaignId: string;
      if (!foundCampaign) {
        const { data: newCamp, error: campErr } = await supabase
          .from('campaigns')
          .insert({
            name: insight.campaign_name,
            organization_id: organization_id ?? null,
            org_id: organization_id ?? null, // Also set org_id for consistency
            status: 'active',
            objective: insight.objective || 'OUTCOME_TRAFFIC',
            budget: 0,
            created_by: createdBy,
            location_targeting: {},
            audience_targeting: {},
          })
          .select('id')
          .single();
        if (campErr) {
          console.error('Create campaign error:', campErr);
          syncResults.push({ campaign_name: insight.campaign_name, status: 'error', error: campErr.message });
          continue;
        }
        campaignId = newCamp.id;
      } else {
        campaignId = foundCampaign.id;
      }

      const leads = insight.actions?.find((a) => a.action_type === 'lead')?.value ?? '0';

      // Insert or update metrics by (campaign_id, date)
      const { data: existingMetric } = await supabase
        .from('metrics')
        .select('id')
        .eq('campaign_id', campaignId)
        .eq('date', insight.date_start)
        .maybeSingle();

      const metricsData = {
        campaign_id: campaignId,
        date: insight.date_start,
        spend: parseFloat(insight.spend) || 0,
        impressions: parseInt(insight.impressions) || 0,
        clicks: parseInt(insight.clicks) || 0,
        leads: parseInt(leads) || 0,
      };

      if (existingMetric) {
        const { data, error } = await supabase
          .from('metrics')
          .update(metricsData)
          .eq('id', existingMetric.id)
          .select()
          .single();
        if (error) {
          console.error('Update metric error:', error);
          syncResults.push({ campaign_id: campaignId, status: 'error', error: error.message });
        } else {
          syncResults.push({ campaign_id: campaignId, status: 'updated', data });
        }
      } else {
        const { data, error } = await supabase
          .from('metrics')
          .insert(metricsData)
          .select()
          .single();
        if (error) {
          console.error('Create metric error:', error);
          syncResults.push({ campaign_id: campaignId, status: 'error', error: error.message });
        } else {
          syncResults.push({ campaign_id: campaignId, status: 'created', data });
        }
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Meta API sync completed',
        results: syncResults,
        synced_count: syncResults.filter((r) => r.status !== 'error').length,
        error_count: syncResults.filter((r) => r.status === 'error').length,
        total_insights: insights.length,
      }),
      { status: 200, headers: { 'Content-Type': 'application/json', ...corsHeaders } },
    );
  } catch (error: any) {
    console.error('Error in meta-api-sync function:', error);
    return new Response(
      JSON.stringify({ success: false, message: 'Failed to sync Meta API data', error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } },
    );
  }
});

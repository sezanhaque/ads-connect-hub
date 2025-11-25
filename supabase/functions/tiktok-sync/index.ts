import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface TikTokCampaignData {
  campaign_id: string;
  campaign_name: string;
  status: string;
  objective_type: string;
  budget?: number;
  budget_mode?: string;
}

interface TikTokInsight {
  campaign_id: string;
  stat_time_day: string;
  spend: string;
  impressions: string;
  clicks: string;
  conversion?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get user from auth header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      throw new Error('Invalid user token');
    }

    const { access_token, advertiser_id, org_id, save_connection } = await req.json();

    console.log('TikTok sync started for org:', org_id);

    // Validate inputs - either use provided token or fetch from database
    let finalAccessToken = access_token;
    let finalAdvertiserId = advertiser_id;

    if (!finalAccessToken) {
      // Fetch stored credentials from integrations table
      const { data: integrations, error: intError } = await supabase
        .from('integrations')
        .select('access_token, ad_account_id')
        .eq('org_id', org_id)
        .eq('integration_type', 'tiktok')
        .eq('status', 'active')
        .or(`user_id.eq.${user.id},user_id.is.null`)
        .order('user_id', { ascending: false }) // Prioritize user-specific
        .limit(1)
        .maybeSingle();

      if (intError || !integrations) {
        throw new Error('No TikTok integration found. Please connect your TikTok account first.');
      }

      finalAccessToken = integrations.access_token;
      finalAdvertiserId = integrations.ad_account_id?.[0];
    }

    if (!finalAccessToken) {
      throw new Error('TikTok access token is required');
    }

    // If no advertiser_id provided, fetch first advertiser
    if (!finalAdvertiserId) {
      const advertiserResponse = await fetch(
        'https://business-api.tiktok.com/open_api/v1.3/oauth2/advertiser/get/',
        {
          method: 'GET',
          headers: {
            'Access-Token': finalAccessToken,
            'Content-Type': 'application/json',
          },
        }
      );

      const advertiserData = await advertiserResponse.json();
      
      if (advertiserData.code !== 0 || !advertiserData.data?.list?.length) {
        throw new Error('Failed to fetch advertisers or no advertisers found');
      }

      finalAdvertiserId = advertiserData.data.list[0].advertiser_id;
      console.log('Using first advertiser:', finalAdvertiserId);
    }

    // Save or update integration if requested
    if (access_token && save_connection !== false) {
      const { error: upsertError } = await supabase
        .from('integrations')
        .upsert({
          org_id,
          user_id: user.id,
          integration_type: 'tiktok',
          access_token: finalAccessToken,
          ad_account_id: [finalAdvertiserId],
          status: 'active',
          last_sync_at: new Date().toISOString(),
        }, {
          onConflict: 'org_id,integration_type,user_id',
        });

      if (upsertError) {
        console.error('Failed to save integration:', upsertError);
      }
    }

    // Fetch campaigns from TikTok
    const campaignsResponse = await fetch(
      `https://business-api.tiktok.com/open_api/v1.3/campaign/get/?advertiser_id=${finalAdvertiserId}`,
      {
        method: 'GET',
        headers: {
          'Access-Token': finalAccessToken,
          'Content-Type': 'application/json',
        },
      }
    );

    const campaignsData = await campaignsResponse.json();

    if (campaignsData.code !== 0) {
      throw new Error(`TikTok API error: ${campaignsData.message}`);
    }

    const campaigns = campaignsData.data?.list || [];
    console.log(`Found ${campaigns.length} campaigns`);

    let syncedCount = 0;

    for (const campaign of campaigns) {
      const campaignData: TikTokCampaignData = campaign;
      
      // Map TikTok status to internal status
      const statusMap: { [key: string]: string } = {
        'CAMPAIGN_STATUS_ENABLE': 'active',
        'CAMPAIGN_STATUS_DISABLE': 'paused',
        'CAMPAIGN_STATUS_DELETE': 'deleted',
      };
      
      const internalStatus = statusMap[campaignData.status] || 'paused';

      // Upsert campaign
      const { data: existingCampaign } = await supabase
        .from('campaigns')
        .select('id')
        .eq('name', campaignData.campaign_name)
        .eq('org_id', org_id)
        .eq('platform', 'tiktok')
        .maybeSingle();

      if (existingCampaign) {
        await supabase
          .from('campaigns')
          .update({
            status: internalStatus,
            objective: campaignData.objective_type || 'TRAFFIC',
            updated_at: new Date().toISOString(),
          })
          .eq('id', existingCampaign.id);
      } else {
        const { error: insertError } = await supabase
          .from('campaigns')
          .insert({
            name: campaignData.campaign_name,
            org_id,
            created_by: user.id,
            status: internalStatus,
            objective: campaignData.objective_type || 'TRAFFIC',
            budget: campaignData.budget || 0,
            platform: 'tiktok',
            audience_targeting: {},
            location_targeting: {},
          });

        if (insertError) {
          console.error('Campaign insert error:', insertError);
          continue;
        }
      }

      // Fetch campaign insights (last 30 days)
      const endDate = new Date().toISOString().split('T')[0];
      const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

      const insightsResponse = await fetch(
        'https://business-api.tiktok.com/open_api/v1.3/reports/integrated/get/',
        {
          method: 'POST',
          headers: {
            'Access-Token': finalAccessToken,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            advertiser_id: finalAdvertiserId,
            service_type: 'AUCTION',
            report_type: 'BASIC',
            data_level: 'AUCTION_CAMPAIGN',
            dimensions: ['campaign_id', 'stat_time_day'],
            metrics: ['spend', 'impressions', 'clicks', 'conversion'],
            start_date: startDate,
            end_date: endDate,
            filters: [{
              field: 'campaign_id',
              operator: 'EQUAL',
              values: [campaignData.campaign_id],
            }],
          }),
        }
      );

      const insightsData = await insightsResponse.json();

      if (insightsData.code === 0 && insightsData.data?.list) {
        // Get campaign ID for metrics
        const { data: campaignRecord } = await supabase
          .from('campaigns')
          .select('id')
          .eq('name', campaignData.campaign_name)
          .eq('org_id', org_id)
          .eq('platform', 'tiktok')
          .single();

        if (campaignRecord) {
          // Delete existing metrics
          await supabase
            .from('metrics')
            .delete()
            .eq('campaign_id', campaignRecord.id);

          // Insert new metrics
          for (const insight of insightsData.data.list) {
            const metricData: TikTokInsight = insight.dimensions;
            const metrics = insight.metrics;

            await supabase
              .from('metrics')
              .insert({
                campaign_id: campaignRecord.id,
                date: metricData.stat_time_day,
                impressions: parseInt(metrics.impressions || '0'),
                clicks: parseInt(metrics.clicks || '0'),
                spend: parseFloat(metrics.spend || '0') / 100, // TikTok returns spend in cents
                leads: parseInt(metrics.conversion || '0'),
              });
          }
        }
      }

      syncedCount++;
    }

    // Update last sync timestamp
    await supabase
      .from('integrations')
      .update({ last_sync_at: new Date().toISOString() })
      .eq('org_id', org_id)
      .eq('integration_type', 'tiktok')
      .eq('status', 'active');

    return new Response(
      JSON.stringify({
        success: true,
        synced_count: syncedCount,
        total_campaigns: campaigns.length,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error: any) {
    console.error('TikTok sync error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SetupRequest {
  target_user_id: string;
  advertiser_ids: string[];
  admin_org_id: string;
  append?: boolean;
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

    const body: SetupRequest = await req.json();
    const { target_user_id, advertiser_ids, admin_org_id, append = false } = body;

    if (!target_user_id || !advertiser_ids || advertiser_ids.length === 0 || !admin_org_id) {
      throw new Error('Missing required fields: target_user_id, advertiser_ids, admin_org_id');
    }

    // Verify requester is member of admin org
    const { data: adminMember } = await supabase
      .from('members')
      .select('role')
      .eq('user_id', user.id)
      .eq('org_id', admin_org_id)
      .single();

    if (!adminMember) {
      throw new Error('Unauthorized: You must be a member of the admin organization');
    }

    // Get TikTok access token from admin org
    const { data: adminIntegration, error: adminIntError } = await supabase
      .from('integrations')
      .select('access_token')
      .eq('org_id', admin_org_id)
      .eq('integration_type', 'tiktok')
      .eq('status', 'active')
      .single();

    if (adminIntError || !adminIntegration) {
      throw new Error('No active TikTok integration found for admin organization');
    }

    const accessToken = adminIntegration.access_token;

    // Get or create target user's organization
    let targetOrgId: string;
    const { data: targetMembership } = await supabase
      .from('members')
      .select('org_id')
      .eq('user_id', target_user_id)
      .eq('role', 'owner')
      .single();

    if (targetMembership) {
      targetOrgId = targetMembership.org_id;
    } else {
      // Create organization for target user
      const { data: newOrg, error: orgError } = await supabase
        .from('organizations')
        .insert({ name: `${target_user_id}'s Organization` })
        .select()
        .single();

      if (orgError || !newOrg) {
        throw new Error('Failed to create organization for target user');
      }

      targetOrgId = newOrg.id;

      // Add user as owner
      await supabase
        .from('members')
        .insert({
          org_id: targetOrgId,
          user_id: target_user_id,
          role: 'owner',
        });
    }

    // Check existing integration
    const { data: existingIntegration } = await supabase
      .from('integrations')
      .select('*')
      .eq('org_id', targetOrgId)
      .eq('integration_type', 'tiktok')
      .eq('user_id', target_user_id)
      .maybeSingle();

    let finalAdvertiserIds = advertiser_ids;

    if (existingIntegration && append) {
      // Merge with existing advertiser IDs
      const existing = existingIntegration.ad_account_id || [];
      finalAdvertiserIds = [...new Set([...existing, ...advertiser_ids])];
    }

    // Upsert integration
    const { error: upsertError } = await supabase
      .from('integrations')
      .upsert({
        org_id: targetOrgId,
        user_id: target_user_id,
        integration_type: 'tiktok',
        access_token: accessToken,
        ad_account_id: finalAdvertiserIds,
        status: 'active',
        last_sync_at: new Date().toISOString(),
      }, {
        onConflict: 'org_id,integration_type,user_id',
      });

    if (upsertError) {
      throw new Error(`Failed to save integration: ${upsertError.message}`);
    }

    // Sync campaigns from TikTok
    let syncedCount = 0;
    let totalCampaigns = 0;

    for (const advertiserId of finalAdvertiserIds) {
      // Fetch campaigns
      const campaignsResponse = await fetch(
        `https://business-api.tiktok.com/open_api/v1.3/campaign/get/?advertiser_id=${advertiserId}`,
        {
          method: 'GET',
          headers: {
            'Access-Token': accessToken,
            'Content-Type': 'application/json',
          },
        }
      );

      const campaignsData = await campaignsResponse.json();

      if (campaignsData.code !== 0) {
        console.error(`Failed to fetch campaigns for advertiser ${advertiserId}`);
        continue;
      }

      const campaigns = campaignsData.data?.list || [];
      totalCampaigns += campaigns.length;

      for (const campaign of campaigns) {
        // Map status
        const statusMap: { [key: string]: string } = {
          'CAMPAIGN_STATUS_ENABLE': 'active',
          'CAMPAIGN_STATUS_DISABLE': 'paused',
          'CAMPAIGN_STATUS_DELETE': 'deleted',
        };

        const internalStatus = statusMap[campaign.status] || 'paused';

        // Check if campaign exists
        const { data: existingCampaign } = await supabase
          .from('campaigns')
          .select('id')
          .eq('name', campaign.campaign_name)
          .eq('org_id', targetOrgId)
          .eq('platform', 'tiktok')
          .maybeSingle();

        if (existingCampaign) {
          await supabase
            .from('campaigns')
            .update({
              status: internalStatus,
              objective: campaign.objective_type || 'TRAFFIC',
              updated_at: new Date().toISOString(),
            })
            .eq('id', existingCampaign.id);
        } else {
          const { error: insertError } = await supabase
            .from('campaigns')
            .insert({
              name: campaign.campaign_name,
              org_id: targetOrgId,
              created_by: target_user_id,
              status: internalStatus,
              objective: campaign.objective_type || 'TRAFFIC',
              budget: campaign.budget || 0,
              platform: 'tiktok',
              audience_targeting: {},
              location_targeting: {},
            });

          if (insertError) {
            console.error('Campaign insert error:', insertError);
            continue;
          }
        }

        syncedCount++;

        // Fetch insights
        const endDate = new Date().toISOString().split('T')[0];
        const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

        const insightsResponse = await fetch(
          'https://business-api.tiktok.com/open_api/v1.3/reports/integrated/get/',
          {
            method: 'POST',
            headers: {
              'Access-Token': accessToken,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              advertiser_id: advertiserId,
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
                values: [campaign.campaign_id],
              }],
            }),
          }
        );

        const insightsData = await insightsResponse.json();

        if (insightsData.code === 0 && insightsData.data?.list) {
          const { data: campaignRecord } = await supabase
            .from('campaigns')
            .select('id')
            .eq('name', campaign.campaign_name)
            .eq('org_id', targetOrgId)
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
              const metrics = insight.metrics;
              const dimensions = insight.dimensions;

              await supabase
                .from('metrics')
                .insert({
                  campaign_id: campaignRecord.id,
                  date: dimensions.stat_time_day,
                  impressions: parseInt(metrics.impressions || '0'),
                  clicks: parseInt(metrics.clicks || '0'),
                  spend: parseFloat(metrics.spend || '0') / 100,
                  leads: parseInt(metrics.conversion || '0'),
                });
            }
          }
        }
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        synced_count: syncedCount,
        total_campaigns: totalCampaigns,
        org_id: targetOrgId,
        advertiser_count: finalAdvertiserIds.length,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error: any) {
    console.error('TikTok member setup error:', error);
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
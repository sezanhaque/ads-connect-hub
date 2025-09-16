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
  spend: number;
  impressions: number;
  clicks: number;
  actions?: Array<{ action_type: string; value: number }>;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    const authHeader = req.headers.get('Authorization');
    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: { headers: authHeader ? { Authorization: authHeader } : {} },
    });

    const { organization_id, access_token, date_range } = await req.json();

    // Identify caller so we can populate created_by
    const { data: userData, error: userErr } = await supabase.auth.getUser();
    if (userErr || !userData?.user) {
      return new Response(JSON.stringify({ success: false, message: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }
    const createdBy = userData.user.id;

    console.log('Starting Meta API sync for organization:', organization_id, 'range:', date_range);

    // Simulated insights
    const mockInsights: MetaInsights[] = [
      {
        campaign_id: 'meta_123456',
        campaign_name: 'Summer Sale Campaign',
        date_start: '2024-01-15',
        date_stop: '2024-01-15',
        spend: 150.75,
        impressions: 12500,
        clicks: 340,
        actions: [{ action_type: 'lead', value: 25 }],
      },
      {
        campaign_id: 'meta_789012',
        campaign_name: 'Brand Awareness Q1',
        date_start: '2024-01-15',
        date_stop: '2024-01-15',
        spend: 275.5,
        impressions: 18750,
        clicks: 425,
        actions: [{ action_type: 'lead', value: 18 }],
      },
    ];

    const syncResults: Array<Record<string, unknown>> = [];

    for (const insight of mockInsights) {
      // Find or create campaign by name + org + creator (no external_id column in schema)
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
            status: 'active',
            objective: 'traffic',
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

      const leads = insight.actions?.find((a) => a.action_type === 'lead')?.value ?? 0;

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
        spend: insight.spend,
        impressions: insight.impressions,
        clicks: insight.clicks,
        leads,
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

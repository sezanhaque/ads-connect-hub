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

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get request data
    const { organization_id, access_token, date_range } = await req.json();

    console.log('Starting Meta API sync for organization:', organization_id);

    // In a real implementation, you would:
    // 1. Use the access_token to call Meta Marketing API
    // 2. Fetch campaign insights for the specified date range
    // 3. Handle API rate limits and pagination
    // 4. Process and transform the data

    // For now, we'll simulate the API response with mock data
    const mockInsights: MetaInsights[] = [
      {
        campaign_id: 'meta_123456',
        campaign_name: 'Summer Sale Campaign',
        date_start: '2024-01-15',
        date_stop: '2024-01-15',
        spend: 150.75,
        impressions: 12500,
        clicks: 340,
        actions: [
          { action_type: 'lead', value: 25 }
        ]
      },
      {
        campaign_id: 'meta_789012',
        campaign_name: 'Brand Awareness Q1',
        date_start: '2024-01-15',
        date_stop: '2024-01-15',
        spend: 275.50,
        impressions: 18750,
        clicks: 425,
        actions: [
          { action_type: 'lead', value: 18 }
        ]
      }
    ];

    // Process and store metrics in database
    const syncResults = [];

    for (const insight of mockInsights) {
      // Calculate derived metrics
      const ctr = insight.clicks / insight.impressions * 100;
      const cpc = insight.spend / insight.clicks;
      const leads = insight.actions?.find(a => a.action_type === 'lead')?.value || 0;
      const cpl = leads > 0 ? insight.spend / leads : 0;

      // Find or create campaign record
      let { data: campaign } = await supabase
        .from('campaigns')
        .select('id')
        .eq('external_id', insight.campaign_id)
        .eq('organization_id', organization_id)
        .single();

      if (!campaign) {
        // Create campaign if it doesn't exist
        const { data: newCampaign, error: campaignError } = await supabase
          .from('campaigns')
          .insert({
            name: insight.campaign_name,
            external_id: insight.campaign_id,
            organization_id,
            status: 'active',
            objective: 'traffic'
          })
          .select('id')
          .single();

        if (campaignError) {
          console.error('Error creating campaign:', campaignError);
          continue;
        }
        campaign = newCampaign;
      }

      // Insert or update metrics
      const { data: existingMetric } = await supabase
        .from('metrics')
        .select('id')
        .eq('campaign_id', campaign.id)
        .eq('date', insight.date_start)
        .single();

      const metricsData = {
        organization_id,
        campaign_id: campaign.id,
        date: insight.date_start,
        spend: insight.spend,
        impressions: insight.impressions,
        clicks: insight.clicks,
        leads,
        ctr: Number(ctr.toFixed(2)),
        cpc: Number(cpc.toFixed(2)),
        cpl: Number(cpl.toFixed(2))
      };

      if (existingMetric) {
        // Update existing metric
        const { data, error } = await supabase
          .from('metrics')
          .update(metricsData)
          .eq('id', existingMetric.id)
          .select()
          .single();

        if (error) {
          console.error('Error updating metric:', error);
          syncResults.push({ campaign_id: insight.campaign_id, status: 'error', error: error.message });
        } else {
          syncResults.push({ campaign_id: insight.campaign_id, status: 'updated', data });
        }
      } else {
        // Create new metric
        const { data, error } = await supabase
          .from('metrics')
          .insert(metricsData)
          .select()
          .single();

        if (error) {
          console.error('Error creating metric:', error);
          syncResults.push({ campaign_id: insight.campaign_id, status: 'error', error: error.message });
        } else {
          syncResults.push({ campaign_id: insight.campaign_id, status: 'created', data });
        }
      }
    }

    console.log('Meta API sync completed:', syncResults);

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Meta API sync completed',
        results: syncResults,
        synced_count: syncResults.filter(r => r.status !== 'error').length,
        error_count: syncResults.filter(r => r.status === 'error').length
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );

  } catch (error: any) {
    console.error('Error in meta-api-sync function:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
        message: 'Failed to sync Meta API data'
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  }
};

serve(handler);
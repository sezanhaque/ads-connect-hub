import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SetupRequest {
  target_user_id: string;
  ad_account_id: string;
  admin_org_id: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabaseClient = createClient(supabaseUrl, serviceKey);

    const body: SetupRequest = await req.json();
    const { target_user_id, ad_account_id, admin_org_id } = body || {};

    console.log('member-meta-setup called with:', body);

    if (!target_user_id || !ad_account_id || !admin_org_id) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    // Get the JWT token from the request headers for user verification
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.error('No authorization header found');
      return new Response(JSON.stringify({ error: 'Unauthorized: no auth header' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    // Extract user from JWT token using service role client
    const jwt = authHeader.replace('Bearer ', '');
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(jwt);
    
    if (userError || !userData?.user) {
      console.error('Auth error:', userError);
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }
    
    const requesterId = userData.user.id;
    console.log('Authenticated user:', requesterId);

    // Verify user is member of admin org using service role client
    const { data: membership, error: membershipError } = await supabaseClient
      .from('members')
      .select('role')
      .eq('org_id', admin_org_id)
      .eq('user_id', requesterId)
      .maybeSingle();

    if (membershipError) {
      console.error('Membership check error:', membershipError);
      return new Response(JSON.stringify({ error: 'Failed to verify membership' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    if (!membership) {
      console.error('User not member of admin org:', requesterId, admin_org_id);
      return new Response(JSON.stringify({ error: 'Forbidden: not a member of the admin organization' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }
    console.log('User has valid membership:', membership.role);

    // Get admin org Meta integration to copy access token
    console.log('Fetching admin Meta integration for org:', admin_org_id);
    const { data: adminIntegration, error: adminIntErr } = await supabaseClient
      .from('integrations')
      .select('access_token')
      .eq('org_id', admin_org_id)
      .eq('integration_type', 'meta')
      .eq('status', 'active')
      .maybeSingle();

    if (adminIntErr) {
      console.error('Admin integration fetch error:', adminIntErr);
      return new Response(JSON.stringify({ error: 'Failed to fetch admin Meta connection' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    if (!adminIntegration?.access_token) {
      console.error('No admin Meta integration found');
      return new Response(JSON.stringify({ error: 'Admin Meta connection not found' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    console.log('Found admin Meta integration');
    const token = adminIntegration.access_token as string;
    const adId = String(ad_account_id);

    // Find the target user's owner organization, or create one if missing
    console.log('Looking for target user owner org:', target_user_id);
    const { data: ownerMembership, error: ownerMemberErr } = await supabaseClient
      .from('members')
      .select('org_id')
      .eq('user_id', target_user_id)
      .eq('role', 'owner')
      .maybeSingle();

    if (ownerMemberErr) {
      console.error('Error fetching owner membership:', ownerMemberErr);
    }

    let targetOrgId: string | null = ownerMembership?.org_id ?? null;
    console.log('Target user existing owner org:', targetOrgId);

    if (!targetOrgId) {
      // Create a new organization and add the user as owner
      console.log('Creating new organization for target user...');
      const nameFallback = `User ${target_user_id.substring(0, 8)} Organization`;
      const { data: newOrg, error: orgErr } = await supabaseClient
        .from('organizations')
        .insert({ name: nameFallback })
        .select('id')
        .single();
      if (orgErr) {
        console.error('Failed creating organization for target user:', orgErr);
        return new Response(JSON.stringify({ error: 'Failed to create organization for user' }), {
          status: 500,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        });
      }
      targetOrgId = newOrg.id as string;
      console.log('Created new org:', targetOrgId);

      const { error: ownerInsertErr } = await supabaseClient
        .from('members')
        .insert({ user_id: target_user_id, org_id: targetOrgId, role: 'owner' });
      if (ownerInsertErr) {
        console.error('Failed adding owner membership for target user:', ownerInsertErr);
      } else {
        console.log('Added user as owner of new org');
      }
    }

    // Upsert integration for the target user's organization
    const { data: existingIntegration } = await supabaseClient
      .from('integrations')
      .select('id')
      .eq('org_id', targetOrgId)
      .eq('integration_type', 'meta')
      .eq('user_id', target_user_id)
      .maybeSingle();

    if (existingIntegration) {
      const { error: updateErr } = await supabaseClient
        .from('integrations')
        .update({
          access_token: token,
          ad_account_id: adId,
          account_name: `Ad Account ${adId}`,
          status: 'active',
          last_sync_at: null,
        })
        .eq('id', existingIntegration.id);
      if (updateErr) {
        console.error('Integration update error:', updateErr);
        return new Response(JSON.stringify({ error: 'Failed to update integration' }), {
          status: 500,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        });
      }
    } else {
      const { error: insertErr } = await supabaseClient
        .from('integrations')
        .insert({
          org_id: targetOrgId,
          integration_type: 'meta',
          access_token: token,
          ad_account_id: adId,
          account_name: `Ad Account ${adId}`,
          status: 'active',
          user_id: target_user_id,
        });
      if (insertErr) {
        console.error('Integration insert error:', insertErr);
        return new Response(JSON.stringify({ error: 'Failed to create integration' }), {
          status: 500,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        });
      }
    }

    // Immediate sync of campaigns and metrics into target user's org
    let synced = 0;
    let totalCampaigns = 0;
    try {
      const campaignsUrl = `https://graph.facebook.com/v19.0/${adId}/campaigns?access_token=${token}&fields=id,name,status,objective`;
      const campaignsResp = await fetch(campaignsUrl);
      const campaignsJson = await campaignsResp.json();
      if (campaignsJson?.error) {
        console.error('Meta campaigns fetch error:', campaignsJson.error);
      } else {
        const campaigns: Array<{ id: string; name: string; status: string; objective: string }> = campaignsJson?.data || [];
        totalCampaigns = campaigns.length;

        const mapStatus = (metaStatus: string) => {
          switch (metaStatus) {
            case 'ACTIVE': return 'active';
            case 'PAUSED': return 'paused';
            case 'DELETED': return 'deleted';
            case 'ARCHIVED': return 'archived';
            default: return 'draft';
          }
        };

        for (const c of campaigns) {
          // Upsert campaign by name within target org
          const { data: existingCampaign } = await supabaseClient
            .from('campaigns')
            .select('id')
            .eq('name', c.name)
            .eq('org_id', targetOrgId)
            .maybeSingle();

          let campaignId: string | undefined = existingCampaign?.id;
          const statusMapped = mapStatus(c.status);
          const objective = c.objective || 'OUTCOME_TRAFFIC';

          if (!campaignId) {
            const { data: inserted, error: insertCampErr } = await supabaseClient
              .from('campaigns')
              .insert({
                name: c.name,
                org_id: targetOrgId,
                status: statusMapped,
                objective,
                budget: 0,
                created_by: target_user_id,
                location_targeting: {},
                audience_targeting: {},
              })
              .select('id')
              .single();
            if (insertCampErr) {
              console.error('Insert campaign error:', insertCampErr);
              continue;
            }
            campaignId = inserted.id as string;
          } else {
            await supabaseClient.from('campaigns')
              .update({ status: statusMapped, objective })
              .eq('id', campaignId);
          }

          // Fetch insights last 30 days for this campaign
          const insightsUrl = `https://graph.facebook.com/v19.0/${c.id}/insights?access_token=${token}&fields=campaign_id,campaign_name,impressions,clicks,spend,actions&date_preset=last_30d`;
          const insightsResp = await fetch(insightsUrl);
          const insightsJson = await insightsResp.json();

          let impressions = 0, clicks = 0, spend = 0, leads = 0;
          const rec = (insightsJson?.data?.[0]) || null;
          if (rec) {
            impressions = parseInt(rec.impressions || '0') || 0;
            clicks = parseInt(rec.clicks || '0') || 0;
            spend = parseFloat(rec.spend || '0') || 0;
            const leadAction = Array.isArray(rec.actions) ? rec.actions.find((a: any) => a.action_type === 'lead') : null;
            leads = leadAction ? parseInt(leadAction.value || '0') || 0 : 0;
          }

          if (campaignId) {
            await supabaseClient.from('metrics').delete().eq('campaign_id', campaignId);
            const { error: metricsInsertErr } = await supabaseClient
              .from('metrics')
              .insert({
                campaign_id: campaignId,
                impressions,
                clicks,
                spend,
                leads,
              });
            if (metricsInsertErr) {
              console.error('Metrics insert error:', metricsInsertErr);
            }
          }
          synced += 1;
        }
      }
    } catch (syncErr) {
      console.error('Immediate sync for member setup failed:', syncErr);
    }

    console.log(`Setup complete: synced ${synced}/${totalCampaigns} campaigns to org ${targetOrgId}`);
    return new Response(JSON.stringify({ success: true, synced_count: synced, total_campaigns: totalCampaigns, org_id: targetOrgId }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  } catch (err) {
    console.error('member-meta-setup error:', err);
    return new Response(JSON.stringify({ error: 'Unexpected server error.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  }
});
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SetupRequest {
  target_user_id: string;
  ad_account_id: string;
  admin_org_id: string;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.error('member-meta-setup: missing Authorization header');
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    // Service role client, but keep caller Authorization for context/logging parity
    const supabase = createClient(supabaseUrl, serviceKey);


    // Extract user id from JWT
    const rawToken = authHeader.replace('Bearer ', '').trim();
    let requesterId = '';
    try {
      const base64Url = rawToken.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const payload = JSON.parse(atob(base64));
      requesterId = payload.sub as string;
    } catch (e) {
      console.error('member-meta-setup: failed to decode JWT', e);
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    const { target_user_id, ad_account_id, admin_org_id }: SetupRequest = await req.json();
    console.log('member-meta-setup called with:', { target_user_id, ad_account_id, admin_org_id });

    if (!target_user_id || !ad_account_id || !admin_org_id) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    // Verify requester is member of the admin org
    const { data: membership, error: membershipError } = await supabase
      .from('members')
      .select('role')
      .eq('org_id', admin_org_id)
      .eq('user_id', requesterId)
      .maybeSingle();

    if (membershipError) {
      console.error('member-meta-setup: membership check error', membershipError);
      return new Response(JSON.stringify({ error: 'Failed to verify membership' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    if (!membership) {
      console.error('member-meta-setup: requester not member of admin org', requesterId, admin_org_id);
      return new Response(JSON.stringify({ error: 'Forbidden' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }
    console.log('member-meta-setup: requester membership ok, role:', membership.role);

    // Fetch admin org meta access token
    const { data: adminIntegration, error: adminIntErr } = await supabase
      .from('integrations')
      .select('access_token')
      .eq('org_id', admin_org_id)
      .eq('integration_type', 'meta')
      .eq('status', 'active')
      .maybeSingle();

    if (adminIntErr) {
      console.error('member-meta-setup: admin integration fetch error', adminIntErr);
      return new Response(JSON.stringify({ error: 'Failed to fetch admin Meta connection' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }
    if (!adminIntegration?.access_token) {
      return new Response(JSON.stringify({ error: 'Admin Meta connection not found' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    const token = adminIntegration.access_token as string;
    const adId = String(ad_account_id);

    // Find or create target user's owner org
    const { data: ownerMembership } = await supabase
      .from('members')
      .select('org_id')
      .eq('user_id', target_user_id)
      .eq('role', 'owner')
      .maybeSingle();

    let targetOrgId: string | null = ownerMembership?.org_id ?? null;
    if (!targetOrgId) {
      const orgName = `User ${target_user_id.slice(0, 8)} Organization`;
      const { data: newOrg, error: orgErr } = await supabase
        .from('organizations')
        .insert({ name: orgName })
        .select('id')
        .single();
      if (orgErr) {
        console.error('member-meta-setup: create org error', orgErr);
        return new Response(JSON.stringify({ error: 'Failed to create organization for user' }), {
          status: 500,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        });
      }
      targetOrgId = newOrg.id as string;
      await supabase.from('members').insert({ user_id: target_user_id, org_id: targetOrgId, role: 'owner' });
    }

    // Upsert integration for target user/org
    const { data: existingIntegration } = await supabase
      .from('integrations')
      .select('id')
      .eq('org_id', targetOrgId)
      .eq('integration_type', 'meta')
      .eq('user_id', target_user_id)
      .maybeSingle();

    if (existingIntegration) {
      const { error: updateErr } = await supabase
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
        console.error('member-meta-setup: integration update error', updateErr);
        return new Response(JSON.stringify({ error: 'Failed to update integration' }), {
          status: 500,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        });
      }
    } else {
      const { error: insertErr } = await supabase
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
        console.error('member-meta-setup: integration insert error', insertErr);
        return new Response(JSON.stringify({ error: 'Failed to create integration' }), {
          status: 500,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        });
      }
    }

    // Sync campaigns + metrics into target org
    let synced = 0;
    let totalCampaigns = 0;
    try {
      const campaignsUrl = `https://graph.facebook.com/v19.0/${adId}/campaigns?access_token=${token}&fields=id,name,status,objective`;
      const campaignsResp = await fetch(campaignsUrl);
      const campaignsJson = await campaignsResp.json();

      if (campaignsJson?.error) {
        console.error('member-meta-setup: campaigns error', campaignsJson.error);
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
          const { data: existingCampaign } = await supabase
            .from('campaigns')
            .select('id')
            .eq('name', c.name)
            .eq('org_id', targetOrgId)
            .maybeSingle();

          let campaignId: string | undefined = existingCampaign?.id;
          const statusMapped = mapStatus(c.status);
          const objective = c.objective || 'OUTCOME_TRAFFIC';

          if (!campaignId) {
            const { data: inserted, error: insertCampErr } = await supabase
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
              console.error('member-meta-setup: insert campaign error', insertCampErr);
              continue;
            }
            campaignId = inserted.id as string;
          } else {
            await supabase.from('campaigns')
              .update({ status: statusMapped, objective })
              .eq('id', campaignId);
          }

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
            await supabase.from('metrics').delete().eq('campaign_id', campaignId);
            const { error: metricsInsertErr } = await supabase
              .from('metrics')
              .insert({
                campaign_id: campaignId,
                impressions,
                clicks,
                spend,
                leads,
              });
            if (metricsInsertErr) {
              console.error('member-meta-setup: metrics insert error', metricsInsertErr);
            }
          }
          synced += 1;
        }
      }
    } catch (e) {
      console.error('member-meta-setup: sync block error', e);
    }

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

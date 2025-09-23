import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface InviteDetailsRequest {
  action: 'details' | 'accept';
  token?: string;
  password?: string;
  first_name?: string;
  last_name?: string;
}
async function findUserIdByEmail(admin: any, email: string): Promise<string | null> {
  try {
    const perPage = 1000;
    let page = 1;
    while (true) {
      const { data, error } = await admin.auth.admin.listUsers({ page, perPage });
      if (error) {
        console.error('listUsers error:', error);
        return null;
      }
      const users = data?.users ?? [];
      const found = users.find((u: any) => (u.email || '').toLowerCase() === email.toLowerCase());
      if (found) return found.id;
      if (users.length < perPage) break; // no more pages
      page += 1;
      if (page > 20) break; // safety cap
    }
  } catch (e) {
    console.error('findUserIdByEmail error:', e);
  }
  return null;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const body: InviteDetailsRequest = await req.json();
    const { action } = body || {};

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const admin = createClient(supabaseUrl, serviceRoleKey);

    if (action === 'details') {
      const token = body.token?.trim();
      if (!token) {
        return new Response(
          JSON.stringify({ error: 'Missing invite token' }),
          { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
        );
      }

      // Fetch invite details using service role (bypasses RLS safely inside the function)
      const { data: invite, error: inviteError } = await admin
        .from('invites')
        .select('email, role, org_id, organizations(name)')
        .eq('token', token)
        .single();

      if (inviteError || !invite) {
        return new Response(
          JSON.stringify({ error: 'Invalid or expired invitation.' }),
          { status: 404, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
        );
      }

      let orgName = (invite as any)?.organizations?.name ?? null;
      if (!orgName && invite.org_id) {
        const { data: org } = await admin
          .from('organizations')
          .select('name')
          .eq('id', invite.org_id)
          .single();
        orgName = org?.name ?? null;
      }

      const payload = {
        email: invite.email,
        role: invite.role,
        org_id: invite.org_id,
        org_name: orgName,
      };

      return new Response(JSON.stringify(payload), {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    if (action === 'accept') {
      const token = body.token?.trim();
      const password = body.password?.trim();
      const first_name = body.first_name?.trim() ?? '';
      const last_name = body.last_name?.trim() ?? '';

      if (!token || !password) {
        return new Response(
          JSON.stringify({ error: 'Missing required fields.' }),
          { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
        );
      }

      // Validate invite
      const { data: invite, error: inviteError } = await admin
        .from('invites')
        .select('id, email, role, org_id, ad_account_id')
        .eq('token', token)
        .single();

      if (inviteError || !invite) {
        return new Response(
          JSON.stringify({ error: 'Invalid or expired invitation.' }),
          { status: 404, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
        );
      }

      // Create or link user account via Admin API (clean flow)
      let existingUser = false;
      let userId: string | undefined = undefined;

      // First, try to find an existing user by email to avoid 422 errors
      const foundId = await findUserIdByEmail(admin, invite.email);
      if (foundId) {
        existingUser = true;
        userId = foundId;
      } else {
        const { data: createRes, error: createErr } = await admin.auth.admin.createUser({
          email: invite.email,
          password,
          email_confirm: true,
          user_metadata: { first_name, last_name },
        });

        if (createErr) {
          console.error('createUser error:', createErr);
          return new Response(
            JSON.stringify({ error: 'Failed to create user.' }),
            { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
          );
        } else {
          userId = createRes?.user?.id;
        }
      }

      if (!userId) {
        return new Response(
          JSON.stringify({ error: 'User creation failed.' }),
          { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
        );
      }


      // Upsert profile to avoid duplicates
      const { error: profileUpsertErr } = await admin
        .from('profiles')
        .upsert({
          user_id: userId,
          first_name,
          last_name,
          email: invite.email,
          role: 'member',
        }, { onConflict: 'user_id' });
      if (profileUpsertErr) {
        console.error('Profile upsert error:', profileUpsertErr);
      }

      // Add user to the inviter's organization (join admin's organization)
      const { error: memberErr } = await admin
        .from('members')
        .insert({ 
          user_id: userId, 
          org_id: invite.org_id, // Join the admin's organization
          role: invite.role
        });
        
      if (memberErr) {
        const msg = (memberErr as any)?.message?.toLowerCase?.() || '';
        if (!msg.includes('duplicate')) {
          console.error('Member creation error:', memberErr);
          return new Response(
            JSON.stringify({ error: 'Failed to add user to organization.' }),
            { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
          );
        }
      }

      // Create Meta integration in the invited user's own organization (owner org) if ad_account_id provided
      if (invite.ad_account_id) {
        // Determine the invited user's owner organization (create if missing)
        const { data: ownerMembership } = await admin
          .from('members')
          .select('org_id')
          .eq('user_id', userId)
          .eq('role', 'owner')
          .maybeSingle();

        let targetOrgId: string | null = ownerMembership?.org_id ?? null;
        if (!targetOrgId) {
          const orgNameCandidate = `${first_name || ''} ${last_name || ''}`.trim() || (invite.email.split('@')[0] + ' Organization');
          const { data: newOrg, error: orgErr } = await admin
            .from('organizations')
            .insert({ name: orgNameCandidate })
            .select('id')
            .single();
          if (orgErr) {
            console.error('Failed to create owner organization for invited user:', orgErr);
            return new Response(
              JSON.stringify({ error: 'Failed to prepare invited user organization' }),
              { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
            );
          }
          targetOrgId = newOrg.id as string;
          await admin.from('members').insert({ user_id: userId, org_id: targetOrgId, role: 'owner' });
        }

        // Get the admin's Meta integration to copy the access token
        const { data: adminIntegration, error: adminIntegrationError } = await admin
          .from('integrations')
          .select('access_token')
          .eq('org_id', invite.org_id)
          .eq('integration_type', 'meta')
          .eq('status', 'active')
          .maybeSingle();

        if (!adminIntegrationError && adminIntegration?.access_token) {
          const token = adminIntegration.access_token as string;
          const adId = String(invite.ad_account_id);

          // Create or update user-specific integration within their owner org
          const { data: existingUserIntegration } = await admin
            .from('integrations')
            .select('id')
            .eq('org_id', targetOrgId)
            .eq('integration_type', 'meta')
            .eq('user_id', userId)
            .maybeSingle();

          if (existingUserIntegration) {
            const { error: userIntegrationUpdateError } = await admin
              .from('integrations')
              .update({
                access_token: token,
                ad_account_id: adId,
                account_name: `Ad Account ${adId}`,
                status: 'active',
                last_sync_at: null,
              })
              .eq('id', existingUserIntegration.id);
            if (userIntegrationUpdateError) {
              console.error('Error updating user Meta integration:', userIntegrationUpdateError);
            }
          } else {
            const { error: userIntegrationError } = await admin
              .from('integrations')
              .insert({
                org_id: targetOrgId,
                integration_type: 'meta',
                access_token: token,
                ad_account_id: adId,
                account_name: `Ad Account ${adId}`,
                status: 'active',
                user_id: userId,
              });
            if (userIntegrationError) {
              console.error('Error creating user Meta integration:', userIntegrationError);
            } else {
              console.log(`Created Meta integration for user with AD Account: ${adId} in org ${targetOrgId}`);
            }
          }

          // Immediately sync campaigns and metrics for this ad account INTO the invited user's org
          try {
            const campaignsUrl = `https://graph.facebook.com/v19.0/${adId}/campaigns?access_token=${token}&fields=id,name,status,objective`;
            const campaignsResp = await fetch(campaignsUrl);
            const campaignsJson = await campaignsResp.json();
            if (campaignsJson?.error) {
              console.error('Meta campaigns fetch error:', campaignsJson.error);
            } else {
              const campaigns: Array<{ id: string; name: string; status: string; objective: string }> = campaignsJson?.data || [];

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
                const { data: existingCampaign } = await admin
                  .from('campaigns')
                  .select('id')
                  .eq('name', c.name)
                  .eq('org_id', targetOrgId)
                  .maybeSingle();

                let campaignId: string | undefined = existingCampaign?.id;
                const statusMapped = mapStatus(c.status);
                const objective = c.objective || 'OUTCOME_TRAFFIC';

                if (!campaignId) {
                  const { data: inserted, error: insertCampErr } = await admin
                    .from('campaigns')
                    .insert({
                      name: c.name,
                      org_id: targetOrgId,
                      status: statusMapped,
                      objective,
                      budget: 0,
                      created_by: userId,
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
                  await admin.from('campaigns')
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
                  await admin.from('metrics').delete().eq('campaign_id', campaignId);
                  const { error: metricsInsertErr } = await admin
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
              }
            }
          } catch (syncErr) {
            console.error('Immediate sync for invited user failed:', syncErr);
          }
        } else {
          console.error('Could not find admin Meta integration:', adminIntegrationError);
        }
      }

      // Delete invite
      const { error: deleteErr } = await admin
        .from('invites')
        .delete()
        .eq('token', token);
      if (deleteErr) {
        console.error('Invite deletion error:', deleteErr);
      }

      return new Response(JSON.stringify({ success: true, existingUser }), {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    return new Response(
      JSON.stringify({ error: 'Invalid action' }),
      { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    );
  } catch (err) {
    console.error('invite-handler error:', err);
    return new Response(
      JSON.stringify({ error: 'Unexpected server error.' }),
      { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    );
  }
});

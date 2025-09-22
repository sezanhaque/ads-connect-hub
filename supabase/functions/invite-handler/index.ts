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
        .select('id, email, role, org_id')
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

      // Create a separate organization for the invited user (complete data isolation)
      const orgName = first_name && last_name 
        ? `${first_name} ${last_name} Organization`
        : `${invite.email.split('@')[0]} Organization`;

      const { data: newOrg, error: orgError } = await admin
        .from('organizations')
        .insert({
          name: orgName
        })
        .select()
        .single();

      if (orgError) {
        console.error('Error creating organization:', orgError);
        return new Response(
          JSON.stringify({ error: 'Failed to create organization' }),
          { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
        );
      }

      // Add user as owner of their own organization (not the admin's organization)
      const { error: memberErr } = await admin
        .from('members')
        .insert({ 
          user_id: userId, 
          org_id: newOrg.id, 
          role: 'owner' // Make them owner of their own org
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

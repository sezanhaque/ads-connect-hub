import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface IncomingBody {
  organization_id: string | null;
  sheet_url?: string;
}

interface SheetJobRow {
  title: string;
  description: string;
  status: 'active' | 'paused' | 'draft' | string;
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

    const { organization_id }: IncomingBody = await req.json();

    // Identify caller to populate created_by
    const { data: userData, error: userErr } = await supabase.auth.getUser();
    if (userErr || !userData?.user) {
      return new Response(JSON.stringify({ success: false, message: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }
    const createdBy = userData.user.id;

    // Simulated rows fetched from Google Sheets
    const rows: SheetJobRow[] = [
      {
        title: 'Senior React Developer',
        description: 'Looking for experienced React developer with TypeScript',
        status: 'active',
      },
      {
        title: 'Product Manager',
        description: 'Lead product strategy and roadmap development',
        status: 'active',
      },
    ];

    const syncResults: Array<Record<string, unknown>> = [];

    for (const row of rows) {
      // Try to find an existing job by title + created_by (+ organization scope)
      let query = supabase
        .from('jobs')
        .select('id')
        .eq('title', row.title)
        .eq('created_by', createdBy);

      if (organization_id) {
        query = query.eq('organization_id', organization_id);
      } else {
        query = query.is('organization_id', null);
      }

      const { data: existing, error: findErr } = await query.maybeSingle();
      if (findErr) {
        console.error('Find job error:', findErr);
      }

      if (existing?.id) {
        const { data, error } = await supabase
          .from('jobs')
          .update({
            description: row.description,
            status: row.status,
          })
          .eq('id', existing.id)
          .select()
          .single();

        if (error) {
          console.error('Update job error:', error);
          syncResults.push({ title: row.title, status: 'error', error: error.message });
        } else {
          syncResults.push({ title: row.title, status: 'updated', data });
        }
      } else {
        const { data, error } = await supabase
          .from('jobs')
          .insert({
            title: row.title,
            description: row.description,
            status: row.status,
            organization_id: organization_id ?? null,
            created_by: createdBy,
          })
          .select()
          .single();

        if (error) {
          console.error('Create job error:', error);
          syncResults.push({ title: row.title, status: 'error', error: error.message });
        } else {
          syncResults.push({ title: row.title, status: 'created', data });
        }
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Google Sheets sync completed',
        results: syncResults,
        synced_count: syncResults.filter((r) => r.status !== 'error').length,
        error_count: syncResults.filter((r) => r.status === 'error').length,
      }),
      { status: 200, headers: { 'Content-Type': 'application/json', ...corsHeaders } },
    );
  } catch (error: any) {
    console.error('Error in google-sheets-sync function:', error);
    return new Response(
      JSON.stringify({ success: false, message: 'Failed to sync Google Sheets data', error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } },
    );
  }
});

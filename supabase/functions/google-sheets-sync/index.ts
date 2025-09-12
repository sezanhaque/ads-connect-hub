import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface GoogleSheetsJob {
  title: string;
  description: string;
  budget: number;
  status: string;
  external_id: string;
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
    const { organization_id, sheet_url } = await req.json();

    console.log('Starting Google Sheets sync for organization:', organization_id);

    // In a real implementation, you would:
    // 1. Use Google Sheets API to fetch data from the provided sheet_url
    // 2. Parse the rows and map them to job objects
    // 3. Handle authentication with Google API using stored credentials
    
    // For now, we'll simulate the sync with mock data
    const mockJobs: GoogleSheetsJob[] = [
      {
        title: 'Senior React Developer',
        description: 'Looking for experienced React developer with TypeScript',
        budget: 3000,
        status: 'active',
        external_id: 'GSHEET_001'
      },
      {
        title: 'Product Manager',
        description: 'Lead product strategy and roadmap development',
        budget: 2500,
        status: 'active', 
        external_id: 'GSHEET_002'
      }
    ];

    // Sync jobs to database
    const syncResults = [];
    
    for (const job of mockJobs) {
      // Check if job already exists
      const { data: existingJob } = await supabase
        .from('jobs')
        .select('id')
        .eq('external_id', job.external_id)
        .eq('organization_id', organization_id)
        .single();

      if (existingJob) {
        // Update existing job
        const { data, error } = await supabase
          .from('jobs')
          .update({
            title: job.title,
            description: job.description,
            status: job.status,
            metadata: {
              ...job,
              source: 'google_sheets',
              last_sync: new Date().toISOString(),
              budget: job.budget
            }
          })
          .eq('id', existingJob.id)
          .select()
          .single();

        if (error) {
          console.error('Error updating job:', error);
          syncResults.push({ external_id: job.external_id, status: 'error', error: error.message });
        } else {
          syncResults.push({ external_id: job.external_id, status: 'updated', data });
        }
      } else {
        // Create new job
        const { data, error } = await supabase
          .from('jobs')
          .insert({
            title: job.title,
            description: job.description,
            status: job.status,
            external_id: job.external_id,
            organization_id,
            metadata: {
              ...job,
              source: 'google_sheets',
              last_sync: new Date().toISOString(),
              budget: job.budget
            }
          })
          .select()
          .single();

        if (error) {
          console.error('Error creating job:', error);
          syncResults.push({ external_id: job.external_id, status: 'error', error: error.message });
        } else {
          syncResults.push({ external_id: job.external_id, status: 'created', data });
        }
      }
    }

    console.log('Sync completed:', syncResults);

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Google Sheets sync completed',
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
    console.error('Error in google-sheets-sync function:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
        message: 'Failed to sync Google Sheets data'
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  }
};

serve(handler);
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { organizationId, sheetId, accessToken } = await req.json();

    if (!organizationId || !sheetId || !accessToken) {
      throw new Error('Organization ID, Sheet ID, and access token are required');
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get sheet data using Google Sheets API
    const range = 'A:Z'; // Get all columns
    const sheetsResponse = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${range}`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!sheetsResponse.ok) {
      const errorData = await sheetsResponse.json();
      throw new Error(errorData.error?.message || 'Failed to fetch sheet data');
    }

    const sheetsData = await sheetsResponse.json();
    const rows = sheetsData.values || [];

    if (rows.length === 0) {
      return new Response(JSON.stringify({ 
        success: true, 
        synced_count: 0, 
        message: 'No data found in sheet' 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Extract headers from first row
    const headers = rows[0].map((header: string) => header.toLowerCase().trim());
    const dataRows = rows.slice(1);

    // Column mapping
    const columnMapping = {
      job_id: ['job_id', 'id', 'job id'],
      job_title: ['job_title', 'title', 'job title', 'position'],
      job_description: ['job_description', 'description', 'job description', 'short_description'],
      job_status: ['job_status', 'status', 'job status'],
      company_name: ['company_name', 'company', 'company name'],
      location_city: ['location_city', 'location', 'city', 'location city'],
      vacancy_url: ['vacancy_url', 'url', 'link', 'vacancy url', 'job_url']
    };

    // Find column indices
    const getColumnIndex = (fieldName: string) => {
      const possibleNames = columnMapping[fieldName as keyof typeof columnMapping] || [];
      for (const name of possibleNames) {
        const index = headers.indexOf(name);
        if (index !== -1) return index;
      }
      return -1;
    };

    const jobIdIndex = getColumnIndex('job_id');
    const titleIndex = getColumnIndex('job_title');

    if (jobIdIndex === -1 || titleIndex === -1) {
      throw new Error('Required columns not found: job_id and job_title are mandatory');
    }

    let syncedCount = 0;
    const errors: string[] = [];

    // Process each data row
    for (let i = 0; i < dataRows.length; i++) {
      const row = dataRows[i];
      
      try {
        // Extract job data
        const jobData = {
          external_id: row[jobIdIndex]?.toString().trim(),
          title: row[titleIndex]?.toString().trim(),
          description: getColumnIndex('job_description') !== -1 ? row[getColumnIndex('job_description')]?.toString().trim() : null,
          status: getColumnIndex('job_status') !== -1 ? row[getColumnIndex('job_status')]?.toString().trim() : 'open',
          company_name: getColumnIndex('company_name') !== -1 ? row[getColumnIndex('company_name')]?.toString().trim() : null,
          location: getColumnIndex('location_city') !== -1 ? 
            JSON.stringify({ city: row[getColumnIndex('location_city')]?.toString().trim() }) : null,
          vacancy_url: getColumnIndex('vacancy_url') !== -1 ? row[getColumnIndex('vacancy_url')]?.toString().trim() : null,
          org_id: organizationId,
          created_by: organizationId
        };

        // Skip empty rows
        if (!jobData.external_id || !jobData.title) {
          continue;
        }

        // Upsert job data
        const { error: upsertError } = await supabase
          .from('jobs')
          .upsert(jobData, {
            onConflict: 'external_id,org_id',
            ignoreDuplicates: false
          });

        if (upsertError) {
          console.error(`Error upserting job ${jobData.external_id}:`, upsertError);
          errors.push(`Row ${i + 2}: ${upsertError.message}`);
        } else {
          syncedCount++;
          console.log(`Successfully synced job: ${jobData.external_id}`);
        }

      } catch (rowError: any) {
        console.error(`Error processing row ${i + 2}:`, rowError);
        errors.push(`Row ${i + 2}: ${rowError.message}`);
      }
    }

    const response = {
      success: true,
      synced_count: syncedCount,
      total_rows: dataRows.length,
      errors: errors.length > 0 ? errors : undefined
    };

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in google-sheets-private-sync function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
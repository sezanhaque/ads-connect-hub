import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { organization_id, sheet_id, sync_type } = await req.json();
    
    console.log('Google Sheets sync request:', { organization_id, sheet_id, sync_type });

    if (sync_type === 'jobs') {
      return await syncJobsFromGoogleSheets(supabase, organization_id, sheet_id);
    }

    return new Response(
      JSON.stringify({ error: 'Invalid sync_type. Use "jobs".' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );

  } catch (error) {
    console.error('Error in google-sheets-sync:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});

async function syncJobsFromGoogleSheets(supabase: any, organizationId: string, sheetId: string) {
  try {
    // Construct Google Sheets CSV export URL
    const csvUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv`;
    
    console.log('Fetching data from Google Sheets:', csvUrl);
    
    // Fetch data from Google Sheets
    const response = await fetch(csvUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch Google Sheets data: ${response.status} ${response.statusText}`);
    }
    
    const csvData = await response.text();
    console.log('CSV data received, length:', csvData.length);
    
    // Parse CSV data
    const rows = csvData.split('\n').filter(row => row.trim());
    if (rows.length === 0) {
      throw new Error('No data found in Google Sheets');
    }
    
    // Extract headers and data rows
    const headers = rows[0].split(',').map(h => h.trim().replace(/"/g, ''));
    const dataRows = rows.slice(1);
    
    console.log('Headers found:', headers);
    console.log('Data rows count:', dataRows.length);
    
    // Expected column mapping
    const columnMapping = {
      'company_name': 'company_name',
      'job_id': 'external_id',
      'job_status': 'status',
      'job_title': 'title',
      'short_description': 'description',
      'location_city': 'location',
      'vacancy_url': 'vacancy_url'
    };
    
    // Validate required columns
    const requiredColumns = Object.keys(columnMapping);
    const missingColumns = requiredColumns.filter(col => !headers.includes(col));
    if (missingColumns.length > 0) {
      throw new Error(`Missing required columns: ${missingColumns.join(', ')}`);
    }
    
    let syncedCount = 0;
    let errors = [];
    
    // Process each row
    for (let i = 0; i < dataRows.length; i++) {
      try {
        const rowData = dataRows[i].split(',').map(cell => cell.trim().replace(/"/g, ''));
        
        // Skip empty rows
        if (rowData.every(cell => !cell)) continue;
        
        // Create job object from row data
        const jobData: any = {
          org_id: organizationId,
          created_by: organizationId // Using org_id as fallback for created_by
        };
        
        // Map each column
        headers.forEach((header, index) => {
          if (columnMapping[header as keyof typeof columnMapping]) {
            const dbField = columnMapping[header as keyof typeof columnMapping];
            let value = rowData[index] || null;
            
            // Special handling for location - convert to JSON
            if (dbField === 'location' && value) {
              jobData[dbField] = JSON.stringify({ city: value });
            } else {
              jobData[dbField] = value;
            }
          }
        });
        
        // Validate required fields
        if (!jobData.external_id || !jobData.title) {
          console.warn(`Skipping row ${i + 1}: missing job_id or job_title`);
          continue;
        }
        
        // Check if job exists (upsert logic)
        const { data: existingJob } = await supabase
          .from('jobs')
          .select('id')
          .eq('org_id', organizationId)
          .eq('external_id', jobData.external_id)
          .maybeSingle();
        
        if (existingJob) {
          // Update existing job
          const { error } = await supabase
            .from('jobs')
            .update({
              title: jobData.title,
              status: jobData.status || 'active',
              description: jobData.description,
              location: jobData.location,
              vacancy_url: jobData.vacancy_url,
              company_name: jobData.company_name,
              updated_at: new Date().toISOString()
            })
            .eq('id', existingJob.id);
          
          if (error) throw error;
          console.log(`Updated job: ${jobData.title} (${jobData.external_id})`);
        } else {
          // Insert new job
          const { error } = await supabase
            .from('jobs')
            .insert({
              org_id: organizationId,
              external_id: jobData.external_id,
              title: jobData.title,
              status: jobData.status || 'active',
              description: jobData.description,
              location: jobData.location,
              vacancy_url: jobData.vacancy_url,
              company_name: jobData.company_name,
              created_by: organizationId
            });
          
          if (error) throw error;
          console.log(`Inserted job: ${jobData.title} (${jobData.external_id})`);
        }
        
        syncedCount++;
      } catch (error) {
        console.error(`Error processing row ${i + 1}:`, error);
        errors.push(`Row ${i + 1}: ${error.message}`);
      }
    }
    
    console.log(`Sync completed. Synced: ${syncedCount}, Errors: ${errors.length}`);
    
    return new Response(
      JSON.stringify({ 
        success: true,
        synced_count: syncedCount,
        total_rows: dataRows.length,
        errors: errors.length > 0 ? errors : undefined
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
    
  } catch (error) {
    console.error('Error syncing jobs from Google Sheets:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: 'Make sure your Google Sheet is publicly viewable and contains the required columns: company_name, job_id, job_status, job_title, short_description, location_city, vacancy_url'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
}
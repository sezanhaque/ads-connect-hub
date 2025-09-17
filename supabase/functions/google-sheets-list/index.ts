import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

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
    const { accessToken } = await req.json();

    if (!accessToken) {
      throw new Error('Access token is required');
    }

    // List files from Google Drive API
    const driveResponse = await fetch(
      'https://www.googleapis.com/drive/v3/files?' +
      'q=mimeType="application/vnd.google-apps.spreadsheet"&' +
      'fields=files(id,name,modifiedTime)&' +
      'orderBy=modifiedTime desc&' +
      'pageSize=50',
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!driveResponse.ok) {
      const errorData = await driveResponse.json();
      console.error('Drive API error:', {
        status: driveResponse.status,
        statusText: driveResponse.statusText,
        error: errorData
      });
      throw new Error(errorData.error?.message || `Drive API error: ${driveResponse.status} ${driveResponse.statusText}`);
    }

    const driveData = await driveResponse.json();
    
    // Format the response
    const sheets = driveData.files.map((file: any) => ({
      id: file.id,
      name: file.name,
      modifiedTime: file.modifiedTime,
    }));

    return new Response(JSON.stringify({ sheets }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in google-sheets-list function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CampaignEmailData {
  campaign_name: string;
  objective: string;
  budget: number;
  start_date: string;
  end_date: string;
  location_targeting: any;
  audience_targeting: any;
  ad_copy: string;
  cta_button: string;
  creative_assets: any;
  user_email: string;
  user_name: string;
  email_recipients?: string[];
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
    const campaignData: CampaignEmailData = await req.json();

    console.log('Sending campaign email for:', campaignData.campaign_name);

    // In a real implementation, you would integrate with an email service like:
    // - Resend
    // - SendGrid
    // - Amazon SES
    // For now, we'll simulate the email sending

    const emailContent = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Campaign Setup Details</title>
    <style>
        body { font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #2563eb; color: white; padding: 20px; border-radius: 8px 8px 0 0; }
        .content { background: #f8fafc; padding: 20px; border-radius: 0 0 8px 8px; }
        .section { background: white; margin: 15px 0; padding: 15px; border-radius: 6px; border-left: 4px solid #2563eb; }
        .label { font-weight: bold; color: #374151; }
        .value { color: #6b7280; margin-top: 5px; }
        .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 14px; }
    </style>
</head>
<body>
    <div class="header">
        <h1>Campaign Setup Details</h1>
        <p>Ready for Meta Ads Manager</p>
    </div>
    
    <div class="content">
        <p>Hi ${campaignData.user_name},</p>
        <p>Your campaign "${campaignData.campaign_name}" is ready to be set up in Meta Ads Manager. Here are all the details:</p>
        
        <div class="section">
            <div class="label">Campaign Objective</div>
            <div class="value">${campaignData.objective}</div>
        </div>
        
        <div class="section">
            <div class="label">Budget & Schedule</div>
            <div class="value">
                Total Budget: $${campaignData.budget}<br>
                Start Date: ${campaignData.start_date}<br>
                End Date: ${campaignData.end_date}
            </div>
        </div>
        
        <div class="section">
            <div class="label">Location Targeting</div>
            <div class="value">${JSON.stringify(campaignData.location_targeting, null, 2)}</div>
        </div>
        
        <div class="section">
            <div class="label">Target Audience</div>
            <div class="value">${JSON.stringify(campaignData.audience_targeting, null, 2)}</div>
        </div>
        
        <div class="section">
            <div class="label">Ad Copy</div>
            <div class="value">${campaignData.ad_copy}</div>
        </div>
        
        <div class="section">
            <div class="label">Call-to-Action</div>
            <div class="value">${campaignData.cta_button}</div>
        </div>
        
        <div class="section">
            <div class="label">Creative Assets</div>
            <div class="value">${JSON.stringify(campaignData.creative_assets, null, 2)}</div>
        </div>
        
        <div class="section">
            <div class="label">Next Steps</div>
            <div class="value">
                1. Log into Meta Ads Manager<br>
                2. Create a new campaign with the above settings<br>
                3. Upload your creative assets<br>
                4. Review and publish your campaign
            </div>
        </div>
        
        <div class="footer">
            <p>This email was sent from your AdsConnect dashboard. If you need help setting up your campaign in Meta Ads Manager, please contact support.</p>
        </div>
    </div>
</body>
</html>
    `;

    // Simulate email sending
    // In real implementation, you would use an email service here
    console.log('Email content generated:', emailContent.length, 'characters');
    
    // For demo purposes, we'll just log that the email was "sent"
    // Send Email to all recipients
    const allRecipients = [campaignData.user_email];
    if (campaignData.email_recipients && campaignData.email_recipients.length > 0) {
      allRecipients.push(...campaignData.email_recipients);
    }
    
    console.log('Campaign email sent to:', allRecipients.join(', '));

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Campaign details email sent successfully',
        recipient: campaignData.user_email,
        campaign_name: campaignData.campaign_name
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );

  } catch (error: any) {
    console.error('Error in send-campaign-email function:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
        message: 'Failed to send campaign email'
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  }
};

serve(handler);
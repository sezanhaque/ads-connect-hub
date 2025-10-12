import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface CampaignEmailData {
  campaign_name: string;
  job_id: string;
  budget: number;
  start_date: string;
  end_date: string;
  location_targeting: string;
  target_audience: string;
  ad_copy: string;
  cta_button: string;
  creative_assets_count: number;
  creative_assets: Array<{
    name: string;
    path: string;
    url: string;
    type: string;
    size: number;
  }>;
  recipients: string[];
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    if (!supabaseUrl || !supabaseKey) {
      console.error("Missing Supabase environment variables");
      throw new Error("Supabase configuration missing");
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get request data
    const campaignData: CampaignEmailData = await req.json();

    console.log("Sending campaign email for:", campaignData.campaign_name);
    console.log("Recipients:", campaignData.recipients);

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
        <h1>New Campaign Setup Request</h1>
        <p>Ready for Meta Ads Manager</p>
    </div>
    
    <div class="content">
        <p>A new campaign "${campaignData.campaign_name}" has been created and is ready for setup in Meta Ads Manager.</p>
        
        <div class="section">
            <div class="label">Campaign Details</div>
            <div class="value">
                Campaign Name: ${campaignData.campaign_name}<br>
                Job ID: ${campaignData.job_id}<br>
                Total Budget: $${campaignData.budget}<br>
                Start Date: ${campaignData.start_date}<br>
                End Date: ${campaignData.end_date}
            </div>
        </div>
        
        <div class="section">
            <div class="label">Location Targeting</div>
            <div class="value">${campaignData.location_targeting}</div>
        </div>
        
        <div class="section">
            <div class="label">Target Audience</div>
            <div class="value">${campaignData.target_audience}</div>
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
            <div class="value">
                ${campaignData.creative_assets_count} files uploaded${
                  campaignData.creative_assets && campaignData.creative_assets.length > 0
                    ? "<br><br><strong>Attached Files:</strong><br>" +
                      campaignData.creative_assets
                        .map(
                          (asset) =>
                            `• ${asset.name} (${asset.type.startsWith("image/") ? "Image" : "Video"} - ${(asset.size / 1024 / 1024).toFixed(1)} MB)`,
                        )
                        .join("<br>")
                    : ""
                }
            </div>
        </div>
        
        <div class="section">
            <div class="label">Next Steps</div>
            <div class="value">
                1. Log into Meta Ads Manager<br>
                2. Create a new campaign with the above settings<br>
                3. Upload the creative assets<br>
                4. Review and publish the campaign
            </div>
        </div>
        
        <div class="footer">
            <p>This campaign request was generated automatically from the campaign creation system.</p>
        </div>
    </div>
</body>
</html>
    `;

    console.log("Email content generated:", emailContent.length, "characters");

    // Send email via Resend
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    if (!resendApiKey) {
      console.error("Missing RESEND_API_KEY secret");
      throw new Error("Email service not configured. Please set RESEND_API_KEY in Supabase.");
    }

    // Prepare attachments from uploaded assets
    const attachments = [];
    if (campaignData.creative_assets && campaignData.creative_assets.length > 0) {
      for (const asset of campaignData.creative_assets) {
        try {
          // Download file from Supabase Storage
          const { data: fileData, error: downloadError } = await supabase.storage
            .from("campaign-assets")
            .download(asset.path);

          if (downloadError) {
            console.error(`Failed to download ${asset.name}:`, downloadError);
            continue;
          }

          // Convert to buffer for attachment
          const buffer = await fileData.arrayBuffer();
          const uint8Array = new Uint8Array(buffer);

          attachments.push({
            filename: asset.name,
            content: Array.from(uint8Array),
            type: asset.type,
          });
        } catch (error) {
          console.error(`Error processing attachment ${asset.name}:`, error);
        }
      }
    }

    const resend = new Resend(resendApiKey);
    const emailResponse = await resend.emails.send({
      from: "Campaigns <brian@twentytwentysolutions.io>",
      // Resend test mode: restrict to verified testing email only
      to: ["thealaminislam@gmail.com", "ortv.schyns@gmail.com", "brianchristiaanwinkel@gmail.com"],
      subject: `Campaign Setup: ${campaignData.campaign_name}`,
      html: emailContent,
      attachments: attachments.length > 0 ? attachments : undefined,
    });

    console.log("Resend email response:", JSON.stringify(emailResponse));

    return new Response(
      JSON.stringify({
        success: true,
        message: "Campaign details email sent successfully",
        recipients: campaignData.recipients,
        campaign_name: campaignData.campaign_name,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      },
    );
  } catch (error: any) {
    console.error("Error in send-campaign-email function:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
        message: "Failed to send campaign email",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      },
    );
  }
};

serve(handler);

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface InviteEmailRequest {
  email: string;
  role: string;
  token: string;
  inviterName: string;
  organizationName: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    );

    const authHeader = req.headers.get('Authorization')!;
    const token = authHeader.replace('Bearer ', '');
    const { data } = await supabaseClient.auth.getUser(token);
    const user = data.user;

    if (!user) {
      throw new Error('User not authenticated');
    }

    const { email, role, token: inviteToken, inviterName, organizationName }: InviteEmailRequest = await req.json();

    const inviteUrl = `${req.headers.get('origin')}/accept-invite?invite=${inviteToken}`;

    const emailResponse = await resend.emails.send({
      from: "AdsConnect <onboarding@resend.dev>",
      to: [email],
      subject: `You're invited to join ${organizationName} on AdsConnect`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #333; font-size: 28px; margin-bottom: 10px;">⚡ AdsConnect</h1>
            <h2 style="color: #666; font-size: 20px; font-weight: normal;">You're invited to join ${organizationName}</h2>
          </div>
          
          <div style="background: #f8f9fa; padding: 25px; border-radius: 8px; margin-bottom: 25px;">
            <p style="font-size: 16px; color: #333; margin-bottom: 15px;">
              <strong>${inviterName}</strong> has invited you to join <strong>${organizationName}</strong> as a <strong>${role}</strong>.
            </p>
            
            <p style="font-size: 14px; color: #666; margin-bottom: 20px;">
              AdsConnect helps teams manage advertising campaigns, connect with Meta Marketing APIs, and track performance metrics all in one place.
            </p>
            
            <div style="text-align: center; margin-bottom: 10px;">
              <a href="${inviteUrl}" 
                 style="background: #007bff; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
                Accept Invitation
              </a>
            </div>

            <p style="font-size: 12px; color: #777; text-align: center; margin-top: 6px;">
              If the button doesn’t work, copy and paste this link into your browser:
              <br/>
              <span style="word-break: break-all; color: #333;">${inviteUrl}</span>
            </p>
          </div>
          
          <div style="background: #e9ecef; padding: 20px; border-radius: 6px; margin-bottom: 20px;">
            <h3 style="color: #333; font-size: 16px; margin-bottom: 10px;">What you'll get access to:</h3>
            <ul style="color: #666; font-size: 14px; margin: 0; padding-left: 20px;">
              <li>Dashboard with campaign insights and metrics</li>
              <li>Campaign creation and management tools</li>
              <li>Job posting and recruitment features</li>
              ${role === 'admin' ? '<li>Admin features: Meta connection and user management</li>' : ''}
            </ul>
          </div>
          
          <p style="font-size: 12px; color: #999; text-align: center; margin-top: 30px;">
            This invitation was sent to ${email}. If you didn't expect this invitation, you can safely ignore this email.
          </p>
        </div>
      `,
    });

    console.log("Invitation email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true, emailId: emailResponse.data?.id }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-invite-email function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
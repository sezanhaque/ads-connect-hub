import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Webhook } from 'https://esm.sh/standardwebhooks@1.0.0';
import { Resend } from "npm:resend@2.0.0";
import React from 'npm:react@18.3.1';
import { renderAsync } from 'npm:@react-email/components@0.0.22';
import { SignupConfirmationEmail } from './_templates/signup-confirmation.tsx';
import { PasswordResetEmail } from './_templates/password-reset.tsx';

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
// Normalize and validate webhook secret format (Standard Webhooks: "v1,whsec_<base64>")
const rawHookSecret = (Deno.env.get('SEND_AUTH_EMAIL_HOOK_SECRET') || '').trim();
// Convert potential base64url to base64 and pad
let hookSecret = rawHookSecret;
if (rawHookSecret.startsWith('v1,whsec_')) {
  const prefix = 'v1,whsec_';
  const b64 = rawHookSecret.slice(prefix.length).replace(/-/g, '+').replace(/_/g, '/');
  const padded = b64 + '='.repeat((4 - (b64.length % 4)) % 4);
  hookSecret = prefix + padded;
}


const handler = async (req: Request): Promise<Response> => {
  if (req.method !== 'POST') {
    return new Response('not allowed', { status: 400 });
  }

  const payload = await req.text();
  const headers = Object.fromEntries(req.headers);
  const wh = new Webhook(hookSecret);

  try {
    const {
      user,
      email_data: { token, token_hash, redirect_to, email_action_type },
    } = wh.verify(payload, headers) as {
      user: {
        email: string;
        user_metadata?: {
          first_name?: string;
          last_name?: string;
        };
      };
      email_data: {
        token: string;
        token_hash: string;
        redirect_to: string;
        email_action_type: string;
      };
    };

    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const userName = user.user_metadata?.first_name || user.email.split('@')[0];

    let html: string;
    let subject: string;

    // Handle different email types
    if (email_action_type === 'signup') {
      html = await renderAsync(
        React.createElement(SignupConfirmationEmail, {
          supabase_url: supabaseUrl,
          token,
          token_hash,
          redirect_to,
          email_action_type,
          userName,
        })
      );
      subject = 'Welcome to AdsConnect - Confirm your email';
    } else if (email_action_type === 'recovery' || email_action_type === 'magiclink') {
      html = await renderAsync(
        React.createElement(PasswordResetEmail, {
          supabase_url: supabaseUrl,
          token,
          token_hash,
          redirect_to,
          email_action_type,
          userName,
        })
      );
      subject = email_action_type === 'recovery' ? 'Reset your AdsConnect password' : 'AdsConnect Magic Link';
    } else {
      throw new Error(`Unsupported email action type: ${email_action_type}`);
    }

    const { data, error } = await resend.emails.send({
      from: "AdsConnect <onboarding@resend.dev>",
      to: [user.email],
      subject,
      html,
    });

    if (error) {
      console.error("Error sending email:", error);
      throw error;
    }

    console.log("Auth email sent successfully:", data?.id);

    return new Response(JSON.stringify({ success: true, emailId: data?.id }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error("Error in send-auth-email function:", error);
    return new Response(
      JSON.stringify({
        error: {
          http_code: error.code || 500,
          message: error.message,
        },
      }),
      {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
};

serve(handler);

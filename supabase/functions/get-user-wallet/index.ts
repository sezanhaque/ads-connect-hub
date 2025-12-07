import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import Stripe from "https://esm.sh/stripe@14.21.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY");

    // Create admin client for bypassing RLS
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
    
    // Create regular client to verify the requesting user
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("No authorization header");
    }

    const supabaseClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });

    // Verify the requesting user
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !user) {
      throw new Error("Unauthorized");
    }

    // Get request body
    const { target_user_id } = await req.json();
    if (!target_user_id) {
      throw new Error("target_user_id is required");
    }

    // Check if requesting user is an admin/owner in an org that the target user belongs to
    const { data: requesterMemberships } = await supabaseAdmin
      .from('members')
      .select('org_id, role')
      .eq('user_id', user.id)
      .in('role', ['owner', 'admin']);

    if (!requesterMemberships || requesterMemberships.length === 0) {
      throw new Error("Not authorized to view user data");
    }

    const requesterOrgIds = requesterMemberships.map(m => m.org_id);

    // Check if target user is in any of the requester's orgs
    const { data: targetMemberships } = await supabaseAdmin
      .from('members')
      .select('org_id')
      .eq('user_id', target_user_id)
      .in('org_id', requesterOrgIds);

    // Also allow viewing if target user owns their own org (they were invited by this admin org)
    const { data: targetOwnedOrg } = await supabaseAdmin
      .from('members')
      .select('org_id')
      .eq('user_id', target_user_id)
      .eq('role', 'owner')
      .maybeSingle();

    // Get the target user's wallet from their owned org
    let walletData = null;
    if (targetOwnedOrg?.org_id) {
      const { data: wallet } = await supabaseAdmin
        .from('wallets')
        .select('*')
        .eq('org_id', targetOwnedOrg.org_id)
        .eq('user_id', target_user_id)
        .maybeSingle();
      
      walletData = wallet;
    }

    if (!walletData) {
      return new Response(JSON.stringify({ wallet: null, stripeCard: null }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // If there's a Stripe card, fetch real-time data
    let stripeCardData = null;
    if (stripeSecretKey && walletData.stripe_card_id) {
      try {
        const stripe = new Stripe(stripeSecretKey, { apiVersion: "2023-10-16" });
        
        const card = await stripe.issuing.cards.retrieve(walletData.stripe_card_id, {
          expand: ['cardholder'],
        });

        // Get spending limits
        const spendingLimits = card.spending_controls?.spending_limits || [];
        const allTimeLimit = spendingLimits.find((l: any) => l.interval === 'all_time');
        const spendingLimitEur = allTimeLimit ? allTimeLimit.amount / 100 : walletData.balance;

        // Get current authorizations to calculate spent amount
        const authorizations = await stripe.issuing.authorizations.list({
          card: walletData.stripe_card_id,
          status: 'closed',
          limit: 100,
        });

        const spentEur = authorizations.data
          .filter((auth: any) => auth.approved)
          .reduce((sum: number, auth: any) => sum + (auth.amount / 100), 0);

        stripeCardData = {
          id: card.id,
          last4: card.last4,
          exp_month: card.exp_month,
          exp_year: card.exp_year,
          status: card.status,
          spending_limit_eur: spendingLimitEur,
          spent_eur: spentEur,
        };
      } catch (stripeError) {
        console.error("Stripe error:", stripeError);
        // Fall back to database data
        stripeCardData = {
          id: walletData.stripe_card_id,
          last4: walletData.card_last4 || '****',
          exp_month: walletData.card_exp_month || 0,
          exp_year: walletData.card_exp_year || 0,
          status: walletData.card_status || 'unknown',
          spending_limit_eur: walletData.balance || 0,
          spent_eur: 0,
        };
      }
    }

    return new Response(JSON.stringify({ 
      wallet: walletData, 
      stripeCard: stripeCardData 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error: any) {
    console.error("Error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

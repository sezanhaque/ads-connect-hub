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

    // Check if requesting user is an admin/owner in an org
    const { data: requesterMemberships } = await supabaseAdmin
      .from('members')
      .select('org_id, role')
      .eq('user_id', user.id)
      .in('role', ['owner', 'admin']);

    if (!requesterMemberships || requesterMemberships.length === 0) {
      throw new Error("Not authorized to view user data");
    }

    // Get the target user's wallet from their owned org
    const { data: targetOwnedOrg } = await supabaseAdmin
      .from('members')
      .select('org_id')
      .eq('user_id', target_user_id)
      .eq('role', 'owner')
      .maybeSingle();

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

    // Get accumulated spend from daily_campaign_spend table
    let accumulatedSpend = 0;
    const { data: spendRecords } = await supabaseAdmin
      .from('daily_campaign_spend')
      .select('amount')
      .eq('wallet_id', walletData.id);
    
    accumulatedSpend = (spendRecords || []).reduce((sum, record) => sum + parseFloat(record.amount), 0);

    // If there's a Stripe card, fetch real-time data
    let stripeCardData = null;
    if (stripeSecretKey && walletData.stripe_card_id) {
      try {
        const stripe = new Stripe(stripeSecretKey, { apiVersion: "2023-10-16" });
        
        const card = await stripe.issuing.cards.retrieve(walletData.stripe_card_id);

        // Get spending limits
        const limits = card.spending_controls?.spending_limits || [];
        let spendingLimit = 0;
        if (limits.length > 0) {
          const allTimeLimit = limits.find((limit: any) => limit.interval === 'all_time');
          const perAuthLimit = limits.find((limit: any) => limit.interval === 'per_authorization');
          const chosenLimit = allTimeLimit || perAuthLimit || limits[0];
          spendingLimit = chosenLimit?.amount || 0;
        }

        // Get Stripe's spent amount from the card (same logic as get-wallet-balance)
        const stripeSpentCents = card.spending_controls?.spending_limits?.[0]?.spent || 0;
        const stripeSpentEur = stripeSpentCents / 100;
        
        // Use the higher value between database spend and Stripe spend
        const actualSpentEur = Math.max(accumulatedSpend, stripeSpentEur);

        console.log('Admin fetched Stripe card data:', {
          cardId: card.id,
          spendingLimit: spendingLimit / 100,
          dbSpend: accumulatedSpend,
          stripeSpend: stripeSpentEur,
          actualSpend: actualSpentEur,
        });

        stripeCardData = {
          id: card.id,
          last4: card.last4,
          exp_month: card.exp_month,
          exp_year: card.exp_year,
          status: card.status,
          spending_limit_eur: spendingLimit / 100,
          spent_eur: actualSpentEur,
        };
      } catch (stripeError) {
        console.error("Stripe error:", stripeError);
        // Fall back to database data with accumulated spend
        stripeCardData = {
          id: walletData.stripe_card_id,
          last4: walletData.card_last4 || '****',
          exp_month: walletData.card_exp_month || 0,
          exp_year: walletData.card_exp_year || 0,
          status: walletData.card_status || 'unknown',
          spending_limit_eur: walletData.balance || 0,
          spent_eur: accumulatedSpend,
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

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import Stripe from "https://esm.sh/stripe@14.21.0";

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
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const stripeKey = Deno.env.get('STRIPE_SECRET_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const stripe = new Stripe(stripeKey, {
      apiVersion: '2023-10-16',
    });

    // Get user from auth header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Missing authorization header');
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    if (userError || !user) {
      throw new Error('Invalid user token');
    }

    // Get user's wallet
    const { data: wallet, error: walletError } = await supabase
      .from('wallets')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    if (walletError) {
      console.error('Error fetching wallet:', walletError);
      throw new Error('Failed to fetch wallet');
    }

    // Get recent transactions
    let transactions = [];
    if (wallet) {
      const { data: txData, error: txError } = await supabase
        .from('wallet_transactions')
        .select('*')
        .eq('wallet_id', wallet.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (!txError) {
        transactions = txData || [];
      }
    }

    // Get accumulated spend from our tracking table
    let accumulatedSpend = 0;
    if (wallet) {
      const { data: spendRecords } = await supabase
        .from('daily_campaign_spend')
        .select('amount')
        .eq('wallet_id', wallet.id);
      
      accumulatedSpend = (spendRecords || []).reduce((sum, record) => sum + parseFloat(record.amount), 0);
    }

    // If wallet exists and has a Stripe card, fetch real-time data from Stripe
    let stripeCardData = null;
    if (wallet?.stripe_card_id) {
      try {
        const card = await stripe.issuing.cards.retrieve(wallet.stripe_card_id);
        
        // Determine spending limit (in cents), preferring all_time but falling back to other intervals
        const limits = card.spending_controls?.spending_limits || [];
        let spendingLimit = 0;
        if (limits.length > 0) {
          const allTimeLimit = limits.find((limit) => limit.interval === 'all_time');
          const perAuthLimit = limits.find((limit) => limit.interval === 'per_authorization');
          const chosenLimit = allTimeLimit || perAuthLimit || limits[0];
          spendingLimit = chosenLimit?.amount || 0;
        }
        
        // Get Stripe's spent amount from the card
        const stripeSpentCents = card.spending_controls?.spending_limits?.[0]?.spent || 0;
        const stripeSpentEur = stripeSpentCents / 100;
        
        // Compare database spend with Stripe spend and use the higher value
        const actualSpentEur = Math.max(accumulatedSpend, stripeSpentEur);
        const spentAmountCents = Math.round(actualSpentEur * 100);
        
        console.log('Fetched fresh Stripe card data:', {
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
          spending_limit_cents: spendingLimit,
          spending_limit_eur: spendingLimit / 100,
          spent_cents: spentAmountCents,
          spent_eur: actualSpentEur,
        };

        // Update local wallet with fresh Stripe data
        await supabase
          .from('wallets')
          .update({
            balance: spendingLimit / 100,
            card_status: card.status,
            card_last4: card.last4,
            card_exp_month: card.exp_month,
            card_exp_year: card.exp_year,
          })
          .eq('id', wallet.id);

      } catch (stripeError) {
        console.error('Error fetching Stripe card data:', stripeError);
        throw new Error(`Failed to fetch card data from Stripe: ${stripeError.message}`);
      }
    } else if (wallet?.stripe_cardholder_id) {
      // If no card ID but we have cardholder ID, fetch cards from cardholder
      try {
        const cards = await stripe.issuing.cards.list({
          cardholder: wallet.stripe_cardholder_id,
          limit: 1,
        });
        
        if (cards.data.length > 0) {
          const card = cards.data[0];
          
          // Determine spending limit (in cents), preferring all_time but falling back to other intervals
          const limits = card.spending_controls?.spending_limits || [];
          let spendingLimit = 0;
          if (limits.length > 0) {
            const allTimeLimit = limits.find((limit) => limit.interval === 'all_time');
            const perAuthLimit = limits.find((limit) => limit.interval === 'per_authorization');
          const chosenLimit = allTimeLimit || perAuthLimit || limits[0];
          spendingLimit = chosenLimit?.amount || 0;
        }
        
        // Get Stripe's spent amount from the card
        const stripeSpentCents = card.spending_controls?.spending_limits?.[0]?.spent || 0;
        const stripeSpentEur = stripeSpentCents / 100;
        
        // Compare database spend with Stripe spend and use the higher value
        const actualSpentEur = Math.max(accumulatedSpend, stripeSpentEur);
        const spentAmountCents = Math.round(actualSpentEur * 100);
        
        console.log('Fetched fresh Stripe card data from cardholder:', {
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
            spending_limit_cents: spendingLimit,
            spending_limit_eur: spendingLimit / 100,
          spent_cents: spentAmountCents,
          spent_eur: actualSpentEur,
        };

          // Update wallet with the card ID and fresh data
          await supabase
            .from('wallets')
            .update({
              stripe_card_id: card.id,
              balance: spendingLimit / 100,
              card_status: card.status,
              card_last4: card.last4,
              card_exp_month: card.exp_month,
              card_exp_year: card.exp_year,
            })
            .eq('id', wallet.id);
        }
      } catch (stripeError) {
        console.error('Error fetching cards from cardholder:', stripeError);
        throw new Error(`Failed to fetch card data from Stripe: ${stripeError.message}`);
      }
    }

    return new Response(
      JSON.stringify({
        wallet: wallet || { balance: 0, currency: 'EUR', card_status: 'pending' },
        stripeCard: stripeCardData,
        transactions,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error fetching wallet:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

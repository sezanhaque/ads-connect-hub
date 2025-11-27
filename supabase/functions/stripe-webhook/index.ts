import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import Stripe from "https://esm.sh/stripe@14.21.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, stripe-signature',
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

    const body = await req.text();
    const signature = req.headers.get('stripe-signature');
    
    // For MVP, basic verification
    const event = JSON.parse(body);
    
    console.log('Received Stripe webhook event:', event.type);

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      const { wallet_id, stripe_card_id } = session.metadata;

      console.log('Processing completed checkout for wallet:', wallet_id);
      console.log('Card ID:', stripe_card_id);

      // Update transaction status to completed
      const { error: txError } = await supabase
        .from('wallet_transactions')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString(),
          stripe_payment_intent_id: session.payment_intent,
        })
        .eq('stripe_session_id', session.id);

      if (txError) {
        console.error('Error updating transaction:', txError);
        throw new Error('Failed to update transaction');
      }

      // Get the transaction to know the amount
      const { data: transaction, error: getTxError } = await supabase
        .from('wallet_transactions')
        .select('amount')
        .eq('stripe_session_id', session.id)
        .single();

      if (getTxError || !transaction) {
        console.error('Error fetching transaction:', getTxError);
        throw new Error('Transaction not found');
      }

      const topUpAmount = transaction.amount;
      console.log('Top-up amount:', topUpAmount);

      // Fetch current card from Stripe to get current spending limit
      const card = await stripe.issuing.cards.retrieve(stripe_card_id);
      
      // Get current all_time spending limit (in cents)
      const currentLimit = card.spending_controls?.spending_limits?.find(
        (limit) => limit.interval === 'all_time'
      )?.amount || 0;

      console.log('Current card limit (cents):', currentLimit);

      // Calculate new limit (convert EUR to cents)
      const newLimitCents = currentLimit + (topUpAmount * 100);
      console.log('New card limit (cents):', newLimitCents);

      // Update Stripe Issuing card spending limit
      await stripe.issuing.cards.update(stripe_card_id, {
        spending_controls: {
          spending_limits: [
            {
              amount: newLimitCents,
              interval: 'all_time',
            },
          ],
        },
      });

      console.log('Card spending limit updated successfully');

      // Update local wallet balance
      const { data: wallet, error: walletError } = await supabase
        .from('wallets')
        .select('balance')
        .eq('id', wallet_id)
        .single();

      if (!walletError && wallet) {
        const newBalance = Number(wallet.balance) + Number(topUpAmount);
        
        const { error: updateError } = await supabase
          .from('wallets')
          .update({ 
            balance: newBalance,
            updated_at: new Date().toISOString(),
          })
          .eq('id', wallet_id);

        if (updateError) {
          console.error('Error updating wallet balance:', updateError);
        } else {
          console.log('Wallet balance updated to:', newBalance);
        }
      }

    } else if (event.type === 'checkout.session.expired') {
      const session = event.data.object;
      
      console.log('Checkout session expired:', session.id);

      // Mark transaction as failed
      const { error: txError } = await supabase
        .from('wallet_transactions')
        .update({
          status: 'failed',
        })
        .eq('stripe_session_id', session.id);

      if (txError) {
        console.error('Error updating expired transaction:', txError);
      }
    }

    return new Response(
      JSON.stringify({ received: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in stripe-webhook:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

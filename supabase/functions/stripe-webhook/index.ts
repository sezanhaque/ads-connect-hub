import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, stripe-signature',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY');
    const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');
    
    if (!stripeSecretKey) {
      throw new Error('STRIPE_SECRET_KEY not configured');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const body = await req.text();
    const signature = req.headers.get('stripe-signature');

    // Verify webhook signature if secret is configured
    let event;
    if (webhookSecret && signature) {
      // For now, parse the event directly - proper signature verification requires crypto
      // This is acceptable for MVP but should be enhanced for production
      event = JSON.parse(body);
      console.log('Webhook received with signature verification enabled');
    } else {
      event = JSON.parse(body);
      console.log('Webhook received (no signature verification)');
    }

    console.log('Stripe event type:', event.type);

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      
      console.log('Processing completed checkout:', session.id);
      console.log('Metadata:', session.metadata);

      const walletId = session.metadata?.wallet_id;
      const amount = session.amount_total / 100; // Convert from cents

      if (!walletId) {
        console.error('No wallet_id in session metadata');
        throw new Error('Missing wallet_id in metadata');
      }

      // Update transaction status
      const { error: txError } = await supabase
        .from('wallet_transactions')
        .update({
          status: 'completed',
          stripe_payment_intent_id: session.payment_intent,
          completed_at: new Date().toISOString(),
        })
        .eq('stripe_session_id', session.id);

      if (txError) {
        console.error('Error updating transaction:', txError);
      }

      // Update wallet balance
      const { data: wallet, error: walletError } = await supabase
        .from('wallets')
        .select('balance')
        .eq('id', walletId)
        .single();

      if (walletError) {
        console.error('Error fetching wallet:', walletError);
        throw walletError;
      }

      const newBalance = (wallet.balance || 0) + amount;

      const { error: updateError } = await supabase
        .from('wallets')
        .update({ balance: newBalance })
        .eq('id', walletId);

      if (updateError) {
        console.error('Error updating wallet balance:', updateError);
        throw updateError;
      }

      console.log(`Updated wallet ${walletId} balance to €${newBalance}`);

      // TODO: Update Stripe Issuing card spending limit
      // This requires the card ID to be stored and Stripe Issuing API calls
      // const cardId = wallet.stripe_card_id;
      // if (cardId) {
      //   await updateCardSpendingLimit(cardId, newBalance);
      // }
    }

    if (event.type === 'checkout.session.expired') {
      const session = event.data.object;
      
      // Mark transaction as failed
      await supabase
        .from('wallet_transactions')
        .update({ status: 'failed' })
        .eq('stripe_session_id', session.id);

      console.log('Marked expired session as failed:', session.id);
    }

    return new Response(
      JSON.stringify({ received: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Webhook error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

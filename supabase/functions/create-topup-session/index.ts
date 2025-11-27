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

    const { amount, successUrl, cancelUrl } = await req.json();

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

    console.log('Creating top-up session for user:', user.id, 'amount:', amount);

    // Get user's wallet (or create one)
    let { data: wallet, error: walletError } = await supabase
      .from('wallets')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    if (walletError) {
      console.error('Error fetching wallet:', walletError);
      throw new Error('Failed to fetch wallet');
    }

    // If no wallet exists or no card, we need to create a virtual card first
    if (!wallet || !wallet.stripe_card_id) {
      console.log('No virtual card found, creating one...');
      
      // Call create-virtual-card function
      const createCardResponse = await supabase.functions.invoke('create-virtual-card', {
        headers: {
          Authorization: authHeader,
        },
      });

      if (createCardResponse.error) {
        console.error('Error creating virtual card:', createCardResponse.error);
        throw new Error('Failed to create virtual card');
      }

      wallet = createCardResponse.data.wallet;
      console.log('Virtual card created:', wallet.stripe_card_id);
    }

    if (!wallet) {
      throw new Error('Failed to get or create wallet');
    }

    // Create Stripe Checkout Session with iDEAL
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['ideal'],
      line_items: [
        {
          price_data: {
            currency: 'eur',
            product_data: {
              name: 'Virtual Card Top Up',
              description: `Add €${(amount / 100).toFixed(2)} to your virtual card`,
            },
            unit_amount: Math.round(amount * 100),
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        wallet_id: wallet.id,
        user_id: user.id,
        stripe_card_id: wallet.stripe_card_id,
      },
    });

    console.log('Checkout session created:', session.id);

    // Create pending transaction
    const { error: txError } = await supabase
      .from('wallet_transactions')
      .insert({
        wallet_id: wallet.id,
        amount: amount,
        currency: 'EUR',
        status: 'pending',
        payment_method: 'ideal',
        stripe_session_id: session.id,
      });

    if (txError) {
      console.error('Error creating transaction:', txError);
      throw new Error('Failed to create transaction record');
    }

    return new Response(
      JSON.stringify({
        sessionId: session.id,
        url: session.url,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in create-topup-session:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

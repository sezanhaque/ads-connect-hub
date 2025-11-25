import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY');
    if (!stripeSecretKey) {
      throw new Error('STRIPE_SECRET_KEY not configured');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

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

    // Get user's organization
    const { data: member, error: memberError } = await supabase
      .from('members')
      .select('org_id')
      .eq('user_id', user.id)
      .maybeSingle();

    if (memberError || !member) {
      throw new Error('User not in any organization');
    }

    const { amount, successUrl, cancelUrl } = await req.json();
    
    if (!amount || amount < 10) {
      throw new Error('Minimum top-up amount is €10');
    }

    // Get or create wallet for organization
    let { data: wallet, error: walletError } = await supabase
      .from('wallets')
      .select('id, stripe_card_id')
      .eq('org_id', member.org_id)
      .maybeSingle();

    if (!wallet) {
      const { data: newWallet, error: createError } = await supabase
        .from('wallets')
        .insert({ org_id: member.org_id })
        .select()
        .single();
      
      if (createError) throw createError;
      wallet = newWallet;
    }

    // Create Stripe Checkout Session with iDEAL
    const stripeResponse = await fetch('https://api.stripe.com/v1/checkout/sessions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${stripeSecretKey}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        'mode': 'payment',
        'payment_method_types[0]': 'ideal',
        'line_items[0][price_data][currency]': 'eur',
        'line_items[0][price_data][product_data][name]': 'Virtual Card Top-Up',
        'line_items[0][price_data][unit_amount]': String(Math.round(amount * 100)),
        'line_items[0][quantity]': '1',
        'success_url': successUrl || `${req.headers.get('origin')}/top-up/success?session_id={CHECKOUT_SESSION_ID}`,
        'cancel_url': cancelUrl || `${req.headers.get('origin')}/top-up`,
        'metadata[wallet_id]': wallet.id,
        'metadata[org_id]': member.org_id,
        'metadata[user_id]': user.id,
      }),
    });

    const session = await stripeResponse.json();
    
    if (session.error) {
      console.error('Stripe error:', session.error);
      throw new Error(session.error.message);
    }

    // Create pending transaction
    await supabase
      .from('wallet_transactions')
      .insert({
        wallet_id: wallet.id,
        stripe_session_id: session.id,
        amount: amount,
        currency: 'EUR',
        status: 'pending',
        payment_method: 'ideal',
      });

    console.log('Created checkout session:', session.id);

    return new Response(
      JSON.stringify({ sessionId: session.id, url: session.url }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error creating top-up session:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

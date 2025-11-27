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

    console.log('Creating virtual card for user:', user.id);

    // Check if user already has a wallet with a card
    const { data: existingWallet, error: walletError } = await supabase
      .from('wallets')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    if (walletError) {
      console.error('Error checking wallet:', walletError);
      throw new Error('Failed to check existing wallet');
    }

    if (existingWallet?.stripe_card_id) {
      console.log('User already has a virtual card:', existingWallet.stripe_card_id);
      return new Response(
        JSON.stringify({ 
          wallet: existingWallet,
          message: 'Card already exists'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get user profile for cardholder details
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (profileError) {
      console.error('Error fetching profile:', profileError);
      throw new Error('User profile not found');
    }

    // Get user's organization for address
    const { data: member, error: memberError } = await supabase
      .from('members')
      .select('org_id, organizations(name)')
      .eq('user_id', user.id)
      .maybeSingle();

    if (memberError) {
      console.error('Error fetching member:', memberError);
    }

    // Create Stripe Issuing Cardholder
    const cardholderName = `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || 'Cardholder';
    
    console.log('Creating Stripe cardholder:', cardholderName);
    
    const cardholder = await stripe.issuing.cardholders.create({
      name: cardholderName,
      email: profile.email || user.email!,
      phone_number: '+31612345678', // Default phone, can be updated later
      billing: {
        address: {
          line1: 'Default Address',
          city: 'Amsterdam',
          postal_code: '1000 AA',
          country: 'NL',
        },
      },
      type: 'individual',
    });

    console.log('Cardholder created:', cardholder.id);

    // Create Virtual Card with €0 initial spending limit
    const card = await stripe.issuing.cards.create({
      cardholder: cardholder.id,
      currency: 'eur',
      type: 'virtual',
      status: 'active',
      spending_controls: {
        spending_limits: [
          {
            amount: 0, // Start with €0
            interval: 'all_time',
          },
        ],
      },
    });

    console.log('Virtual card created:', card.id);

    // Store card details in database
    const walletData = {
      user_id: user.id,
      org_id: member?.org_id || null,
      stripe_cardholder_id: cardholder.id,
      stripe_card_id: card.id,
      card_last4: card.last4,
      card_exp_month: card.exp_month,
      card_exp_year: card.exp_year,
      card_status: card.status,
      balance: 0,
      currency: 'EUR',
    };

    let wallet;
    if (existingWallet) {
      // Update existing wallet
      const { data, error } = await supabase
        .from('wallets')
        .update(walletData)
        .eq('id', existingWallet.id)
        .select()
        .single();

      if (error) {
        console.error('Error updating wallet:', error);
        throw new Error('Failed to update wallet');
      }
      wallet = data;
    } else {
      // Create new wallet
      const { data, error } = await supabase
        .from('wallets')
        .insert(walletData)
        .select()
        .single();

      if (error) {
        console.error('Error creating wallet:', error);
        throw new Error('Failed to create wallet');
      }
      wallet = data;
    }

    console.log('Wallet stored in database:', wallet.id);

    return new Response(
      JSON.stringify({
        wallet,
        card: {
          id: card.id,
          last4: card.last4,
          exp_month: card.exp_month,
          exp_year: card.exp_year,
          status: card.status,
        },
        message: 'Virtual card created successfully',
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in create-virtual-card:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

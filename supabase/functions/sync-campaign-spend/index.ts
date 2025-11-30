import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { Resend } from "npm:resend@2.0.0";

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
    const resendKey = Deno.env.get('RESEND_API_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const stripe = new Stripe(stripeKey, {
      apiVersion: '2023-10-16',
    });
    const resend = new Resend(resendKey);

    console.log('Starting daily campaign spend sync...');

    // Fetch all wallets with active cards
    const { data: wallets, error: walletsError } = await supabase
      .from('wallets')
      .select('id, user_id, org_id, stripe_card_id, stripe_cardholder_id, balance')
      .not('stripe_card_id', 'is', null)
      .eq('card_status', 'active');

    if (walletsError) {
      console.error('Error fetching wallets:', walletsError);
      throw new Error('Failed to fetch wallets');
    }

    console.log(`Found ${wallets?.length || 0} active wallets to process`);

    const results = [];

    for (const wallet of wallets || []) {
      try {
        // TODO: Calculate actual campaign spend from campaign_metrics table
        // For now, using hardcoded €10 daily spend
        const dailySpend = 10.00;
        const dailySpendCents = Math.round(dailySpend * 100);

        console.log(`Processing wallet ${wallet.id}, adding €${dailySpend} spend`);

        // Fetch current card from Stripe
        const card = await stripe.issuing.cards.retrieve(wallet.stripe_card_id);
        
        const spendingLimitData = card.spending_controls?.spending_limits?.find(
          (limit) => limit.interval === 'all_time'
        );
        
        const currentLimit = spendingLimitData?.amount || 0;
        const currentSpent = spendingLimitData?.spent || 0;
        const availableBalance = currentLimit - currentSpent;

        console.log(`Card ${card.id}: Limit=${currentLimit/100}, Spent=${currentSpent/100}, Available=${availableBalance/100}`);

        // Check if new spend would exceed limit
        if (dailySpendCents > availableBalance) {
          console.log(`Insufficient balance for wallet ${wallet.id}, sending notification email`);

          // Get user email
          const { data: profile } = await supabase
            .from('profiles')
            .select('email, first_name')
            .eq('user_id', wallet.user_id)
            .single();

          if (profile?.email) {
            await resend.emails.send({
              from: 'TwentyTwenty Solutions <onboarding@resend.dev>',
              to: [profile.email],
              subject: 'Insufficient Balance - Please Top Up',
              html: `
                <h1>Insufficient Balance Alert</h1>
                <p>Hello ${profile.first_name || 'there'},</p>
                <p>Your virtual card doesn't have enough balance to cover today's campaign spend of €${dailySpend.toFixed(2)}.</p>
                <p><strong>Current available balance:</strong> €${(availableBalance / 100).toFixed(2)}</p>
                <p><strong>Required amount:</strong> €${dailySpend.toFixed(2)}</p>
                <p>Please top up your account to ensure your campaigns continue running without interruption.</p>
                <p><a href="${supabaseUrl.replace('supabase.co', 'supabase.co')}/top-up" style="background: #000; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Top Up Now</a></p>
                <p>Best regards,<br>TwentyTwenty Solutions Team</p>
              `,
            });
            console.log(`Notification email sent to ${profile.email}`);
          }

          results.push({
            wallet_id: wallet.id,
            status: 'insufficient_balance',
            email_sent: !!profile?.email,
          });
        } else {
          // Sufficient balance - update the spent amount in Stripe
          // Note: Stripe Issuing doesn't allow direct manipulation of spent amounts
          // This is tracked automatically by Stripe based on actual card transactions
          // For now, we log this and in production you'd integrate with actual transactions
          console.log(`Balance sufficient for wallet ${wallet.id}`);
          
          results.push({
            wallet_id: wallet.id,
            status: 'processed',
            daily_spend: dailySpend,
            available_balance: availableBalance / 100,
          });
        }

      } catch (error) {
        console.error(`Error processing wallet ${wallet.id}:`, error);
        results.push({
          wallet_id: wallet.id,
          status: 'error',
          error: error.message,
        });
      }
    }

    console.log('Daily sync completed:', results);

    return new Response(
      JSON.stringify({
        success: true,
        processed: wallets?.length || 0,
        results,
        timestamp: new Date().toISOString(),
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in sync-campaign-spend:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

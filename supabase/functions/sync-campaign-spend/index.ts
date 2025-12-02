import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Fetch Meta spend for a specific date
async function fetchMetaSpend(integration: any, date: string): Promise<number> {
  const accessToken = integration.access_token;
  const adAccountIds = integration.ad_account_id || [];
  let totalSpend = 0;

  for (const accountId of adAccountIds) {
    try {
      // Fetch campaigns for this ad account
      const campaignsUrl = `https://graph.facebook.com/v19.0/${accountId}/campaigns?fields=id&access_token=${accessToken}`;
      const campaignsResponse = await fetch(campaignsUrl);
      const campaignsData = await campaignsResponse.json();

      if (campaignsData.data) {
        const timeRange = encodeURIComponent(JSON.stringify({ since: date, until: date }));

        // Fetch insights for each campaign for the specific date
        for (const campaign of campaignsData.data) {
          const insightsUrl = `https://graph.facebook.com/v19.0/${campaign.id}/insights?fields=spend&time_range=${timeRange}&access_token=${accessToken}`;
          const insightsResponse = await fetch(insightsUrl);
          const insightsData = await insightsResponse.json();

          if (insightsData.data && insightsData.data.length > 0) {
            const spend = parseFloat(insightsData.data[0].spend || "0");
            totalSpend += isNaN(spend) ? 0 : spend;
          }
        }
      }
    } catch (error) {
      console.error(`Error fetching Meta data for account ${accountId}:`, error);
    }
  }

  return totalSpend;
}

// Fetch TikTok spend for a specific date
async function fetchTikTokSpend(integration: any, date: string): Promise<number> {
  const accessToken = integration.access_token;
  const advertiserIds = integration.ad_account_id || [];
  let totalSpend = 0;

  for (const advertiserId of advertiserIds) {
    try {
      // Fetch campaigns list using the same pattern as other TikTok functions
      const campaignsResponse = await fetch(
        `https://business-api.tiktok.com/open_api/v1.3/campaign/get/?advertiser_id=${advertiserId}`,
        {
          method: "GET",
          headers: {
            "Access-Token": accessToken,
            "Content-Type": "application/json",
          },
        },
      );

      if (!campaignsResponse.ok) {
        console.error("TikTok campaigns API error:", campaignsResponse.status);
        continue;
      }

      const campaignsData = await campaignsResponse.json();
      if (campaignsData.code !== 0) {
        console.error("TikTok campaigns fetch error:", campaignsData.message);
        continue;
      }

      const campaigns = campaignsData.data?.list || [];
      if (campaigns.length === 0) continue;

      const campaignIds = campaigns.map((c: any) => c.campaign_id);

      // Build reporting query for the specific date
      const reportParams = new URLSearchParams({
        advertiser_id: advertiserId,
        service_type: "AUCTION",
        report_type: "BASIC",
        data_level: "AUCTION_CAMPAIGN",
        dimensions: JSON.stringify(["campaign_id"]),
        metrics: JSON.stringify(["spend"]),
        start_date: date,
        end_date: date,
      });

      const insightsResponse = await fetch(
        `https://business-api.tiktok.com/open_api/v1.3/report/integrated/get/?${reportParams.toString()}`,
        {
          method: "GET",
          headers: {
            "Access-Token": accessToken,
            "Content-Type": "application/json",
          },
        },
      );

      if (!insightsResponse.ok) {
        console.error("TikTok insights API error:", insightsResponse.status);
        continue;
      }

      const insightsData = await insightsResponse.json();
      if (insightsData.code !== 0 || !insightsData.data?.list) continue;

      for (const insight of insightsData.data.list) {
        const spend = parseFloat(insight.metrics?.spend || "0");
        totalSpend += isNaN(spend) ? 0 : spend;
      }
    } catch (error) {
      console.error(`Error fetching TikTok data for advertiser ${advertiserId}:`, error);
    }
  }

  return totalSpend;
}

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
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    
    // Calculate yesterday's date
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    for (const wallet of wallets || []) {
      try {
        // Fetch integrations for the organization to get spend from APIs
        const { data: integrations } = await supabase
          .from('integrations')
          .select('*')
          .eq('org_id', wallet.org_id)
          .eq('status', 'active');

        let dailySpend = 0;

        // Fetch spend from each platform's API
        for (const integration of integrations || []) {
          try {
            if (integration.integration_type === 'meta') {
              // Fetch Meta spend for yesterday
              const metaSpend = await fetchMetaSpend(integration, yesterdayStr);
              dailySpend += metaSpend;
              console.log(`Meta spend for ${yesterdayStr}: €${metaSpend.toFixed(2)}`);
            } else if (integration.integration_type === 'tiktok') {
              // Fetch TikTok spend for yesterday
              const tiktokSpend = await fetchTikTokSpend(integration, yesterdayStr);
              dailySpend += tiktokSpend;
              console.log(`TikTok spend for ${yesterdayStr}: €${tiktokSpend.toFixed(2)}`);
            }
          } catch (apiError) {
            console.error(`Error fetching ${integration.integration_type} spend:`, apiError);
          }
        }

        console.log(`Processing wallet ${wallet.id}, total API spend for ${yesterdayStr}: €${dailySpend.toFixed(2)}`);
        
        // Skip if no spend
        if (dailySpend === 0) {
          console.log(`No spend for wallet ${wallet.id}, skipping`);
          results.push({
            wallet_id: wallet.id,
            status: 'no_spend',
            daily_spend: 0,
          });
          continue;
        }

        console.log(`Processing wallet ${wallet.id}, adding €${dailySpend} spend`);

        // Fetch current card from Stripe to get spending limit
        const card = await stripe.issuing.cards.retrieve(wallet.stripe_card_id);
        
        const spendingLimitData = card.spending_controls?.spending_limits?.find(
          (limit) => limit.interval === 'all_time'
        );
        
        const spendingLimitCents = spendingLimitData?.amount || 0;
        const spendingLimitEur = spendingLimitCents / 100;

        console.log(`Card ${card.id}: Spending Limit=${spendingLimitEur}`);

        // Get total accumulated spend from our tracking table
        const { data: spendRecords, error: spendError } = await supabase
          .from('daily_campaign_spend')
          .select('amount')
          .eq('wallet_id', wallet.id);

        if (spendError) {
          console.error('Error fetching spend records:', spendError);
          throw spendError;
        }

        const totalAccumulatedSpend = (spendRecords || []).reduce((sum, record) => sum + parseFloat(record.amount), 0);
        const newTotalSpend = totalAccumulatedSpend + dailySpend;
        const availableBalance = spendingLimitEur - totalAccumulatedSpend;

        console.log(`Wallet ${wallet.id}: Total spent so far=€${totalAccumulatedSpend}, New total=€${newTotalSpend}, Available=€${availableBalance}`);

        // Check if new spend would exceed limit
        if (dailySpend > availableBalance) {
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
                <p><strong>Current available balance:</strong> €${availableBalance.toFixed(2)}</p>
                <p><strong>Total spent so far:</strong> €${totalAccumulatedSpend.toFixed(2)}</p>
                <p><strong>Spending limit:</strong> €${spendingLimitEur.toFixed(2)}</p>
                <p><strong>Required for today:</strong> €${dailySpend.toFixed(2)}</p>
                <p>Please top up your account to ensure your campaigns continue running without interruption.</p>
                <p><a href="${supabaseUrl.replace('.supabase.co', '.lovableproject.com')}/top-up" style="background: #000; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Top Up Now</a></p>
                <p>Best regards,<br>TwentyTwenty Solutions Team</p>
              `,
            });
            console.log(`Notification email sent to ${profile.email}`);
          }

          results.push({
            wallet_id: wallet.id,
            status: 'insufficient_balance',
            email_sent: !!profile?.email,
            total_spent: totalAccumulatedSpend,
            available: availableBalance,
          });
        } else {
          // Sufficient balance - record the spend in our database
          const { error: insertError } = await supabase
            .from('daily_campaign_spend')
            .upsert({
              wallet_id: wallet.id,
              spend_date: today,
              amount: dailySpend,
              currency: 'EUR',
            }, {
              onConflict: 'wallet_id,spend_date',
            });

          if (insertError) {
            console.error('Error recording daily spend:', insertError);
            throw insertError;
          }

          console.log(`Balance sufficient for wallet ${wallet.id}, recorded €${dailySpend} spend`);
          
          results.push({
            wallet_id: wallet.id,
            status: 'processed',
            daily_spend: dailySpend,
            total_spent: newTotalSpend,
            available_balance: spendingLimitEur - newTotalSpend,
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

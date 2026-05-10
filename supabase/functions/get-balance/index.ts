import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const normalizeAccountIds = (value: unknown) => {
  const ids = Array.isArray(value) ? value : value ? [value] : [];
  return [...new Set(ids.map((id) => String(id).trim()).filter(Boolean))];
};

const addDays = (date: Date, days: number) => {
  const next = new Date(date);
  next.setUTCDate(next.getUTCDate() + days);
  return next;
};

const toDateParam = (date: Date) => date.toISOString().split("T")[0];

const fetchMetaLifetimeSpend = async (accessToken: string, adAccountId: string) => {
  let spend = 0;
  let nextUrl: string | null = `https://graph.facebook.com/v19.0/${adAccountId}/insights?access_token=${encodeURIComponent(accessToken)}&fields=spend&date_preset=maximum&level=account&limit=100`;

  while (nextUrl) {
    const response = await fetch(nextUrl);
    const payload = await response.json();

    if (!response.ok || payload.error) {
      console.error("Meta lifetime spend fetch failed", adAccountId, payload.error || payload);
      return 0;
    }

    for (const row of payload.data || []) spend += Number(row?.spend ?? 0);
    nextUrl = payload.paging?.next || null;
  }

  return spend;
};

const fetchTikTokLifetimeSpend = async (accessToken: string, advertiserId: string) => {
  let spend = 0;
  let start = new Date(Date.UTC(2018, 0, 1));
  const today = new Date();

  while (start <= today) {
    const end = addDays(start, 364) > today ? today : addDays(start, 364);
    const params = new URLSearchParams({
      advertiser_id: advertiserId,
      service_type: "AUCTION",
      report_type: "BASIC",
      data_level: "AUCTION_CAMPAIGN",
      dimensions: JSON.stringify(["campaign_id"]),
      metrics: JSON.stringify(["spend"]),
      start_date: toDateParam(start),
      end_date: toDateParam(end),
    });

    const response = await fetch(`https://business-api.tiktok.com/open_api/v1.3/report/integrated/get/?${params.toString()}`, {
      method: "GET",
      headers: {
        "Access-Token": accessToken,
        "Content-Type": "application/json",
      },
    });
    const payload = await response.json();

    if (!response.ok || payload.code !== 0) {
      console.error("TikTok lifetime spend fetch failed", advertiserId, payload.message || payload);
      return spend;
    }

    for (const row of payload.data?.list || []) spend += Number(row?.metrics?.spend ?? 0);
    start = addDays(end, 1);
  }

  return spend;
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("Missing authorization header");

    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userErr } = await userClient.auth.getUser(token);
    if (userErr || !userData?.user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const userId = userData.user.id;

    const admin = createClient(supabaseUrl, serviceKey);

    const { data: members } = await admin
      .from("members")
      .select("org_id, role")
      .eq("user_id", userId);

    if (!members || members.length === 0) {
      return new Response(
        JSON.stringify({ balance: 0, totalTopups: 0, totalCosts: 0, currency: "EUR" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }
    const primary = members.find((m: any) => m.role === "owner") ||
      members.find((m: any) => m.role === "admin") || members[0];
    const orgId = primary.org_id;

    const { data: row } = await admin
      .from("client_balances")
      .select("*")
      .eq("org_id", orgId)
      .maybeSingle();

    // All-time spend: lifetime spend from THIS user's active connected Meta/TikTok ad accounts.
    const { data: userIntegrations } = await admin
      .from("integrations")
      .select("integration_type, access_token, ad_account_id")
      .eq("user_id", userId)
      .eq("status", "active")
      .in("integration_type", ["meta", "tiktok"]);

    let totalCosts = 0;
    if (userIntegrations && userIntegrations.length > 0) {
      for (const i of userIntegrations as any[]) {
        if (!i.access_token) continue;
        for (const accountId of normalizeAccountIds(i.ad_account_id)) {
          if (i.integration_type === "meta") {
            totalCosts += await fetchMetaLifetimeSpend(i.access_token, accountId);
          }
          if (i.integration_type === "tiktok") {
            totalCosts += await fetchTikTokLifetimeSpend(i.access_token, accountId);
          }
        }
      }
    }

    return new Response(
      JSON.stringify({
        orgId,
        balance: Number(row?.current_balance ?? 0),
        totalTopups: Number(row?.total_topups ?? 0),
        totalCosts,
        currency: row?.currency ?? "EUR",
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (error: any) {
    console.error("get-balance error", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

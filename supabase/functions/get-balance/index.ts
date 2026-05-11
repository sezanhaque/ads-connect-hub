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
        JSON.stringify({ balance: 0, totalTopups: 0, totalCosts: 0, currency: "EUR", topups: [], groupUserIds: [userId] }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }
    const primary = members.find((m: any) => m.role === "owner") ||
      members.find((m: any) => m.role === "admin") || members[0];
    const orgId = primary.org_id;

    // ---- Build account group ----
    // Step 1: Current user's active Meta/TikTok integrations
    const { data: userIntegrations } = await admin
      .from("integrations")
      .select("integration_type, access_token, ad_account_id, user_id, org_id")
      .eq("user_id", userId)
      .eq("status", "active")
      .in("integration_type", ["meta", "tiktok"]);

    // Collect this user's account IDs per platform
    const myAccountsByPlatform: Record<string, Set<string>> = { meta: new Set(), tiktok: new Set() };
    for (const i of (userIntegrations as any[]) || []) {
      for (const acc of normalizeAccountIds(i.ad_account_id)) {
        myAccountsByPlatform[i.integration_type]?.add(acc);
      }
    }

    // Step 2: Find all integrations sharing any of those ad_account_ids
    const groupUserIds = new Set<string>([userId]);
    const groupOrgIds = new Set<string>([orgId]);
    // Map of "platform:accountId" -> { platform, accountId, accessToken }
    const groupAccounts = new Map<string, { platform: string; accountId: string; accessToken: string }>();

    // Seed group accounts with the current user's
    for (const i of (userIntegrations as any[]) || []) {
      if (!i.access_token) continue;
      for (const acc of normalizeAccountIds(i.ad_account_id)) {
        const key = `${i.integration_type}:${acc}`;
        if (!groupAccounts.has(key)) {
          groupAccounts.set(key, { platform: i.integration_type, accountId: acc, accessToken: i.access_token });
        }
      }
    }

    for (const platform of ["meta", "tiktok"] as const) {
      const accs = [...myAccountsByPlatform[platform]];
      if (accs.length === 0) continue;
      const { data: matches, error: matchErr } = await admin
        .from("integrations")
        .select("integration_type, access_token, ad_account_id, user_id, org_id")
        .eq("status", "active")
        .eq("integration_type", platform)
        .overlaps("ad_account_id", accs);
      if (matchErr) {
        console.error("integrations overlap query failed", platform, matchErr);
        continue;
      }
      for (const m of (matches as any[]) || []) {
        if (m.user_id) groupUserIds.add(m.user_id);
        if (m.org_id) groupOrgIds.add(m.org_id);
        if (!m.access_token) continue;
        for (const acc of normalizeAccountIds(m.ad_account_id)) {
          // Only add accounts that overlap with the seed set (avoid pulling unrelated accounts of shared users)
          if (!myAccountsByPlatform[platform].has(acc)) continue;
          const key = `${platform}:${acc}`;
          if (!groupAccounts.has(key)) {
            groupAccounts.set(key, { platform, accountId: acc, accessToken: m.access_token });
          }
        }
      }
    }

    // ---- Aggregate balance + totalTopups across all group orgs ----
    const orgIdList = [...groupOrgIds];
    const { data: balanceRows } = await admin
      .from("client_balances")
      .select("current_balance, total_topups, currency")
      .in("org_id", orgIdList);

    let balance = 0;
    let totalTopups = 0;
    let currency = "EUR";
    for (const r of (balanceRows as any[]) || []) {
      balance += Number(r.current_balance ?? 0);
      totalTopups += Number(r.total_topups ?? 0);
      if (r.currency) currency = r.currency;
    }

    // ---- All-time spend across unique ad accounts ----
    let totalCosts = 0;
    for (const { platform, accountId, accessToken } of groupAccounts.values()) {
      if (platform === "meta") {
        totalCosts += await fetchMetaLifetimeSpend(accessToken, accountId);
      } else if (platform === "tiktok") {
        totalCosts += await fetchTikTokLifetimeSpend(accessToken, accountId);
      }
    }

    // ---- Pooled top-ups history ----
    const userIdList = [...groupUserIds];
    const { data: topupRows } = await admin
      .from("topups")
      .select("id, amount, currency, status, description, paid_at, created_at, mollie_payment_id, user_id")
      .in("user_id", userIdList)
      .order("created_at", { ascending: false })
      .limit(20);

    return new Response(
      JSON.stringify({
        orgId,
        balance,
        totalTopups,
        totalCosts,
        currency,
        topups: topupRows || [],
        groupUserIds: userIdList,
        groupOrgIds: orgIdList,
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

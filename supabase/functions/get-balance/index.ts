import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
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
    const { data: claimsData, error: claimsErr } = await userClient.auth.getClaims(token);
    if (claimsErr || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const userId = claimsData.claims.sub as string;

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
    const orgIds = [...new Set(members.map((m: any) => m.org_id).filter(Boolean))];

    const { data: row } = await admin
      .from("client_balances")
      .select("*")
      .eq("org_id", orgId)
      .maybeSingle();

    const { data: orgBalanceRows } = await admin
      .from("client_balances")
      .select("total_costs")
      .in("org_id", orgIds);

    const totalCosts = (orgBalanceRows || []).reduce(
      (sum: number, balanceRow: any) => sum + Number(balanceRow?.total_costs ?? 0),
      0,
    );

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

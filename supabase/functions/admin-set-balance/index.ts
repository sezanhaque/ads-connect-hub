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
    const { data: userData, error: userErr } = await userClient.auth.getUser(token);
    if (userErr || !userData?.user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const callerId = userData.user.id;

    const body = await req.json();
    const targetUserId = String(body?.target_user_id || "").trim();
    const newBalance = Number(body?.balance);
    const currency = String(body?.currency || "EUR");

    if (!targetUserId || !Number.isFinite(newBalance) || newBalance < 0) {
      return new Response(JSON.stringify({ error: "Invalid input" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const admin = createClient(supabaseUrl, serviceKey);

    // Verify caller is owner/admin somewhere
    const { data: callerRoles } = await admin
      .from("members")
      .select("role")
      .eq("user_id", callerId)
      .in("role", ["owner", "admin"]);

    if (!callerRoles || callerRoles.length === 0) {
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Resolve target user's primary org (owner > admin > member)
    const { data: targetMemberships } = await admin
      .from("members")
      .select("org_id, role")
      .eq("user_id", targetUserId);

    if (!targetMemberships || targetMemberships.length === 0) {
      return new Response(JSON.stringify({ error: "Target user has no organization" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const primary =
      targetMemberships.find((m: any) => m.role === "owner") ||
      targetMemberships.find((m: any) => m.role === "admin") ||
      targetMemberships[0];
    const orgId = primary.org_id;

    // Read existing balance to compute delta for ledger
    const { data: existing } = await admin
      .from("client_balances")
      .select("current_balance, total_topups")
      .eq("org_id", orgId)
      .maybeSingle();

    const previousBalance = Number(existing?.current_balance ?? 0);
    const delta = newBalance - previousBalance;

    const newTotalTopups = Number(existing?.total_topups ?? 0) + (delta > 0 ? delta : 0);

    let upsertErr: any = null;
    if (existing) {
      const { error } = await admin
        .from("client_balances")
        .update({ current_balance: newBalance, currency, total_topups: newTotalTopups })
        .eq("org_id", orgId);
      upsertErr = error;
    } else {
      const { error } = await admin
        .from("client_balances")
        .insert({ org_id: orgId, current_balance: newBalance, currency, total_topups: newTotalTopups });
      upsertErr = error;
    }

    if (upsertErr) throw upsertErr;

    // Log to ledger
    if (delta !== 0) {
      await admin.from("balance_transactions").insert({
        org_id: orgId,
        user_id: callerId,
        amount: delta,
        currency,
        source_type: "admin_adjustment",
        source_ref: `admin:${callerId}`,
        description: `Admin set balance to ${newBalance}`,
      });
    }

    return new Response(
      JSON.stringify({ success: true, org_id: orgId, balance: newBalance, currency }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (error: any) {
    console.error("admin-set-balance error", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

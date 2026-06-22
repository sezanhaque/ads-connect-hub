import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
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
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

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
    const companyId = String(body?.company_id || "").trim();
    const mode = body?.mode === "add" ? "add" : "set";
    const amount = Number(body?.amount);
    const currency = String(body?.currency || "EUR");

    if (!companyId || !Number.isFinite(amount)) {
      return new Response(JSON.stringify({ error: "Invalid input" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (mode === "set" && amount < 0) {
      return new Response(JSON.stringify({ error: "Balance cannot be negative" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const admin = createClient(supabaseUrl, serviceKey);

    // Caller must be owner/admin somewhere
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

    // Ensure company exists
    const { data: company, error: compErr } = await admin
      .from("companies")
      .select("id")
      .eq("id", companyId)
      .maybeSingle();
    if (compErr || !company) {
      return new Response(JSON.stringify({ error: "Company not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Read existing credits row (may not exist for older companies)
    const { data: existing } = await admin
      .from("company_credits")
      .select("id, balance, currency")
      .eq("company_id", companyId)
      .maybeSingle();

    const prevBalance = Number(existing?.balance ?? 0);
    const newBalance = mode === "add" ? prevBalance + amount : amount;
    if (newBalance < 0) {
      return new Response(JSON.stringify({ error: "Resulting balance cannot be negative" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (existing) {
      const { error: updErr } = await admin
        .from("company_credits")
        .update({ balance: newBalance, currency, updated_at: new Date().toISOString() })
        .eq("id", existing.id);
      if (updErr) throw updErr;
    } else {
      const { error: insErr } = await admin
        .from("company_credits")
        .insert({ company_id: companyId, balance: newBalance, currency });
      if (insErr) throw insErr;
    }

    return new Response(
      JSON.stringify({ success: true, company_id: companyId, balance: newBalance, currency }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (error: any) {
    console.error("admin-set-company-balance error", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

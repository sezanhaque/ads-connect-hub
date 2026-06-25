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
    const platform = String(body?.platform || "").trim();
    const rawIds: unknown = body?.ad_account_ids;
    const accessToken = body?.access_token ? String(body.access_token).trim() : null;
    const accountName = body?.account_name ? String(body.account_name).trim() : null;

    if (!companyId || !["meta", "tiktok"].includes(platform) || !Array.isArray(rawIds)) {
      return new Response(JSON.stringify({ error: "Invalid input" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let ids = (rawIds as unknown[])
      .map((v) => String(v ?? "").trim())
      .filter((s) => s.length > 0);
    if (platform === "meta") {
      ids = ids.map((id) => (id.startsWith("act_") ? id : `act_${id}`));
    }
    ids = Array.from(new Set(ids));

    const admin = createClient(supabaseUrl, serviceKey);

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

    const { data: company } = await admin
      .from("companies")
      .select("id")
      .eq("id", companyId)
      .maybeSingle();
    if (!company) {
      return new Response(JSON.stringify({ error: "Company not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: existing } = await admin
      .from("company_integrations")
      .select("id, access_token, account_name")
      .eq("company_id", companyId)
      .eq("integration_type", platform)
      .maybeSingle();

    if (existing) {
      const patch: Record<string, unknown> = {
        ad_account_ids: ids,
        updated_at: new Date().toISOString(),
      };
      if (accessToken !== null) patch.access_token = accessToken || null;
      if (accountName !== null) patch.account_name = accountName || null;
      const { error: updErr } = await admin
        .from("company_integrations")
        .update(patch)
        .eq("id", existing.id);
      if (updErr) throw updErr;
    } else {
      const { error: insErr } = await admin
        .from("company_integrations")
        .insert({
          company_id: companyId,
          integration_type: platform,
          ad_account_ids: ids,
          access_token: accessToken,
          account_name: accountName,
        });
      if (insErr) throw insErr;
    }

    // Auto-trigger sync so dashboard reflects the new ad accounts immediately
    let syncResult: any = null;
    if (ids.length > 0) {
      try {
        const syncFn = platform === "meta" ? "company-meta-sync" : "company-tiktok-sync";
        const syncRes = await fetch(`${supabaseUrl}/functions/v1/${syncFn}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: authHeader,
          },
          body: JSON.stringify({ company_id: companyId }),
        });
        syncResult = await syncRes.json().catch(() => null);
      } catch (e) {
        console.error("auto-sync after setup failed", e);
      }
    }

    return new Response(
      JSON.stringify({ success: true, count: ids.length, has_token: !!accessToken, sync: syncResult }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (error: any) {
    console.error("company-platform-setup error", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

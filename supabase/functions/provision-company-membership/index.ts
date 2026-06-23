import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

/**
 * Called by the frontend after a user signs in (and email is verified).
 * Ensures the user has a company_members row matching their email domain.
 * Honors the feature flag and legacy_test_allowlist.
 */
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization") ?? "";
    const token = authHeader.replace(/^Bearer\s+/i, "");
    if (!token) return json({ ok: false, reason: "no_auth" }, 401);

    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const { data: userRes, error: userErr } = await admin.auth.getUser(token);
    if (userErr || !userRes?.user) return json({ ok: false, reason: "invalid_token" }, 401);

    const user = userRes.user;
    if (!user.email_confirmed_at) {
      return json({ ok: false, reason: "email_not_verified" }, 403);
    }

    const { data: flag } = await admin
      .from("feature_flags")
      .select("company_mode_enabled")
      .maybeSingle();

    if (!flag?.company_mode_enabled) {
      return json({ ok: true, skipped: true, reason: "company_mode_disabled" });
    }

    const email = (user.email ?? "").toLowerCase();
    const domain = email.split("@")[1];
    if (!domain) return json({ ok: false, reason: "no_email" }, 400);

    const { data: personal } = await admin
      .from("personal_email_domains")
      .select("domain")
      .eq("domain", domain)
      .maybeSingle();

    if (personal) {
      const { data: allow } = await admin
        .from("legacy_test_allowlist")
        .select("user_id")
        .eq("user_id", user.id)
        .maybeSingle();
      if (!allow) {
        return json({ ok: false, reason: "personal_domain_not_allowed" }, 403);
      }
    }

    const { data: companyId, error: rpcErr } = await admin
      .rpc("get_or_create_company_for_email", { p_email: email });

    if (rpcErr || !companyId) {
      return json({ ok: false, reason: "company_create_failed", message: rpcErr?.message }, 500);
    }

    const isInternal = domain === "twentytwentysolutions.io";
    const desiredRole = isInternal ? "admin" : "member";

    // Check existing membership
    const { data: existing } = await admin
      .from("company_members")
      .select("role")
      .eq("company_id", companyId)
      .eq("user_id", user.id)
      .maybeSingle();

    let insErr: any = null;
    if (!existing) {
      const { error } = await admin
        .from("company_members")
        .insert({ company_id: companyId, user_id: user.id, email, role: desiredRole });
      insErr = error;
    } else if (isInternal && existing.role !== "admin") {
      const { error } = await admin
        .from("company_members")
        .update({ role: "admin" })
        .eq("company_id", companyId)
        .eq("user_id", user.id);
      insErr = error;
    }

    if (insErr) {
      return json({ ok: false, reason: "membership_insert_failed", message: insErr.message }, 500);
    }

    return json({ ok: true, companyId, domain });
  } catch (err) {
    return json({ ok: false, reason: "server_error", message: String(err) }, 500);
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

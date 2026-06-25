import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

/**
 * Legacy endpoint kept for backward compat. Company membership is now MANUAL:
 * admins assign users to companies from the Companies admin page. This function
 * no longer creates a company or inserts a membership row.
 */
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const authHeader = req.headers.get("Authorization") ?? "";
    const token = authHeader.replace(/^Bearer\s+/i, "");
    if (!token) return json({ ok: true, skipped: true, reason: "no_auth" });

    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );
    const { data: userRes } = await admin.auth.getUser(token);
    const user = userRes?.user;
    if (!user) return json({ ok: true, skipped: true, reason: "invalid_token" });

    const { data: existing } = await admin
      .from("company_members")
      .select("company_id")
      .eq("user_id", user.id)
      .maybeSingle();

    return json({ ok: true, manual: true, companyId: existing?.company_id ?? null });
  } catch (err) {
    return json({ ok: true, skipped: true, reason: "server_error", message: String(err) });
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

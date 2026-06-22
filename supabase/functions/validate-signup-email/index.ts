import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const { email } = await req.json();
    if (!email || typeof email !== "string" || !EMAIL_RE.test(email)) {
      return json({ ok: false, reason: "invalid_email", message: "Please enter a valid email address." }, 400);
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const { data: flag } = await supabase
      .from("feature_flags")
      .select("company_mode_enabled")
      .maybeSingle();

    // If company mode is off, accept anything (legacy behavior).
    if (!flag?.company_mode_enabled) {
      return json({ ok: true, companyMode: false });
    }

    const domain = email.split("@")[1].toLowerCase();

    const { data: personal } = await supabase
      .from("personal_email_domains")
      .select("domain")
      .eq("domain", domain)
      .maybeSingle();

    if (personal) {
      return json({
        ok: false,
        reason: "personal_domain",
        message: "Please use your company email address. Personal email providers like Gmail are not allowed.",
      }, 400);
    }

    return json({ ok: true, companyMode: true, domain });
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

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
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const mollieKey = Deno.env.get("MOLLIE_API_KEY");
    if (!mollieKey) throw new Error("MOLLIE_API_KEY not configured");

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
    const userEmail = (claimsData.claims.email as string) || "";

    const body = await req.json();
    const amount = Number(body?.amount);
    const description = typeof body?.description === "string"
      ? body.description.slice(0, 200)
      : "";
    const origin = body?.origin || req.headers.get("origin") || "";

    if (!Number.isFinite(amount) || amount < 50 || amount > 10000) {
      return new Response(JSON.stringify({ error: "Amount must be between €50 and €10,000" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const admin = createClient(supabaseUrl, serviceKey);

    // Get user's org
    const { data: members, error: memErr } = await admin
      .from("members")
      .select("org_id, role")
      .eq("user_id", userId);
    if (memErr || !members || members.length === 0) {
      throw new Error("No organization found for user");
    }
    const primary = members.find((m: any) => m.role === "owner") ||
      members.find((m: any) => m.role === "admin") || members[0];
    const orgId = primary.org_id;

    const finalDescription = description || `Top-up by ${userEmail}`;
    const redirectUrl = `${origin}/top-up/success`;
    const webhookUrl = `${supabaseUrl}/functions/v1/mollie-webhook`;

    // Create Mollie payment
    const mollieRes = await fetch("https://api.mollie.com/v2/payments", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${mollieKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount: { currency: "EUR", value: amount.toFixed(2) },
        description: finalDescription,
        redirectUrl,
        webhookUrl,
        metadata: { user_id: userId, org_id: orgId },
      }),
    });

    const mollieData = await mollieRes.json();
    if (!mollieRes.ok) {
      console.error("Mollie error:", mollieData);
      throw new Error(mollieData?.detail || "Failed to create Mollie payment");
    }

    const checkoutUrl = mollieData?._links?.checkout?.href;
    const molliePaymentId = mollieData.id;

    // Insert top-up record
    const { error: insertErr } = await admin.from("topups").insert({
      user_id: userId,
      org_id: orgId,
      mollie_payment_id: molliePaymentId,
      amount,
      currency: "EUR",
      description: finalDescription,
      status: mollieData.status || "open",
    });
    if (insertErr) {
      console.error("Insert topup error:", insertErr);
      throw new Error("Failed to record top-up");
    }

    return new Response(
      JSON.stringify({ checkoutUrl, molliePaymentId }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (error: any) {
    console.error("create-mollie-payment error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

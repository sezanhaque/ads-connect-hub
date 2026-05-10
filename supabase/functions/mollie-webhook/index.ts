import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const NOTIFY_EMAIL = "thealaminislam@gmail.com";
const FROM_EMAIL = "Top-Ups <brian@twentytwentysolutions.io>";

async function sendNotification(payment: any, topup: any) {
  const resendKey = Deno.env.get("RESEND_API_KEY");
  if (!resendKey) {
    console.warn("RESEND_API_KEY missing — skipping notification");
    return;
  }
  const html = `
    <h2>New top-up received</h2>
    <ul>
      <li><b>User ID:</b> ${topup.user_id}</li>
      <li><b>Org ID:</b> ${topup.org_id}</li>
      <li><b>Amount:</b> €${Number(topup.amount).toFixed(2)} ${topup.currency}</li>
      <li><b>Status:</b> ${payment.status}</li>
      <li><b>Mollie payment ID:</b> ${payment.id}</li>
      <li><b>Description:</b> ${topup.description ?? ""}</li>
      <li><b>Paid at:</b> ${payment.paidAt ?? new Date().toISOString()}</li>
    </ul>`;
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${resendKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: FROM_EMAIL,
      to: [NOTIFY_EMAIL],
      subject: `Top-up €${Number(topup.amount).toFixed(2)} — ${payment.status}`,
      html,
    }),
  });
  if (!res.ok) {
    console.error("Resend error", await res.text());
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const mollieKey = Deno.env.get("MOLLIE_API_KEY");
    if (!mollieKey) throw new Error("MOLLIE_API_KEY not configured");

    // Mollie sends form-encoded `id=tr_xxx`
    let molliePaymentId: string | null = null;
    const ct = req.headers.get("content-type") || "";
    if (ct.includes("application/x-www-form-urlencoded")) {
      const form = await req.formData();
      molliePaymentId = (form.get("id") as string) || null;
    } else {
      try {
        const body = await req.json();
        molliePaymentId = body?.id ?? null;
      } catch (_) {
        // ignore
      }
    }
    if (!molliePaymentId) {
      return new Response("Missing id", { status: 400, headers: corsHeaders });
    }

    // Re-verify with Mollie
    const mRes = await fetch(`https://api.mollie.com/v2/payments/${molliePaymentId}`, {
      headers: { Authorization: `Bearer ${mollieKey}` },
    });
    const payment = await mRes.json();
    if (!mRes.ok) {
      console.error("Mollie fetch error", payment);
      throw new Error("Failed to verify Mollie payment");
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const admin = createClient(supabaseUrl, serviceKey);

    const { data: topup, error: tErr } = await admin
      .from("topups")
      .select("*")
      .eq("mollie_payment_id", molliePaymentId)
      .maybeSingle();

    if (tErr || !topup) {
      console.error("Topup not found", tErr);
      return new Response("Topup not found", { status: 404, headers: corsHeaders });
    }

    const newStatus: string = payment.status; // open, pending, paid, failed, expired, canceled, authorized
    const wasPaid = topup.status === "paid";

    const updates: Record<string, any> = { status: newStatus };
    if (newStatus === "paid" && payment.paidAt) {
      updates.paid_at = payment.paidAt;
    }

    await admin.from("topups").update(updates).eq("id", topup.id);

    // Credit ledger only on first transition to paid (UNIQUE source_ref also guards)
    if (newStatus === "paid" && !wasPaid) {
      const { error: ledgerErr } = await admin.from("balance_transactions").insert({
        org_id: topup.org_id,
        user_id: topup.user_id,
        source_type: "topup",
        source_ref: molliePaymentId,
        amount: Number(topup.amount),
        currency: topup.currency || "EUR",
        description: `Top-up ${molliePaymentId}`,
        occurred_at: payment.paidAt || new Date().toISOString(),
      });
      if (ledgerErr && !`${ledgerErr.message}`.includes("duplicate")) {
        console.error("Ledger insert error", ledgerErr);
      }

      try {
        await sendNotification(payment, { ...topup, ...updates });
      } catch (e) {
        console.error("Email notify failed", e);
      }
    }

    return new Response("ok", { status: 200, headers: corsHeaders });
  } catch (error: any) {
    console.error("mollie-webhook error", error);
    return new Response(error.message || "error", { status: 500, headers: corsHeaders });
  }
});

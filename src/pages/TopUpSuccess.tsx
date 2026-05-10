import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { CheckCircle2, Loader2, XCircle, Clock } from "lucide-react";

export default function TopUpSuccess() {
  const [status, setStatus] = useState<"loading" | "paid" | "pending" | "failed">("loading");
  const [topup, setTopup] = useState<any>(null);

  useEffect(() => {
    let active = true;
    let attempts = 0;
    const maxAttempts = 10;

    const poll = async () => {
      attempts++;
      const { data } = await supabase
        .from("topups")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(1);
      const latest = (data as any[])?.[0];
      if (!active) return;
      if (latest) setTopup(latest);
      if (latest?.status === "paid") {
        setStatus("paid");
        return;
      }
      if (latest && ["failed", "expired", "canceled"].includes(latest.status)) {
        setStatus("failed");
        return;
      }
      if (attempts >= maxAttempts) {
        setStatus("pending");
        return;
      }
      setTimeout(poll, 1500);
    };
    poll();

    return () => {
      active = false;
    };
  }, []);

  return (
    <DashboardLayout>
      <div className="max-w-lg mx-auto pt-12">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {status === "loading" && (
                <>
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  Confirming payment…
                </>
              )}
              {status === "paid" && (
                <>
                  <CheckCircle2 className="h-6 w-6 text-green-600" />
                  Payment Successful
                </>
              )}
              {status === "pending" && (
                <>
                  <Clock className="h-6 w-6 text-yellow-600" />
                  Payment Pending
                </>
              )}
              {status === "failed" && (
                <>
                  <XCircle className="h-6 w-6 text-destructive" />
                  Payment Failed
                </>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {topup && (
              <div className="text-sm space-y-1">
                <div>Amount: <b>€{Number(topup.amount).toFixed(2)}</b></div>
                {topup.description && <div>Description: {topup.description}</div>}
                <div>Status: {topup.status}</div>
              </div>
            )}
            {status === "paid" && (
              <p className="text-sm text-muted-foreground">
                Your balance has been updated.
              </p>
            )}
            {status === "pending" && (
              <p className="text-sm text-muted-foreground">
                Mollie hasn't confirmed your payment yet. Your balance will update automatically once confirmed.
              </p>
            )}
            {status === "failed" && (
              <p className="text-sm text-muted-foreground">
                The payment did not complete. You can try again from the top-up page.
              </p>
            )}
            <div className="flex gap-2">
              <Button asChild className="flex-1">
                <Link to="/dashboard">Back to Dashboard</Link>
              </Button>
              <Button asChild variant="outline" className="flex-1">
                <Link to="/top-up">Top Up Again</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Loader2, ArrowLeft, CreditCard } from "lucide-react";

export default function TopUpSuccess() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [isVerifying, setIsVerifying] = useState(true);
  const sessionId = searchParams.get("session_id");

  useEffect(() => {
    // Give the webhook a moment to process
    const timer = setTimeout(() => {
      setIsVerifying(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  if (isVerifying) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center space-y-4">
            <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
            <p className="text-muted-foreground">Verifying your payment...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 p-3 rounded-full bg-green-100 dark:bg-green-900/30 w-fit">
              <CheckCircle2 className="h-12 w-12 text-green-600 dark:text-green-400" />
            </div>
            <CardTitle className="text-2xl">Payment Successful!</CardTitle>
            <CardDescription>
              Your top-up has been processed successfully
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg bg-muted p-4 text-center">
              <p className="text-sm text-muted-foreground mb-1">
                Your virtual card balance has been updated
              </p>
              <div className="flex items-center justify-center gap-2 text-primary">
                <CreditCard className="h-5 w-5" />
                <span className="font-medium">Balance updated</span>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <Button onClick={() => navigate("/top-up")} className="w-full">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Top Up
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate("/dashboard")}
                className="w-full"
              >
                Go to Dashboard
              </Button>
            </div>

            {sessionId && (
              <p className="text-xs text-center text-muted-foreground">
                Session: {sessionId.slice(0, 20)}...
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

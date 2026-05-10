import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Euro, Loader2, Wallet, History, TrendingDown } from "lucide-react";
import { format } from "date-fns";

const PRESETS = [50, 100];
const MIN_AMOUNT = 50;
const MAX_AMOUNT = 10000;

interface Topup {
  id: string;
  amount: number;
  currency: string;
  status: string;
  description: string | null;
  paid_at: string | null;
  created_at: string;
  mollie_payment_id: string;
}

export default function TopUp() {
  const { toast } = useToast();
  const [selectedPreset, setSelectedPreset] = useState<number | null>(50);
  const [customAmount, setCustomAmount] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [balance, setBalance] = useState<number | null>(null);
  const [topups, setTopups] = useState<Topup[]>([]);
  const [loadingBalance, setLoadingBalance] = useState(true);

  const amount = selectedPreset ?? Number(customAmount || 0);
  const error =
    !Number.isFinite(amount) || amount < MIN_AMOUNT
      ? `Minimum top-up is €${MIN_AMOUNT}`
      : amount > MAX_AMOUNT
      ? `Maximum top-up is €${MAX_AMOUNT.toLocaleString()}`
      : null;

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoadingBalance(true);
    try {
      const [{ data: bal }, { data: topupRows }] = await Promise.all([
        supabase.functions.invoke("get-balance"),
        supabase
          .from("topups")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(20),
      ]);
      if (bal?.balance !== undefined) setBalance(Number(bal.balance));
      setTopups(((topupRows as any[]) || []) as Topup[]);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingBalance(false);
    }
  };

  const handlePay = async () => {
    if (error) {
      toast({ title: "Invalid amount", description: error, variant: "destructive" });
      return;
    }
    setSubmitting(true);
    try {
      const { data, error: fnErr } = await supabase.functions.invoke("create-mollie-payment", {
        body: {
          amount,
          description: description.trim() || undefined,
          origin: window.location.origin,
        },
      });
      if (fnErr) throw fnErr;
      const url = data?.checkoutUrl;
      if (!url) throw new Error("No checkout URL returned");
      window.location.assign(url);
    } catch (e: any) {
      console.error(e);
      toast({
        title: "Payment failed",
        description: e?.message || "Could not start the Mollie checkout",
        variant: "destructive",
      });
      setSubmitting(false);
    }
  };

  const statusBadge = (s: string) => {
    const map: Record<string, string> = {
      paid: "bg-green-100 text-green-800",
      open: "bg-yellow-100 text-yellow-800",
      pending: "bg-yellow-100 text-yellow-800",
      failed: "bg-red-100 text-red-800",
      expired: "bg-gray-100 text-gray-800",
      canceled: "bg-gray-100 text-gray-800",
    };
    return map[s] || "bg-muted text-muted-foreground";
  };

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Add Balance</h1>
          <p className="text-muted-foreground">Top up your account balance via Mollie.</p>
        </div>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Current Balance</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {loadingBalance ? "…" : `€${(balance ?? 0).toFixed(2)}`}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Up Balance</CardTitle>
            <CardDescription>Choose a preset or enter a custom amount (minimum €{MIN_AMOUNT}).</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="grid grid-cols-3 gap-3">
              {PRESETS.map((p) => (
                <Button
                  key={p}
                  variant={selectedPreset === p ? "default" : "outline"}
                  onClick={() => {
                    setSelectedPreset(p);
                    setCustomAmount("");
                  }}
                  size="lg"
                >
                  €{p}
                </Button>
              ))}
              <Button
                variant={selectedPreset === null ? "default" : "outline"}
                onClick={() => setSelectedPreset(null)}
                size="lg"
              >
                Custom
              </Button>
            </div>

            {selectedPreset === null && (
              <div className="space-y-2">
                <Label htmlFor="custom">Custom amount (€)</Label>
                <div className="relative">
                  <Euro className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="custom"
                    type="number"
                    min={MIN_AMOUNT}
                    step="1"
                    placeholder={`${MIN_AMOUNT}`}
                    className="pl-9"
                    value={customAmount}
                    onChange={(e) => setCustomAmount(e.target.value)}
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="description">Description (optional)</Label>
              <Textarea
                id="description"
                placeholder="e.g. October ad budget"
                value={description}
                onChange={(e) => setDescription(e.target.value.slice(0, 200))}
                rows={2}
              />
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}

            <Button
              onClick={handlePay}
              disabled={submitting || !!error}
              size="lg"
              className="w-full"
            >
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Redirecting to Mollie…
                </>
              ) : (
                <>Pay with Mollie · €{amount || 0}</>
              )}
            </Button>
            <p className="text-xs text-center text-muted-foreground">
              You'll be redirected to Mollie to complete the payment.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <History className="h-5 w-5" /> Recent Top-Ups
            </CardTitle>
          </CardHeader>
          <CardContent>
            {topups.length === 0 ? (
              <p className="text-sm text-muted-foreground">No top-ups yet.</p>
            ) : (
              <div className="space-y-2">
                {topups.map((t) => (
                  <div
                    key={t.id}
                    className="flex items-center justify-between p-3 rounded-md border"
                  >
                    <div>
                      <div className="font-medium">€{Number(t.amount).toFixed(2)}</div>
                      <div className="text-xs text-muted-foreground">
                        {format(new Date(t.created_at), "MMM d, yyyy HH:mm")}
                        {t.description ? ` · ${t.description}` : ""}
                      </div>
                    </div>
                    <Badge className={statusBadge(t.status)} variant="secondary">
                      {t.status}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Separator />
        <div className="text-center">
          <Button asChild variant="link">
            <Link to="/dashboard">Back to Dashboard</Link>
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
}

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { CreditCard, Euro, History, Loader2, Plus, Minus } from "lucide-react";
import { format } from "date-fns";

const PRESET_AMOUNTS = [25, 50, 100, 250, 500, 1000];

interface Transaction {
  id: string;
  amount: number;
  currency: string;
  status: string;
  payment_method: string;
  created_at: string;
  completed_at: string | null;
}

interface Wallet {
  id?: string;
  balance: number;
  currency: string;
}

export default function TopUp() {
  const [amount, setAmount] = useState<number>(100);
  const [customAmount, setCustomAmount] = useState<string>("");
  const [wallet, setWallet] = useState<Wallet>({ balance: 0, currency: "EUR" });
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    fetchWalletData();
  }, []);

  const fetchWalletData = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
        return;
      }

      const { data, error } = await supabase.functions.invoke("get-wallet-balance");
      
      if (error) throw error;
      
      setWallet(data.wallet);
      setTransactions(data.transactions || []);
    } catch (error: any) {
      console.error("Error fetching wallet:", error);
      toast({
        title: "Error",
        description: "Failed to load wallet data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleTopUp = async () => {
    const topUpAmount = customAmount ? parseFloat(customAmount) : amount;
    
    if (!topUpAmount || topUpAmount < 10) {
      toast({
        title: "Invalid amount",
        description: "Minimum top-up amount is €10",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    try {
      const { data, error } = await supabase.functions.invoke("create-topup-session", {
        body: {
          amount: topUpAmount,
          successUrl: `${window.location.origin}/top-up/success?session_id={CHECKOUT_SESSION_ID}`,
          cancelUrl: `${window.location.origin}/top-up`,
        },
      });

      if (error) throw error;

      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error("No checkout URL returned");
      }
    } catch (error: any) {
      console.error("Error creating checkout:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to create checkout session",
        variant: "destructive",
      });
      setIsProcessing(false);
    }
  };

  const handlePresetClick = (preset: number) => {
    setAmount(preset);
    setCustomAmount("");
  };

  const handleCustomAmountChange = (value: string) => {
    setCustomAmount(value);
    if (value) {
      setAmount(0);
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
      case "pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400";
      case "failed":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Top Up</h1>
          <p className="text-muted-foreground">
            Add funds to your virtual card using iDEAL
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Current Balance Card */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Current Balance</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                €{wallet.balance.toFixed(2)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Available spending limit
              </p>
            </CardContent>
          </Card>

          {/* Top Up Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Euro className="h-5 w-5" />
                Add Funds
              </CardTitle>
              <CardDescription>
                Select an amount or enter a custom value
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Preset Amounts */}
              <div className="grid grid-cols-3 gap-2">
                {PRESET_AMOUNTS.map((preset) => (
                  <Button
                    key={preset}
                    variant={amount === preset && !customAmount ? "default" : "outline"}
                    onClick={() => handlePresetClick(preset)}
                    className="w-full"
                  >
                    €{preset}
                  </Button>
                ))}
              </div>

              {/* Custom Amount */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Custom Amount</label>
                <div className="relative">
                  <Euro className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="number"
                    placeholder="Enter amount"
                    value={customAmount}
                    onChange={(e) => handleCustomAmountChange(e.target.value)}
                    className="pl-9"
                    min={10}
                  />
                </div>
                <p className="text-xs text-muted-foreground">Minimum €10</p>
              </div>

              {/* Top Up Button */}
              <Button
                onClick={handleTopUp}
                disabled={isProcessing}
                className="w-full"
                size="lg"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Plus className="mr-2 h-4 w-4" />
                    Top Up €{customAmount || amount}
                  </>
                )}
              </Button>

              <p className="text-xs text-center text-muted-foreground">
                You will be redirected to iDEAL to complete the payment
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Transaction History */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <History className="h-5 w-5" />
              Recent Transactions
            </CardTitle>
            <CardDescription>
              Your recent top-up history
            </CardDescription>
          </CardHeader>
          <CardContent>
            {transactions.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <History className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No transactions yet</p>
                <p className="text-sm">Your top-up history will appear here</p>
              </div>
            ) : (
              <div className="space-y-3">
                {transactions.map((tx) => (
                  <div
                    key={tx.id}
                    className="flex items-center justify-between p-3 rounded-lg border bg-card"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-full bg-primary/10">
                        <Plus className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">Top-up via {tx.payment_method.toUpperCase()}</p>
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(tx.created_at), "MMM d, yyyy 'at' HH:mm")}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-green-600 dark:text-green-400">
                        +€{tx.amount.toFixed(2)}
                      </p>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${getStatusBadgeClass(tx.status)}`}>
                        {tx.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

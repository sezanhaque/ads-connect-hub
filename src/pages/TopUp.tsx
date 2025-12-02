import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { CreditCard, Euro, History, Loader2, Plus, PlayCircle } from "lucide-react";
import { format } from "date-fns";

const PRESET_AMOUNTS = [25, 50, 100, 250, 500, 1000];
const LOW_BALANCE_THRESHOLD = 10; // EUR

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
  card_status?: string;
  card_last4?: string;
  card_exp_month?: number;
  card_exp_year?: number;
  stripe_card_id?: string;
  stripe_cardholder_id?: string;
}

interface StripeCard {
  id: string;
  last4: string;
  exp_month: number;
  exp_year: number;
  status: string;
  spending_limit_eur: number;
  spent_eur: number;
}

export default function TopUp() {
  const [amount, setAmount] = useState<number>(100);
  const [customAmount, setCustomAmount] = useState<string>("");
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [stripeCard, setStripeCard] = useState<StripeCard | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [creatingCard, setCreatingCard] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
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
      setStripeCard(data.stripeCard);
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

  const handleCreateCard = async () => {
    setCreatingCard(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-virtual-card');
      
      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Virtual card created successfully!",
      });
      
      // Refresh wallet data
      await fetchWalletData();
    } catch (error: any) {
      console.error('Error creating card:', error);
      toast({
        title: "Error",
        description: "Failed to create virtual card",
        variant: "destructive",
      });
    } finally {
      setCreatingCard(false);
    }
  };

  const handleTestSync = async () => {
    setIsTesting(true);
    try {
      const { data, error } = await supabase.functions.invoke('sync-campaign-spend');
      
      if (error) throw error;
      
      console.log('Sync test results:', data);
      
      toast({
        title: "Test Complete",
        description: `Processed ${data.processed} wallets. Check console and email for details.`,
      });
      
      // Refresh wallet data to see updated balances
      setTimeout(() => fetchWalletData(), 2000);
    } catch (error: any) {
      console.error('Error testing sync:', error);
      toast({
        title: "Error",
        description: "Failed to test sync: " + error.message,
        variant: "destructive",
      });
    } finally {
      setIsTesting(false);
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

      console.log("Checkout response:", data, error);

      if (error) throw error;

      const checkoutUrl = data?.url;
      if (checkoutUrl) {
        window.location.assign(checkoutUrl);
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
              {stripeCard ? (
                <>
                  <div className="flex items-center gap-2">
                    <div className="text-3xl font-bold">
                      €{(stripeCard.spending_limit_eur - stripeCard.spent_eur).toFixed(2)}
                    </div>
                    {(stripeCard.spending_limit_eur - stripeCard.spent_eur) < LOW_BALANCE_THRESHOLD && (
                      <Badge variant="destructive" className="text-xs">Low Balance</Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Available balance
                  </p>
                  <div className="mt-3 pt-3 border-t">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Spent</span>
                      <span className="font-medium">€{stripeCard.spent_eur.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm mt-1">
                      <span className="text-muted-foreground">Allowed in total</span>
                      <span className="font-medium">€{stripeCard.spending_limit_eur.toFixed(2)}</span>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="text-3xl font-bold">
                    €{wallet?.balance.toFixed(2) || '0.00'}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Available funds
                  </p>
                </>
              )}
            </CardContent>
          </Card>

          {/* Virtual Card Details */}
          {(wallet?.stripe_card_id || wallet?.stripe_cardholder_id) && stripeCard && (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Virtual Card</CardTitle>
                <CreditCard className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Card Number</span>
                  <span className="font-mono text-sm">•••• {stripeCard.last4}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Expires</span>
                  <span className="text-sm">{stripeCard.exp_month}/{stripeCard.exp_year}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Status</span>
                  <Badge variant={stripeCard.status === 'active' ? 'default' : 'secondary'}>
                    {stripeCard.status}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Test Daily Sync */}
        {(wallet?.stripe_card_id || wallet?.stripe_cardholder_id) && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PlayCircle className="h-5 w-5" />
                Test Daily Spend Sync
              </CardTitle>
              <CardDescription>
                Manually trigger the daily sync to test if campaign spend tracking is working. 
                This simulates the automatic daily check that runs at 2 AM UTC.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={handleTestSync} 
                disabled={isTesting}
                variant="outline"
                className="w-full"
              >
                {isTesting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Testing Sync...
                  </>
                ) : (
                  <>
                    <PlayCircle className="mr-2 h-4 w-4" />
                    Run Test Sync Now
                  </>
                )}
              </Button>
              <p className="text-xs text-muted-foreground mt-2">
                This will check your balance against €10 hardcoded spend and send an email if insufficient.
              </p>
            </CardContent>
          </Card>
        )}

        {!wallet?.stripe_card_id && !wallet?.stripe_cardholder_id ? (
          <Card>
            <CardHeader>
              <CardTitle>Create Virtual Card</CardTitle>
              <CardDescription>
                You need to create a virtual card before you can add funds
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={handleCreateCard} 
                disabled={creatingCard}
                size="lg"
                className="w-full"
              >
                {creatingCard ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating Card...
                  </>
                ) : (
                  <>
                    <CreditCard className="mr-2 h-4 w-4" />
                    Create Virtual Card
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        ) : (
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
        )}

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

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { ArrowLeft, CreditCard, Loader2, Save, User } from 'lucide-react';

interface UserProfile {
  user_id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
}

interface WalletData {
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

interface StripeCardData {
  id: string;
  last4: string;
  exp_month: number;
  exp_year: number;
  status: string;
  spending_limit_eur: number;
  spent_eur: number;
}

const LOW_BALANCE_THRESHOLD = 10;

const UserManagement = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { profile } = useAuth();

  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [wallet, setWallet] = useState<WalletData | null>(null);
  const [stripeCard, setStripeCard] = useState<StripeCardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Integration form state
  const [metaAccountIds, setMetaAccountIds] = useState<string[]>([]);
  const [currentMetaId, setCurrentMetaId] = useState('');
  const [tiktokAccountIds, setTiktokAccountIds] = useState<string[]>([]);
  const [currentTiktokId, setCurrentTiktokId] = useState('');

  useEffect(() => {
    if (userId) {
      fetchUserData();
    }
  }, [userId]);

  const fetchUserData = async () => {
    if (!userId) return;

    try {
      setIsLoading(true);

      // Fetch user profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('user_id, email, first_name, last_name')
        .eq('user_id', userId)
        .single();

      if (profileError) throw profileError;
      setUserProfile(profileData);

      // Fetch wallet data via edge function (bypasses RLS for admin)
      const { data: walletResponse, error: walletError } = await supabase.functions.invoke('get-user-wallet', {
        body: { target_user_id: userId },
      });

      if (!walletError && walletResponse) {
        if (walletResponse.wallet) {
          setWallet(walletResponse.wallet);
        }
        if (walletResponse.stripeCard) {
          setStripeCard(walletResponse.stripeCard);
        }
      }

      // Fetch user's org for integrations
      const { data: userMembership } = await supabase
        .from('members')
        .select('org_id')
        .eq('user_id', userId)
        .eq('role', 'owner')
        .maybeSingle();

      if (userMembership?.org_id) {
        // Fetch existing integrations for this user
        const { data: integrations } = await supabase
          .from('integrations')
          .select('integration_type, ad_account_id')
          .eq('org_id', userMembership.org_id)
          .eq('user_id', userId);

        if (integrations) {
          const metaIntegration = integrations.find(i => i.integration_type === 'meta');
          const tiktokIntegration = integrations.find(i => i.integration_type === 'tiktok');

          if (metaIntegration?.ad_account_id) {
            setMetaAccountIds((metaIntegration.ad_account_id as string[]).map(id => id.replace(/^act_/, '')));
          }
          if (tiktokIntegration?.ad_account_id) {
            setTiktokAccountIds(tiktokIntegration.ad_account_id as string[]);
          }
        }
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load user data',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveIntegrations = async () => {
    if (!userId || !profile?.organization_id) return;

    setIsSaving(true);
    try {
      // Save Meta integrations
      if (metaAccountIds.length > 0) {
        const finalMetaIds = metaAccountIds.map(id => 
          id.trim().startsWith('act_') ? id.trim() : `act_${id.trim()}`
        );

        const { error: metaError } = await supabase.functions.invoke('member-meta-setup', {
          body: {
            target_user_id: userId,
            ad_account_ids: finalMetaIds,
            admin_org_id: profile.organization_id,
            append: false, // Replace existing
          },
        });

        if (metaError) throw metaError;
      }

      // Save TikTok integrations
      if (tiktokAccountIds.length > 0) {
        const { error: tiktokError } = await supabase.functions.invoke('member-tiktok-setup', {
          body: {
            target_user_id: userId,
            advertiser_ids: tiktokAccountIds.map(id => id.trim()),
            admin_org_id: profile.organization_id,
            append: false, // Replace existing
          },
        });

        if (tiktokError) throw tiktokError;
      }

      toast({
        title: 'Success',
        description: 'Integrations saved successfully',
      });
    } catch (error: any) {
      console.error('Error saving integrations:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to save integrations',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const addMetaId = () => {
    if (currentMetaId.trim() && !metaAccountIds.includes(currentMetaId.trim())) {
      setMetaAccountIds([...metaAccountIds, currentMetaId.trim()]);
      setCurrentMetaId('');
    }
  };

  const removeMetaId = (index: number) => {
    setMetaAccountIds(metaAccountIds.filter((_, i) => i !== index));
  };

  const addTiktokId = () => {
    if (currentTiktokId.trim() && !tiktokAccountIds.includes(currentTiktokId.trim())) {
      setTiktokAccountIds([...tiktokAccountIds, currentTiktokId.trim()]);
      setCurrentTiktokId('');
    }
  };

  const removeTiktokId = (index: number) => {
    setTiktokAccountIds(tiktokAccountIds.filter((_, i) => i !== index));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!userProfile) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" onClick={() => navigate('/invite-users')} className="flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Users
        </Button>
        <div className="text-center py-12">
          <p className="text-muted-foreground">User not found</p>
        </div>
      </div>
    );
  }

  const availableBalance = stripeCard 
    ? stripeCard.spending_limit_eur - stripeCard.spent_eur 
    : wallet?.balance || 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => navigate('/invite-users')} className="flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <User className="h-8 w-8" />
            {userProfile.first_name || userProfile.last_name 
              ? `${userProfile.first_name || ''} ${userProfile.last_name || ''}`.trim()
              : userProfile.email}
          </h1>
          <p className="text-muted-foreground">{userProfile.email}</p>
        </div>
      </div>

      {/* Top Up Information */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Current Balance Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Current Balance</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {wallet ? (
              <>
                <div className="flex items-center gap-2">
                  <div className="text-3xl font-bold">
                    €{availableBalance.toFixed(2)}
                  </div>
                  {availableBalance < LOW_BALANCE_THRESHOLD && (
                    <Badge variant="destructive" className="text-xs">Low Balance</Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Available balance
                </p>
                {stripeCard && (
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
                )}
              </>
            ) : (
              <div className="text-muted-foreground">
                <p className="text-2xl font-bold">No wallet</p>
                <p className="text-xs mt-1">User has not set up a wallet yet</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Virtual Card Details */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Virtual Card</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="space-y-2">
            {stripeCard && wallet?.stripe_card_id ? (
              <>
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
              </>
            ) : (
              <div className="text-muted-foreground py-4">
                <p className="text-sm">No virtual card</p>
                <p className="text-xs mt-1">User has not created a virtual card yet</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Manage Integrations Form */}
      <Card>
        <CardHeader>
          <CardTitle>Manage Integrations</CardTitle>
          <CardDescription>
            Configure Meta and TikTok ad account integrations for this user
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Meta Integration */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
              <img 
                src="/meta-logo.png" 
                alt="Meta" 
                className="h-6 w-6 object-contain"
                onError={(e) => { e.currentTarget.style.display = 'none'; }}
              />
              <span className="font-medium">Meta Integration</span>
            </div>

            <div>
              <Label htmlFor="meta-account-id">AD Account IDs</Label>
              <div className="space-y-2">
                <div className="flex gap-2">
                  <Input
                    id="meta-account-id"
                    placeholder="971311827719449"
                    value={currentMetaId}
                    onChange={(e) => setCurrentMetaId(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addMetaId();
                      }
                    }}
                  />
                  <Button type="button" variant="outline" onClick={addMetaId}>
                    Add
                  </Button>
                </div>
                {metaAccountIds.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {metaAccountIds.map((id, index) => (
                      <div key={index} className="flex items-center gap-1 bg-secondary text-secondary-foreground px-2 py-1 rounded-md text-sm">
                        <span>act_{id.replace(/^act_/, '')}</span>
                        <button
                          type="button"
                          onClick={() => removeMetaId(index)}
                          className="hover:text-destructive"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                <p className="text-xs text-muted-foreground">
                  Enter numbers only - the "act_" prefix will be added automatically
                </p>
              </div>
            </div>
          </div>

          {/* TikTok Integration */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
              <img 
                src="/tiktok-logo.png" 
                alt="TikTok" 
                className="h-6 w-6 object-contain"
                onError={(e) => { e.currentTarget.style.display = 'none'; }}
              />
              <span className="font-medium">TikTok Integration</span>
            </div>

            <div>
              <Label htmlFor="tiktok-account-id">Advertiser IDs</Label>
              <div className="space-y-2">
                <div className="flex gap-2">
                  <Input
                    id="tiktok-account-id"
                    placeholder="7123456789012345678"
                    value={currentTiktokId}
                    onChange={(e) => setCurrentTiktokId(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addTiktokId();
                      }
                    }}
                  />
                  <Button type="button" variant="outline" onClick={addTiktokId}>
                    Add
                  </Button>
                </div>
                {tiktokAccountIds.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {tiktokAccountIds.map((id, index) => (
                      <div key={index} className="flex items-center gap-1 bg-secondary text-secondary-foreground px-2 py-1 rounded-md text-sm">
                        <span>{id}</span>
                        <button
                          type="button"
                          onClick={() => removeTiktokId(index)}
                          className="hover:text-destructive"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                <p className="text-xs text-muted-foreground">
                  Enter your TikTok Advertiser IDs
                </p>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <Button 
            onClick={handleSaveIntegrations} 
            disabled={isSaving}
            className="w-full"
          >
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Integrations
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserManagement;

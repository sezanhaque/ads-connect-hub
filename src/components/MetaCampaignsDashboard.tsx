import { useEffect, useState } from 'react';
import { subDays } from 'date-fns';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useMetaIntegrationStatus } from '@/hooks/useMetaIntegrationStatus';
import { useToast } from '@/hooks/use-toast';
import { DateRangeFilter, DateRange } from '@/components/DateRangeFilter';
import { TrendingUp, Eye, MousePointer, DollarSign, Users, RefreshCw, Link as LinkIcon } from 'lucide-react';

interface MetaCampaign {
  id: string;
  name: string;
  status: string;
  objective: string;
  total_impressions: number;
  total_clicks: number;
  total_spend: number;
  total_leads: number;
}

interface MetaCampaignsDashboardProps {
  refreshTrigger?: number;
}

export const MetaCampaignsDashboard = ({ refreshTrigger }: MetaCampaignsDashboardProps) => {
  const [campaigns, setCampaigns] = useState<MetaCampaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [dateRange, setDateRange] = useState<DateRange>({
    from: subDays(new Date(), 7),
    to: new Date()
  });
  const { user } = useAuth();
  const { integration, isConnected } = useMetaIntegrationStatus();
  const { toast } = useToast();

  const fetchCampaigns = async (dateFilter?: DateRange) => {
    console.log('MetaCampaignsDashboard: Fetching live campaigns from Meta API...');
    setLoading(true);
    if (!user) return;

    const currentDateRange = dateFilter || dateRange;

    try {
      // Determine the user's primary organization (owner > admin > member)
      const { data: memberships, error: membershipError } = await supabase
        .from('members')
        .select('org_id, role')
        .eq('user_id', user.id)
        .order('role', { ascending: true });

      if (membershipError || !memberships || memberships.length === 0) {
        console.log('No organizations found for user');
        setCampaigns([]);
        return;
      }

      const primaryOrg =
        memberships.find((m: any) => m.role === 'owner') ||
        memberships.find((m: any) => m.role === 'admin') ||
        memberships.find((m: any) => m.role === 'member') ||
        memberships[0];

      // Convert date range to Meta API format
      let dateRangeParam = 'last_7d'; // default
      const daysDiff = Math.ceil((currentDateRange.to.getTime() - currentDateRange.from.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysDiff === 0) {
        // Same day - check if it's today
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const filterDate = new Date(currentDateRange.from);
        filterDate.setHours(0, 0, 0, 0);
        
        if (filterDate.getTime() === today.getTime()) {
          dateRangeParam = 'today';
        } else {
          // Custom single day
          const dateStr = currentDateRange.from.toISOString().split('T')[0];
          dateRangeParam = `${dateStr}|${dateStr}`;
        }
      } else if (daysDiff === 1) {
        // Check if it's yesterday
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        yesterday.setHours(0, 0, 0, 0);
        const filterDate = new Date(currentDateRange.from);
        filterDate.setHours(0, 0, 0, 0);
        
        if (filterDate.getTime() === yesterday.getTime()) {
          dateRangeParam = 'yesterday';
        } else {
          // Custom range
          const fromStr = currentDateRange.from.toISOString().split('T')[0];
          const toStr = currentDateRange.to.toISOString().split('T')[0];
          dateRangeParam = `${fromStr}|${toStr}`;
        }
      } else if (daysDiff === 7) {
        dateRangeParam = 'last_7d';
      } else if (daysDiff === 14) {
        dateRangeParam = 'last_14d';
      } else if (daysDiff === 30) {
        dateRangeParam = 'last_30d';
      } else {
        // Custom range
        const fromStr = currentDateRange.from.toISOString().split('T')[0];
        const toStr = currentDateRange.to.toISOString().split('T')[0];
        dateRangeParam = `${fromStr}|${toStr}`;
      }

      console.log('Fetching live data with date range:', dateRangeParam);

      // Fetch live data from Meta API
      const { data, error } = await supabase.functions.invoke('meta-campaigns-live', {
        body: {
          org_id: primaryOrg.org_id,
          date_range: dateRangeParam
        }
      });

      if (error) {
        console.error('Error fetching live campaigns:', error);
        toast({
          title: "Failed to fetch live data",
          description: "Falling back to cached data...",
          variant: "destructive",
        });
        // Fallback to database data would go here if needed
        setCampaigns([]);
        return;
      }

      if (data?.success && data.campaigns) {
        setCampaigns(data.campaigns);
        console.log(`Fetched ${data.campaigns.length} live campaigns from Meta API`);
      } else {
        console.error('Invalid response from live campaigns API:', data);
        setCampaigns([]);
      }

    } catch (error) {
      console.error('Error in fetchCampaigns:', error);
      toast({
        title: "Error fetching campaigns",
        description: "Failed to fetch live campaign data",
        variant: "destructive",
      });
      setCampaigns([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCampaigns();
  }, [user, refreshTrigger, dateRange]);

  const calculateCTR = (clicks: number, impressions: number) => {
    if (impressions === 0) return '0.00';
    return ((clicks / impressions) * 100).toFixed(2);
  };

  const calculateCPC = (spend: number, clicks: number) => {
    if (clicks === 0) return '0.00';
    return (spend / clicks).toFixed(2);
  };

  const handleDateRangeChange = (newRange: DateRange) => {
    setDateRange(newRange);
  };

  const handleManualSync = async () => {
    if (!integration || syncing) return;

    setSyncing(true);
    
    try {
      console.log('Manual sync triggered...');
      
      // Get user's organization ID from their membership
      const { data: memberships, error: membershipError } = await supabase
        .from('members')
        .select('org_id, role')
        .eq('user_id', user?.id)
        .order('role', { ascending: true }); // owner first

      if (membershipError || !memberships || memberships.length === 0) {
        throw new Error('No organization found for user');
      }

      const primaryOrg =
        memberships.find((m: any) => m.role === 'owner') ||
        memberships.find((m: any) => m.role === 'admin') ||
        memberships.find((m: any) => m.role === 'member') ||
        memberships[0];

      const userOrgId = primaryOrg.org_id;
      
      const { data, error } = await supabase.functions.invoke('meta-sync', {
        body: {
          org_id: userOrgId,
          save_connection: false
        }
      });

      if (error) {
        throw new Error(error.message || 'Sync failed');
      }

      if (data?.success) {
        toast({
          title: "Sync successful!",
          description: `Synced ${data.synced_count} campaigns from Meta`,
        });
        fetchCampaigns(); // Refresh the campaigns list
      } else {
        throw new Error(data?.error || 'Sync failed');
      }
    } catch (error: any) {
      console.error('Manual sync error:', error);
      toast({
        title: "Sync failed",
        description: error.message || "Failed to sync Meta campaigns",
        variant: "destructive",
      });
    } finally {
      setSyncing(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Meta Campaigns</CardTitle>
          <CardDescription>Your Meta Marketing campaigns performance</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (campaigns.length === 0) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Meta Campaigns</CardTitle>
              <CardDescription>
                {isConnected ? 'No Meta campaigns found' : 'No Meta campaigns found'}
              </CardDescription>
            </div>
            {isConnected && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleManualSync}
                disabled={syncing}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${syncing ? 'animate-spin' : ''}`} />
                {syncing ? 'Syncing...' : 'Sync Now'}
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            {isConnected ? (
              <div className="space-y-4">
                <div className="flex items-center justify-center">
                  <LinkIcon className="h-12 w-12 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-muted-foreground mb-2">
                    Meta account connected but no campaigns found.
                  </p>
                  <p className="text-sm text-muted-foreground mb-4">
                    Click "Sync Now" to fetch your latest campaigns, or check if you have active campaigns in your Meta Ads Manager.
                  </p>
                  <Button onClick={handleManualSync} disabled={syncing}>
                    <RefreshCw className={`h-4 w-4 mr-2 ${syncing ? 'animate-spin' : ''}`} />
                    {syncing ? 'Syncing...' : 'Sync Meta Campaigns'}
                  </Button>
                </div>
              </div>
            ) : (
              <p className="text-muted-foreground">
                Connect your Meta Marketing account to see your campaigns here.
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            <CardTitle>Meta Campaigns</CardTitle>
          </div>
          <DateRangeFilter
            value={dateRange}
            onChange={handleDateRangeChange}
          />
          {/* <Button
            variant="outline" 
            size="sm" 
            onClick={fetchCampaigns}
            disabled={loading}
            className="mr-2"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
          {isConnected && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleManualSync}
              disabled={syncing}
            >
              <LinkIcon className={`h-4 w-4 mr-2 ${syncing ? 'animate-spin' : ''}`} />
              {syncing ? 'Syncing...' : 'Sync Meta'}
            </Button>
          )} */}
        </div>
        <CardDescription>Your Meta Marketing campaigns performance</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Campaign Name</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Objective</TableHead>
                <TableHead className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Eye className="h-4 w-4" />
                    Impressions
                  </div>
                </TableHead>
                <TableHead className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    <MousePointer className="h-4 w-4" />
                    Clicks
                  </div>
                </TableHead>
                <TableHead className="text-right">CTR</TableHead>
                <TableHead className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    <DollarSign className="h-4 w-4" />
                    Spend
                  </div>
                </TableHead>
                <TableHead className="text-right">CPC</TableHead>
                <TableHead className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Users className="h-4 w-4" />
                    Leads
                  </div>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {campaigns.map((campaign) => (
                <TableRow key={campaign.id}>
                  <TableCell className="font-medium">{campaign.name}</TableCell>
                  <TableCell>
                    <Badge 
                      variant={
                        campaign.status === 'active' ? 'default' : 
                        campaign.status === 'paused' ? 'secondary' : 
                        campaign.status === 'deleted' ? 'destructive' :
                        'outline'
                      }
                    >
                      {campaign.status.toUpperCase()}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-muted-foreground">
                      {campaign.objective.replace('OUTCOME_', '').toLowerCase()}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    {campaign.total_impressions.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right">
                    {campaign.total_clicks.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right">
                    {calculateCTR(campaign.total_clicks, campaign.total_impressions)}%
                  </TableCell>
                  <TableCell className="text-right">
                    ${campaign.total_spend.toFixed(2)}
                  </TableCell>
                  <TableCell className="text-right">
                    ${calculateCPC(campaign.total_spend, campaign.total_clicks)}
                  </TableCell>
                  <TableCell className="text-right">
                    {campaign.total_leads}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};
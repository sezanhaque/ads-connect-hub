import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useMetaIntegrationStatus } from '@/hooks/useMetaIntegrationStatus';
import { useToast } from '@/hooks/use-toast';
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
  const { user } = useAuth();
  const { integration, isConnected } = useMetaIntegrationStatus();
  const { toast } = useToast();

  const fetchCampaigns = async () => {
    console.log('MetaCampaignsDashboard: Fetching user campaigns...');
    setLoading(true);
    if (!user) return;

    try {
      // Fetch campaigns created by this user only
      const { data: campaignsData, error: campaignsError } = await supabase
        .from('campaigns')
        .select('id, name, status, objective')
        .eq('created_by', user.id);

      if (campaignsError) {
        console.error('Error fetching campaigns:', campaignsError);
        return;
      }

      // Fetch metrics for user's campaigns
      const campaignIds = campaignsData?.map(c => c.id) || [];
      
      if (campaignIds.length === 0) {
        setCampaigns([]);
        return;
      }

      const { data: metricsData, error: metricsError } = await supabase
        .from('metrics')
        .select('campaign_id, impressions, clicks, spend, leads')
        .in('campaign_id', campaignIds);

      if (metricsError) {
        console.error('Error fetching metrics:', metricsError);
        return;
      }

      // Aggregate metrics by campaign
      const metricsMap = new Map<string, { impressions: number; clicks: number; spend: number; leads: number }>();
      
      metricsData?.forEach(metric => {
        const existing = metricsMap.get(metric.campaign_id) || { impressions: 0, clicks: 0, spend: 0, leads: 0 };
        metricsMap.set(metric.campaign_id, {
          impressions: existing.impressions + (metric.impressions || 0),
          clicks: existing.clicks + (metric.clicks || 0),
          spend: existing.spend + (metric.spend || 0),
          leads: existing.leads + (metric.leads || 0),
        });
      });

      // Combine campaigns with their metrics
      const aggregatedCampaigns = campaignsData?.map(campaign => {
        const metrics = metricsMap.get(campaign.id) || { impressions: 0, clicks: 0, spend: 0, leads: 0 };
        return {
          id: campaign.id,
          name: campaign.name,
          status: campaign.status,
          objective: campaign.objective,
          total_impressions: metrics.impressions,
          total_clicks: metrics.clicks,
          total_spend: metrics.spend,
          total_leads: metrics.leads,
        };
      }) || [];

      setCampaigns(aggregatedCampaigns);
    } catch (error) {
      console.error('Error in fetchCampaigns:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCampaigns();
  }, [user, refreshTrigger]);

  const calculateCTR = (clicks: number, impressions: number) => {
    if (impressions === 0) return '0.00';
    return ((clicks / impressions) * 100).toFixed(2);
  };

  const calculateCPC = (spend: number, clicks: number) => {
    if (clicks === 0) return '0.00';
    return (spend / clicks).toFixed(2);
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

      const userOrgId = memberships[0].org_id;
      
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
          <Button 
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
          )}
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
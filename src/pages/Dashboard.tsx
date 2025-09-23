import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MetaCampaignsDashboard } from '@/components/MetaCampaignsDashboard';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useMetaIntegrationStatus } from '@/hooks/useMetaIntegrationStatus';
import { 
  Plus, 
  Target, 
  Briefcase, 
  TrendingUp, 
  DollarSign,
  Eye,
  MousePointer,
  Users
} from 'lucide-react';

interface DashboardStats {
  totalCampaigns: number;
  activeCampaigns: number;
  totalJobs: number;
  totalBudget: number;
  totalSpend: number;
  totalImpressions: number;
  totalClicks: number;
  totalLeads: number;
}

interface Campaign {
  id: string;
  name: string;
  status: string;
  objective: string;
  budget: number;
  created_at: string;
}

interface Job {
  id: string;
  title: string;
  status: string;
  created_at: string;
}

const Dashboard = () => {
  const { profile } = useAuth();
  const { toast } = useToast();
  const { integration, isConnected } = useMetaIntegrationStatus();
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [stats, setStats] = useState<DashboardStats>({
    totalCampaigns: 0,
    activeCampaigns: 0,
    totalJobs: 0,
    totalBudget: 0,
    totalSpend: 0,
    totalImpressions: 0,
    totalClicks: 0,
    totalLeads: 0,
  });
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
    autoSyncMetaCampaigns();
    // Trigger refresh for MetaCampaignsDashboard
    setRefreshTrigger(prev => prev + 1);
  }, []);

  const autoSyncMetaCampaigns = async () => {
    if (!isConnected || !integration) return;

    try {
      console.log('Auto-syncing Meta campaigns for user...');
      console.log('Using integration:', integration);
      
      // Get user's organization ID from their membership
      const { data: memberships, error: membershipError } = await supabase
        .from('members')
        .select('org_id, role')
        .eq('user_id', profile?.user_id)
        .order('role', { ascending: true }); // alphabetical, we'll select explicitly

      if (membershipError) {
        console.error('Error fetching user memberships:', membershipError);
        return;
      }

      if (!memberships || memberships.length === 0) {
        console.error('No organization found for user');
        return;
      }

      const primaryOrg =
        memberships.find((m: any) => m.role === 'owner') ||
        memberships.find((m: any) => m.role === 'admin') ||
        memberships.find((m: any) => m.role === 'member') ||
        memberships[0];

      const userOrgId = primaryOrg.org_id;
      console.log('Using organization ID:', userOrgId);
      
      // Auto-sync using stored credentials for current user's organization
      const { data, error } = await supabase.functions.invoke('meta-sync', {
        body: {
          org_id: userOrgId,
          save_connection: false // Don't overwrite existing connection
        }
      });

      if (error) {
        console.error('Auto-sync error:', error);
        return;
      }

      if (data?.success) {
        console.log('Auto-sync successful:', data.synced_count, 'campaigns updated');
        // Refresh dashboard after sync
        setRefreshTrigger(prev => prev + 1);
        fetchDashboardData(); // Also refresh the main dashboard data
      }
    } catch (error) {
      console.error('Auto-sync failed:', error);
    }
  };

  const fetchDashboardData = async () => {
    if (!profile?.user_id) return;
    
    try {
      // Fetch recent campaigns created by this user (limit 5)
      const { data: recentCampaignsData, error: recentCampaignsError } = await supabase
        .from('campaigns')
        .select('*')
        .eq('created_by', profile.user_id)
        .order('created_at', { ascending: false })
        .limit(5);

      if (recentCampaignsError) throw recentCampaignsError;

      // Fetch total campaign count, active campaigns count, and budget totals for this user
      const { data: campaignCountData, error: campaignCountError } = await supabase
        .from('campaigns')
        .select('id, status, budget')
        .eq('created_by', profile.user_id);

      if (campaignCountError) throw campaignCountError;

      // Fetch recent jobs created by this user (limit 5)
      const { data: recentJobsData, error: recentJobsError } = await supabase
        .from('jobs')
        .select('*')
        .eq('created_by', profile.user_id)
        .order('created_at', { ascending: false })
        .limit(5);

      if (recentJobsError) throw recentJobsError;

      // Fetch total jobs count for this user
      const { data: jobCountData, error: jobCountError } = await supabase
        .from('jobs')
        .select('id')
        .eq('created_by', profile.user_id);

      if (jobCountError) throw jobCountError;

      // Get campaign IDs for this user to filter metrics
      const userCampaignIds = campaignCountData?.map(c => c.id) || [];
      
      // Fetch metrics only for user's campaigns
      let allMetrics: any[] = [];
      
      if (userCampaignIds.length > 0) {
        const { data: metricsData } = await supabase
          .from('metrics')
          .select('spend, impressions, clicks, leads')
          .in('campaign_id', userCampaignIds);

        const { data: campaignMetricsData } = await supabase
          .from('campaign_metrics')
          .select('spend, impressions, clicks, leads')
          .in('campaign_id', userCampaignIds);

        allMetrics = [...(metricsData || []), ...(campaignMetricsData || [])];
      }
      
      // Calculate performance metrics
      const totalSpend = allMetrics.reduce((sum, metric) => sum + (Number(metric.spend) || 0), 0);
      const totalImpressions = allMetrics.reduce((sum, metric) => sum + (metric.impressions || 0), 0);
      const totalClicks = allMetrics.reduce((sum, metric) => sum + (metric.clicks || 0), 0);
      const totalLeads = allMetrics.reduce((sum, metric) => sum + (metric.leads || 0), 0);

      // Calculate budget and campaign totals
      const totalCampaigns = campaignCountData?.length || 0;
      const activeCampaigns = campaignCountData?.filter(c => 
        c.status === 'active' || c.status === 'ACTIVE'
      ).length || 0;
      const totalBudget = campaignCountData?.reduce((sum, campaign) => sum + (Number(campaign.budget) || 0), 0) || 0;
      const totalJobs = jobCountData?.length || 0;

      setStats({
        totalCampaigns,
        activeCampaigns,
        totalJobs,
        totalBudget,
        totalSpend,
        totalImpressions,
        totalClicks,
        totalLeads,
      });

      setCampaigns(recentCampaignsData || []);
      setJobs(recentJobsData || []);
    } catch (error: any) {
      console.error('Error fetching dashboard data:', error);
      toast({
        title: "Error loading dashboard",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-success text-success-foreground';
      case 'paused':
        return 'bg-warning text-warning-foreground';
      case 'draft':
        return 'bg-secondary text-secondary-foreground';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Overview of your marketing campaigns and performance
          </p>
        </div>
        <div className="flex gap-3">
          <Button asChild>
            <Link to="/campaigns/create">
              <Plus className="mr-2 h-4 w-4" />
              New Campaign
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Campaigns</CardTitle>
            <Target className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCampaigns}</div>
            <p className="text-xs text-muted-foreground">
              {stats.activeCampaigns} active
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-success/10 to-success/5 border-success/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Budget vs Spend</CardTitle>
            <DollarSign className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              <div className="text-2xl font-bold">
                ${stats.totalBudget.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">
                Budget • ${stats.totalSpend.toFixed(2)} spent
              </p>
              <div className="w-full bg-muted rounded-full h-2">
                <div 
                  className="bg-success h-2 rounded-full transition-all" 
                  style={{ 
                    width: stats.totalBudget > 0 
                      ? `${Math.min((stats.totalSpend / stats.totalBudget) * 100, 100)}%` 
                      : '0%' 
                  }}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-accent/10 to-accent/5 border-accent/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Impressions</CardTitle>
            <Eye className="h-4 w-4 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.totalImpressions > 0 ? stats.totalImpressions.toLocaleString() : '0'}
            </div>
            <p className="text-xs text-muted-foreground">
              {stats.totalClicks > 0 ? `${stats.totalClicks} clicks` : 'No impression data yet'}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-warning/10 to-warning/5 border-warning/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Leads</CardTitle>
            <Users className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalLeads}</div>
            <p className="text-xs text-muted-foreground">
              {stats.totalLeads > 0 ? 'Total generated' : 'No leads data yet'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Meta Campaigns Dashboard */}
      <MetaCampaignsDashboard refreshTrigger={refreshTrigger} />

      {/* Recent Activity */}
      <div className="grid gap-8 lg:grid-cols-2">
        {/* Recent Campaigns */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Recent Campaigns
            </CardTitle>
            <CardDescription>
              Your latest campaign activity
            </CardDescription>
          </CardHeader>
          <CardContent>
            {campaigns.length > 0 ? (
              <div className="space-y-4">
                {campaigns.map((campaign) => (
                  <div key={campaign.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <div className="space-y-1">
                      <h4 className="font-medium">{campaign.name}</h4>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className={getStatusColor(campaign.status)}>
                          {campaign.status}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          {campaign.objective}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">${campaign.budget}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(campaign.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
                <Button variant="outline" className="w-full" asChild>
                  <Link to="/campaigns">View All Campaigns</Link>
                </Button>
              </div>
            ) : (
              <div className="text-center py-8">
                <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-4">No campaigns yet</p>
                <Button asChild>
                  <Link to="/campaigns/create">Create First Campaign</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Jobs */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Briefcase className="h-5 w-5" />
              Recent Jobs
            </CardTitle>
            <CardDescription>
              Latest job synchronization activity
            </CardDescription>
          </CardHeader>
          <CardContent>
            {jobs.length > 0 ? (
              <div className="space-y-4">
                {jobs.map((job) => (
                  <div key={job.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <div className="space-y-1">
                      <h4 className="font-medium">{job.title}</h4>
                      <Badge variant="outline" className={getStatusColor(job.status)}>
                        {job.status}
                      </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {new Date(job.created_at).toLocaleDateString()}
                    </div>
                  </div>
                ))}
                <Button variant="outline" className="w-full" asChild>
                  <Link to="/jobs">View All Jobs</Link>
                </Button>
              </div>
            ) : (
              <div className="text-center py-8">
                <Briefcase className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-4">No jobs synchronized yet</p>
                <Button variant="outline" asChild>
                  <Link to="/settings">Setup Integrations</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
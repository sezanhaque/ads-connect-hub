import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { subDays } from "date-fns";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { UnifiedCampaignsDashboard, CampaignAggregates } from "@/components/UnifiedCampaignsDashboard";
import { DateRange } from "@/components/DateRangeFilter";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useMetaIntegrationStatus } from "@/hooks/useMetaIntegrationStatus";
import { useTikTokIntegrationStatus } from "@/hooks/useTikTokIntegrationStatus";
import { posthog } from "@/lib/posthog";
import { Plus, Target, Briefcase, Euro, Eye, Users } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
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
interface Job {
  id: string;
  external_id: string | null;
  title: string;
  description: string | null;
  status: string;
  company_name: string | null;
  location: string | null;
  created_at: string;
}
const Dashboard = () => {
  const { profile } = useAuth();
  const { toast } = useToast();
  const { integration, isConnected } = useMetaIntegrationStatus();
  const { integration: tiktokIntegration, isConnected: isTikTokConnected } = useTikTokIntegrationStatus();
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [dateRange, setDateRange] = useState<DateRange>({
    from: subDays(new Date(), 7),
    to: new Date(),
  });
  const [campaignAggregates, setCampaignAggregates] = useState<CampaignAggregates>({
    totalSpend: 0,
    totalImpressions: 0,
    totalClicks: 0,
    totalCampaigns: 0,
    activeCampaigns: 0,
  });
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

  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    // Don't fetch if profile isn't ready yet
    if (!profile?.user_id) {
      return;
    }

    posthog.capture("dashboard_viewed");
    fetchDashboardData();
    autoSyncMetaCampaigns();
    autoSyncTikTokCampaigns();
    // Trigger refresh for campaign dashboards
    setRefreshTrigger((prev) => prev + 1);
  }, [profile?.user_id]);
  const autoSyncMetaCampaigns = async () => {
    if (!isConnected || !integration) return;
    try {
      console.log("Auto-syncing Meta campaigns for user...");
      console.log("Using integration:", integration);

      // Get user's organization ID from their membership
      const { data: memberships, error: membershipError } = await supabase
        .from("members")
        .select("org_id, role")
        .eq("user_id", profile?.user_id)
        .order("role", {
          ascending: true,
        }); // alphabetical, we'll select explicitly

      if (membershipError) {
        console.error("Error fetching user memberships:", membershipError);
        return;
      }
      if (!memberships || memberships.length === 0) {
        console.error("No organization found for user");
        return;
      }
      const primaryOrg =
        memberships.find((m: any) => m.role === "owner") ||
        memberships.find((m: any) => m.role === "admin") ||
        memberships.find((m: any) => m.role === "member") ||
        memberships[0];
      const userOrgId = primaryOrg.org_id;
      console.log("Using organization ID:", userOrgId);

      // Auto-sync using stored credentials for current user's organization
      const { data, error } = await supabase.functions.invoke("meta-sync", {
        body: {
          org_id: userOrgId,
          save_connection: false, // Don't overwrite existing connection
        },
      });
      if (error) {
        console.error("Auto-sync error:", error);
        return;
      }
      if (data?.success) {
        console.log("Auto-sync successful:", data.synced_count, "campaigns updated");
        // Refresh dashboard after sync
        setRefreshTrigger((prev) => prev + 1);
        fetchDashboardData(); // Also refresh the main dashboard data
      }
    } catch (error) {
      console.error("Auto-sync failed:", error);
    }
  };
  const autoSyncTikTokCampaigns = async () => {
    if (!isTikTokConnected || !tiktokIntegration) return;
    try {
      console.log("Auto-syncing TikTok campaigns for user...");
      console.log("Using integration:", tiktokIntegration);

      // Get user's organization ID from their membership
      const { data: memberships, error: membershipError } = await supabase
        .from("members")
        .select("org_id, role")
        .eq("user_id", profile?.user_id)
        .order("role", {
          ascending: true,
        });

      if (membershipError) {
        console.error("Error fetching user memberships:", membershipError);
        return;
      }
      if (!memberships || memberships.length === 0) {
        console.error("No organization found for user");
        return;
      }
      const primaryOrg =
        memberships.find((m: any) => m.role === "owner") ||
        memberships.find((m: any) => m.role === "admin") ||
        memberships.find((m: any) => m.role === "member") ||
        memberships[0];
      const userOrgId = primaryOrg.org_id;
      console.log("Using organization ID:", userOrgId);

      // Auto-sync using stored credentials
      const { data, error } = await supabase.functions.invoke("tiktok-sync", {
        body: {
          org_id: userOrgId,
          save_connection: false,
        },
      });
      if (error) {
        console.error("TikTok auto-sync error:", error);
        return;
      }
      if (data?.success) {
        console.log("TikTok auto-sync successful:", data.synced_count, "campaigns updated");
        setRefreshTrigger((prev) => prev + 1);
        fetchDashboardData();
      }
    } catch (error) {
      console.error("TikTok auto-sync failed:", error);
    }
  };
  const fetchDashboardData = async () => {
    if (!profile?.user_id) return;
    try {
      // Fetch recent jobs created by this user (limit 5)
      const { data: recentJobsData, error: recentJobsError } = await supabase
        .from("jobs")
        .select("*")
        .eq("created_by", profile.user_id)
        .order("created_at", {
          ascending: false,
        })
        .limit(5);
      if (recentJobsError) throw recentJobsError;

      // Fetch total jobs count for this user
      const { data: jobCountData, error: jobCountError } = await supabase
        .from("jobs")
        .select("id")
        .eq("created_by", profile.user_id);
      if (jobCountError) throw jobCountError;

      const totalJobs = jobCountData?.length || 0;
      setStats((prev) => ({
        ...prev,
        totalJobs,
      }));
      setJobs(recentJobsData || []);
    } catch (error: any) {
      console.error("Error fetching dashboard data:", error);
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
      case "active":
      case "open":
        return "bg-green-100 text-green-800 border-green-200";
      case "paused":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "closed":
        return "bg-red-100 text-red-800 border-red-200";
      case "draft":
        return "bg-gray-100 text-gray-800 border-gray-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Overview of your marketing campaigns and performance</p>
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
            <div className="text-2xl font-bold">{campaignAggregates.totalCampaigns}</div>
            <p className="text-xs text-muted-foreground">{campaignAggregates.activeCampaigns} active</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-secondary/10 to-secondary/5 border-secondary/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Spend</CardTitle>
            <Euro className="h-4 w-4 text-secondary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              €
              {campaignAggregates.totalSpend.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </div>
            <p className="text-xs text-muted-foreground">In selected period</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-success/10 to-success/5 border-success/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Impressions</CardTitle>
            <Eye className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{campaignAggregates.totalImpressions.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {campaignAggregates.totalClicks > 0
                ? `${campaignAggregates.totalClicks.toLocaleString()} clicks`
                : "No clicks yet"}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-warning/10 to-warning/5 border-warning/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">CTR</CardTitle>
            <Users className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {campaignAggregates.totalImpressions > 0
                ? ((campaignAggregates.totalClicks / campaignAggregates.totalImpressions) * 100).toFixed(2)
                : "0.00"}
              %
            </div>
            <p className="text-xs text-muted-foreground">Click-through rate</p>
          </CardContent>
        </Card>
      </div>

      {/* Unified Campaigns Dashboard */}
      <UnifiedCampaignsDashboard
        refreshTrigger={refreshTrigger}
        dateRange={dateRange}
        onDateRangeChange={setDateRange}
        onAggregatesChange={setCampaignAggregates}
      />

      {/* Recent Jobs */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="h-5 w-5" />
                Recent Jobs
              </CardTitle>
              <CardDescription>Latest job activity</CardDescription>
            </div>
            <Button variant="outline" asChild>
              <Link to="/jobs">View All Jobs</Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="text-center py-12">
              <div className="text-muted-foreground">Loading jobs...</div>
            </div>
          ) : jobs.length === 0 ? (
            <div className="text-center py-12">
              <Briefcase className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-4">No jobs added yet</p>
              <Button asChild>
                <Link to="/jobs/create">Add a new Job</Link>
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Job ID</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {jobs.map((job) => (
                  <TableRow key={job.id}>
                    <TableCell className="font-medium">{job.external_id || "-"}</TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{job.title}</div>
                        {job.description && (
                          <div className="text-sm text-muted-foreground truncate max-w-xs">{job.description}</div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{job.company_name || "-"}</TableCell>
                    <TableCell>{job.location || "-"}</TableCell>
                    <TableCell>
                      <Badge variant="secondary" className={getStatusColor(job.status)}>
                        {job.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{new Date(job.created_at).toLocaleDateString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
export default Dashboard;

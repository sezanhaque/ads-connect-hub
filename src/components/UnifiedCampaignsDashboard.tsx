import { useEffect, useState, useCallback } from "react";
import { subDays } from "date-fns";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useMetaIntegrationStatus } from "@/hooks/useMetaIntegrationStatus";
import { useTikTokIntegrationStatus } from "@/hooks/useTikTokIntegrationStatus";
import { useToast } from "@/hooks/use-toast";
import { DateRangeFilter, DateRange } from "@/components/DateRangeFilter";
import { TrendingUp, Eye, MousePointer, DollarSign, RefreshCw, Link as LinkIcon } from "lucide-react";

type Platform = "all" | "meta" | "tiktok";

interface UnifiedCampaign {
  id: string;
  name: string;
  status: string;
  objective: string;
  impressions: number;
  clicks: number;
  ctr: number;
  spend: number;
  cpc: number;
  platform: "meta" | "tiktok";
}

interface UnifiedCampaignsDashboardProps {
  refreshTrigger?: number;
}

export const UnifiedCampaignsDashboard = ({ refreshTrigger }: UnifiedCampaignsDashboardProps) => {
  const [campaigns, setCampaigns] = useState<UnifiedCampaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);
  const [platformFilter, setPlatformFilter] = useState<Platform>("all");
  const [dateRange, setDateRange] = useState<DateRange>({
    from: subDays(new Date(), 7),
    to: new Date(),
  });
  const { user } = useAuth();
  const { integration: metaIntegration, isConnected: isMetaConnected, loading: metaLoading } = useMetaIntegrationStatus();
  const { integration: tiktokIntegration, isConnected: isTikTokConnected, loading: tiktokLoading } = useTikTokIntegrationStatus();
  const { toast } = useToast();

  // Wait for integration status to be determined before fetching campaigns
  const integrationsLoading = metaLoading || tiktokLoading;

  const fetchCampaigns = useCallback(
    async (dateFilter?: DateRange) => {
      // Don't fetch if integrations are still loading or no user
      if (integrationsLoading || !user) {
        return;
      }
      
      console.log("UnifiedCampaignsDashboard: Fetching campaigns...");
      setLoading(true);

      const currentDateRange = dateFilter || dateRange;
      const apiCampaigns: UnifiedCampaign[] = [];

      try {
        // Determine the user's primary organization
        const { data: memberships, error: membershipError } = await supabase
          .from("members")
          .select("org_id, role")
          .eq("user_id", user.id)
          .order("role", { ascending: true });

        if (membershipError || !memberships || memberships.length === 0) {
          console.log("No organizations found for user");
          setCampaigns([]);
          setLoading(false);
          return;
        }

        const primaryOrg =
          memberships.find((m: { role: string }) => m.role === "owner") ||
          memberships.find((m: { role: string }) => m.role === "admin") ||
          memberships.find((m: { role: string }) => m.role === "member") ||
          memberships[0];

        // Always fetch Supabase campaigns as fallback/base data
        const { data: supabaseCampaigns, error: supabaseError } = await supabase
          .from("campaigns")
          .select(`
            id,
            name,
            status,
            objective,
            platform,
            budget
          `)
          .eq("org_id", primaryOrg.org_id);

        // Fetch metrics for Supabase campaigns
        let supabaseCampaignsWithMetrics: UnifiedCampaign[] = [];
        if (!supabaseError && supabaseCampaigns && supabaseCampaigns.length > 0) {
          const campaignIds = supabaseCampaigns.map(c => c.id);
          
          // Fetch metrics from both tables
          const { data: metricsData } = await supabase
            .from("metrics")
            .select("campaign_id, impressions, clicks, spend, leads")
            .in("campaign_id", campaignIds);

          const { data: campaignMetricsData } = await supabase
            .from("campaign_metrics")
            .select("campaign_id, impressions, clicks, spend, leads")
            .in("campaign_id", campaignIds);

          // Aggregate metrics by campaign
          const allMetrics = [...(metricsData || []), ...(campaignMetricsData || [])];
          const metricsMap = new Map<string, { impressions: number; clicks: number; spend: number; leads: number }>();
          
          allMetrics.forEach(m => {
            const existing = metricsMap.get(m.campaign_id) || { impressions: 0, clicks: 0, spend: 0, leads: 0 };
            metricsMap.set(m.campaign_id, {
              impressions: existing.impressions + (m.impressions || 0),
              clicks: existing.clicks + (m.clicks || 0),
              spend: existing.spend + (Number(m.spend) || 0),
              leads: existing.leads + (m.leads || 0),
            });
          });

          supabaseCampaignsWithMetrics = supabaseCampaigns.map(c => {
            const metrics = metricsMap.get(c.id) || { impressions: 0, clicks: 0, spend: 0, leads: 0 };
            const platform = (c.platform === "tiktok" ? "tiktok" : "meta") as "meta" | "tiktok";
            return {
              id: c.id,
              name: c.name,
              status: c.status?.toLowerCase() || "unknown",
              objective: c.objective?.replace("OUTCOME_", "").replace("_", " ").toLowerCase() || "unknown",
              impressions: metrics.impressions,
              clicks: metrics.clicks,
              ctr: metrics.impressions > 0 ? (metrics.clicks / metrics.impressions) * 100 : 0,
              spend: metrics.spend,
              cpc: metrics.clicks > 0 ? metrics.spend / metrics.clicks : 0,
              platform,
            };
          });
        }

        // Calculate date range parameters
        const daysDiff = Math.ceil(
          (currentDateRange.to.getTime() - currentDateRange.from.getTime()) / (1000 * 60 * 60 * 24),
        );

        // Fetch Meta campaigns if connected
        if (isMetaConnected) {
          let metaDateRangeParam = "last_7d";
          if (daysDiff === 0) {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const filterDate = new Date(currentDateRange.from);
            filterDate.setHours(0, 0, 0, 0);
            if (filterDate.getTime() === today.getTime()) {
              metaDateRangeParam = "today";
            } else {
              const dateStr = currentDateRange.from.toISOString().split("T")[0];
              metaDateRangeParam = `${dateStr}|${dateStr}`;
            }
          } else if (daysDiff === 1) {
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            yesterday.setHours(0, 0, 0, 0);
            const filterDate = new Date(currentDateRange.from);
            filterDate.setHours(0, 0, 0, 0);
            if (filterDate.getTime() === yesterday.getTime()) {
              metaDateRangeParam = "yesterday";
            } else {
              const fromStr = currentDateRange.from.toISOString().split("T")[0];
              const toStr = currentDateRange.to.toISOString().split("T")[0];
              metaDateRangeParam = `${fromStr}|${toStr}`;
            }
          } else if (daysDiff === 7) {
            metaDateRangeParam = "last_7d";
          } else if (daysDiff === 14) {
            metaDateRangeParam = "last_14d";
          } else if (daysDiff === 30) {
            metaDateRangeParam = "last_30d";
          } else {
            const fromStr = currentDateRange.from.toISOString().split("T")[0];
            const toStr = currentDateRange.to.toISOString().split("T")[0];
            metaDateRangeParam = `${fromStr}|${toStr}`;
          }

          try {
            const { data: metaData, error: metaError } = await supabase.functions.invoke("meta-campaigns-live", {
              body: {
                org_id: primaryOrg.org_id,
                date_range: metaDateRangeParam,
              },
            });

            if (!metaError && metaData?.success && metaData.campaigns) {
              const metaCampaigns: UnifiedCampaign[] = metaData.campaigns.map((c: any) => ({
                id: c.id,
                name: c.name,
                status: c.status,
                objective: c.objective.replace("OUTCOME_", "").toLowerCase(),
                impressions: c.total_impressions || 0,
                clicks: c.total_clicks || 0,
                ctr: c.total_impressions > 0 ? (c.total_clicks / c.total_impressions) * 100 : 0,
                spend: c.total_spend || 0,
                cpc: c.total_clicks > 0 ? c.total_spend / c.total_clicks : 0,
                platform: "meta" as const,
              }));
              apiCampaigns.push(...metaCampaigns);
            }
          } catch (error) {
            console.error("Error fetching Meta campaigns:", error);
          }
        }

        // Fetch TikTok campaigns if connected
        if (isTikTokConnected) {
          let tiktokDateRangeParam = "last_7d";
          if (daysDiff <= 7) {
            tiktokDateRangeParam = "last_7d";
          } else if (daysDiff <= 30) {
            tiktokDateRangeParam = "last_30d";
          } else {
            tiktokDateRangeParam = "last_90d";
          }

          try {
            const { data: tiktokData, error: tiktokError } = await supabase.functions.invoke("tiktok-campaigns-live", {
              body: {
                org_id: primaryOrg.org_id,
                date_range: tiktokDateRangeParam,
              },
            });

            if (!tiktokError && tiktokData?.success && tiktokData.campaigns) {
              const tiktokCampaigns: UnifiedCampaign[] = tiktokData.campaigns.map((c: any) => ({
                id: c.id,
                name: c.name,
                status: c.status,
                objective: c.objective.replace("_", " ").toLowerCase(),
                impressions: c.impressions || 0,
                clicks: c.clicks || 0,
                ctr: c.ctr || 0,
                spend: c.spend || 0,
                cpc: c.cpc || 0,
                platform: "tiktok" as const,
              }));
              apiCampaigns.push(...tiktokCampaigns);
            }
          } catch (error) {
            console.error("Error fetching TikTok campaigns:", error);
          }
        }

        // Merge API campaigns with Supabase campaigns
        // API data takes priority when matching by name
        const apiCampaignNames = new Set(apiCampaigns.map(c => c.name.toLowerCase().trim()));
        
        // Filter out Supabase campaigns that have matching API campaigns (by name)
        const supabaseCampaignsToKeep = supabaseCampaignsWithMetrics.filter(
          c => !apiCampaignNames.has(c.name.toLowerCase().trim())
        );

        // Combine: API campaigns + unmatched Supabase campaigns
        const mergedCampaigns = [...apiCampaigns, ...supabaseCampaignsToKeep];

        setCampaigns(mergedCampaigns);
        console.log(`Fetched ${mergedCampaigns.length} total campaigns (${apiCampaigns.length} from API, ${supabaseCampaignsToKeep.length} from Supabase)`);
      } catch (error) {
        console.error("Error in fetchCampaigns:", error);
        toast({
          title: "Error fetching campaigns",
          description: "Failed to fetch campaign data",
          variant: "destructive",
        });
        setCampaigns([]);
      } finally {
        setLoading(false);
        setInitialLoadComplete(true);
      }
    },
    [user, isMetaConnected, isTikTokConnected, dateRange, toast, integrationsLoading],
  );

  useEffect(() => {
    // Only fetch when integrations have finished loading
    if (!integrationsLoading) {
      fetchCampaigns();
    }
  }, [fetchCampaigns, refreshTrigger, integrationsLoading]);

  const handleDateRangeChange = (newRange: DateRange) => {
    setDateRange(newRange);
  };

  const handleManualSync = async () => {
    if (syncing) return;
    setSyncing(true);

    try {
      const { data: memberships, error: membershipError } = await supabase
        .from("members")
        .select("org_id, role")
        .eq("user_id", user?.id)
        .order("role", { ascending: true });

      if (membershipError || !memberships || memberships.length === 0) {
        throw new Error("No organization found for user");
      }

      const primaryOrg =
        memberships.find((m: { role: string }) => m.role === "owner") ||
        memberships.find((m: { role: string }) => m.role === "admin") ||
        memberships.find((m: { role: string }) => m.role === "member") ||
        memberships[0];

      const userOrgId = primaryOrg.org_id;
      let syncedCount = 0;

      // Sync Meta if connected
      if (isMetaConnected && metaIntegration) {
        const { data: metaData, error: metaError } = await supabase.functions.invoke("meta-sync", {
          body: { org_id: userOrgId, save_connection: false },
        });
        if (!metaError && metaData?.success) {
          syncedCount += metaData.synced_count || 0;
        }
      }

      // Sync TikTok if connected
      if (isTikTokConnected && tiktokIntegration) {
        const { data: tiktokData, error: tiktokError } = await supabase.functions.invoke("tiktok-sync", {
          body: { org_id: userOrgId, save_connection: false },
        });
        if (!tiktokError && tiktokData?.success) {
          syncedCount += tiktokData.synced_count || 0;
        }
      }

      toast({
        title: "Sync successful!",
        description: `Synced ${syncedCount} campaigns`,
      });
      fetchCampaigns();
    } catch (error: unknown) {
      console.error("Manual sync error:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to sync campaigns";
      toast({
        title: "Sync failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setSyncing(false);
    }
  };

  const filteredCampaigns = campaigns.filter((campaign) => {
    if (platformFilter === "all") return true;
    return campaign.platform === platformFilter;
  });

  const getPlatformBadge = (platform: "meta" | "tiktok") => {
    if (platform === "meta") {
      return (
        <Badge variant="outline" className="bg-blue-500/10 text-blue-600 border-blue-500/30">
          Meta
        </Badge>
      );
    }
    return (
      <Badge variant="outline" className="bg-pink-500/10 text-pink-600 border-pink-500/30">
        TikTok
      </Badge>
    );
  };

  // Show loading state while integrations are loading OR while fetching campaigns (but only before initial load completes)
  const showLoading = integrationsLoading || loading || !initialLoadComplete;
  
  if (showLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>All Campaigns</CardTitle>
          <CardDescription>Loading your campaigns...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const hasAnyConnection = isMetaConnected || isTikTokConnected;

  if (campaigns.length === 0) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>All Campaigns</CardTitle>
              <CardDescription>No campaigns found</CardDescription>
            </div>
            {hasAnyConnection && (
              <Button variant="outline" size="sm" onClick={handleManualSync} disabled={syncing}>
                <RefreshCw className={`h-4 w-4 mr-2 ${syncing ? "animate-spin" : ""}`} />
                {syncing ? "Syncing..." : "Sync Now"}
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            {hasAnyConnection ? (
              <div className="space-y-4">
                <div className="flex items-center justify-center">
                  <LinkIcon className="h-12 w-12 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-muted-foreground mb-2">
                    {isMetaConnected && isTikTokConnected
                      ? "Meta and TikTok accounts connected but no campaigns found."
                      : isMetaConnected
                        ? "Meta account connected but no campaigns found."
                        : "TikTok account connected but no campaigns found."}
                  </p>
                  <p className="text-sm text-muted-foreground mb-4">
                    Click "Sync Now" to fetch your latest campaigns.
                  </p>
                  <Button onClick={handleManualSync} disabled={syncing}>
                    <RefreshCw className={`h-4 w-4 mr-2 ${syncing ? "animate-spin" : ""}`} />
                    {syncing ? "Syncing..." : "Sync Campaigns"}
                  </Button>
                </div>
              </div>
            ) : (
              <p className="text-muted-foreground">
                No campaigns found. Create a new campaign or connect your Meta/TikTok account to sync existing campaigns.
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
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            <CardTitle>All Campaigns</CardTitle>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Select value={platformFilter} onValueChange={(value: Platform) => setPlatformFilter(value)}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Filter platform" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Platforms</SelectItem>
                <SelectItem value="meta">Meta Only</SelectItem>
                <SelectItem value="tiktok">TikTok Only</SelectItem>
              </SelectContent>
            </Select>
            <DateRangeFilter value={dateRange} onChange={handleDateRangeChange} />
          </div>
        </div>
        <CardDescription>
          Your Meta and TikTok campaigns performance ({filteredCampaigns.length} campaigns)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Platform</TableHead>
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
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCampaigns.map((campaign) => (
                <TableRow key={`${campaign.platform}-${campaign.id}`}>
                  <TableCell>{getPlatformBadge(campaign.platform)}</TableCell>
                  <TableCell className="font-medium">{campaign.name}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        campaign.status === "active"
                          ? "default"
                          : campaign.status === "paused"
                            ? "secondary"
                            : campaign.status === "deleted"
                              ? "destructive"
                              : "outline"
                      }
                    >
                      {campaign.status.toUpperCase()}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-muted-foreground">{campaign.objective}</span>
                  </TableCell>
                  <TableCell className="text-right">{campaign.impressions.toLocaleString()}</TableCell>
                  <TableCell className="text-right">{campaign.clicks.toLocaleString()}</TableCell>
                  <TableCell className="text-right">{campaign.ctr.toFixed(2)}%</TableCell>
                  <TableCell className="text-right">€{campaign.spend.toFixed(2)}</TableCell>
                  <TableCell className="text-right">€{campaign.cpc.toFixed(2)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

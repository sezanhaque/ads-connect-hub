import { useEffect, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { useMetaIntegrationStatus } from '@/hooks/useMetaIntegrationStatus';
import { useTikTokIntegrationStatus } from '@/hooks/useTikTokIntegrationStatus';
import { Plus, Search, Target, DollarSign, Calendar, Filter, RefreshCw } from 'lucide-react';
import metaLogo from "@/assets/meta-logo.png";
import tiktokLogo from "@/assets/tiktok-logo.png";

interface Campaign {
  id: string;
  name: string;
  status: string;
  objective: string;
  budget: number;
  start_date: string | null;
  end_date: string | null;
  created_at: string;
  platform: string | null;
}

const Campaigns = () => {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [platformFilter, setPlatformFilter] = useState('all');
  
  const { integration: metaIntegration, isConnected: isMetaConnected } = useMetaIntegrationStatus();
  const { integration: tiktokIntegration, isConnected: isTikTokConnected } = useTikTokIntegrationStatus();
  useEffect(() => {
    if (profile?.user_id) {
      fetchCampaigns();
    }
  }, [profile?.user_id]);

  const fetchCampaigns = async () => {
    if (!profile?.user_id) return;

    try {
      // Get user's primary organization (prioritize their own org over admin orgs)
      const { data: memberships, error: membershipsError } = await supabase
        .from('members')
        .select('org_id, role')
        .eq('user_id', profile.user_id);

      if (membershipsError) throw membershipsError;

      // Find user's primary org (prefer owner/admin roles over member)
      const primaryOrg = (() => {
        if (!memberships || memberships.length === 0) return null;
        return (
          memberships.find((m: any) => m.role === 'owner') ||
          memberships.find((m: any) => m.role === 'admin') ||
          memberships.find((m: any) => m.role === 'member') ||
          memberships[0]
        );
      })();

      if (!primaryOrg?.org_id) {
        setCampaigns([]);
        setLoading(false);
        return;
      }

      const allCampaigns: Campaign[] = [];

      // Fetch from Meta API if connected
      if (isMetaConnected) {
        try {
          const { data: metaData, error: metaError } = await supabase.functions.invoke(
            'meta-campaigns-live',
            {
              body: { 
                org_id: primaryOrg.org_id,
                date_range: 'maximum'
              }
            }
          );

          if (!metaError && metaData?.campaigns) {
            allCampaigns.push(...metaData.campaigns);
          }
        } catch (error) {
          console.error('Error fetching Meta campaigns:', error);
        }
      }

      // Fetch from TikTok API if connected
      if (isTikTokConnected) {
        try {
          const { data: tiktokData, error: tiktokError } = await supabase.functions.invoke(
            'tiktok-campaigns-live',
            {
              body: { 
                org_id: primaryOrg.org_id,
                date_range: 'maximum'
              }
            }
          );

          if (!tiktokError && tiktokData?.campaigns) {
            allCampaigns.push(...tiktokData.campaigns);
          }
        } catch (error) {
          console.error('Error fetching TikTok campaigns:', error);
        }
      }

      // Fetch campaigns from Supabase
      const { data: supabaseCampaigns, error } = await supabase
        .from('campaigns')
        .select('*')
        .eq('org_id', primaryOrg.org_id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Merge: Add Supabase campaigns that don't exist in API results
      if (supabaseCampaigns) {
        supabaseCampaigns.forEach((dbCampaign) => {
          const existsInApi = allCampaigns.some(
            (apiCampaign) => apiCampaign.name === dbCampaign.name
          );
          if (!existsInApi) {
            allCampaigns.push(dbCampaign);
          }
        });
      }

      setCampaigns(allCampaigns);
    } catch (error: any) {
      console.error('Error fetching campaigns:', error);
      toast({
        title: "Error loading campaigns",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleManualSync = async () => {
    setSyncing(true);
    await fetchCampaigns();
    setSyncing(false);
    toast({ title: "Campaigns synced successfully" });
  };


  const handlePauseCampaign = async (campaignId: string) => {
    try {
      const { error } = await supabase
        .from('campaigns')
        .update({ status: 'paused' })
        .eq('id', campaignId);

      if (error) throw error;

      toast({ title: "Campaign paused successfully" });
      fetchCampaigns();
    } catch (error: any) {
      console.error('Error pausing campaign:', error);
      toast({
        title: "Error pausing campaign",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleResumeCampaign = async (campaignId: string) => {
    try {
      const { error } = await supabase
        .from('campaigns')
        .update({ status: 'active' })
        .eq('id', campaignId);

      if (error) throw error;

      toast({ title: "Campaign resumed successfully" });
      fetchCampaigns();
    } catch (error: any) {
      console.error('Error resuming campaign:', error);
      toast({
        title: "Error resuming campaign",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const isUUID = (value: string) =>
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);

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

  const filteredCampaigns = campaigns.filter(campaign => {
    const matchesSearch = campaign.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || campaign.status === statusFilter;
    const matchesPlatform = platformFilter === 'all' || campaign.platform === platformFilter;
    return matchesSearch && matchesStatus && matchesPlatform;
  });

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Campaigns</h1>
            <p className="text-muted-foreground">Loading campaigns...</p>
          </div>
        </div>
        <div className="grid gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-muted rounded w-1/3 mb-2"></div>
                <div className="h-3 bg-muted rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Campaigns</h1>
          <p className="text-muted-foreground">
            Manage your marketing campaigns and track performance
          </p>
        </div>
        <div className="flex gap-2">
          {(isMetaConnected || isTikTokConnected) && (
            <Button 
              variant="outline" 
              onClick={handleManualSync}
              disabled={syncing}
            >
              <RefreshCw className={`mr-2 h-4 w-4 ${syncing ? 'animate-spin' : ''}`} />
              Sync
            </Button>
          )}
          <Button asChild>
            <Link to="/campaigns/create">
              <Plus className="mr-2 h-4 w-4" />
              New Campaign
            </Link>
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search campaigns..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={platformFilter} onValueChange={setPlatformFilter}>
              <SelectTrigger className="w-36">
                <SelectValue placeholder="Platform" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Platforms</SelectItem>
                <SelectItem value="meta">Meta</SelectItem>
                <SelectItem value="tiktok">TikTok</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-36">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="paused">Paused</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Campaigns List */}
      {filteredCampaigns.length > 0 ? (
        <div className="grid gap-4">
          {filteredCampaigns.map((campaign) => (
            <Card key={campaign.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      {campaign.platform && (
                        <img 
                          src={campaign.platform === 'meta' ? metaLogo : tiktokLogo} 
                          alt={campaign.platform} 
                          className="h-6 w-6 object-contain"
                        />
                      )}
                      <h3 className="text-lg font-semibold">{campaign.name}</h3>
                      <Badge className={getStatusColor(campaign.status)}>
                        {campaign.status}
                      </Badge>
                      {campaign.platform && (
                        <Badge variant="outline">
                          {campaign.platform === 'meta' ? 'Meta' : 'TikTok'}
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-6 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Target className="h-4 w-4" />
                        <span>{campaign.objective}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <DollarSign className="h-4 w-4" />
                        <span>€{campaign.budget}</span>
                      </div>
                      {campaign.start_date && (
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          <span>
                            {new Date(campaign.start_date).toLocaleDateString()}
                            {campaign.end_date && 
                              ` - ${new Date(campaign.end_date).toLocaleDateString()}`
                            }
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {isUUID(campaign.id) && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        asChild
                      >
                        <Link to={`/campaigns/${campaign.id}`}>
                          View Details
                        </Link>
                      </Button>
                    )}
                    {campaign.status === 'active' && (
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handlePauseCampaign(campaign.id)}
                      >
                        Pause
                      </Button>
                    )}
                    {campaign.status === 'paused' && (
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleResumeCampaign(campaign.id)}
                      >
                        Resume
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12">
            <div className="text-center space-y-4">
              <Target className="h-12 w-12 text-muted-foreground mx-auto" />
              <div>
                <h3 className="text-lg font-semibold">
                  {searchTerm || statusFilter !== 'all' 
                    ? 'No campaigns match your filters' 
                    : 'No campaigns yet'
                  }
                </h3>
                <p className="text-muted-foreground">
                  {searchTerm || statusFilter !== 'all'
                    ? 'Try adjusting your search or filters to find campaigns.'
                    : 'Create your first campaign to get started with your marketing efforts.'
                  }
                </p>
              </div>
              {!searchTerm && statusFilter === 'all' && (
                <Button asChild>
                  <Link to="/campaigns/create">
                    <Plus className="mr-2 h-4 w-4" />
                    Create First Campaign
                  </Link>
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Campaigns;
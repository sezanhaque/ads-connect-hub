import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Target, DollarSign, Calendar, MapPin, Users, Type, MousePointer } from 'lucide-react';

interface Campaign {
  id: string;
  name: string;
  status: string;
  objective: string;
  budget: number;
  start_date: string | null;
  end_date: string | null;
  location_targeting: any;
  audience_targeting: any;
  ad_copy: string | null;
  cta_button: string | null;
  created_at: string;
  created_by: string;
}

const CampaignDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchCampaign();
    }
  }, [id]);

  const fetchCampaign = async () => {
    try {
      const { data, error } = await supabase
        .from('campaigns')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;

      setCampaign(data);
    } catch (error: any) {
      console.error('Error fetching campaign:', error);
      toast({
        title: "Error loading campaign",
        description: error.message,
        variant: "destructive",
      });
      navigate('/campaigns');
    } finally {
      setLoading(false);
    }
  };

  const handlePauseCampaign = async () => {
    try {
      const { error } = await supabase
        .from('campaigns')
        .update({ status: 'paused' })
        .eq('id', id);

      if (error) throw error;

      toast({ title: "Campaign paused successfully" });
      fetchCampaign();
    } catch (error: any) {
      console.error('Error pausing campaign:', error);
      toast({
        title: "Error pausing campaign",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleResumeCampaign = async () => {
    try {
      const { error } = await supabase
        .from('campaigns')
        .update({ status: 'active' })
        .eq('id', id);

      if (error) throw error;

      toast({ title: "Campaign resumed successfully" });
      fetchCampaign();
    } catch (error: any) {
      console.error('Error resuming campaign:', error);
      toast({
        title: "Error resuming campaign",
        description: error.message,
        variant: "destructive",
      });
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

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate('/campaigns')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Campaigns
          </Button>
          <div>
            <div className="h-8 bg-muted rounded w-48 mb-2 animate-pulse"></div>
            <div className="h-4 bg-muted rounded w-32 animate-pulse"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate('/campaigns')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Campaigns
          </Button>
        </div>
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <h3 className="text-lg font-semibold">Campaign not found</h3>
              <p className="text-muted-foreground">The campaign you're looking for doesn't exist.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate('/campaigns')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Campaigns
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold tracking-tight">{campaign.name}</h1>
              <Badge className={getStatusColor(campaign.status)}>
                {campaign.status}
              </Badge>
            </div>
            <p className="text-muted-foreground">
              Created on {new Date(campaign.created_at).toLocaleDateString()}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {campaign.status === 'active' && (
            <Button 
              variant="outline"
              onClick={() => handlePauseCampaign()}
            >
              Pause Campaign
            </Button>
          )}
          {campaign.status === 'paused' && (
            <Button 
              variant="outline"
              onClick={() => handleResumeCampaign()}
            >
              Resume Campaign
            </Button>
          )}
        </div>
      </div>

      {/* Campaign Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm font-medium">Objective</p>
                <p className="text-2xl font-bold capitalize">{campaign.objective}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm font-medium">Budget</p>
                <p className="text-2xl font-bold">${campaign.budget}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm font-medium">Duration</p>
                <p className="text-sm">
                  {campaign.start_date && campaign.end_date ? (
                    <>
                      {new Date(campaign.start_date).toLocaleDateString()} - {new Date(campaign.end_date).toLocaleDateString()}
                    </>
                  ) : (
                    'Not scheduled'
                  )}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Campaign Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Targeting */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Location Targeting
            </CardTitle>
          </CardHeader>
          <CardContent>
            {campaign.location_targeting?.locations?.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {campaign.location_targeting.locations.map((location: string, index: number) => (
                  <Badge key={index} variant="secondary">{location}</Badge>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">No locations specified</p>
            )}
          </CardContent>
        </Card>

        {/* Audience */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Audience Targeting
            </CardTitle>
          </CardHeader>
          <CardContent>
            {campaign.audience_targeting ? (
              <div className="space-y-2">
                <Badge variant="outline" className="mb-2">
                  {campaign.audience_targeting.type === 'interests' ? 'Interest-based' : 'Free-text'}
                </Badge>
                <p className="text-sm">{campaign.audience_targeting.data}</p>
              </div>
            ) : (
              <p className="text-muted-foreground">No audience targeting specified</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Creative Content */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Ad Copy */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Type className="h-5 w-5" />
              Ad Copy
            </CardTitle>
          </CardHeader>
          <CardContent>
            {campaign.ad_copy ? (
              <p className="text-sm whitespace-pre-wrap">{campaign.ad_copy}</p>
            ) : (
              <p className="text-muted-foreground">No ad copy specified</p>
            )}
          </CardContent>
        </Card>

        {/* CTA Button */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MousePointer className="h-5 w-5" />
              Call-to-Action
            </CardTitle>
          </CardHeader>
          <CardContent>
            {campaign.cta_button ? (
              <Badge className="text-base px-4 py-2">{campaign.cta_button}</Badge>
            ) : (
              <p className="text-muted-foreground">No CTA button specified</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CampaignDetails;
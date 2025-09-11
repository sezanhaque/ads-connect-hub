import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { 
  Settings as SettingsIcon,
  User,
  Building,
  Plug,
  Sheet,
  Facebook,
  Check,
  X,
  AlertCircle
} from 'lucide-react';

interface Integration {
  id: string;
  integration_type: string;
  is_active: boolean;
  config: any;
  created_at: string;
}

const Settings = () => {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState({
    first_name: '',
    last_name: '',
    email: '',
  });

  useEffect(() => {
    if (profile) {
      setProfileData({
        first_name: profile.first_name || '',
        last_name: profile.last_name || '',
        email: profile.email || '',
      });
    }
    fetchIntegrations();
  }, [profile]);

  const fetchIntegrations = async () => {
    try {
      const { data, error } = await supabase
        .from('integrations')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setIntegrations(data || []);
    } catch (error: any) {
      console.error('Error fetching integrations:', error);
      toast({
        title: "Error loading integrations",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile?.user_id) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          first_name: profileData.first_name,
          last_name: profileData.last_name,
          email: profileData.email,
        })
        .eq('user_id', profile.user_id);

      if (error) throw error;

      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully.",
      });
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast({
        title: "Error updating profile",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const getIntegrationStatus = (integrationType: string) => {
    const integration = integrations.find(i => i.integration_type === integrationType);
    return integration?.is_active || false;
  };

  const getIntegrationIcon = (type: string) => {
    switch (type) {
      case 'google_sheets':
        return Sheet;
      case 'meta_ads':
        return Facebook;
      default:
        return Plug;
    }
  };

  const getIntegrationName = (type: string) => {
    switch (type) {
      case 'google_sheets':
        return 'Google Sheets';
      case 'meta_ads':
        return 'Meta Ads';
      default:
        return type;
    }
  };

  const integrationTypes = ['google_sheets', 'meta_ads'];

  return (
    <div className="space-y-8 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Manage your profile, organization, and integrations
        </p>
      </div>

      {/* Profile Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Profile Settings
          </CardTitle>
          <CardDescription>
            Update your personal information and preferences
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleProfileUpdate} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="first_name">First Name</Label>
                <Input
                  id="first_name"
                  value={profileData.first_name}
                  onChange={(e) => setProfileData(prev => ({ ...prev, first_name: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="last_name">Last Name</Label>
                <Input
                  id="last_name"
                  value={profileData.last_name}
                  onChange={(e) => setProfileData(prev => ({ ...prev, last_name: e.target.value }))}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={profileData.email}
                onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
              />
            </div>
            <Button type="submit">Update Profile</Button>
          </form>
        </CardContent>
      </Card>

      {/* Organization Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="h-5 w-5" />
            Organization
          </CardTitle>
          <CardDescription>
            Organization information and settings
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium">Role</Label>
              <div className="mt-1">
                <Badge variant="secondary">{profile?.role}</Badge>
              </div>
            </div>
            <div>
              <Label className="text-sm font-medium">Organization ID</Label>
              <p className="text-sm text-muted-foreground mt-1">{profile?.organization_id}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Integrations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plug className="h-5 w-5" />
            Integrations
          </CardTitle>
          <CardDescription>
            Connect external services to sync your data
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {integrationTypes.map((integrationType) => {
              const isActive = getIntegrationStatus(integrationType);
              const Icon = getIntegrationIcon(integrationType);
              const name = getIntegrationName(integrationType);

              return (
                <div key={integrationType} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className={`p-2 rounded-lg ${
                      isActive ? 'bg-success/10' : 'bg-muted'
                    }`}>
                      <Icon className={`h-5 w-5 ${
                        isActive ? 'text-success' : 'text-muted-foreground'
                      }`} />
                    </div>
                    <div>
                      <h4 className="font-medium">{name}</h4>
                      <p className="text-sm text-muted-foreground">
                        {integrationType === 'google_sheets' 
                          ? 'Sync job data from your Google Sheets'
                          : 'Pull campaign performance from Meta Ads'
                        }
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {isActive ? (
                      <Badge className="bg-success text-success-foreground">
                        <Check className="h-3 w-3 mr-1" />
                        Connected
                      </Badge>
                    ) : (
                      <Badge variant="secondary">
                        <X className="h-3 w-3 mr-1" />
                        Not Connected
                      </Badge>
                    )}
                    <Button 
                      variant={isActive ? "outline" : "default"}
                      size="sm"
                    >
                      {isActive ? 'Configure' : 'Connect'}
                    </Button>
                  </div>
                </div>
              );
            })}

            <Separator />

            <div className="flex items-start gap-3 p-4 bg-muted/50 rounded-lg">
              <AlertCircle className="h-5 w-5 text-warning mt-0.5" />
              <div className="space-y-1">
                <p className="text-sm font-medium">Integration Setup Required</p>
                <p className="text-sm text-muted-foreground">
                  To use Google Sheets and Meta Ads integrations, you'll need to configure API credentials. 
                  Contact your administrator or check the documentation for setup instructions.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Settings;
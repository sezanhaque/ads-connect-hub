import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { 
  User,
  Building,
  ArrowRight,
  Settings as SettingsIcon
} from 'lucide-react';

const Settings = () => {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [profileData, setProfileData] = useState({
    first_name: '',
    last_name: '',
    email: '',
  });
  const [organizationData, setOrganizationData] = useState({
    name: '',
    role: '',
    id: '',
  });

  useEffect(() => {
    if (profile) {
      setProfileData({
        first_name: profile.first_name || '',
        last_name: profile.last_name || '',
        email: profile.email || '',
      });
      
      // Fetch organization information
      fetchOrganizationInfo();
    }
  }, [profile]);

  const fetchOrganizationInfo = async () => {
    if (!profile?.user_id) return;

    try {
      const { data: memberData, error } = await supabase
        .from('members')
        .select(`
          role,
          org_id,
          organizations (
            id,
            name
          )
        `)
        .eq('user_id', profile.user_id)
        .maybeSingle();

      if (error) {
        console.error('Error fetching organization:', error);
        return;
      }

      if (memberData?.organizations) {
        setOrganizationData({
          name: (memberData.organizations as any).name || '',
          role: memberData.role || '',
          id: (memberData.organizations as any).id || '',
        });
      }
    } catch (error) {
      console.error('Error fetching organization info:', error);
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-primary/10">
              <SettingsIcon className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-4xl font-bold tracking-tight">Settings</h1>
              <p className="text-muted-foreground text-lg">
                Manage your profile and organization settings
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Profile Settings */}
          <Card className="shadow-lg border-0 bg-card/50 backdrop-blur-sm">
            <CardHeader className="pb-6">
              <CardTitle className="flex items-center gap-3 text-xl">
                <div className="p-2 rounded-lg bg-primary/10">
                  <User className="h-5 w-5 text-primary" />
                </div>
                Profile Settings
              </CardTitle>
              <CardDescription className="text-base">
                Update your personal information and account details
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <form onSubmit={handleProfileUpdate} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="first_name" className="text-sm font-medium">First Name</Label>
                    <Input
                      id="first_name"
                      value={profileData.first_name}
                      onChange={(e) => setProfileData(prev => ({ ...prev, first_name: e.target.value }))}
                      className="h-11"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="last_name" className="text-sm font-medium">Last Name</Label>
                    <Input
                      id="last_name"
                      value={profileData.last_name}
                      onChange={(e) => setProfileData(prev => ({ ...prev, last_name: e.target.value }))}
                      className="h-11"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={profileData.email}
                    onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                    className="h-11"
                  />
                </div>
                <Button type="submit" className="h-11 px-8">
                  Update Profile
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Organization Information */}
          <Card className="shadow-lg border-0 bg-card/50 backdrop-blur-sm">
            <CardHeader className="pb-6">
              <CardTitle className="flex items-center gap-3 text-xl">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Building className="h-5 w-5 text-primary" />
                </div>
                Organization
              </CardTitle>
              <CardDescription className="text-base">
                Your organization information and current role
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              {organizationData.name ? (
                <div className="space-y-6">
                  <div className="p-4 rounded-lg bg-muted/50 border">
                    <Label className="text-sm font-medium text-muted-foreground">Organization Name</Label>
                    <p className="text-lg font-semibold mt-1">{organizationData.name}</p>
                  </div>
                  <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50 border">
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Your Role</Label>
                      <div className="mt-2">
                        <Badge variant="secondary" className="text-sm px-3 py-1">
                          {organizationData.role}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <div className="p-4 rounded-lg bg-muted/50 border">
                    <Label className="text-sm font-medium text-muted-foreground">Organization ID</Label>
                    <p className="text-sm font-mono text-muted-foreground mt-1 break-all">
                      {organizationData.id}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="p-4 rounded-lg bg-muted/50 border border-dashed">
                    <Building className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No Organization</h3>
                    <p className="text-muted-foreground">
                      You are not currently a member of any organization. An admin needs to invite you to join an organization.
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Organization Management - Full Width */}
        {/* <div className="mt-8">
          <Card className="shadow-xl border-0 bg-gradient-to-r from-primary/5 to-primary/10 backdrop-blur-sm">
            <CardHeader className="pb-6">
              <CardTitle className="flex items-center gap-3 text-2xl">
                <div className="p-3 rounded-lg bg-primary/10">
                  <Building className="h-6 w-6 text-primary" />
                </div>
                Organization Management
              </CardTitle>
              <CardDescription className="text-base">
                Manage organization settings and configure integrations for your team
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex items-center justify-between p-6 rounded-lg bg-background/60 border">
                <div className="space-y-1">
                  <h4 className="text-lg font-semibold">Advanced Settings</h4>
                  <p className="text-muted-foreground">
                    Configure Google Sheets integration, manage team members, and sync job data from external sources
                  </p>
                </div>
                <Button asChild size="lg" className="h-12 px-6">
                  <Link to="/settings/organization" className="flex items-center gap-2">
                    Manage Organization
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div> */}
      </div>
    </div>
  );
};

export default Settings;
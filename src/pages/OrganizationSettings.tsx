import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useIntegrations } from '@/hooks/useIntegrations';
import { 
  Building2,
  Sheet,
  RefreshCw,
  Settings,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';

interface OrganizationData {
  id: string;
  name: string;
  google_sheet_id: string | null;
}

const OrganizationSettings = () => {
  const { profile } = useAuth();
  const { toast } = useToast();
  const { syncJobsFromSheet, loading: integrationsLoading } = useIntegrations();
  const [loading, setLoading] = useState(true);
  const [organization, setOrganization] = useState<OrganizationData | null>(null);
  const [googleSheetId, setGoogleSheetId] = useState('');
  const [isOwner, setIsOwner] = useState(false);

  useEffect(() => {
    fetchOrganizationData();
  }, [profile]);

  const fetchOrganizationData = async () => {
    if (!profile?.user_id) return;

    try {
      // Get user's membership and organization data
      const { data: memberData, error } = await supabase
        .from('members')
        .select(`
          role,
          org_id,
          organizations (
            id,
            name,
            google_sheet_id
          )
        `)
        .eq('user_id', profile.user_id)
        .maybeSingle();

      if (error) throw error;

      if (memberData?.organizations) {
        const orgData = memberData.organizations as any;
        setOrganization({
          id: orgData.id,
          name: orgData.name,
          google_sheet_id: orgData.google_sheet_id
        });
        setGoogleSheetId(orgData.google_sheet_id || '');
        setIsOwner(memberData.role === 'owner');
      }
    } catch (error: any) {
      console.error('Error fetching organization:', error);
      toast({
        title: "Error loading organization",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveGoogleSheetId = async () => {
    if (!organization || !isOwner) return;

    try {
      const { error } = await supabase
        .from('organizations')
        .update({ google_sheet_id: googleSheetId.trim() || null })
        .eq('id', organization.id);

      if (error) throw error;

      setOrganization(prev => prev ? { ...prev, google_sheet_id: googleSheetId.trim() || null } : null);
      
      toast({
        title: "Settings saved",
        description: "Google Sheet ID has been updated successfully.",
      });
    } catch (error: any) {
      console.error('Error saving Google Sheet ID:', error);
      toast({
        title: "Error saving settings",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleSyncJobs = async () => {
    if (!organization?.google_sheet_id) {
      toast({
        title: "No Google Sheet configured",
        description: "Please add a Google Sheet ID first.",
        variant: "destructive",
      });
      return;
    }

    try {
      await syncJobsFromSheet(organization.id, organization.google_sheet_id);
    } catch (error) {
      console.error('Error syncing jobs:', error);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Building2 className="h-6 w-6" />
          <h1 className="text-3xl font-bold tracking-tight">Organization Settings</h1>
        </div>
        <Card className="animate-pulse">
          <CardContent className="p-6">
            <div className="h-4 bg-muted rounded w-1/3 mb-2"></div>
            <div className="h-3 bg-muted rounded w-1/2"></div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!organization) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Building2 className="h-6 w-6" />
          <h1 className="text-3xl font-bold tracking-tight">Organization Settings</h1>
        </div>
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            No organization found. Please contact support.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Building2 className="h-6 w-6" />
        <h1 className="text-3xl font-bold tracking-tight">Organization Settings</h1>
      </div>

      {/* Organization Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Organization Information
          </CardTitle>
          <CardDescription>
            Manage your organization settings and integrations
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="text-sm font-medium">Organization Name</Label>
            <p className="text-sm text-muted-foreground mt-1">{organization.name}</p>
          </div>
          <div>
            <Label className="text-sm font-medium">Your Role</Label>
            <Badge variant={isOwner ? "default" : "secondary"} className="mt-1">
              {isOwner ? "Owner" : "Member"}
            </Badge>
          </div>
          <div>
            <Label className="text-sm font-medium">Organization ID</Label>
            <code className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded mt-1 block">
              {organization.id}
            </code>
          </div>
        </CardContent>
      </Card>

      {/* Google Sheets Integration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sheet className="h-5 w-5" />
            Google Sheets Integration
          </CardTitle>
          <CardDescription>
            Connect your Google Sheet to automatically sync job data
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!isOwner && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Only organization owners can manage Google Sheets integration.
              </AlertDescription>
            </Alert>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="google-sheet-id">Google Sheet ID</Label>
            <Input
              id="google-sheet-id"
              placeholder="1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms"
              value={googleSheetId}
              onChange={(e) => setGoogleSheetId(e.target.value)}
              disabled={!isOwner}
            />
            <p className="text-xs text-muted-foreground">
              Extract the ID from your Google Sheets URL. The ID is the long string between /d/ and /edit in the URL.
            </p>
          </div>

          {isOwner && (
            <div className="flex gap-2">
              <Button 
                onClick={handleSaveGoogleSheetId}
                disabled={googleSheetId.trim() === (organization.google_sheet_id || '')}
              >
                Save Google Sheet ID
              </Button>
            </div>
          )}

          <Separator />

          <div className="space-y-3">
            <div>
              <h4 className="font-medium">Job Data Sync</h4>
              <p className="text-sm text-muted-foreground">
                Sync job data from your Google Sheet. Make sure your sheet has these columns:
              </p>
              <div className="mt-2 flex flex-wrap gap-1">
                {['company_name', 'job_id', 'job_status', 'job_title', 'short_description', 'location_city', 'vacancy_url'].map(col => (
                  <Badge key={col} variant="outline" className="text-xs">
                    {col}
                  </Badge>
                ))}
              </div>
            </div>

            {organization.google_sheet_id && isOwner && (
              <Button 
                onClick={handleSyncJobs}
                disabled={integrationsLoading}
                className="w-fit"
              >
                {integrationsLoading ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Syncing Jobs...
                  </>
                ) : (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Sync Jobs from Google Sheets
                  </>
                )}
              </Button>
            )}

            {!organization.google_sheet_id && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Please configure a Google Sheet ID above to enable job syncing.
                </AlertDescription>
              </Alert>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default OrganizationSettings;
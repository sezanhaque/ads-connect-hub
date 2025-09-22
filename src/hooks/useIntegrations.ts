import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

export const useIntegrations = () => {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const syncGoogleSheets = async (sheetUrl: string) => {
    if (!profile?.organization_id) {
      toast({
        title: "Error",
        description: "Organization not found",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('google-sheets-sync', {
        body: {
          organization_id: profile.organization_id,
          sheet_url: sheetUrl
        }
      });

      if (error) throw error;

      toast({
        title: "Google Sheets sync completed",
        description: `Synced ${data.synced_count} jobs successfully`,
      });

      return data;
    } catch (error: any) {
      console.error('Error syncing Google Sheets:', error);
      toast({
        title: "Sync failed",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const syncJobsFromSheet = async (organizationId: string, sheetId: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('google-sheets-sync', {
        body: {
          organization_id: organizationId,
          sheet_id: sheetId,
          sync_type: 'jobs'
        }
      });

      if (error) throw error;

      toast({
        title: "Jobs synced successfully!",
        description: `Synced ${data?.synced_count || 0} jobs from Google Sheets.`,
      });

      return data;
    } catch (error: any) {
      console.error('Error syncing jobs:', error);
      toast({
        title: "Sync failed",
        description: error.message || "Failed to sync jobs from Google Sheets.",
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const syncMetaAds = async (accessToken: string, adAccountId?: string, dateRange: string = 'last_7_days') => {
    setLoading(true);
    try {
      // Get user's memberships to find the correct organization
      const { data: memberships, error: membershipsError } = await supabase
        .from('members')
        .select('org_id, role')
        .eq('user_id', profile?.user_id);

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

      if (!primaryOrg) {
        toast({
          title: "Error",
          description: "Organization not found",
          variant: "destructive",
        });
        return;
      }

      const { data, error } = await supabase.functions.invoke('meta-api-sync', {
        body: {
          organization_id: primaryOrg.org_id,
          access_token: accessToken,
          ad_account_id: adAccountId,
          date_range: dateRange
        }
      });

      if (error) throw error;

      toast({
        title: "Meta Ads sync completed",
        description: `Synced ${data.synced_count} campaigns successfully`,
      });

      return data;
    } catch (error: any) {
      console.error('Error syncing Meta Ads:', error);
      const desc = error?.message || error?.context?.error || 'Failed to connect to Meta API';
      toast({
        title: "Sync failed",
        description: desc,
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const sendCampaignEmail = async (campaignData: any) => {
    if (!profile?.email) {
      toast({
        title: "Error",
        description: "User email not found",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('send-campaign-email', {
        body: {
          ...campaignData,
          user_email: profile.email,
          user_name: `${profile.first_name} ${profile.last_name}`.trim()
        }
      });

      if (error) throw error;

      toast({
        title: "Campaign email sent",
        description: "Campaign details have been emailed to you",
      });

      return data;
    } catch (error: any) {
      console.error('Error sending campaign email:', error);
      toast({
        title: "Email failed",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const syncPrivateGoogleSheets = async (organizationId: string, sheetId: string, accessToken: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('google-sheets-private-sync', {
        body: {
          organizationId,
          sheetId,
          accessToken
        }
      });

      if (error) throw error;

      toast({
        title: "Private sheet sync completed!",
        description: `Synced ${data?.synced_count || 0} jobs from your private Google Sheet.`,
      });

      return data;
    } catch (error: any) {
      console.error('Error syncing private sheet:', error);
      toast({
        title: "Private sync failed",
        description: error.message || "Failed to sync jobs from private Google Sheet.",
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    syncGoogleSheets,
    syncJobsFromSheet,
    syncPrivateGoogleSheets,
    syncMetaAds,
    sendCampaignEmail,
    loading
  };
};
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

  const syncMetaAds = async (accessToken: string, dateRange: string = '7d') => {
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
      const { data, error } = await supabase.functions.invoke('meta-api-sync', {
        body: {
          organization_id: profile.organization_id,
          access_token: accessToken,
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

  return {
    syncGoogleSheets,
    syncJobsFromSheet,
    syncMetaAds,
    sendCampaignEmail,
    loading
  };
};
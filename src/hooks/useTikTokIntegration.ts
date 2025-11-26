import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

export const useTikTokIntegration = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const connectTikTokAccount = async (accessToken: string, advertiserId?: string) => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to connect TikTok account",
        variant: "destructive",
      });
      return { success: false };
    }

    setLoading(true);
    
    try {
      console.log('Starting TikTok account connection...');
      
      // Get user's organization
      const { data: memberships, error: membershipsError } = await supabase
        .from('members')
        .select('org_id, role')
        .eq('user_id', user.id);

      if (membershipsError) {
        console.error('Error fetching memberships:', membershipsError);
        throw new Error('Failed to get user organization');
      }

      if (!memberships || memberships.length === 0) {
        throw new Error('No organization found for user');
      }

      // Find best organization (owner > admin > member)
      const primaryOrg = memberships.find((m: any) => m.role === 'owner') ||
                        memberships.find((m: any) => m.role === 'admin') ||
                        memberships.find((m: any) => m.role === 'member') ||
                        memberships[0];

      console.log('Using organization:', primaryOrg.org_id);

      // Call the tiktok-sync function
      const { data, error } = await supabase.functions.invoke('tiktok-sync', {
        body: {
          access_token: accessToken,
          advertiser_id: advertiserId,
          org_id: primaryOrg.org_id
        }
      });

      if (error) {
        console.error('Edge function error:', error);
        throw new Error(error.message || 'Failed to connect to TikTok API');
      }

      if (!data.success) {
        console.error('TikTok sync failed:', data);
        throw new Error(data.error || 'TikTok API connection failed');
      }

      console.log('TikTok sync successful:', data);

      // Check if integration was actually saved
      if (data.integration_saved === false) {
        console.warn('TikTok sync succeeded but integration was not saved to database');
        toast({
          title: "Warning",
          description: "Campaigns synced but connection may not persist. Please try reconnecting.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Connection successful!",
          description: `Successfully connected and synced ${data.synced_count} campaigns`,
        });
      }

      return { 
        success: true, 
        syncedCount: data.synced_count,
        totalCampaigns: data.total_campaigns,
        integrationSaved: data.integration_saved
      };

    } catch (error: any) {
      console.error('TikTok connection error:', error);
      
      const errorMessage = error.message || 'Failed to connect to TikTok Marketing API';
      
      toast({
        title: "Connection failed",
        description: errorMessage,
        variant: "destructive",
      });

      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  return {
    connectTikTokAccount,
    loading
  };
};
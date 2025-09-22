import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

export const useMetaIntegration = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const connectMetaAccount = async (accessToken: string, adAccountId?: string) => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to connect Meta account",
        variant: "destructive",
      });
      return { success: false };
    }

    setLoading(true);
    
    try {
      console.log('Starting Meta account connection...');
      
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

      // Call the new meta-sync function
      const { data, error } = await supabase.functions.invoke('meta-sync', {
        body: {
          access_token: accessToken,
          ad_account_id: adAccountId,
          org_id: primaryOrg.org_id
        }
      });

      if (error) {
        console.error('Edge function error:', error);
        throw new Error(error.message || 'Failed to connect to Meta API');
      }

      if (!data.success) {
        console.error('Meta sync failed:', data);
        throw new Error(data.error || 'Meta API connection failed');
      }

      console.log('Meta sync successful:', data);

      toast({
        title: "Connection successful!",
        description: `Successfully connected and synced ${data.synced_count} campaigns`,
      });

      return { 
        success: true, 
        syncedCount: data.synced_count,
        totalCampaigns: data.total_campaigns 
      };

    } catch (error: any) {
      console.error('Meta connection error:', error);
      
      const errorMessage = error.message || 'Failed to connect to Meta Marketing API';
      
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
    connectMetaAccount,
    loading
  };
};
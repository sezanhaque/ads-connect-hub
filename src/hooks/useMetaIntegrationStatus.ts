import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface MetaIntegration {
  id: string;
  org_id: string;
  ad_account_id: string;
  account_name: string;
  status: 'active' | 'expired' | 'error';
  last_sync_at: string;
  created_at: string;
}

export const useMetaIntegrationStatus = () => {
  const { user } = useAuth();
  const [integration, setIntegration] = useState<MetaIntegration | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchIntegration = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Get user's organization
      const { data: memberships, error: membershipsError } = await supabase
        .from('members')
        .select('org_id, role')
        .eq('user_id', user.id);

      if (membershipsError) {
        throw new Error('Failed to get user organization');
      }

      if (!memberships || memberships.length === 0) {
        setIntegration(null);
        return;
      }

      // Find best organization (owner > admin > member)
      const primaryOrg = memberships.find((m: any) => m.role === 'owner') ||
                        memberships.find((m: any) => m.role === 'admin') ||
                        memberships.find((m: any) => m.role === 'member') ||
                        memberships[0];

      // Check for existing Meta integration
      const { data: metaIntegration, error: integrationError } = await supabase
        .from('integrations')
        .select('*')
        .eq('org_id', primaryOrg.org_id)
        .eq('integration_type', 'meta')
        .eq('status', 'active')
        .maybeSingle();

      if (integrationError) {
        throw new Error('Failed to fetch integration status');
      }

      setIntegration(metaIntegration as MetaIntegration);
    } catch (err: any) {
      setError(err.message);
      setIntegration(null);
    } finally {
      setLoading(false);
    }
  };

  const disconnect = async () => {
    if (!integration) return;

    try {
      const { error } = await supabase
        .from('integrations')
        .update({ status: 'error' })
        .eq('id', integration.id);

      if (error) {
        throw new Error('Failed to disconnect integration');
      }

      setIntegration(null);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  };

  useEffect(() => {
    fetchIntegration();
  }, [user]);

  return {
    integration,
    loading,
    error,
    isConnected: !!integration,
    refetch: fetchIntegration,
    disconnect
  };
};
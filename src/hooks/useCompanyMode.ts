import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

/**
 * Reads the master feature flag for company-based management.
 * Default is OFF - existing user-based flows continue unchanged.
 */
export function useCompanyMode() {
  const [enabled, setEnabled] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    supabase
      .from('feature_flags')
      .select('company_mode_enabled')
      .maybeSingle()
      .then(({ data }) => {
        if (!mounted) return;
        setEnabled(!!data?.company_mode_enabled);
        setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  return { enabled, loading };
}

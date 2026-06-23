import { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

interface AdminRouteProps {
  children: React.ReactNode;
}

const AdminRoute = ({ children }: AdminRouteProps) => {
  const { user, profile, loading: authLoading } = useAuth();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [checkingRole, setCheckingRole] = useState(true);
  const location = useLocation();

  useEffect(() => {
    const checkAdminStatus = async () => {
      if (authLoading) return;

      if (!user) {
        setIsAdmin(false);
        setCheckingRole(false);
        return;
      }

      try {
        // Read feature flag to decide which table drives admin access
        const { data: flag } = await supabase
          .from('feature_flags')
          .select('company_mode_enabled')
          .eq('id', true)
          .maybeSingle();

        const companyMode = flag?.company_mode_enabled === true;

        if (companyMode) {
          // Company mode: admin = ONLY explicit 'admin' role in company_members
          const { data, error } = await supabase
            .from('company_members')
            .select('role')
            .eq('user_id', user.id)
            .eq('role', 'admin')
            .limit(1);

          if (error) throw error;
          setIsAdmin((data?.length ?? 0) > 0);
        } else {
          // Legacy mode: admin = ONLY explicit 'admin' role in members table
          if (!profile?.organization_id) {
            setIsAdmin(false);
          } else {
            const { data, error } = await supabase
              .from('members')
              .select('role')
              .eq('user_id', user.id)
              .eq('org_id', profile.organization_id)
              .single();

            if (error) throw error;
            setIsAdmin(data?.role === 'admin');
          }
        }

      } catch (error) {
        console.error('Error checking admin status:', error);
        setIsAdmin(false);
      } finally {
        setCheckingRole(false);
      }
    };

    checkAdminStatus();
  }, [user, profile, authLoading]);



  // Show loading state while checking authentication and role
  if (authLoading || checkingRole) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect to auth if not logged in
  if (!user) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  // Redirect to dashboard if not admin
  if (isAdmin === false) {
    return <Navigate to="/dashboard" replace />;
  }

  // Render children if user is admin
  return <>{children}</>;
};

export default AdminRoute;

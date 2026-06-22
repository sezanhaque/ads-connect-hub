import { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { posthog } from '@/lib/posthog';

interface Profile {
  id: string;
  user_id: string;
  organization_id: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  role: string;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  signUp: (email: string, password: string, firstName: string, lastName: string, companyName: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<{ error: any }>;
  resetPassword: (email: string) => Promise<{ error: any }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    let isMounted = true;

    const applySession = (nextSession: Session | null) => {
      if (!isMounted) return;
      setSession(nextSession);
      setUser(nextSession?.user ?? null);

      if (nextSession?.user) {
        fetchProfile(nextSession.user.id);
      } else {
        setProfile(null);
      }
    };

    const initializeAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      applySession(session);
      if (isMounted) {
        setLoading(false);
      }
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (!isMounted) return;

        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          setTimeout(() => {
            if (isMounted) fetchProfile(session.user.id);
          }, 0);
        } else {
          setProfile(null);
        }

        if (event !== 'INITIAL_SESSION') {
          setLoading(false);
        }
      }
    );

    initializeAuth();

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const fetchProfile = async (userId: string) => {
    try {
      // 1) Fetch base profile
      const { data: profileRow, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (profileError) {
        console.error('Error fetching profile:', profileError);
      }

      let ensuredProfile = profileRow;

      // If no profile exists, the trigger should have created one already
      // Don't create profiles manually in the frontend - let the trigger handle it
      if (!ensuredProfile) {
        console.log('No profile found for user, waiting for trigger...');
        return;
      }

      // 2) Fetch memberships (may be multiple)
      const { data: memberships, error: membersErr } = await supabase
        .from('members')
        .select('role, org_id')
        .eq('user_id', userId);

      if (membersErr) {
        console.error('Error fetching member roles:', membersErr);
      }

      // Prefer the highest privilege role: owner > admin > member  
      const preferred = (() => {
        if (!memberships || memberships.length === 0) return null;
        return (
          memberships.find((m: any) => m.role === 'owner') ||
          memberships.find((m: any) => m.role === 'admin') ||
          memberships.find((m: any) => m.role === 'member') ||
          memberships[0]
        );
      })();

      const normalizedRole = preferred?.role ?? ensuredProfile?.role ?? 'member';
      const organizationId = preferred?.org_id ?? null;

      setProfile({ ...(ensuredProfile as any), role: normalizedRole, organization_id: organizationId } as any);
    } catch (error) {
      console.error('Error fetching/creating profile:', error);
    }
  };

  const signUp = async (email: string, password: string, firstName: string, lastName: string, companyName: string) => {
    const redirectUrl = window.location.origin;

    // If company-mode is enabled, validate the email domain before creating the auth user.
    try {
      const { data: flag } = await supabase
        .from('feature_flags')
        .select('company_mode_enabled')
        .eq('id', true)
        .maybeSingle();

      if (flag?.company_mode_enabled) {
        const { data: validation, error: validationError } = await supabase.functions.invoke(
          'validate-signup-email',
          { body: { email } }
        );

        if (validationError || !validation?.ok) {
          const msg = validation?.error || validationError?.message || 'This email domain is not allowed. Please use your company email.';
          toast({
            title: 'Sign up blocked',
            description: msg,
            variant: 'destructive',
          });
          return { error: { message: msg } };
        }
      }
    } catch (e) {
      // If the flag lookup fails, fall through to legacy signup (production safe default).
      console.warn('Company-mode pre-check skipped:', e);
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          first_name: firstName,
          last_name: lastName,
          company_name: companyName,
        }
      }
    });

    if (error) {
      toast({
        title: "Sign up failed",
        description: error.message,
        variant: "destructive",
      });
    } else if (data.user) {
      posthog.capture('user_signed_up', {
        email: email,
        company_name: companyName,
      });
      toast({
        title: "Account created successfully!",
        description: "Please check your email to verify your account.",
      });
    }

    return { error };
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      toast({
        title: "Sign in failed",
        description: error.message,
        variant: "destructive",
      });
    } else {
      posthog.capture('user_signed_in', { email: email });
    }

    return { error };
  };

  const signOut = async () => {
    posthog.capture('user_signed_out');
    const { error } = await supabase.auth.signOut();
    
    // If session doesn't exist, treat it as successful logout
    if (error && error.message !== "Session from session_id claim in JWT does not exist") {
      toast({
        title: "Sign out failed",
        description: error.message,
        variant: "destructive",
      });
      return { error };
    }
    
    // Clear local state on successful logout or expired session
    setSession(null);
    setUser(null);
    setProfile(null);

    return { error: null };
  };

  const resetPassword = async (email: string) => {
    const redirectUrl = `${window.location.origin}/reset-password`;
    
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: redirectUrl,
    });

    if (error) {
      toast({
        title: "Password reset failed",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Password reset email sent",
        description: "Please check your email for reset instructions.",
      });
    }

    return { error };
  };

  const value = {
    user,
    session,
    profile,
    loading,
    signUp,
    signIn,
    signOut,
    resetPassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
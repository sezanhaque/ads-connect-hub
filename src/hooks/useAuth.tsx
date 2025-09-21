import { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

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
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          setTimeout(() => {
            fetchProfile(session.user.id);
          }, 0);
        } else {
          setProfile(null);
        }
        
        setLoading(false);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        fetchProfile(session.user.id);
      }
      
      setLoading(false);
    });

    return () => subscription.unsubscribe();
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

      // If missing, create a simple profile
      if (!ensuredProfile) {
        const { data: userRes } = await supabase.auth.getUser();
        const authUser = userRes.user;
        const { data: newProfile, error: insertError } = await supabase
          .from('profiles')
          .insert({
            user_id: userId,
            email: authUser?.email ?? null,
            first_name: (authUser?.user_metadata as any)?.first_name ?? null,
            last_name: (authUser?.user_metadata as any)?.last_name ?? null,
            // New users default to member role
            role: 'member'
          })
          .select('*')
          .single();

        if (insertError) {
          console.error('Error creating profile:', insertError);
          return;
        }

        ensuredProfile = newProfile as any;
      }

      // 2) Fetch member role and org
      const { data: memberRow, error: memberError } = await supabase
        .from('members')
        .select('role, org_id')
        .eq('user_id', userId)
        .maybeSingle();

      if (memberError) {
        console.error('Error fetching member role:', memberError);
      }

      // Role priority: member role > profile role > default member
      // Only 'admin' role in members table gets admin access
      const normalizedRole = memberRow?.role === 'admin' ? 'admin' : (memberRow?.role ?? ensuredProfile?.role ?? 'member');
      const organizationId = memberRow?.org_id ?? ensuredProfile?.organization_id ?? null;

      setProfile({ ...(ensuredProfile as any), role: normalizedRole, organization_id: organizationId } as any);
    } catch (error) {
      console.error('Error fetching/creating profile:', error);
    }
  };

  const signUp = async (email: string, password: string, firstName: string, lastName: string, companyName: string) => {
    const redirectUrl = `${window.location.origin}/`;
    
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
      // Check if user already has a profile and organization membership
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', data.user.id)
        .single();

      if (!existingProfile) {
        // Create profile
        const { error: profileError } = await supabase
          .from('profiles')
          .insert([
            {
              user_id: data.user.id,
              email: email,
              first_name: firstName || '',
              last_name: lastName || '',
            }
          ]);

        if (profileError) {
          console.error('Error creating profile:', profileError);
        }

        // Check if user is already a member of any organization
        const { data: existingMember } = await supabase
          .from('members')
          .select('*')
          .eq('user_id', data.user.id)
          .single();

        if (!existingMember) {
          // Create a default organization and add user as member
          const orgName = companyName || `${firstName || email.split('@')[0]}'s Organization`;
          
          const { data: orgData, error: orgError } = await supabase
            .from('organizations')
            .insert([{ name: orgName }])
            .select()
            .single();

          if (orgError) {
            console.error('Error creating organization:', orgError);
          } else {
            // Add user as member (not owner) of the organization
            const { error: memberError } = await supabase
              .from('members')
              .insert([
                {
                  org_id: orgData.id,
                  user_id: data.user.id,
                  role: 'member'
                }
              ]);

            if (memberError) {
              console.error('Error creating member:', memberError);
            }
          }
        }
      }
      
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
    }

    return { error };
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      toast({
        title: "Sign out failed",
        description: error.message,
        variant: "destructive",
      });
    }

    return { error };
  };

  const resetPassword = async (email: string) => {
    const redirectUrl = `${window.location.origin}/`;
    
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
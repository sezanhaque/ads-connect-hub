import { createContext, useContext, useEffect, ReactNode } from 'react';
import { posthog } from '@/lib/posthog';
import { useAuth } from './useAuth';

interface PostHogContextType {
  posthog: typeof posthog;
}

const PostHogContext = createContext<PostHogContextType | undefined>(undefined);

export const PostHogProvider = ({ children }: { children: ReactNode }) => {
  const { user, profile } = useAuth();

  useEffect(() => {
    if (user && profile) {
      // Identify user in PostHog
      posthog.identify(user.id, {
        email: profile.email || user.email,
        name: profile.first_name && profile.last_name 
          ? `${profile.first_name} ${profile.last_name}` 
          : profile.first_name || profile.last_name || 'Unknown',
        role: profile.role,
        organization_id: profile.organization_id,
      });
    } else if (!user) {
      // Reset PostHog when user logs out
      posthog.reset();
    }
  }, [user, profile]);

  return (
    <PostHogContext.Provider value={{ posthog }}>
      {children}
    </PostHogContext.Provider>
  );
};

export const usePostHog = () => {
  const context = useContext(PostHogContext);
  if (context === undefined) {
    throw new Error('usePostHog must be used within a PostHogProvider');
  }
  return context;
};

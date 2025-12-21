import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

export type PatreonTier = 'lab-pass' | 'creator-accelerator' | 'creative-economy-lab';
export type AppRole = 'admin' | 'moderator' | 'user';

interface Profile {
  id: string;
  user_id: string;
  name: string | null;
  patreon_id: string | null;
  patreon_tier: PatreonTier;
  avatar_url: string | null;
}

// Tier hierarchy for access checks
const TIER_HIERARCHY: PatreonTier[] = ['lab-pass', 'creator-accelerator', 'creative-economy-lab'];

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  roles: AppRole[];
  loading: boolean;
  hasRole: (role: AppRole) => boolean;
  hasAccessToTier: (requiredTier: PatreonTier) => boolean;
  signInWithPatreon: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [roles, setRoles] = useState<AppRole[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch profile data
  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (error) {
        console.error('Error fetching profile:', error);
        return null;
      }
      return data;
    } catch (error) {
      console.error('Error fetching profile:', error);
      return null;
    }
  };

  // Fetch user roles from database (server-side source of truth)
  const fetchUserRoles = async (userId: string): Promise<AppRole[]> => {
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId);

      if (error) {
        console.error('Error fetching user roles:', error);
        return [];
      }
      return data?.map(r => r.role as AppRole) || [];
    } catch (error) {
      console.error('Error fetching user roles:', error);
      return [];
    }
  };

  // Check if user has a specific role (uses server-fetched roles)
  const hasRole = (role: AppRole): boolean => {
    return roles.includes(role);
  };

  // Check if user has access to a tier (admins always have access to all tiers)
  const hasAccessToTier = (requiredTier: PatreonTier): boolean => {
    // Admins have access to everything
    if (roles.includes('admin')) {
      return true;
    }
    
    const userTier = profile?.patreon_tier || 'lab-pass';
    const userTierIndex = TIER_HIERARCHY.indexOf(userTier);
    const requiredTierIndex = TIER_HIERARCHY.indexOf(requiredTier);
    
    return userTierIndex >= requiredTierIndex;
  };

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        // Defer profile and roles fetch to avoid deadlocks
        if (session?.user) {
          setTimeout(() => {
            Promise.all([
              fetchProfile(session.user.id),
              fetchUserRoles(session.user.id)
            ]).then(([profileData, userRoles]) => {
              setProfile(profileData);
              setRoles(userRoles);
            });
          }, 0);
        } else {
          setProfile(null);
          setRoles([]);
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        Promise.all([
          fetchProfile(session.user.id),
          fetchUserRoles(session.user.id)
        ]).then(([profileData, userRoles]) => {
          setProfile(profileData);
          setRoles(userRoles);
          setLoading(false);
        });
      } else {
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signInWithPatreon = async () => {
    // Pass the app origin so the edge function knows where to redirect back
    const appOrigin = window.location.origin;

    const navigateToOAuth = (url: string) => {
      // Patreon blocks rendering inside iframes (X-Frame-Options/CSP).
      // Lovable preview runs inside an iframe, so open OAuth in a new tab there.
      const inIframe = (() => {
        try {
          return window.self !== window.top;
        } catch {
          return true;
        }
      })();

      if (inIframe) {
        const opened = window.open(url, '_blank', 'noopener,noreferrer');
        if (!opened) {
          // Fallback if popups are blocked
          window.location.href = url;
        }
        return;
      }

      window.location.href = url;
    };

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/patreon-auth?action=login&app_origin=${encodeURIComponent(appOrigin)}`
      );

      if (!response.ok) {
        throw new Error('Failed to get Patreon auth URL');
      }

      const result = await response.json();

      if (result.url) {
        navigateToOAuth(result.url);
      } else {
        throw new Error('No auth URL returned');
      }
    } catch (error) {
      console.error('Patreon sign in error:', error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setSession(null);
      setProfile(null);
      setRoles([]);
    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ user, session, profile, roles, loading, hasRole, hasAccessToTier, signInWithPatreon, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
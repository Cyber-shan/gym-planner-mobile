import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Session, User, AuthChangeEvent } from '@supabase/supabase-js';
import * as Linking from 'expo-linking';
import { supabase } from '../lib/supabase';

type CustomUser = {
  id: string;
  name: string;
  email: string;
};

type AuthContextType = {
  session: Session | null;
  user: CustomUser | null;
  logout: () => Promise<void>;
  loginAsDemo: () => Promise<void>;
  isInitialized: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<CustomUser | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  const mapUser = (sbUser: User | null): CustomUser | null => {
    if (!sbUser) return null;
    return {
      id: sbUser.id,
      email: sbUser.email || '',
      name: sbUser.user_metadata?.name || sbUser.email?.split('@')[0] || 'User',
    };
  };

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }: { data: { session: Session | null } }) => {
      setSession(session);
      setUser(mapUser(session?.user ?? null));
      setIsInitialized(true);
    });

    // Listen to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event: AuthChangeEvent, session: Session | null) => {
      setSession(session);
      setUser(mapUser(session?.user ?? null));
    });

    // Handle deep links for authentication (e.g., password reset)
    const handleDeepLink = async (url: string | null) => {
      if (!url) return;
      
      // Supabase tokens are often in the fragment (#...)
      const fragment = url.split('#')[1];
      if (fragment) {
        const params = new URLSearchParams(fragment);
        const access_token = params.get('access_token');
        const refresh_token = params.get('refresh_token');

        if (access_token && refresh_token) {
          await supabase.auth.setSession({
            access_token,
            refresh_token,
          });
        }
      }
    };

    Linking.getInitialURL().then(handleDeepLink);
    const linkingSubscription = Linking.addEventListener('url', (event) => {
      handleDeepLink(event.url);
    });

    return () => {
      subscription.unsubscribe();
      linkingSubscription.remove();
    };
  }, []);

  const logout = async () => {
    await supabase.auth.signOut();
  };

  const loginAsDemo = async () => {
    // Generate a mock session for the demo user
    const demoUser = {
      id: 'demo-user-id',
      email: 'demo@example.com',
      name: 'Demo User',
    };
    
    // Create a minimal fake session
    const mockSession = {
      access_token: 'mock-token',
      refresh_token: 'mock-refresh-token',
      expires_in: 3600,
      token_type: 'bearer',
      user: {
        id: demoUser.id,
        aud: 'authenticated',
        role: 'authenticated',
        email: demoUser.email,
        app_metadata: {},
        user_metadata: { name: demoUser.name },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    } as Session;

    setSession(mockSession);
    setUser(demoUser);
  };

  return (
    <AuthContext.Provider value={{ session, user, logout, loginAsDemo, isInitialized }}>
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

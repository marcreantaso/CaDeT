import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import type { Profile, AuthState } from '../types/user';

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, fullName: string) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    profile: null,
    isLoading: true, // Start in loading state
    isAuthenticated: false,
  });

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') { // Ignore "Row not found" if brand new
        console.error('Error fetching profile:', error);
        return null;
      }
      return data;
    } catch (err) {
      console.error('Unexpected error fetching profile:', err);
      return null;
    }
  };

  useEffect(() => {
    // Check active sessions and sets the user
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        const profile = await fetchProfile(session.user.id);
        setAuthState({
          user: {
            id: session.user.id,
            email: session.user.email!,
            fullName: profile?.full_name || '',
            onboardingCompleted: profile?.onboarding_completed || false,
            createdAt: session.user.created_at,
            updatedAt: session.user.updated_at || session.user.created_at,
          },
          profile,
          isLoading: false,
          isAuthenticated: true,
        });
      } else {
        setAuthState({
          user: null,
          profile: null,
          isLoading: false,
          isAuthenticated: false,
        });
      }
    });

    // Listen for changes on auth state (in, out, etc.)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        const profile = await fetchProfile(session.user.id);
        setAuthState({
          user: {
            id: session.user.id,
            email: session.user.email!,
            fullName: profile?.full_name || '',
            onboardingCompleted: profile?.onboarding_completed || false,
            createdAt: session.user.created_at,
            updatedAt: session.user.updated_at || session.user.created_at,
          },
          profile,
          isLoading: false,
          isAuthenticated: true,
        });
      } else {
        setAuthState({
          user: null,
          profile: null,
          isLoading: false,
          isAuthenticated: false,
        });
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    setAuthState(prev => ({ ...prev, isLoading: true }));
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setAuthState(prev => ({ ...prev, isLoading: false }));
      throw error;
    }
  }, []);

  const signup = useCallback(async (email: string, password: string, fullName: string) => {
    setAuthState(prev => ({ ...prev, isLoading: true }));
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        }
      }
    });
    if (error) {
      setAuthState(prev => ({ ...prev, isLoading: false }));
      throw error;
    }
  }, []);

  const logout = useCallback(async () => {
    setAuthState(prev => ({ ...prev, isLoading: true }));
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Logout error:', error);
    }
  }, []);

  const updateProfile = useCallback(async (updates: Partial<Profile>) => {
    if (!authState.user) return;
    
    // Optimistic update
    setAuthState(prev => ({
      ...prev,
      profile: prev.profile ? { ...prev.profile, ...updates } as any : null,
      user: prev.user ? {
        ...prev.user,
        onboardingCompleted: updates.onboardingCompleted ?? prev.user.onboardingCompleted,
      } : null,
    }));

    const dbUpdates: any = { ...updates };
    if (updates.onboardingCompleted !== undefined) {
      dbUpdates.onboarding_completed = updates.onboardingCompleted;
      delete dbUpdates.onboardingCompleted;
    }
    if (updates.currentRole !== undefined) {
      dbUpdates.current_role = updates.currentRole;
      delete dbUpdates.currentRole;
    }

    const { error } = await supabase
      .from('profiles')
      .update(dbUpdates)
      .eq('user_id', authState.user.id);

    if (error) {
      console.error('Failed to update profile:', error);
      // Rollback would go here if needed, but for now we log it.
      throw error;
    }
  }, [authState.user]);

  return (
    <AuthContext.Provider value={{ ...authState, login, signup, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}

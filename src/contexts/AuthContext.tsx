import { createContext, useContext, useState, type ReactNode } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../lib/db';
import { registerLocal, verifyLocal } from '../lib/localAuth';
import type { AuthState, Profile } from '../types/user';
interface AuthContextType extends AuthState {
  login: (username: string, password: string) => Promise<void>;
  signup: (username: string, password: string, fullName: string, claimLegacy?: boolean) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<void>;
}
const AuthContext = createContext<AuthContextType | null>(null);
export function AuthProvider({ children }: { children: ReactNode }) {
  // Memory-only session: refreshing requires signing in again. No credential or session token is stored in browser storage.
  const [id, setId] = useState<string | null>(null);
  const profile = useLiveQuery(async (): Promise<Profile | null> => id ? (await db.profiles.get(id)) ?? null : null, [id]);
  const user = id && profile ? { id, email: '', fullName: profile.fullName, onboardingCompleted: profile.onboardingCompleted, createdAt: profile.createdAt, updatedAt: profile.updatedAt } : null;
  return <AuthContext.Provider value={{ user, profile: profile ?? null, isLoading: !!id && profile === undefined, isAuthenticated: !!user,
    login: async (username, password) => { setId(await verifyLocal(username, password)); },
    signup: async (username, password, name, claim) => { setId(await registerLocal(username, password, name, claim)); },
    logout: async () => { setId(null); },
    updateProfile: async updates => { if (!id) throw new Error('Sign in first.'); const { fullName, headline, bio, currentRole, yearsExperience, preferredIndustries, onboardingCompleted, onboardingStep } = updates; const allowed = Object.fromEntries(Object.entries({ fullName, headline, bio, currentRole, yearsExperience, preferredIndustries, onboardingCompleted, onboardingStep }).filter(([,v]) => v !== undefined)); await db.profiles.update(id, { ...allowed, updatedAt: new Date().toISOString() }); },
  }}>{children}</AuthContext.Provider>;
}
export function useAuth() { const value = useContext(AuthContext); if (!value) throw new Error('AuthProvider required'); return value; }

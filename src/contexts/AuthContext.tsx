import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import { db } from "../lib/db";
import type { Profile, AuthState, User } from "../types/user";
import { useLiveQuery } from "dexie-react-hooks";

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, fullName: string) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

const LOCAL_USER_ID = "local-user-1";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    profile: null,
    isLoading: true,
    isAuthenticated: false,
  });

  // Automatically setup the local user if they don't exist
  useEffect(() => {
    const initializeLocalUser = async () => {
      try {
        let profile = await db.profiles.get(LOCAL_USER_ID);

        if (!profile) {
          // Create initial local profile
          profile = {
            id: LOCAL_USER_ID,
            userId: LOCAL_USER_ID,
            onboardingCompleted: false,
            onboardingStep: 0,
            fullName: "Local User",
            preferredIndustries: [],
            currentRole: "",
            yearsExperience: 0,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          } as any; // Cast as any if some fields are missing from types

          await db.transaction("rw", db.profiles, async () => {
            if (!(await db.profiles.get(LOCAL_USER_ID)))
              await db.profiles.add(profile!);
          });
        }

        const user: User = {
          id: LOCAL_USER_ID,
          email: "local@cadet.app",
          fullName: profile!.fullName || "Local User",
          onboardingCompleted: profile!.onboardingCompleted,
          createdAt: profile!.createdAt,
          updatedAt: profile!.updatedAt,
        };

        setAuthState({
          user,
          profile: profile || null,
          isLoading: false,
          isAuthenticated: true,
        });
      } catch (error) {
        console.error("Failed to initialize local user:", error);
        setAuthState((prev) => ({ ...prev, isLoading: false }));
      }
    };

    initializeLocalUser();
  }, []);

  // Sync profile changes from Dexie automatically
  useLiveQuery(async () => {
    if (!authState.isAuthenticated) return;
    const profile = await db.profiles.get(LOCAL_USER_ID);
    if (profile) {
      setAuthState((prev) => ({
        ...prev,
        profile,
        user: prev.user
          ? {
              ...prev.user,
              fullName: profile.fullName || "Local User",
              onboardingCompleted: profile.onboardingCompleted,
            }
          : null,
      }));
    }
  }, [authState.isAuthenticated]);

  // Dummy implementations for offline mode
  const login = useCallback(async () => {
    console.log("Login bypassed in offline mode.");
  }, []);

  const signup = useCallback(async () => {
    console.log("Signup bypassed in offline mode.");
  }, []);

  const logout = useCallback(async () => {
    console.log("Logout bypassed in offline mode.");
  }, []);

  const updateProfile = useCallback(
    async (updates: Partial<Profile>) => {
      if (!authState.user) return;

      // Update Dexie
      await db.profiles.update(LOCAL_USER_ID, {
        ...updates,
        updatedAt: new Date().toISOString(),
      });
    },
    [authState.user],
  );

  return (
    <AuthContext.Provider
      value={{ ...authState, login, signup, logout, updateProfile }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}

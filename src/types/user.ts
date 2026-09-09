// User and auth types

export interface User {
  id: string;
  email: string;
  fullName: string;
  avatarUrl?: string;
  onboardingCompleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Profile {
  id: string;
  userId: string;
  fullName: string;
  headline?: string;
  bio?: string;
  avatarUrl?: string;
  currentRole?: string;
  yearsExperience?: number;
  preferredIndustries: string[];
  onboardingCompleted: boolean;
  onboardingStep: number;
  createdAt: string;
  updatedAt: string;
}

export interface AuthState {
  user: User | null;
  profile: Profile | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

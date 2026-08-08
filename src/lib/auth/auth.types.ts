import { UserProfile, UserRole } from '../../types/user.types';

export interface DevAuthUser extends UserProfile {
  isMock: true;
}

export interface AuthContextType {
  user: any | null;
  profile: UserProfile | null;
  loading: boolean;
  isAuthenticated: boolean;
  isDevAuth: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (params: any) => Promise<void>;
  logout: () => Promise<void>;
  error: string | null;
  clearError: () => void;
  toggleDevAuth?: () => void;
}

import { UserProfile, UserRole } from '../../types/user.types';

export interface SignupParams {
  name: string;
  email: string;
  role: UserRole;
  buildingId: string;
  phone?: string;
  password: string;
}

export interface AuthContextType {
  user: any | null;
  profile: UserProfile | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (params: SignupParams) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  error: string | null;
  clearError: () => void;
}
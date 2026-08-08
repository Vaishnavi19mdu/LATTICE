export type UserRole = 'operator' | 'administrator' | 'building_operator' | 'network_operator' | 'BUILDING_OPERATOR' | 'NETWORK_OPERATOR';

export interface UserProfile {
  uid: string;
  name: string;
  displayName?: string;
  email: string;
  role: UserRole;
  category?: string;
  department?: string;
  accessLevel?: string;
  scope?: string;
  scopeType?: 'single_building' | 'multi_building';
  primaryBuilding?: string;
  buildings?: string[];
  buildingId: string;
  phone?: string;
  createdAt: string;
  description?: string;
  permissions?: string[];
}

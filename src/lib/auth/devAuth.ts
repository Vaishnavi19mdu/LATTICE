import { UserProfile } from '../../types/user.types';
import { BUILDING_OPERATOR_CONFIG, NETWORK_OPERATOR_CONFIG } from '../../config/roleConfig';

export const BUILDING_OPERATOR_PROFILE: UserProfile = {
  uid: BUILDING_OPERATOR_CONFIG.id,
  name: BUILDING_OPERATOR_CONFIG.name,
  displayName: BUILDING_OPERATOR_CONFIG.displayName,
  email: 'operator.bldga@lattice.local',
  role: 'building_operator',
  category: BUILDING_OPERATOR_CONFIG.category,
  department: BUILDING_OPERATOR_CONFIG.department,
  accessLevel: BUILDING_OPERATOR_CONFIG.accessLevel,
  scope: BUILDING_OPERATOR_CONFIG.scope,
  scopeType: BUILDING_OPERATOR_CONFIG.scopeType,
  primaryBuilding: BUILDING_OPERATOR_CONFIG.primaryBuilding,
  buildings: BUILDING_OPERATOR_CONFIG.buildings,
  buildingId: 'building_A',
  phone: '+1 (555) 019-2834',
  createdAt: '2026-08-01T00:00:00.000Z',
  description: BUILDING_OPERATOR_CONFIG.description,
  permissions: BUILDING_OPERATOR_CONFIG.permissions,
};

export const NETWORK_OPERATOR_PROFILE: UserProfile = {
  uid: NETWORK_OPERATOR_CONFIG.id,
  name: NETWORK_OPERATOR_CONFIG.name,
  displayName: NETWORK_OPERATOR_CONFIG.displayName,
  email: 'network.campus@lattice.local',
  role: 'network_operator',
  category: NETWORK_OPERATOR_CONFIG.category,
  department: NETWORK_OPERATOR_CONFIG.department,
  accessLevel: NETWORK_OPERATOR_CONFIG.accessLevel,
  scope: NETWORK_OPERATOR_CONFIG.scope,
  scopeType: NETWORK_OPERATOR_CONFIG.scopeType,
  primaryBuilding: NETWORK_OPERATOR_CONFIG.primaryBuilding,
  buildings: NETWORK_OPERATOR_CONFIG.buildings,
  buildingId: 'building_A',
  phone: '+1 (555) 019-8800',
  createdAt: '2026-08-01T00:00:00.000Z',
  description: NETWORK_OPERATOR_CONFIG.description,
  permissions: NETWORK_OPERATOR_CONFIG.permissions,
};

export const DEV_MOCK_USER = BUILDING_OPERATOR_PROFILE;

export function getProfileForRole(role: 'BUILDING_OPERATOR' | 'NETWORK_OPERATOR' | 'building_operator' | 'network_operator'): UserProfile {
  if (role === 'building_operator' || role === 'BUILDING_OPERATOR') {
    return BUILDING_OPERATOR_PROFILE;
  }
  return NETWORK_OPERATOR_PROFILE;
}

export function isDevAuthEnabled(): boolean {
  if (import.meta.env.VITE_DEV_AUTH === 'false') {
    return false;
  }
  return true;
}

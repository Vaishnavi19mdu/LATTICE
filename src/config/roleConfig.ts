import { OperatorRole, OperatorRoleConfig } from '../types/role.types';
import { UserProfile } from '../types/user.types';

export const BUILDING_OPERATOR_CONFIG: OperatorRoleConfig = {
  id: 'demo-building-operator',
  role: 'building_operator',
  roleKey: 'BUILDING_OPERATOR',
  name: 'LATTICE Building Operator',
  displayName: 'Building Operator',
  category: 'Building Operations',
  department: 'Building Operations',
  accessLevel: 'Building-level',
  scope: 'Building A',
  scopeType: 'single_building',
  scopeTypeLabel: 'Single Building',
  primaryBuilding: 'Building A',
  buildings: ['Building A'],
  buildingIds: ['building_A'],
  description: 'Responsible for monitoring and responding to emergencies within an assigned building.',
  iconType: 'user',
  permissions: [
    'view_assigned_building',
    'view_agents',
    'run_simulation',
    'view_emergency',
    'view_decision_control',
    'use_operations_chat',
    'add_operator_notes',
    'intervene',
    'approve_plan',
    'reject_plan',
    'modify_plan',
  ],
};

export const NETWORK_OPERATOR_CONFIG: OperatorRoleConfig = {
  id: 'demo-network-operator',
  role: 'network_operator',
  roleKey: 'NETWORK_OPERATOR',
  name: 'LATTICE Network Operator',
  displayName: 'Network Operator',
  category: 'Network Operations',
  department: 'Network Operations',
  accessLevel: 'Network-level',
  scope: 'Campus Network',
  scopeType: 'multi_building',
  scopeTypeLabel: 'Multi-Building',
  primaryBuilding: 'none',
  buildings: ['Building A', 'Building B', 'Building C'],
  buildingIds: ['building_A', 'building_B', 'building_C'],
  description: 'Responsible for monitoring and coordinating emergencies across connected buildings.',
  iconType: 'network',
  permissions: [
    'view_all_buildings',
    'view_network',
    'view_cross_building_events',
    'view_agents',
    'view_building_comparison',
    'monitor_network_incidents',
    'use_operations_chat',
    'add_operator_notes',
    'intervene',
    'approve_network_plan',
    'reject_network_plan',
    'modify_network_plan',
  ],
};

export function getRoleConfig(role: OperatorRole): OperatorRoleConfig {
  if (role === 'building_operator' || role === 'BUILDING_OPERATOR') {
    return BUILDING_OPERATOR_CONFIG;
  }
  return NETWORK_OPERATOR_CONFIG;
}

/**
 * Maps a Firestore UserProfile (from useAuth().profile) to an OperatorRoleConfig.
 *
 * UserProfile.role is a union covering two different sources:
 *   - Demo/dev profiles (devAuth.ts) set role directly to
 *     'building_operator' | 'network_operator' | 'BUILDING_OPERATOR' | 'NETWORK_OPERATOR'
 *     -> passed straight through to the matching config.
 *   - Real signed-up accounts (SignupPage) only ever set role to
 *     'operator' | 'administrator' -> mapped below:
 *       'administrator' -> NETWORK_OPERATOR (multi-building access)
 *       'operator'       -> BUILDING_OPERATOR (scoped to their signed-up buildingId)
 *
 * CONFIRM WITH PRODUCT: the operator/administrator mapping is a judgment call,
 * not something derivable from the code — change it if the intended rule differs.
 */
export function getRoleConfigForAccount(profile: UserProfile | null | undefined): OperatorRoleConfig {
  if (!profile) {
    console.warn('getRoleConfigForAccount: no profile available, defaulting to BUILDING_OPERATOR');
    return BUILDING_OPERATOR_CONFIG;
  }

  switch (profile.role) {
    case 'building_operator':
    case 'BUILDING_OPERATOR':
      return BUILDING_OPERATOR_CONFIG;
    case 'network_operator':
    case 'NETWORK_OPERATOR':
      return NETWORK_OPERATOR_CONFIG;
    case 'administrator':
      return NETWORK_OPERATOR_CONFIG;
    case 'operator':
      return BUILDING_OPERATOR_CONFIG;
    default:
      console.warn(
        `getRoleConfigForAccount: unrecognized profile.role "${profile.role}", defaulting to BUILDING_OPERATOR`
      );
      return BUILDING_OPERATOR_CONFIG;
  }
}
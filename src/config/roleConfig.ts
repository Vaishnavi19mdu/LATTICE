import { OperatorRole, OperatorRoleConfig } from '../types/role.types';

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

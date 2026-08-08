export type OperatorRole = 'building_operator' | 'network_operator' | 'BUILDING_OPERATOR' | 'NETWORK_OPERATOR';

export interface OperatorRoleConfig {
  id: string;
  role: 'building_operator' | 'network_operator';
  roleKey: 'BUILDING_OPERATOR' | 'NETWORK_OPERATOR';
  name: string;
  displayName: string;
  category: string;
  department: string;
  accessLevel: string;
  scope: string;
  scopeType: 'single_building' | 'multi_building';
  scopeTypeLabel: string;
  primaryBuilding: string;
  buildings: string[];
  buildingIds: string[];
  description: string;
  iconType: 'user' | 'network';
  permissions: string[];
}

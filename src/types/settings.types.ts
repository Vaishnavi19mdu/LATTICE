export interface BuildingOperatorSettingsData {
  buildingName: string;
  buildingId: string;
  buildingType: string;
  floors: number;
  zones: string;
  exits: string;
  assemblyPoints: string;
  agents: {
    fireHazard: boolean;
    occupancy: boolean;
    security: boolean;
    coordinator: boolean;
  };
  confidenceThreshold: number;
  emergencyThreshold: string;
  preferredRoute: string;
  assistancePriority: boolean;
  autoAlerts: boolean;
  fallbackMode: string;
  alerts: {
    critical: boolean;
    agentFailure: boolean;
    lowConfidence: boolean;
    occupancy: boolean;
    security: boolean;
  };
  requireApproval: boolean;
  allowModification: boolean;
  operatorNotesEnabled: boolean;
  overridePermission: string;
}

export const DEFAULT_BUILDING_OPERATOR_SETTINGS: BuildingOperatorSettingsData = {
  buildingName: 'Building A',
  buildingId: 'building_A',
  buildingType: 'office_tower',
  floors: 12,
  zones: 'North Wing, South Wing, Server Core, Rooftop Mechanical',
  exits: 'Exit A (Main Lobby), Exit B (East Stair), Exit C (Loading Dock)',
  assemblyPoints: 'Assembly Point 1 — North Plaza',
  agents: { fireHazard: true, occupancy: true, security: true, coordinator: true },
  confidenceThreshold: 75,
  emergencyThreshold: 'high',
  preferredRoute: 'exit_b',
  assistancePriority: true,
  autoAlerts: true,
  fallbackMode: 'nearest_safe_exit',
  alerts: { critical: true, agentFailure: true, lowConfidence: true, occupancy: false, security: true },
  requireApproval: true,
  allowModification: true,
  operatorNotesEnabled: true,
  overridePermission: 'operator_only',
};

export interface NetworkAdministratorSettingsData {
  networkName: string;
  interBuildingComms: boolean;
  discoveryEnabled: boolean;
  messageRouting: string;
  schemaVersion: string;
  routingPolicy: string;
  crossBuildingComms: boolean;
  discoveryPermission: string;
  crossEscalation: boolean;
  mutualAid: boolean;
  campusAlertPolicy: string;
  priorityRule: string;
  fallbackPolicy: string;
  mfaRequired: boolean;
  sessionTimeout: number;
  apiCredentialsVisible: boolean;
}

export const DEFAULT_NETWORK_ADMINISTRATOR_SETTINGS: NetworkAdministratorSettingsData = {
  networkName: 'LATTICE Campus Mesh',
  interBuildingComms: true,
  discoveryEnabled: true,
  messageRouting: 'shortest_path',
  schemaVersion: 'v2.3',
  routingPolicy: 'priority_weighted',
  crossBuildingComms: true,
  discoveryPermission: 'registered_only',
  crossEscalation: true,
  mutualAid: true,
  campusAlertPolicy: 'notify_adjacent',
  priorityRule: 'life_safety_first',
  fallbackPolicy: 'isolate_and_hold',
  mfaRequired: true,
  sessionTimeout: 30,
  apiCredentialsVisible: false,
};
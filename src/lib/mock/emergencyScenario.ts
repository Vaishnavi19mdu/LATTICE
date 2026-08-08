export interface IncidentState {
  id: string;
  buildingId: string;
  type: 'fire' | 'smoke' | 'gas' | 'flood' | 'structural' | 'security' | 'nominal';
  floor: number;
  zone: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  smokePpm: number;
  temperatureC: number;
}

export interface OccupancyState {
  total: number;
  assistanceRequired: number;
  floorOccupancy: Record<string, number>;
}

export interface ExitState {
  A: 'available' | 'unsafe' | 'blocked' | 'checking';
  B: 'available' | 'unsafe' | 'blocked' | 'checking';
  C: 'available' | 'unsafe' | 'blocked' | 'checking';
}

export interface ResponsePlanState {
  emergencyLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  safeRoutes: string[];
  blockedRoutes: string[];
  recommendedActions: string[];
  humanDecision: 'APPROVED' | 'MODIFIED' | 'REJECTED' | null;
}

export interface CrossBuildingAlert {
  id: string;
  targetBuilding: string;
  message: string;
  timestamp: string;
  status: 'active' | 'resolved';
}

export interface EventLogEntry {
  id: string;
  eventIndex: number;
  timestamp: string;
  senderId: string;
  senderName: string;
  senderIcon: string;
  receiverId: string;
  receiverName: string;
  type: string;
  message: string;
  status: 'DELIVERED' | 'PROCESSED';
}

export interface SharedEmergencyState {
  scenarioId: string;
  incident: IncidentState;
  occupancy: OccupancyState;
  exits: ExitState;
  agentStates: Record<string, 'idle' | 'thinking' | 'sending' | 'receiving' | 'active' | 'alert' | 'completed' | 'offline'>;
  currentActiveAgentId: string | null;
  currentReceiverAgentId: string | null;
  currentActivity: string;
  operatorIntervention: string | null;
  crossBuildingAlerts: CrossBuildingAlert[];
  responsePlan: ResponsePlanState | null;
  activeStepIndex: number;
  totalSteps: number;
  playbackMode: 'LIVE' | 'PAUSED' | 'STEP';
  currentStage: 'IDLE' | 'RECEIVING' | 'THINKING' | 'TYPING' | 'DELIVERED';
  eventLogs: EventLogEntry[];
  selectedRole: 'BUILDING_OPERATOR' | 'NETWORK_OPERATOR';
  activeBuildingId: string;
}

export const INITIAL_EMERGENCY_STATE: SharedEmergencyState = {
  scenarioId: 'FLOOR_4_FIRE_EMERGENCY',
  incident: {
    id: 'INC-2026-0806-04',
    buildingId: 'building_A',
    type: 'fire',
    floor: 4,
    zone: 'Floor 4 Exit A Corridor',
    severity: 'high',
    smokePpm: 85,
    temperatureC: 78,
  },
  occupancy: {
    total: 42,
    assistanceRequired: 3,
    floorOccupancy: { '5': 12, '4': 42, '3': 28, '2': 18, '1': 10 },
  },
  exits: {
    A: 'available', // Initially appears usable before Event 06 / Event 08
    B: 'available',
    C: 'available',
  },
  agentStates: {
    agent_fire_hazard: 'idle',
    agent_coordinator: 'idle',
    agent_occupancy: 'idle',
    agent_security: 'idle',
    agent_ethical_priority: 'idle',
    agent_cross_building: 'idle',
  },
  currentActiveAgentId: null,
  currentReceiverAgentId: null,
  currentActivity: 'System nominal — Standby mode',
  operatorIntervention: null,
  crossBuildingAlerts: [],
  responsePlan: null,
  activeStepIndex: 0,
  totalSteps: 15,
  playbackMode: 'PAUSED',
  currentStage: 'IDLE',
  eventLogs: [],
  selectedRole: 'BUILDING_OPERATOR',
  activeBuildingId: 'building_A',
};
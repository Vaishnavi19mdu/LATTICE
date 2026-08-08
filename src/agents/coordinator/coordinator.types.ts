import { BaseAgentInput, BaseAgentAssessment, AgentStatus } from '../../types/agent.types';
import { FireHazardAssessment } from '../fire-hazard/fireHazard.types';
import { OccupancyAssessment } from '../occupancy/occupancy.types';
import { SecurityAssessment } from '../security/security.types';

export interface OperatorNote {
  noteId: string;
  operatorId: string;
  emergencyId?: string;
  message: string;
  timestamp: string;
  source: 'HUMAN_OPERATOR';
}

export type EmergencyLevel = 'NORMAL' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface CoordinatorInput extends BaseAgentInput {
  emergencyId?: string;
  fireAssessment?: FireHazardAssessment;
  occupancyAssessment?: OccupancyAssessment;
  securityAssessment?: SecurityAssessment;
  fireAgentStatus?: AgentStatus;
  occupancyAgentStatus?: AgentStatus;
  securityAgentStatus?: AgentStatus;
  availableRoutes?: string[];
  routeLocations?: Record<string, string>; // e.g. { "Exit A": "Floor 4 Near Hazard", "Stairwell B": "West Wing Core" }
  operatorNotes?: OperatorNote[];
  previousAssessment?: CoordinatorAssessment; // For adaptive replanning
}

export interface AgentSourceInfo {
  agentId: string;
  agentName: string;
  status: AgentStatus;
  available: boolean;
  confidence?: number;
}

export interface CoordinatorAssessment extends BaseAgentAssessment {
  assessmentId: string;
  emergencyLevel: EmergencyLevel;
  incidentConfirmed: boolean;
  affectedAreas: string[];
  safeRoutes: string[];
  blockedRoutes: string[];
  conflicts: string[];
  confidence: number; // 0.0 to 1.0
  overallConfidence: number; // 0.0 to 1.0 (alias)
  recommendedActions: string[];
  fallbackActivated: boolean;
  fallbackReason: string | null;
  sourceAgents: Record<string, AgentSourceInfo>;
  reasons: string[]; // mirror/alias of reasoning
  operatorNotes?: OperatorNote[];
}

export type EmergencyCoordinationResult = CoordinatorAssessment;

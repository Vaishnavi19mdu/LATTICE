import { BaseAgentInput, BaseAgentAssessment } from '../../types/agent.types';

export interface CrossBuildingInput extends BaseAgentInput {
  sourceBuildingId?: string;
  affectedArea?: string;
  severity?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  nearbyBuildings?: string[];
  sharedInfrastructure?: boolean;
}

export interface CrossBuildingAssessment extends BaseAgentAssessment {
  collaborationRequired: boolean;
  affectedBuildings: string[];
  notifications: string[];
  sharedInformation: string[];
  recommendedActions: string[];
}

import { BaseAgentInput, BaseAgentAssessment } from '../../types/agent.types';

export type DoorAccessStatus = 'OPEN' | 'RESTRICTED' | 'BLOCKED' | 'UNKNOWN';
export type SecuritySeverity = 'LOW' | 'MEDIUM' | 'HIGH';

export interface SecurityInput extends BaseAgentInput {
  cctvEventDetected?: boolean;
  accessEventDetected?: boolean;
  doorStatus?: DoorAccessStatus;
  securityAlert?: boolean;
  location?: string;
}

export interface SecurityAssessment extends BaseAgentAssessment {
  incidentVerified: boolean;
  confidence: number; // 0.0 to 1.0
  evidence: string[];
  accessStatus: DoorAccessStatus;
  securitySeverity: SecuritySeverity;
}

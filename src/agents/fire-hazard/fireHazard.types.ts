import { BaseAgentInput, BaseAgentAssessment } from '../../types/agent.types';

export interface FireHazardInput extends BaseAgentInput {
  smokeLevel?: number; // 0 to 100
  temperature?: number; // Celsius (e.g., 20 - 100)
  fireAlarm?: boolean;
  gasLevel?: number; // 0 to 100
  location?: string;
}

export type HazardType = 'FIRE' | 'SMOKE' | 'ENVIRONMENTAL' | 'UNKNOWN';
export type SeverityLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface FireHazardAssessment extends BaseAgentAssessment {
  hazardDetected: boolean;
  hazardType: HazardType;
  severity: SeverityLevel;
  score: number; // 0 - 100
  location: string;
  confidence: number; // 0.0 to 1.0
  recommendedAction: string;
}

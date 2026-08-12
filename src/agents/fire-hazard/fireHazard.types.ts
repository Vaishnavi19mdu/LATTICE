import { BaseAgentInput, BaseAgentAssessment } from '../../types/agent.types';
import { FireSpreadInput, FireSpreadPrediction } from './fireSpreadModel';

export interface FireHazardInput extends BaseAgentInput {
  smokeLevel?: number; // 0 to 100 — live sensor reading
  temperature?: number; // Celsius (e.g., 20 - 100)
  fireAlarm?: boolean;
  gasLevel?: number; // 0 to 100
  location?: string;

  /**
   * Optional room/object context for the fire-spread severity model.
   * When supplied, evaluateFireHazard blends this contextual risk score
   * in alongside the live sensor score. Omit entirely to fall back to
   * pure sensor-based scoring (unchanged from before this model existed).
   */
  fireSpreadContext?: FireSpreadInput;
}

export type HazardType = 'FIRE' | 'SMOKE' | 'ENVIRONMENTAL' | 'UNKNOWN';
export type SeverityLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface FireHazardAssessment extends BaseAgentAssessment {
  hazardDetected: boolean;
  hazardType: HazardType;
  severity: SeverityLevel;
  score: number; // 0 - 100, blended if fireSpreadContext was supplied
  location: string;
  confidence: number; // 0.0 to 1.0
  recommendedAction: string;

  /** Present only when fireSpreadContext was supplied on the input. */
  fireSpreadPrediction?: FireSpreadPrediction;
}
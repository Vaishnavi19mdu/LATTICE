import { BaseAgentInput, BaseAgentAssessment } from '../../types/agent.types';

export interface OccupancyInput extends BaseAgentInput {
  totalOccupants?: number;
  floorOccupancy?: Record<string, number>; // e.g. { "1": 12, "2": 18, "4": 42 }
  affectedFloors?: string[]; // e.g. ["4"] or ["Floor 4"]
  registeredAssistanceNeeds?: number;
}

export type OccupancySeverity = 'LOW' | 'MEDIUM' | 'HIGH';

export interface OccupancyAssessment extends BaseAgentAssessment {
  totalOccupants: number;
  affectedOccupants: number;
  affectedZones: string[];
  occupancySeverity: OccupancySeverity;
  assistanceRequired: number;
  evacuationPressureScore: number; // 0 to 100
}

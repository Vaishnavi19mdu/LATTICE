import { BaseAgentInput, BaseAgentAssessment } from '../../types/agent.types';

export interface EthicalPriorityInput extends BaseAgentInput {
  affectedOccupants?: number;
  registeredAssistanceNeeds?: number;
  availableRoutes?: string[];
  blockedRoutes?: string[];
}

export type PriorityLevel = 'NORMAL' | 'ELEVATED' | 'HIGH';

export interface EthicalPriorityAssessment extends BaseAgentAssessment {
  priorityLevel: PriorityLevel;
  assistanceRequired: number;
  priorities: string[];
  recommendedSupport: string[];
}

import { SharedEmergencyState } from '../mock/emergencyScenario';
import { StructuredMockEvent } from '../mock/mockEvents';

export type StateChangeListener = (state: SharedEmergencyState) => void;

export interface InterventionConstraints {
  exits?: Partial<Record<'A' | 'B' | 'C', 'unsafe' | 'blocked' | 'available'>>;
}

export interface AgentRuntime {
  getCurrentState(): SharedEmergencyState;
  subscribe(listener: StateChangeListener): () => void;
  runScenario(): void;
  pauseScenario(): void;
  stepNext(): void;
  resetScenario(): void;
  restartCurrentScenario(): void; // replay same scenario from event 0
  injectOperatorIntervention(instruction: string, constraints?: InterventionConstraints): void;
  selectRole(role: 'BUILDING_OPERATOR' | 'NETWORK_OPERATOR'): void;
  selectBuilding(buildingId: string): void;
  getEventHistory(): StructuredMockEvent[];
}
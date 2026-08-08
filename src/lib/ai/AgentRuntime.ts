import { SharedEmergencyState } from '../mock/emergencyScenario';
import { StructuredMockEvent } from '../mock/mockEvents';

export type StateChangeListener = (state: SharedEmergencyState) => void;

export interface AgentRuntime {
  getCurrentState(): SharedEmergencyState;
  subscribe(listener: StateChangeListener): () => void;
  runScenario(): void;
  pauseScenario(): void;
  stepNext(): void;
  resetScenario(): void;
  injectOperatorIntervention(instruction: string): void;
  selectRole(role: 'BUILDING_OPERATOR' | 'NETWORK_OPERATOR'): void;
  selectBuilding(buildingId: string): void;
  getEventHistory(): StructuredMockEvent[];
}

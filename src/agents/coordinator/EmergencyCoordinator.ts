import { AgentInfo } from '../../types/agent.types';
import { CoordinatorInput, CoordinatorAssessment } from './coordinator.types';
import { evaluateCoordinator, runCoordinatorDemoScenario } from './coordinator.logic';

export class EmergencyCoordinator {
  public readonly info: AgentInfo = {
    id: 'agent_coordinator',
    name: 'Emergency Coordinator',
    type: 'coordinator',
    status: 'online',
    capabilities: [
      'combine_assessments',
      'detect_conflict',
      'generate_response',
      'calculate_confidence',
      'fallback_protocol',
      'adaptive_replanning',
    ],
    description:
      'Central decision engine synthesizing observations from Fire, Occupancy, and Security agents. Resolves route conflicts, evaluates coordination confidence, applies fallback protocols, and issues explainable emergency response plans.',
    accentColor: '#A99BC9',
    icon: '🧠',
  };

  public process(input: CoordinatorInput): CoordinatorAssessment {
    return evaluateCoordinator(input);
  }

  public runDemo() {
    return runCoordinatorDemoScenario();
  }
}

export const emergencyCoordinator = new EmergencyCoordinator();

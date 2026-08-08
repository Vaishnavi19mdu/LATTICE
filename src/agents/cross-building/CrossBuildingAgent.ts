import { AgentInfo } from '../../types/agent.types';
import { CrossBuildingInput, CrossBuildingAssessment } from './crossBuilding.types';
import { evaluateCrossBuilding } from './crossBuilding.logic';

export class CrossBuildingAgent {
  public readonly info: AgentInfo = {
    id: 'agent_cross_building',
    name: 'Cross-Building Collaboration Agent',
    type: 'cross_building',
    status: 'online',
    capabilities: ['identify_affected_buildings', 'prepare_notification', 'share_emergency_context'],
    description: 'Evaluates inter-building dependencies, shared concourses/HVAC, and generates campus mutual aid alerts.',
    accentColor: '#7AE04C',
    icon: '🌐',
  };

  public process(input: CrossBuildingInput): CrossBuildingAssessment {
    return evaluateCrossBuilding(input);
  }
}

export const crossBuildingAgent = new CrossBuildingAgent();

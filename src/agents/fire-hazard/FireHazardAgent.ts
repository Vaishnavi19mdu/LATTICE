import { AgentInfo } from '../../types/agent.types';
import { FireHazardInput, FireHazardAssessment } from './fireHazard.types';
import { evaluateFireHazard } from './fireHazard.logic';

export class FireHazardAgent {
  public readonly info: AgentInfo = {
    id: 'agent_fire_hazard',
    name: 'Fire & Hazard Agent',
    type: 'fire_hazard',
    status: 'online',
    capabilities: ['detect_hazard', 'assess_severity', 'identify_location'],
    description: 'Evaluates smoke, thermal anomalies, gas levels, and alarm state to determine hazard severity.',
    accentColor: '#E26161',
    icon: '🔥',
  };

  public process(input: FireHazardInput): FireHazardAssessment {
    return evaluateFireHazard(input);
  }
}

export const fireHazardAgent = new FireHazardAgent();

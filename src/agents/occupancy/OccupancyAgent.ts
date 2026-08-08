import { AgentInfo } from '../../types/agent.types';
import { OccupancyInput, OccupancyAssessment } from './occupancy.types';
import { evaluateOccupancy } from './occupancy.logic';

export class OccupancyAgent {
  public readonly info: AgentInfo = {
    id: 'agent_occupancy',
    name: 'Occupancy Agent',
    type: 'occupancy',
    status: 'online',
    capabilities: ['get_occupancy', 'identify_affected_zone', 'identify_assistance_requirements'],
    description: 'Tracks occupant density, affected zone counts, and registered mobility assistance requirements.',
    accentColor: '#E6B85C',
    icon: '👥',
  };

  public process(input: OccupancyInput): OccupancyAssessment {
    return evaluateOccupancy(input);
  }
}

export const occupancyAgent = new OccupancyAgent();

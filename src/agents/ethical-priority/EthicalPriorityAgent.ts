import { AgentInfo } from '../../types/agent.types';
import { EthicalPriorityInput, EthicalPriorityAssessment } from './ethicalPriority.types';
import { evaluateEthicalPriority } from './ethicalPriority.logic';

export class EthicalPriorityAgent {
  public readonly info: AgentInfo = {
    id: 'agent_ethical_priority',
    name: 'Ethical Priority Agent',
    type: 'ethical_priority',
    status: 'online',
    capabilities: ['evaluate_assistance_priority', 'evaluate_human_safety'],
    description: 'Prioritizes assistance allocations and vulnerable zone safety based strictly on voluntary registry records.',
    accentColor: '#E0B7C9',
    icon: '❤️',
  };

  public process(input: EthicalPriorityInput): EthicalPriorityAssessment {
    return evaluateEthicalPriority(input);
  }
}

export const ethicalPriorityAgent = new EthicalPriorityAgent();

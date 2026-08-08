import { AgentInfo } from '../../types/agent.types';
import { SecurityInput, SecurityAssessment } from './security.types';
import { evaluateSecurity } from './security.logic';

export class SecurityAgent {
  public readonly info: AgentInfo = {
    id: 'agent_security',
    name: 'Security Agent',
    type: 'security',
    status: 'online',
    capabilities: ['verify_incident', 'retrieve_security_event', 'check_access_status'],
    description: 'Verifies physical security events, CCTV visual evidence, and access control status.',
    accentColor: '#6B9FD4',
    icon: '🛡️',
  };

  public process(input: SecurityInput): SecurityAssessment {
    return evaluateSecurity(input);
  }
}

export const securityAgent = new SecurityAgent();

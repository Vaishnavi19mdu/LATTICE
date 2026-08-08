export type AgentStatus = 'online' | 'degraded' | 'offline' | 'unknown';

export type AgentType =
  | 'fire_hazard'
  | 'occupancy'
  | 'security'
  | 'coordinator'
  | 'ethical_priority'
  | 'cross_building';

export interface AgentInfo {
  id: string;
  name: string;
  type: AgentType;
  status: AgentStatus;
  buildingId?: string;
  capabilities: string[];
  lastHeartbeat?: string;
  description: string;
  accentColor: string;
  icon: string;
}

export interface BaseAgentInput {
  buildingId?: string;
  timestamp?: string;
  simulated?: boolean;
}

export interface BaseAgentAssessment {
  agentId: string;
  agentName: string;
  agentType: AgentType;
  timestamp: string;
  simulated: boolean;
  status: AgentStatus;
  reasoning: string[];
}

import { AgentInfo } from '../../types/agent.types';
import { fireHazardAgent } from '../../agents/fire-hazard';
import { occupancyAgent } from '../../agents/occupancy';
import { securityAgent } from '../../agents/security';
import { emergencyCoordinator } from '../../agents/coordinator';
import { ethicalPriorityAgent } from '../../agents/ethical-priority';
import { crossBuildingAgent } from '../../agents/cross-building';

export interface AgentRegistryEntry {
  info: AgentInfo;
  process: (input: any) => any;
}

export const AGENT_REGISTRY: Record<string, AgentRegistryEntry> = {
  agent_fire_hazard: {
    info: fireHazardAgent.info,
    process: (input) => fireHazardAgent.process(input),
  },
  agent_occupancy: {
    info: occupancyAgent.info,
    process: (input) => occupancyAgent.process(input),
  },
  agent_security: {
    info: securityAgent.info,
    process: (input) => securityAgent.process(input),
  },
  agent_coordinator: {
    info: emergencyCoordinator.info,
    process: (input) => emergencyCoordinator.process(input),
  },
  agent_ethical_priority: {
    info: ethicalPriorityAgent.info,
    process: (input) => ethicalPriorityAgent.process(input),
  },
  agent_cross_building: {
    info: crossBuildingAgent.info,
    process: (input) => crossBuildingAgent.process(input),
  },
};

export function getAllAgents(): AgentInfo[] {
  return Object.values(AGENT_REGISTRY).map((entry) => entry.info);
}

export function getAgentById(id: string): AgentRegistryEntry | undefined {
  return AGENT_REGISTRY[id];
}

export function getAgentsByCapability(capability: string): AgentInfo[] {
  return getAllAgents().filter((info) => info.capabilities.includes(capability));
}

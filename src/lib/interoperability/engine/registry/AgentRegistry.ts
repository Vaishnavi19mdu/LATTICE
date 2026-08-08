import type {
  AgentCapability,
  AgentRegistration,
  AgentStatus,
} from "./types";

export class AgentRegistry {
  private readonly agents = new Map<string, AgentRegistration>();

  registerAgent(agent: AgentRegistration): boolean {
    if (this.agents.has(agent.agentId)) {
      return false;
    }
    this.agents.set(agent.agentId, {
      ...agent,
      capabilities: [...agent.capabilities],
    });
    return true;
  }

  getAgent(agentId: string): AgentRegistration | undefined {
    const agent = this.agents.get(agentId);
    if (!agent) {
      return undefined;
    }
    return {
      ...agent,
      capabilities: [...agent.capabilities],
    };
  }

  getAllAgents(): AgentRegistration[] {
    return [...this.agents.values()].map((agent) => ({
      ...agent,
      capabilities: [...agent.capabilities],
    }));
  }

  getAgents(buildingId: string): AgentRegistration[] {
    return this.getAllAgents().filter(
      (agent) => agent.buildingId === buildingId
    );
  }

  findAgentsByCapability(
    capability: AgentCapability
  ): AgentRegistration[] {
    return this.getAllAgents().filter(
      (agent) =>
        agent.status !== "offline" &&
        agent.capabilities.includes(capability)
    );
  }

  updateAgentStatus(
    agentId: string,
    status: AgentStatus
  ): boolean {
    const agent = this.agents.get(agentId);
    if (!agent) {
      return false;
    }
    agent.status = status;
    return true;
  }

  removeAgent(agentId: string): boolean {
    return this.agents.delete(agentId);
  }

  hasAgent(agentId: string): boolean {
    return this.agents.has(agentId);
  }

  size(): number {
    return this.agents.size;
  }

  clear(): void {
    this.agents.clear();
  }
}
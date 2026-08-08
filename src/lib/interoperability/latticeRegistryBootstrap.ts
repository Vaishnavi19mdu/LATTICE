import { AgentRegistry, MessageRouter, MessageFactory } from './engine';
import type { AgentStatus as EngineAgentStatus } from './engine';
import { SharedEmergencyState } from '../mock/emergencyScenario';

/**
 * latticeRegistryBootstrap.ts
 * ---------------------------
 * Registers the 6 real LATTICE agents into the interoperability-engine
 * AgentRegistry (from lattice-interoperability repo), and exposes a
 * MessageRouter backed by that registry. This replaces the previous
 * ad-hoc `getAgentsByCapability` lookup in agentRegistry.ts with the
 * real capability-discovery implementation.
 */

export const latticeRegistry = new AgentRegistry();

latticeRegistry.registerAgent({
  agentId: 'agent_fire_hazard',
  agentName: 'Fire & Hazard Agent',
  agentType: 'fire-hazard',
  buildingId: 'building_A',
  status: 'online',
  capabilities: ['detect_hazard', 'assess_severity', 'identify_location'],
});

latticeRegistry.registerAgent({
  agentId: 'agent_occupancy',
  agentName: 'Occupancy Agent',
  agentType: 'occupancy',
  buildingId: 'building_A',
  status: 'online',
  capabilities: ['get_occupancy', 'identify_affected_zone', 'identify_assistance_requirements'],
});

latticeRegistry.registerAgent({
  agentId: 'agent_security',
  agentName: 'Security Agent',
  agentType: 'security',
  buildingId: 'building_A',
  status: 'online',
  capabilities: ['verify_incident', 'retrieve_security_event', 'check_access_status'],
});

latticeRegistry.registerAgent({
  agentId: 'agent_coordinator',
  agentName: 'Emergency Coordinator',
  agentType: 'coordinator',
  buildingId: 'building_A',
  status: 'online',
  capabilities: ['combine_assessments', 'detect_conflict', 'generate_response'],
});

latticeRegistry.registerAgent({
  agentId: 'agent_ethical_priority',
  agentName: 'Ethical Priority Agent',
  agentType: 'ethical-priority',
  buildingId: 'building_A',
  status: 'online',
  capabilities: ['evaluate_assistance_priority', 'evaluate_human_safety'],
});

latticeRegistry.registerAgent({
  agentId: 'agent_cross_building',
  agentName: 'Cross-Building Collaboration Agent',
  agentType: 'cross-building',
  buildingId: 'building_A',
  status: 'online',
  capabilities: ['identify_affected_buildings', 'prepare_notification', 'share_emergency_context'],
});

export const latticeRouter = new MessageRouter(latticeRegistry);
export { MessageFactory };

/**
 * Maps the SharedEmergencyState agentStates vocabulary
 * ('idle' | 'thinking' | 'sending' | 'receiving' | 'active' | 'alert' | 'completed' | 'offline')
 * onto the engine's AgentStatus vocabulary ('online' | 'offline' | 'degraded' | 'unknown'),
 * and pushes the result into the real registry so findAgentsByCapability()
 * correctly excludes offline agents.
 */
export function syncRegistryFromState(agentStates: SharedEmergencyState['agentStates']): void {
  Object.entries(agentStates).forEach(([agentId, uiStatus]) => {
    let engineStatus: EngineAgentStatus = 'online';
    if (uiStatus === 'offline') engineStatus = 'offline';
    else if (uiStatus === 'alert') engineStatus = 'degraded';
    latticeRegistry.updateAgentStatus(agentId, engineStatus);
  });
}
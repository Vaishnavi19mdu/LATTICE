/**
 * agentRegistryStore.ts
 *
 * Administrative registry layer for agents. This is intentionally thin:
 * it tracks the *administrative* record (who registered what, which
 * building it's assigned to, its declared capabilities) — it does NOT
 * reimplement agent runtime logic, message schemas, or the
 * interoperability layer. If your project already has a real
 * AgentRegistry class, point `addAgent()` at it (e.g. call
 * `existingAgentRegistry.register(...)` inside addAgent below) so this
 * stays a wrapper instead of a second, conflicting registry.
 */

import { useEffect, useState } from 'react';
import { incrementBuildingAgentCount, getBuildings } from './buildingStore';

export type AgentStatus = 'Active' | 'Inactive' | 'Maintenance';

export interface AgentRecord {
  id: string;
  agentId: string; // human-entered short code, e.g. "AGT-FIRE-D"
  name: string;
  type: string;
  description: string;
  assignedBuildingId: string; // BuildingRecord.id
  assignedBuildingName: string;
  department: string;
  capabilities: string[];
  status: AgentStatus;
  confidenceThreshold: number; // 0-100
  priorityLevel: 'Low' | 'Medium' | 'High';
  confidence: number | null; // live confidence, mock
  lastCommunication: string;
  registrationDate: string;
}

export const CAPABILITY_OPTIONS = [
  'detect_hazard',
  'assess_severity',
  'get_occupancy',
  'identify_affected_zone',
  'verify_incident',
  'generate_response',
];

const seedAgents: AgentRecord[] = [
  {
    id: 'a_fire',
    agentId: 'AGT-FIRE-A',
    name: 'Fire & Hazard Agent',
    type: 'Hazard Detection',
    description: 'Detects and tracks fire/hazard spread within a building.',
    assignedBuildingId: 'building_a',
    assignedBuildingName: 'Building A',
    department: 'Safety',
    capabilities: ['detect_hazard', 'assess_severity'],
    status: 'Active',
    confidenceThreshold: 80,
    priorityLevel: 'High',
    confidence: 96,
    lastCommunication: 'Just now',
    registrationDate: '2025-01-14',
  },
  {
    id: 'a_occ',
    agentId: 'AGT-OCC-A',
    name: 'Occupancy Agent',
    type: 'Occupant Tracking',
    description: 'Tracks real-time occupant counts and assistance needs.',
    assignedBuildingId: 'building_a',
    assignedBuildingName: 'Building A',
    department: 'Safety',
    capabilities: ['get_occupancy', 'identify_affected_zone'],
    status: 'Active',
    confidenceThreshold: 80,
    priorityLevel: 'High',
    confidence: 98,
    lastCommunication: '1 min ago',
    registrationDate: '2025-01-14',
  },
];

let agents: AgentRecord[] = [...seedAgents];
const listeners = new Set<() => void>();

function notify() {
  listeners.forEach((l) => l());
}

export function getAgents(): AgentRecord[] {
  return agents;
}

export interface NewAgentInput {
  name: string;
  agentId: string;
  type: string;
  description: string;
  assignedBuildingId: string;
  department: string;
  capabilities: string[];
  status: AgentStatus;
  confidenceThreshold: number;
  priorityLevel: 'Low' | 'Medium' | 'High';
}

export function addAgent(input: NewAgentInput): AgentRecord {
  const building = getBuildings().find((b) => b.id === input.assignedBuildingId);

  const record: AgentRecord = {
    id: `agent_${input.agentId.toLowerCase().replace(/[^a-z0-9]+/g, '_')}_${Date.now()}`,
    agentId: input.agentId,
    name: input.name,
    type: input.type,
    description: input.description,
    assignedBuildingId: input.assignedBuildingId,
    assignedBuildingName: building?.name ?? 'Unassigned',
    department: input.department,
    capabilities: input.capabilities,
    status: input.status,
    confidenceThreshold: input.confidenceThreshold,
    priorityLevel: input.priorityLevel,
    confidence: null,
    lastCommunication: 'Just registered',
    registrationDate: new Date().toISOString().slice(0, 10),
  };

  agents = [...agents, record];

  if (building) {
    incrementBuildingAgentCount(building.id);
  }

  notify();
  return record;
}

export function useAgentRegistry(): AgentRecord[] {
  const [snapshot, setSnapshot] = useState(agents);
  useEffect(() => {
    const listener = () => setSnapshot(agents);
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  }, []);
  return snapshot;
}
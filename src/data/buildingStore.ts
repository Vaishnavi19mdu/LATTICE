/**
 * buildingStore.ts
 *
 * Single source of truth for building records used by the System
 * Administrator dashboard. Deliberately NOT a prop passed down from one
 * component — it's a tiny module-level store with a subscribe/notify
 * pattern, so any component (now or later) can call useBuildings() and
 * stay in sync without prop drilling or duplicating the mock data.
 *
 * Swap-in note: to move this to Firebase later, keep the same public
 * shape (BuildingRecord[], addBuilding(), useBuildings()) and change only
 * the internals of this file — nothing that imports from here has to change.
 */

import { useEffect, useState } from 'react';

export type BuildingStatus = 'CRITICAL' | 'WARNING' | 'OPERATIONAL';
export type ConnectivityStatus = 'live' | 'degraded' | 'offline';

export interface BuildingRecord {
  id: string;
  buildingId: string; // human-entered short code, e.g. "BLDG-D"
  name: string;
  type: string;
  address: string;
  city: string;
  state: string;
  postalCode: string;
  floors: number;
  occupancyCapacity: number;
  assemblyPoint: string;
  emergencyContact: string;
  status: BuildingStatus;
  operator: string; // display name of assigned operator
  monitoringEnabled: boolean;
  occupancy: number; // current, live occupancy (mock)
  hazard: 'None' | 'Low' | 'Medium' | 'High';
  agentsOnline: number;
  agentsTotal: number;
  response: string;
  lastEvent: string;
  connectivity: ConnectivityStatus;
  createdDate: string;
}

const seedBuildings: BuildingRecord[] = [
  {
    id: 'building_a',
    buildingId: 'BLDG-A',
    name: 'Building A',
    type: 'Operations Tower',
    address: '1 LATTICE Way',
    city: 'Chennai',
    state: 'Tamil Nadu',
    postalCode: '600001',
    floors: 12,
    occupancyCapacity: 500,
    assemblyPoint: 'North Plaza',
    emergencyContact: 'Vaishnavi',
    status: 'CRITICAL',
    operator: 'Vaishnavi',
    monitoringEnabled: true,
    occupancy: 42,
    hazard: 'High',
    agentsOnline: 6,
    agentsTotal: 6,
    response: 'Evacuation in Progress',
    lastEvent: 'Floor 4 fire — Exit A blocked by smoke',
    connectivity: 'live',
    createdDate: '2025-01-14',
  },
  {
    id: 'building_b',
    buildingId: 'BLDG-B',
    name: 'Building B',
    type: 'North Block',
    address: '2 LATTICE Way',
    city: 'Chennai',
    state: 'Tamil Nadu',
    postalCode: '600001',
    floors: 8,
    occupancyCapacity: 350,
    assemblyPoint: 'East Courtyard',
    emergencyContact: 'Arun',
    status: 'WARNING',
    operator: 'Arun',
    monitoringEnabled: true,
    occupancy: 31,
    hazard: 'Low',
    agentsOnline: 5,
    agentsTotal: 6,
    response: 'Monitoring',
    lastEvent: 'Minor water leak on Floor 2 — resolved',
    connectivity: 'live',
    createdDate: '2025-01-14',
  },
  {
    id: 'building_c',
    buildingId: 'BLDG-C',
    name: 'Building C',
    type: 'South Block',
    address: '3 LATTICE Way',
    city: 'Chennai',
    state: 'Tamil Nadu',
    postalCode: '600001',
    floors: 6,
    occupancyCapacity: 250,
    assemblyPoint: 'South Lot',
    emergencyContact: 'Priya',
    status: 'OPERATIONAL',
    operator: 'Priya',
    monitoringEnabled: true,
    occupancy: 24,
    hazard: 'None',
    agentsOnline: 6,
    agentsTotal: 6,
    response: 'Normal',
    lastEvent: 'Routine agent health check passed',
    connectivity: 'live',
    createdDate: '2025-01-14',
  },
];

let buildings: BuildingRecord[] = [...seedBuildings];
const listeners = new Set<() => void>();

function notify() {
  listeners.forEach((l) => l());
}

export function getBuildings(): BuildingRecord[] {
  return buildings;
}

export interface NewBuildingInput {
  name: string;
  buildingId: string;
  type: string;
  address: string;
  city: string;
  state: string;
  postalCode: string;
  floors: number;
  occupancyCapacity: number;
  assemblyPoint: string;
  emergencyContact: string;
  status: BuildingStatus;
  operator: string;
  monitoringEnabled: boolean;
}

export function addBuilding(input: NewBuildingInput): BuildingRecord {
  const record: BuildingRecord = {
    id: `building_${input.buildingId.toLowerCase().replace(/[^a-z0-9]+/g, '_')}_${Date.now()}`,
    buildingId: input.buildingId,
    name: input.name,
    type: input.type,
    address: input.address,
    city: input.city,
    state: input.state,
    postalCode: input.postalCode,
    floors: input.floors,
    occupancyCapacity: input.occupancyCapacity,
    assemblyPoint: input.assemblyPoint,
    emergencyContact: input.emergencyContact,
    status: input.status,
    operator: input.operator,
    monitoringEnabled: input.monitoringEnabled,
    occupancy: 0,
    hazard: 'None',
    agentsOnline: 0,
    agentsTotal: 0,
    response: 'Normal',
    lastEvent: 'Building registered',
    connectivity: input.monitoringEnabled ? 'live' : 'offline',
    createdDate: new Date().toISOString().slice(0, 10),
  };
  buildings = [...buildings, record];
  notify();
  return record;
}

/** Called by agentStore.addAgent() so building agent counts stay accurate. */
export function incrementBuildingAgentCount(buildingRecordId: string) {
  buildings = buildings.map((b) =>
    b.id === buildingRecordId
      ? { ...b, agentsTotal: b.agentsTotal + 1, agentsOnline: b.agentsOnline + 1 }
      : b
  );
  notify();
}

export function useBuildings(): BuildingRecord[] {
  const [snapshot, setSnapshot] = useState(buildings);
  useEffect(() => {
    const listener = () => setSnapshot(buildings);
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  }, []);
  return snapshot;
}
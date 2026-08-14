/**
 * campusNetworkState.ts
 *
 * Additive mock/state layer for:
 *   1. CAMPUS BUILDING COMPARISON & NETWORK STATE
 *   2. CAMPUS CROSS-BUILDING MUTUAL AID NETWORK
 *
 * This intentionally does NOT duplicate SharedEmergencyState. Building A's
 * live fields (occupancy, hazard, exits, response) continue to come from
 * useEmergency(). This file only supplies the additional metadata LATTICE
 * doesn't already model: building identity, operator assignment, mutual aid
 * requests, resource availability, and the AI recommendation trail.
 */

export type BuildingId = 'building_A' | 'building_B' | 'building_C';

export interface BuildingOperatorInfo {
  name: string;
  online: boolean;
  activity: string;
}

export interface BuildingIdentityMeta {
  id: BuildingId;
  code: 'A' | 'B' | 'C';
  name: string;
  type: string;
  operator: BuildingOperatorInfo;
  agentsOnline: number;
  agentsTotal: number;
  networkConnectivity: 'CONNECTED' | 'DEGRADED' | 'OFFLINE';
}

// Static identity/operator metadata. Building A's status/hazard/occupancy is
// still derived live from SharedEmergencyState wherever it's rendered.
export const BUILDING_IDENTITY: Record<BuildingId, BuildingIdentityMeta> = {
  building_A: {
    id: 'building_A',
    code: 'A',
    name: 'Operations Tower',
    type: 'Executive / Labs / Operations',
    operator: { name: 'J. Alvarez — Building Operator', online: true, activity: 'Directing Floor 4 evacuation' },
    agentsOnline: 6,
    agentsTotal: 6,
    networkConnectivity: 'CONNECTED',
  },
  building_B: {
    id: 'building_B',
    code: 'B',
    name: 'North Block',
    type: 'Engineering',
    operator: { name: 'R. Kim — Building Operator', online: true, activity: 'Monitoring concourse damper status' },
    agentsOnline: 6,
    agentsTotal: 6,
    networkConnectivity: 'CONNECTED',
  },
  building_C: {
    id: 'building_C',
    code: 'C',
    name: 'South Block',
    type: 'Research',
    operator: { name: 'T. Osei — Building Operator', online: true, activity: 'Reviewing routine sensor sweep' },
    agentsOnline: 5,
    agentsTotal: 6,
    networkConnectivity: 'CONNECTED',
  },
};

// ---------------------------------------------------------------------------
// NETWORK SUMMARY
// ---------------------------------------------------------------------------

export interface NetworkSummary {
  connectedBuildings: string;
  activeIncidents: number;
  agentsOnline: string;
  mutualAidActive: number;
  pendingDecisions: number;
  networkHealthPct: number;
}

/**
 * Derives the compact network summary strip from live emergency state plus
 * the static identity table above, rather than hard-coding numbers.
 */
export function getNetworkSummary(params: { isEmergencyActive: boolean; hasCrossAlert: boolean }): NetworkSummary {
  const buildings = Object.values(BUILDING_IDENTITY);
  const agentsOnlineTotal = buildings.reduce((sum, b) => sum + b.agentsOnline, 0);
  const agentsTotal = buildings.reduce((sum, b) => sum + b.agentsTotal, 0);

  return {
    connectedBuildings: `${buildings.length} / ${buildings.length}`,
    activeIncidents: params.isEmergencyActive ? 1 : 0,
    agentsOnline: `${agentsOnlineTotal} / ${agentsTotal}`,
    mutualAidActive: params.hasCrossAlert ? 1 : 0,
    pendingDecisions: params.hasCrossAlert ? 2 : 0,
    networkHealthPct: agentsTotal === 0 ? 100 : Math.round((agentsOnlineTotal / agentsTotal) * 100),
  };
}

// ---------------------------------------------------------------------------
// MUTUAL AID REQUESTS
// ---------------------------------------------------------------------------

export type MutualAidStatus = 'ACTIVE' | 'DISPATCHED' | 'PENDING' | 'COMPLETED';

export interface MutualAidRequest {
  requestId: string;
  fromBuilding: BuildingId;
  toBuilding: BuildingId;
  supportType: string;
  reason: string;
  status: MutualAidStatus;
  requestedBy: string;
  coordinatedBy: string;
  approvedBy: string | null;
  timestamp: string;
}

export const MUTUAL_AID_QUEUE: MutualAidRequest[] = [
  {
    requestId: 'MA-021',
    fromBuilding: 'building_A',
    toBuilding: 'building_B',
    supportType: 'Security Personnel + Evacuation Assistance',
    reason: 'Floor 4 fire evacuation support',
    status: 'DISPATCHED',
    requestedBy: 'Building A Operator',
    coordinatedBy: 'Emergency Coordinator',
    approvedBy: 'Human Operator',
    timestamp: '10:42:11',
  },
  {
    requestId: 'MA-020',
    fromBuilding: 'building_C',
    toBuilding: 'building_A',
    supportType: 'Medical Support',
    reason: 'Precautionary standby for mobility-assist occupants',
    status: 'PENDING',
    requestedBy: 'Emergency Coordinator',
    coordinatedBy: 'Emergency Coordinator',
    approvedBy: null,
    timestamp: '10:39:47',
  },
  {
    requestId: 'MA-019',
    fromBuilding: 'building_B',
    toBuilding: 'building_C',
    supportType: 'Evacuation Assistance',
    reason: 'Drill support — closed out',
    status: 'COMPLETED',
    requestedBy: 'Building B Operator',
    coordinatedBy: 'Emergency Coordinator',
    approvedBy: 'Human Operator',
    timestamp: 'Yesterday 09:14:02',
  },
];

export const ACTIVE_MUTUAL_AID_REQUEST = MUTUAL_AID_QUEUE[0];

// ---------------------------------------------------------------------------
// RESOURCE AVAILABILITY
// ---------------------------------------------------------------------------

export interface ResourceAvailability {
  building: BuildingId;
  security: 'Available' | 'Limited' | 'Unavailable';
  personnel: number;
  status: 'Operational' | 'Monitoring' | 'Degraded';
  distance: 'Nearby' | 'Moderate' | 'Far';
  recommendation: 'RECOMMENDED' | 'NOT RECOMMENDED';
}

export const RESOURCE_AVAILABILITY: ResourceAvailability[] = [
  { building: 'building_B', security: 'Available', personnel: 2, status: 'Operational', distance: 'Nearby', recommendation: 'RECOMMENDED' },
  { building: 'building_C', security: 'Limited', personnel: 0, status: 'Monitoring', distance: 'Moderate', recommendation: 'NOT RECOMMENDED' },
];

// ---------------------------------------------------------------------------
// AI RECOMMENDATION
// ---------------------------------------------------------------------------

export interface AiMutualAidRecommendation {
  summary: string;
  confidencePct: number;
  recommendedSupport: string;
  source: string;
  approvalState: 'APPROVED' | 'PENDING HUMAN REVIEW';
}

export function getAiMutualAidRecommendation(hasCrossAlert: boolean): AiMutualAidRecommendation {
  return {
    summary:
      'Building B is the closest operational building with available security personnel. Mutual aid dispatch is recommended.',
    confidencePct: 94,
    recommendedSupport: '2 Security Personnel',
    source: 'Emergency Coordinator + Security Agent',
    approvalState: hasCrossAlert ? 'APPROVED' : 'PENDING HUMAN REVIEW',
  };
}

// ---------------------------------------------------------------------------
// CROSS-BUILDING COMMUNICATION FEED
// ---------------------------------------------------------------------------

export interface CommsMessage {
  id: string;
  senderName: string;
  senderRole: string;
  senderBuilding: BuildingId | 'campus';
  recipientName: string;
  recipientBuilding: BuildingId | 'campus';
  message: string;
  timestamp: string;
  status: 'sent' | 'acknowledged' | 'actioned';
}

export const CROSS_BUILDING_COMMS: CommsMessage[] = [
  {
    id: 'msg-1',
    senderName: 'Fire Hazard Agent',
    senderRole: 'Agent',
    senderBuilding: 'building_A',
    recipientName: 'Campus Coordinator',
    recipientBuilding: 'campus',
    message: 'Critical fire detected on Floor 4.',
    timestamp: '10:41:02',
    status: 'actioned',
  },
  {
    id: 'msg-2',
    senderName: 'Campus Coordinator',
    senderRole: 'Agent',
    senderBuilding: 'campus',
    recipientName: 'Security Agent',
    recipientBuilding: 'building_B',
    message: 'Confirm available support resources.',
    timestamp: '10:41:19',
    status: 'acknowledged',
  },
  {
    id: 'msg-3',
    senderName: 'Security Agent',
    senderRole: 'Agent',
    senderBuilding: 'building_B',
    recipientName: 'Campus Coordinator',
    recipientBuilding: 'campus',
    message: 'Two security personnel available.',
    timestamp: '10:41:44',
    status: 'actioned',
  },
  {
    id: 'msg-4',
    senderName: 'Campus Coordinator',
    senderRole: 'Agent',
    senderBuilding: 'campus',
    recipientName: 'Building Operator',
    recipientBuilding: 'building_A',
    message: 'Mutual aid from Building B recommended.',
    timestamp: '10:42:03',
    status: 'acknowledged',
  },
  {
    id: 'msg-5',
    senderName: 'Building A Operator',
    senderRole: 'Human',
    senderBuilding: 'building_A',
    recipientName: 'Campus Coordinator',
    recipientBuilding: 'campus',
    message: 'Approved.',
    timestamp: '10:42:11',
    status: 'actioned',
  },
];

// ---------------------------------------------------------------------------
// EVACUATION ROUTE MAP STATE (Building A / Floor 4)
// ---------------------------------------------------------------------------

export interface EvacuationExitState {
  label: 'EXIT A' | 'EXIT B' | 'EXIT C';
  role: 'BLOCKED' | 'PRIMARY' | 'ALTERNATE';
  note: string;
}

export function getEvacuationExitStates(exits: { A: string; B?: string; C?: string }): EvacuationExitState[] {
  const aBlocked = exits.A === 'blocked' || exits.A === 'unsafe';
  return [
    { label: 'EXIT A', role: 'BLOCKED', note: aBlocked ? 'BLOCKED / UNSAFE' : 'SAFE' },
    { label: 'EXIT B', role: 'PRIMARY', note: 'PRIMARY RECOMMENDED ROUTE' },
    { label: 'EXIT C', role: 'ALTERNATE', note: 'SECONDARY SAFE ROUTE' },
  ];
}
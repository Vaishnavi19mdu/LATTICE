import React, { useState, useEffect } from 'react';
import {
  Cpu,
  LayoutDashboard,
  Bot,
  ShieldAlert,
  GitMerge,
  LogOut,
  ArrowLeft,
  Building as BuildingIcon,
  CheckCircle2,
  Flame,
  Users,
  Shield,
  Brain,
  HeartHandshake,
  Network,
  AlertTriangle,
  ArrowRight,
  Columns,
  UserCheck,
  Settings as SettingsIcon,
  Menu,
  X,
  ClipboardList,
  Activity,
  Wifi,
  WifiOff,
  XCircle,
  FileEdit,
  Server,
  Lock,
  Bell,
  HelpCircle,
  UsersRound,
  Database,
  Radio,
  CircleDot,
  Eye,
} from 'lucide-react';

/* ============================================================================
   TYPES
   ========================================================================== */

type AdminTab =
  | 'overview'
  | 'people'
  | 'buildings'
  | 'agents'
  | 'activity'
  | 'emergency'
  | 'decision'
  | 'audit'
  | 'settings';

type BuildingStatus = 'CRITICAL' | 'WARNING' | 'OPERATIONAL';
type AgentStatus = 'online' | 'degraded' | 'offline' | 'unknown';
type DecisionStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'MODIFIED';
type PersonStatus = 'online' | 'offline';
type ActivityType = 'human' | 'agent' | 'system' | 'emergency' | 'override';
type IncidentStatus = 'ACTIVE' | 'RESOLVED' | 'NORMAL';
type AuditCategory = 'agent' | 'emergency' | 'decision' | 'override' | 'failure' | 'auth' | 'system';

interface PersonData {
  id: string;
  name: string;
  role: string;
  department: string;
  building: string; // "Building A" | "Building B" | "Building C" | "Entire LATTICE System"
  status: PersonStatus;
  currentActivity: string;
  lastAction: string;
  lastActive: string;
  accessLevel: string;
  avatar: string;
}

interface SysBuildingData {
  id: string;
  code: 'A' | 'B' | 'C';
  name: string;
  type: string;
  status: BuildingStatus;
  operator: string;
  occupancy: number;
  hazard: 'None' | 'Low' | 'Medium' | 'High';
  agentsOnline: number;
  agentsTotal: number;
  response: string;
  lastEvent: string;
  connectivity: 'live' | 'degraded' | 'offline';
}

interface SysAgentData {
  id: string;
  name: string;
  building: 'Building A' | 'Building B' | 'Building C' | 'System';
  capability: string;
  currentTask: string;
  status: AgentStatus;
  confidence: number | null;
  lastMessage: string;
  latencyMs: number | null;
  icon: any;
}

interface ActivityEvent {
  id: string;
  time: string;
  actor: string;
  actorRole: string;
  action: string;
  building: string;
  type: ActivityType;
}

interface EmergencyIncident {
  id: string;
  building: string;
  zone: string;
  type: string;
  severity: 'CRITICAL' | 'HIGH' | 'MODERATE' | 'LOW';
  occupancy: number;
  operator: string;
  activeAgents: number;
  response: string;
  aiDecision: string;
  mutualAid: string;
  status: IncidentStatus;
  time: string;
}

interface SysDecision {
  id: string;
  title: string;
  recommendation: string;
  confidence: number;
  riskLevel: 'Low' | 'Medium' | 'High' | 'Critical';
  responsibleOperator: string;
  building: string;
  operatorAction: DecisionStatus;
  finalDecision: string;
  timestamp: string;
}

interface AuditEvent {
  id: string;
  time: string;
  title: string;
  detail: string;
  building: string;
  category: AuditCategory;
  actor: string;
}

interface SystemHealthItem {
  id: string;
  label: string;
  status: 'healthy' | 'degraded' | 'down';
  detail: string;
  icon: any;
}

interface AdministratorDashboardProps {
  onNavigateToLanding: () => void;
  onLogout?: () => void;
}

/* ============================================================================
   CENTRALIZED MOCK DATA
   (Swap for live Firebase / interoperability-layer data later. Everything the
   UI renders is derived from these arrays so there is a single source of truth.)
   ========================================================================== */

const PEOPLE: PersonData[] = [
  {
    id: 'p_vaishnavi',
    name: 'Vaishnavi',
    role: 'Building Operator',
    department: 'Building Operations',
    building: 'Building A',
    status: 'online',
    currentActivity: 'Monitoring Floor 4',
    lastAction: 'Approved evacuation route',
    lastActive: '2 min ago',
    accessLevel: 'Building-level',
    avatar: 'V',
  },
  {
    id: 'p_arun',
    name: 'Arun',
    role: 'Building Operator',
    department: 'Building Operations',
    building: 'Building B',
    status: 'online',
    currentActivity: 'Monitoring building state',
    lastAction: 'Reviewed security alert',
    lastActive: '5 min ago',
    accessLevel: 'Building-level',
    avatar: 'A',
  },
  {
    id: 'p_priya',
    name: 'Priya',
    role: 'Building Operator',
    department: 'Building Operations',
    building: 'Building C',
    status: 'offline',
    currentActivity: '—',
    lastAction: 'Logged out',
    lastActive: '1 hr ago',
    accessLevel: 'Building-level',
    avatar: 'P',
  },
  {
    id: 'p_sysadmin',
    name: 'System Administrator',
    role: 'System Administrator',
    department: 'System Administration',
    building: 'Entire LATTICE System',
    status: 'online',
    currentActivity: 'System monitoring',
    lastAction: 'Reviewed pending decision (Mutual aid — Building A)',
    lastActive: 'Just now',
    accessLevel: 'System-wide',
    avatar: '🌐',
  },
];

const SYS_BUILDINGS: SysBuildingData[] = [
  {
    id: 'building_a',
    code: 'A',
    name: 'Building A',
    type: 'Operations Tower',
    status: 'CRITICAL',
    operator: 'Vaishnavi',
    occupancy: 42,
    hazard: 'High',
    agentsOnline: 6,
    agentsTotal: 6,
    response: 'Evacuation in Progress',
    lastEvent: 'Floor 4 fire — Exit A blocked by smoke',
    connectivity: 'live',
  },
  {
    id: 'building_b',
    code: 'B',
    name: 'Building B',
    type: 'North Block',
    status: 'WARNING',
    operator: 'Arun',
    occupancy: 31,
    hazard: 'Low',
    agentsOnline: 5,
    agentsTotal: 6,
    response: 'Monitoring',
    lastEvent: 'Minor water leak on Floor 2 — resolved',
    connectivity: 'live',
  },
  {
    id: 'building_c',
    code: 'C',
    name: 'Building C',
    type: 'South Block',
    status: 'OPERATIONAL',
    operator: 'Priya',
    occupancy: 24,
    hazard: 'None',
    agentsOnline: 6,
    agentsTotal: 6,
    response: 'Normal',
    lastEvent: 'Routine agent health check passed',
    connectivity: 'live',
  },
];

const SYS_AGENTS: SysAgentData[] = [
  { id: 'a_fire', name: 'Fire & Hazard Agent', building: 'Building A', capability: 'Hazard detection', currentTask: 'Tracking smoke spread on Floor 4', status: 'online', confidence: 96, lastMessage: 'Confirmed Floor 4 smoke spread to stairwell B.', latencyMs: 120, icon: Flame },
  { id: 'a_occ', name: 'Occupancy Agent', building: 'Building A', capability: 'Occupant tracking', currentTask: 'Tracking 42 occupants', status: 'online', confidence: 98, lastMessage: '42 occupants detected, 3 assistance requirements.', latencyMs: 95, icon: Users },
  { id: 'a_sec', name: 'Security Agent', building: 'Building A', capability: 'Access & egress control', currentTask: 'Managing exit lockdown', status: 'online', confidence: 94, lastMessage: 'Exit A locked down, Exit B verified clear.', latencyMs: 140, icon: Shield },
  { id: 'a_coord', name: 'Building Coordinator', building: 'Building A', capability: 'Local response planning', currentTask: 'Coordinating evacuation plan', status: 'online', confidence: 95, lastMessage: 'Recommending evacuation via Exit B.', latencyMs: 110, icon: Brain },
  { id: 'a_eth', name: 'Ethical Priority Agent', building: 'Building A', capability: 'Vulnerable-occupant priority', currentTask: 'Flagging priority occupants', status: 'online', confidence: 90, lastMessage: 'Flagged 3 mobility-assistance occupants for priority egress.', latencyMs: 160, icon: HeartHandshake },
  { id: 'a_cross', name: 'Cross-Building Liaison', building: 'Building A', capability: 'Inter-building messaging', currentTask: 'Requesting mutual aid', status: 'online', confidence: 88, lastMessage: 'Requested mutual aid from Building B.', latencyMs: 210, icon: Network },

  { id: 'b_fire', name: 'Fire & Hazard Agent', building: 'Building B', capability: 'Hazard detection', currentTask: 'Idle — no hazards', status: 'online', confidence: 92, lastMessage: 'No hazards detected.', latencyMs: 105, icon: Flame },
  { id: 'b_occ', name: 'Occupancy Agent', building: 'Building B', capability: 'Occupant tracking', currentTask: 'Tracking 31 occupants', status: 'online', confidence: 95, lastMessage: '31 occupants, no assistance requirements.', latencyMs: 90, icon: Users },
  { id: 'b_sec', name: 'Security Agent', building: 'Building B', capability: 'Access & egress control', currentTask: 'Monitoring corridor to Building A', status: 'online', confidence: 91, lastMessage: 'Adjacent corridor to Building A confirmed clear.', latencyMs: 130, icon: Shield },
  { id: 'b_coord', name: 'Building Coordinator', building: 'Building B', capability: 'Local response planning', currentTask: 'On standby for mutual aid overflow', status: 'online', confidence: 93, lastMessage: 'On standby to receive mutual aid overflow.', latencyMs: 100, icon: Brain },
  { id: 'b_eth', name: 'Ethical Priority Agent', building: 'Building B', capability: 'Vulnerable-occupant priority', currentTask: 'Idle', status: 'online', confidence: 89, lastMessage: 'No priority flags active.', latencyMs: 150, icon: HeartHandshake },
  { id: 'b_cross', name: 'Cross-Building Liaison', building: 'Building B', capability: 'Inter-building messaging', currentTask: 'Reconnecting session', status: 'degraded', confidence: 74, lastMessage: 'Message ack delayed by ~2.4s.', latencyMs: 480, icon: Network },

  { id: 'c_fire', name: 'Fire & Hazard Agent', building: 'Building C', capability: 'Hazard detection', currentTask: 'Idle — no hazards', status: 'online', confidence: 90, lastMessage: 'No hazards detected.', latencyMs: 115, icon: Flame },
  { id: 'c_occ', name: 'Occupancy Agent', building: 'Building C', capability: 'Occupant tracking', currentTask: 'Tracking 24 occupants', status: 'online', confidence: 93, lastMessage: '24 occupants, no assistance requirements.', latencyMs: 100, icon: Users },
  { id: 'c_sec', name: 'Security Agent', building: 'Building C', capability: 'Access & egress control', currentTask: 'Idle — monitoring access points', status: 'online', confidence: 92, lastMessage: 'All access points nominal.', latencyMs: 118, icon: Shield },
  { id: 'c_coord', name: 'Building Coordinator', building: 'Building C', capability: 'Local response planning', currentTask: 'Idle — no action required', status: 'online', confidence: 92, lastMessage: 'No action required.', latencyMs: 108, icon: Brain },
  { id: 'c_eth', name: 'Ethical Priority Agent', building: 'Building C', capability: 'Vulnerable-occupant priority', currentTask: 'Idle', status: 'online', confidence: 91, lastMessage: 'No priority flags active.', latencyMs: 140, icon: HeartHandshake },
  { id: 'c_cross', name: 'Cross-Building Liaison', building: 'Building C', capability: 'Inter-building messaging', currentTask: 'Listening for broadcasts', status: 'offline', confidence: null, lastMessage: 'Connection lost — attempting reconnect.', latencyMs: null, icon: Network },

  { id: 'net_coord', name: 'Network Coordinator', building: 'System', capability: 'Campus-wide arbitration', currentTask: 'Arbitrating mutual aid request', status: 'online', confidence: 97, lastMessage: 'Mutual aid recommended: Building B → Building A.', latencyMs: 60, icon: Brain },
  { id: 'net_registry', name: 'Network Registry', building: 'System', capability: 'Agent discovery & capability index', currentTask: 'Indexing agent capabilities', status: 'online', confidence: 99, lastMessage: '18 agents indexed across 3 buildings.', latencyMs: 40, icon: Server },
];

const ACTIVITY_FEED: ActivityEvent[] = [
  { id: 'act1', time: '10:42:11', actor: 'Vaishnavi', actorRole: 'Building Operator', action: 'Approved evacuation plan', building: 'Building A', type: 'human' },
  { id: 'act2', time: '10:42:08', actor: 'Building Coordinator', actorRole: 'Agent', action: 'Generated revised evacuation route', building: 'Building A', type: 'agent' },
  { id: 'act3', time: '10:42:04', actor: 'Fire & Hazard Agent', actorRole: 'Agent', action: 'Reported smoke propagation to stairwell B', building: 'Building A', type: 'agent' },
  { id: 'act4', time: '10:41:57', actor: 'Arun', actorRole: 'Building Operator', action: 'Reviewed security alert', building: 'Building B', type: 'human' },
  { id: 'act5', time: '10:41:50', actor: 'Network Coordinator', actorRole: 'Agent', action: 'Requested mutual aid corridor from Building B', building: 'System', type: 'system' },
  { id: 'act6', time: '10:41:44', actor: 'System', actorRole: 'System', action: 'Critical incident created in Building A', building: 'Building A', type: 'emergency' },
  { id: 'act7', time: '10:41:20', actor: 'Vaishnavi', actorRole: 'Building Operator', action: 'Modified recommended evacuation route (Exit A → Exit B)', building: 'Building A', type: 'override' },
  { id: 'act8', time: '10:40:58', actor: 'Occupancy Agent', actorRole: 'Agent', action: 'Flagged 3 occupants requiring mobility assistance', building: 'Building A', type: 'agent' },
  { id: 'act9', time: '10:40:31', actor: 'Security Agent', actorRole: 'Agent', action: 'Locked down Exit A', building: 'Building A', type: 'agent' },
  { id: 'act10', time: '10:39:52', actor: 'Cross-Building Liaison', actorRole: 'Agent', action: 'Connection degraded, latency exceeded 400ms', building: 'Building C', type: 'system' },
  { id: 'act11', time: '10:38:40', actor: 'Priya', actorRole: 'Building Operator', action: 'Logged out', building: 'Building C', type: 'human' },
  { id: 'act12', time: '10:36:02', actor: 'System', actorRole: 'System', action: 'Building B connected to LATTICE network', building: 'Building B', type: 'system' },
  { id: 'act13', time: '10:34:15', actor: 'Arun', actorRole: 'Building Operator', action: 'Resolved Floor 2 water leak alert', building: 'Building B', type: 'human' },
  { id: 'act14', time: '10:31:08', actor: 'Fire & Hazard Agent', actorRole: 'Agent', action: 'Reported minor water leak on Floor 2', building: 'Building B', type: 'agent' },
  { id: 'act15', time: '10:28:44', actor: 'System Administrator', actorRole: 'System Administrator', action: 'Reviewed audit log for Building A', building: 'System', type: 'system' },
  { id: 'act16', time: '10:26:19', actor: 'Network Registry', actorRole: 'Agent', action: 'Indexed 18 agents across 3 buildings', building: 'System', type: 'system' },
  { id: 'act17', time: '10:22:03', actor: 'Building Coordinator', actorRole: 'Agent', action: 'Completed scheduled health check', building: 'Building C', type: 'agent' },
  { id: 'act18', time: '10:15:50', actor: 'Vaishnavi', actorRole: 'Building Operator', action: 'Logged in', building: 'Building A', type: 'human' },
  { id: 'act19', time: '10:12:37', actor: 'Arun', actorRole: 'Building Operator', action: 'Logged in', building: 'Building B', type: 'human' },
  { id: 'act20', time: '10:05:22', actor: 'System Administrator', actorRole: 'System Administrator', action: 'Logged in', building: 'System', type: 'human' },
  { id: 'act21', time: '09:58:14', actor: 'Ethical Priority Agent', actorRole: 'Agent', action: 'Completed vulnerable-occupant sweep, no flags', building: 'Building B', type: 'agent' },
  { id: 'act22', time: '09:47:02', actor: 'System', actorRole: 'System', action: 'Nightly configuration snapshot completed', building: 'System', type: 'system' },
];

const EMERGENCY_INCIDENTS: EmergencyIncident[] = [
  {
    id: 'inc1',
    building: 'Building A',
    zone: 'Floor 4',
    type: 'Fire',
    severity: 'CRITICAL',
    occupancy: 42,
    operator: 'Vaishnavi',
    activeAgents: 6,
    response: 'Evacuation in Progress',
    aiDecision: 'Approved',
    mutualAid: 'Requested — Building B',
    status: 'ACTIVE',
    time: '22:41:04',
  },
  {
    id: 'inc2',
    building: 'Building B',
    zone: 'Floor 2',
    type: 'Water Leak',
    severity: 'LOW',
    occupancy: 31,
    operator: 'Arun',
    activeAgents: 2,
    response: 'Resolved',
    aiDecision: 'Approved',
    mutualAid: 'Not required',
    status: 'RESOLVED',
    time: '10:31:08',
  },
  {
    id: 'inc3',
    building: 'Building C',
    zone: '—',
    type: 'No active incident',
    severity: 'LOW',
    occupancy: 24,
    operator: 'Priya',
    activeAgents: 0,
    response: 'Normal operations',
    aiDecision: '—',
    mutualAid: '—',
    status: 'NORMAL',
    time: '—',
  },
];

const SYS_DECISIONS: SysDecision[] = [
  {
    id: 'd1',
    title: 'Mutual aid request from Building A',
    recommendation: 'Approve mutual aid corridor from Building B to receive Building A overflow.',
    confidence: 94,
    riskLevel: 'High',
    responsibleOperator: 'Vaishnavi (Building A)',
    building: 'Building A / Building B',
    operatorAction: 'PENDING',
    finalDecision: 'Awaiting review',
    timestamp: '22:41:20',
  },
  {
    id: 'd2',
    title: 'Avoid Exit A — reroute evacuation',
    recommendation: 'Route Building A occupants to Exit B; Exit A compromised by smoke.',
    confidence: 91,
    riskLevel: 'Critical',
    responsibleOperator: 'Vaishnavi (Building A)',
    building: 'Building A',
    operatorAction: 'MODIFIED',
    finalDecision: 'Use Exit B, with staged release for Floor 3',
    timestamp: '22:41:11',
  },
  {
    id: 'd3',
    title: 'Escalate Floor 2 leak to maintenance emergency',
    recommendation: 'Classify Floor 2 water leak as an emergency requiring building-wide notice.',
    confidence: 68,
    riskLevel: 'Low',
    responsibleOperator: 'Arun (Building B)',
    building: 'Building B',
    operatorAction: 'REJECTED',
    finalDecision: 'Handled as routine maintenance ticket',
    timestamp: '10:31:40',
  },
  {
    id: 'd4',
    title: 'Campus-wide precautionary advisory',
    recommendation: 'Broadcast advisory to Buildings B and C about the Building A incident.',
    confidence: 82,
    riskLevel: 'Medium',
    responsibleOperator: 'System Administrator',
    building: 'Building A / B / C',
    operatorAction: 'APPROVED',
    finalDecision: 'Advisory broadcast to all buildings',
    timestamp: '22:41:45',
  },
];

const SYS_AUDIT_EVENTS: AuditEvent[] = [
  { id: 'e1', time: '22:41:04', title: 'Fire Agent detected high smoke level', detail: 'Sensor cluster 4B crossed critical threshold.', building: 'Building A', category: 'agent', actor: 'Fire & Hazard Agent' },
  { id: 'e2', time: '22:41:07', title: 'Occupancy Agent reported 42 occupants', detail: '3 flagged for mobility assistance.', building: 'Building A', category: 'agent', actor: 'Occupancy Agent' },
  { id: 'e3', time: '22:41:11', title: 'Coordinator flagged Exit A unsafe', detail: 'Smoke concentration exceeded egress safety limit.', building: 'Building A', category: 'emergency', actor: 'Building Coordinator' },
  { id: 'e4', time: '22:41:15', title: 'Network Coordinator requested Building B support', detail: 'Mutual aid corridor request broadcast.', building: 'System', category: 'decision', actor: 'Network Coordinator' },
  { id: 'e5', time: '22:41:20', title: 'Mutual aid decision opened for review', detail: 'Awaiting Building A operator sign-off.', building: 'System', category: 'decision', actor: 'Network Coordinator' },
  { id: 'e6', time: '22:39:52', title: 'Building C Cross-Building Liaison went offline', detail: 'Heartbeat timeout after 3 missed pings.', building: 'Building C', category: 'failure', actor: 'Cross-Building Liaison' },
  { id: 'e7', time: '22:38:30', title: 'Operator override on Building A response plan', detail: 'Manual note appended to auto-generated plan.', building: 'Building A', category: 'override', actor: 'Vaishnavi' },
  { id: 'e8', time: '22:36:02', title: 'Building B Cross-Building Liaison degraded', detail: 'Latency exceeded 400ms threshold.', building: 'Building B', category: 'failure', actor: 'Cross-Building Liaison' },
  { id: 'e9', time: '10:34:15', title: 'Building B leak alert resolved', detail: 'Operator confirmed leak contained by maintenance.', building: 'Building B', category: 'decision', actor: 'Arun' },
  { id: 'e10', time: '10:15:50', title: 'Vaishnavi logged in', detail: 'Session started from Building A operator console.', building: 'Building A', category: 'auth', actor: 'Vaishnavi' },
  { id: 'e11', time: '10:12:37', title: 'Arun logged in', detail: 'Session started from Building B operator console.', building: 'Building B', category: 'auth', actor: 'Arun' },
  { id: 'e12', time: '10:05:22', title: 'System Administrator logged in', detail: 'Session started from System Administration console.', building: 'System', category: 'auth', actor: 'System Administrator' },
  { id: 'e13', time: '09:47:02', title: 'Nightly configuration snapshot completed', detail: 'System configuration and agent registry archived.', building: 'System', category: 'system', actor: 'System' },
  { id: 'e14', time: '09:30:11', title: 'Scheduled agent health check completed', detail: '17 / 18 agents passed, 1 flagged.', building: 'System', category: 'agent', actor: 'System' },
];

const SYSTEM_HEALTH: SystemHealthItem[] = [
  { id: 'h1', label: 'Authentication', status: 'healthy', detail: '4 / 4 accounts active, no failed logins', icon: Lock },
  { id: 'h2', label: 'Buildings', status: 'healthy', detail: '3 / 3 buildings connected', icon: BuildingIcon },
  { id: 'h3', label: 'Agents', status: 'degraded', detail: '17 / 18 online, 1 degraded/offline', icon: Bot },
  { id: 'h4', label: 'Interoperability Layer', status: 'healthy', detail: 'Message routing nominal, 96ms avg latency', icon: Network },
  { id: 'h5', label: 'Firebase', status: 'healthy', detail: 'Connected, realtime sync active', icon: Database },
  { id: 'h6', label: 'AI Services', status: 'healthy', detail: 'All model endpoints responding', icon: Brain },
  { id: 'h7', label: 'Simulation Engine', status: 'healthy', detail: 'Running — Building A emergency scenario', icon: Radio },
];

/* ============================================================================
   STYLE HELPERS
   ========================================================================== */

const STATUS_STYLES: Record<BuildingStatus, { text: string; bg: string; border: string; label: string }> = {
  CRITICAL: { text: 'text-[#E26161]', bg: 'bg-[#E26161]/10', border: 'border-[#E26161]/30', label: '🔴 CRITICAL' },
  WARNING: { text: 'text-[#E6B85C]', bg: 'bg-[#E6B85C]/10', border: 'border-[#E6B85C]/30', label: '⚠ WARNING' },
  OPERATIONAL: { text: 'text-[#7AE04C]', bg: 'bg-[#7AE04C]/10', border: 'border-[#7AE04C]/30', label: '● OPERATIONAL' },
};

const AGENT_STATUS_STYLES: Record<AgentStatus, { text: string; label: string; icon: any }> = {
  online: { text: 'text-[#7AE04C]', label: 'Active', icon: Wifi },
  degraded: { text: 'text-[#E6B85C]', label: 'Degraded', icon: AlertTriangle },
  offline: { text: 'text-[#E26161]', label: 'Offline', icon: WifiOff },
  unknown: { text: 'text-[#565E75]', label: 'Unknown', icon: HelpCircle },
};

const CATEGORY_STYLES: Record<AuditCategory, { text: string; bg: string; label: string }> = {
  agent: { text: 'text-[#6B9FD4]', bg: 'bg-[#6B9FD4]/10', label: 'AGENT' },
  emergency: { text: 'text-[#E26161]', bg: 'bg-[#E26161]/10', label: 'EMERGENCY' },
  decision: { text: 'text-[#A99BC9]', bg: 'bg-[#A99BC9]/10', label: 'DECISION' },
  override: { text: 'text-[#E6B85C]', bg: 'bg-[#E6B85C]/10', label: 'OVERRIDE' },
  failure: { text: 'text-[#E26161]', bg: 'bg-[#E26161]/10', label: 'FAILURE' },
  auth: { text: 'text-[#7AE04C]', bg: 'bg-[#7AE04C]/10', label: 'AUTH' },
  system: { text: 'text-[#565E75]', bg: 'bg-[#565E75]/10', label: 'SYSTEM' },
};

const ACTIVITY_TYPE_STYLES: Record<ActivityType, { text: string; bg: string; label: string; icon: any }> = {
  human: { text: 'text-[#7AE04C]', bg: 'bg-[#7AE04C]/10', label: 'HUMAN', icon: UsersRound },
  agent: { text: 'text-[#6B9FD4]', bg: 'bg-[#6B9FD4]/10', label: 'AGENT', icon: Bot },
  system: { text: 'text-[#565E75]', bg: 'bg-[#565E75]/10', label: 'SYSTEM', icon: Server },
  emergency: { text: 'text-[#E26161]', bg: 'bg-[#E26161]/10', label: 'EMERGENCY', icon: ShieldAlert },
  override: { text: 'text-[#E6B85C]', bg: 'bg-[#E6B85C]/10', label: 'OVERRIDE', icon: FileEdit },
};

const RISK_STYLES: Record<SysDecision['riskLevel'], string> = {
  Low: 'text-[#7AE04C] bg-[#7AE04C]/10 border-[#7AE04C]/30',
  Medium: 'text-[#E6B85C] bg-[#E6B85C]/10 border-[#E6B85C]/30',
  High: 'text-[#E26161] bg-[#E26161]/10 border-[#E26161]/30',
  Critical: 'text-[#E26161] bg-[#E26161]/15 border-[#E26161]/40',
};

const DECISION_STATUS_STYLES: Record<DecisionStatus, string> = {
  PENDING: 'bg-[#E6B85C]/15 border-[#E6B85C]/50 text-[#292733]',
  APPROVED: 'bg-[#7AE04C]/20 border-[#7AE04C] text-[#292733]',
  REJECTED: 'bg-[#E26161]/20 border-[#E26161] text-[#E26161]',
  MODIFIED: 'bg-[#6B9FD4]/15 border-[#6B9FD4]/50 text-[#292733]',
};

const HEALTH_STYLES: Record<SystemHealthItem['status'], { text: string; dot: string; label: string }> = {
  healthy: { text: 'text-[#7AE04C]', dot: 'bg-[#7AE04C]', label: 'HEALTHY' },
  degraded: { text: 'text-[#E6B85C]', dot: 'bg-[#E6B85C]', label: 'DEGRADED' },
  down: { text: 'text-[#E26161]', dot: 'bg-[#E26161]', label: 'DOWN' },
};

const SEVERITY_STYLES: Record<EmergencyIncident['severity'], string> = {
  CRITICAL: 'text-[#E26161] bg-[#E26161]/10 border-[#E26161]/30',
  HIGH: 'text-[#E26161] bg-[#E26161]/10 border-[#E26161]/30',
  MODERATE: 'text-[#E6B85C] bg-[#E6B85C]/10 border-[#E6B85C]/30',
  LOW: 'text-[#7AE04C] bg-[#7AE04C]/10 border-[#7AE04C]/30',
};

const INCIDENT_STATUS_STYLES: Record<IncidentStatus, string> = {
  ACTIVE: 'text-[#E26161] bg-[#E26161]/10 border-[#E26161]/30',
  RESOLVED: 'text-[#6B9FD4] bg-[#6B9FD4]/10 border-[#6B9FD4]/30',
  NORMAL: 'text-[#7AE04C] bg-[#7AE04C]/10 border-[#7AE04C]/30',
};

/* ============================================================================
   SMALL PRESENTATIONAL COMPONENTS
   ========================================================================== */

const SummaryCard: React.FC<{ label: string; value: string; sub?: string; accent: string }> = ({ label, value, sub, accent }) => (
  <div className="bg-white border border-[#423F4F]/10 rounded-[8px] p-4 shadow-sm space-y-1.5">
    <span className="font-mono-tech text-[10px] text-[#A99BC9] uppercase font-bold block">{label}</span>
    <span className="text-2xl font-extrabold text-[#292733] block leading-none" style={{ color: accent }}>
      {value}
    </span>
    {sub && <span className="text-[10px] text-[#565E75] font-mono-tech font-bold block">{sub}</span>}
  </div>
);

const SectionHeader: React.FC<{ title: string; subtitle: string }> = ({ title, subtitle }) => (
  <div className="bg-white p-6 rounded-[8px] border border-[#423F4F]/10 shadow-sm">
    <h1 className="text-2xl font-extrabold text-[#292733] mb-1">{title}</h1>
    <p className="text-xs text-[#565E75]">{subtitle}</p>
  </div>
);

/* ============================================================================
   MAIN COMPONENT
   ========================================================================== */

export const AdministratorDashboard: React.FC<AdministratorDashboardProps> = ({ onNavigateToLanding, onLogout }) => {
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [auditFilter, setAuditFilter] = useState<'all' | AuditCategory | 'Building A' | 'Building B' | 'Building C'>('all');
  const [visibleActivityCount, setVisibleActivityCount] = useState(6);
  const [selectedIncidentId, setSelectedIncidentId] = useState<string | null>(EMERGENCY_INCIDENTS[0]?.id ?? null);

  // Reveal the live activity feed progressively.
  useEffect(() => {
    if (visibleActivityCount >= ACTIVITY_FEED.length) return;
    const t = setTimeout(() => setVisibleActivityCount((c) => c + 1), 2200);
    return () => clearTimeout(t);
  }, [visibleActivityCount]);

  const onlineAgents = SYS_AGENTS.filter((a) => a.status === 'online').length;
  const totalAgents = SYS_AGENTS.length;
  const onlinePeople = PEOPLE.filter((p) => p.status === 'online').length;
  const criticalBuildings = SYS_BUILDINGS.filter((b) => b.status === 'CRITICAL').length;
  const pendingCount = SYS_DECISIONS.filter((d) => d.operatorAction === 'PENDING').length;
  const activeIncidents = EMERGENCY_INCIDENTS.filter((i) => i.status === 'ACTIVE').length;

  const handleLogout = async () => {
    try {
      if (onLogout) await onLogout();
    } finally {
      onNavigateToLanding();
    }
  };

  const filteredAudit = SYS_AUDIT_EVENTS.filter((ev) => {
    if (auditFilter === 'all') return true;
    if (['agent', 'emergency', 'decision', 'override', 'failure', 'auth', 'system'].includes(auditFilter)) {
      return ev.category === auditFilter;
    }
    return ev.building === auditFilter;
  });

  const selectedIncident = EMERGENCY_INCIDENTS.find((i) => i.id === selectedIncidentId) ?? null;

  const navButtonClass = (tab: AdminTab) =>
    `w-full flex items-center gap-3 px-3.5 py-2.5 rounded-[6px] font-bold transition-all text-left cursor-pointer focus-visible:outline-2 focus-visible:outline-[#A99BC9] ${
      activeTab === tab
        ? 'bg-[#423F4F] text-[#F3F3F3] border border-[#565E75]'
        : 'text-[#F3F3F3]/70 hover:text-[#F3F3F3] hover:bg-[#423F4F]/40'
    }`;

  return (
    <div className="min-h-screen bg-[#F3F3F3] text-[#423F4F] flex flex-col md:flex-row font-sans">
      {/* ==================== SIDEBAR ==================== */}
      <aside className="w-full md:w-72 bg-[#292733] text-[#F3F3F3] border-r border-[#423F4F] flex flex-col justify-between shrink-0">
        <div>
          <div className="p-4 sm:p-5 border-b border-[#565E75]/30 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-[#423F4F] rounded-[4px] border border-[#565E75] flex items-center justify-center font-bold">
                <Cpu className="w-4 h-4 text-[#A99BC9]" />
              </div>
              <div>
                <span className="font-extrabold text-base sm:text-lg tracking-wider text-[#F3F3F3] block leading-none">LATTICE</span>
                <span className="font-mono-tech text-[9px] text-[#A99BC9] tracking-widest uppercase">SYSTEM ADMINISTRATION</span>
              </div>
            </div>

            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 text-[#A99BC9] hover:text-[#F3F3F3] hover:bg-[#423F4F] rounded transition-colors cursor-pointer"
              aria-label="Toggle Navigation Menu"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

          <div className={`${isMobileMenuOpen ? 'block' : 'hidden md:block'}`}>
            <nav className="p-4 space-y-1 font-mono-tech text-xs uppercase tracking-wider">
              <button onClick={() => { setActiveTab('overview'); setIsMobileMenuOpen(false); }} className={navButtonClass('overview')}>
                <LayoutDashboard className="w-4 h-4 text-[#A99BC9]" />
                <span>Overview</span>
              </button>
              <button onClick={() => { setActiveTab('people'); setIsMobileMenuOpen(false); }} className={navButtonClass('people')}>
                <UsersRound className="w-4 h-4 text-[#7AE04C]" />
                <span>People &amp; Roles</span>
              </button>
              <button onClick={() => { setActiveTab('buildings'); setIsMobileMenuOpen(false); }} className={navButtonClass('buildings')}>
                <Columns className="w-4 h-4 text-[#6B9FD4]" />
                <span>Buildings</span>
              </button>
              <button onClick={() => { setActiveTab('agents'); setIsMobileMenuOpen(false); }} className={navButtonClass('agents')}>
                <Bot className="w-4 h-4 text-[#6B9FD4]" />
                <span>Agent Network</span>
              </button>
              <button onClick={() => { setActiveTab('activity'); setIsMobileMenuOpen(false); }} className={navButtonClass('activity')}>
                <Activity className="w-4 h-4 text-[#A99BC9]" />
                <span>Live Activity</span>
              </button>
              <button onClick={() => { setActiveTab('emergency'); setIsMobileMenuOpen(false); }} className={navButtonClass('emergency')}>
                <ShieldAlert className="w-4 h-4 text-[#E26161]" />
                <span>Emergency Monitoring</span>
                {activeIncidents > 0 && (
                  <span className="ml-auto text-[9px] bg-[#E26161] text-white px-1.5 py-0.5 rounded font-extrabold normal-case">{activeIncidents}</span>
                )}
              </button>
              <button onClick={() => { setActiveTab('decision'); setIsMobileMenuOpen(false); }} className={navButtonClass('decision')}>
                <GitMerge className="w-4 h-4 text-[#E6B85C]" />
                <span>Decision Oversight</span>
                {pendingCount > 0 && (
                  <span className="ml-auto text-[9px] bg-[#E6B85C] text-[#292733] px-1.5 py-0.5 rounded font-extrabold normal-case">{pendingCount}</span>
                )}
              </button>
              <button onClick={() => { setActiveTab('audit'); setIsMobileMenuOpen(false); }} className={navButtonClass('audit')}>
                <ClipboardList className="w-4 h-4 text-[#A99BC9]" />
                <span>Audit Log</span>
              </button>
              <button onClick={() => { setActiveTab('settings'); setIsMobileMenuOpen(false); }} className={navButtonClass('settings')}>
                <SettingsIcon className="w-4 h-4 text-[#A99BC9]" />
                <span>Settings</span>
              </button>
            </nav>

            {/* SYSTEM SCOPE SUMMARY */}
            <div className="p-4 border-t border-[#565E75]/30 space-y-2 font-mono-tech text-xs">
              <span className="text-[10px] text-[#A99BC9] font-bold uppercase block">SYSTEM SCOPE</span>
              <div className="space-y-1.5">
                {SYS_BUILDINGS.map((b) => (
                  <div key={b.id} className="p-2 bg-[#423F4F]/60 rounded border border-[#565E75]/40 flex items-center justify-between">
                    <span className="font-bold text-[#F3F3F3] text-[11px]">🏢 {b.name}</span>
                    <span
                      className={`text-[8px] px-1 rounded font-bold ${
                        b.status === 'CRITICAL' ? 'bg-[#E26161] text-white' : b.status === 'WARNING' ? 'bg-[#E6B85C] text-[#292733]' : 'bg-[#7AE04C] text-[#292733]'
                      }`}
                    >
                      {STATUS_STYLES[b.status].label}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* PROFILE + FOOTER ACTIONS */}
            <div className="p-4 border-t border-[#565E75]/30 space-y-3 font-mono-tech">
              <div className="p-3 bg-[#423F4F]/50 rounded-[6px] border border-[#565E75]/30 space-y-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-[#A99BC9] text-[#292733] flex items-center justify-center font-bold text-xs shrink-0">🌐</div>
                  <div className="overflow-hidden">
                    <p className="text-xs font-bold text-[#F3F3F3] truncate">System Administrator</p>
                    <p className="text-[10px] text-[#A99BC9] font-bold truncate">LATTICE System Administration</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-1 text-[9px] pt-1 border-t border-[#565E75]/20">
                  <div>
                    <span className="text-[#A99BC9] block uppercase">SCOPE</span>
                    <span className="text-[#F3F3F3] font-bold truncate block">Entire LATTICE System</span>
                  </div>
                  <div>
                    <span className="text-[#A99BC9] block uppercase">ACCESS</span>
                    <span className="text-[#F3F3F3] font-bold truncate block">System-wide</span>
                  </div>
                </div>
              </div>

              <div className="space-y-1.5 pt-1">
                <button
                  onClick={() => { setActiveTab('settings'); setIsMobileMenuOpen(false); }}
                  className="w-full py-2 px-3 bg-[#423F4F]/40 hover:bg-[#423F4F] text-[#F3F3F3]/80 hover:text-[#F3F3F3] border border-[#565E75]/30 rounded-[6px] text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-[#A99BC9]"
                >
                  <SettingsIcon className="w-3.5 h-3.5 text-[#A99BC9]" />
                  <span>ACCOUNT SETTINGS</span>
                </button>
                <button
                  onClick={onNavigateToLanding}
                  className="w-full py-2 px-3 bg-[#423F4F]/40 hover:bg-[#423F4F] text-[#F3F3F3]/80 hover:text-[#F3F3F3] border border-[#565E75]/30 rounded-[6px] text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-[#A99BC9]"
                >
                  <ArrowLeft className="w-3.5 h-3.5 text-[#A99BC9]" />
                  <span>BACK TO LANDING</span>
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full py-2 px-3 bg-[#E26161]/20 hover:bg-[#E26161]/30 text-[#E26161] border border-[#E26161]/30 rounded-[6px] text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-[#E26161]"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>LOG OUT</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* ==================== MAIN CONTENT ==================== */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* TOP BAR */}
        <header className="bg-white border-b border-[#423F4F]/10 px-4 sm:px-6 py-3 sm:py-4 flex flex-wrap items-center justify-between gap-2 sm:gap-4">
          <div className="flex items-center gap-2 sm:gap-4 flex-wrap">
            <div className="flex items-center gap-2 px-2.5 sm:px-3 py-1.5 bg-[#423F4F] text-[#F3F3F3] rounded-[6px] font-mono-tech text-[11px] sm:text-xs font-bold uppercase tracking-wider shadow-sm">
              <UserCheck className="w-3.5 h-3.5 text-[#A99BC9] shrink-0" />
              <span>🌐 SYSTEM ADMINISTRATOR (ENTIRE LATTICE SYSTEM)</span>
            </div>
            <div className="flex items-center gap-2 px-2.5 sm:px-3 py-1.5 bg-[#F3F3F3] rounded-[6px] border border-[#423F4F]/10 font-mono-tech text-[11px] sm:text-xs font-bold text-[#565E75]">
              <span className="relative flex h-2 w-2 shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#7AE04C] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#7AE04C]"></span>
              </span>
              <span className="text-[#292733] whitespace-nowrap">● {onlineAgents} / {totalAgents} AGENTS ONLINE</span>
            </div>
            {criticalBuildings > 0 && (
              <div className="flex items-center gap-2 px-2.5 sm:px-3 py-1.5 bg-[#E26161]/10 rounded-[6px] border border-[#E26161]/30 font-mono-tech text-[11px] sm:text-xs font-bold text-[#E26161]">
                <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                <span>{criticalBuildings} CRITICAL</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 sm:gap-4 ml-auto sm:ml-0">
            <div className="text-right font-mono-tech hidden md:block">
              <p className="text-xs font-extrabold text-[#292733]">System Administrator</p>
              <p className="text-[10px] text-[#565E75] uppercase font-bold">LATTICE System Administration</p>
            </div>
            <button
              onClick={() => setActiveTab('settings')}
              className="p-2 rounded-[6px] border border-[#423F4F]/10 text-[#565E75] hover:text-[#292733] hover:bg-[#F3F3F3] transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-[#A99BC9]"
              aria-label="Open Settings"
              title="Settings"
            >
              <SettingsIcon className="w-4 h-4" />
            </button>
            <button
              onClick={onNavigateToLanding}
              className="btn-lattice-secondary py-1.5 px-2.5 sm:px-3 text-[11px] sm:text-xs font-mono-tech uppercase tracking-wider flex items-center gap-1.5 cursor-pointer focus-visible:outline-2 focus-visible:outline-[#A99BC9] whitespace-nowrap"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-[#423F4F] shrink-0" />
              <span>LANDING PAGE</span>
            </button>
          </div>
        </header>

        {/* BODY */}
        <main className="p-6 sm:p-8 space-y-8 overflow-y-auto max-w-7xl">
          {/* ---------- OVERVIEW ---------- */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <SectionHeader
                title="LATTICE SYSTEM COMMAND CENTER"
                subtitle="System-wide oversight of buildings, operators, agents, incidents, and emergency decisions."
              />

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                <SummaryCard label="ACTIVE USERS" value={`${onlinePeople} Online`} sub={`${PEOPLE.length} TOTAL`} accent="#7AE04C" />
                <SummaryCard label="BUILDINGS" value={`${SYS_BUILDINGS.length} Connected`} sub="ALL ONLINE" accent="#6B9FD4" />
                <SummaryCard label="ACTIVE INCIDENTS" value={String(activeIncidents)} sub="CRITICAL" accent="#E26161" />
                <SummaryCard label="AGENTS" value={`${onlineAgents} / ${totalAgents}`} sub="SYSTEM-WIDE" accent="#6B9FD4" />
                <SummaryCard label="PENDING DECISIONS" value={String(pendingCount)} sub="AWAITING REVIEW" accent="#E6B85C" />
                <SummaryCard label="SYSTEM HEALTH" value="96%" sub="NOMINAL" accent="#7AE04C" />
              </div>

              {/* CURRENTLY ACTIVE OPERATORS */}
              <div className="bg-white border border-[#423F4F]/10 rounded-[8px] p-6 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-[#423F4F]/10 pb-3">
                  <h2 className="text-lg font-extrabold text-[#292733]">CURRENTLY ACTIVE OPERATORS</h2>
                  <button onClick={() => setActiveTab('people')} className="text-xs font-bold text-[#A99BC9] hover:text-[#292733] flex items-center gap-1 cursor-pointer">
                    <span>View all people</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {PEOPLE.map((p) => (
                    <PersonCard key={p.id} person={p} />
                  ))}
                </div>
              </div>

              {/* BUILDING STATUS */}
              <div className="bg-white border border-[#423F4F]/10 rounded-[8px] p-6 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-[#423F4F]/10 pb-3">
                  <h2 className="text-lg font-extrabold text-[#292733]">BUILDING STATUS</h2>
                  <button onClick={() => setActiveTab('buildings')} className="text-xs font-bold text-[#A99BC9] hover:text-[#292733] flex items-center gap-1 cursor-pointer">
                    <span>View all</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {SYS_BUILDINGS.map((b) => (
                    <BuildingCard key={b.id} building={b} />
                  ))}
                </div>
              </div>

              <RoleHierarchy />
            </div>
          )}

          {/* ---------- PEOPLE & ROLES ---------- */}
          {activeTab === 'people' && (
            <div className="space-y-6">
              <SectionHeader title="PEOPLE & ROLE MANAGEMENT" subtitle="Every registered user, their role, assignment, and current activity." />

              <div className="bg-white border border-[#423F4F]/10 rounded-[8px] shadow-sm overflow-hidden">
                <div className="hidden lg:grid grid-cols-8 gap-3 px-5 py-3 bg-[#F3F3F3]/70 border-b border-[#423F4F]/10 font-mono-tech text-[10px] text-[#565E75] uppercase font-bold">
                  <span className="col-span-2">Person</span>
                  <span>Role</span>
                  <span>Building</span>
                  <span>Status</span>
                  <span className="col-span-2">Current Activity</span>
                  <span>Access</span>
                </div>
                <div className="divide-y divide-[#423F4F]/10">
                  {PEOPLE.map((p) => (
                    <div key={p.id} className="grid grid-cols-1 lg:grid-cols-8 gap-2 lg:gap-3 px-5 py-4 items-center font-mono-tech text-xs">
                      <div className="lg:col-span-2 flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-[#A99BC9]/30 text-[#292733] flex items-center justify-center font-bold text-xs shrink-0 border border-[#A99BC9]/40">
                          {p.avatar}
                        </div>
                        <div>
                          <p className="font-extrabold text-[#292733] text-sm">{p.name}</p>
                          <p className="text-[10px] text-[#565E75]">{p.department}</p>
                        </div>
                      </div>
                      <span className="text-[#292733] font-bold">{p.role}</span>
                      <span className="text-[#565E75] font-bold">{p.building}</span>
                      <span className={`flex items-center gap-1.5 font-bold ${p.status === 'online' ? 'text-[#7AE04C]' : 'text-[#565E75]'}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${p.status === 'online' ? 'bg-[#7AE04C]' : 'bg-[#565E75]'}`}></span>
                        {p.status === 'online' ? 'Online' : 'Offline'}
                      </span>
                      <span className="lg:col-span-2 text-[#565E75]">{p.currentActivity}</span>
                      <span className="text-[#292733] font-bold">{p.accessLevel}</span>
                    </div>
                  ))}
                </div>
              </div>

              <RoleHierarchy />
            </div>
          )}

          {/* ---------- BUILDINGS ---------- */}
          {activeTab === 'buildings' && (
            <div className="space-y-6">
              <SectionHeader title="BUILDING OVERVIEW" subtitle="Every registered building, its assigned operator, and current state." />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {SYS_BUILDINGS.map((b) => (
                  <BuildingCard key={b.id} building={b} detailed />
                ))}
              </div>
            </div>
          )}

          {/* ---------- AGENT NETWORK ---------- */}
          {activeTab === 'agents' && (
            <div className="space-y-6">
              <SectionHeader title="AGENT SYSTEM STATUS" subtitle="Health, confidence, current task, and message activity for every agent in the system." />

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 font-mono-tech text-xs">
                <div className="bg-white p-4 rounded-[8px] border border-[#423F4F]/10 shadow-sm">
                  <span className="text-[10px] text-[#565E75] uppercase font-bold block">ONLINE</span>
                  <span className="text-xl font-extrabold text-[#7AE04C]">{SYS_AGENTS.filter((a) => a.status === 'online').length}</span>
                </div>
                <div className="bg-white p-4 rounded-[8px] border border-[#423F4F]/10 shadow-sm">
                  <span className="text-[10px] text-[#565E75] uppercase font-bold block">DEGRADED</span>
                  <span className="text-xl font-extrabold text-[#E6B85C]">{SYS_AGENTS.filter((a) => a.status === 'degraded').length}</span>
                </div>
                <div className="bg-white p-4 rounded-[8px] border border-[#423F4F]/10 shadow-sm">
                  <span className="text-[10px] text-[#565E75] uppercase font-bold block">OFFLINE</span>
                  <span className="text-xl font-extrabold text-[#E26161]">{SYS_AGENTS.filter((a) => a.status === 'offline').length}</span>
                </div>
                <div className="bg-white p-4 rounded-[8px] border border-[#423F4F]/10 shadow-sm">
                  <span className="text-[10px] text-[#565E75] uppercase font-bold block">UNKNOWN</span>
                  <span className="text-xl font-extrabold text-[#565E75]">{SYS_AGENTS.filter((a) => a.status === 'unknown').length}</span>
                </div>
              </div>

              {(['Building A', 'Building B', 'Building C', 'System'] as const).map((bldg) => {
                const group = SYS_AGENTS.filter((a) => a.building === bldg);
                if (group.length === 0) return null;
                return (
                  <div key={bldg} className="space-y-3">
                    <h3 className="font-mono-tech text-xs font-bold text-[#565E75] uppercase tracking-wider px-1">{bldg}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {group.map((agent) => {
                        const Icon = agent.icon;
                        const s = AGENT_STATUS_STYLES[agent.status];
                        const StatusIcon = s.icon;
                        return (
                          <div key={agent.id} className="bg-white p-5 rounded-[8px] border border-[#423F4F]/10 shadow-sm space-y-3">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2.5">
                                <div className="w-9 h-9 rounded-[6px] bg-[#F3F3F3] flex items-center justify-center border border-[#423F4F]/10">
                                  <Icon className="w-4.5 h-4.5 text-[#423F4F]" />
                                </div>
                                <div>
                                  <p className="text-sm font-extrabold text-[#292733] leading-tight">{agent.name}</p>
                                  <p className="text-[10px] text-[#565E75] font-mono-tech font-bold uppercase">{agent.capability}</p>
                                </div>
                              </div>
                              <span className={`flex items-center gap-1 text-[10px] font-bold font-mono-tech ${s.text}`}>
                                <StatusIcon className="w-3.5 h-3.5" />
                                {s.label}
                              </span>
                            </div>

                            <p className="text-[11px] text-[#292733] font-mono-tech font-bold border-t border-[#423F4F]/10 pt-2.5">
                              Task: <span className="font-normal text-[#565E75]">{agent.currentTask}</span>
                            </p>
                            <p className="text-[11px] text-[#565E75] font-mono-tech leading-relaxed">{agent.lastMessage}</p>

                            <div className="flex items-center justify-between font-mono-tech text-[10px] pt-1">
                              <span className="text-[#565E75]">
                                Confidence: <span className="font-bold text-[#292733]">{agent.confidence !== null ? `${agent.confidence}%` : '—'}</span>
                              </span>
                              <span className="text-[#565E75]">
                                Latency: <span className="font-bold text-[#292733]">{agent.latencyMs !== null ? `${agent.latencyMs}ms` : '—'}</span>
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* ---------- LIVE ACTIVITY ---------- */}
          {activeTab === 'activity' && (
            <div className="space-y-6">
              <SectionHeader title="LIVE SYSTEM ACTIVITY" subtitle="Real-time feed combining human, agent, system, emergency, and override activity." />
              <div className="bg-[#292733] rounded-[8px] border border-[#423F4F] p-4 sm:p-6 space-y-3 max-h-[640px] overflow-y-auto">
                {ACTIVITY_FEED.slice(0, visibleActivityCount).map((ev) => {
                  const t = ACTIVITY_TYPE_STYLES[ev.type];
                  const TIcon = t.icon;
                  return (
                    <div key={ev.id} className="p-3.5 bg-[#423F4F]/50 rounded-[6px] border border-[#565E75]/30 font-mono-tech text-xs flex items-start gap-3">
                      <div className={`w-7 h-7 rounded-[6px] flex items-center justify-center shrink-0 ${t.bg}`}>
                        <TIcon className={`w-3.5 h-3.5 ${t.text}`} />
                      </div>
                      <div className="flex-1 min-w-0 space-y-1">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <span className="flex items-center gap-1.5">
                            <span className="text-[#F3F3F3] font-bold">{ev.actor}</span>
                            <span className="text-[#565E75]">· {ev.actorRole}</span>
                          </span>
                          <span className="text-[#565E75] text-[10px]">{ev.time}</span>
                        </div>
                        <p className="text-[#F3F3F3]">{ev.action}</p>
                        <span className="text-[#A99BC9] text-[10px] font-bold">{ev.building}</span>
                      </div>
                    </div>
                  );
                })}
                {visibleActivityCount < ACTIVITY_FEED.length && (
                  <div className="flex items-center gap-2 text-[#A99BC9] font-mono-tech text-[10px] px-1">
                    <span className="flex gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#A99BC9] animate-bounce [animation-delay:-0.3s]"></span>
                      <span className="w-1.5 h-1.5 rounded-full bg-[#A99BC9] animate-bounce [animation-delay:-0.15s]"></span>
                      <span className="w-1.5 h-1.5 rounded-full bg-[#A99BC9] animate-bounce"></span>
                    </span>
                    <span>Loading more activity…</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ---------- EMERGENCY MONITORING ---------- */}
          {activeTab === 'emergency' && (
            <div className="space-y-6">
              <SectionHeader title="EMERGENCY MONITORING" subtitle="All active, resolved, and normal-state buildings across the system." />

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {EMERGENCY_INCIDENTS.map((inc) => (
                  <button
                    key={inc.id}
                    onClick={() => setSelectedIncidentId(inc.id)}
                    className={`text-left p-5 rounded-[8px] border shadow-sm space-y-3 cursor-pointer transition-all ${
                      selectedIncidentId === inc.id ? 'border-[#A99BC9] ring-1 ring-[#A99BC9]' : 'border-[#423F4F]/10 hover:border-[#423F4F]/30'
                    } bg-white`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-sm text-[#292733]">{inc.building}</span>
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border font-mono-tech ${INCIDENT_STATUS_STYLES[inc.status]}`}>{inc.status}</span>
                    </div>
                    <p className="text-xs font-mono-tech text-[#565E75]">{inc.zone !== '—' ? `${inc.zone} — ` : ''}{inc.type}</p>
                    <span className={`inline-block text-[9px] font-bold px-1.5 py-0.5 rounded border font-mono-tech ${SEVERITY_STYLES[inc.severity]}`}>
                      {inc.severity}
                    </span>
                  </button>
                ))}
              </div>

              {selectedIncident && (
                <div className="bg-white border border-[#423F4F]/10 rounded-[8px] p-6 shadow-sm space-y-4">
                  <div className="flex items-center justify-between border-b border-[#423F4F]/10 pb-3">
                    <div>
                      <span className="font-mono-tech text-[10px] text-[#A99BC9] uppercase font-bold block">INCIDENT DETAIL</span>
                      <h3 className="text-base font-extrabold text-[#292733]">
                        {selectedIncident.building}{selectedIncident.zone !== '—' ? ` — ${selectedIncident.zone}` : ''} · {selectedIncident.type}
                      </h3>
                    </div>
                    <span className={`px-2.5 py-1 rounded-[6px] text-[10px] font-bold border font-mono-tech ${SEVERITY_STYLES[selectedIncident.severity]}`}>
                      {selectedIncident.severity}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 font-mono-tech text-xs">
                    <div>
                      <span className="text-[10px] text-[#565E75] uppercase font-bold block">Occupancy</span>
                      <span className="font-bold text-[#292733]">{selectedIncident.occupancy}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-[#565E75] uppercase font-bold block">Assigned Operator</span>
                      <span className="font-bold text-[#292733]">{selectedIncident.operator}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-[#565E75] uppercase font-bold block">Active Agents</span>
                      <span className="font-bold text-[#292733]">{selectedIncident.activeAgents}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-[#565E75] uppercase font-bold block">Response</span>
                      <span className="font-bold text-[#292733]">{selectedIncident.response}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-[#565E75] uppercase font-bold block">AI Decision</span>
                      <span className="font-bold text-[#292733]">{selectedIncident.aiDecision}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-[#565E75] uppercase font-bold block">Mutual Aid</span>
                      <span className="font-bold text-[#292733]">{selectedIncident.mutualAid}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-[#565E75] uppercase font-bold block">Reported</span>
                      <span className="font-bold text-[#292733]">{selectedIncident.time}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ---------- DECISION OVERSIGHT ---------- */}
          {activeTab === 'decision' && (
            <div className="space-y-6">
              <SectionHeader
                title="DECISION OVERSIGHT"
                subtitle="Observe and audit AI recommendations and the operator responses to them. Building Operators retain operational authority."
              />

              <div className="space-y-4">
                {SYS_DECISIONS.map((d) => (
                  <div key={d.id} className="bg-white border border-[#423F4F]/10 rounded-[8px] p-6 shadow-sm space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#423F4F]/10 pb-3">
                      <div>
                        <span className="font-mono-tech text-[10px] text-[#A99BC9] uppercase font-bold block">AI RECOMMENDATION</span>
                        <h3 className="text-base font-extrabold text-[#292733]">{d.title}</h3>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-2.5 py-1 rounded-[6px] text-[10px] font-bold border font-mono-tech ${RISK_STYLES[d.riskLevel]}`}>
                          RISK: {d.riskLevel.toUpperCase()}
                        </span>
                        <span className={`px-2.5 py-1 rounded-[6px] text-[10px] font-bold border font-mono-tech ${DECISION_STATUS_STYLES[d.operatorAction]}`}>
                          {d.operatorAction}
                        </span>
                      </div>
                    </div>

                    <div className="p-3.5 bg-[#F3F3F3] rounded-[6px] border border-[#423F4F]/10 space-y-1 font-mono-tech text-xs">
                      <span className="text-[10px] text-[#565E75] uppercase font-bold block">RECOMMENDATION</span>
                      <p className="text-[#292733] font-bold leading-relaxed">{d.recommendation}</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono-tech text-xs">
                      <div>
                        <span className="text-[10px] text-[#565E75] uppercase font-bold block">Confidence</span>
                        <span className="font-bold text-[#292733]">{d.confidence}%</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-[#565E75] uppercase font-bold block">Building</span>
                        <span className="font-bold text-[#292733]">{d.building}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-[#565E75] uppercase font-bold block">Responsible Operator</span>
                        <span className="font-bold text-[#292733]">{d.responsibleOperator}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-[#565E75] uppercase font-bold block">Timestamp</span>
                        <span className="font-bold text-[#292733]">{d.timestamp}</span>
                      </div>
                    </div>

                    <div className="p-3.5 bg-[#F3F3F3] rounded-[6px] border border-[#423F4F]/10 space-y-1 font-mono-tech text-xs">
                      <span className="text-[10px] text-[#565E75] uppercase font-bold block">FINAL DECISION</span>
                      <p className="text-[#565E75] leading-relaxed">{d.finalDecision}</p>
                    </div>

                    <div className="flex items-center gap-2 font-mono-tech text-[11px] text-[#A99BC9] pt-1">
                      <Eye className="w-3.5 h-3.5" />
                      <span>System Administrator view — observe only, no approval action taken here.</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ---------- AUDIT LOG ---------- */}
          {activeTab === 'audit' && (
            <div className="space-y-6">
              <SectionHeader title="AUDIT LOG" subtitle="System-wide chronological record of activity, decisions, overrides, failures, and authentication events." />

              <div className="flex flex-wrap gap-2 font-mono-tech text-[11px]">
                {(['all', 'agent', 'emergency', 'decision', 'override', 'failure', 'auth', 'system', 'Building A', 'Building B', 'Building C'] as const).map((f) => (
                  <button
                    key={f}
                    onClick={() => setAuditFilter(f)}
                    className={`px-3 py-1.5 rounded-[6px] border font-bold uppercase tracking-wide cursor-pointer transition-all ${
                      auditFilter === f
                        ? 'bg-[#292733] text-[#F3F3F3] border-[#292733]'
                        : 'bg-white text-[#565E75] border-[#423F4F]/15 hover:border-[#423F4F]/40'
                    }`}
                  >
                    {f === 'all' ? 'All' : f}
                  </button>
                ))}
              </div>

              <div className="bg-white border border-[#423F4F]/10 rounded-[8px] shadow-sm divide-y divide-[#423F4F]/10">
                {filteredAudit.length === 0 ? (
                  <div className="p-6 text-center text-xs text-[#565E75] font-mono-tech">No events match this filter.</div>
                ) : (
                  filteredAudit.map((ev) => {
                    const cs = CATEGORY_STYLES[ev.category];
                    return (
                      <div key={ev.id} className="p-4 sm:p-5 flex flex-wrap items-start gap-3 sm:gap-5 font-mono-tech">
                        <span className="text-xs font-bold text-[#565E75] w-16 shrink-0">{ev.time}</span>
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded shrink-0 ${cs.bg} ${cs.text}`}>{cs.label}</span>
                        <div className="flex-1 min-w-[200px]">
                          <p className="text-sm font-bold text-[#292733]">{ev.title}</p>
                          <p className="text-[11px] text-[#565E75] mt-0.5">{ev.detail}</p>
                          <p className="text-[10px] text-[#A99BC9] mt-0.5 font-bold">By {ev.actor}</p>
                        </div>
                        <span className="text-[10px] font-bold text-[#A99BC9] shrink-0">{ev.building}</span>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* ---------- SETTINGS ---------- */}
          {activeTab === 'settings' && <SystemAdministratorSettingsPanel />}
        </main>
      </div>
    </div>
  );
};

/* ============================================================================
   PERSON CARD
   ========================================================================== */

const PersonCard: React.FC<{ person: PersonData }> = ({ person: p }) => (
  <div className={`p-5 rounded-[8px] border shadow-sm space-y-3 ${p.status === 'online' ? 'border-[#7AE04C]/30 bg-[#7AE04C]/5' : 'border-[#423F4F]/10 bg-white'}`}>
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2.5">
        <div className="w-9 h-9 rounded-full bg-[#A99BC9]/30 text-[#292733] flex items-center justify-center font-bold text-sm shrink-0 border border-[#A99BC9]/40">
          {p.avatar}
        </div>
        <div>
          <p className="font-extrabold text-sm text-[#292733] leading-tight">{p.name}</p>
          <p className="text-[10px] text-[#565E75] font-mono-tech font-bold uppercase">{p.role}</p>
        </div>
      </div>
      <span className={`flex items-center gap-1.5 text-[10px] font-bold font-mono-tech ${p.status === 'online' ? 'text-[#7AE04C]' : 'text-[#565E75]'}`}>
        <span className={`w-1.5 h-1.5 rounded-full ${p.status === 'online' ? 'bg-[#7AE04C]' : 'bg-[#565E75]'}`}></span>
        {p.status === 'online' ? 'Online' : 'Offline'}
      </span>
    </div>
    <div className="grid grid-cols-2 gap-2 font-mono-tech text-[10px] border-t border-[#423F4F]/10 pt-2.5">
      <div>
        <span className="text-[#565E75] block uppercase">Department</span>
        <span className="font-bold text-[#292733]">{p.department}</span>
      </div>
      <div>
        <span className="text-[#565E75] block uppercase">Scope</span>
        <span className="font-bold text-[#292733]">{p.building}</span>
      </div>
    </div>
    <div className="font-mono-tech text-[11px] space-y-1 border-t border-[#423F4F]/10 pt-2.5">
      <p className="text-[#292733]"><span className="text-[#565E75]">Current Activity:</span> {p.currentActivity}</p>
      <p className="text-[#565E75]"><span className="text-[#565E75]">Last Action:</span> {p.lastAction}</p>
      <p className="text-[#A99BC9] font-bold">{p.lastActive}</p>
    </div>
  </div>
);

/* ============================================================================
   BUILDING CARD
   ========================================================================== */

const BuildingCard: React.FC<{ building: SysBuildingData; detailed?: boolean }> = ({ building: b, detailed }) => {
  const s = STATUS_STYLES[b.status];
  return (
    <div className={`p-5 rounded-[8px] border ${s.border} ${s.bg} space-y-3`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BuildingIcon className="w-4 h-4 text-[#292733]" />
          <span className="font-extrabold text-sm text-[#292733]">{b.name}</span>
        </div>
        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded font-mono-tech ${s.text}`}>{s.label}</span>
      </div>
      <p className="text-[10px] text-[#565E75] font-mono-tech font-bold uppercase">{b.type}</p>

      <div className="grid grid-cols-2 gap-2 font-mono-tech text-[10px]">
        <div>
          <span className="text-[#565E75] block uppercase">Operator</span>
          <span className="font-bold text-[#292733]">{b.operator}</span>
        </div>
        <div>
          <span className="text-[#565E75] block uppercase">Occupancy</span>
          <span className="font-bold text-[#292733]">{b.occupancy}</span>
        </div>
        <div>
          <span className="text-[#565E75] block uppercase">Hazard</span>
          <span className="font-bold text-[#292733]">{b.hazard}</span>
        </div>
        <div>
          <span className="text-[#565E75] block uppercase">Agents</span>
          <span className="font-bold text-[#292733]">{b.agentsOnline} / {b.agentsTotal}</span>
        </div>
        <div className="col-span-2">
          <span className="text-[#565E75] block uppercase">Response</span>
          <span className="font-bold text-[#292733]">{b.response}</span>
        </div>
      </div>

      {detailed && (
        <div className="pt-2 border-t border-[#423F4F]/10 space-y-1.5 font-mono-tech text-[10px]">
          <div className="flex items-center justify-between">
            <span className="text-[#565E75] uppercase">Last Activity</span>
            <span className="font-bold text-[#292733] flex items-center gap-1">
              {b.connectivity === 'live' ? <Wifi className="w-3 h-3 text-[#7AE04C]" /> : <WifiOff className="w-3 h-3 text-[#E6B85C]" />}
              {b.connectivity === 'live' ? 'LIVE' : b.connectivity.toUpperCase()}
            </span>
          </div>
          <p className="text-[#565E75]">{b.lastEvent}</p>
        </div>
      )}
    </div>
  );
};

/* ============================================================================
   ROLE HIERARCHY
   ========================================================================== */

const RoleHierarchy: React.FC = () => (
  <div className="bg-white border border-[#423F4F]/10 rounded-[8px] p-6 shadow-sm">
    <div className="flex items-center justify-between border-b border-[#423F4F]/10 pb-3 mb-6">
      <h2 className="text-lg font-extrabold text-[#292733]">ROLE HIERARCHY</h2>
      <span className="font-mono-tech text-[10px] text-[#565E75] uppercase font-bold">System-wide visibility</span>
    </div>
    <div className="overflow-x-auto">
      <div className="flex flex-col items-center min-w-[560px] py-2">
        <div className="px-4 py-2.5 bg-[#292733] text-[#F3F3F3] rounded-[6px] font-mono-tech text-xs font-extrabold flex items-center gap-2">
          <Network className="w-4 h-4 text-[#A99BC9]" />
          SYSTEM ADMINISTRATOR — ENTIRE LATTICE SYSTEM
        </div>
        <div className="w-px h-6 bg-[#423F4F]/30"></div>
        <div className="w-full h-px bg-[#423F4F]/30"></div>
        <div className="flex w-full justify-between px-8">
          {SYS_BUILDINGS.map((b) => (
            <div key={b.id} className="flex flex-col items-center gap-1.5 -mt-px">
              <div className="w-px h-6 bg-[#423F4F]/30"></div>
              <div className={`px-4 py-2 rounded-[6px] font-mono-tech text-[11px] font-extrabold border ${STATUS_STYLES[b.status].border} ${STATUS_STYLES[b.status].bg} ${STATUS_STYLES[b.status].text}`}>
                {b.name.toUpperCase()} OPERATOR
              </div>
              <span className="font-mono-tech text-[10px] font-bold text-[#565E75]">{b.operator}</span>
              <div className="w-px h-4 bg-[#423F4F]/30"></div>
              <div className="px-3 py-1.5 rounded-[6px] font-mono-tech text-[10px] font-bold border border-[#6B9FD4]/30 bg-[#6B9FD4]/10 text-[#6B9FD4]">
                {b.agentsOnline} / {b.agentsTotal} AGENTS
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

/* ============================================================================
   SYSTEM ADMINISTRATOR SETTINGS PANEL
   ========================================================================== */

const SettingsSection: React.FC<{ title: string; icon: any; children: React.ReactNode }> = ({ title, icon: Icon, children }) => (
  <div className="bg-white border border-[#423F4F]/10 rounded-[8px] shadow-sm overflow-hidden">
    <div className="px-6 py-4 border-b border-[#423F4F]/10 flex items-center gap-2.5 bg-[#F3F3F3]/50">
      <Icon className="w-4 h-4 text-[#A99BC9]" />
      <h3 className="font-extrabold text-sm text-[#292733] uppercase font-mono-tech tracking-wide">{title}</h3>
    </div>
    <div className="p-6 space-y-4">{children}</div>
  </div>
);

const SettingsField: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 items-center font-mono-tech text-xs">
    <span className="text-[#565E75] uppercase font-bold">{label}</span>
    <span className="sm:col-span-2 px-3 py-2 bg-[#F3F3F3] rounded-[6px] border border-[#423F4F]/10 text-[#292733] font-bold">{value}</span>
  </div>
);

const ToggleRow: React.FC<{ label: string; description: string; defaultOn?: boolean }> = ({ label, description, defaultOn = true }) => {
  const [on, setOn] = useState(defaultOn);
  return (
    <div className="flex items-center justify-between gap-4 py-2">
      <div>
        <p className="text-xs font-bold text-[#292733] font-mono-tech">{label}</p>
        <p className="text-[10px] text-[#565E75]">{description}</p>
      </div>
      <button
        onClick={() => setOn(!on)}
        className={`shrink-0 w-11 h-6 rounded-full transition-colors relative cursor-pointer ${on ? 'bg-[#7AE04C]' : 'bg-[#423F4F]/20'}`}
        aria-pressed={on}
        aria-label={`Toggle ${label}`}
      >
        <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${on ? 'translate-x-5' : 'translate-x-0.5'}`} />
      </button>
    </div>
  );
};

const SystemAdministratorSettingsPanel: React.FC = () => (
  <div className="space-y-6">
    <SectionHeader title="SYSTEM SETTINGS" subtitle="System-wide configuration for LATTICE. No credentials or environment variables are exposed here." />

    <SettingsSection title="User Management" icon={UsersRound}>
      <SettingsField label="User Accounts" value="4 active (3 Building Operators, 1 System Administrator)" />
      <SettingsField label="Role Assignments" value="Managed per building, verified on login" />
      <div className="pt-2 border-t border-[#423F4F]/10 space-y-1">
        <ToggleRow label="Allow new operator self-registration" description="New Building Operators must be approved before receiving building access." defaultOn={false} />
        <ToggleRow label="Require MFA for System Administrator accounts" description="Adds a second verification step for system-wide access." />
      </div>
    </SettingsSection>

    <SettingsSection title="Building Management" icon={BuildingIcon}>
      <SettingsField label="Registered Buildings" value="Building A, Building B, Building C" />
      <SettingsField label="Building Metadata" value="Type, occupancy capacity, assigned operator, hazard profile" />
      <div className="pt-2 border-t border-[#423F4F]/10">
        <ToggleRow label="Allow new building registration" description="Permit new buildings to join the LATTICE system after verification." defaultOn={false} />
      </div>
    </SettingsSection>

    <SettingsSection title="Agent Management" icon={Server}>
      <SettingsField label="Registered Agents" value="18 agents across 3 buildings + system layer" />
      <SettingsField label="Discovery Mode" value="Automatic capability broadcast" />
      <div className="pt-2 border-t border-[#423F4F]/10 space-y-1">
        <ToggleRow label="Auto-discover new agents" description="New agents are added to the registry automatically once verified." />
        <ToggleRow label="Restrict agent permissions by building" description="Agents can only act within their assigned building unless escalated." />
      </div>
    </SettingsSection>

    <SettingsSection title="System Configuration" icon={SettingsIcon}>
      <SettingsField label="Emergency Threshold" value="High hazard or above triggers auto-escalation" />
      <SettingsField label="Fallback Policy" value="Route to Network Coordinator on agent failure" />
      <div className="pt-2 border-t border-[#423F4F]/10 space-y-1">
        <ToggleRow label="Audit logging" description="Record every agent action, decision, and override to the audit log." />
        <ToggleRow label="Notification digests" description="Send the System Administrator a daily summary of flagged activity." />
      </div>
    </SettingsSection>

    <SettingsSection title="Security & Access" icon={Lock}>
      <SettingsField label="Authentication" value="Email + password, session-based" />
      <SettingsField label="Session Timeout" value="30 minutes of inactivity" />
      <div className="pt-2 border-t border-[#423F4F]/10">
        <ToggleRow label="Require re-authentication for sensitive settings changes" description="Adds a confirmation step before system-wide configuration changes." />
      </div>
    </SettingsSection>

    <SettingsSection title="Monitoring" icon={Bell}>
      <div className="space-y-1">
        <ToggleRow label="Agent failure alerts" description="Notify the System Administrator when an agent goes offline or degrades." />
        <ToggleRow label="Low-confidence alerts" description="Flag agent or decision outputs below 85% confidence for manual review." />
        <ToggleRow label="Cross-building anomaly detection" description="Flag unusual patterns across the interoperability layer." />
      </div>
    </SettingsSection>
  </div>
);

export default AdministratorDashboard;
export interface MockAgentDef {
  id: string;
  name: string;
  shortName: string;
  icon: string;
  role: string;
  color: string;
  glowColor: string;
  capabilities: string[];
  gridPosition: { x: number; y: number }; // Relative percentage or SVG coordinates
}

export const MOCK_AGENTS: Record<string, MockAgentDef> = {
  agent_fire_hazard: {
    id: 'agent_fire_hazard',
    name: 'Fire & Hazard Agent',
    shortName: 'Fire & Hazard',
    icon: '🔥',
    role: 'Environmental telemetry & flame propagation tracking',
    color: '#E26161',
    glowColor: 'rgba(226, 97, 97, 0.4)',
    capabilities: ['detect_hazard', 'assess_severity', 'track_propagation'],
    gridPosition: { x: 50, y: 12 },
  },
  agent_coordinator: {
    id: 'agent_coordinator',
    name: 'Emergency Coordinator',
    shortName: 'Coordinator',
    icon: '🧠',
    role: 'Central synthesis, conflict resolution & route replanning',
    color: '#A99BC9',
    glowColor: 'rgba(169, 155, 201, 0.5)',
    capabilities: ['synthesize_plan', 'resolve_conflicts', 'recalculate_routes'],
    gridPosition: { x: 50, y: 48 }, // Visually Central
  },
  agent_occupancy: {
    id: 'agent_occupancy',
    name: 'Occupancy Agent',
    shortName: 'Occupancy',
    icon: '👥',
    role: 'Smart badge census & mobility assistance registry',
    color: '#E6B85C',
    glowColor: 'rgba(230, 184, 92, 0.4)',
    capabilities: ['get_occupancy', 'flag_vulnerable_persons'],
    gridPosition: { x: 22, y: 78 },
  },
  agent_security: {
    id: 'agent_security',
    name: 'Security Agent',
    shortName: 'Security',
    icon: '🛡️',
    role: 'CCTV validation & electronic door lock telemetry',
    color: '#7AE04C',
    glowColor: 'rgba(122, 224, 76, 0.4)',
    capabilities: ['verify_incident', 'check_access_locks'],
    gridPosition: { x: 50, y: 84 },
  },
  agent_ethical_priority: {
    id: 'agent_ethical_priority',
    name: 'Ethical Priority Agent',
    shortName: 'Ethical Priority',
    icon: '❤️',
    role: 'Assistance allocation & equity-focused dispatch scoring',
    color: '#E0B7C9',
    glowColor: 'rgba(224, 183, 201, 0.4)',
    capabilities: ['evaluate_assistance_priority', 'equity_scoring'],
    gridPosition: { x: 78, y: 78 },
  },
  agent_cross_building: {
    id: 'agent_cross_building',
    name: 'Cross-Building Collaboration Agent',
    shortName: 'Cross-Building',
    icon: '🌐',
    role: 'Campus mutual aid alerts & concourse damper controls',
    color: '#565E75',
    glowColor: 'rgba(86, 94, 117, 0.4)',
    capabilities: ['identify_affected_buildings', 'broadcast_mutual_aid'],
    gridPosition: { x: 82, y: 28 },
  },
};

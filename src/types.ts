export interface AgentInfo {
  id: string;
  name: string;
  icon: string;
  type: string;
  status: 'active' | 'standby' | 'alert';
  description: string;
  accentColor: string;
}

export type PerspectiveMode = 'all' | 'hazard' | 'occupancy' | 'security' | 'interop';

export interface NetworkNode {
  id: string;
  label: string;
  x: number; // percentage
  y: number; // percentage
  agentType: string;
  color: string;
  activePulse?: boolean;
}

import React from 'react';
import { Network, Zap, Loader2 } from 'lucide-react';
import { MOCK_AGENTS } from '../../lib/mock/mockAgents';

interface AgentNodePos {
  x: number;
  y: number;
  id: string;
  name: string;
  shortName: string;
  icon: string;
  color: string;
  ephemeral?: boolean; // only rendered / connected when actively involved in the current event
}

const NETWORK_NODES: Record<string, AgentNodePos> = {
  agent_fire_hazard: { x: 140, y: 70, id: 'agent_fire_hazard', name: 'FIRE & HAZARD', shortName: 'Fire Hazard', icon: '🔥', color: '#E26161' },
  agent_coordinator: { x: 340, y: 195, id: 'agent_coordinator', name: 'COORDINATOR', shortName: 'Coordinator', icon: '🧠', color: '#A99BC9' }, // VISUALLY CENTRAL
  agent_occupancy: { x: 140, y: 300, id: 'agent_occupancy', name: 'OCCUPANCY', shortName: 'Occupancy', icon: '👥', color: '#E6B85C' },
  agent_security: { x: 340, y: 330, id: 'agent_security', name: 'SECURITY', shortName: 'Security', icon: '🛡️', color: '#7AE04C' },
  agent_ethical_priority: { x: 540, y: 300, id: 'agent_ethical_priority', name: 'ETHICAL PRIORITY', shortName: 'Ethical', icon: '❤️', color: '#E0B7C9' },
  agent_cross_building: { x: 540, y: 70, id: 'agent_cross_building', name: 'CROSS-BUILDING', shortName: 'Cross-Bldg', icon: '🌐', color: '#565E75' },
  // NEW — human-in-the-loop node. Matches StructuredMockEvent.fromAgentId === 'HUMAN_OPERATOR'.
  HUMAN_OPERATOR: { x: 340, y: 35, id: 'HUMAN_OPERATOR', name: 'HUMAN OPERATOR', shortName: 'Operator', icon: '👤', color: '#E26161', ephemeral: true },
  // NEW — terminal node for the finalized plan handoff (evt-015). Matches toAgentId === 'OPERATOR_CONSOLE'.
  OPERATOR_CONSOLE: { x: 660, y: 195, id: 'OPERATOR_CONSOLE', name: 'OPERATOR CONSOLE', shortName: 'Console', icon: '💻', color: '#565E75', ephemeral: true },
};

// Steady-state mesh links, always drawn (dimmed) even when idle.
const CONNECTIONS = [
  ['agent_fire_hazard', 'agent_coordinator'],
  ['agent_occupancy', 'agent_coordinator'],
  ['agent_security', 'agent_coordinator'],
  ['agent_ethical_priority', 'agent_coordinator'],
  ['agent_cross_building', 'agent_coordinator'],
  ['agent_fire_hazard', 'agent_security'],
];

// Ephemeral links — only ever drawn while actively in transit. Keeps the human/console
// nodes from cluttering the graph as permanent dim lines when they're not part of the flow.
const EPHEMERAL_CONNECTIONS = [
  ['HUMAN_OPERATOR', 'agent_coordinator'],
  ['agent_coordinator', 'OPERATOR_CONSOLE'],
];

// Short labels for coordinator "self-talk" events (fromAgentId === toAgentId === agent_coordinator).
// These are the internal recompute steps — conflict resolution, replanning, directive application —
// that previously rendered nothing because sender and receiver were the same node.
const SELF_LOOP_LABELS: Record<string, string> = {
  conflict_detected: 'RESOLVING CONFLICT',
  replanning_started: 'REPLANNING ROUTES',
  operator_instruction_applied: 'APPLYING DIRECTIVE',
};

interface AgentNetworkProps {
  activeSenderId: string | null;
  activeReceiverId: string | null;
  activeMessageType: string | null;
  agentStates: Record<string, string>;
  currentStage?: 'IDLE' | 'RECEIVING' | 'THINKING' | 'TYPING' | 'DELIVERED';
  /** Marks the current event as a hazard/operator interrupt — drives red "override" styling. */
  isInterrupt?: boolean;
  /** Event type, e.g. 'conflict_detected' | 'replanning_started' | 'operator_instruction_applied' — used to key the coordinator self-loop visual. */
  eventType?: string;
}

export const AgentNetworkView: React.FC<AgentNetworkProps> = ({
  activeSenderId,
  activeReceiverId,
  activeMessageType,
  agentStates,
  currentStage = 'IDLE',
  isInterrupt = false,
  eventType,
}) => {
  const isOperatorPacket = activeSenderId === 'HUMAN_OPERATOR';
  const isOverridePacket = isOperatorPacket || isInterrupt;
  const isSelfLoop = Boolean(activeSenderId) && activeSenderId === activeReceiverId;
  const selfLoopLabel = eventType ? SELF_LOOP_LABELS[eventType] : undefined;

  return (
    <div className="bg-[#292733] text-[#F3F3F3] p-5 rounded-[8px] border border-[#423F4F] shadow-md space-y-3 font-sans h-full flex flex-col">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#565E75]/40 pb-3 font-mono-tech">
        <div className="flex items-center gap-2">
          <Network className="w-5 h-5 text-[#A99BC9]" />
          <h3 className="font-extrabold text-sm tracking-tight text-[#F3F3F3]">INTER-AGENT MESH & NETWORK GRAPH</h3>
        </div>

        {isSelfLoop ? (
          <div className="flex items-center gap-1.5 text-xs bg-[#A99BC9]/20 px-2.5 py-1 rounded border border-[#A99BC9] text-[#A99BC9] font-bold animate-pulse">
            <Loader2 className="w-3.5 h-3.5 text-[#E6B85C] animate-spin" />
            <span>COORDINATOR RECOMPUTING: {selfLoopLabel || activeMessageType || 'INTERNAL_REVISION'}</span>
          </div>
        ) : activeSenderId && activeReceiverId ? (
          <div className={`flex items-center gap-1.5 text-xs px-2.5 py-1 rounded border font-bold animate-pulse ${
            isOverridePacket
              ? 'bg-[#E26161]/20 border-[#E26161] text-[#E26161]'
              : 'bg-[#A99BC9]/20 border-[#A99BC9] text-[#A99BC9]'
          }`}>
            <Zap className="w-3.5 h-3.5 text-[#E6B85C]" />
            <span>
              {isOverridePacket ? '⚠ OVERRIDE IN TRANSIT: ' : 'PACKET IN TRANSIT: '}
              {activeMessageType || 'MESSAGE_DELIVERY'}
            </span>
          </div>
        ) : (
          <span className="text-xs text-[#7AE04C] font-bold bg-[#7AE04C]/10 px-2 py-0.5 rounded border border-[#7AE04C]/30">
            ● MESH ACTIVE & SYNCHRONIZED
          </span>
        )}
      </div>

      {/* SVG NODE GRAPH CANVAS */}
      <div className="relative w-full min-h-[380px] flex-1 bg-[#1F2028] rounded-[6px] border border-[#423F4F]/60 overflow-hidden flex items-center justify-center">
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 700 390">
          <defs>
            <linearGradient id="activeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#A99BC9" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#E6B85C" stopOpacity="0.8" />
            </linearGradient>
            <filter id="glow" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="5" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
            <filter id="strongGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="8" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* BACKGROUND MESH CONNECTIONS (steady-state) */}
          {CONNECTIONS.map(([idA, idB], idx) => {
            const nodeA = NETWORK_NODES[idA];
            const nodeB = NETWORK_NODES[idB];
            if (!nodeA || !nodeB) return null;

            const isCurrentActivePath =
              (activeSenderId === idA && activeReceiverId === idB) ||
              (activeSenderId === idB && activeReceiverId === idA);

            const isForward = activeSenderId === idA;
            const startX = isForward ? nodeA.x : nodeB.x;
            const startY = isForward ? nodeA.y : nodeB.y;
            const endX = isForward ? nodeB.x : nodeA.x;
            const endY = isForward ? nodeB.y : nodeA.y;

            const beamColor = isOverridePacket ? '#E26161' : '#E6B85C';

            return (
              <g key={idx}>
                <line
                  x1={nodeA.x}
                  y1={nodeA.y}
                  x2={nodeB.x}
                  y2={nodeB.y}
                  stroke={isCurrentActivePath ? beamColor : '#423F4F'}
                  strokeWidth={isCurrentActivePath ? 3 : 1.5}
                  strokeDasharray={isCurrentActivePath ? '6 3' : 'none'}
                  className={isCurrentActivePath ? 'animate-pulse' : ''}
                  opacity={isCurrentActivePath ? 1 : 0.4}
                />

                {isCurrentActivePath && (
                  <g>
                    <circle r="8" fill={beamColor} opacity="0.6" filter="url(#glow)">
                      <animateMotion path={`M ${startX} ${startY} L ${endX} ${endY}`} dur="1.2s" repeatCount="indefinite" />
                    </circle>
                    <circle r="4" fill="#FFFFFF" filter="url(#strongGlow)">
                      <animateMotion path={`M ${startX} ${startY} L ${endX} ${endY}`} dur="1.2s" repeatCount="indefinite" />
                    </circle>
                  </g>
                )}
              </g>
            );
          })}

          {/* EPHEMERAL CONNECTIONS (operator <-> coordinator, coordinator -> console) — only drawn while active */}
          {EPHEMERAL_CONNECTIONS.map(([idA, idB], idx) => {
            const nodeA = NETWORK_NODES[idA];
            const nodeB = NETWORK_NODES[idB];
            if (!nodeA || !nodeB) return null;

            const isCurrentActivePath =
              (activeSenderId === idA && activeReceiverId === idB) ||
              (activeSenderId === idB && activeReceiverId === idA);
            if (!isCurrentActivePath) return null;

            const isForward = activeSenderId === idA;
            const startX = isForward ? nodeA.x : nodeB.x;
            const startY = isForward ? nodeA.y : nodeB.y;
            const endX = isForward ? nodeB.x : nodeA.x;
            const endY = isForward ? nodeB.y : nodeA.y;

            const beamColor = isOverridePacket ? '#E26161' : '#7AE04C';

            return (
              <g key={`eph-${idx}`}>
                <line
                  x1={nodeA.x} y1={nodeA.y} x2={nodeB.x} y2={nodeB.y}
                  stroke={beamColor}
                  strokeWidth={3}
                  strokeDasharray="6 3"
                  className="animate-pulse"
                />
                <circle r="8" fill={beamColor} opacity="0.6" filter="url(#glow)">
                  <animateMotion path={`M ${startX} ${startY} L ${endX} ${endY}`} dur="1.2s" repeatCount="indefinite" />
                </circle>
                <circle r="4" fill="#FFFFFF" filter="url(#strongGlow)">
                  <animateMotion path={`M ${startX} ${startY} L ${endX} ${endY}`} dur="1.2s" repeatCount="indefinite" />
                </circle>
              </g>
            );
          })}

          {/* COORDINATOR SELF-LOOP — internal recompute (conflict resolution / replanning / directive applied) */}
          {isSelfLoop && NETWORK_NODES.agent_coordinator && (() => {
            const c = NETWORK_NODES.agent_coordinator;
            const loopColor = isOverridePacket ? '#E26161' : '#A99BC9';
            const loopR = 46; // radius of the orbiting ring, outside the node's own glow circle
            return (
              <g transform={`translate(${c.x}, ${c.y})`}>
                <circle
                  r={loopR}
                  fill="none"
                  stroke={loopColor}
                  strokeWidth={2.5}
                  strokeDasharray="4 6"
                  opacity={0.7}
                  className="animate-spin"
                  style={{ transformOrigin: 'center', animationDuration: '3s' }}
                />
                <circle r={4} fill="#FFFFFF" filter="url(#strongGlow)">
                  <animateMotion
                    path={`M 0 ${-loopR} A ${loopR} ${loopR} 0 1 1 -0.1 ${-loopR}`}
                    dur="1.6s"
                    repeatCount="indefinite"
                  />
                </circle>
                <text
                  y={-(loopR + 12)}
                  textAnchor="middle"
                  fill={loopColor}
                  fontSize="10"
                  fontWeight="800"
                  fontFamily="monospace"
                >
                  ⟳ {selfLoopLabel || 'PROCESSING'}
                </text>
              </g>
            );
          })()}

          {/* AGENT NODES */}
          {Object.values(NETWORK_NODES).map((node) => {
            const isSender = activeSenderId === node.id;
            const isReceiver = activeReceiverId === node.id;
            const isCoordinator = node.id === 'agent_coordinator';
            const hasActiveComm = Boolean(activeSenderId);
            const isInvolved = isSender || isReceiver;

            // Ephemeral nodes (operator, console) stay invisible until they're actually part of the current event.
            if (node.ephemeral && !isInvolved) return null;

            const isDimmed = hasActiveComm && !isInvolved;
            const rawStatus = agentStates[node.id] || 'idle';

            let statusLabel = 'IDLE';
            let statusColor = '#565E75';

            if (isSender) {
              statusLabel = currentStage === 'THINKING' ? 'THINKING...' : node.id === 'HUMAN_OPERATOR' ? 'DIRECTIVE SENT' : 'SENDING...';
              statusColor = node.ephemeral ? '#E26161' : '#E6B85C';
            } else if (isReceiver) {
              statusLabel = currentStage === 'RECEIVING' ? 'RECEIVING...' : 'PROCESSING...';
              statusColor = '#7AE04C';
            } else if (rawStatus === 'thinking') {
              statusLabel = 'THINKING...';
              statusColor = '#A99BC9';
            } else if (rawStatus === 'active' || rawStatus === 'completed') {
              statusLabel = 'ACTIVE';
              statusColor = '#7AE04C';
            }

            const outerRadius = isCoordinator ? 32 : isInvolved ? 28 : 22;
            const innerRadius = isCoordinator ? 24 : 18;

            return (
              <g
                key={node.id}
                transform={`translate(${node.x}, ${node.y})`}
                className={`transition-all duration-300 ${isDimmed ? 'opacity-35 grayscale-[20%]' : 'opacity-100'}`}
              >
                <circle
                  r={outerRadius}
                  fill={node.color}
                  fillOpacity={isInvolved ? 0.4 : isCoordinator ? 0.25 : 0.15}
                  stroke={isSender ? (node.ephemeral ? '#E26161' : '#E6B85C') : isReceiver ? '#7AE04C' : isCoordinator ? '#A99BC9' : node.color}
                  strokeWidth={isInvolved ? 3.5 : isCoordinator ? 2.5 : 1.5}
                  className={isInvolved ? 'animate-pulse' : ''}
                  filter={isInvolved ? 'url(#strongGlow)' : isCoordinator ? 'url(#glow)' : 'none'}
                />

                <circle
                  r={innerRadius}
                  fill="#292733"
                  stroke={isSender ? (node.ephemeral ? '#E26161' : '#E6B85C') : isReceiver ? '#7AE04C' : node.color}
                  strokeWidth={2}
                />

                <text x={0} y={isCoordinator ? 6 : 5} textAnchor="middle" fontSize={isCoordinator ? '18' : '14'}>
                  {node.icon}
                </text>

                <circle
                  cx={innerRadius - 2}
                  cy={-(innerRadius - 2)}
                  r={4}
                  fill={statusColor}
                  stroke="#292733"
                  strokeWidth={1.5}
                />

                <text
                  y={outerRadius + 14}
                  textAnchor="middle"
                  fill="#F3F3F3"
                  fontSize={isCoordinator ? '11' : '10'}
                  fontWeight="800"
                  fontFamily="monospace"
                >
                  {node.name}
                </text>

                <text
                  y={outerRadius + 26}
                  textAnchor="middle"
                  fill={statusColor}
                  fontSize="9"
                  fontWeight="700"
                  fontFamily="monospace"
                >
                  ● {statusLabel}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
};
import React, { useState } from 'react';
import { 
  Building, 
  ShieldAlert, 
  CheckCircle2, 
  AlertTriangle, 
  Users, 
  Activity, 
  Radio, 
  Network,
  Zap,
  ArrowRight,
  Info,
  Clock,
  Flame,
  ChevronDown,
  ChevronUp,
  UserCheck,
  Gauge
} from 'lucide-react';
import { useEmergency } from '../../context/EmergencyContext';
import { BuildingVisualA, BuildingVisualB, BuildingVisualC } from './BuildingVisuals';
import { EvacuationRouteMap } from './EvacuationRouteMap';
import { BUILDING_IDENTITY, getNetworkSummary, type BuildingId } from '../../lib/mock/campusNetworkState';

export const BuildingComparisonView: React.FC = () => {
  const { state } = useEmergency();
  const { incident, occupancy, exits, crossBuildingAlerts, selectedRole } = state;

  const isEmergencyActive = incident.severity === 'high' || incident.severity === 'critical';
  const hasCrossAlert = crossBuildingAlerts.length > 0;

  // Which building card is expanded — null means all collapsed to the compact comparison view.
  const [expandedBuilding, setExpandedBuilding] = useState<BuildingId | null>('building_A');
  const toggleExpanded = (id: BuildingId) => setExpandedBuilding((prev) => (prev === id ? null : id));

  const networkSummary = getNetworkSummary({ isEmergencyActive, hasCrossAlert });

  return (
    <div className="space-y-6 font-sans">
      {/* HEADER SECTION */}
      <div className="bg-white border border-[#423F4F]/10 rounded-[8px] p-6 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 font-mono-tech text-xs font-bold text-[#A99BC9] uppercase tracking-widest mb-1">
            <Network className="w-4 h-4 text-[#A99BC9]" />
            <span>CAMPUS MESH TELEMETRY // 3 CONNECTED BUILDINGS</span>
          </div>
          <h1 className="text-2xl font-extrabold text-[#292733] tracking-tight">
            CAMPUS BUILDING COMPARISON & NETWORK STATE
          </h1>
          <p className="text-xs text-[#565E75] mt-0.5">
            Side-by-side real-time status telemetry across Building A, Building B, and Building C powered by the LATTICE multi-agent mesh.
          </p>
        </div>

        <div className="flex items-center gap-2 font-mono-tech text-xs">
          <span className="px-3 py-1.5 bg-[#292733] text-[#F3F3F3] rounded-[6px] font-bold border border-[#423F4F] flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#7AE04C] animate-pulse"></span>
            <span>ROLE: {selectedRole === 'BUILDING_OPERATOR' ? '👤 BUILDING OPERATOR (Bldg A Focus)' : '🌐 NETWORK OPERATOR (Campus Wide)'}</span>
          </span>
        </div>
      </div>

      {/* CAMPUS NETWORK SUMMARY STRIP */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {[
          { label: 'CONNECTED BUILDINGS', value: networkSummary.connectedBuildings, color: '#7AE04C' },
          { label: 'ACTIVE INCIDENTS', value: String(networkSummary.activeIncidents), color: networkSummary.activeIncidents > 0 ? '#E26161' : '#7AE04C' },
          { label: 'AGENTS ONLINE', value: networkSummary.agentsOnline, color: '#6B9FD4' },
          { label: 'MUTUAL AID', value: networkSummary.mutualAidActive > 0 ? `${networkSummary.mutualAidActive} ACTIVE` : 'NONE ACTIVE', color: networkSummary.mutualAidActive > 0 ? '#E6B85C' : '#7AE04C' },
          { label: 'PENDING DECISIONS', value: String(networkSummary.pendingDecisions), color: networkSummary.pendingDecisions > 0 ? '#E6B85C' : '#7AE04C' },
          { label: 'NETWORK HEALTH', value: `${networkSummary.networkHealthPct}%`, color: '#A99BC9' },
        ].map((metric) => (
          <div key={metric.label} className="bg-white border border-[#423F4F]/10 rounded-[8px] p-3.5 shadow-sm font-mono-tech">
            <span className="text-[9px] text-[#565E75] font-bold uppercase block mb-1 tracking-wide">{metric.label}</span>
            <span className="text-lg font-extrabold" style={{ color: metric.color }}>{metric.value}</span>
          </div>
        ))}
      </div>

      {/* NETWORK CONNECTION TOPOLOGY VISUALIZER */}
      <div className="bg-[#292733] text-[#F3F3F3] rounded-[8px] p-5 border border-[#423F4F] shadow-md space-y-3">
        <div className="flex items-center justify-between border-b border-[#565E75]/40 pb-2.5 font-mono-tech text-xs">
          <div className="flex items-center gap-2">
            <Radio className="w-4 h-4 text-[#7AE04C] animate-pulse" />
            <span className="font-bold text-[#F3F3F3]">INTER-BUILDING PEER MESH TOPOLOGY</span>
          </div>
          <span className="text-[10px] text-[#A99BC9] font-bold">ZERO-TRUST PACKET CHANNEL</span>
        </div>

        <div className="relative py-6 px-4">
          <svg viewBox="0 0 800 220" className="w-full h-auto overflow-visible" preserveAspectRatio="xMidYMid meet">
            <defs>
              <marker id="meshArrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
                <path d="M1 1L9 5L1 9Z" fill="context-stroke" stroke="none" />
              </marker>
              <marker id="meshArrowAlert" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="8" markerHeight="8" orient="auto-start-reverse">
                <path d="M1 1L9 5L1 9Z" fill="#E6B85C" stroke="none" />
              </marker>
              <radialGradient id="alertGlow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#E26161" stopOpacity="0.55" />
                <stop offset="100%" stopColor="#E26161" stopOpacity="0" />
              </radialGradient>
              <radialGradient id="aidGlow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#E6B85C" stopOpacity="0.5" />
                <stop offset="100%" stopColor="#E6B85C" stopOpacity="0" />
              </radialGradient>
            </defs>

            {/* Base mesh links — always visible, with clear directional arrowheads */}
            <line
              x1="130" y1="70" x2="372" y2="70"
              stroke="#8992AC" strokeWidth="2" strokeDasharray="7 5"
              markerEnd="url(#meshArrow)" opacity="0.9"
            >
              <animate attributeName="stroke-dashoffset" from="24" to="0" dur="2.2s" repeatCount="indefinite" />
            </line>
            <line
              x1="428" y1="70" x2="682" y2="70"
              stroke="#8992AC" strokeWidth="2" strokeDasharray="7 5"
              markerEnd="url(#meshArrow)" opacity="0.9"
            >
              <animate attributeName="stroke-dashoffset" from="24" to="0" dur="2.2s" repeatCount="indefinite" />
            </line>
            {/* Long-range A -> C backbone link, arched above, subtler but still arrowed */}
            <path
              id="meshPathAC"
              d="M 130 60 Q 400 -6 668 60"
              fill="none" stroke="#6B9FD4" strokeWidth="1.5" strokeDasharray="4 6"
              markerEnd="url(#meshArrow)" opacity="0.45"
            />

            {/* Active alert link A -> B, drawn on top, brighter, with arrowhead */}
            {hasCrossAlert && (
              <>
                <line
                  x1="150" y1="70" x2="376" y2="70"
                  stroke="#E6B85C" strokeWidth="3.5" strokeDasharray="8 5"
                  markerEnd="url(#meshArrowAlert)"
                  strokeLinecap="round"
                >
                  <animate attributeName="stroke-dashoffset" from="26" to="0" dur="1s" repeatCount="indefinite" />
                </line>
                <circle r="6" fill="#E6B85C">
                  <animateMotion path="M 150 70 L 376 70" dur="1.8s" repeatCount="indefinite" />
                </circle>
              </>
            )}

            {/* Emergency glow behind Node A */}
            {isEmergencyActive && <circle cx="90" cy="70" r="50" fill="url(#alertGlow)" />}
            {hasCrossAlert && <circle cx="400" cy="70" r="46" fill="url(#aidGlow)" />}

            {/* Node A */}
            <g>
              <circle cx="90" cy="70" r="26" fill={isEmergencyActive ? '#E26161' : '#292733'} stroke={isEmergencyActive ? '#FFFFFF' : '#A99BC9'} strokeWidth="1.5">
                {isEmergencyActive && (
                  <animate attributeName="r" values="26;29;26" dur="1.6s" repeatCount="indefinite" />
                )}
              </circle>
              <text x="90" y="76" textAnchor="middle" fill="#FFFFFF" fontSize="14" fontWeight="800" fontFamily="monospace">A</text>
              <text x="90" y="112" textAnchor="middle" fill="#F3F3F3" fontSize="11" fontWeight="700" fontFamily="monospace">BUILDING A</text>
              <text x="90" y="128" textAnchor="middle" fill="#E26161" fontSize="9" fontWeight="700" fontFamily="monospace">
                {isEmergencyActive ? '● INCIDENT ZONE' : '● OPERATIONAL'}
              </text>
            </g>

            {/* Node B */}
            <g>
              <circle cx="400" cy="70" r="26" fill={hasCrossAlert ? '#E6B85C' : '#292733'} stroke={hasCrossAlert ? '#FFFFFF' : '#7AE04C'} strokeWidth="1.5">
                {hasCrossAlert && (
                  <animate attributeName="r" values="26;29;26" dur="1.6s" repeatCount="indefinite" />
                )}
              </circle>
              <text x="400" y="76" textAnchor="middle" fill={hasCrossAlert ? '#292733' : '#FFFFFF'} fontSize="14" fontWeight="800" fontFamily="monospace">B</text>
              <text x="400" y="112" textAnchor="middle" fill="#F3F3F3" fontSize="11" fontWeight="700" fontFamily="monospace">BUILDING B</text>
              <text x="400" y="128" textAnchor="middle" fill={hasCrossAlert ? '#E6B85C' : '#7AE04C'} fontSize="9" fontWeight="700" fontFamily="monospace">
                {hasCrossAlert ? '⚠ ALERT RECEIVED' : '● OPERATIONAL'}
              </text>
            </g>

            {/* Node C */}
            <g>
              <circle cx="710" cy="70" r="26" fill="#292733" stroke="#7AE04C" strokeWidth="1.5" />
              <text x="710" y="76" textAnchor="middle" fill="#FFFFFF" fontSize="14" fontWeight="800" fontFamily="monospace">C</text>
              <text x="710" y="112" textAnchor="middle" fill="#F3F3F3" fontSize="11" fontWeight="700" fontFamily="monospace">BUILDING C</text>
              <text x="710" y="128" textAnchor="middle" fill="#7AE04C" fontSize="9" fontWeight="700" fontFamily="monospace">● OPERATIONAL</text>
            </g>

            {/* Link status labels */}
            <text x="250" y="52" textAnchor="middle" fill={hasCrossAlert ? '#E6B85C' : '#A9AFC4'} fontSize="9" fontWeight="700" fontFamily="monospace">
              {hasCrossAlert ? 'MUTUAL AID ACTIVE ▸' : 'STANDBY LINK ▸'}
            </text>
            <text x="555" y="52" textAnchor="middle" fill="#A9AFC4" fontSize="9" fontWeight="700" fontFamily="monospace">STANDBY LINK ▸</text>
          </svg>
        </div>
      </div>

      {/* THREE BUILDINGS SIDE-BY-SIDE COMPARISON GRID */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* ================= BUILDING A ================= */}
        <div className={`bg-white border rounded-[8px] p-5 shadow-sm space-y-4 flex flex-col justify-between transition-all ${
          selectedRole === 'BUILDING_OPERATOR'
            ? 'border-[#A99BC9] ring-2 ring-[#A99BC9]/30'
            : 'border-[#423F4F]/10'
        }`}>
          <div className="space-y-3">
            {/* Header — click to expand/collapse building detail */}
            <button
              onClick={() => toggleExpanded('building_A')}
              className="w-full flex items-center justify-between border-b border-[#423F4F]/10 pb-2.5 text-left cursor-pointer group"
              aria-expanded={expandedBuilding === 'building_A'}
            >
              <div>
                <span className="font-mono-tech text-[10px] font-bold text-[#A99BC9] uppercase block">
                  PRIMARY INCIDENT BUILDING
                </span>
                <h2 className="text-lg font-extrabold text-[#292733]">BUILDING A</h2>
                <p className="font-mono-tech text-[10px] text-[#565E75]">Operations Tower (12 Floors)</p>
              </div>

              <div className="flex items-center gap-2">
                <span className="font-mono-tech text-xs font-bold text-[#E26161] bg-[#E26161]/10 px-2.5 py-1 rounded border border-[#E26161]/30 animate-pulse">
                  🔴 EMERGENCY
                </span>
                {expandedBuilding === 'building_A' ? (
                  <ChevronUp className="w-4 h-4 text-[#A99BC9] group-hover:text-[#292733]" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-[#A99BC9] group-hover:text-[#292733]" />
                )}
              </div>
            </button>

            {/* 2D Vector Silhouette Illustration */}
            <BuildingVisualA state={state} isFocused={selectedRole === 'BUILDING_OPERATOR'} />

            {/* COMPARISON METRICS TABLE */}
            <div className="space-y-2 font-mono-tech text-xs pt-1">
              {/* Status */}
              <div className="p-2.5 bg-[#F3F3F3] rounded border border-[#423F4F]/10 flex items-center justify-between">
                <span className="text-[#565E75] font-bold">STATUS:</span>
                <span className="font-extrabold text-[#E26161] flex items-center gap-1">
                  <Flame className="w-3.5 h-3.5 fill-current" /> Floor 4 Fire
                </span>
              </div>

              {/* Occupancy */}
              <div className="p-2.5 bg-[#F3F3F3] rounded border border-[#423F4F]/10 flex items-center justify-between">
                <span className="text-[#565E75] font-bold">OCCUPANCY:</span>
                <span className="font-extrabold text-[#292733]">{occupancy.total} Occupants (3 Mobility)</span>
              </div>

              {/* Hazard Level */}
              <div className="p-2.5 bg-[#F3F3F3] rounded border border-[#423F4F]/10 flex items-center justify-between">
                <span className="text-[#565E75] font-bold">HAZARD LEVEL:</span>
                <span className="font-extrabold text-[#E26161]">{incident.severity.toUpperCase()}</span>
              </div>

              {/* Active Agents */}
              <div className="p-2.5 bg-[#F3F3F3] rounded border border-[#423F4F]/10 flex items-center justify-between">
                <span className="text-[#565E75] font-bold">ACTIVE AGENTS:</span>
                <span className="font-extrabold text-[#7AE04C]">6 / 6 Active</span>
              </div>

              {/* Response State */}
              <div className="p-2.5 bg-[#F3F3F3] rounded border border-[#423F4F]/10 flex items-center justify-between">
                <span className="text-[#565E75] font-bold">RESPONSE STATE:</span>
                <span className="font-extrabold text-[#E6B85C]">Evacuation in Progress</span>
              </div>

              {/* Last Event */}
              <div className="p-2.5 bg-[#F3F3F3] rounded border border-[#423F4F]/10 flex items-center justify-between">
                <span className="text-[#565E75] font-bold">PRIMARY EGRESS:</span>
                <span className="font-extrabold text-[#7AE04C]">Exit B (Exit A Blocked)</span>
              </div>
            </div>

            {/* EXPANDED DETAIL — Human Operator, Emergency State, Evacuation Route Map */}
            {expandedBuilding === 'building_A' && (
              <div className="space-y-3 pt-1">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 font-mono-tech text-xs">
                  <div className="p-3 bg-[#F3F3F3] rounded border border-[#423F4F]/10 space-y-1.5">
                    <span className="flex items-center gap-1.5 text-[10px] text-[#A99BC9] font-bold uppercase"><UserCheck className="w-3.5 h-3.5" />HUMAN OPERATOR</span>
                    <p className="font-extrabold text-[#292733]">{BUILDING_IDENTITY.building_A.operator.name}</p>
                    <p className="text-[#7AE04C] font-bold">{BUILDING_IDENTITY.building_A.operator.online ? '● ONLINE' : '○ OFFLINE'}</p>
                    <p className="text-[#565E75]">{BUILDING_IDENTITY.building_A.operator.activity}</p>
                  </div>
                  <div className="p-3 bg-[#F3F3F3] rounded border border-[#423F4F]/10 space-y-1.5">
                    <span className="flex items-center gap-1.5 text-[10px] text-[#A99BC9] font-bold uppercase"><Gauge className="w-3.5 h-3.5" />EMERGENCY STATE</span>
                    <p className="font-extrabold text-[#E26161]">{incident.severity.toUpperCase()}</p>
                    <p className="text-[#565E75]">Affected: Floor 4</p>
                    <p className="text-[#565E75]">Action: Evacuation via Exit B</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Scope Indicator */}
          <div className="p-2.5 bg-[#292733] text-[#F3F3F3] rounded-[6px] font-mono-tech text-[10px] flex items-center justify-between">
            <span>ASSIGNMENT: LOCAL TOWER COMMAND</span>
            <span className="text-[#7AE04C] font-bold">ACTIVE</span>
          </div>
        </div>

        {/* ================= BUILDING B ================= */}
        <div className="bg-white border border-[#423F4F]/10 rounded-[8px] p-5 shadow-sm space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            {/* Header — click to expand/collapse building detail */}
            <button
              onClick={() => toggleExpanded('building_B')}
              className="w-full flex items-center justify-between border-b border-[#423F4F]/10 pb-2.5 text-left cursor-pointer group"
              aria-expanded={expandedBuilding === 'building_B'}
            >
              <div>
                <span className="font-mono-tech text-[10px] font-bold text-[#A99BC9] uppercase block">
                  CONNECTED ADJACENT BUILDING
                </span>
                <h2 className="text-lg font-extrabold text-[#292733]">BUILDING B</h2>
                <p className="font-mono-tech text-[10px] text-[#565E75]">North Block (5 Floors)</p>
              </div>

              <div className="flex items-center gap-2">
                <span className={`font-mono-tech text-xs font-bold px-2.5 py-1 rounded border ${
                  hasCrossAlert
                    ? 'text-[#E6B85C] bg-[#E6B85C]/10 border-[#E6B85C]/30 animate-pulse'
                    : 'text-[#7AE04C] bg-[#7AE04C]/10 border-[#7AE04C]/30'
                }`}>
                  {hasCrossAlert ? '⚠ MONITORING' : '● OPERATIONAL'}
                </span>
                {expandedBuilding === 'building_B' ? (
                  <ChevronUp className="w-4 h-4 text-[#A99BC9] group-hover:text-[#292733]" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-[#A99BC9] group-hover:text-[#292733]" />
                )}
              </div>
            </button>

            {/* 2D Vector Silhouette Illustration */}
            <BuildingVisualB state={state} isFocused={selectedRole === 'NETWORK_OPERATOR'} />

            {/* COMPARISON METRICS TABLE */}
            <div className="space-y-2 font-mono-tech text-xs pt-1">
              {/* Status */}
              <div className="p-2.5 bg-[#F3F3F3] rounded border border-[#423F4F]/10 flex items-center justify-between">
                <span className="text-[#565E75] font-bold">STATUS:</span>
                <span className={`font-extrabold ${hasCrossAlert ? 'text-[#E6B85C]' : 'text-[#7AE04C]'}`}>
                  {hasCrossAlert ? 'Alert Received' : 'Nominal'}
                </span>
              </div>

              {/* Occupancy */}
              <div className="p-2.5 bg-[#F3F3F3] rounded border border-[#423F4F]/10 flex items-center justify-between">
                <span className="text-[#565E75] font-bold">OCCUPANCY:</span>
                <span className="font-extrabold text-[#292733]">31 Occupants</span>
              </div>

              {/* Hazard Level */}
              <div className="p-2.5 bg-[#F3F3F3] rounded border border-[#423F4F]/10 flex items-center justify-between">
                <span className="text-[#565E75] font-bold">HAZARD LEVEL:</span>
                <span className="font-extrabold text-[#7AE04C]">LOW / NONE</span>
              </div>

              {/* Active Agents */}
              <div className="p-2.5 bg-[#F3F3F3] rounded border border-[#423F4F]/10 flex items-center justify-between">
                <span className="text-[#565E75] font-bold">ACTIVE AGENTS:</span>
                <span className="font-extrabold text-[#6B9FD4]">1 / 6 Active (Relay)</span>
              </div>

              {/* Response State */}
              <div className="p-2.5 bg-[#F3F3F3] rounded border border-[#423F4F]/10 flex items-center justify-between">
                <span className="text-[#565E75] font-bold">RESPONSE STATE:</span>
                <span className="font-extrabold text-[#6B9FD4]">Concourse Damper Isolated</span>
              </div>

              {/* Last Event */}
              <div className="p-2.5 bg-[#F3F3F3] rounded border border-[#423F4F]/10 flex items-center justify-between truncate">
                <span className="text-[#565E75] font-bold">LAST EVENT:</span>
                <span className="font-extrabold text-[#292733] truncate pl-2">
                  {hasCrossAlert ? 'Mutual Aid Alert Received' : 'Concourse Clear'}
                </span>
              </div>
            </div>

            {/* EXPANDED DETAIL — Human Operator + Emergency State */}
            {expandedBuilding === 'building_B' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 font-mono-tech text-xs pt-1">
                <div className="p-3 bg-[#F3F3F3] rounded border border-[#423F4F]/10 space-y-1.5">
                  <span className="flex items-center gap-1.5 text-[10px] text-[#A99BC9] font-bold uppercase"><UserCheck className="w-3.5 h-3.5" />HUMAN OPERATOR</span>
                  <p className="font-extrabold text-[#292733]">{BUILDING_IDENTITY.building_B.operator.name}</p>
                  <p className="text-[#7AE04C] font-bold">{BUILDING_IDENTITY.building_B.operator.online ? '● ONLINE' : '○ OFFLINE'}</p>
                  <p className="text-[#565E75]">{BUILDING_IDENTITY.building_B.operator.activity}</p>
                </div>
                <div className="p-3 bg-[#F3F3F3] rounded border border-[#423F4F]/10 space-y-1.5">
                  <span className="flex items-center gap-1.5 text-[10px] text-[#A99BC9] font-bold uppercase"><Gauge className="w-3.5 h-3.5" />EMERGENCY STATE</span>
                  <p className={`font-extrabold ${hasCrossAlert ? 'text-[#E6B85C]' : 'text-[#7AE04C]'}`}>{hasCrossAlert ? 'MUTUAL AID STANDBY' : 'NONE'}</p>
                  <p className="text-[#565E75]">Affected: Shared Concourse (Floor 4)</p>
                  <p className="text-[#565E75]">Action: {hasCrossAlert ? 'Damper isolation + relay support' : 'Routine monitoring'}</p>
                </div>
              </div>
            )}
          </div>

          {/* Scope Indicator */}
          <div className="p-2.5 bg-[#292733] text-[#F3F3F3] rounded-[6px] font-mono-tech text-[10px] flex items-center justify-between">
            <span>MUTUAL AID LINK: CONCOURSE BRIDGE</span>
            <span className="text-[#6B9FD4] font-bold">CONNECTED</span>
          </div>
        </div>

        {/* ================= BUILDING C ================= */}
        <div className="bg-white border border-[#423F4F]/10 rounded-[8px] p-5 shadow-sm space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            {/* Header — click to expand/collapse building detail */}
            <button
              onClick={() => toggleExpanded('building_C')}
              className="w-full flex items-center justify-between border-b border-[#423F4F]/10 pb-2.5 text-left cursor-pointer group"
              aria-expanded={expandedBuilding === 'building_C'}
            >
              <div>
                <span className="font-mono-tech text-[10px] font-bold text-[#A99BC9] uppercase block">
                  CONNECTED ADJACENT BUILDING
                </span>
                <h2 className="text-lg font-extrabold text-[#292733]">BUILDING C</h2>
                <p className="font-mono-tech text-[10px] text-[#565E75]">Research Block (4 Floors)</p>
              </div>

              <div className="flex items-center gap-2">
                <span className="font-mono-tech text-xs font-bold text-[#7AE04C] bg-[#7AE04C]/10 px-2.5 py-1 rounded border border-[#7AE04C]/30">
                  ● OPERATIONAL
                </span>
                {expandedBuilding === 'building_C' ? (
                  <ChevronUp className="w-4 h-4 text-[#A99BC9] group-hover:text-[#292733]" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-[#A99BC9] group-hover:text-[#292733]" />
                )}
              </div>
            </button>

            {/* 2D Vector Silhouette Illustration */}
            <BuildingVisualC state={state} isFocused={selectedRole === 'NETWORK_OPERATOR'} />

            {/* COMPARISON METRICS TABLE */}
            <div className="space-y-2 font-mono-tech text-xs pt-1">
              {/* Status */}
              <div className="p-2.5 bg-[#F3F3F3] rounded border border-[#423F4F]/10 flex items-center justify-between">
                <span className="text-[#565E75] font-bold">STATUS:</span>
                <span className="font-extrabold text-[#7AE04C]">Operational</span>
              </div>

              {/* Occupancy */}
              <div className="p-2.5 bg-[#F3F3F3] rounded border border-[#423F4F]/10 flex items-center justify-between">
                <span className="text-[#565E75] font-bold">OCCUPANCY:</span>
                <span className="font-extrabold text-[#292733]">27 Occupants</span>
              </div>

              {/* Hazard Level */}
              <div className="p-2.5 bg-[#F3F3F3] rounded border border-[#423F4F]/10 flex items-center justify-between">
                <span className="text-[#565E75] font-bold">HAZARD LEVEL:</span>
                <span className="font-extrabold text-[#7AE04C]">LOW / NONE</span>
              </div>

              {/* Active Agents */}
              <div className="p-2.5 bg-[#F3F3F3] rounded border border-[#423F4F]/10 flex items-center justify-between">
                <span className="text-[#565E75] font-bold">ACTIVE AGENTS:</span>
                <span className="font-extrabold text-[#7AE04C]">1 / 6 Active (Standby)</span>
              </div>

              {/* Response State */}
              <div className="p-2.5 bg-[#F3F3F3] rounded border border-[#423F4F]/10 flex items-center justify-between">
                <span className="text-[#565E75] font-bold">RESPONSE STATE:</span>
                <span className="font-extrabold text-[#7AE04C]">All Clear</span>
              </div>

              {/* Last Event */}
              <div className="p-2.5 bg-[#F3F3F3] rounded border border-[#423F4F]/10 flex items-center justify-between">
                <span className="text-[#565E75] font-bold">LAST EVENT:</span>
                <span className="font-extrabold text-[#292733]">System Nominal</span>
              </div>
            </div>

            {/* EXPANDED DETAIL — Human Operator + Emergency State */}
            {expandedBuilding === 'building_C' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 font-mono-tech text-xs pt-1">
                <div className="p-3 bg-[#F3F3F3] rounded border border-[#423F4F]/10 space-y-1.5">
                  <span className="flex items-center gap-1.5 text-[10px] text-[#A99BC9] font-bold uppercase"><UserCheck className="w-3.5 h-3.5" />HUMAN OPERATOR</span>
                  <p className="font-extrabold text-[#292733]">{BUILDING_IDENTITY.building_C.operator.name}</p>
                  <p className="text-[#7AE04C] font-bold">{BUILDING_IDENTITY.building_C.operator.online ? '● ONLINE' : '○ OFFLINE'}</p>
                  <p className="text-[#565E75]">{BUILDING_IDENTITY.building_C.operator.activity}</p>
                </div>
                <div className="p-3 bg-[#F3F3F3] rounded border border-[#423F4F]/10 space-y-1.5">
                  <span className="flex items-center gap-1.5 text-[10px] text-[#A99BC9] font-bold uppercase"><Gauge className="w-3.5 h-3.5" />EMERGENCY STATE</span>
                  <p className="font-extrabold text-[#7AE04C]">NONE</p>
                  <p className="text-[#565E75]">Affected: —</p>
                  <p className="text-[#565E75]">Action: Standby / routine sweep</p>
                </div>
              </div>
            )}
          </div>

          {/* Scope Indicator */}
          <div className="p-2.5 bg-[#292733] text-[#F3F3F3] rounded-[6px] font-mono-tech text-[10px] flex items-center justify-between">
            <span>MUTUAL AID LINK: RESEARCH DUCTING</span>
            <span className="text-[#7AE04C] font-bold">STANDBY</span>
          </div>
        </div>
      </div>

      {/* EVACUATION ROUTE MAP — breaks out to full page width when Building A is expanded,
          so the floor plan has room to breathe instead of being squeezed into a 1-of-3 column */}
      {expandedBuilding === 'building_A' && (
        <EvacuationRouteMap state={state} />
      )}
    </div>
  );
};
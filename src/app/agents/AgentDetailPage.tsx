import React, { useState } from 'react';
import { getAllAgents, getAgentById } from '../../lib/interoperability/agentRegistry';
import { AgentInfo } from '../../types/agent.types';
import { fireHazardAgent } from '../../agents/fire-hazard';
import { occupancyAgent } from '../../agents/occupancy';
import { securityAgent } from '../../agents/security';
import { emergencyCoordinator } from '../../agents/coordinator';
import { ethicalPriorityAgent } from '../../agents/ethical-priority';
import { crossBuildingAgent } from '../../agents/cross-building';
import { 
  Bot, 
  Flame, 
  Users, 
  Shield, 
  Brain, 
  HeartHandshake, 
  Network, 
  Play, 
  Sliders, 
  FileText, 
  CheckCircle2, 
  AlertTriangle, 
  ArrowLeft,
  Info
} from 'lucide-react';

interface AgentDetailPageProps {
  initialAgentId?: string;
  onBackToDashboard?: () => void;
}

const AGENT_ICONS: Record<string, any> = {
  agent_fire_hazard: Flame,
  agent_occupancy: Users,
  agent_security: Shield,
  agent_coordinator: Brain,
  agent_ethical_priority: HeartHandshake,
  agent_cross_building: Network,
};

export const AgentDetailPage: React.FC<AgentDetailPageProps> = ({
  initialAgentId = 'agent_fire_hazard',
  onBackToDashboard,
}) => {
  const agents = getAllAgents();
  const [selectedAgentId, setSelectedAgentId] = useState<string>(initialAgentId);

  // Input states for interactive testing
  const [smokeLevel, setSmokeLevel] = useState<number>(82);
  const [temperature, setTemperature] = useState<number>(87);
  const [fireAlarm, setFireAlarm] = useState<boolean>(true);
  const [totalOccupants, setTotalOccupants] = useState<number>(124);
  const [affectedOccupants, setAffectedOccupants] = useState<number>(42);
  const [assistanceNeeds, setAssistanceNeeds] = useState<number>(3);
  const [cctvDetected, setCctvDetected] = useState<boolean>(true);
  const [doorStatus, setDoorStatus] = useState<'OPEN' | 'RESTRICTED' | 'BLOCKED' | 'UNKNOWN'>('OPEN');
  const [sharedInfra, setSharedInfra] = useState<boolean>(true);

  // Current selected agent info
  const agentEntry = getAgentById(selectedAgentId);
  const agentInfo = agentEntry?.info || agents[0];
  const IconComponent = AGENT_ICONS[selectedAgentId] || Bot;

  // Compute evaluation based on selected agent and sandbox inputs
  const computeAssessment = () => {
    if (selectedAgentId === 'agent_fire_hazard') {
      return fireHazardAgent.process({
        location: 'Block A Floor 4',
        smokeLevel,
        temperature,
        fireAlarm,
        simulated: true,
      });
    }

    if (selectedAgentId === 'agent_occupancy') {
      return occupancyAgent.process({
        totalOccupants,
        floorOccupancy: { '4': affectedOccupants },
        affectedFloors: ['4'],
        registeredAssistanceNeeds: assistanceNeeds,
        simulated: true,
      });
    }

    if (selectedAgentId === 'agent_security') {
      return securityAgent.process({
        location: 'Block A Floor 4',
        cctvEventDetected: cctvDetected,
        accessEventDetected: true,
        doorStatus,
        securityAlert: fireAlarm,
        simulated: true,
      });
    }

    if (selectedAgentId === 'agent_coordinator') {
      const fRes = fireHazardAgent.process({ location: 'Block A Floor 4', smokeLevel, temperature, fireAlarm });
      const oRes = occupancyAgent.process({ totalOccupants, floorOccupancy: { '4': affectedOccupants }, affectedFloors: ['4'], registeredAssistanceNeeds: assistanceNeeds });
      const sRes = securityAgent.process({ location: 'Block A Floor 4', cctvEventDetected: cctvDetected, doorStatus, securityAlert: fireAlarm });

      return emergencyCoordinator.process({
        fireAssessment: fRes,
        occupancyAssessment: oRes,
        securityAssessment: sRes,
        availableRoutes: ['Exit A', 'Stairwell B', 'Exit C'],
        routeLocations: {
          'Exit A': 'Floor 4 Near Hazard',
          'Stairwell B': 'Floor 4 West Wing',
          'Exit C': 'Ground Level Main Exit',
        },
        simulated: true,
      });
    }

    if (selectedAgentId === 'agent_ethical_priority') {
      return ethicalPriorityAgent.process({
        affectedOccupants,
        registeredAssistanceNeeds: assistanceNeeds,
        availableRoutes: ['Stairwell B', 'Exit C'],
        blockedRoutes: ['Exit A'],
        simulated: true,
      });
    }

    if (selectedAgentId === 'agent_cross_building') {
      return crossBuildingAgent.process({
        sourceBuildingId: 'building_A',
        affectedArea: 'Block A Floor 4 / Shared Concourse',
        severity: smokeLevel > 70 ? 'CRITICAL' : 'HIGH',
        nearbyBuildings: ['building_B', 'building_C'],
        sharedInfrastructure: sharedInfra,
        simulated: true,
      });
    }

    return null;
  };

  const assessment = computeAssessment();

  return (
    <div className="min-h-screen bg-[#F3F3F3] text-[#423F4F] p-4 sm:p-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-6 rounded-[8px] border border-[#423F4F]/10 shadow-sm">
          <div className="flex items-center gap-4">
            {onBackToDashboard && (
              <button
                onClick={onBackToDashboard}
                className="btn-lattice-secondary py-2 px-3 text-xs font-mono-tech uppercase tracking-wider flex items-center gap-2 cursor-pointer focus-visible:outline-2 focus-visible:outline-[#A99BC9]"
              >
                <ArrowLeft className="w-3.5 h-3.5 text-[#423F4F]" />
                <span>COMMAND CENTER</span>
              </button>
            )}
            <div>
              <div className="flex items-center gap-2 text-xs font-mono-tech font-bold text-[#A99BC9] uppercase tracking-widest">
                <span>● LATTICE AGENT ARCHITECTURE</span>
              </div>
              <h1 className="text-2xl font-extrabold text-[#292733] tracking-tight">
                AGENT INSPECTION & REASONING LAB
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-[#E6B85C]/15 text-[#292733] px-3 py-1.5 rounded-[6px] border border-[#E6B85C]/30 font-mono-tech text-xs font-bold">
            <Info className="w-4 h-4 text-[#E6B85C]" />
            <span>DEMO / SIMULATED INPUT ACTIVE</span>
          </div>
        </div>

        {/* AGENT SELECTOR TABS */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {agents.map((agent) => {
            const Icon = AGENT_ICONS[agent.id] || Bot;
            const isSelected = agent.id === selectedAgentId;
            return (
              <button
                key={agent.id}
                onClick={() => setSelectedAgentId(agent.id)}
                className={`p-3.5 rounded-[8px] border text-left transition-all cursor-pointer flex flex-col justify-between h-28 focus-visible:outline-2 focus-visible:outline-[#A99BC9] ${
                  isSelected
                    ? 'bg-[#292733] text-[#F3F3F3] border-[#292733] shadow-md ring-2 ring-[#A99BC9]'
                    : 'bg-white text-[#423F4F] border-[#423F4F]/15 hover:border-[#423F4F]/40'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div
                    className="w-7 h-7 rounded-[4px] flex items-center justify-center font-bold text-xs"
                    style={{ backgroundColor: agent.accentColor, color: '#292733' }}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="font-mono-tech text-[9px] font-bold text-[#7AE04C]">
                    ● {agent.status.toUpperCase()}
                  </span>
                </div>

                <div>
                  <h3 className="font-extrabold text-xs tracking-tight line-clamp-1">{agent.name}</h3>
                  <p className="font-mono-tech text-[9px] text-[#A99BC9] truncate capitalize">{agent.type.replace('_', ' ')}</p>
                </div>
              </button>
            );
          })}
        </div>

        {/* MAIN DETAIL PANEL */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* LEFT COL: AGENT METADATA & PARAMETER CONTROLS */}
          <div className="space-y-6">
            {/* Agent Info Box */}
            <div className="bg-white border border-[#423F4F]/10 rounded-[8px] p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div
                  className="w-10 h-10 rounded-[6px] flex items-center justify-center font-bold text-lg shadow-sm"
                  style={{ backgroundColor: agentInfo.accentColor, color: '#292733' }}
                >
                  <IconComponent className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-lg font-extrabold text-[#292733] tracking-tight">{agentInfo.name}</h2>
                  <p className="font-mono-tech text-xs text-[#565E75]">ID: {agentInfo.id}</p>
                </div>
              </div>

              <p className="text-xs text-[#565E75] leading-relaxed mb-4">{agentInfo.description}</p>

              <div className="border-t border-[#423F4F]/10 pt-4 space-y-3 font-mono-tech text-xs">
                <div>
                  <span className="text-[#565E75] uppercase text-[10px] block mb-1">CAPABILITIES:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {agentInfo.capabilities.map((cap) => (
                      <span
                        key={cap}
                        className="px-2 py-0.5 bg-[#423F4F]/10 text-[#292733] rounded border border-[#423F4F]/10 font-bold text-[10px]"
                      >
                        {cap}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex justify-between items-center py-1 border-t border-[#423F4F]/10 pt-2">
                  <span className="text-[#565E75]">STATUS:</span>
                  <span className="font-bold text-[#7AE04C] bg-[#7AE04C]/15 px-2 py-0.5 rounded border border-[#7AE04C]/30">
                    ● {agentInfo.status.toUpperCase()}
                  </span>
                </div>

                <div className="flex justify-between items-center py-1">
                  <span className="text-[#565E75]">BINDING:</span>
                  <span className="font-bold text-[#292733]">Block A (Default Node)</span>
                </div>
              </div>
            </div>

            {/* Interactive Parameter Tuning Box */}
            <div className="bg-white border border-[#423F4F]/10 rounded-[8px] p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4 border-b border-[#423F4F]/10 pb-3">
                <div className="flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-[#A99BC9]" />
                  <h3 className="font-extrabold text-sm text-[#292733] tracking-tight uppercase font-mono-tech">
                    SIMULATED INPUT CONTROLS
                  </h3>
                </div>
                <span className="font-mono-tech text-[10px] text-[#A99BC9] uppercase font-bold">LIVE RE-EVALUATION</span>
              </div>

              <div className="space-y-4 text-xs font-mono-tech">
                {/* Smoke Slider */}
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-[#565E75]">Smoke Particulate Level:</span>
                    <span className="font-bold text-[#E26161]">{smokeLevel}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={smokeLevel}
                    onChange={(e) => setSmokeLevel(Number(e.target.value))}
                    className="w-full accent-[#E26161] cursor-pointer"
                  />
                </div>

                {/* Temperature Slider */}
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-[#565E75]">Zone Temperature:</span>
                    <span className="font-bold text-[#E26161]">{temperature}°C</span>
                  </div>
                  <input
                    type="range"
                    min="15"
                    max="120"
                    value={temperature}
                    onChange={(e) => setTemperature(Number(e.target.value))}
                    className="w-full accent-[#E26161] cursor-pointer"
                  />
                </div>

                {/* Alarm Checkbox */}
                <div className="flex items-center justify-between p-2.5 bg-[#F3F3F3] rounded-[6px] border border-[#423F4F]/10">
                  <span className="text-[#292733] font-bold">Physical Fire Alarm Trigger</span>
                  <input
                    type="checkbox"
                    checked={fireAlarm}
                    onChange={(e) => setFireAlarm(e.target.checked)}
                    className="w-4 h-4 accent-[#E26161] cursor-pointer"
                  />
                </div>

                {/* Assistance Needs Slider */}
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-[#565E75]">Registered Assistance Needs:</span>
                    <span className="font-bold text-[#E6B85C]">{assistanceNeeds} occupants</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="10"
                    value={assistanceNeeds}
                    onChange={(e) => setAssistanceNeeds(Number(e.target.value))}
                    className="w-full accent-[#E6B85C] cursor-pointer"
                  />
                </div>

                {/* CCTV Toggle */}
                <div className="flex items-center justify-between p-2.5 bg-[#F3F3F3] rounded-[6px] border border-[#423F4F]/10">
                  <span className="text-[#292733] font-bold">CCTV Visual Event Detected</span>
                  <input
                    type="checkbox"
                    checked={cctvDetected}
                    onChange={(e) => setCctvDetected(e.target.checked)}
                    className="w-4 h-4 accent-[#6B9FD4] cursor-pointer"
                  />
                </div>

                {/* Door Status */}
                <div>
                  <label className="text-[#565E75] block mb-1">Physical Door Status:</label>
                  <select
                    value={doorStatus}
                    onChange={(e) => setDoorStatus(e.target.value as any)}
                    className="w-full p-2 bg-[#F3F3F3] border border-[#423F4F]/20 rounded-[6px] text-xs font-bold text-[#292733] cursor-pointer focus:outline-none"
                  >
                    <option value="OPEN">OPEN (Unobstructed Egress)</option>
                    <option value="RESTRICTED">RESTRICTED (Keycard Required)</option>
                    <option value="BLOCKED">BLOCKED (Physical Obstruction)</option>
                    <option value="UNKNOWN">UNKNOWN (Telemetry Failure)</option>
                  </select>
                </div>

                {/* Shared Infra Toggle */}
                <div className="flex items-center justify-between p-2.5 bg-[#F3F3F3] rounded-[6px] border border-[#423F4F]/10">
                  <span className="text-[#292733] font-bold">Shared Campus Infrastructure</span>
                  <input
                    type="checkbox"
                    checked={sharedInfra}
                    onChange={(e) => setSharedInfra(e.target.checked)}
                    className="w-4 h-4 accent-[#7AE04C] cursor-pointer"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT COL (2 COLS): ASSESSMENT OUTPUT & EXPLAINABILITY */}
          <div className="lg:col-span-2 space-y-6">
            {/* Assessment Result Summary Header Card */}
            <div className="bg-[#292733] text-[#F3F3F3] rounded-[8px] p-6 border border-[#423F4F] shadow-md">
              <div className="flex items-center justify-between mb-4 border-b border-[#565E75]/40 pb-3 font-mono-tech">
                <div className="flex items-center gap-2 text-xs text-[#A99BC9] font-bold uppercase tracking-wider">
                  <FileText className="w-4 h-4" />
                  <span>STRUCTURED AGENT EVALUATION</span>
                </div>
                <span className="text-[10px] text-[#7AE04C] font-bold bg-[#7AE04C]/10 px-2 py-0.5 rounded border border-[#7AE04C]/20">
                  ASSESSMENT GENERATED
                </span>
              </div>

              {assessment && (
                <div className="space-y-4 font-sans">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="p-3 bg-[#423F4F]/50 rounded-[6px] border border-[#565E75]/30 font-mono-tech">
                      <span className="text-[10px] text-[#A99BC9] uppercase block mb-0.5">STATUS</span>
                      <span className="text-sm font-extrabold text-[#7AE04C]">
                        {assessment.status.toUpperCase()}
                      </span>
                    </div>

                    <div className="p-3 bg-[#423F4F]/50 rounded-[6px] border border-[#565E75]/30 font-mono-tech">
                      <span className="text-[10px] text-[#A99BC9] uppercase block mb-0.5">SEVERITY / PRIORITY</span>
                      <span className="text-sm font-extrabold text-[#E26161]">
                        {(assessment as any).severity || (assessment as any).occupancySeverity || (assessment as any).securitySeverity || (assessment as any).emergencyLevel || (assessment as any).priorityLevel || 'NORMAL'}
                      </span>
                    </div>

                    <div className="p-3 bg-[#423F4F]/50 rounded-[6px] border border-[#565E75]/30 font-mono-tech">
                      <span className="text-[10px] text-[#A99BC9] uppercase block mb-0.5">CONFIDENCE</span>
                      <span className="text-sm font-extrabold text-[#6B9FD4]">
                        {Math.round(((assessment as any).confidence ?? (assessment as any).overallConfidence ?? 0.9) * 100)}%
                      </span>
                    </div>

                    <div className="p-3 bg-[#423F4F]/50 rounded-[6px] border border-[#565E75]/30 font-mono-tech">
                      <span className="text-[10px] text-[#A99BC9] uppercase block mb-0.5">TIMESTAMP</span>
                      <span className="text-[11px] font-extrabold text-[#F3F3F3] truncate block">
                        {new Date(assessment.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* REASONING & EXPLAINABILITY BOX */}
            <div className="bg-white border border-[#423F4F]/10 rounded-[8px] p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-[#423F4F]/10 pb-3 font-mono-tech">
                <h3 className="font-extrabold text-sm text-[#292733] tracking-tight uppercase flex items-center gap-2">
                  <Brain className="w-4 h-4 text-[#A99BC9]" />
                  <span>TRANSPARENT REASONING LOGIC</span>
                </h3>
                <span className="text-[10px] text-[#565E75] uppercase">EXPLAINABLE ARTIFICIAL INTELLIGENCE</span>
              </div>

              {assessment?.reasoning && assessment.reasoning.length > 0 ? (
                <div className="space-y-2.5 font-sans">
                  {assessment.reasoning.map((step, idx) => (
                    <div
                      key={idx}
                      className={`p-3.5 rounded-[6px] text-xs leading-relaxed flex items-start gap-3 border ${
                        step.includes('CONFLICT')
                          ? 'bg-[#E26161]/10 border-[#E26161]/30 text-[#E26161] font-bold'
                          : step.includes('Compliance') || step.includes('Ethical')
                          ? 'bg-[#E0B7C9]/15 border-[#E0B7C9]/30 text-[#423F4F]'
                          : 'bg-[#F3F3F3] border-[#423F4F]/10 text-[#423F4F]'
                      }`}
                    >
                      <span className="font-mono-tech font-bold text-[#A99BC9] shrink-0 mt-0.5">{idx + 1}.</span>
                      <p>{step}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-[#565E75]">No reasoning available for this assessment configuration.</p>
              )}
            </div>

            {/* RECOMMENDED ACTIONS / CONFLICTS BOX */}
            <div className="bg-white border border-[#423F4F]/10 rounded-[8px] p-6 shadow-sm space-y-4">
              <h3 className="font-extrabold text-sm text-[#292733] tracking-tight uppercase font-mono-tech border-b border-[#423F4F]/10 pb-3">
                RECOMMENDED ACTIONS & DISPATCH
              </h3>

              <div className="space-y-2 font-mono-tech text-xs">
                {(assessment as any)?.recommendedAction ? (
                  <div className="p-3 bg-[#7AE04C]/10 rounded-[6px] border border-[#7AE04C]/30 text-[#292733] font-bold flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-[#7AE04C] shrink-0" />
                    <span>{(assessment as any).recommendedAction}</span>
                  </div>
                ) : null}

                {(assessment as any)?.recommendedActions ? (
                  (assessment as any).recommendedActions.map((act: string, idx: number) => (
                    <div key={idx} className="p-3 bg-[#7AE04C]/10 rounded-[6px] border border-[#7AE04C]/30 text-[#292733] font-bold flex items-center gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-[#7AE04C] shrink-0" />
                      <span>{act}</span>
                    </div>
                  ))
                ) : null}

                {(assessment as any)?.recommendedSupport ? (
                  (assessment as any).recommendedSupport.map((sup: string, idx: number) => (
                    <div key={idx} className="p-3 bg-[#E0B7C9]/20 rounded-[6px] border border-[#E0B7C9]/40 text-[#292733] font-bold flex items-center gap-2.5">
                      <HeartHandshake className="w-4 h-4 text-[#E0B7C9] shrink-0" />
                      <span>{sup}</span>
                    </div>
                  ))
                ) : null}

                {(assessment as any)?.conflicts && (assessment as any).conflicts.length > 0 && (
                  <div className="pt-2">
                    <span className="text-xs font-bold text-[#E26161] block mb-2">IDENTIFIED CONFLICTS:</span>
                    {(assessment as any).conflicts.map((conf: string, idx: number) => (
                      <div key={idx} className="p-3 bg-[#E26161]/10 rounded-[6px] border border-[#E26161]/30 text-[#E26161] font-bold flex items-center gap-2.5 mb-2">
                        <AlertTriangle className="w-4 h-4 shrink-0" />
                        <span>{conf}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

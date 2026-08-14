import React from 'react';
import { 
  Network, 
  Building2, 
  Radio, 
  ShieldAlert, 
  CheckCircle2, 
  AlertTriangle, 
  ArrowRight,
  Activity,
  Bot,
  Zap,
  Columns
} from 'lucide-react';
import { useEmergency } from '../../context/EmergencyContext';
import { NETWORK_OPERATOR_CONFIG } from '../../config/roleConfig';

interface NetworkOperatorOverviewProps {
  onNavigateTab: (tab: 'comparison' | 'network' | 'interaction' | 'emergency' | 'decision' | 'chat') => void;
}

export const NetworkOperatorOverview: React.FC<NetworkOperatorOverviewProps> = ({ onNavigateTab }) => {
  const { state } = useEmergency();
  const { incident, occupancy, crossBuildingAlerts } = state;

  const isFireActive = incident.severity === 'high' || incident.severity === 'critical';
  const hasCrossAlert = crossBuildingAlerts.length > 0;

  return (
    <div className="space-y-6 font-sans">
      {/* 1. COMPACT ROLE HEADER */}
      <div className="bg-white border border-[#423F4F]/10 rounded-[8px] p-5 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-[6px] bg-[#292733] text-[#F3F3F3] flex items-center justify-center font-bold">
            <Network className="w-5 h-5 text-[#7AE04C]" />
          </div>
          <div>
            <div className="flex items-center gap-2 font-mono-tech text-[10px] text-[#A99BC9] font-bold uppercase tracking-wider">
              <span>🌐 {NETWORK_OPERATOR_CONFIG.displayName}</span>
              <span>•</span>
              <span className="text-[#7AE04C]">● ONLINE</span>
            </div>
            <h1 className="text-xl font-extrabold text-[#292733] tracking-tight">
              {NETWORK_OPERATOR_CONFIG.scope} — Network Operations
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2 font-mono-tech text-xs">
          <button
            onClick={() => onNavigateTab('comparison')}
            className="px-3.5 py-2 bg-[#292733] hover:bg-[#423F4F] text-[#F3F3F3] rounded-[6px] font-bold text-xs uppercase tracking-wider border border-[#423F4F] flex items-center gap-2 cursor-pointer transition-all"
          >
            <Columns className="w-3.5 h-3.5 text-[#7AE04C]" />
            <span>OPEN BUILDING COMPARISON</span>
          </button>
          <button
            onClick={() => onNavigateTab('network')}
            className={`px-3.5 py-2 rounded-[6px] font-bold text-xs uppercase tracking-wider border flex items-center gap-2 cursor-pointer transition-all ${
              hasCrossAlert
                ? 'bg-[#E6B85C]/15 hover:bg-[#E6B85C]/25 text-[#292733] border-[#E6B85C]/40'
                : 'bg-white hover:bg-[#F3F3F3] text-[#292733] border-[#423F4F]/15'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5 text-[#E6B85C]" />
            <span>{hasCrossAlert ? 'MUTUAL AID ACTIVE — VIEW' : 'OPEN MUTUAL AID NETWORK'}</span>
          </button>
        </div>
      </div>

      {/* 2. CONNECTED BUILDINGS SUMMARY */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="font-mono-tech text-xs font-bold text-[#A99BC9] uppercase tracking-wider">
            CONNECTED BUILDINGS NETWORK
          </span>
          <span className="font-mono-tech text-xs text-[#565E75] font-bold">
            3 MESH NODES ONLINE
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* BUILDING A CARD */}
          <div className="bg-white border-2 border-[#E26161]/50 rounded-[8px] p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between border-b border-[#423F4F]/10 pb-2">
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-[#E26161]" />
                <span className="font-extrabold text-base text-[#292733]">Building A</span>
              </div>
              <span className="font-mono-tech text-[10px] font-extrabold text-[#E26161] bg-[#E26161]/10 px-2 py-0.5 rounded animate-pulse">
                🔴 EMERGENCY
              </span>
            </div>

            <div className="space-y-1.5 font-mono-tech text-xs">
              <p className="font-bold text-[#292733]">Operations Tower (12 Floors)</p>
              <p className="text-[#E26161] font-bold">Floor 4 Fire Incident</p>
              <p className="text-[#565E75]">42 Occupants • Exit B Active</p>
            </div>
          </div>

          {/* BUILDING B CARD */}
          <div className="bg-white border border-[#423F4F]/10 rounded-[8px] p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between border-b border-[#423F4F]/10 pb-2">
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-[#E6B85C]" />
                <span className="font-extrabold text-base text-[#292733]">Building B</span>
              </div>
              <span className={`font-mono-tech text-[10px] font-extrabold px-2 py-0.5 rounded ${
                hasCrossAlert ? 'text-[#E6B85C] bg-[#E6B85C]/15 animate-pulse' : 'text-[#7AE04C] bg-[#7AE04C]/10'
              }`}>
                {hasCrossAlert ? '⚠ MONITORING' : '● OPERATIONAL'}
              </span>
            </div>

            <div className="space-y-1.5 font-mono-tech text-xs">
              <p className="font-bold text-[#292733]">North Block (5 Floors)</p>
              <p className="text-[#E6B85C] font-bold">Shared Corridor Standby</p>
              <p className="text-[#565E75]">31 Occupants • Concourse Link</p>
            </div>
          </div>

          {/* BUILDING C CARD */}
          <div className="bg-white border border-[#423F4F]/10 rounded-[8px] p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between border-b border-[#423F4F]/10 pb-2">
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-[#7AE04C]" />
                <span className="font-extrabold text-base text-[#292733]">Building C</span>
              </div>
              <span className="font-mono-tech text-[10px] font-extrabold text-[#7AE04C] bg-[#7AE04C]/10 px-2 py-0.5 rounded">
                ● OPERATIONAL
              </span>
            </div>

            <div className="space-y-1.5 font-mono-tech text-xs">
              <p className="font-bold text-[#292733]">Research Block (4 Floors)</p>
              <p className="text-[#7AE04C] font-bold">Normal Status</p>
              <p className="text-[#565E75]">27 Occupants • All Systems Clear</p>
            </div>
          </div>
        </div>
      </div>

      {/* 3. NETWORK STATUS METRICS */}
      <div className="bg-[#292733] text-[#F3F3F3] rounded-[8px] p-6 border border-[#423F4F] shadow-md space-y-4 font-mono-tech">
        <div className="flex items-center justify-between border-b border-[#565E75]/40 pb-3">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-[#7AE04C]" />
            <span className="font-extrabold text-sm text-[#F3F3F3] uppercase">NETWORK STATUS TELEMETRY</span>
          </div>
          <span className="text-xs text-[#A99BC9]">LATTICE PEER MESH</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div className="p-3 bg-[#423F4F]/60 rounded border border-[#565E75]/30">
            <span className="text-[10px] text-[#A99BC9] uppercase block mb-1">ACTIVE INCIDENTS</span>
            <span className="text-lg font-extrabold text-[#E26161]">1</span>
          </div>

          <div className="p-3 bg-[#423F4F]/60 rounded border border-[#565E75]/30">
            <span className="text-[10px] text-[#A99BC9] uppercase block mb-1">BUILDINGS AFFECTED</span>
            <span className="text-lg font-extrabold text-[#E6B85C]">1</span>
          </div>

          <div className="p-3 bg-[#423F4F]/60 rounded border border-[#565E75]/30">
            <span className="text-[10px] text-[#A99BC9] uppercase block mb-1">CROSS-BUILDING ALERTS</span>
            <span className="text-lg font-extrabold text-[#7AE04C]">1</span>
          </div>

          <div className="p-3 bg-[#423F4F]/60 rounded border border-[#565E75]/30">
            <span className="text-[10px] text-[#A99BC9] uppercase block mb-1">NETWORK AGENTS</span>
            <span className="text-lg font-extrabold text-[#6B9FD4]">18</span>
          </div>
        </div>
      </div>

      {/* 4. RECENT NETWORK EVENTS LOG */}
      <div className="bg-white border border-[#423F4F]/10 rounded-[8px] p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-[#423F4F]/10 pb-3">
          <span className="font-mono-tech text-xs font-bold text-[#A99BC9] uppercase tracking-wider">
            RECENT NETWORK EVENTS
          </span>
          <button
            onClick={() => onNavigateTab('network')}
            className="text-xs font-mono-tech text-[#A99BC9] hover:text-[#292733] font-bold underline flex items-center gap-1 cursor-pointer"
          >
            <span>View Full Network Topology</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="space-y-3 font-mono-tech text-xs">
          <div className="p-3 bg-[#F3F3F3] rounded border-l-4 border-l-[#E26161] flex items-center justify-between">
            <div>
              <span className="font-extrabold text-[#292733] block">Building A → Building B</span>
              <span className="text-[#565E75]">Emergency alert transmitted via zero-trust packet channel</span>
            </div>
            <span className="text-[10px] text-[#E26161] font-bold">JUST NOW</span>
          </div>

          <div className="p-3 bg-[#F3F3F3] rounded border-l-4 border-l-[#E6B85C] flex items-center justify-between">
            <div>
              <span className="font-extrabold text-[#292733] block">Building B</span>
              <span className="text-[#565E75]">Shared corridor monitoring & HVAC concourse damper activated</span>
            </div>
            <span className="text-[10px] text-[#E6B85C] font-bold">1 MIN AGO</span>
          </div>

          <div className="p-3 bg-[#F3F3F3] rounded border-l-4 border-l-[#7AE04C] flex items-center justify-between">
            <div>
              <span className="font-extrabold text-[#292733] block">Building C</span>
              <span className="text-[#565E75]">No action required — system nominal</span>
            </div>
            <span className="text-[10px] text-[#7AE04C] font-bold">STANDBY</span>
          </div>
        </div>
      </div>
    </div>
  );
};
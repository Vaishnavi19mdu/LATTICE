import React from 'react';
import { Flame, ShieldAlert, CheckCircle2, Users, AlertTriangle, Radio } from 'lucide-react';
import { SharedEmergencyState } from '../../lib/mock/emergencyScenario';

interface BuildingVisualProps {
  buildingId: 'building_A' | 'building_B' | 'building_C';
  state: SharedEmergencyState;
  isFocused?: boolean;
}

export const BuildingVisualA: React.FC<{ state: SharedEmergencyState; isFocused?: boolean }> = ({ state, isFocused }) => {
  const isFireActive = state.incident.severity === 'high' || state.incident.severity === 'critical';
  const exitABlocked = state.exits.A === 'blocked' || state.exits.A === 'unsafe';

  return (
    <div className={`p-4 rounded-[8px] bg-gradient-to-b from-[#1F2028] to-[#181920] border transition-all ${
      isFocused ? 'border-[#A99BC9] ring-2 ring-[#A99BC9]/30 shadow-[0_0_16px_rgba(169,155,201,0.15)]' : 'border-[#423F4F]/60'
    }`}>
      <div className="relative h-48 w-full bg-[#14151B] rounded-[6px] border border-[#363445] p-2.5 flex flex-col justify-between overflow-hidden">
        {/* Rooftop HVAC equipment */}
        <div className="flex justify-center gap-1.5 -mt-0.5">
          <div className="w-8 h-2 bg-gradient-to-t from-[#363445] to-[#423F4F] rounded-t-[2px] border-x border-t border-[#565E75]/60"></div>
          <div className={`w-4 h-3.5 rounded-t-[2px] border-x border-t transition-colors ${isFireActive ? 'bg-[#E26161]/30 border-[#E26161]/60' : 'bg-[#A99BC9]/30 border-[#A99BC9]/50'}`}></div>
          <div className="w-6 h-2 bg-gradient-to-t from-[#363445] to-[#423F4F] rounded-t-[2px] border-x border-t border-[#565E75]/60"></div>
        </div>

        {/* Tall Tower Body */}
        <div className="flex-1 w-4/5 mx-auto bg-[#22212C] border border-[#423F4F] rounded-[5px] p-1.5 flex flex-col gap-1 justify-between shadow-lg relative mt-1.5">
          {/* Floor 5 */}
          <div className="h-5 bg-[#2C2A38] rounded-[3px] border border-[#565E75]/25 flex items-center justify-between px-2 text-[9px] font-mono-tech">
            <span className="text-[#A99BC9] font-semibold">F5 LABS</span>
            <span className="text-[#7AE04C] flex items-center gap-0.5"><CheckCircle2 className="w-2.5 h-2.5" />NOM</span>
          </div>

          {/* Floor 4 - INCIDENT ZONE */}
          <div className={`h-6 rounded-[3px] border transition-all flex items-center justify-between px-2 text-[9px] font-mono-tech ${
            isFireActive
              ? 'bg-gradient-to-r from-[#E26161]/35 to-[#E26161]/15 border-[#E26161] text-white shadow-[0_0_12px_rgba(226,97,97,0.35)]'
              : 'bg-[#2C2A38] border-[#565E75]/25 text-[#F3F3F3]'
          }`}>
            <span className={`font-bold flex items-center gap-1 ${isFireActive ? 'animate-pulse' : ''}`}>
              <Flame className={`w-3 h-3 ${isFireActive ? 'text-[#E26161] fill-current' : 'text-[#565E75]'}`} /> F4 {isFireActive ? 'FIRE' : 'CLEAR'}
            </span>
            {isFireActive && (
              <span className="bg-[#E26161] text-white font-extrabold px-1.5 py-0.5 rounded-[2px] text-[8px] tracking-wide">
                {state.incident.severity.toUpperCase()}
              </span>
            )}
          </div>

          {/* Floor 3 */}
          <div className="h-5 bg-[#2C2A38] rounded-[3px] border border-[#565E75]/25 flex items-center justify-between px-2 text-[9px] font-mono-tech">
            <span className="text-[#A99BC9] font-semibold">F3 OPS</span>
            <span className="text-[#7AE04C] flex items-center gap-0.5"><Users className="w-2.5 h-2.5" />28</span>
          </div>

          {/* Floor 2 */}
          <div className="h-5 bg-[#2C2A38] rounded-[3px] border border-[#565E75]/25 flex items-center justify-between px-2 text-[9px] font-mono-tech">
            <span className="text-[#A99BC9] font-semibold">F2 ADMIN</span>
            <span className="text-[#7AE04C] flex items-center gap-0.5"><Users className="w-2.5 h-2.5" />18</span>
          </div>

          {/* Floor 1 - Ground Exits */}
          <div className="h-6 bg-[#2C2A38] rounded-[3px] border border-[#A99BC9]/30 flex items-center justify-around px-1 text-[8px] font-mono-tech">
            <span className={`flex items-center gap-0.5 font-bold ${exitABlocked ? 'text-[#E26161]' : 'text-[#7AE04C]'}`}>
              {exitABlocked ? <AlertTriangle className="w-2.5 h-2.5" /> : <CheckCircle2 className="w-2.5 h-2.5" />}
              EXIT A
            </span>
            <span className="text-[#7AE04C] font-bold flex items-center gap-0.5"><CheckCircle2 className="w-2.5 h-2.5" />EXIT B</span>
            <span className="text-[#7AE04C] flex items-center gap-0.5"><CheckCircle2 className="w-2.5 h-2.5" />EXIT C</span>
          </div>
        </div>

        {/* Building Label Footer */}
        <div className="text-center pt-1.5 border-t border-[#363445]">
          <span className="font-mono-tech text-[10px] font-extrabold text-[#F3F3F3] tracking-widest uppercase">
            BUILDING A — OPERATIONS TOWER
          </span>
        </div>
      </div>
    </div>
  );
};

export const BuildingVisualB: React.FC<{ state: SharedEmergencyState; isFocused?: boolean }> = ({ state, isFocused }) => {
  const hasAlert = state.crossBuildingAlerts.length > 0;

  return (
    <div className={`p-4 rounded-[8px] bg-gradient-to-b from-[#1F2028] to-[#181920] border transition-all ${
      isFocused ? 'border-[#A99BC9] ring-2 ring-[#A99BC9]/30 shadow-[0_0_16px_rgba(169,155,201,0.15)]' : 'border-[#423F4F]/60'
    }`}>
      <div className="relative h-48 w-full bg-[#14151B] rounded-[6px] border border-[#363445] p-2.5 flex flex-col justify-between overflow-hidden">
        {/* Concourse Bridge connection vector */}
        <div className={`absolute top-1/2 left-0 -translate-y-1/2 w-4 h-4 rounded-r-[3px] z-10 flex items-center justify-center border-y border-r transition-colors ${
          hasAlert ? 'bg-[#E6B85C]/25 border-[#E6B85C]/70' : 'bg-[#6B9FD4]/25 border-[#6B9FD4]/60'
        }`}>
          <Radio className={`w-2.5 h-2.5 ${hasAlert ? 'text-[#E6B85C] animate-pulse' : 'text-[#6B9FD4]'}`} />
        </div>

        {/* Wide Horizontal Building Structure */}
        <div className="flex-1 w-full my-auto flex gap-1.5 items-end justify-center px-2 pt-2">
          {/* Section 1 (West Wing) */}
          <div className="w-1/3 h-28 bg-[#22212C] border border-[#423F4F] rounded-[5px] p-1 flex flex-col justify-between shadow-md">
            <div className="h-5 bg-[#2C2A38] rounded-[3px] text-[8px] font-mono-tech flex items-center justify-center text-[#A99BC9] font-semibold">
              ENG 01
            </div>
            <div className="h-5 bg-[#2C2A38] rounded-[3px] text-[8px] font-mono-tech flex items-center justify-center text-[#7AE04C] gap-0.5">
              <CheckCircle2 className="w-2.5 h-2.5" />NOMINAL
            </div>
            <div className="h-5 bg-[#2C2A38] rounded-[3px] text-[8px] font-mono-tech flex items-center justify-center text-[#565E75]">
              LOBBY
            </div>
          </div>

          {/* Section 2 (Central Hub) */}
          <div className="w-1/3 h-32 bg-[#22212C] border border-[#423F4F] rounded-[5px] p-1 flex flex-col justify-between relative shadow-md">
            <div className="h-4 bg-[#2C2A38] rounded-[3px] text-[7px] font-mono-tech flex items-center justify-center text-[#E0B7C9] font-semibold">
              ROOF HVAC
            </div>
            <div className={`h-6 rounded-[3px] border flex items-center justify-center text-[8px] font-mono-tech px-1 text-center font-bold gap-0.5 transition-all ${
              hasAlert
                ? 'bg-[#E6B85C]/20 border-[#E6B85C] text-[#E6B85C] shadow-[0_0_10px_rgba(230,184,92,0.3)] animate-pulse'
                : 'bg-[#2C2A38] border-[#565E75]/25 text-[#7AE04C]'
            }`}>
              {hasAlert ? <><ShieldAlert className="w-2.5 h-2.5" />DAMPER</> : <><CheckCircle2 className="w-2.5 h-2.5" />HUB NORMAL</>}
            </div>
            <div className="h-5 bg-[#2C2A38] rounded-[3px] text-[8px] font-mono-tech flex items-center justify-center text-[#565E75]">
              MAIN ENTRY
            </div>
          </div>

          {/* Section 3 (East Wing) */}
          <div className="w-1/3 h-28 bg-[#22212C] border border-[#423F4F] rounded-[5px] p-1 flex flex-col justify-between shadow-md">
            <div className="h-5 bg-[#2C2A38] rounded-[3px] text-[8px] font-mono-tech flex items-center justify-center text-[#A99BC9] font-semibold">
              ENG 02
            </div>
            <div className="h-5 bg-[#2C2A38] rounded-[3px] text-[8px] font-mono-tech flex items-center justify-center text-[#7AE04C] gap-0.5">
              <CheckCircle2 className="w-2.5 h-2.5" />NOMINAL
            </div>
            <div className="h-5 bg-[#2C2A38] rounded-[3px] text-[8px] font-mono-tech flex items-center justify-center text-[#565E75]">
              PARKING
            </div>
          </div>
        </div>

        {/* Building Label Footer */}
        <div className="text-center pt-1.5 border-t border-[#363445]">
          <span className="font-mono-tech text-[10px] font-extrabold text-[#F3F3F3] tracking-widest uppercase">
            BUILDING B — NORTH BLOCK
          </span>
        </div>
      </div>
    </div>
  );
};

export const BuildingVisualC: React.FC<{ state: SharedEmergencyState; isFocused?: boolean }> = ({ state, isFocused }) => {
  return (
    <div className={`p-4 rounded-[8px] bg-gradient-to-b from-[#1F2028] to-[#181920] border transition-all ${
      isFocused ? 'border-[#A99BC9] ring-2 ring-[#A99BC9]/30 shadow-[0_0_16px_rgba(169,155,201,0.15)]' : 'border-[#423F4F]/60'
    }`}>
      <div className="relative h-48 w-full bg-[#14151B] rounded-[6px] border border-[#363445] p-2.5 flex flex-col justify-between overflow-hidden">
        {/* Asymmetric Stepped Building Structure */}
        <div className="flex-1 w-4/5 mx-auto my-auto flex flex-col justify-end">
          {/* Step 3 (Roof Observatory) */}
          <div className="w-1/2 ml-auto h-7 bg-[#22212C] border-t border-x border-[#423F4F] rounded-t-[5px] p-1 flex items-center justify-center text-[8px] font-mono-tech text-[#A99BC9] font-semibold shadow-sm">
            OBSERVATORY
          </div>

          {/* Step 2 (Medium Tier) */}
          <div className="w-3/4 mx-auto h-12 bg-[#22212C] border-t border-x border-[#423F4F] p-1 flex flex-col justify-between shadow-sm">
            <div className="h-5 bg-[#2C2A38] rounded-[3px] text-[8px] font-mono-tech flex items-center justify-between px-2 text-[#7AE04C]">
              <span className="font-semibold">R&D FL 3</span>
              <span>STANDBY</span>
            </div>
            <div className="h-5 bg-[#2C2A38] rounded-[3px] text-[8px] font-mono-tech flex items-center justify-between px-2 text-[#7AE04C]">
              <span className="font-semibold">R&D FL 2</span>
              <span>NOMINAL</span>
            </div>
          </div>

          {/* Step 1 (Wide Base) */}
          <div className="w-full h-14 bg-[#22212C] border border-[#423F4F] rounded-b-[5px] p-1 flex flex-col justify-between shadow-md">
            <div className="h-5 bg-[#2C2A38] rounded-[3px] text-[8px] font-mono-tech flex items-center justify-between px-2 text-[#7AE04C]">
              <span className="font-semibold flex items-center gap-0.5"><Users className="w-2.5 h-2.5" />AUDITORIUM</span>
              <span>27</span>
            </div>
            <div className="h-5 bg-[#2C2A38] rounded-[3px] text-[8px] font-mono-tech flex items-center justify-around px-2 text-[#7AE04C]">
              <span className="flex items-center gap-0.5"><CheckCircle2 className="w-2.5 h-2.5" />GATE C1</span>
              <span className="flex items-center gap-0.5"><CheckCircle2 className="w-2.5 h-2.5" />GATE C2</span>
            </div>
          </div>
        </div>

        {/* Building Label Footer */}
        <div className="text-center pt-1.5 border-t border-[#363445]">
          <span className="font-mono-tech text-[10px] font-extrabold text-[#F3F3F3] tracking-widest uppercase">
            BUILDING C — RESEARCH BLOCK
          </span>
        </div>
      </div>
    </div>
  );
};
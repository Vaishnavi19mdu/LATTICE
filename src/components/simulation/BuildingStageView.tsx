import React from 'react';
import { Flame, ShieldAlert, CheckCircle2, Users, Building, AlertCircle, AlertTriangle, ArrowDown } from 'lucide-react';

interface BuildingStageProps {
  fireSeverity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  exitAStatus: 'SAFE' | 'BLOCKED' | 'FIRE_HAZARD';
  exitBStatus: 'SAFE' | 'BLOCKED' | 'RESTRICTED';
  exitCStatus: 'SAFE' | 'BLOCKED';
  occupantsCount: number;
  specialNeedsCount: number;
  buildingBAlert: boolean;
  activeStepIndex: number;
}

export const BuildingStageView: React.FC<BuildingStageProps> = ({
  fireSeverity,
  exitAStatus,
  exitBStatus,
  exitCStatus,
  occupantsCount,
  specialNeedsCount,
  buildingBAlert,
  activeStepIndex,
}) => {
  const isFireActive = activeStepIndex >= 1;
  const isConflictActive = activeStepIndex >= 6;

  return (
    <div className="bg-[#292733] text-[#F3F3F3] p-5 rounded-[8px] border border-[#423F4F] shadow-md space-y-4 font-sans">
      <div className="flex items-center justify-between border-b border-[#565E75]/40 pb-3">
        <div className="flex items-center gap-2">
          <Building className="w-5 h-5 text-[#A99BC9]" />
          <h3 className="font-extrabold text-sm tracking-tight">CAMPUS TELEMETRY & BUILDING FLOORPLAN</h3>
        </div>
        <span className="font-mono-tech text-[10px] font-bold text-[#7AE04C] bg-[#7AE04C]/15 px-2 py-0.5 rounded border border-[#7AE04C]/30">
          ● REAL-TIME SENSOR FEED
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* MAIN BUILDING STRUCTURE (3 COLS) */}
        <div className="lg:col-span-3 bg-[#1F2028] p-4 rounded-[6px] border border-[#423F4F]/60 space-y-2 relative overflow-hidden">
          {/* Floor 5 */}
          <div className="p-2.5 bg-[#292733] rounded border border-[#423F4F]/40 flex items-center justify-between font-mono-tech text-xs">
            <span className="font-bold text-[#A99BC9]">FLOOR 5 (EXECUTIVE / LABS)</span>
            <span className="text-[10px] text-[#7AE04C] font-bold">🟢 NOMINAL (12 Occupants)</span>
          </div>

          {/* Floor 4 — HAZARD ORIGIN */}
          <div className={`p-3 rounded border transition-all relative font-mono-tech text-xs space-y-2 ${
            isFireActive 
              ? 'bg-[#E26161]/20 border-[#E26161] shadow-[0_0_15px_rgba(226,97,97,0.2)]' 
              : 'bg-[#292733] border-[#423F4F]/40'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-[#F3F3F3]">FLOOR 4 (OFFICES & EXIT CORRIDORS)</span>
                {isFireActive && (
                  <span className="animate-pulse bg-[#E26161] text-[#F3F3F3] font-extrabold text-[10px] px-2 py-0.5 rounded flex items-center gap-1">
                    <Flame className="w-3 h-3" /> FIRE HAZARD DETECTED ({fireSeverity})
                  </span>
                )}
              </div>

              <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#E6B85C] bg-[#E6B85C]/15 px-2 py-0.5 rounded">
                <Users className="w-3.5 h-3.5" />
                <span>{occupantsCount} OCCUPANTS ({specialNeedsCount} ASSISTANCE)</span>
              </div>
            </div>

            {/* Evacuation Pressure bar */}
            {isFireActive && (
              <div className="space-y-1">
                <div className="flex justify-between text-[10px] text-[#A99BC9] font-bold">
                  <span>SMOKE & THERMAL EXPANSION: 78°C / 85 PPM</span>
                  <span>EVACUATION PRESSURE: HIGH</span>
                </div>
                <div className="w-full h-1.5 bg-[#423F4F] rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-[#E6B85C] to-[#E26161] w-[82%] animate-pulse" />
                </div>
              </div>
            )}
          </div>

          {/* Floor 3 */}
          <div className="p-2.5 bg-[#292733] rounded border border-[#423F4F]/40 flex items-center justify-between font-mono-tech text-xs">
            <span className="font-bold text-[#A99BC9]">FLOOR 3 (OPERATIONS)</span>
            <span className="text-[10px] text-[#7AE04C] font-bold">🟢 CLEAR (28 Occupants)</span>
          </div>

          {/* Floor 2 */}
          <div className="p-2.5 bg-[#292733] rounded border border-[#423F4F]/40 flex items-center justify-between font-mono-tech text-xs">
            <span className="font-bold text-[#A99BC9]">FLOOR 2 (ADMINISTRATION)</span>
            <span className="text-[10px] text-[#7AE04C] font-bold">🟢 CLEAR (18 Occupants)</span>
          </div>

          {/* Floor 1 — EGRESS DOORS & STAIRWELLS */}
          <div className="p-3 bg-[#292733] rounded border border-[#565E75] space-y-2">
            <span className="font-mono-tech text-[10px] font-extrabold text-[#A99BC9] block uppercase">
              FLOOR 1 — GROUND EGRESS PORTALS & EXITS
            </span>

            <div className="grid grid-cols-3 gap-2 font-mono-tech text-xs">
              {/* EXIT A */}
              <div className={`p-2 rounded border text-center transition-all ${
                exitAStatus === 'FIRE_HAZARD' || exitAStatus === 'BLOCKED' || isConflictActive
                  ? 'bg-[#E26161]/25 border-[#E26161] text-[#E26161]'
                  : 'bg-[#7AE04C]/15 border-[#7AE04C] text-[#7AE04C]'
              }`}>
                <div className="flex items-center justify-center gap-1 font-bold">
                  {exitAStatus === 'SAFE' && !isConflictActive ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertTriangle className="w-3.5 h-3.5" />}
                  <span>EXIT A</span>
                </div>
                <span className="text-[9px] font-extrabold block mt-0.5">
                  {exitAStatus === 'SAFE' && !isConflictActive ? 'SAFE' : 'UNSAFE / FIRE'}
                </span>
              </div>

              {/* EXIT B */}
              <div className={`p-2 rounded border text-center transition-all ${
                exitBStatus === 'RESTRICTED'
                  ? 'bg-[#E6B85C]/25 border-[#E6B85C] text-[#E6B85C]'
                  : 'bg-[#7AE04C]/20 border-[#7AE04C] text-[#7AE04C]'
              }`}>
                <div className="flex items-center justify-center gap-1 font-bold">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>EXIT B</span>
                </div>
                <span className="text-[9px] font-extrabold block mt-0.5">
                  {exitBStatus === 'RESTRICTED' ? 'RESTRICTED (NOTE)' : 'PRIMARY SAFE'}
                </span>
              </div>

              {/* EXIT C */}
              <div className="p-2 rounded border text-center bg-[#7AE04C]/20 border-[#7AE04C] text-[#7AE04C]">
                <div className="flex items-center justify-center gap-1 font-bold">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>EXIT C</span>
                </div>
                <span className="text-[9px] font-extrabold block mt-0.5">ALTERNATE CLEAR</span>
              </div>
            </div>
          </div>
        </div>

        {/* ADJACENT BUILDING NODE (1 COL) */}
        <div className={`p-4 rounded-[6px] border flex flex-col justify-between font-mono-tech text-xs space-y-3 transition-all ${
          buildingBAlert 
            ? 'bg-[#E6B85C]/15 border-[#E6B85C] text-[#F3F3F3]' 
            : 'bg-[#1F2028] border-[#423F4F]/60 text-[#A99BC9]'
        }`}>
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="font-extrabold text-[#F3F3F3]">BUILDING B</span>
              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-[#423F4F] text-[#F3F3F3]">ENGINEERING</span>
            </div>
            <p className="text-[11px] leading-relaxed text-[#F3F3F3]/80 font-sans">
              Adjacent campus facility connected via shared Floor 4 glass concourse and centralized HVAC ducting.
            </p>
          </div>

          {buildingBAlert ? (
            <div className="p-2.5 bg-[#E6B85C]/20 rounded border border-[#E6B85C] space-y-1">
              <span className="font-extrabold text-[#E6B85C] flex items-center gap-1 text-[11px]">
                <AlertCircle className="w-3.5 h-3.5" /> MUTUAL AID ALERT ACTIVE
              </span>
              <span className="text-[10px] text-[#F3F3F3] block">
                ✓ Shared HVAC Ducting Isolated
                <br />
                ✓ Concourse Doors Locked
              </span>
            </div>
          ) : (
            <div className="p-2 bg-[#292733] rounded text-[10px] text-[#A99BC9] text-center border border-[#423F4F]">
              NO ACTIVE MUTUAL AID ALERT
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

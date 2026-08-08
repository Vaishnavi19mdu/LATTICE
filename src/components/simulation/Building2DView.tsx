import React from 'react';
import { Flame, CheckCircle2, Users, Building, AlertTriangle, ShieldAlert, ArrowRight } from 'lucide-react';
import { SharedEmergencyState } from '../../lib/mock/emergencyScenario';

interface Building2DViewProps {
  state: SharedEmergencyState;
}

export const Building2DView: React.FC<Building2DViewProps> = ({ state }) => {
  const { incident, occupancy, exits, crossBuildingAlerts } = state;
  const isFireActive = incident.severity === 'high' || incident.severity === 'critical';
  const hasCrossBuildingAlert = crossBuildingAlerts.length > 0;

  return (
    <div className="bg-[#292733] text-[#F3F3F3] p-5 rounded-[8px] border border-[#423F4F] shadow-md space-y-4 font-sans h-full flex flex-col justify-between">
      <div className="flex items-center justify-between border-b border-[#565E75]/40 pb-3">
        <div className="flex items-center gap-2">
          <Building className="w-5 h-5 text-[#A99BC9]" />
          <h3 className="font-extrabold text-sm tracking-tight text-[#F3F3F3]">
            LIVE 2D BUILDING TELEMETRY & FLOORPLAN
          </h3>
        </div>
        <span className="font-mono-tech text-[10px] font-bold text-[#7AE04C] bg-[#7AE04C]/15 px-2.5 py-0.5 rounded border border-[#7AE04C]/30 flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-[#7AE04C] animate-pulse"></span>
          BUILDING A — LIVE
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 flex-1">
        {/* MAIN BUILDING STRUCTURE (8 COLUMNS) */}
        <div className="lg:col-span-8 bg-[#1F2028] p-4 rounded-[6px] border border-[#423F4F]/60 space-y-2 flex flex-col justify-between">
          {/* Floor 5 */}
          <div className="p-2.5 bg-[#292733] rounded border border-[#423F4F]/40 flex items-center justify-between font-mono-tech text-xs">
            <span className="font-bold text-[#A99BC9]">FLOOR 5 (EXECUTIVE / LABS)</span>
            <span className="text-[10px] text-[#7AE04C] font-bold">🟢 NOMINAL (12 Occupants)</span>
          </div>

          {/* Floor 4 — PRIMARY INCIDENT ZONE */}
          <div className={`p-3 rounded border transition-all relative font-mono-tech text-xs space-y-2 ${
            isFireActive 
              ? 'bg-[#E26161]/20 border-[#E26161] shadow-[0_0_15px_rgba(226,97,97,0.25)] ring-1 ring-[#E26161]/50' 
              : 'bg-[#292733] border-[#423F4F]/40'
          }`}>
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-[#F3F3F3]">FLOOR 4 (INCIDENT ZONE)</span>
                {isFireActive && (
                  <span className="animate-pulse bg-[#E26161] text-[#F3F3F3] font-extrabold text-[10px] px-2 py-0.5 rounded flex items-center gap-1 shadow-sm">
                    <Flame className="w-3.5 h-3.5 fill-current" /> FIRE HAZARD ({incident.severity.toUpperCase()})
                  </span>
                )}
              </div>

              <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#E6B85C] bg-[#E6B85C]/15 px-2 py-0.5 rounded border border-[#E6B85C]/30">
                <Users className="w-3.5 h-3.5" />
                <span>{occupancy.total} OCCUPANTS ({occupancy.assistanceRequired} MOBILITY NEEDED)</span>
              </div>
            </div>

            {/* Sensor readings bar */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              <div className="p-2 bg-[#1F2028] rounded border border-[#423F4F] flex justify-between items-center text-[11px]">
                <span className="text-[#A99BC9] font-bold">SMOKE DENSITY:</span>
                <span className={`font-extrabold ${incident.smokePpm > 50 ? 'text-[#E26161]' : 'text-[#7AE04C]'}`}>
                  {incident.smokePpm} PPM
                </span>
              </div>
              <div className="p-2 bg-[#1F2028] rounded border border-[#423F4F] flex justify-between items-center text-[11px]">
                <span className="text-[#A99BC9] font-bold">TEMPERATURE:</span>
                <span className={`font-extrabold ${incident.temperatureC > 50 ? 'text-[#E26161]' : 'text-[#7AE04C]'}`}>
                  {incident.temperatureC}°C
                </span>
              </div>
            </div>
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

          {/* Floor 1 — EGRESS PORTALS */}
          <div className="p-3 bg-[#292733] rounded border border-[#565E75] space-y-2">
            <span className="font-mono-tech text-[10px] font-extrabold text-[#A99BC9] block uppercase">
              FLOOR 1 — GROUND EGRESS PORTALS & EXITS
            </span>

            <div className="grid grid-cols-3 gap-2 font-mono-tech text-xs">
              {/* EXIT A */}
              <div className={`p-2 rounded border text-center transition-all ${
                exits.A === 'unsafe' || exits.A === 'blocked'
                  ? 'bg-[#E26161]/25 border-[#E26161] text-[#E26161]'
                  : 'bg-[#7AE04C]/15 border-[#7AE04C] text-[#7AE04C]'
              }`}>
                <div className="flex items-center justify-center gap-1 font-bold">
                  {exits.A === 'available' ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertTriangle className="w-3.5 h-3.5" />}
                  <span>EXIT A</span>
                </div>
                <span className="text-[9px] font-extrabold block mt-0.5">
                  {exits.A === 'available' ? 'SAFE' : '⛔ UNSAFE / JAMMED'}
                </span>
              </div>

              {/* EXIT B */}
              <div className="p-2 rounded border text-center bg-[#7AE04C]/20 border-[#7AE04C] text-[#7AE04C]">
                <div className="flex items-center justify-center gap-1 font-bold">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>EXIT B</span>
                </div>
                <span className="text-[9px] font-extrabold block mt-0.5">
                  ✅ PRIMARY SAFE
                </span>
              </div>

              {/* EXIT C */}
              <div className="p-2 rounded border text-center bg-[#7AE04C]/20 border-[#7AE04C] text-[#7AE04C]">
                <div className="flex items-center justify-center gap-1 font-bold">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>EXIT C</span>
                </div>
                <span className="text-[9px] font-extrabold block mt-0.5">
                  ✅ ALTERNATE CLEAR
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ADJACENT BUILDING & CROSS-BUILDING LINK (4 COLUMNS) */}
        <div className="lg:col-span-4 bg-[#1F2028] p-4 rounded-[6px] border border-[#423F4F]/60 flex flex-col justify-between font-mono-tech text-xs space-y-3">
          <div>
            <div className="flex items-center justify-between border-b border-[#423F4F] pb-2 mb-2">
              <span className="font-extrabold text-[#F3F3F3] text-sm">BUILDING B</span>
              <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-[#423F4F] text-[#F3F3F3]">
                ENGINEERING
              </span>
            </div>
            <p className="text-[11px] leading-relaxed text-[#A99BC9] font-sans">
              Connected via shared Floor 4 concourse bridge and campus HVAC ducting.
            </p>
          </div>

          {/* CROSS BUILDING ALERT STATUS */}
          {hasCrossBuildingAlert ? (
            <div className="p-3 bg-[#E6B85C]/20 rounded border border-[#E6B85C] space-y-2 animate-pulse">
              <div className="flex items-center gap-1.5 font-extrabold text-[#E6B85C] text-xs">
                <ShieldAlert className="w-4 h-4" />
                <span>MUTUAL AID ALERT ACTIVE</span>
              </div>
              <p className="text-[11px] font-sans text-[#F3F3F3] leading-tight">
                {crossBuildingAlerts[crossBuildingAlerts.length - 1]?.message}
              </p>
              <div className="text-[10px] text-[#7AE04C] font-bold flex items-center gap-1 pt-1 border-t border-[#E6B85C]/40">
                <CheckCircle2 className="w-3 h-3" /> Concourse Damper Isolated
              </div>
            </div>
          ) : (
            <div className="p-3 bg-[#292733] rounded border border-[#423F4F] text-center text-[11px] text-[#565E75]">
              No active inter-building alerts. Concourse bridge nominal.
            </div>
          )}

          {/* ACTIVE ROUTE GUIDANCE CARD */}
          <div className="p-3 bg-[#292733] rounded border border-[#A99BC9]/40 space-y-1.5">
            <span className="text-[10px] text-[#A99BC9] font-bold block uppercase">
              RECOMMENDED EVACUATION ROUTE:
            </span>
            <div className="flex items-center gap-2 text-[#7AE04C] font-extrabold text-xs">
              <span>FLOOR 4 OCCUPANTS</span>
              <ArrowRight className="w-3.5 h-3.5" />
              <span>STAIRWELL B</span>
            </div>
            <p className="text-[10px] text-[#565E75] font-sans">
              Avoid Exit A corridor. Assistance team dispatched for 3 mobility occupants.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

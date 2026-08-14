import React from 'react';
import { MapPin, CheckCircle2, XCircle, ArrowRight, Flame } from 'lucide-react';
import { SharedEmergencyState } from '../../lib/mock/emergencyScenario';
import { getEvacuationExitStates } from '../../lib/mock/campusNetworkState';

interface EvacuationRouteMapProps {
  state: SharedEmergencyState;
}

/**
 * Embedded, simplified floor-plan visualization — lives inside the Building A
 * incident/emergency detail (not a standalone page). Shows Floor 4 rooms,
 * the fire zone, the blocked route, and the recommended safe route.
 */
export const EvacuationRouteMap: React.FC<EvacuationRouteMapProps> = ({ state }) => {
  const { exits } = state;
  const exitStates = getEvacuationExitStates(exits);
  const exitA = exitStates[0];
  const exitAIsBlocked = exitA.note.includes('BLOCKED');
  const exitAColor = exitAIsBlocked ? '#E26161' : '#7AE04C';

  return (
    <div className="bg-[#1F2028] border border-[#423F4F]/60 rounded-[6px] p-4 space-y-3 font-mono-tech">
      <div className="flex items-center justify-between border-b border-[#423F4F]/50 pb-2">
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-[#A99BC9]" />
          <span className="font-extrabold text-xs text-[#F3F3F3] uppercase tracking-wide">
            EVACUATION ROUTE MAP — BUILDING A / FLOOR 4
          </span>
        </div>
        <span className="text-[9px] text-[#565E75] font-bold">AUTO-UPDATES WITH INCIDENT STATE</span>
      </div>

      <div className="space-y-3">
        {/* SVG FLOOR PLAN — wide horizontal layout */}
        <div className="bg-[#14151B] border border-[#363445] rounded-[5px] p-3 overflow-x-auto">
          <svg viewBox="0 0 760 240" className="w-full min-w-[560px] h-auto" preserveAspectRatio="xMidYMid meet">
            {/* Rooms row along the top of the corridor */}
            <rect x="24" y="18" width="150" height="46" rx="4" fill="#E26161" fillOpacity="0.22" stroke="#E26161" strokeWidth="1.5" />
            <text x="99" y="45" textAnchor="middle" fill="#E26161" fontSize="12" fontWeight="800">FIRE ZONE</text>

            <rect x="192" y="18" width="120" height="46" rx="4" fill="#292733" stroke="#565E75" strokeWidth="1" />
            <text x="252" y="45" textAnchor="middle" fill="#A99BC9" fontSize="10" fontWeight="700">OFFICE 4A</text>

            <rect x="330" y="18" width="120" height="46" rx="4" fill="#292733" stroke="#565E75" strokeWidth="1" />
            <text x="390" y="45" textAnchor="middle" fill="#A99BC9" fontSize="10" fontWeight="700">OFFICE 4B</text>

            <rect x="468" y="18" width="120" height="46" rx="4" fill="#292733" stroke="#565E75" strokeWidth="1" />
            <text x="528" y="45" textAnchor="middle" fill="#A99BC9" fontSize="10" fontWeight="700">OFFICE 4C</text>

            {/* Main horizontal corridor spine */}
            <rect x="24" y="118" width="640" height="16" rx="4" fill="#423F4F" />
            {/* connector risers from each room down into the corridor */}
            <line x1="99" y1="64" x2="99" y2="118" stroke="#423F4F" strokeWidth="10" />
            <line x1="252" y1="64" x2="252" y2="118" stroke="#423F4F" strokeWidth="10" />
            <line x1="390" y1="64" x2="390" y2="118" stroke="#423F4F" strokeWidth="10" />
            <line x1="528" y1="64" x2="528" y2="118" stroke="#423F4F" strokeWidth="10" />

            {/* EXIT A — branches down-left off the corridor near the fire zone; color reflects live state */}
            <line x1="99" y1="134" x2="99" y2="190" stroke={exitAColor} strokeWidth="5" strokeDasharray={exitAIsBlocked ? '7 5' : '0'} />
            <circle cx="99" cy="196" r="12" fill={exitAColor} fillOpacity="0.2" stroke={exitAColor} strokeWidth="2" />
            <text x="99" y="200" textAnchor="middle" fill={exitAColor} fontSize="13" fontWeight="900">{exitAIsBlocked ? '✕' : '✓'}</text>
            <text x="99" y="222" textAnchor="middle" fill="#F3F3F3" fontSize="11" fontWeight="800">
              EXIT A — {exitAIsBlocked ? 'BLOCKED' : 'SAFE'}
            </text>

            {/* EXIT C — alternate, branches down near office 4B */}
            <line x1="390" y1="134" x2="390" y2="188" stroke="#6B9FD4" strokeWidth="4" strokeDasharray="6 5" markerEnd="url(#evacArrowAlt)" />
            <text x="390" y="222" textAnchor="middle" fill="#6B9FD4" fontSize="11" fontWeight="800">EXIT C — ALTERNATE</text>

            {/* EXIT B — primary, straight along the corridor to the far right + assembly point */}
            <line x1="664" y1="126" x2="710" y2="126" stroke="#7AE04C" strokeWidth="6" markerEnd="url(#evacArrow)" />
            <circle cx="730" cy="126" r="16" fill="#7AE04C" fillOpacity="0.2" stroke="#7AE04C" strokeWidth="2" />
            <text x="730" y="130" textAnchor="middle" fill="#7AE04C" fontSize="10" fontWeight="800">AP</text>
            <text x="664" y="106" textAnchor="middle" fill="#7AE04C" fontSize="12" fontWeight="800">EXIT B — PRIMARY / SAFE</text>

            {/* direction-of-flow chevrons along the primary corridor */}
            <path d="M180 126 L192 126 M180 126 L188 120 M180 126 L188 132" stroke="#7AE04C" strokeWidth="2" fill="none" strokeLinecap="round" />
            <path d="M320 126 L332 126 M320 126 L328 120 M320 126 L328 132" stroke="#7AE04C" strokeWidth="2" fill="none" strokeLinecap="round" />
            <path d="M458 126 L470 126 M458 126 L466 120 M458 126 L466 132" stroke="#7AE04C" strokeWidth="2" fill="none" strokeLinecap="round" />
            <path d="M596 126 L608 126 M596 126 L604 120 M596 126 L604 132" stroke="#7AE04C" strokeWidth="2" fill="none" strokeLinecap="round" />

            <defs>
              <marker id="evacArrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
                <path d="M1 1L9 5L1 9Z" fill="#7AE04C" />
              </marker>
              <marker id="evacArrowAlt" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
                <path d="M1 1L9 5L1 9Z" fill="#6B9FD4" />
              </marker>
            </defs>
          </svg>
        </div>

        {/* LEGEND */}
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-[10px] font-bold px-1">
          <div className="flex items-center gap-1.5 text-[#E26161]"><span className="w-2.5 h-2.5 rounded-sm bg-[#E26161]" /> Hazard zone</div>
          <div className="flex items-center gap-1.5 text-[#E26161]"><span className="w-4 h-0 border-t-2 border-dashed border-[#E26161]" /> Blocked route</div>
          <div className="flex items-center gap-1.5 text-[#7AE04C]"><span className="w-4 h-1 bg-[#7AE04C] rounded-full" /> Recommended route</div>
          <div className="flex items-center gap-1.5 text-[#6B9FD4]"><span className="w-4 h-0 border-t-2 border-dashed border-[#6B9FD4]" /> Alternative route</div>
        </div>

        {/* SUMMARY STRIP */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <div className="p-2.5 bg-[#292733] rounded border border-[#7AE04C]/30 flex items-center justify-between text-xs">
            <span className="text-[#A99BC9] font-bold flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-[#7AE04C]" />PRIMARY EGRESS</span>
            <span className="text-[#7AE04C] font-extrabold">Exit B</span>
          </div>
          <div className="p-2.5 bg-[#292733] rounded border border-[#6B9FD4]/30 flex items-center justify-between text-xs">
            <span className="text-[#A99BC9] font-bold flex items-center gap-1.5"><ArrowRight className="w-3.5 h-3.5 text-[#6B9FD4]" />ALTERNATIVE</span>
            <span className="text-[#6B9FD4] font-extrabold">Exit C</span>
          </div>
          <div className="p-2.5 bg-[#292733] rounded border border-[#E26161]/30 flex items-center justify-between text-xs">
            <span className="text-[#A99BC9] font-bold flex items-center gap-1.5"><XCircle className="w-3.5 h-3.5 text-[#E26161]" />BLOCKED</span>
            <span className="text-[#E26161] font-extrabold">Exit A</span>
          </div>
        </div>

        <p className="text-[11px] text-[#565E75] font-sans leading-relaxed px-1">
          <Flame className="w-3 h-3 inline text-[#E26161] mr-1" />
          Floor 4 fire origin isolates Exit A. Occupants are being routed along the main corridor to Stairwell B / Exit B,
          with Exit C held as the alternate for mobility-assist occupants.
        </p>
      </div>
    </div>
  );
};
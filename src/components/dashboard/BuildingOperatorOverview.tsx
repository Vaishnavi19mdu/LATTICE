import React, { useState } from 'react';
import { 
  Building2, 
  Flame, 
  Users, 
  Shield, 
  Brain, 
  HeartHandshake, 
  Network, 
  AlertTriangle, 
  CheckCircle2, 
  ArrowRight,
  UserCheck,
  Zap,
  Radio,
  FileEdit,
  XCircle,
  Clock
} from 'lucide-react';
import { useEmergency } from '../../context/EmergencyContext';
import { BUILDING_OPERATOR_CONFIG } from '../../config/roleConfig';

interface BuildingOperatorOverviewProps {
  onNavigateTab: (tab: 'interaction' | 'emergency' | 'decision' | 'chat' | 'comparison' | 'network') => void;
}

export const BuildingOperatorOverview: React.FC<BuildingOperatorOverviewProps> = ({ onNavigateTab }) => {
  const { state, injectOperatorIntervention } = useEmergency();
  const { incident, occupancy, exits, crossBuildingAlerts, operatorIntervention } = state;

  const [planStatus, setPlanStatus] = useState<'AWAITING OPERATOR REVIEW' | 'APPROVED' | 'REJECTED' | 'MODIFICATION REQUESTED'>('AWAITING OPERATOR REVIEW');
  const [showModifyInput, setShowModifyInput] = useState(false);
  const [modifyNote, setModifyNote] = useState('');

  const isFireActive = incident.severity === 'high' || incident.severity === 'critical';
  const hasCrossAlert = crossBuildingAlerts.length > 0;

  const handleApprove = () => {
    setPlanStatus('APPROVED');
    injectOperatorIntervention('OPERATOR APPROVAL: Approved response plan. Proceeding with Exit B evacuation route.');
  };

  const handleReject = () => {
    setPlanStatus('REJECTED');
    injectOperatorIntervention('OPERATOR REJECTION: Response plan rejected. Re-assessing evacuation vectors.');
  };

  const handleModifySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!modifyNote.trim()) return;
    setPlanStatus('MODIFICATION REQUESTED');
    injectOperatorIntervention(`OPERATOR MODIFICATION: ${modifyNote}`);
    setModifyNote('');
    setShowModifyInput(false);
  };

  return (
    <div className="space-y-6 font-sans">
      {/* 1. COMPACT ROLE HEADER */}
      <div className="bg-white border border-[#423F4F]/10 rounded-[8px] p-5 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-[6px] bg-[#292733] text-[#F3F3F3] flex items-center justify-center font-bold">
            <UserCheck className="w-5 h-5 text-[#A99BC9]" />
          </div>
          <div>
            <div className="flex items-center gap-2 font-mono-tech text-[10px] text-[#A99BC9] font-bold uppercase tracking-wider">
              <span>👤 {BUILDING_OPERATOR_CONFIG.displayName}</span>
              <span>•</span>
              <span className="text-[#7AE04C]">● ONLINE</span>
            </div>
            <h1 className="text-xl font-extrabold text-[#292733] tracking-tight">
              {BUILDING_OPERATOR_CONFIG.scope} — Building Operations
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2 font-mono-tech text-xs">
          <span className="px-3 py-1 bg-[#292733] text-[#F3F3F3] rounded-[6px] font-bold text-[11px] border border-[#423F4F]">
            SCOPE: SINGLE BUILDING (A)
          </span>
        </div>
      </div>

      {/* 2. COMMAND SUMMARY & COMPACT AGENTS GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* PRIMARY BUILDING A STATUS CARD (2 cols) */}
        <div className="lg:col-span-2 bg-white border border-[#423F4F]/10 rounded-[8px] p-6 shadow-sm space-y-5">
          <div className="flex flex-wrap items-center justify-between border-b border-[#423F4F]/10 pb-3 gap-2">
            <div>
              <span className="font-mono-tech text-[10px] text-[#A99BC9] uppercase font-bold block">
                ASSIGNED SCOPE
              </span>
              <h2 className="text-xl font-extrabold text-[#292733] flex items-center gap-2">
                <span>BUILDING A</span>
                <span className="text-xs font-normal text-[#565E75] font-mono-tech">(Operations Tower)</span>
              </h2>
            </div>

            <div className="flex items-center gap-2">
              <span className="font-mono-tech text-xs font-extrabold text-[#E26161] bg-[#E26161]/10 px-3 py-1 rounded-[6px] border border-[#E26161]/30 animate-pulse flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#E26161]"></span>
                🔴 ACTIVE INCIDENT
              </span>
            </div>
          </div>

          {/* INCIDENT DETAILS GRID */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-mono-tech text-xs">
            {/* Incident Type */}
            <div className="p-3.5 bg-[#F3F3F3] rounded-[6px] border border-[#423F4F]/10 space-y-1">
              <span className="text-[#565E75] uppercase text-[10px] font-bold block">INCIDENT LOCATION</span>
              <div className="text-sm font-extrabold text-[#E26161] flex items-center gap-1.5">
                <Flame className="w-4 h-4 fill-current" />
                <span>Floor 4 Fire</span>
              </div>
              <span className="text-[10px] text-[#E26161] font-bold block">HAZARD: HIGH</span>
            </div>

            {/* Occupants */}
            <div className="p-3.5 bg-[#F3F3F3] rounded-[6px] border border-[#423F4F]/10 space-y-1">
              <span className="text-[#565E75] uppercase text-[10px] font-bold block">OCCUPANCY & ASSISTANCE</span>
              <div className="text-sm font-extrabold text-[#292733] flex items-center gap-1.5">
                <Users className="w-4 h-4 text-[#A99BC9]" />
                <span>42 Occupants</span>
              </div>
              <span className="text-[10px] text-[#A99BC9] font-bold block">
                3 Registered Mobility Requirements
              </span>
            </div>

            {/* Primary Egress */}
            <div className="p-3.5 bg-[#7AE04C]/10 rounded-[6px] border border-[#7AE04C]/30 space-y-1">
              <span className="text-[#565E75] uppercase text-[10px] font-bold block">PRIMARY EGRESS</span>
              <div className="text-sm font-extrabold text-[#292733] flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-[#7AE04C]" />
                <span>Exit B (North Stairwell)</span>
              </div>
              <span className="text-[10px] text-[#7AE04C] font-bold block">
                ✓ VERIFIED UNOBSTRUCTED
              </span>
            </div>

            {/* Blocked Exit */}
            <div className="p-3.5 bg-[#E26161]/10 rounded-[6px] border border-[#E26161]/30 space-y-1">
              <span className="text-[#565E75] uppercase text-[10px] font-bold block">BLOCKED EXIT</span>
              <div className="text-sm font-extrabold text-[#E26161] flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-[#E26161]" />
                <span>Exit A (South Corridor)</span>
              </div>
              <span className="text-[10px] text-[#E26161] font-bold block">
                ⛔ BLOCKED BY SMOKE
              </span>
            </div>
          </div>
        </div>

        {/* AGENTS STATUS (Compact 1 col) */}
        <div className="bg-white border border-[#423F4F]/10 rounded-[8px] p-6 shadow-sm space-y-4 flex flex-col justify-between">
          <div>
            <div className="border-b border-[#423F4F]/10 pb-2.5 mb-3">
              <span className="font-mono-tech text-[10px] text-[#A99BC9] uppercase font-bold block">
                LATTICE MULTI-AGENT SYSTEM
              </span>
              <h3 className="text-base font-extrabold text-[#292733] flex items-center gap-2">
                <span>ACTIVE AGENT STATUS</span>
              </h3>
            </div>

            <div className="space-y-2 font-mono-tech text-xs">
              <div className="p-2 bg-[#F3F3F3] rounded border border-[#423F4F]/10 flex items-center justify-between">
                <span className="flex items-center gap-2 font-bold text-[#292733]">
                  <Flame className="w-3.5 h-3.5 text-[#E26161]" /> Fire & Hazard
                </span>
                <span className="text-[10px] font-bold text-[#7AE04C]">● Active</span>
              </div>

              <div className="p-2 bg-[#F3F3F3] rounded border border-[#423F4F]/10 flex items-center justify-between">
                <span className="flex items-center gap-2 font-bold text-[#292733]">
                  <Users className="w-3.5 h-3.5 text-[#A99BC9]" /> Occupancy
                </span>
                <span className="text-[10px] font-bold text-[#7AE04C]">● Active</span>
              </div>

              <div className="p-2 bg-[#F3F3F3] rounded border border-[#423F4F]/10 flex items-center justify-between">
                <span className="flex items-center gap-2 font-bold text-[#292733]">
                  <Shield className="w-3.5 h-3.5 text-[#6B9FD4]" /> Security
                </span>
                <span className="text-[10px] font-bold text-[#7AE04C]">● Active</span>
              </div>

              <div className="p-2 bg-[#F3F3F3] rounded border border-[#423F4F]/10 flex items-center justify-between">
                <span className="flex items-center gap-2 font-bold text-[#292733]">
                  <Brain className="w-3.5 h-3.5 text-[#E6B85C]" /> Coordinator
                </span>
                <span className="text-[10px] font-bold text-[#7AE04C]">● Active</span>
              </div>

              <div className="p-2 bg-[#F3F3F3] rounded border border-[#423F4F]/10 flex items-center justify-between">
                <span className="flex items-center gap-2 font-bold text-[#292733]">
                  <HeartHandshake className="w-3.5 h-3.5 text-[#E26161]" /> Ethical Priority
                </span>
                <span className="text-[10px] font-bold text-[#7AE04C]">● Active</span>
              </div>

              <div className="p-2 bg-[#F3F3F3] rounded border border-[#423F4F]/10 flex items-center justify-between">
                <span className="flex items-center gap-2 font-bold text-[#565E75]">
                  <Network className="w-3.5 h-3.5 text-[#565E75]" /> Cross-Building
                </span>
                <span className="text-[10px] font-bold text-[#565E75]">● Standby</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => onNavigateTab('interaction')}
            className="w-full py-2 px-3 bg-[#292733] hover:bg-[#423F4F] text-[#F3F3F3] rounded-[6px] font-mono-tech text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <span>LIVE AGENT REASONING</span>
            <ArrowRight className="w-3.5 h-3.5 text-[#A99BC9]" />
          </button>
        </div>
      </div>

      {/* 3. RESPONSE PLAN SUMMARY & OPERATOR CONTROLS */}
      <div className="bg-white border border-[#423F4F]/10 rounded-[8px] p-6 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between border-b border-[#423F4F]/10 pb-3 gap-2">
          <div>
            <span className="font-mono-tech text-[10px] text-[#A99BC9] uppercase font-bold block">
              COORDINATED RESPONSE ACTION
            </span>
            <h2 className="text-lg font-extrabold text-[#292733]">RESPONSE PLAN SUMMARY</h2>
          </div>

          <div className="flex items-center gap-2 font-mono-tech">
            <span className={`px-3 py-1 rounded-[6px] text-xs font-bold border ${
              planStatus === 'APPROVED'
                ? 'bg-[#7AE04C]/20 border-[#7AE04C] text-[#292733]'
                : planStatus === 'REJECTED'
                ? 'bg-[#E26161]/20 border-[#E26161] text-[#E26161]'
                : planStatus === 'MODIFICATION REQUESTED'
                ? 'bg-[#E6B85C]/20 border-[#E6B85C] text-[#292733]'
                : 'bg-[#E6B85C]/15 border-[#E6B85C]/50 text-[#292733]'
            }`}>
              STATUS: {planStatus}
            </span>
          </div>
        </div>

        {/* Plan Details Table */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 font-mono-tech text-xs">
          <div className="p-3 bg-[#F3F3F3] rounded border border-[#423F4F]/10">
            <span className="text-[#565E75] uppercase text-[10px] font-bold block">SEVERITY</span>
            <span className="font-extrabold text-[#E26161]">CRITICAL</span>
          </div>

          <div className="p-3 bg-[#F3F3F3] rounded border border-[#423F4F]/10">
            <span className="text-[#565E75] uppercase text-[10px] font-bold block">PRIMARY ROUTE</span>
            <span className="font-extrabold text-[#7AE04C]">EXIT B</span>
          </div>

          <div className="p-3 bg-[#F3F3F3] rounded border border-[#423F4F]/10">
            <span className="text-[#565E75] uppercase text-[10px] font-bold block">BLOCKED ROUTE</span>
            <span className="font-extrabold text-[#E26161]">EXIT A</span>
          </div>

          <div className="p-3 bg-[#F3F3F3] rounded border border-[#423F4F]/10">
            <span className="text-[#565E75] uppercase text-[10px] font-bold block">ASSISTANCE</span>
            <span className="font-extrabold text-[#292733]">FLOOR 4 WEST</span>
          </div>
        </div>

        {/* Last Intervention Note */}
        {operatorIntervention && (
          <div className="p-3 bg-[#292733] text-[#F3F3F3] rounded border border-[#A99BC9]/40 font-mono-tech text-xs">
            <span className="text-[#A99BC9] text-[10px] font-bold uppercase block">LAST OPERATOR NOTE:</span>
            <span className="text-[#7AE04C] font-bold">"{operatorIntervention}"</span>
          </div>
        )}

        {/* Modify Form Input if toggled */}
        {showModifyInput && (
          <form onSubmit={handleModifySubmit} className="p-4 bg-[#F3F3F3] rounded border border-[#A99BC9] space-y-2">
            <label className="font-mono-tech text-xs font-bold text-[#292733] block">
              ENTER OPERATOR PLAN MODIFICATION INSTRUCTION:
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={modifyNote}
                onChange={(e) => setModifyNote(e.target.value)}
                placeholder="e.g. Redirect Floor 4 evacuees via North Elevator B if smoke clears..."
                className="flex-1 bg-white border border-[#423F4F]/30 p-2 rounded text-xs text-[#292733] font-mono-tech focus:outline-none focus:border-[#A99BC9]"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-[#292733] text-[#F3F3F3] text-xs font-bold font-mono-tech uppercase rounded hover:bg-[#423F4F]"
              >
                SUBMIT
              </button>
              <button
                type="button"
                onClick={() => setShowModifyInput(false)}
                className="px-3 py-2 bg-gray-200 text-[#423F4F] text-xs font-bold font-mono-tech uppercase rounded"
              >
                CANCEL
              </button>
            </div>
          </form>
        )}

        {/* ACTION BUTTONS */}
        <div className="flex flex-wrap gap-3 font-mono-tech text-xs pt-1">
          <button
            onClick={handleApprove}
            className="px-5 py-2.5 bg-[#7AE04C] hover:bg-[#68c63f] text-[#292733] font-extrabold uppercase tracking-wider rounded-[6px] shadow-sm flex items-center gap-2 cursor-pointer transition-all"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>APPROVE PLAN</span>
          </button>

          <button
            onClick={() => setShowModifyInput(!showModifyInput)}
            className="px-5 py-2.5 bg-[#292733] hover:bg-[#423F4F] text-[#F3F3F3] font-bold uppercase tracking-wider rounded-[6px] border border-[#565E75] flex items-center gap-2 cursor-pointer transition-all"
          >
            <FileEdit className="w-4 h-4 text-[#A99BC9]" />
            <span>MODIFY PLAN</span>
          </button>

          <button
            onClick={handleReject}
            className="px-5 py-2.5 bg-[#E26161]/15 hover:bg-[#E26161]/30 text-[#E26161] font-bold uppercase tracking-wider rounded-[6px] border border-[#E26161]/40 flex items-center gap-2 cursor-pointer transition-all"
          >
            <XCircle className="w-4 h-4" />
            <span>REJECT PLAN</span>
          </button>
        </div>
      </div>

      {/* 4. COMPACT CROSS-BUILDING INFORMATION */}
      <div className="bg-white border border-[#423F4F]/10 rounded-[8px] p-5 shadow-sm font-mono-tech text-xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
              hasCrossAlert ? 'bg-[#E6B85C]/20 text-[#E6B85C]' : 'bg-[#7AE04C]/20 text-[#7AE04C]'
            }`}>
              <Radio className="w-4 h-4" />
            </div>

            <div>
              <span className="text-[10px] text-[#A99BC9] uppercase font-bold block">
                CAMPUS MESH NOTIFICATIONS
              </span>
              {hasCrossAlert ? (
                <p className="font-extrabold text-[#292733]">
                  🌐 CROSS-BUILDING ALERT: Building B notified. Shared corridor monitoring active.
                </p>
              ) : (
                <p className="font-bold text-[#565E75]">
                  🌐 NETWORK STATUS: No active cross-building events.
                </p>
              )}
            </div>
          </div>

          {hasCrossAlert && (
            <button
              onClick={() => onNavigateTab('comparison')}
              className="text-xs font-bold text-[#A99BC9] hover:text-[#292733] underline flex items-center gap-1 cursor-pointer"
            >
              <span>View Network Event</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

import React from 'react';
import {
  Radio,
  ShieldAlert,
  CheckCircle2,
  Clock,
  Users,
  Bot,
  ArrowRight,
  ArrowDown,
  Sparkles,
  UserCheck,
  Inbox,
} from 'lucide-react';
import { useEmergency } from '../../context/EmergencyContext';
import {
  BUILDING_IDENTITY,
  ACTIVE_MUTUAL_AID_REQUEST,
  MUTUAL_AID_QUEUE,
  RESOURCE_AVAILABILITY,
  getAiMutualAidRecommendation,
  CROSS_BUILDING_COMMS,
  type BuildingId,
  type MutualAidStatus,
} from '../../lib/mock/campusNetworkState';

const buildingLabel = (id: BuildingId) => BUILDING_IDENTITY[id].code;

const statusStyles: Record<MutualAidStatus, string> = {
  ACTIVE: 'text-[#E6B85C] bg-[#E6B85C]/10 border-[#E6B85C]/30',
  DISPATCHED: 'text-[#E6B85C] bg-[#E6B85C]/10 border-[#E6B85C]/30',
  PENDING: 'text-[#6B9FD4] bg-[#6B9FD4]/10 border-[#6B9FD4]/30',
  COMPLETED: 'text-[#7AE04C] bg-[#7AE04C]/10 border-[#7AE04C]/30',
};

export const MutualAidNetworkView: React.FC = () => {
  const { state } = useEmergency();
  const { crossBuildingAlerts } = state;
  const hasCrossAlert = crossBuildingAlerts.length > 0;
  const aiRecommendation = getAiMutualAidRecommendation(hasCrossAlert);

  return (
    <div className="space-y-6 font-sans">
      {/* SECTION HEADER */}
      <div className="bg-white border border-[#423F4F]/10 rounded-[8px] p-6 shadow-sm">
        <div className="flex items-center gap-2 font-mono-tech text-xs font-bold text-[#A99BC9] uppercase tracking-widest mb-1">
          <ShieldAlert className="w-4 h-4 text-[#A99BC9]" />
          <span>LATTICE COORDINATOR // MUTUAL AID</span>
        </div>
        <h1 className="text-2xl font-extrabold text-[#292733] tracking-tight">
          CAMPUS CROSS-BUILDING MUTUAL AID NETWORK
        </h1>
        <p className="text-xs text-[#565E75] mt-0.5">
          Coordinate assistance between connected buildings during active emergencies.
        </p>
      </div>

      {/* MUTUAL AID TOPOLOGY */}
      <div className="bg-[#292733] text-[#F3F3F3] rounded-[8px] p-5 border border-[#423F4F] shadow-md space-y-3">
        <div className="flex items-center justify-between border-b border-[#565E75]/40 pb-2.5 font-mono-tech text-xs">
          <div className="flex items-center gap-2">
            <Radio className="w-4 h-4 text-[#7AE04C] animate-pulse" />
            <span className="font-bold text-[#F3F3F3]">LATTICE CAMPUS NETWORK — AID FLOW</span>
          </div>
          <span className="text-[10px] text-[#A99BC9] font-bold">DIRECTION = ASSISTANCE FLOW</span>
        </div>

        <div className="relative py-6 px-4 overflow-x-auto">
          <svg viewBox="0 0 640 240" className="w-full min-w-[480px] h-auto" preserveAspectRatio="xMidYMid meet">
            <defs>
              <marker id="aidArrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
                <path d="M1 1L9 5L1 9Z" fill="#E6B85C" />
              </marker>
              <marker id="alertArrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
                <path d="M1 1L9 5L1 9Z" fill="#6B9FD4" />
              </marker>
            </defs>

            {/* A -> B mutual aid line */}
            <line x1="255" y1="55" x2="150" y2="150" stroke="#E6B85C" strokeWidth={hasCrossAlert ? 3.5 : 2} strokeDasharray="7 5" markerEnd="url(#aidArrow)" opacity={hasCrossAlert ? 1 : 0.5}>
              {hasCrossAlert && <animate attributeName="stroke-dashoffset" from="24" to="0" dur="1s" repeatCount="indefinite" />}
            </line>
            <text x="165" y="95" textAnchor="middle" fill="#E6B85C" fontSize="10" fontWeight="800" fontFamily="monospace">MUTUAL AID</text>

            {/* A -> C alert line */}
            <line x1="385" y1="55" x2="490" y2="150" stroke="#6B9FD4" strokeWidth="2" strokeDasharray="5 4" markerEnd="url(#alertArrow)" opacity="0.75" />
            <text x="475" y="95" textAnchor="middle" fill="#6B9FD4" fontSize="10" fontWeight="800" fontFamily="monospace">ALERT</text>

            {/* B <-> C link */}
            <line x1="190" y1="180" x2="450" y2="180" stroke="#8992AC" strokeWidth="2" strokeDasharray="6 5" opacity="0.6" />

            {/* Node A */}
            <g>
              <circle cx="320" cy="45" r="30" fill="#E26161" stroke="#FFFFFF" strokeWidth="1.5">
                <animate attributeName="r" values="30;33;30" dur="1.8s" repeatCount="indefinite" />
              </circle>
              <text x="320" y="52" textAnchor="middle" fill="#FFFFFF" fontSize="15" fontWeight="800" fontFamily="monospace">A</text>
              <text x="320" y="90" textAnchor="middle" fill="#F3F3F3" fontSize="11" fontWeight="700" fontFamily="monospace">BUILDING A</text>
              <text x="320" y="105" textAnchor="middle" fill="#E26161" fontSize="9" fontWeight="700" fontFamily="monospace">🔴 INCIDENT</text>
            </g>

            {/* Node B */}
            <g>
              <circle cx="150" cy="180" r="26" fill="#292733" stroke="#7AE04C" strokeWidth="1.5" />
              <text x="150" y="186" textAnchor="middle" fill="#FFFFFF" fontSize="14" fontWeight="800" fontFamily="monospace">B</text>
              <text x="150" y="220" textAnchor="middle" fill="#F3F3F3" fontSize="11" fontWeight="700" fontFamily="monospace">BUILDING B</text>
              <text x="150" y="234" textAnchor="middle" fill="#7AE04C" fontSize="9" fontWeight="700" fontFamily="monospace">🟢 READY</text>
            </g>

            {/* Node C */}
            <g>
              <circle cx="490" cy="180" r="26" fill="#292733" stroke="#7AE04C" strokeWidth="1.5" />
              <text x="490" y="186" textAnchor="middle" fill="#FFFFFF" fontSize="14" fontWeight="800" fontFamily="monospace">C</text>
              <text x="490" y="220" textAnchor="middle" fill="#F3F3F3" fontSize="11" fontWeight="700" fontFamily="monospace">BUILDING C</text>
              <text x="490" y="234" textAnchor="middle" fill="#7AE04C" fontSize="9" fontWeight="700" fontFamily="monospace">🟢 READY</text>
            </g>
          </svg>
        </div>

        {/* Directional assist summary */}
        <div className="flex items-center justify-center gap-3 font-mono-tech text-xs pt-1 border-t border-[#565E75]/30 pb-1">
          <span className="text-[#F3F3F3] font-bold">BUILDING B</span>
          <ArrowDown className="w-3.5 h-3.5 text-[#E6B85C] rotate-[-90deg]" />
          <span className="text-[#E6B85C] font-extrabold">SECURITY SUPPORT</span>
          <ArrowRight className="w-3.5 h-3.5 text-[#E6B85C]" />
          <span className="text-[#F3F3F3] font-bold">BUILDING A</span>
        </div>
      </div>

      {/* ACTIVE MUTUAL AID REQUEST */}
      <div className="bg-white border-2 border-[#E6B85C]/50 rounded-[8px] p-6 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#423F4F]/10 pb-3">
          <div className="flex items-center gap-2">
            <span className="font-mono-tech text-[10px] font-bold text-[#E6B85C] uppercase tracking-wider bg-[#E6B85C]/10 px-2 py-0.5 rounded border border-[#E6B85C]/30">
              ACTIVE REQUEST
            </span>
            <span className="font-extrabold text-lg text-[#292733] flex items-center gap-2">
              BUILDING {buildingLabel(ACTIVE_MUTUAL_AID_REQUEST.fromBuilding)}
              <ArrowRight className="w-4 h-4 text-[#565E75]" />
              BUILDING {buildingLabel(ACTIVE_MUTUAL_AID_REQUEST.toBuilding)}
            </span>
          </div>
          <span className={`font-mono-tech text-xs font-bold px-2.5 py-1 rounded border ${statusStyles[ACTIVE_MUTUAL_AID_REQUEST.status]}`}>
            {ACTIVE_MUTUAL_AID_REQUEST.status === 'DISPATCHED' ? '● ASSISTANCE DISPATCHED' : ACTIVE_MUTUAL_AID_REQUEST.status}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono-tech text-xs">
          <div className="space-y-2">
            <div>
              <span className="text-[#565E75] font-bold uppercase text-[10px] block">Reason</span>
              <span className="text-[#292733] font-bold">{ACTIVE_MUTUAL_AID_REQUEST.reason}</span>
            </div>
            <div>
              <span className="text-[#565E75] font-bold uppercase text-[10px] block">Support Requested</span>
              <span className="text-[#292733] font-bold">{ACTIVE_MUTUAL_AID_REQUEST.supportType}</span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="p-2.5 bg-[#F3F3F3] rounded border border-[#423F4F]/10">
              <span className="text-[9px] text-[#565E75] uppercase block">Request ID</span>
              <span className="font-extrabold text-[#292733]">{ACTIVE_MUTUAL_AID_REQUEST.requestId}</span>
            </div>
            <div className="p-2.5 bg-[#F3F3F3] rounded border border-[#423F4F]/10">
              <span className="text-[9px] text-[#565E75] uppercase block">Timestamp</span>
              <span className="font-extrabold text-[#292733]">{ACTIVE_MUTUAL_AID_REQUEST.timestamp}</span>
            </div>
            <div className="p-2.5 bg-[#F3F3F3] rounded border border-[#423F4F]/10">
              <span className="text-[9px] text-[#565E75] uppercase block">Requested By</span>
              <span className="font-extrabold text-[#292733]">{ACTIVE_MUTUAL_AID_REQUEST.requestedBy}</span>
            </div>
            <div className="p-2.5 bg-[#F3F3F3] rounded border border-[#423F4F]/10">
              <span className="text-[9px] text-[#565E75] uppercase block">Coordinated By</span>
              <span className="font-extrabold text-[#292733]">{ACTIVE_MUTUAL_AID_REQUEST.coordinatedBy}</span>
            </div>
            <div className="p-2.5 bg-[#F3F3F3] rounded border border-[#423F4F]/10 col-span-2">
              <span className="text-[9px] text-[#565E75] uppercase block">Approved By</span>
              <span className="font-extrabold text-[#7AE04C] flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> {ACTIVE_MUTUAL_AID_REQUEST.approvedBy}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* RESOURCE AVAILABILITY + AI RECOMMENDATION */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* AVAILABLE SUPPORT */}
        <div className="bg-white border border-[#423F4F]/10 rounded-[8px] p-6 shadow-sm space-y-3">
          <h3 className="font-extrabold text-sm text-[#292733] uppercase font-mono-tech flex items-center gap-2">
            <Users className="w-4 h-4 text-[#A99BC9]" />
            <span>AVAILABLE SUPPORT</span>
          </h3>
          <div className="space-y-2">
            {RESOURCE_AVAILABILITY.map((r) => (
              <div key={r.building} className="p-3 bg-[#F3F3F3] rounded border border-[#423F4F]/10 font-mono-tech text-xs space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-[#292733]">BUILDING {buildingLabel(r.building)}</span>
                  <span className={`font-bold px-2 py-0.5 rounded border text-[10px] ${
                    r.recommendation === 'RECOMMENDED'
                      ? 'text-[#7AE04C] bg-[#7AE04C]/10 border-[#7AE04C]/30'
                      : 'text-[#565E75] bg-[#565E75]/10 border-[#565E75]/30'
                  }`}>
                    {r.recommendation}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-y-1 text-[#565E75]">
                  <span>Security: <span className="text-[#292733] font-bold">{r.security}</span></span>
                  <span>Personnel: <span className="text-[#292733] font-bold">{r.personnel}</span></span>
                  <span>Status: <span className="text-[#292733] font-bold">{r.status}</span></span>
                  <span>Distance: <span className="text-[#292733] font-bold">{r.distance}</span></span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* AI RECOMMENDATION */}
        <div className="bg-white border border-[#423F4F]/10 rounded-[8px] p-6 shadow-sm space-y-3">
          <h3 className="font-extrabold text-sm text-[#292733] uppercase font-mono-tech flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#A99BC9]" />
            <span>AI RECOMMENDATION</span>
          </h3>
          <p className="text-xs text-[#292733] leading-relaxed font-sans bg-[#F3F3F3] p-3 rounded border border-[#423F4F]/10">
            "{aiRecommendation.summary}"
          </p>
          <div className="grid grid-cols-2 gap-2 font-mono-tech text-xs">
            <div className="p-2.5 bg-[#F3F3F3] rounded border border-[#423F4F]/10">
              <span className="text-[9px] text-[#565E75] uppercase block">Confidence</span>
              <span className="font-extrabold text-[#7AE04C]">{aiRecommendation.confidencePct}%</span>
            </div>
            <div className="p-2.5 bg-[#F3F3F3] rounded border border-[#423F4F]/10">
              <span className="text-[9px] text-[#565E75] uppercase block">Recommended Support</span>
              <span className="font-extrabold text-[#292733]">{aiRecommendation.recommendedSupport}</span>
            </div>
            <div className="p-2.5 bg-[#F3F3F3] rounded border border-[#423F4F]/10 col-span-2">
              <span className="text-[9px] text-[#565E75] uppercase block">Source</span>
              <span className="font-extrabold text-[#292733] flex items-center gap-1"><Bot className="w-3.5 h-3.5 text-[#6B9FD4]" />{aiRecommendation.source}</span>
            </div>
          </div>
          <div className={`p-2.5 rounded-[6px] font-mono-tech text-xs font-extrabold flex items-center justify-center gap-2 border ${
            aiRecommendation.approvalState === 'APPROVED'
              ? 'bg-[#7AE04C]/10 text-[#7AE04C] border-[#7AE04C]/30'
              : 'bg-[#E6B85C]/10 text-[#E6B85C] border-[#E6B85C]/30 animate-pulse'
          }`}>
            {aiRecommendation.approvalState === 'APPROVED' ? <CheckCircle2 className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
            {aiRecommendation.approvalState}
          </div>
          <p className="text-[10px] text-[#565E75] font-sans">
            AI cannot dispatch real-world resources on its own — human approval remains part of the workflow.
          </p>
        </div>
      </div>

      {/* MUTUAL AID QUEUE */}
      <div className="bg-white border border-[#423F4F]/10 rounded-[8px] p-6 shadow-sm space-y-3">
        <h3 className="font-extrabold text-sm text-[#292733] uppercase font-mono-tech flex items-center gap-2">
          <Inbox className="w-4 h-4 text-[#A99BC9]" />
          <span>MUTUAL AID QUEUE</span>
        </h3>
        <div className="space-y-2">
          {MUTUAL_AID_QUEUE.map((req) => (
            <div key={req.requestId} className="p-3 bg-[#F3F3F3] rounded border border-[#423F4F]/10 flex flex-wrap items-center justify-between gap-2 font-mono-tech text-xs">
              <div>
                <span className="font-extrabold text-[#292733] block">
                  #{req.requestId} — BUILDING {buildingLabel(req.fromBuilding)} → BUILDING {buildingLabel(req.toBuilding)}
                </span>
                <span className="text-[#565E75]">{req.supportType}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-[10px] text-[#565E75]">{req.timestamp}</span>
                <span className={`font-bold px-2 py-0.5 rounded border text-[10px] ${statusStyles[req.status]}`}>{req.status}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CROSS-BUILDING COMMUNICATION FEED */}
      <div className="bg-[#292733] text-[#F3F3F3] rounded-[8px] p-6 border border-[#423F4F] shadow-md space-y-3">
        <div className="flex items-center justify-between border-b border-[#565E75]/40 pb-2.5 font-mono-tech text-xs">
          <div className="flex items-center gap-2">
            <Radio className="w-4 h-4 text-[#7AE04C]" />
            <span className="font-bold text-[#F3F3F3] uppercase">CROSS-BUILDING AGENT COMMUNICATION</span>
          </div>
          <span className="text-[10px] text-[#A99BC9] font-bold">LIVE FEED</span>
        </div>

        <div className="max-h-72 overflow-y-auto space-y-2.5 pr-1 font-mono-tech text-xs">
          {CROSS_BUILDING_COMMS.map((msg) => (
            <div key={msg.id} className="p-3 bg-[#1F2028] rounded border border-[#423F4F]/60 space-y-1.5">
              <div className="flex items-center justify-between text-[10px]">
                <span className="flex items-center gap-1.5 font-bold text-[#A99BC9]">
                  {msg.senderRole === 'Human' ? <UserCheck className="w-3 h-3" /> : <Bot className="w-3 h-3" />}
                  {msg.senderName}
                  <span className="text-[#565E75]">
                    ({msg.senderBuilding === 'campus' ? 'Campus' : `Bldg ${buildingLabel(msg.senderBuilding)}`})
                  </span>
                  <ArrowRight className="w-3 h-3 text-[#565E75]" />
                  {msg.recipientName}
                  <span className="text-[#565E75]">
                    ({msg.recipientBuilding === 'campus' ? 'Campus' : `Bldg ${buildingLabel(msg.recipientBuilding)}`})
                  </span>
                </span>
                <span className="text-[#565E75]">{msg.timestamp}</span>
              </div>
              <p className="text-[#F3F3F3] font-sans text-[12px]">"{msg.message}"</p>
              <span className={`text-[9px] font-bold uppercase ${
                msg.status === 'actioned' ? 'text-[#7AE04C]' : msg.status === 'acknowledged' ? 'text-[#6B9FD4]' : 'text-[#A99BC9]'
              }`}>
                {msg.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
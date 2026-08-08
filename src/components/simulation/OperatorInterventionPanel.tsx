import React, { useState } from 'react';
import { 
  UserCheck, 
  CheckCircle2, 
  XCircle, 
  Edit3, 
  AlertTriangle, 
  ShieldAlert, 
  Sparkles, 
  ArrowRight,
  Info
} from 'lucide-react';
import { CoordinatorAssessment, OperatorNote } from '../../agents/coordinator/coordinator.types';

interface OperatorPanelProps {
  assessment: CoordinatorAssessment;
  confidenceScore: number;
  isSecurityOffline: boolean;
  humanDecision: 'APPROVED' | 'MODIFIED' | 'REJECTED' | null;
  operatorNotes: OperatorNote[];
  onApprove: () => void;
  onReject: () => void;
  onModify: (note: string) => void;
}

export const OperatorInterventionPanel: React.FC<OperatorPanelProps> = ({
  assessment,
  confidenceScore,
  isSecurityOffline,
  humanDecision,
  operatorNotes,
  onApprove,
  onReject,
  onModify,
}) => {
  const [noteInput, setNoteInput] = useState<string>('');

  const handleApplyNote = () => {
    if (!noteInput.trim()) return;
    onModify(noteInput.trim());
    setNoteInput('');
  };

  return (
    <div className="bg-[#292733] text-[#F3F3F3] p-6 rounded-[8px] border border-[#423F4F] shadow-md space-y-5 font-sans">
      {/* HEADER */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#565E75]/40 pb-3 font-mono-tech">
        <div className="flex items-center gap-2">
          <UserCheck className="w-5 h-5 text-[#A99BC9]" />
          <h3 className="font-extrabold text-sm tracking-tight text-[#F3F3F3]">
            HUMAN-IN-THE-LOOP OVERRIDE & AI RESPONSE PLAN
          </h3>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-[#292733] bg-[#E26161] px-2.5 py-0.5 rounded">
            LEVEL: {assessment.emergencyLevel}
          </span>
          <span className="text-xs font-bold text-[#292733] bg-[#7AE04C] px-2.5 py-0.5 rounded">
            CONFIDENCE: {Math.round(confidenceScore * 100)}%
          </span>
        </div>
      </div>

      {/* FALLBACK OR CONFLICT BANNERS */}
      {isSecurityOffline && (
        <div className="p-3.5 bg-[#E26161]/20 border border-[#E26161] rounded-[6px] font-mono-tech text-xs space-y-1">
          <div className="font-extrabold text-[#E26161] flex items-center gap-2">
            <ShieldAlert className="w-4 h-4" />
            SECURITY AGENT OFFLINE — DEGRADED MODE ACTIVE
          </div>
          <p className="text-[#F3F3F3] text-xs font-sans leading-relaxed">
            Security verification telemetry unreachable. Confidence reduced to {Math.round(confidenceScore * 100)}%. Fallback protocol active: relying on Fire and Occupancy sensors.
          </p>
        </div>
      )}

      {assessment.conflicts.length > 0 && (
        <div className="p-3.5 bg-[#E6B85C]/20 border border-[#E6B85C] rounded-[6px] font-mono-tech text-xs space-y-1">
          <div className="font-extrabold text-[#E6B85C] flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            ROUTE CONFLICT RESOLVED BY AI COORDINATOR
          </div>
          <p className="text-[#F3F3F3] text-xs font-sans leading-relaxed">
            {assessment.conflicts.join('. ')}
          </p>
        </div>
      )}

      {/* RECOMMENDED AI ACTIONS CHECKLIST */}
      <div className="space-y-2">
        <span className="font-mono-tech text-xs font-bold text-[#A99BC9] uppercase block">
          SYNTHESIZED AI ACTION PLAN:
        </span>

        <div className="space-y-1.5 font-sans">
          {assessment.recommendedActions.map((action, idx) => (
            <div key={idx} className="p-2.5 bg-[#1F2028] rounded border border-[#423F4F] text-xs text-[#F3F3F3] flex items-center gap-2 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-[#7AE04C] shrink-0" />
              <span>{action}</span>
            </div>
          ))}
        </div>
      </div>

      {/* DECISION ACTION BUTTONS */}
      <div className="pt-2 border-t border-[#565E75]/40 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 font-mono-tech">
          <span className="text-xs font-bold text-[#A99BC9] uppercase">OPERATOR DECISION STATUS:</span>
          <span className={`text-xs font-extrabold px-3 py-1 rounded border uppercase ${
            humanDecision === 'APPROVED' ? 'bg-[#7AE04C] text-[#292733] border-[#7AE04C]' :
            humanDecision === 'MODIFIED' ? 'bg-[#E6B85C] text-[#292733] border-[#E6B85C]' :
            humanDecision === 'REJECTED' ? 'bg-[#E26161] text-[#F3F3F3] border-[#E26161]' :
            'bg-[#423F4F] text-[#A99BC9] border-[#565E75]'
          }`}>
            {humanDecision ? `PLAN ${humanDecision}` : 'AWAITING OPERATOR DECISION'}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-3 font-mono-tech text-xs">
          <button
            onClick={onApprove}
            className="py-2.5 px-4 bg-[#7AE04C] hover:bg-[#68c83e] text-[#292733] font-bold rounded-[6px] transition-all cursor-pointer flex items-center gap-1.5 shadow-sm"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>[ APPROVE RESPONSE PLAN ]</span>
          </button>

          <button
            onClick={onReject}
            className="py-2.5 px-4 bg-[#E26161] hover:bg-[#d05050] text-[#F3F3F3] font-bold rounded-[6px] transition-all cursor-pointer flex items-center gap-1.5 shadow-sm"
          >
            <XCircle className="w-4 h-4" />
            <span>[ REJECT PLAN ]</span>
          </button>
        </div>

        {/* MODIFY WITH OPERATOR NOTE (ADAPTIVE REPLANNING) */}
        <div className="space-y-2 pt-2 border-t border-[#565E75]/30">
          <label className="font-mono-tech text-xs font-bold text-[#A99BC9] uppercase block">
            MODIFY PLAN WITH OPERATOR INSTRUCTION (TRIGGER ADAPTIVE REPLANNING):
          </label>

          <div className="flex items-center gap-2">
            <input
              type="text"
              value={noteInput}
              onChange={(e) => setNoteInput(e.target.value)}
              placeholder="e.g. Exit B is temporarily restricted by maintenance. Use Exit C."
              className="flex-1 bg-[#1F2028] text-[#F3F3F3] border border-[#565E75] p-2.5 rounded-[6px] font-sans text-xs focus:outline-none focus:border-[#A99BC9]"
              onKeyDown={(e) => e.key === 'Enter' && handleApplyNote()}
            />

            <button
              onClick={handleApplyNote}
              className="py-2.5 px-4 bg-[#A99BC9] hover:bg-[#9788b8] text-[#292733] font-mono-tech text-xs font-bold rounded-[6px] transition-all cursor-pointer flex items-center gap-1.5 shrink-0"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>SUBMIT & REPLAN</span>
            </button>
          </div>
        </div>

        {/* ACTIVE OPERATOR NOTES */}
        {operatorNotes.length > 0 && (
          <div className="space-y-1.5 pt-1 font-mono-tech text-xs">
            <span className="text-[10px] text-[#A99BC9] font-bold uppercase">APPLIED OPERATOR OVERRIDES:</span>
            {operatorNotes.map((note) => (
              <div key={note.noteId} className="p-2.5 bg-[#1F2028] rounded border border-[#A99BC9]/40 text-[#7AE04C]">
                👤 <strong>[HUMAN OPERATOR]</strong>: "{note.message}"
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

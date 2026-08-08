import React from 'react';

/**
 * TEMPORARY promo banner — a cloud drifting left to right saying
 * "Click Enter System →". Self-contained, no dependencies on other
 * components. To remove later: delete the import + <EntrySystemCloud />
 * line from App.tsx. Nothing else needs to change.
 */
export const EntrySystemCloud: React.FC = () => {
  return (
    <>
      <style>{`
        @keyframes drift-across {
          0%   { left: -320px; }
          100% { left: 100vw; }
        }
        .entry-cloud {
          position: fixed;
          top: 90px;
          animation: drift-across 20s linear infinite;
          z-index: 9999;
          pointer-events: none;
          white-space: nowrap;
        }
      `}</style>

      <div className="entry-cloud flex items-center gap-2">
        <div className="relative bg-white text-[#292733] font-mono-tech text-sm font-bold px-4 py-2.5 rounded-[20px] shadow-lg border border-[#423F4F]/20 flex items-center gap-2">
          <span className="text-lg">☁️</span>
          <span>Click Enter System →</span>
          {/* speech bubble tail */}
          <span className="absolute -bottom-1.5 left-6 w-3 h-3 bg-white border-b border-r border-[#423F4F]/20 rotate-45"></span>
        </div>
      </div>
    </>
  );
};
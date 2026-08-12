import React from 'react';
import { useSOS } from './SOSContext';

/**
 * Drop this anywhere in your JSX (e.g. the top bar) to show live SOS status.
 * Reads from the shared SOSContext — safe to mount in multiple places at once.
 */
export const SOSIndicator: React.FC = () => {
  const { sosStatus } = useSOS();

  if (sosStatus === 'IDLE') return null;

  const label =
    sosStatus === 'SOUNDING'
      ? '🚨 SOS SOUNDING'
      : sosStatus === 'READY_TO_DIAL'
      ? '📞 SOS READY TO DIAL'
      : '✅ SOS COMPLETED';

  const colorClass =
    sosStatus === 'SOUNDING'
      ? 'bg-[#E26161]/20 border-[#E26161] text-[#E26161] animate-pulse'
      : sosStatus === 'READY_TO_DIAL'
      ? 'bg-[#E6B85C]/20 border-[#E6B85C] text-[#292733]'
      : 'bg-[#7AE04C]/20 border-[#7AE04C] text-[#292733]';

  return (
    <span
      className={`font-mono-tech text-xs font-extrabold px-3 py-1 rounded-[6px] border ${colorClass}`}
    >
      {label}
    </span>
  );
};
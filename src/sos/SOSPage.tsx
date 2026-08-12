import React, { useEffect, useRef } from 'react';
import { PhoneCall, Flame, Clock, ShieldAlert } from 'lucide-react';
import { useSOS } from './SOSContext';
import { useEmergency } from '../context/EmergencyContext'; // adjust path if needed

const formatTime = (d: Date | null) => (d ? d.toLocaleTimeString() : '—');

export const SOSPage: React.FC = () => {
  const { sosStatus, incidentDetectedAt, sosTriggeredAt, sosCompletedAt } = useSOS();
  const { state } = useEmergency();
  const incident = state.incident as unknown as {
    floor?: number | string;
    type?: string;
    severity?: string;
  };

  // Prevent firing the auto-dial more than once per mount
  const hasAutoDialedRef = useRef(false);

  useEffect(() => {
    if (hasAutoDialedRef.current) return;
    hasAutoDialedRef.current = true;

    // TEMP: fires unconditionally on mount, ignoring sosStatus entirely,
    // so you can confirm the tel: navigation itself works before wiring
    // the status gate back in.
    const isFire = incident?.type?.toLowerCase().includes('fire');
    const number = isFire ? '101' : '100';

    console.log('[SOS] attempting tel: navigation to', number);
    window.location.href = `tel:${number}`;
  }, []);

  const statusColor =
    sosStatus === 'SOUNDING'
      ? 'text-[#E26161] bg-[#E26161]/10 border-[#E26161]/30 animate-pulse'
      : sosStatus === 'READY_TO_DIAL'
      ? 'text-[#E6B85C] bg-[#E6B85C]/10 border-[#E6B85C]/30'
      : sosStatus === 'COMPLETED'
      ? 'text-[#292733] bg-[#7AE04C]/20 border-[#7AE04C]/40'
      : 'text-[#565E75] bg-[#F3F3F3] border-[#423F4F]/10';

  return (
    <div className="space-y-6 font-sans">
      {/* HEADER */}
      <div className="bg-white p-6 rounded-[8px] border border-[#423F4F]/10 shadow-sm flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#292733] mb-1">SOS EMERGENCY RESPONSE</h1>
          <p className="text-xs text-[#565E75]">
            Automatic SOS trigger status and direct emergency service dialing.
          </p>
        </div>
        <span className={`font-mono-tech text-xs font-extrabold px-4 py-2 rounded-[6px] border ${statusColor}`}>
          SOS STATUS: {sosStatus}
        </span>
      </div>

      {/* INCIDENT SUMMARY */}
      <div className="bg-white p-6 rounded-[8px] border border-[#423F4F]/10 shadow-sm space-y-4">
        <h2 className="font-mono-tech text-xs font-bold text-[#A99BC9] uppercase tracking-wider border-b border-[#423F4F]/10 pb-2">
          Incident Details
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono-tech text-xs">
          <div className="p-3 bg-[#F3F3F3] rounded border border-[#423F4F]/10">
            <span className="text-[10px] text-[#565E75] uppercase font-bold block">Location</span>
            <span className="font-extrabold text-[#E26161] flex items-center gap-1.5">
              <Flame className="w-4 h-4" /> Floor {incident?.floor ?? '—'} {incident?.type ?? ''}
            </span>
          </div>
          <div className="p-3 bg-[#F3F3F3] rounded border border-[#423F4F]/10">
            <span className="text-[10px] text-[#565E75] uppercase font-bold block">Severity</span>
            <span className="font-extrabold text-[#292733]">
              {incident?.severity ? incident.severity.toUpperCase() : '—'}
            </span>
          </div>
          <div className="p-3 bg-[#F3F3F3] rounded border border-[#423F4F]/10">
            <span className="text-[10px] text-[#565E75] uppercase font-bold block">Detected At</span>
            <span className="font-extrabold text-[#292733] flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-[#A99BC9]" /> {formatTime(incidentDetectedAt)}
            </span>
          </div>
        </div>
      </div>

      {/* SOS TIMELINE */}
      <div className="bg-white p-6 rounded-[8px] border border-[#423F4F]/10 shadow-sm space-y-3">
        <h2 className="font-mono-tech text-xs font-bold text-[#A99BC9] uppercase tracking-wider border-b border-[#423F4F]/10 pb-2">
          SOS Timeline
        </h2>
        <div className="space-y-2 font-mono-tech text-xs">
          <div className="flex items-center justify-between p-2.5 bg-[#F3F3F3] rounded border border-[#423F4F]/10">
            <span className="font-bold text-[#292733] flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-[#E26161]" /> Incident Detected
            </span>
            <span className="text-[#565E75]">{formatTime(incidentDetectedAt)}</span>
          </div>
          <div className="flex items-center justify-between p-2.5 bg-[#F3F3F3] rounded border border-[#423F4F]/10">
            <span className="font-bold text-[#292733]">SOS Sounding Started (7s alarm)</span>
            <span className="text-[#565E75]">{formatTime(sosTriggeredAt)}</span>
          </div>
          <div className="flex items-center justify-between p-2.5 bg-[#F3F3F3] rounded border border-[#423F4F]/10">
            <span className="font-bold text-[#292733]">SOS Completed / Dialed</span>
            <span className="text-[#565E75]">{formatTime(sosCompletedAt)}</span>
          </div>
        </div>
      </div>

      {/* EMERGENCY CALL BUTTONS (fallback, still tappable manually) */}
      <div className="bg-[#292733] p-6 rounded-[8px] border border-[#423F4F] shadow-md space-y-4">
        <h2 className="font-mono-tech text-xs font-bold text-[#A99BC9] uppercase tracking-wider">
          Direct Emergency Contact
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <a
            href="tel:101"
            className="flex items-center justify-center gap-3 py-4 px-4 bg-[#E26161] hover:bg-[#c94f4f] text-white rounded-[8px] font-mono-tech font-extrabold uppercase tracking-wider text-sm transition-all"
          >
            <PhoneCall className="w-5 h-5" />
            Call Fire Service (101)
          </a>
          <a
            href="tel:100"
            className="flex items-center justify-center gap-3 py-4 px-4 bg-[#6B9FD4] hover:bg-[#5589c0] text-white rounded-[8px] font-mono-tech font-extrabold uppercase tracking-wider text-sm transition-all"
          >
            <PhoneCall className="w-5 h-5" />
            Call Police (100)
          </a>
        </div>
        <p className="text-[10px] text-[#A99BC9] font-mono-tech leading-relaxed">
          As soon as SOS status hits READY_TO_DIAL, your phone's native call app opens
          automatically with the number already filled in — you only tap the phone's own
          Call button. These buttons below are just a manual fallback if that didn't fire
          (e.g. desktop browser with no phone app, or blocked auto-navigation).
        </p>
      </div>
    </div>
  );
};
import { useEffect, useRef, useState } from 'react';
import { useEmergency } from '../context/EmergencyContext'; // adjust path if needed
import { SOSManager, SOSStatus } from '../sos/SOSManager';   // adjust path if needed

// ---- Tune these two lines to match your real data ----
const TEMPERATURE_THRESHOLD = 150; // fires if incident.temperature >= this (°F/°C — match your data)
const SEVERITY_TRIGGERS = ['high', 'critical']; // fires if incident.severity is one of these
// --------------------------------------------------------

interface UseSOSTriggerOptions {
  recipient?: string;      // who SOS is "sent" to, e.g. 'Emergency Services'
  soundDurationMs?: number; // matches SOSManager's constructor arg
}

/**
 * Watches state.incident from the existing EmergencyContext and fires
 * SOSManager.triggerSOS() the moment temperature/severity crosses the
 * configured threshold. Auto-resets so a later spike can re-trigger.
 *
 * Does not modify EmergencyContext, SOSManager, or any existing file —
 * just mount this hook (or the <SOSIndicator /> component below) wherever
 * you want the behavior active.
 */
export function useSOSTrigger(options: UseSOSTriggerOptions = {}) {
  const { recipient = 'Emergency Services', soundDurationMs = 8000 } = options;
  const { state } = useEmergency();

  // Stable SOSManager instance across renders
  const managerRef = useRef<SOSManager>(new SOSManager(soundDurationMs));
  const [sosStatus, setSosStatus] = useState<SOSStatus>(managerRef.current.getStatus());
  const hasTriggeredRef = useRef(false);

  useEffect(() => {
    // incident shape may vary — read defensively
    const incident = state.incident as unknown as {
      temperature?: number;
      severity?: string;
    };

    const temperature = incident?.temperature;
    const severity = incident?.severity;

    const temperatureBreached =
      typeof temperature === 'number' && temperature >= TEMPERATURE_THRESHOLD;
    const severityBreached =
      typeof severity === 'string' && SEVERITY_TRIGGERS.includes(severity.toLowerCase());

    const shouldTrigger = temperatureBreached || severityBreached;

    if (shouldTrigger && !hasTriggeredRef.current) {
      hasTriggeredRef.current = true;

      managerRef.current
        .triggerSOS({ recipient })
        .then(() => setSosStatus(managerRef.current.getStatus()))
        .catch((err) => {
          // triggerSOS throws if already active — safe to ignore here
          console.warn('SOS trigger skipped:', err?.message ?? err);
        });

      // Reflect the immediate "SOUNDING" status right away
      setSosStatus(managerRef.current.getStatus());
    }

    // If the incident clears, reset so a future spike can trigger again
    if (!shouldTrigger && hasTriggeredRef.current) {
      managerRef.current.reset();
      hasTriggeredRef.current = false;
      setSosStatus('IDLE');
    }
  }, [state.incident, recipient]);

  return {
    sosStatus,          // 'IDLE' | 'SOUNDING' | 'READY_TO_DIAL' | 'COMPLETED'
    manager: managerRef.current, // exposes completeSOS()/reset() if you need manual control
  };
}
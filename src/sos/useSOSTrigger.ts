import { useEffect, useRef, useState } from 'react';
import { useEmergency } from '../context/EmergencyContext'; // adjust path to match your project
import { SOSManager, SOSStatus } from './SOSManager';
import { ConsoleSOSDialer } from './ConsoleSOSDialer';

// ---- Tune these two lines to match your real data ----
const TEMPERATURE_THRESHOLD = 150; // fires if incident.temperature >= this
const SEVERITY_TRIGGERS = ['high', 'critical']; // fires if incident.severity is one of these
// --------------------------------------------------------

interface UseSOSTriggerOptions {
  recipient?: string;
  soundDurationMs?: number;
}

/**
 * Watches state.incident from your existing EmergencyContext/AgentRuntime.
 * When your fire simulation pushes severity/temperature past the threshold,
 * this fires SOSManager.triggerSOS() -> sounds -> dials, and exposes status
 * so you can show it in the UI. Fully self-contained, no existing files touched.
 */
export function useSOSTrigger(options: UseSOSTriggerOptions = {}) {
  const { recipient = 'Emergency Services', soundDurationMs = 8000 } = options;
  const { state } = useEmergency();

  const managerRef = useRef<SOSManager>(new SOSManager(soundDurationMs));
  const dialerRef = useRef(new ConsoleSOSDialer());
  const [sosStatus, setSosStatus] = useState<SOSStatus>(managerRef.current.getStatus());
  const hasTriggeredRef = useRef(false);

  useEffect(() => {
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

      (async () => {
        try {
          await managerRef.current.triggerSOS({ recipient });
          setSosStatus(managerRef.current.getStatus()); // READY_TO_DIAL

          const connected = await dialerRef.current.dial(recipient);
          if (connected) {
            managerRef.current.completeSOS();
            setSosStatus(managerRef.current.getStatus()); // COMPLETED
          }
        } catch (err: any) {
          console.warn('SOS trigger skipped:', err?.message ?? err);
        }
      })();

      setSosStatus(managerRef.current.getStatus()); // SOUNDING, immediately
    }

    // Reset when incident clears so a future spike can retrigger
    if (!shouldTrigger && hasTriggeredRef.current) {
      managerRef.current.reset();
      hasTriggeredRef.current = false;
      setSosStatus('IDLE');
    }
  }, [state.incident, recipient]);

  return {
    sosStatus, // 'IDLE' | 'SOUNDING' | 'READY_TO_DIAL' | 'COMPLETED'
    manager: managerRef.current,
  };
}
import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { useEmergency } from '../context/EmergencyContext'; // adjust path if needed
import { SOSManager, SOSStatus } from './SOSManager';
import { ConsoleSOSDialer } from './ConsoleSOSDialer';
import { playSirenSound } from './sirenSound';

// ---- Tune these to match your real data ----
const TEMPERATURE_THRESHOLD = 150; // fires if incident.temperature >= this
const SEVERITY_TRIGGERS = ['high', 'critical']; // fires if incident.severity is one of these
const SOUND_DURATION_MS = 7000; // 7 seconds, as requested
const RECIPIENT = 'Emergency Services';
// ----------------------------------------------

interface SOSContextType {
  sosStatus: SOSStatus; // 'IDLE' | 'SOUNDING' | 'READY_TO_DIAL' | 'COMPLETED'
  incidentDetectedAt: Date | null;
  sosTriggeredAt: Date | null;
  sosCompletedAt: Date | null;
}

const SOSContext = createContext<SOSContextType | null>(null);

/**
 * Wrap your app (inside EmergencyProvider) with this ONCE.
 * All components read SOS state via useSOS() — no duplicate managers,
 * no duplicate alarms, no duplicate dial attempts.
 */
export const SOSProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { state } = useEmergency();

  const managerRef = useRef(new SOSManager(SOUND_DURATION_MS));
  const dialerRef = useRef(new ConsoleSOSDialer());
  const hasTriggeredRef = useRef(false);

  const [sosStatus, setSosStatus] = useState<SOSStatus>('IDLE');
  const [incidentDetectedAt, setIncidentDetectedAt] = useState<Date | null>(null);
  const [sosTriggeredAt, setSosTriggeredAt] = useState<Date | null>(null);
  const [sosCompletedAt, setSosCompletedAt] = useState<Date | null>(null);

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

    if (shouldTrigger && !incidentDetectedAt) {
      setIncidentDetectedAt(new Date());
    }

    if (shouldTrigger && !hasTriggeredRef.current) {
      hasTriggeredRef.current = true;
      setSosTriggeredAt(new Date());

      // Play the audible siren for the same duration SOSManager sounds for
      playSirenSound(SOUND_DURATION_MS);

      (async () => {
        try {
          await managerRef.current.triggerSOS({ recipient: RECIPIENT });
          setSosStatus(managerRef.current.getStatus()); // READY_TO_DIAL

          const connected = await dialerRef.current.dial(RECIPIENT);
          if (connected) {
            managerRef.current.completeSOS();
            setSosStatus(managerRef.current.getStatus()); // COMPLETED
            setSosCompletedAt(new Date());
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
      setIncidentDetectedAt(null);
      setSosTriggeredAt(null);
      setSosCompletedAt(null);
    }
  }, [state.incident, incidentDetectedAt]);

  return (
    <SOSContext.Provider value={{ sosStatus, incidentDetectedAt, sosTriggeredAt, sosCompletedAt }}>
      {children}
    </SOSContext.Provider>
  );
};

export function useSOS(): SOSContextType {
  const ctx = useContext(SOSContext);
  if (!ctx) {
    throw new Error('useSOS must be used within an SOSProvider');
  }
  return ctx;
}
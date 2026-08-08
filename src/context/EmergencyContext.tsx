import React, { createContext, useContext, useEffect, useState } from 'react';
import { SharedEmergencyState } from '../lib/mock/emergencyScenario';
import { getAgentRuntime, AgentRuntime } from '../lib/ai';
import { PRIMARY_15_EVENTS, StructuredMockEvent } from '../lib/mock/mockEvents';

interface EmergencyContextType {
  state: SharedEmergencyState;
  runtime: AgentRuntime;
  eventQueue: StructuredMockEvent[];
  runScenario: () => void;
  pauseScenario: () => void;
  stepNext: () => void;
  resetScenario: () => void;
  injectOperatorIntervention: (instruction: string) => void;
  selectRole: (role: 'BUILDING_OPERATOR' | 'NETWORK_OPERATOR') => void;
  selectBuilding: (buildingId: string) => void;
}

const EmergencyContext = createContext<EmergencyContextType | null>(null);

export const EmergencyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const runtime = getAgentRuntime();
  const [state, setState] = useState<SharedEmergencyState>(runtime.getCurrentState());
  const [eventQueue, setEventQueue] = useState<StructuredMockEvent[]>(runtime.getEventHistory());

  useEffect(() => {
    const unsubscribe = runtime.subscribe((newState) => {
      setState(newState);
      setEventQueue([...runtime.getEventHistory()]);
    });
    return () => unsubscribe();
  }, [runtime]);

  const runScenario = () => runtime.runScenario();
  const pauseScenario = () => runtime.pauseScenario();
  const stepNext = () => runtime.stepNext();
  const resetScenario = () => runtime.resetScenario();
  const injectOperatorIntervention = (instruction: string) => runtime.injectOperatorIntervention(instruction);
  const selectRole = (role: 'BUILDING_OPERATOR' | 'NETWORK_OPERATOR') => runtime.selectRole(role);
  const selectBuilding = (buildingId: string) => runtime.selectBuilding(buildingId);

  return (
    <EmergencyContext.Provider
      value={{
        state,
        runtime,
        eventQueue,
        runScenario,
        pauseScenario,
        stepNext,
        resetScenario,
        injectOperatorIntervention,
        selectRole,
        selectBuilding,
      }}
    >
      {children}
    </EmergencyContext.Provider>
  );
};

export function useEmergency(): EmergencyContextType {
  const ctx = useContext(EmergencyContext);
  if (!ctx) {
    throw new Error('useEmergency must be used within an EmergencyProvider');
  }
  return ctx;
}

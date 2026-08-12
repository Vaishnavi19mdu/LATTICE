import { SharedEmergencyState, INITIAL_EMERGENCY_STATE, EventLogEntry } from '../mock/emergencyScenario';
import { StructuredMockEvent, PRIMARY_15_EVENTS } from '../mock/mockEvents';

export type StateChangeListener = (state: SharedEmergencyState) => void;

export interface InterventionConstraints {
  exits?: Partial<Record<'A' | 'B' | 'C', 'unsafe' | 'blocked' | 'available'>>;
}

export interface AgentRuntime {
  getCurrentState(): SharedEmergencyState;
  subscribe(listener: StateChangeListener): () => void;
  runScenario(): void;
  pauseScenario(): void;
  stepNext(): void;
  resetScenario(): void;
  restartCurrentScenario(): void; // replay same scenario from event 0
  injectOperatorIntervention(instruction: string, constraints?: InterventionConstraints): void;
  selectRole(role: 'BUILDING_OPERATOR' | 'NETWORK_OPERATOR'): void;
  selectBuilding(buildingId: string): void;
  getEventHistory(): StructuredMockEvent[];
}

/** Milliseconds between auto-advanced steps while playbackMode === 'LIVE'. */
const STEP_INTERVAL_MS = 2600;

/**
 * Default, concrete implementation of AgentRuntime. Drives the 15-step
 * PRIMARY_15_EVENTS timeline against SharedEmergencyState, one event at a
 * time, either automatically (runScenario) or manually (stepNext).
 *
 * This intentionally stays independent of any live AI provider — it is the
 * mock/demo simulation engine that EmergencyContext / the dashboards render
 * against. A future live-agent runtime can implement the same AgentRuntime
 * interface and be swapped in via getAgentRuntime() without touching any
 * consuming component.
 */
class DefaultAgentRuntime implements AgentRuntime {
  private state: SharedEmergencyState;
  private readonly events: StructuredMockEvent[];
  private readonly processedEvents: StructuredMockEvent[] = [];
  private listeners: Set<StateChangeListener> = new Set();
  private timer: ReturnType<typeof setInterval> | null = null;

  constructor(events: StructuredMockEvent[] = PRIMARY_15_EVENTS) {
    this.events = events;
    this.state = { ...INITIAL_EMERGENCY_STATE, totalSteps: events.length };
  }

  getCurrentState(): SharedEmergencyState {
    return this.state;
  }

  subscribe(listener: StateChangeListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  getEventHistory(): StructuredMockEvent[] {
    return this.processedEvents;
  }

  runScenario(): void {
    if (this.timer) return; // already running
    this.setState({ playbackMode: 'LIVE' });
    this.timer = setInterval(() => {
      const advanced = this.advanceOneStep();
      if (!advanced) {
        this.stopTimer();
        this.setState({ playbackMode: 'PAUSED' });
      }
    }, STEP_INTERVAL_MS);
    // Kick off the first step immediately rather than waiting a full interval.
    if (this.state.activeStepIndex === 0 && this.processedEvents.length === 0) {
      this.advanceOneStep();
    }
  }

  pauseScenario(): void {
    this.stopTimer();
    this.setState({ playbackMode: 'PAUSED' });
  }

  stepNext(): void {
    this.stopTimer();
    this.setState({ playbackMode: 'STEP' });
    this.advanceOneStep();
  }

  resetScenario(): void {
    this.stopTimer();
    this.processedEvents.length = 0;
    this.state = { ...INITIAL_EMERGENCY_STATE, totalSteps: this.events.length };
    this.notify();
  }

  restartCurrentScenario(): void {
    // Same event timeline, replayed from the top.
    this.resetScenario();
  }

  injectOperatorIntervention(instruction: string, constraints?: InterventionConstraints): void {
    const exitUpdates = constraints?.exits ?? {};
    this.setState({
      operatorIntervention: instruction,
      currentActivity: `Human operator instruction received: "${instruction}"`,
      exits: { ...this.state.exits, ...exitUpdates },
    });
  }

  selectRole(role: 'BUILDING_OPERATOR' | 'NETWORK_OPERATOR'): void {
    this.setState({ selectedRole: role });
  }

  selectBuilding(buildingId: string): void {
    this.setState({ activeBuildingId: buildingId });
  }

  /** Applies the next unprocessed event's stateUpdates. Returns false if none remain. */
  private advanceOneStep(): boolean {
    const nextIndex = this.processedEvents.length;
    const event = this.events[nextIndex];
    if (!event) return false;

    this.processedEvents.push(event);

    const resolvedUpdates: Partial<SharedEmergencyState> =
      typeof event.stateUpdates === 'function' ? event.stateUpdates(this.state) : event.stateUpdates ?? {};

    const logEntry: EventLogEntry = {
      id: event.id,
      eventIndex: event.eventIndex,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      senderId: event.fromAgentId,
      senderName: event.fromAgentName,
      senderIcon: event.fromIcon,
      receiverId: event.toAgentId,
      receiverName: event.toAgentName,
      type: event.type,
      message: event.message,
      status: 'DELIVERED',
    };

    this.setState({
      ...resolvedUpdates,
      activeStepIndex: nextIndex + 1,
      currentActiveAgentId: event.fromAgentId,
      currentReceiverAgentId: event.toAgentId,
      currentStage: 'DELIVERED',
      agentStates: {
        ...this.state.agentStates,
        ...(resolvedUpdates.agentStates ?? {}),
        [event.fromAgentId]: 'sending',
        [event.toAgentId]: 'receiving',
      },
      eventLogs: [...this.state.eventLogs, logEntry],
    });

    return true;
  }

  private stopTimer(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  private setState(partial: Partial<SharedEmergencyState>): void {
    this.state = { ...this.state, ...partial };
    this.notify();
  }

  private notify(): void {
    this.listeners.forEach((listener) => listener(this.state));
  }
}

let cachedRuntime: AgentRuntime | null = null;

/**
 * Returns the singleton AgentRuntime used by EmergencyContext and every
 * dashboard that consumes it. Always the same instance within a session so
 * state stays in sync across components.
 */
export function getAgentRuntime(): AgentRuntime {
  if (!cachedRuntime) {
    cachedRuntime = new DefaultAgentRuntime(PRIMARY_15_EVENTS);
  }
  return cachedRuntime;
}
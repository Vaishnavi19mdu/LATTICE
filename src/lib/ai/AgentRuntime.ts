import { SharedEmergencyState, INITIAL_EMERGENCY_STATE, EventLogEntry } from '../mock/emergencyScenario';
import { StructuredMockEvent, PRIMARY_15_EVENTS } from '../mock/mockEvents';
// Single entry point for AI providers, per lib/ai/index.ts's own contract
// ("never import GroqProvider directly elsewhere"). Safe despite the
// circular reference back to this file (index.ts re-exports
// getAgentRuntime) because getAIProvider is only ever *called* lazily,
// inside injectOperatorIntervention — never at module-evaluation time —
// so both modules are fully initialized by the time it's invoked.
import { getAIProvider } from '../ai';

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

/** Cap on how much of a live AI response becomes the feed "message" bubble
 *  before the reader needs the full reasoning summary — keeps the
 *  conversation feed scannable even when Groq returns a long paragraph. */
const HEADLINE_MAX_CHARS = 140;

/**
 * Default, concrete implementation of AgentRuntime. Drives the 15-step
 * PRIMARY_15_EVENTS timeline against SharedEmergencyState, one event at a
 * time, either automatically (runScenario) or manually (stepNext).
 *
 * Human operator interventions are handled as first-class, *live* events
 * rather than silent state patches: injectOperatorIntervention splices two
 * new entries into the timeline — the operator's own directive, and a
 * "Coordinator thinking" placeholder — processes them immediately so they
 * show up in the feed/audit log right away, then asynchronously calls the
 * configured AI provider (Groq, via getAIProvider() — falls back to a mock
 * response automatically if no key is configured or the call fails) and
 * fills the placeholder in with the real reasoning once it resolves. This
 * genuinely grows eventQueue/eventLogs instead of just replaying static
 * copy, while staying independent of any specific AI provider — a future
 * live-agent runtime can still implement the same AgentRuntime interface
 * and be swapped in via getAgentRuntime() without touching consumers.
 */
class DefaultAgentRuntime implements AgentRuntime {
  private state: SharedEmergencyState;
  /** Pristine copy of the scripted timeline, restored on reset — `events`
   *  itself is mutated (spliced into) as operator interventions land. */
  private readonly originalEvents: StructuredMockEvent[];
  private events: StructuredMockEvent[];
  private readonly processedEvents: StructuredMockEvent[] = [];
  private listeners: Set<StateChangeListener> = new Set();
  private timer: ReturnType<typeof setInterval> | null = null;
  private interventionSeq = 0;

  constructor(events: StructuredMockEvent[] = PRIMARY_15_EVENTS) {
    this.originalEvents = events;
    this.events = [...events];
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
    this.events = [...this.originalEvents];
    this.interventionSeq = 0;
    this.state = { ...INITIAL_EMERGENCY_STATE, totalSteps: this.originalEvents.length };
    this.notify();
  }

  restartCurrentScenario(): void {
    // Same event timeline, replayed from the top.
    this.resetScenario();
  }

  /**
   * Processes the operator's directive as a real, visible event right
   * away, then asynchronously resolves the Coordinator's live reply
   * (Groq-backed, mock-fallback otherwise) and fills it in once ready.
   * Both stages grow eventQueue/eventLogs — this is not a state patch.
   */
  injectOperatorIntervention(instruction: string, constraints?: InterventionConstraints): void {
    const operatorEvent = this.buildOperatorEvent(instruction, constraints);
    this.insertAndProcessEvent(operatorEvent);

    const thinkingEvent = this.buildCoordinatorThinkingEvent();
    this.insertAndProcessEvent(thinkingEvent);
    this.setState({ currentStage: 'THINKING' });

    void this.resolveCoordinatorResponse(instruction, constraints, thinkingEvent.id);
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

  /** Splices a dynamically-built event into the timeline at the position
   *  the next scripted event would occupy, then processes it immediately
   *  — so operator-triggered events jump the queue instead of waiting
   *  behind any remaining scripted steps. */
  private insertAndProcessEvent(event: StructuredMockEvent): void {
    const insertIndex = this.processedEvents.length;
    this.events.splice(insertIndex, 0, event);
    this.advanceOneStep();
  }

  private nextInterventionEventIndex(): number {
    // Keep eventIndex monotonically increasing across the whole timeline
    // (scripted + intervention-generated), matching how the UI's
    // "EVENT #N" badges are meant to read.
    return this.events.length + 1;
  }

  private buildOperatorEvent(instruction: string, constraints?: InterventionConstraints): StructuredMockEvent {
    this.interventionSeq += 1;
    const exitUpdates = constraints?.exits ?? {};

    return {
      id: `operator-${Date.now()}-${this.interventionSeq}`,
      eventIndex: this.nextInterventionEventIndex(),
      fromAgentId: 'HUMAN_OPERATOR',
      fromAgentName: 'LATTICE Operator',
      fromIcon: '👤',
      toAgentId: 'agent_coordinator',
      toAgentName: 'Emergency Coordinator',
      toIcon: '🧠',
      type: 'operator_intervention',
      topic: 'HUMAN_OVERRIDE_DIRECTIVE',
      message: instruction,
      thinkingText: 'Human operator issuing explicit directive via control console...',
      isInterrupt: true,
      task: 'Processing human operator intervention constraint',
      inputs: { 'Operator Directive': instruction, Authority: 'HUMAN_IN_THE_LOOP' },
      capabilitiesUsed: ['human_in_the_loop_override'],
      reasoningSummary: `Human operator issued a live directive: "${instruction}". Routing to Emergency Coordinator for real-time reassessment.`,
      nextAction: 'Await Coordinator directive integration',
      stateUpdates: {
        operatorIntervention: instruction,
        currentActivity: `Human operator instruction received: "${instruction}"`,
        exits: { ...this.state.exits, ...exitUpdates },
      },
    };
  }

  /** Placeholder event pushed immediately so the feed shows the Coordinator
   *  "thinking" right away; finalizePendingEvent mutates this same entry
   *  in place once the live AI response resolves. */
  private buildCoordinatorThinkingEvent(): StructuredMockEvent {
    this.interventionSeq += 1;

    return {
      id: `coordinator-live-${Date.now()}-${this.interventionSeq}`,
      eventIndex: this.nextInterventionEventIndex(),
      fromAgentId: 'agent_coordinator',
      fromAgentName: 'Emergency Coordinator',
      fromIcon: '🧠',
      toAgentId: 'OPERATOR_CONSOLE',
      toAgentName: 'LATTICE Operator Console',
      toIcon: '💻',
      type: 'operator_instruction_applied',
      topic: 'DIRECTIVE_INTEGRATION_RESPONSE',
      message: 'Analyzing directive against live incident graph…',
      thinkingText: 'Reasoning over updated hazard, occupancy, and route data in light of the operator directive...',
      task: 'Generating live directive-integration response',
      inputs: { 'Rule Source': 'OPERATOR', Status: 'PROCESSING' },
      capabilitiesUsed: ['resolve_conflicts', 'synthesize_plan'],
      reasoningSummary: 'Awaiting live agent reasoning...',
      nextAction: 'Deliver updated response plan to operator console',
      stateUpdates: {
        currentActivity: 'Emergency Coordinator evaluating operator directive...',
      },
    };
  }

  /** Calls the live AI provider (Groq, or its mock fallback — see
   *  getAIProvider()) for the Coordinator's real response to the
   *  directive, then fills in the placeholder event with it. Never
   *  throws: provider/network failures fall back to a deterministic
   *  canned response so the sim never gets stuck mid-"thinking". */
  private async resolveCoordinatorResponse(
    instruction: string,
    constraints: InterventionConstraints | undefined,
    pendingEventId: string
  ): Promise<void> {
    let responseText: string;

    try {
      const provider = getAIProvider();
      responseText = await provider.generateAgentResponse('agent_coordinator', instruction, {
        role: 'Emergency Coordinator',
        directive: instruction,
        appliedConstraints: constraints ?? {},
        incident: this.state.incident,
        exits: this.state.exits,
        occupancy: this.state.occupancy,
        responsePlan: this.state.responsePlan,
      });
    } catch {
      responseText = this.buildFallbackCoordinatorResponse(instruction, constraints);
    }

    this.finalizePendingEvent(pendingEventId, responseText);
  }

  private buildFallbackCoordinatorResponse(instruction: string, constraints?: InterventionConstraints): string {
    const blockedExits = Object.entries(constraints?.exits ?? {})
      .filter(([, status]) => status !== 'available')
      .map(([exit]) => `Exit ${exit}`);
    const exitNote = blockedExits.length ? ` ${blockedExits.join(', ')} now excluded from the route set.` : '';

    return `Directive acknowledged: "${instruction}".${exitNote} Recalculating response plan against current hazard and occupancy data.`;
  }

  /** Mutates the already-processed placeholder event and its matching
   *  audit-log entry in place with the resolved response text, then
   *  clears the THINKING stage. No-ops safely if the scenario was reset
   *  while the AI call was still in flight. */
  private finalizePendingEvent(pendingEventId: string, responseText: string): void {
    const idx = this.processedEvents.findIndex((e) => e.id === pendingEventId);
    if (idx === -1) return;

    const summary = responseText.trim();
    const headline = summary.length > HEADLINE_MAX_CHARS ? `${summary.slice(0, HEADLINE_MAX_CHARS - 3)}...` : summary;

    this.processedEvents[idx] = {
      ...this.processedEvents[idx],
      message: headline,
      reasoningSummary: summary,
    };

    const logIdx = this.state.eventLogs.findIndex((log) => log.id === pendingEventId);
    const eventLogs = [...this.state.eventLogs];
    if (logIdx !== -1) {
      eventLogs[logIdx] = { ...eventLogs[logIdx], message: headline };
    }

    this.setState({
      eventLogs,
      currentStage: 'DELIVERED',
      currentActivity: 'Coordinator directive-integration response delivered',
    });
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
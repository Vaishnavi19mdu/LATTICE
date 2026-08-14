import { SharedEmergencyState, INITIAL_EMERGENCY_STATE, EventLogEntry, ResponsePlanState } from '../mock/emergencyScenario';
import { StructuredMockEvent, PRIMARY_15_EVENTS } from '../mock/mockEvents';
import { MOCK_AGENTS } from '../mock/mockAgents';
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
  getEventQueue(): StructuredMockEvent[];
}

/** Milliseconds between auto-advanced steps while playbackMode === 'LIVE'. */
const STEP_INTERVAL_MS = 2600;

/** Cap on how much of a live AI response becomes the feed "message" bubble
 *  before the reader needs the full reasoning summary — keeps the
 *  conversation feed scannable even when Groq returns a long paragraph. */
const HEADLINE_MAX_CHARS = 140;

/**
 * Canned per-agent copy for the reassessment cascade an operator directive
 * triggers. Kept scripted (not AI-generated) so the cascade renders
 * instantly — only the Coordinator's final synthesis actually calls out to
 * Groq, once, after it has every agent's reassessment to work from.
 */
const REASSESSMENT_COPY: Record<
  string,
  { task: string; message: string; reasoning: string; nextAction: string }
> = {
  agent_security: {
    task: 'Re-verifying access/lock status for the exits named in the new directive',
    message: 'Re-checking CCTV and door-lock telemetry against the new directive.',
    reasoning:
      "Cross-referencing the operator's directive against live door-lock and camera feeds to confirm the requested route change is physically safe before the Coordinator commits to it.",
    nextAction: 'Report verified route status to Coordinator',
  },
  agent_occupancy: {
    task: 'Recomputing occupant flow against the revised route set',
    message: 'Recalculating occupant flow for the updated route.',
    reasoning:
      "Re-running badge-census flow projections against the directive-adjusted exit set to confirm the new route has enough capacity for current floor occupancy.",
    nextAction: 'Send updated flow projection to Coordinator',
  },
  agent_ethical_priority: {
    task: 'Reassessing mobility-assistance dispatch under the new routing',
    message: 'Reassessing assistance dispatch for the updated route.',
    reasoning:
      "Recalculating equity-weighted dispatch priority so mobility-support occupants are escorted consistently with the operator's directive.",
    nextAction: 'Confirm assistance routing to Coordinator',
  },
  agent_cross_building: {
    task: 'Reassessing cross-building isolation posture',
    message: 'Reassessing mutual-aid and damper posture per the new directive.',
    reasoning:
      "Checking whether the directive changes concourse isolation requirements or affects the mutual-aid alert already sent to neighboring buildings.",
    nextAction: 'Confirm isolation status to Coordinator',
  },
  agent_fire_hazard: {
    task: 'Re-checking hazard telemetry against the revised route',
    message: 'Re-checking hazard telemetry along the revised route.',
    reasoning:
      "Confirming the directive-adjusted route doesn't pass closer to the active hazard zone than the current thermal and smoke readings allow.",
    nextAction: 'Report hazard proximity status to Coordinator',
  },
  default: {
    task: 'Reassessing telemetry against the new operator directive',
    message: 'Reassessing telemetry against the new directive.',
    reasoning: 'Re-evaluating current readings in light of the operator directive before reporting back to the Coordinator.',
    nextAction: 'Report findings to Coordinator',
  },
};

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

  /**
   * Full event timeline: already-delivered events (with their eventIndex
   * corrected to reflect real playback order) followed by whatever hasn't
   * been reached yet — remaining scripted steps for now, since operator
   * interventions are processed the instant they're spliced in.
   *
   * This MUST be longer than processedEvents while the scenario is still
   * running, or the UI breaks: activeStepIndex is always set to
   * processedEvents.length right after every step, so if this returned
   * processedEvents directly, currentStepIndex and eventQueue.length would
   * be the exact same number by construction — the "EVENT X / Y" counter
   * could only ever render X / X, never show real progress.
   */
  getEventQueue(): StructuredMockEvent[] {
    return [...this.processedEvents, ...this.events.slice(this.processedEvents.length)];
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
   * away, then walks it through a full reassessment cascade — every agent
   * whose domain the directive touches (exits, occupancy flow, assistance
   * dispatch, cross-building posture, hazard proximity) re-checks its own
   * data and reports back, *before* the Coordinator makes its final call.
   * The Coordinator's Groq request is built from all of those findings,
   * not just the raw instruction, so "use exit B" actually gets weighed
   * against verified lock/CCTV status, occupant flow, etc. — not just
   * echoed back. Every stage is a real event, so a single intervention can
   * genuinely grow the timeline by several steps (not a fixed +2), and the
   * revised response plan (safe/blocked routes) is republished at the end
   * so Decision Control reflects the outcome too.
   */
  injectOperatorIntervention(instruction: string, constraints?: InterventionConstraints): void {
    // Temporary diagnostic log — confirms the call is actually reaching the
    // runtime at all. Remove once intervention is confirmed working.
    console.log('[AgentRuntime] injectOperatorIntervention called with:', instruction, constraints);

    try {
      const operatorEvent = this.buildOperatorEvent(instruction, constraints);
      this.insertAndProcessEvent(operatorEvent);

      const reassessingAgents = this.determineReassessingAgents(instruction, constraints);
      for (const agentId of reassessingAgents) {
        this.insertAndProcessEvent(this.buildAgentReassessmentEvent(agentId, instruction, constraints));
      }

      const thinkingEvent = this.buildCoordinatorThinkingEvent();
      this.insertAndProcessEvent(thinkingEvent);
      this.setState({ currentStage: 'THINKING' });

      void this.resolveCoordinatorResponse(instruction, constraints, thinkingEvent.id, reassessingAgents).catch(
        (err) => console.error('[AgentRuntime] resolveCoordinatorResponse rejected:', err)
      );
    } catch (err) {
      // A thrown error here (e.g. a bad import, undefined lookup) would
      // otherwise vanish silently from the caller's point of view — the
      // click handler doesn't await or catch anything, so React never
      // surfaces it. Logging explicitly is the only way to see it.
      console.error('[AgentRuntime] injectOperatorIntervention threw:', err);
    }
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
    const rawEvent = this.events[nextIndex];
    if (!rawEvent) return false;

    // Always derive eventIndex from the event's real position in the
    // timeline at the moment it's processed, never trust a value baked in
    // at creation time. Operator interventions splice new events into the
    // *middle* of the queue (ahead of any remaining scripted steps), so a
    // pre-assigned eventIndex goes stale the instant that happens — the
    // "EVENT #N" badges would otherwise jump forward then fall backward.
    const event: StructuredMockEvent = { ...rawEvent, eventIndex: nextIndex + 1 };

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
    // The timeline just grew, so the total step count the UI shows
    // ("EVENT X / Y") needs to grow with it, not stay pinned at whatever
    // the original scripted scenario length was.
    this.setState({ totalSteps: this.events.length });
    this.advanceOneStep();
  }

  private buildOperatorEvent(instruction: string, constraints?: InterventionConstraints): StructuredMockEvent {
    this.interventionSeq += 1;
    const exitUpdates = constraints?.exits ?? {};

    return {
      id: `operator-${Date.now()}-${this.interventionSeq}`,
      // Placeholder — advanceOneStep() overwrites this with the event's
      // real position in the timeline the moment it's processed.
      eventIndex: -1,
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

  /** Decides which agents a directive actually touches, so the cascade
   *  reflects the directive's real content instead of always pinging
   *  every agent regardless of relevance. Falls back to Security so a
   *  directive with no clear domain still visibly ripples through the mesh. */
  private determineReassessingAgents(instruction: string, constraints?: InterventionConstraints): string[] {
    const lower = instruction.toLowerCase();
    const agents: string[] = [];

    if (constraints?.exits && Object.keys(constraints.exits).length > 0) {
      agents.push('agent_security', 'agent_occupancy', 'agent_fire_hazard');
    }
    if ((lower.includes('exit') || lower.includes('route') || lower.includes('stairwell')) && !agents.includes('agent_security')) {
      agents.push('agent_security');
    }
    if (this.state.occupancy.assistanceRequired > 0 && (lower.includes('mobility') || lower.includes('assist') || agents.length > 0)) {
      agents.push('agent_ethical_priority');
    }
    if (lower.includes('concourse') || lower.includes('building b') || lower.includes('cross') || lower.includes('isolate')) {
      agents.push('agent_cross_building');
    }

    const unique = Array.from(new Set(agents));
    return unique.length > 0 ? unique : ['agent_security'];
  }

  private buildAgentReassessmentEvent(
    agentId: string,
    instruction: string,
    constraints?: InterventionConstraints
  ): StructuredMockEvent {
    this.interventionSeq += 1;
    const meta = MOCK_AGENTS[agentId];
    const copy = REASSESSMENT_COPY[agentId] ?? REASSESSMENT_COPY.default;
    const exitNotes = Object.entries(constraints?.exits ?? {})
      .map(([exit, status]) => `Exit ${exit} → ${String(status).toUpperCase()}`)
      .join(', ');

    return {
      id: `reassess-${agentId}-${Date.now()}-${this.interventionSeq}`,
      // Placeholder — advanceOneStep() overwrites this with the event's
      // real position in the timeline the moment it's processed.
      eventIndex: -1,
      fromAgentId: agentId,
      fromAgentName: meta?.name ?? agentId,
      fromIcon: meta?.icon ?? '🤖',
      toAgentId: 'agent_coordinator',
      toAgentName: 'Emergency Coordinator',
      toIcon: '🧠',
      type: 'directive_reassessment',
      topic: 'DIRECTIVE_TRIGGERED_REASSESSMENT',
      message: copy.message,
      thinkingText: `Re-evaluating ${meta?.role ?? 'assigned telemetry'} against the new operator directive...`,
      task: copy.task,
      inputs: {
        'Operator Directive': instruction,
        ...(exitNotes ? { 'Exit Changes': exitNotes } : {}),
      },
      capabilitiesUsed: meta?.capabilities ?? [],
      reasoningSummary: copy.reasoning,
      nextAction: copy.nextAction,
    };
  }

  /** Placeholder event pushed immediately so the feed shows the Coordinator
   *  "thinking" right away; finalizePendingEvent mutates this same entry
   *  in place once the live AI response resolves. */
  private buildCoordinatorThinkingEvent(): StructuredMockEvent {
    this.interventionSeq += 1;

    return {
      id: `coordinator-live-${Date.now()}-${this.interventionSeq}`,
      // Placeholder — advanceOneStep() overwrites this with the event's
      // real position in the timeline the moment it's processed.
      eventIndex: -1,
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
   *  directive, now informed by what every reassessing agent reported
   *  back, then fills in the placeholder event with it and publishes the
   *  revised response plan. Never throws: provider/network failures fall
   *  back to a deterministic canned response so the sim never gets stuck
   *  mid-"thinking". */
  private async resolveCoordinatorResponse(
    instruction: string,
    constraints: InterventionConstraints | undefined,
    pendingEventId: string,
    reassessingAgents: string[]
  ): Promise<void> {
    let responseText: string;

    try {
      const provider = getAIProvider();
      // provider.generateAgentResponse() never throws when no API key is
      // configured — GroqProvider resolves with a generic, instruction-
      // agnostic MOCK_RESPONSE string instead. A try/catch alone can't
      // detect that, so every intervention would get the exact same
      // boilerplate text regardless of what was typed. Checking
      // isAvailable() first routes unconfigured mode to our own
      // buildFallbackCoordinatorResponse(), which actually quotes the
      // directive and names which exits were blocked.
      if (!provider.isAvailable()) {
        responseText = this.buildFallbackCoordinatorResponse(instruction, constraints);
      } else {
        responseText = await provider.generateAgentResponse('agent_coordinator', instruction, {
          role: 'Emergency Coordinator',
          directive: instruction,
          appliedConstraints: constraints ?? {},
          // Names of agents that already re-checked their own domain
          // against this directive — gives Groq real findings to
          // synthesize instead of just paraphrasing the raw instruction.
          reassessingAgents: reassessingAgents.map((id) => MOCK_AGENTS[id]?.name ?? id),
          incident: this.state.incident,
          exits: this.state.exits,
          occupancy: this.state.occupancy,
          responsePlan: this.state.responsePlan,
        });
      }
    } catch {
      responseText = this.buildFallbackCoordinatorResponse(instruction, constraints);
    }

    this.finalizePendingEvent(pendingEventId, responseText);
    this.publishUpdatedResponsePlan(instruction);
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

  /** Closing step of the intervention cascade: recomputes safe/blocked
   *  routes from the (possibly directive-updated) exits, updates
   *  state.responsePlan so Decision Control reflects the new plan, and
   *  publishes it as a real, visible event rather than a silent patch. */
  private publishUpdatedResponsePlan(instruction: string): void {
    const exitEntries = Object.entries(this.state.exits) as [string, string][];
    const safeRoutes = exitEntries.filter(([, status]) => status === 'available').map(([exit]) => `Exit ${exit}`);
    const blockedRoutes = exitEntries.filter(([, status]) => status !== 'available').map(([exit]) => `Exit ${exit}`);

    const updatedPlan: ResponsePlanState = {
      emergencyLevel: this.state.responsePlan?.emergencyLevel ?? 'HIGH',
      safeRoutes,
      blockedRoutes,
      recommendedActions: [
        `Route occupants via ${safeRoutes[0] ?? 'the nearest verified-safe exit'} per updated operator directive.`,
        ...(this.state.responsePlan?.recommendedActions ?? []).filter(
          (action) => !action.startsWith('Route occupants via')
        ),
      ],
      humanDecision: this.state.responsePlan?.humanDecision ?? null,
    };

    this.setState({ responsePlan: updatedPlan });
    this.insertAndProcessEvent(this.buildResponsePlanEvent(instruction, updatedPlan));
  }

  private buildResponsePlanEvent(instruction: string, plan: ResponsePlanState): StructuredMockEvent {
    this.interventionSeq += 1;

    return {
      id: `plan-${Date.now()}-${this.interventionSeq}`,
      // Placeholder — advanceOneStep() overwrites this with the event's
      // real position in the timeline the moment it's processed.
      eventIndex: -1,
      fromAgentId: 'agent_coordinator',
      fromAgentName: 'Emergency Coordinator',
      fromIcon: '🧠',
      toAgentId: 'OPERATOR_CONSOLE',
      toAgentName: 'LATTICE Operator Console',
      toIcon: '💻',
      type: 'response_plan_generated',
      topic: 'DIRECTIVE_REVISED_RESPONSE_PLAN',
      message: `Response plan revised: ${plan.safeRoutes.join(', ') || 'no safe routes remain'} now recommended.`,
      thinkingText: 'Compiling revised response plan incorporating the operator directive and agent reassessments...',
      task: 'Publishing directive-revised response plan',
      inputs: {
        'Safe Routes': plan.safeRoutes.join(', ') || 'None',
        'Blocked Routes': plan.blockedRoutes.join(', ') || 'None',
      },
      capabilitiesUsed: ['synthesize_plan', 'present_to_human'],
      reasoningSummary: `Response plan recalculated in light of the operator directive: "${instruction}". Safe routes: ${
        plan.safeRoutes.join(', ') || 'none remaining'
      }. Blocked: ${plan.blockedRoutes.join(', ') || 'none'}.`,
      nextAction: 'Await operator review of revised plan',
    };
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
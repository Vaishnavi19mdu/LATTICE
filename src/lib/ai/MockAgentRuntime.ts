import { AgentRuntime, StateChangeListener, InterventionConstraints } from './AgentRuntime';
import { SharedEmergencyState, EventLogEntry } from '../mock/emergencyScenario';
import { StructuredMockEvent } from '../mock/mockEvents';
import { getRandomScenario } from '../mock/scenarioPresets';
import { computeResponsePlan } from '../interoperability/responsePlanEngine';

function constraintsExitsPatch(
  merged: SharedEmergencyState['exits'],
  before: SharedEmergencyState['exits']
): Record<string, string> {
  const diff: Record<string, string> = {};
  (Object.entries(merged) as [string, string][]).forEach(([k, v]) => {
    if (((before as unknown) as Record<string, string>)[k] !== v) diff[k] = v;
  });
  return diff;
}

export class MockAgentRuntimeImpl implements AgentRuntime {
  private state: SharedEmergencyState;
  private listeners: Set<StateChangeListener> = new Set();
  private timer: any = null;
  private customEventsQueue: StructuredMockEvent[];

  constructor() {
    const { initialState, events } = getRandomScenario();
    this.state = initialState;
    this.customEventsQueue = events;
    this.state.responsePlan = computeResponsePlan(this.state);
  }

  public getCurrentState(): SharedEmergencyState {
    return { ...this.state };
  }

  public subscribe(listener: StateChangeListener): () => void {
    this.listeners.add(listener);
    listener(this.getCurrentState());
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    const copy = this.getCurrentState();
    this.listeners.forEach((listener) => listener(copy));
  }

  public selectRole(role: 'BUILDING_OPERATOR' | 'NETWORK_OPERATOR'): void {
    this.state.selectedRole = role;
    this.notify();
  }

  public selectBuilding(buildingId: string): void {
    this.state.activeBuildingId = buildingId;
    this.notify();
  }

  public getEventHistory(): StructuredMockEvent[] {
    return this.customEventsQueue;
  }

  public runScenario(): void {
    if (this.state.activeStepIndex >= this.customEventsQueue.length) {
      this.state.activeStepIndex = 0;
      this.state.eventLogs = [];
    }
    this.state.playbackMode = 'LIVE';
    if (this.state.currentStage === 'IDLE' || this.state.currentStage === 'DELIVERED') {
      this.startCurrentStepLifecycle();
    }
    this.notify();
  }

  public pauseScenario(): void {
    this.clearTimer();
    this.state.playbackMode = 'PAUSED';
    this.notify();
  }

  public stepNext(): void {
    this.clearTimer();
    this.state.playbackMode = 'STEP';
    this.advanceStepOnce();
  }

  public resetScenario(): void {
    this.clearTimer();
    const preservedRole = this.state.selectedRole;
    const preservedBuilding = this.state.activeBuildingId;
    const { initialState, events } = getRandomScenario();
    this.customEventsQueue = events;
    this.state = {
      ...initialState,
      eventLogs: [],
      selectedRole: preservedRole,
      activeBuildingId: preservedBuilding,
    };
    this.state.responsePlan = computeResponsePlan(this.state);
    this.notify();
  }

  public restartCurrentScenario(): void {
    this.clearTimer();

    // Reset playback position and logs, but keep the SAME events/scenario data
    this.state.activeStepIndex = 0;
    this.state.eventLogs = [];
    this.state.currentStage = 'IDLE';
    this.state.playbackMode = 'PAUSED';
    this.state.currentActiveAgentId = null as any;
    this.state.currentReceiverAgentId = null as any;
    this.state.currentActivity = 'Idle';
    this.state.operatorIntervention = null;

    const resetAgentStates: Record<string, any> = {};
    Object.keys(this.state.agentStates).forEach((agentId) => {
      resetAgentStates[agentId] = 'idle';
    });
    this.state.agentStates = resetAgentStates;

    this.state.responsePlan = computeResponsePlan(this.state);

    this.notify();
  }

  public injectOperatorIntervention(instruction: string, constraints?: InterventionConstraints): void {
    if (!instruction.trim()) return;

    const mergedExits: SharedEmergencyState['exits'] | undefined = constraints?.exits
      ? { ...this.state.exits, ...constraints.exits }
      : undefined;

    if (mergedExits) {
      this.state.exits = mergedExits;
    }

    // Recompute now so the reasoning chain below can reference real, current numbers.
    const newPlan = computeResponsePlan(this.state);
    this.state.responsePlan = newPlan;

    const chain = this.buildInterventionChain(instruction, mergedExits, newPlan);

    this.customEventsQueue.splice(this.state.activeStepIndex, 0, ...chain);
    this.renumberEventsFrom(this.state.activeStepIndex);
    this.state.totalSteps = this.customEventsQueue.length;

    this.state.playbackMode = 'LIVE';
    this.startCurrentStepLifecycle();
  }

  private renumberEventsFrom(startIdx: number): void {
    for (let i = startIdx; i < this.customEventsQueue.length; i++) {
      this.customEventsQueue[i] = { ...this.customEventsQueue[i], eventIndex: i + 1 };
    }
  }

  /**
   * Builds a multi-step reaction chain instead of a single inert event. Every field below is
   * derived from live state (this.state.exits / occupancy / newPlan) at the moment of injection,
   * so re-running the same instruction under different conditions produces different text.
   */
  private buildInterventionChain(
    instruction: string,
    mergedExits: SharedEmergencyState['exits'] | undefined,
    newPlan: SharedEmergencyState['responsePlan']
  ): StructuredMockEvent[] {
    const ts = () => `${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    const exitsSnapshot = mergedExits || this.state.exits;
    const availableExits = (Object.entries(exitsSnapshot) as [string, string][])
      .filter(([, status]) => status === 'available')
      .map(([id]) => `Exit ${id}`);
    const blockedExits = (Object.entries(exitsSnapshot) as [string, string][])
      .filter(([, status]) => status === 'unsafe' || status === 'checking')
      .map(([id]) => `Exit ${id}`);

    const occ = this.state.occupancy;
    const occLine = occ
      ? `${occ.total} occupants (${occ.assistanceRequired} requiring assistance)`
      : 'occupancy telemetry unavailable';

    const operatorEvt: StructuredMockEvent = {
      id: `evt-op-${ts()}`,
      eventIndex: 0,
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
      task: 'Processing human operator intervention constraint',
      inputs: {
        'Operator Directive': instruction,
        'Authority': 'HUMAN_IN_THE_LOOP',
        ...(mergedExits ? { 'Constraint Applied': JSON.stringify(constraintsExitsPatch(mergedExits, this.state.exits)) } : {}),
      },
      capabilitiesUsed: ['human_in_the_loop_override'],
      reasoningSummary: `Human operator directive received: "${instruction}". Injecting as a hard constraint before any further route recommendation is made.`,
      nextAction: 'Integrate directive as hard constraint and re-evaluate affected routes',
      isInterrupt: true,
      stateUpdates: {
        operatorIntervention: instruction,
        currentActivity: `Operator instruction received: "${instruction}"`,
      },
    };

    const integrateEvt: StructuredMockEvent = {
      id: `evt-op-integrate-${ts()}`,
      eventIndex: 0,
      fromAgentId: 'agent_coordinator',
      fromAgentName: 'Emergency Coordinator',
      fromIcon: '🧠',
      toAgentId: 'agent_coordinator',
      toAgentName: 'Emergency Coordinator (Internal)',
      toIcon: '🧠',
      type: 'operator_instruction_applied',
      topic: 'DIRECTIVE_INTEGRATION_CONFIRMATION',
      message: blockedExits.length > 0
        ? `Directive applied. ${blockedExits.join(', ')} now excluded from the route set.`
        : `Directive applied. No exit exclusions triggered by this instruction.`,
      thinkingText: 'Applying operator hard constraint to egress graph and marking affected nodes...',
      task: 'Locking operator constraint into live route graph',
      inputs: {
        'Hard Constraint': instruction,
        'Rule Source': 'OPERATOR',
        'Exits Now Blocked': blockedExits.join(', ') || 'None',
        'Exits Still Available': availableExits.join(', ') || 'None',
      },
      capabilitiesUsed: ['resolve_conflicts', 'synthesize_plan'],
      reasoningSummary: blockedExits.length > 0
        ? `Constraint excludes ${blockedExits.join(', ')}. Remaining candidate route(s): ${availableExits.join(', ') || 'none — escalation required'}.`
        : `No currently-available exit is removed by this directive; re-scoring existing routes for compliance.`,
      nextAction: 'Dispatch re-verification request to Security Agent for remaining routes',
      stateUpdates: { currentActivity: 'Operator directive integrated into egress constraint graph' },
    };

    const verifyRequestEvt: StructuredMockEvent = {
      id: `evt-op-verify-req-${ts()}`,
      eventIndex: 0,
      fromAgentId: 'agent_coordinator',
      fromAgentName: 'Emergency Coordinator',
      fromIcon: '🧠',
      toAgentId: 'agent_security',
      toAgentName: 'Security Agent',
      toIcon: '🛡️',
      type: 'route_verification_request',
      topic: 'POST_OVERRIDE_ROUTE_CHECK',
      message: `Re-verify remaining viable routes given operator constraint: "${instruction}"`,
      thinkingText: 'Requesting Security Agent re-confirm door hardware and CCTV status on remaining candidate exits...',
      task: 'Re-checking remaining candidate exits against operator constraint',
      inputs: { 'Routes To Re-check': availableExits.join(', ') || 'None remaining', 'Trigger': 'Operator override' },
      capabilitiesUsed: ['query_security_telemetry'],
      reasoningSummary: `Before finalizing a revised plan, Coordinator requests Security re-confirm ${availableExits.join(', ') || 'no'} route(s) are still structurally sound.`,
      nextAction: 'Await Security Agent confirmation',
      stateUpdates: { currentActivity: 'Requesting Security re-verification of remaining routes post-override' },
    };

    const verifyRespEvt: StructuredMockEvent = {
      id: `evt-op-verify-resp-${ts()}`,
      eventIndex: 0,
      fromAgentId: 'agent_security',
      fromAgentName: 'Security Agent',
      fromIcon: '🛡️',
      toAgentId: 'agent_coordinator',
      toAgentName: 'Emergency Coordinator',
      toIcon: '🧠',
      type: 'route_available',
      topic: 'POST_OVERRIDE_ROUTE_CONFIRMATION',
      message: availableExits.length > 0
        ? `${availableExits.join(', ')} confirmed structurally sound.`
        : `No viable exits remain — escalation required.`,
      thinkingText: 'Cross-checking solenoid and CCTV telemetry on remaining candidate exits...',
      task: 'Confirming door hardware and camera feeds on remaining candidates',
      inputs: { 'Confirmed Available': availableExits.join(', ') || 'None', 'Occupants Affected': occLine },
      capabilitiesUsed: ['check_access_locks', 'verify_incident'],
      reasoningSummary: availableExits.length > 0
        ? `${availableExits.join(', ')} verified clear and operational for evacuation of ${occLine}.`
        : `All primary exits are currently compromised or excluded — recommend immediate mutual aid escalation.`,
      nextAction: 'Return confirmation to Coordinator for final plan synthesis',
      stateUpdates: { currentActivity: 'Security re-verification complete' },
    };

    const replanEvt: StructuredMockEvent = {
      id: `evt-op-replan-${ts()}`,
      eventIndex: 0,
      fromAgentId: 'agent_coordinator',
      fromAgentName: 'Emergency Coordinator',
      fromIcon: '🧠',
      toAgentId: 'agent_coordinator',
      toAgentName: 'Emergency Coordinator (Internal)',
      toIcon: '🧠',
      type: 'replanning_started',
      topic: 'GRAPH_REPLANNING_ENGINE',
      message: 'Synthesizing revised response plan under operator constraint.',
      thinkingText: 'Re-running graph replan with operator-imposed penalties applied...',
      task: 'Synthesizing revised plan from updated constraints',
      inputs: {
        'Safe Routes': (newPlan?.safeRoutes || []).join(', ') || 'None',
        'Blocked Routes': (newPlan?.blockedRoutes || []).join(', ') || 'None',
      },
      capabilitiesUsed: ['recalculate_routes', 'synthesize_plan'],
      reasoningSummary: `Revised plan: safe route(s) = ${(newPlan?.safeRoutes || []).join(', ') || 'none'}; blocked = ${(newPlan?.blockedRoutes || []).join(', ') || 'none'}. Status: ${newPlan?.humanDecision || 'MODIFIED'}.`,
      nextAction: 'Publish updated plan to operator console',
      stateUpdates: { currentActivity: 'Revised response plan synthesized following operator override' },
    };

    const finalizeEvt: StructuredMockEvent = {
      id: `evt-op-final-${ts()}`,
      eventIndex: 0,
      fromAgentId: 'agent_coordinator',
      fromAgentName: 'Emergency Coordinator',
      fromIcon: '🧠',
      toAgentId: 'OPERATOR_CONSOLE',
      toAgentName: 'LATTICE Operator Console',
      toIcon: '💻',
      type: 'response_plan_generated',
      topic: 'CONSOLIDATED_RESPONSE_PLAN',
      message: (newPlan?.recommendedActions || []).join(' ') || 'Updated response plan ready for review.',
      thinkingText: 'Compiling revised multi-agent response plan payload...',
      task: 'Publishing revised plan for operator sign-off',
      inputs: {
        'Emergency Level': newPlan?.emergencyLevel || 'UNKNOWN',
        'Primary Route(s)': (newPlan?.safeRoutes || []).join(', ') || 'None',
      },
      capabilitiesUsed: ['synthesize_plan', 'present_to_human'],
      reasoningSummary: `Updated plan reflects operator directive "${instruction}" applied across ${blockedExits.length} exit(s). Ready for operator sign-off.`,
      nextAction: 'Await operator final execution approval',
      stateUpdates: { currentActivity: 'Revised response plan finalized — awaiting operator execution approval' },
    };

    return [operatorEvt, integrateEvt, verifyRequestEvt, verifyRespEvt, replanEvt, finalizeEvt];
  }

  private clearTimer(): void {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
  }

  private advanceStepOnce(): void {
    if (this.state.activeStepIndex >= this.customEventsQueue.length) {
      this.state.playbackMode = 'PAUSED';
      this.state.currentStage = 'DELIVERED';
      this.notify();
      return;
    }

    if (this.state.currentStage === 'IDLE' || this.state.currentStage === 'DELIVERED') {
      this.startCurrentStepLifecycle();
    } else if (this.state.currentStage === 'RECEIVING') {
      this.transitionToStage('THINKING', 1800);
    } else if (this.state.currentStage === 'THINKING') {
      this.transitionToStage('TYPING', 1800);
    } else if (this.state.currentStage === 'TYPING') {
      this.completeCurrentStep();
    }
  }

  private startCurrentStepLifecycle(): void {
    this.clearTimer();
    const currentEvt = this.customEventsQueue[this.state.activeStepIndex];
    if (!currentEvt) {
      this.state.playbackMode = 'PAUSED';
      this.notify();
      return;
    }

    this.state.currentStage = 'RECEIVING';
    this.state.currentActiveAgentId = currentEvt.fromAgentId;
    this.state.currentReceiverAgentId = currentEvt.toAgentId;
    this.state.currentActivity = currentEvt.task;

    this.updateAgentStates({
      [currentEvt.fromAgentId]: 'sending',
      [currentEvt.toAgentId]: 'receiving',
    });

    this.notify();

    if (this.state.playbackMode === 'LIVE') {
      this.timer = setTimeout(() => {
        this.transitionToStage('THINKING', 1800);
      }, 1200);
    }
  }

  private transitionToStage(nextStage: 'THINKING' | 'TYPING', delayMs: number): void {
    this.clearTimer();
    const currentEvt = this.customEventsQueue[this.state.activeStepIndex];
    if (!currentEvt) return;

    this.state.currentStage = nextStage;
    if (nextStage === 'THINKING') {
      this.updateAgentStates({
        [currentEvt.fromAgentId]: 'thinking',
        [currentEvt.toAgentId]: 'active',
      });
    } else if (nextStage === 'TYPING') {
      this.updateAgentStates({
        [currentEvt.fromAgentId]: 'active',
        [currentEvt.toAgentId]: 'active',
      });
    }

    this.notify();

    if (this.state.playbackMode === 'LIVE') {
      this.timer = setTimeout(() => {
        if (nextStage === 'THINKING') {
          this.transitionToStage('TYPING', 1800);
        } else {
          this.completeCurrentStep();
        }
      }, delayMs);
    }
  }

  private completeCurrentStep(): void {
    this.clearTimer();
    const currentEvt = this.customEventsQueue[this.state.activeStepIndex];
    if (!currentEvt) return;

    if (currentEvt.stateUpdates) {
      if (typeof currentEvt.stateUpdates === 'function') {
        const updates = currentEvt.stateUpdates(this.state);
        this.state = { ...this.state, ...updates };
      } else {
        this.state = { ...this.state, ...currentEvt.stateUpdates };
      }
    }

    this.state.responsePlan = computeResponsePlan(this.state);

    const newLog: EventLogEntry = {
      id: `log-${Date.now()}-${currentEvt.eventIndex}`,
      eventIndex: currentEvt.eventIndex,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      senderId: currentEvt.fromAgentId,
      senderName: currentEvt.fromAgentName,
      senderIcon: currentEvt.fromIcon,
      receiverId: currentEvt.toAgentId,
      receiverName: currentEvt.toAgentName,
      type: currentEvt.type,
      message: currentEvt.message,
      status: 'DELIVERED',
    };

    this.state.eventLogs = [...this.state.eventLogs, newLog];
    this.state.currentStage = 'DELIVERED';

    this.updateAgentStates({
      [currentEvt.fromAgentId]: 'completed',
      [currentEvt.toAgentId]: 'completed',
    });

    this.state.activeStepIndex += 1;

    this.notify();

    if (this.state.playbackMode === 'LIVE') {
      if (this.state.activeStepIndex < this.customEventsQueue.length) {
        this.timer = setTimeout(() => {
          this.startCurrentStepLifecycle();
        }, 1500);
      } else {
        this.state.playbackMode = 'PAUSED';
        this.notify();
      }
    }
  }

  private updateAgentStates(updates: Record<string, any>): void {
    const updated = { ...this.state.agentStates };
    Object.entries(updates).forEach(([agentId, status]) => {
      if (updated[agentId] !== undefined) {
        updated[agentId] = status;
      }
    });
    this.state.agentStates = updated;
  }
}

export const mockAgentRuntime = new MockAgentRuntimeImpl();
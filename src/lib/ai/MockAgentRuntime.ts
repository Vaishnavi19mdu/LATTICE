import { AgentRuntime, StateChangeListener } from './AgentRuntime';
import { SharedEmergencyState, EventLogEntry } from '../mock/emergencyScenario';
import { StructuredMockEvent } from '../mock/mockEvents';
import { getRandomScenario } from '../mock/scenarioPresets';
import { computeResponsePlan } from '../interoperability/responsePlanEngine';


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
    // Notify immediately on subscribe
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
      // Loop or reset to step 0 if finished
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

  public injectOperatorIntervention(instruction: string): void {
    if (!instruction.trim()) return;

    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const insertIdx = Math.max(1, this.state.activeStepIndex);

    // Create Event 13 style custom operator intervention event
    const operatorEvt: StructuredMockEvent = {
      id: `evt-op-${Date.now()}`,
      eventIndex: insertIdx + 1,
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
      inputs: { 'Operator Directive': instruction, 'Authority': 'HUMAN_IN_THE_LOOP' },
      capabilitiesUsed: ['human_in_the_loop_override'],
      reasoningSummary: `Human operator confirmed directive: "${instruction}". Recalculating egress graph constraints.`,
      nextAction: 'Re-evaluate route allocations with new operator constraints',
      isInterrupt: true,
      stateUpdates: {
        operatorIntervention: instruction,
        currentActivity: `Operator instruction received: "${instruction}"`,
      },
    };

    // Insert into events queue right after current active step index
    this.customEventsQueue.splice(this.state.activeStepIndex, 0, operatorEvt);
    this.state.totalSteps = this.customEventsQueue.length;

    // Recompute response plan immediately so UI reflects the intervention without waiting a step
    this.state.responsePlan = computeResponsePlan(this.state);

    // Trigger step lifecycle for this new event
    this.state.playbackMode = 'LIVE';
    this.startCurrentStepLifecycle();
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

    // Stage 1: RECEIVING (Packet travelling along connection vector)
    this.state.currentStage = 'RECEIVING';
    this.state.currentActiveAgentId = currentEvt.fromAgentId;
    this.state.currentReceiverAgentId = currentEvt.toAgentId;
    this.state.currentActivity = currentEvt.task;

    // Set sender agent state to sending, receiver to receiving
    this.updateAgentStates({
      [currentEvt.fromAgentId]: 'sending',
      [currentEvt.toAgentId]: 'receiving',
    });

    this.notify();

    if (this.state.playbackMode === 'LIVE') {
      this.timer = setTimeout(() => {
        this.transitionToStage('THINKING', 1800);
      }, 1200); // 1.2s for message packet transmission
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

    // Apply state updates attached to event
    if (currentEvt.stateUpdates) {
      if (typeof currentEvt.stateUpdates === 'function') {
        const updates = currentEvt.stateUpdates(this.state);
        this.state = { ...this.state, ...updates };
      } else {
        this.state = { ...this.state, ...currentEvt.stateUpdates };
      }
    }

    // Recompute response plan from latest state (incident/exits/occupancy may have just changed)
    this.state.responsePlan = computeResponsePlan(this.state);

    // Add to event logs
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

    // Reset agent active states to completed / idle
    this.updateAgentStates({
      [currentEvt.fromAgentId]: 'completed',
      [currentEvt.toAgentId]: 'completed',
    });

    // Increment active step index
    this.state.activeStepIndex += 1;

    this.notify();

    if (this.state.playbackMode === 'LIVE') {
      if (this.state.activeStepIndex < this.customEventsQueue.length) {
        // Pause briefly before starting next event
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
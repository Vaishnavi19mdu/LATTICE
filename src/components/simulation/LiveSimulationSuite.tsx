import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  ShieldAlert, 
  ShieldCheck, 
  Flame, 
  UserCheck, 
  Zap, 
  Activity,
  Layers,
  Sparkles
} from 'lucide-react';
import { AgentStatus } from '../../types/agent.types';
import { runAgentSimulation, InteropSimulationRunResult } from '../../lib/interoperability/agentMessageBus';
import { OperatorNote } from '../../agents/coordinator/coordinator.types';
import { BuildingStageView } from './BuildingStageView';
import { AgentNetworkView } from './AgentNetworkView';
import { AgentChatterView, ChatterMessage } from './AgentChatterView';
import { OperatorInterventionPanel } from './OperatorInterventionPanel';
import { OperationsChatWidget } from './OperationsChatWidget';

// 10 SEQUENTIAL SIMULATION DIALOGUE STEPS
const SIMULATION_CHATTER: ChatterMessage[] = [
  {
    id: 'chatter_1',
    stepIndex: 1,
    timestamp: '12:41:00',
    senderId: 'agent_fire_hazard',
    senderName: 'Fire & Hazard Agent',
    senderIcon: '🔥',
    senderColor: '#E26161',
    receiverId: 'agent_coordinator',
    receiverName: 'Emergency Coordinator',
    dialogueText: "I've detected abnormal smoke levels (85 PPM) and elevated temperature (78°C) on Floor 4 Exit A corridors. Estimated hazard severity: HIGH. Confidence: 0.92.",
    topic: 'HAZARD_EVALUATION_REPORT',
  },
  {
    id: 'chatter_2',
    stepIndex: 2,
    timestamp: '12:41:01',
    senderId: 'agent_coordinator',
    senderName: 'Emergency Coordinator',
    senderIcon: '🧠',
    senderColor: '#A99BC9',
    receiverId: 'agent_occupancy',
    receiverName: 'Occupancy Agent',
    dialogueText: 'Hazard alert received on Floor 4. Querying Occupancy Agent for density and registered assistance requirements in the affected zone.',
    topic: 'OCCUPANT_DENSITY_QUERY',
  },
  {
    id: 'chatter_3',
    stepIndex: 3,
    timestamp: '12:41:02',
    senderId: 'agent_occupancy',
    senderName: 'Occupancy Agent',
    senderIcon: '👥',
    senderColor: '#E6B85C',
    receiverId: 'agent_coordinator',
    receiverName: 'Emergency Coordinator',
    dialogueText: 'Floor 4 currently has 42 occupants detected via smart badge sensors. 3 occupants have registered mobility support requirements.',
    topic: 'OCCUPANT_DENSITY_UPDATE',
  },
  {
    id: 'chatter_4',
    stepIndex: 4,
    timestamp: '12:41:03',
    senderId: 'agent_coordinator',
    senderName: 'Emergency Coordinator',
    senderIcon: '🧠',
    senderColor: '#A99BC9',
    receiverId: 'agent_security',
    receiverName: 'Security Agent',
    dialogueText: 'Received occupancy telemetry. Security Agent, verify current status and access control locks for Exit A and Exit B on Floor 4.',
    topic: 'ROUTE_SECURITY_QUERY',
  },
  {
    id: 'chatter_5',
    stepIndex: 5,
    timestamp: '12:41:04',
    senderId: 'agent_security',
    senderName: 'Security Agent',
    senderIcon: '🛡️',
    senderColor: '#7AE04C',
    receiverId: 'agent_coordinator',
    receiverName: 'Emergency Coordinator',
    dialogueText: 'Access control logs and CCTV confirm Exit A door lock solenoid mechanism is jammed. Corridor B towards Exit B remains open and clear.',
    topic: 'INCIDENT_VERIFICATION_RESPONSE',
  },
  {
    id: 'chatter_6',
    stepIndex: 6,
    timestamp: '12:41:05',
    senderId: 'agent_fire_hazard',
    senderName: 'Fire & Hazard Agent',
    senderIcon: '🔥',
    senderColor: '#E26161',
    receiverId: 'agent_coordinator',
    receiverName: 'Emergency Coordinator',
    dialogueText: 'WAIT! Thermal propagation alert! Smoke propagation has now accelerated and reached the primary corridor leading directly toward Exit A!',
    topic: 'HAZARD_INTERRUPT_ALERT',
    isInterrupt: true,
  },
  {
    id: 'chatter_7',
    stepIndex: 7,
    timestamp: '12:41:06',
    senderId: 'agent_coordinator',
    senderName: 'Emergency Coordinator',
    senderIcon: '🧠',
    senderColor: '#A99BC9',
    receiverId: 'OPERATOR_CONSOLE',
    receiverName: 'LATTICE Operator Console',
    dialogueText: 'CRITICAL CONFLICT DETECTED: Nearest route (Exit A) is severely compromised by fire propagation and lock failure. Evaluating alternative route Exit B.',
    topic: 'CONFLICT_RESOLUTION_EVALUATION',
  },
  {
    id: 'chatter_8',
    stepIndex: 8,
    timestamp: '12:41:07',
    senderId: 'agent_ethical_priority',
    senderName: 'Ethical Priority Agent',
    senderIcon: '❤️',
    senderColor: '#E0B7C9',
    receiverId: 'agent_coordinator',
    receiverName: 'Emergency Coordinator',
    dialogueText: 'Assistance allocation recommendation: 3 registered occupants on Floor 4 require immediate priority support teams routed via Stairwell B.',
    topic: 'ASSISTANCE_ALLOCATION_RECOMMENDATION',
  },
  {
    id: 'chatter_9',
    stepIndex: 9,
    timestamp: '12:41:08',
    senderId: 'agent_cross_building',
    senderName: 'Cross-Building Collaboration Agent',
    senderIcon: '🌐',
    senderColor: '#565E75',
    receiverId: 'CAMPUS_BUILDING_NODES',
    receiverName: 'Building B (Engineering)',
    dialogueText: 'Broadcasting mutual aid alert to Building B: Smoke plume may affect shared concourse HVAC intake. Isolating HVAC ducting and locking connecting concourse.',
    topic: 'CAMPUS_MUTUAL_AID_ALERT',
  },
  {
    id: 'chatter_10',
    stepIndex: 10,
    timestamp: '12:41:09',
    senderId: 'agent_coordinator',
    senderName: 'Emergency Coordinator',
    senderIcon: '🧠',
    senderColor: '#A99BC9',
    receiverId: 'HUMAN_OPERATOR',
    receiverName: 'LATTICE Human Operator',
    dialogueText: 'Consolidated response plan synthesized. Avoid Exit A. Redirect occupants to Exit B via Stairwell B. Deploy assistance team for 3 mobility occupants. Awaiting Operator Decision.',
    topic: 'SYNTHESIZED_RESPONSE_PLAN',
  },
];

export const LiveSimulationSuite: React.FC = () => {
  const [activeStepIndex, setActiveStepIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isSecurityOffline, setIsSecurityOffline] = useState<boolean>(false);
  const [operatorNotes, setOperatorNotes] = useState<OperatorNote[]>([]);
  const [humanDecision, setHumanDecision] = useState<'APPROVED' | 'MODIFIED' | 'REJECTED' | null>(null);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1200);

  // Compute live simulation result based on status & notes
  const simResult: InteropSimulationRunResult = runAgentSimulation({
    scenarioId: isSecurityOffline ? 'SECURITY_OFFLINE' : 'EXIT_A_CONFLICT',
    agentStatuses: {
      agent_security: isSecurityOffline ? 'offline' : 'online',
    },
    operatorNotes,
    humanDecision,
  });

  // TIMER FOR STEP PLAYBACK
  useEffect(() => {
    let timer: any = null;
    if (isPlaying && activeStepIndex < 10) {
      timer = setTimeout(() => {
        setActiveStepIndex((prev) => prev + 1);
      }, playbackSpeed);
    } else if (activeStepIndex >= 10) {
      setIsPlaying(false);
    }
    return () => clearTimeout(timer);
  }, [isPlaying, activeStepIndex, playbackSpeed]);

  const handleStartSimulation = () => {
    if (activeStepIndex >= 10) {
      setActiveStepIndex(1);
    }
    setIsPlaying(true);
  };

  const handlePauseSimulation = () => {
    setIsPlaying(false);
  };

  const handleResetSimulation = () => {
    setIsPlaying(false);
    setActiveStepIndex(0);
    setHumanDecision(null);
    setOperatorNotes([]);
  };

  const handleToggleSecurity = () => {
    setIsSecurityOffline((prev) => !prev);
  };

  const handleApprovePlan = () => {
    setHumanDecision('APPROVED');
  };

  const handleRejectPlan = () => {
    setHumanDecision('REJECTED');
  };

  const handleModifyPlan = (noteText: string) => {
    const newNote: OperatorNote = {
      noteId: `note_${Date.now()}`,
      operatorId: 'operator_01',
      message: noteText,
      timestamp: new Date().toISOString(),
      source: 'HUMAN_OPERATOR',
    };
    setOperatorNotes((prev) => [...prev, newNote]);
    setHumanDecision('MODIFIED');

    // Add adaptive replanning message chatter
    SIMULATION_CHATTER.push({
      id: `chatter_replan_${Date.now()}`,
      stepIndex: activeStepIndex + 1,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      senderId: 'HUMAN_OPERATOR',
      senderName: 'LATTICE Operator',
      senderIcon: '👤',
      senderColor: '#E6B85C',
      receiverId: 'agent_coordinator',
      receiverName: 'Emergency Coordinator',
      dialogueText: `Operator instruction received: "${noteText}". Triggering adaptive replanning!`,
      topic: 'OPERATOR_OVERRIDE_REPLAN',
      isInterrupt: true,
    });

    if (activeStepIndex < 10) {
      setActiveStepIndex((prev) => prev + 1);
    }
  };

  // Extract current step chatter item for active node pair highlight
  const currentChatter = SIMULATION_CHATTER.find((c) => c.stepIndex === activeStepIndex);
  const activeSenderId = currentChatter ? currentChatter.senderId : null;
  const activeReceiverId = currentChatter ? currentChatter.receiverId : null;
  const activeMessageType = currentChatter ? currentChatter.topic : null;

  return (
    <div className="space-y-6 font-sans">
      {/* SIMULATION HEADER BAR */}
      <div className="bg-[#292733] text-[#F3F3F3] p-5 rounded-[8px] border border-[#423F4F] shadow-md flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-[#E26161] animate-pulse" />
            <h1 className="text-xl font-extrabold text-[#F3F3F3] tracking-tight">
              LATTICE — LIVE MULTI-AGENT EMERGENCY SIMULATION
            </h1>
          </div>
          <p className="text-xs text-[#A99BC9] mt-0.5">
            Autonomous agent communication, dynamic information requests, conflict detection, and human-in-the-loop intervention.
          </p>
        </div>

        {/* CONTROLS */}
        <div className="flex flex-wrap items-center gap-2 font-mono-tech text-xs">
          {!isPlaying ? (
            <button
              onClick={handleStartSimulation}
              className="py-2.5 px-4 bg-[#7AE04C] hover:bg-[#68c83e] text-[#292733] font-bold rounded-[6px] transition-all cursor-pointer flex items-center gap-1.5 shadow-sm"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>▶ START EMERGENCY SIMULATION</span>
            </button>
          ) : (
            <button
              onClick={handlePauseSimulation}
              className="py-2.5 px-4 bg-[#E6B85C] hover:bg-[#d4a64a] text-[#292733] font-bold rounded-[6px] transition-all cursor-pointer flex items-center gap-1.5 shadow-sm"
            >
              <Pause className="w-4 h-4 fill-current" />
              <span>PAUSE SIMULATION</span>
            </button>
          )}

          <button
            onClick={handleResetSimulation}
            className="py-2.5 px-3 bg-[#423F4F] hover:bg-[#565E75] text-[#F3F3F3] font-bold rounded-[6px] transition-all cursor-pointer flex items-center gap-1"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>RESET</span>
          </button>

          <button
            onClick={handleToggleSecurity}
            className={`py-2.5 px-3.5 rounded-[6px] font-bold transition-all cursor-pointer flex items-center gap-1.5 border ${
              isSecurityOffline 
                ? 'bg-[#E26161] text-[#F3F3F3] border-[#E26161]' 
                : 'bg-[#1F2028] text-[#A99BC9] border-[#423F4F] hover:bg-[#423F4F]'
            }`}
          >
            {isSecurityOffline ? <ShieldAlert className="w-3.5 h-3.5" /> : <ShieldCheck className="w-3.5 h-3.5" />}
            <span>{isSecurityOffline ? '✓ RESTORE SECURITY' : '⚠ SECURITY OFFLINE'}</span>
          </button>
        </div>
      </div>

      {/* STEP PROGRESS TRACKER */}
      <div className="bg-white p-4 rounded-[8px] border border-[#423F4F]/10 shadow-sm space-y-2 font-mono-tech">
        <div className="flex justify-between items-center text-xs">
          <span className="font-extrabold text-[#292733] flex items-center gap-2">
            <Layers className="w-4 h-4 text-[#A99BC9]" />
            SIMULATION STAGE PROGRESS: STEP {activeStepIndex} / 10
          </span>
          <span className="font-bold text-[#A99BC9]">
            {activeStepIndex === 0 && 'STATUS: READY TO START'}
            {activeStepIndex > 0 && activeStepIndex < 10 && 'STATUS: LIVE SIMULATION IN PROGRESS'}
            {activeStepIndex >= 10 && 'STATUS: COMPLETE — AWAITING OPERATOR DECISION'}
          </span>
        </div>

        <div className="w-full h-2 bg-[#F3F3F3] rounded-full overflow-hidden border border-[#423F4F]/10">
          <div
            className="h-full bg-gradient-to-r from-[#A99BC9] via-[#E6B85C] to-[#7AE04C] transition-all duration-500"
            style={{ width: `${(activeStepIndex / 10) * 100}%` }}
          />
        </div>
      </div>

      {/* ROW 1: BUILDING STAGE (LEFT) + AGENT NETWORK GRAPH (RIGHT) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <BuildingStageView
          fireSeverity={simResult.fireAssessment?.severity || 'HIGH'}
          exitAStatus={simResult.coordinatorAssessment.blockedRoutes.includes('Exit A') ? 'BLOCKED' : 'SAFE'}
          exitBStatus={humanDecision === 'MODIFIED' && simResult.operatorNote?.toLowerCase().includes('exit b') ? 'RESTRICTED' : 'SAFE'}
          exitCStatus="SAFE"
          occupantsCount={42}
          specialNeedsCount={3}
          buildingBAlert={activeStepIndex >= 9}
          activeStepIndex={activeStepIndex}
        />

        <AgentNetworkView
          activeSenderId={activeSenderId}
          activeReceiverId={activeReceiverId}
          activeMessageType={activeMessageType}
          agentStates={simResult.agentStatuses}
        />
      </div>

      {/* ROW 2: AGENT CHATTER (LEFT) + OPERATOR INTERVENTION PANEL (RIGHT) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AgentChatterView
          messages={SIMULATION_CHATTER}
          activeStepIndex={activeStepIndex}
        />

        <OperatorInterventionPanel
          assessment={simResult.coordinatorAssessment}
          confidenceScore={simResult.coordinatorAssessment.confidence}
          isSecurityOffline={isSecurityOffline}
          humanDecision={humanDecision}
          operatorNotes={operatorNotes}
          onApprove={handleApprovePlan}
          onReject={handleRejectPlan}
          onModify={handleModifyPlan}
        />
      </div>

      {/* ROW 3: OPERATIONS ASSISTANT CHAT (FULL WIDTH) */}
      <OperationsChatWidget />
    </div>
  );
};

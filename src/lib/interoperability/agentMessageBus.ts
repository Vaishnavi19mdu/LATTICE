import { AgentStatus } from '../../types/agent.types';
import { fireHazardAgent, FireHazardAssessment } from '../../agents/fire-hazard';
import { occupancyAgent, OccupancyAssessment } from '../../agents/occupancy';
import { securityAgent, SecurityAssessment } from '../../agents/security';
import { emergencyCoordinator, CoordinatorAssessment, OperatorNote } from '../../agents/coordinator';
import { ethicalPriorityAgent, EthicalPriorityAssessment } from '../../agents/ethical-priority';
import { crossBuildingAgent, CrossBuildingAssessment } from '../../agents/cross-building';
import { latticeRegistry, syncRegistryFromState } from './latticeRegistryBootstrap';

export interface AgentMessage {
  id: string;
  timestamp: string;
  senderId: string;
  senderName: string;
  senderIcon: string;
  receiverId: string;
  receiverName: string;
  messageType: 
    | 'HAZARD_ASSESSMENT'
    | 'OCCUPANCY_TELEMETRY'
    | 'CAPABILITY_DISCOVERY'
    | 'SECURITY_VERIFICATION'
    | 'COORDINATED_RESPONSE_PLAN'
    | 'ETHICAL_PRIORITY_ALERT'
    | 'MUTUAL_AID_BROADCAST'
    | 'HUMAN_OVERRIDE';
  topic: string;
  payload: Record<string, any>;
  status: 'SENT' | 'DELIVERED' | 'PROCESSED';
}

export interface InteropSimulationRunResult {
  scenarioId: string;
  messages: AgentMessage[];
  coordinatorAssessment: CoordinatorAssessment;
  fireAssessment?: FireHazardAssessment;
  occupancyAssessment?: OccupancyAssessment;
  securityAssessment?: SecurityAssessment;
  ethicalAssessment?: EthicalPriorityAssessment;
  crossBuildingAssessment?: CrossBuildingAssessment;
  agentStatuses: Record<string, AgentStatus>;
  humanDecision?: 'APPROVED' | 'MODIFIED' | 'REJECTED' | null;
  operatorNote?: string | null;
}

/**
 * Executes a full multi-agent interoperability simulation trace with step-by-step message exchange.
 */
export function runAgentSimulation(options: {
  scenarioId: 'NOMINAL_EVACUATION' | 'EXIT_A_CONFLICT' | 'SECURITY_OFFLINE' | 'CUSTOM';
  agentStatuses?: Partial<Record<string, AgentStatus>>;
  operatorNotes?: OperatorNote[];
  humanDecision?: 'APPROVED' | 'MODIFIED' | 'REJECTED' | null;
}): InteropSimulationRunResult {
  const messages: AgentMessage[] = [];
  const now = new Date();
  
  const formatTime = (secondsOffset: number) => {
    const t = new Date(now.getTime() + secondsOffset * 1000);
    return t.toTimeString().split(' ')[0];
  };

  // Merge default agent statuses with user overrides
  const currentStatuses: Record<string, AgentStatus> = {
    agent_fire_hazard: options.agentStatuses?.agent_fire_hazard || 'online',
    agent_occupancy: options.agentStatuses?.agent_occupancy || 'online',
    agent_security: options.scenarioId === 'SECURITY_OFFLINE' 
      ? 'offline' 
      : (options.agentStatuses?.agent_security || 'online'),
    agent_coordinator: options.agentStatuses?.agent_coordinator || 'online',
    agent_ethical_priority: options.agentStatuses?.agent_ethical_priority || 'online',
    agent_cross_building: options.agentStatuses?.agent_cross_building || 'online',
  };

  // STEP 1: Fire & Hazard Agent Assessment
  const isConflictScenario = options.scenarioId === 'EXIT_A_CONFLICT';
  const fireInput = {
    temperature: isConflictScenario ? 78 : 65,
    smokeLevel: isConflictScenario ? 85 : 32,
    gasLevel: 28,
    fireAlarm: true,
    location: isConflictScenario ? 'Floor 4 Exit A Corridors' : 'Floor 4 West Corridor',
    buildingId: 'building_A',
  };

  const fireAssessment = fireHazardAgent.process(fireInput);

  messages.push({
    id: `msg_${Date.now()}_1`,
    timestamp: formatTime(0),
    senderId: 'agent_fire_hazard',
    senderName: 'Fire & Hazard Agent',
    senderIcon: '🔥',
    receiverId: 'agent_coordinator',
    receiverName: 'Emergency Coordinator',
    messageType: 'HAZARD_ASSESSMENT',
    topic: 'HAZARD_EVALUATION_REPORT',
    payload: {
      hazardType: fireAssessment.hazardType,
      severity: fireAssessment.severity,
      score: fireAssessment.score,
      location: fireAssessment.location,
      confidence: fireAssessment.confidence,
    },
    status: 'PROCESSED',
  });

  // STEP 2: Occupancy Agent Telemetry
  const occupancyAssessment = occupancyAgent.process({
    buildingId: 'building_A',
    totalOccupants: 42,
    floorOccupancy: { '4': 42 },
    affectedFloors: ['4'],
    registeredAssistanceNeeds: 3,
  });

  messages.push({
    id: `msg_${Date.now()}_2`,
    timestamp: formatTime(1),
    senderId: 'agent_occupancy',
    senderName: 'Occupancy Agent',
    senderIcon: '👥',
    receiverId: 'agent_coordinator',
    receiverName: 'Emergency Coordinator',
    messageType: 'OCCUPANCY_TELEMETRY',
    topic: 'OCCUPANT_DENSITY_UPDATE',
    payload: {
      totalOccupants: occupancyAssessment.totalOccupants,
      affectedOccupants: occupancyAssessment.affectedOccupants,
      affectedZones: occupancyAssessment.affectedZones,
      assistanceRequired: occupancyAssessment.assistanceRequired,
      evacuationPressure: occupancyAssessment.evacuationPressureScore,
    },
    status: 'PROCESSED',
  });

  // STEP 3: Coordinator Dynamic Capability Discovery via Agent Registry
  syncRegistryFromState(
    currentStatuses as Record<
      string,
      'offline' | 'idle' | 'thinking' | 'sending' | 'receiving' | 'active' | 'alert' | 'completed'
    >,
  );

  const requiredCapability = 'verify_incident';
  const discoveredAgents = latticeRegistry.findAgentsByCapability(requiredCapability);
  const targetSecurityAgent = discoveredAgents[0]
    ? { id: discoveredAgents[0].agentId, name: discoveredAgents[0].agentName }
    : undefined;

  messages.push({
    id: `msg_${Date.now()}_3`,
    timestamp: formatTime(2),
    senderId: 'agent_coordinator',
    senderName: 'Emergency Coordinator',
    senderIcon: '🧠',
    receiverId: targetSecurityAgent ? targetSecurityAgent.id : 'agent_security',
    receiverName: targetSecurityAgent ? targetSecurityAgent.name : 'Security Agent',
    messageType: 'CAPABILITY_DISCOVERY',
    topic: `REQUEST_CAPABILITY:${requiredCapability}`,
    payload: {
      requiredCapability,
      discoveredAgentId: targetSecurityAgent?.id,
      registryLookupSuccess: !!targetSecurityAgent,
    },
    status: 'PROCESSED',
  });

  // STEP 4: Security Verification Assessment (or OFFLINE handling)
  let securityAssessment: SecurityAssessment | undefined;
  if (currentStatuses.agent_security !== 'offline') {
    securityAssessment = securityAgent.process({
      cctvEventDetected: true,
      accessEventDetected: true,
      doorStatus: isConflictScenario ? 'BLOCKED' : 'OPEN',
      securityAlert: true,
      location: 'Floor 4 Exit A',
    });

    messages.push({
      id: `msg_${Date.now()}_4`,
      timestamp: formatTime(3),
      senderId: 'agent_security',
      senderName: 'Security Agent',
      senderIcon: '🛡️',
      receiverId: 'agent_coordinator',
      receiverName: 'Emergency Coordinator',
      messageType: 'SECURITY_VERIFICATION',
      topic: 'INCIDENT_VERIFICATION_RESPONSE',
      payload: {
        incidentVerified: securityAssessment.incidentVerified,
        accessStatus: securityAssessment.accessStatus,
        securitySeverity: securityAssessment.securitySeverity,
        evidence: securityAssessment.evidence,
        confidence: securityAssessment.confidence,
      },
      status: 'PROCESSED',
    });
  } else {
    messages.push({
      id: `msg_${Date.now()}_4`,
      timestamp: formatTime(3),
      senderId: 'agent_security',
      senderName: 'Security Agent (OFFLINE)',
      senderIcon: '⚠️',
      receiverId: 'agent_coordinator',
      receiverName: 'Emergency Coordinator',
      messageType: 'SECURITY_VERIFICATION',
      topic: 'TELEMETRY_UNAVAILABLE_WARNING',
      payload: {
        status: 'OFFLINE',
        warning: 'Security Agent telemetry feed unreachable. Incident verification pending operator site dispatch.',
      },
      status: 'PROCESSED',
    });
  }

  // STEP 5: Emergency Coordinator Evaluation
  const availableRoutes = ['Exit A', 'Stairwell B', 'Exit C'];
  const routeLocations = {
    'Exit A': 'Floor 4 Near Hazard',
    'Stairwell B': 'West Wing Core',
    'Exit C': 'Ground Level Main Exit',
  };

  const coordinatorAssessment = emergencyCoordinator.process({
    emergencyId: `emg_${Date.now().toString().slice(-6)}`,
    fireAssessment,
    occupancyAssessment,
    securityAssessment: currentStatuses.agent_security !== 'offline' ? securityAssessment : undefined,
    fireAgentStatus: currentStatuses.agent_fire_hazard,
    occupancyAgentStatus: currentStatuses.agent_occupancy,
    securityAgentStatus: currentStatuses.agent_security,
    availableRoutes,
    routeLocations,
    operatorNotes: options.operatorNotes || [],
  });

  messages.push({
    id: `msg_${Date.now()}_5`,
    timestamp: formatTime(4),
    senderId: 'agent_coordinator',
    senderName: 'Emergency Coordinator',
    senderIcon: '🧠',
    receiverId: 'OPERATOR_CONSOLE',
    receiverName: 'LATTICE Operator Console',
    messageType: 'COORDINATED_RESPONSE_PLAN',
    topic: 'SYNTHESIZED_RESPONSE_PLAN',
    payload: {
      emergencyLevel: coordinatorAssessment.emergencyLevel,
      confidence: coordinatorAssessment.confidence,
      safeRoutes: coordinatorAssessment.safeRoutes,
      blockedRoutes: coordinatorAssessment.blockedRoutes,
      conflicts: coordinatorAssessment.conflicts,
      fallbackActivated: coordinatorAssessment.fallbackActivated,
      fallbackReason: coordinatorAssessment.fallbackReason,
      recommendedActions: coordinatorAssessment.recommendedActions,
    },
    status: 'PROCESSED',
  });

  // STEP 6: Ethical Priority Agent Assessment
  const ethicalAssessment = ethicalPriorityAgent.process({
    buildingId: 'building_A',
    affectedOccupants: occupancyAssessment.affectedOccupants,
    registeredAssistanceNeeds: occupancyAssessment.assistanceRequired,
    availableRoutes: coordinatorAssessment.safeRoutes,
    blockedRoutes: coordinatorAssessment.blockedRoutes,
  });

  messages.push({
    id: `msg_${Date.now()}_6`,
    timestamp: formatTime(5),
    senderId: 'agent_ethical_priority',
    senderName: 'Ethical Priority Agent',
    senderIcon: '❤️',
    receiverId: 'agent_coordinator',
    receiverName: 'Emergency Coordinator',
    messageType: 'ETHICAL_PRIORITY_ALERT',
    topic: 'ASSISTANCE_ALLOCATION_RECOMMENDATION',
    payload: {
      priorityLevel: ethicalAssessment.priorityLevel,
      assistanceRequired: ethicalAssessment.assistanceRequired,
      priorities: ethicalAssessment.priorities,
      recommendedSupport: ethicalAssessment.recommendedSupport,
    },
    status: 'PROCESSED',
  });

  // STEP 7: Cross-Building Collaboration Agent Assessment
  const crossBuildingAssessment = crossBuildingAgent.process({
    sourceBuildingId: 'building_A',
    affectedArea: 'Block A Floor 4 / Shared Concourse',
    severity: coordinatorAssessment.emergencyLevel === 'CRITICAL' || coordinatorAssessment.emergencyLevel === 'HIGH' ? 'HIGH' : 'LOW',
    nearbyBuildings: ['Building B (Engineering)', 'Building C (Research Annex)'],
    sharedInfrastructure: true,
  });

  messages.push({
    id: `msg_${Date.now()}_7`,
    timestamp: formatTime(6),
    senderId: 'agent_cross_building',
    senderName: 'Cross-Building Collaboration Agent',
    senderIcon: '🌐',
    receiverId: 'CAMPUS_BUILDING_NODES',
    receiverName: 'Adjacent Campus Nodes',
    messageType: 'MUTUAL_AID_BROADCAST',
    topic: 'CAMPUS_MUTUAL_AID_ALERT',
    payload: {
      collaborationRequired: crossBuildingAssessment.collaborationRequired,
      affectedBuildings: crossBuildingAssessment.affectedBuildings,
      notifications: crossBuildingAssessment.notifications,
      recommendedActions: crossBuildingAssessment.recommendedActions,
    },
    status: 'PROCESSED',
  });

  // STEP 8: Human Override / Decision Handling
  if (options.humanDecision) {
    const operatorNoteText = options.operatorNotes?.[options.operatorNotes.length - 1]?.message || '';
    messages.push({
      id: `msg_${Date.now()}_8`,
      timestamp: formatTime(7),
      senderId: 'HUMAN_OPERATOR',
      senderName: 'LATTICE Demo Operator',
      senderIcon: '👤',
      receiverId: 'agent_coordinator',
      receiverName: 'Emergency Coordinator',
      messageType: 'HUMAN_OVERRIDE',
      topic: `HUMAN_DECISION:${options.humanDecision}`,
      payload: {
        decision: options.humanDecision,
        operatorNote: operatorNoteText,
        actionTaken: 
          options.humanDecision === 'APPROVED' ? 'Response Plan Approved for Execution' :
          options.humanDecision === 'MODIFIED' ? `Adaptive Replanning Triggered: "${operatorNoteText}"` :
          'Response Plan Rejected - Switched to Manual Operator Control',
      },
      status: 'PROCESSED',
    });
  }

  return {
    scenarioId: options.scenarioId,
    messages,
    coordinatorAssessment,
    fireAssessment,
    occupancyAssessment,
    securityAssessment,
    ethicalAssessment,
    crossBuildingAssessment,
    agentStatuses: currentStatuses,
    humanDecision: options.humanDecision,
    operatorNote: options.operatorNotes?.[options.operatorNotes.length - 1]?.message || null,
  };
}
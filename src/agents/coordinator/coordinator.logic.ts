import { AgentStatus } from '../../types/agent.types';
import { FireHazardAssessment } from '../fire-hazard/fireHazard.types';
import { OccupancyAssessment } from '../occupancy/occupancy.types';
import { SecurityAssessment } from '../security/security.types';
import {
  CoordinatorInput,
  CoordinatorAssessment,
  EmergencyLevel,
  OperatorNote,
  AgentSourceInfo,
} from './coordinator.types';

/**
 * 1. AGENT AVAILABILITY & SOURCE INFO AGGREGATION
 */
export function resolveSourceAgents(input: CoordinatorInput): Record<string, AgentSourceInfo> {
  const fireStatus: AgentStatus = input.fireAgentStatus || (input.fireAssessment ? input.fireAssessment.status : 'offline');
  const occupancyStatus: AgentStatus = input.occupancyAgentStatus || (input.occupancyAssessment ? input.occupancyAssessment.status : 'offline');
  const securityStatus: AgentStatus = input.securityAgentStatus || (input.securityAssessment ? input.securityAssessment.status : 'offline');

  return {
    agent_fire_hazard: {
      agentId: 'agent_fire_hazard',
      agentName: 'Fire & Hazard Agent',
      status: fireStatus,
      available: !!input.fireAssessment && fireStatus !== 'offline',
      confidence: input.fireAssessment?.confidence,
    },
    agent_occupancy: {
      agentId: 'agent_occupancy',
      agentName: 'Occupancy Agent',
      status: occupancyStatus,
      available: !!input.occupancyAssessment && occupancyStatus !== 'offline',
      confidence: 0.88, // default occupancy confidence when present
    },
    agent_security: {
      agentId: 'agent_security',
      agentName: 'Security Agent',
      status: securityStatus,
      available: !!input.securityAssessment && securityStatus !== 'offline',
      confidence: input.securityAssessment?.confidence,
    },
  };
}

/**
 * 2. CONFLICT DETECTION
 * Identifies route conflicts, hazard proximity, verification mismatches, headcount discrepancies, and human operator overrides.
 */
export function detectConflicts(
  input: CoordinatorInput,
  sourceAgents: Record<string, AgentSourceInfo>
): { conflicts: string[]; blockedRoutes: string[]; safeRoutes: string[] } {
  const conflicts: string[] = [];
  const blockedRoutesSet = new Set<string>();
  const defaultRoutes = input.availableRoutes || ['Exit A', 'Stairwell B', 'Exit C'];
  const routeLocations = input.routeLocations || {
    'Exit A': 'Floor 4 Near Hazard',
    'Stairwell B': 'West Wing Core',
    'Exit C': 'Ground South Exit',
  };

  const fire = sourceAgents.agent_fire_hazard.available ? input.fireAssessment : undefined;
  const security = sourceAgents.agent_security.available ? input.securityAssessment : undefined;
  const occupancy = sourceAgents.agent_occupancy.available ? input.occupancyAssessment : undefined;

  const hazardLocation = fire?.location || security?.evidence?.[0] || 'Floor 4';
  const hazardDetected = fire?.hazardDetected ?? false;

  // A. Hazardous Exit Conflict (Occupancy/Route vs Fire/Security)
  defaultRoutes.forEach((route) => {
    const rLoc = (routeLocations[route] || '').toLowerCase();
    const hLoc = hazardLocation.toLowerCase();

    const isNearHazard = hLoc.length > 0 && (rLoc.includes(hLoc) || rLoc.includes('hazard'));
    const isSecurityBlocked = security?.accessStatus === 'BLOCKED' && route.toLowerCase().includes('a');
    const isSecurityUnsafe = security?.evidence?.some((ev) => ev.toLowerCase().includes(route.toLowerCase()) && ev.toLowerCase().includes('unsafe'));

    if ((hazardDetected && isNearHazard) || isSecurityBlocked || isSecurityUnsafe) {
      blockedRoutesSet.add(route);
      conflicts.push(
        `CONFLICT: ${route} is unsafe or obstructed despite being a primary exit route (Location: "${routeLocations[route] || route}"). Re-routing traffic away from ${route}.`
      );
    }
  });

  // B. Security Verification Conflict (Fire High vs Security Offline/Unverified)
  if (fire && (fire.severity === 'HIGH' || fire.severity === 'CRITICAL' || fire.score >= 50)) {
    if (!sourceAgents.agent_security.available) {
      conflicts.push(
        `CONFLICT: Fire Agent detects ${fire.severity} hazard (${fire.score} pts), but Security Agent is OFFLINE. Preserving thermal hazard priority while triggering fallback operator audit.`
      );
    } else if (!security?.incidentVerified || (security?.confidence ?? 1.0) < 0.5) {
      conflicts.push(
        `CONFLICT: Fire Agent detects ${fire.severity} hazard (${fire.score} pts), but Security Agent reports low verification confidence (${security?.confidence ?? 'N/A'}). Preserving thermal hazard priority.`
      );
    }
  }

  // C. Headcount & Access Discrepancy
  if (occupancy && security) {
    // Check if security evidence contains recent entry count or access count comparison
    const securityEntryText = security.evidence?.find((e) => e.toLowerCase().includes('entries') || e.toLowerCase().includes('access'));
    if (securityEntryText) {
      conflicts.push(
        `CONFLICT: Occupancy Agent detects ${occupancy.totalOccupants} total occupants (${occupancy.affectedOccupants} in affected zone), whereas Security telemetry reports discrepancy: "${securityEntryText}".`
      );
    }
  }

  // D. Operator Note Overrides (Human-In-The-Loop Traceability)
  if (input.operatorNotes && input.operatorNotes.length > 0) {
    input.operatorNotes.forEach((note) => {
      const msgLower = note.message.toLowerCase();
      defaultRoutes.forEach((route) => {
        if (msgLower.includes(route.toLowerCase()) && (msgLower.includes('blocked') || msgLower.includes('unsafe') || msgLower.includes('maintenance') || msgLower.includes('close'))) {
          blockedRoutesSet.add(route);
          conflicts.push(
            `[HUMAN_OPERATOR] Note by ${note.operatorId}: Explicitly marked ${route} as blocked/unavailable ("${note.message}").`
          );
        }
      });
    });
  }

  // Compute final safe vs blocked routes
  const safeRoutes: string[] = [];
  const blockedRoutes: string[] = [];

  defaultRoutes.forEach((route) => {
    if (blockedRoutesSet.has(route)) {
      blockedRoutes.push(route);
    } else {
      safeRoutes.push(route);
    }
  });

  // Fail-safe if all primary routes are blocked
  if (safeRoutes.length === 0 && defaultRoutes.length > 0) {
    safeRoutes.push('Stairwell B (Emergency Override Access)');
    conflicts.push('CRITICAL ROUTE CONFLICT: All primary exit routes are obstructed; activating emergency override access vector.');
  }

  return { conflicts, blockedRoutes, safeRoutes };
}

/**
 * 3. EMERGENCY LEVEL CALCULATION
 * Generates a consolidated, deterministic Emergency Level: NORMAL | LOW | MEDIUM | HIGH | CRITICAL
 */
export function calculateEmergencyLevel(
  input: CoordinatorInput,
  sourceAgents: Record<string, AgentSourceInfo>,
  conflicts: string[],
  blockedRoutes: string[]
): EmergencyLevel {
  const fire = sourceAgents.agent_fire_hazard.available ? input.fireAssessment : undefined;
  const occupancy = sourceAgents.agent_occupancy.available ? input.occupancyAssessment : undefined;
  const security = sourceAgents.agent_security.available ? input.securityAssessment : undefined;

  const hazardDetected = fire?.hazardDetected ?? (security?.incidentVerified || false);
  const fireSeverity = fire?.severity || 'LOW';
  const occupancySeverity = occupancy?.occupancySeverity || 'LOW';
  const securitySeverity = security?.securitySeverity || 'LOW';
  const affectedCount = occupancy?.affectedOccupants || 0;
  const assistanceCount = occupancy?.assistanceRequired || 0;

  // Rule 1: CRITICAL
  if (
    fireSeverity === 'CRITICAL' ||
    (fireSeverity === 'HIGH' && (affectedCount >= 20 || occupancySeverity === 'HIGH')) ||
    (fireSeverity === 'HIGH' && blockedRoutes.length >= 1) ||
    (assistanceCount >= 3 && fireSeverity === 'HIGH')
  ) {
    return 'CRITICAL';
  }

  // Rule 2: HIGH
  if (
    fireSeverity === 'HIGH' ||
    securitySeverity === 'HIGH' ||
    occupancySeverity === 'HIGH' ||
    (fireSeverity === 'MEDIUM' && assistanceCount > 0)
  ) {
    return 'HIGH';
  }

  // Rule 3: MEDIUM
  if (
    fireSeverity === 'MEDIUM' ||
    securitySeverity === 'MEDIUM' ||
    occupancySeverity === 'MEDIUM' ||
    (fire && fire.score >= 30) ||
    conflicts.length >= 2
  ) {
    return 'MEDIUM';
  }

  // Rule 4: LOW
  if (fireSeverity === 'LOW' || hazardDetected || security?.incidentVerified) {
    return 'LOW';
  }

  // Rule 5: NORMAL
  return 'NORMAL';
}

/**
 * 4. CONFIDENCE CALCULATION
 * Computes coordination confidence based on agent availability, individual agent confidences, and detected conflicts.
 */
export function calculateConfidence(
  input: CoordinatorInput,
  sourceAgents: Record<string, AgentSourceInfo>,
  conflicts: string[]
): number {
  let totalWeight = 0;
  let weightedConfidence = 0;

  // Fire agent weight = 0.45
  if (sourceAgents.agent_fire_hazard.available && input.fireAssessment) {
    weightedConfidence += input.fireAssessment.confidence * 0.45;
    totalWeight += 0.45;
  }

  // Occupancy agent weight = 0.25
  if (sourceAgents.agent_occupancy.available && input.occupancyAssessment) {
    weightedConfidence += 0.88 * 0.25;
    totalWeight += 0.25;
  }

  // Security agent weight = 0.30
  if (sourceAgents.agent_security.available && input.securityAssessment) {
    weightedConfidence += input.securityAssessment.confidence * 0.30;
    totalWeight += 0.30;
  }

  let baseConfidence = totalWeight > 0 ? weightedConfidence / totalWeight : 0.40;

  // Missing critical agent penalties
  if (!sourceAgents.agent_fire_hazard.available) {
    baseConfidence -= 0.25;
  }
  if (!sourceAgents.agent_security.available) {
    baseConfidence -= 0.20;
  }
  if (!sourceAgents.agent_occupancy.available) {
    baseConfidence -= 0.10;
  }

  // Conflict penalty
  if (conflicts.length > 0) {
    baseConfidence -= Math.min(0.20, conflicts.length * 0.08);
  }

  // Clamp confidence between 0.10 and 0.98
  return Number(Math.max(0.10, Math.min(0.98, baseConfidence)).toFixed(2));
}

/**
 * 5. FALLBACK PROTOCOL EVALUATION
 * Determines whether fallback mode is required due to low confidence, missing agents, or unresolvable conflicts.
 */
export function evaluateFallback(
  confidence: number,
  sourceAgents: Record<string, AgentSourceInfo>,
  conflicts: string[],
  blockedRoutes: string[]
): { fallbackActivated: boolean; fallbackReason: string | null } {
  const missingAgents = Object.values(sourceAgents).filter((a) => !a.available);

  if (missingAgents.length >= 2) {
    return {
      fallbackActivated: true,
      fallbackReason: `FALLBACK ACTIVATED: Multiple critical agents offline (${missingAgents.map((a) => a.agentName).join(', ')}). Proceeding with conservative default safety protocols.`,
    };
  }

  if (!sourceAgents.agent_security.available && conflicts.length > 0) {
    return {
      fallbackActivated: true,
      fallbackReason: 'FALLBACK ACTIVATED: Security Agent offline during active route conflict. Human operator intervention requested.',
    };
  }

  if (confidence < 0.60) {
    return {
      fallbackActivated: true,
      fallbackReason: `FALLBACK ACTIVATED: Coordination confidence degraded (${confidence} < 0.60 threshold). Requesting manual operator verification.`,
    };
  }

  return {
    fallbackActivated: false,
    fallbackReason: null,
  };
}

/**
 * 6. RECOMMENDED ACTIONS GENERATION
 * Constructs structured response plan with actionable recommendations.
 */
export function generateRecommendedActions(
  emergencyLevel: EmergencyLevel,
  safeRoutes: string[],
  blockedRoutes: string[],
  input: CoordinatorInput,
  sourceAgents: Record<string, AgentSourceInfo>,
  conflicts: string[],
  fallbackActivated: boolean
): string[] {
  const actions: string[] = [];
  const occupancy = input.occupancyAssessment;
  const fire = input.fireAssessment;

  // Blocked route actions
  blockedRoutes.forEach((route) => {
    actions.push(`BLOCK_EXIT: Restrict access toward ${route} due to active hazard proximity or obstruction.`);
  });

  // Evacuation & Routing
  if (emergencyLevel === 'CRITICAL' || emergencyLevel === 'HIGH') {
    const area = fire?.location || 'affected floor zones';
    actions.push(`EVACUATE_AFFECTED_ZONE: Initiate immediate structured evacuation for ${area}.`);
    if (safeRoutes.length > 0) {
      actions.push(`REDIRECT_EVACUATION: Broadcast directional guidance utilizing verified safe routes: ${safeRoutes.join(', ')}.`);
    }
  } else if (emergencyLevel === 'MEDIUM') {
    actions.push(`MONITOR_SITUATION: Prepare HVAC isolation dampers and position fire wardens near affected zones.`);
  } else {
    actions.push(`MONITOR_SITUATION: Maintain routine multi-sensor building telemetry monitoring.`);
  }

  // Assistance Needs
  if (occupancy && occupancy.assistanceRequired > 0) {
    actions.push(
      `REQUEST_ASSISTANCE: Dispatch dedicated mobility response team to assist ${occupancy.assistanceRequired} registered occupants needing egress support.`
    );
  }

  // Security & Operator Notifications
  if (!sourceAgents.agent_security.available) {
    actions.push('ALERT_SECURITY: Security Agent telemetry unavailable — dispatch physical patrol to conduct visual site inspection.');
  }

  if (conflicts.length > 0 || fallbackActivated || emergencyLevel === 'CRITICAL' || emergencyLevel === 'HIGH') {
    actions.push('NOTIFY_OPERATOR: Transmit priority alert summary to Command Center Operator for human oversight.');
  }

  if (emergencyLevel === 'CRITICAL') {
    actions.push('NOTIFY_NEARBY_BUILDING: Issue campus mutual-aid awareness alert to adjacent building nodes.');
  }

  return actions;
}

/**
 * 7. MAIN EVALUATION ENGINE
 * Combines all modular decision components and returns a complete, explainable CoordinatorAssessment.
 */
export function evaluateCoordinator(input: CoordinatorInput): CoordinatorAssessment {
  const reasoning: string[] = [];
  const sourceAgents = resolveSourceAgents(input);

  // A. Adaptive Replanning Header
  if (input.previousAssessment) {
    reasoning.push(
      `[ADAPTIVE REPLANNING] Re-evaluating previous assessment #${input.previousAssessment.assessmentId} (Prior Level: ${input.previousAssessment.emergencyLevel}, Prior Confidence: ${input.previousAssessment.confidence}).`
    );
  }

  // B. Agent Availability Reporting
  Object.values(sourceAgents).forEach((agent) => {
    if (agent.available) {
      reasoning.push(`[AGENT ONLINE] ${agent.agentName}: Connected and reporting (Confidence: ${agent.confidence ?? 'N/A'}).`);
    } else {
      reasoning.push(`[AGENT OFFLINE/DEGRADED] ${agent.agentName}: Telemetry unavailable. Adjusting coordination weights.`);
    }
  });

  // C. Conflict Detection
  const { conflicts, blockedRoutes, safeRoutes } = detectConflicts(input, sourceAgents);
  conflicts.forEach((c) => reasoning.push(`[CONFLICT DETECTED] ${c}`));

  // D. Emergency Level Calculation
  const emergencyLevel = calculateEmergencyLevel(input, sourceAgents, conflicts, blockedRoutes);

  // E. Confidence Calculation
  const confidence = calculateConfidence(input, sourceAgents, conflicts);

  // F. Fallback Protocol Evaluation
  const { fallbackActivated, fallbackReason } = evaluateFallback(confidence, sourceAgents, conflicts, blockedRoutes);
  if (fallbackActivated && fallbackReason) {
    reasoning.push(`[FALLBACK PROTOCOL] ${fallbackReason}`);
  }

  // G. Recommended Actions Generation
  const recommendedActions = generateRecommendedActions(
    emergencyLevel,
    safeRoutes,
    blockedRoutes,
    input,
    sourceAgents,
    conflicts,
    fallbackActivated
  );

  // H. Summary Reasoning
  const incidentConfirmed = (input.fireAssessment?.hazardDetected ?? false) || (input.securityAssessment?.incidentVerified ?? false);
  const affectedAreasSet = new Set<string>();
  if (input.fireAssessment?.location) affectedAreasSet.add(input.fireAssessment.location);
  if (input.occupancyAssessment?.affectedZones) {
    input.occupancyAssessment.affectedZones.forEach((z) => affectedAreasSet.add(z));
  }
  const affectedAreas = Array.from(affectedAreasSet);
  if (affectedAreas.length === 0) affectedAreas.push('Block A Floor 4');

  reasoning.push(`Emergency Level consolidated as ${emergencyLevel} (Overall Coordination Confidence: ${confidence}).`);
  reasoning.push(`Synthesized ${safeRoutes.length} safe egress routes (${safeRoutes.join(', ')}) and ${blockedRoutes.length} blocked routes.`);

  const timestamp = input.timestamp || new Date().toISOString();
  const assessmentId = input.emergencyId || `coord_eval_${Date.now()}`;

  return {
    agentId: 'agent_coordinator',
    agentName: 'Emergency Coordinator',
    agentType: 'coordinator',
    timestamp,
    simulated: input.simulated ?? true,
    status: 'online',
    assessmentId,
    emergencyLevel,
    incidentConfirmed,
    affectedAreas,
    safeRoutes,
    blockedRoutes,
    conflicts,
    confidence,
    overallConfidence: confidence,
    recommendedActions,
    fallbackActivated,
    fallbackReason,
    sourceAgents,
    reasoning,
    reasons: reasoning,
    operatorNotes: input.operatorNotes || [],
  };
}

/**
 * 8. DEMO & TEST SUITE FUNCTION
 * Runs and outputs the demo scenarios specified in Section 15 of the prompt.
 */
export function runCoordinatorDemoScenario(): {
  scenarioA_NominalMultiAgent: CoordinatorAssessment;
  scenarioB_SecurityOfflineFallback: CoordinatorAssessment;
} {
  // SCENARIO A: Full Multi-Agent Evaluation with Exit A Hazard Conflict
  const fireAssessmentA: FireHazardAssessment = {
    agentId: 'agent_fire_hazard',
    agentName: 'Fire & Hazard Agent',
    agentType: 'fire_hazard',
    timestamp: new Date().toISOString(),
    simulated: true,
    status: 'online',
    hazardDetected: true,
    hazardType: 'FIRE',
    severity: 'HIGH',
    score: 85,
    location: 'Floor 4 Near Exit A',
    confidence: 0.92,
    recommendedAction: 'EVACUATE Floor 4',
    reasoning: ['Thermal threshold exceeded', 'High particulate concentration'],
  };

  const occupancyAssessmentA: OccupancyAssessment = {
    agentId: 'agent_occupancy',
    agentName: 'Occupancy Agent',
    agentType: 'occupancy',
    timestamp: new Date().toISOString(),
    simulated: true,
    status: 'online',
    totalOccupants: 124,
    affectedOccupants: 42,
    affectedZones: ['Floor 4'],
    occupancySeverity: 'HIGH',
    assistanceRequired: 3,
    evacuationPressureScore: 78,
    reasoning: ['42 occupants detected in primary hazard zone', '3 occupants with registered mobility needs'],
  };

  const securityAssessmentA: SecurityAssessment = {
    agentId: 'agent_security',
    agentName: 'Security Agent',
    agentType: 'security',
    timestamp: new Date().toISOString(),
    simulated: true,
    status: 'online',
    incidentVerified: true,
    confidence: 0.90,
    evidence: ['Exit A: UNSAFE due to heavy smoke spillover', 'Exit B: AVAILABLE and unobstructed'],
    accessStatus: 'BLOCKED',
    securitySeverity: 'HIGH',
    reasoning: ['CCTV feed confirms visual smoke at Exit A', 'Access doors unlocked for egress'],
  };

  const scenarioA_NominalMultiAgent = evaluateCoordinator({
    fireAssessment: fireAssessmentA,
    occupancyAssessment: occupancyAssessmentA,
    securityAssessment: securityAssessmentA,
    availableRoutes: ['Exit A', 'Exit B', 'Exit C'],
    routeLocations: {
      'Exit A': 'Floor 4 Near Hazard',
      'Exit B': 'Floor 4 West Wing Core',
      'Exit C': 'Ground Level Main Exit',
    },
    simulated: true,
  });

  // SCENARIO B: Security Agent OFFLINE - Reduced Confidence & Fallback Protocol Activation
  const scenarioB_SecurityOfflineFallback = evaluateCoordinator({
    fireAssessment: fireAssessmentA,
    occupancyAssessment: occupancyAssessmentA,
    securityAssessment: undefined,
    securityAgentStatus: 'offline',
    availableRoutes: ['Exit A', 'Exit B', 'Exit C'],
    routeLocations: {
      'Exit A': 'Floor 4 Near Hazard',
      'Exit B': 'Floor 4 West Wing Core',
      'Exit C': 'Ground Level Main Exit',
    },
    simulated: true,
  });

  return {
    scenarioA_NominalMultiAgent,
    scenarioB_SecurityOfflineFallback,
  };
}

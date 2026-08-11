import { CoordinatorInput, CoordinatorAssessment, OperatorNote } from './coordinator.types';
import { evaluateCoordinator } from './coordinator.logic';
import { FireHazardAssessment } from '../fire-hazard/fireHazard.types';
import { OccupancyAssessment } from '../occupancy/occupancy.types';
import { SecurityAssessment } from '../security/security.types';

/**
 * ADDITIONAL COORDINATOR SCENARIOS
 * -------------------------------------------------------------
 * These fixtures are pure INPUT DATA — they do not add new logic.
 * They exist to exercise branches of evaluateCoordinator() that
 * the primary 15-event demo (EXIT_A_CONFLICT) never reaches:
 *
 *   - MEDIUM / LOW / NORMAL emergency levels
 *   - Security-led (fire-absent) incidents
 *   - Headcount/access discrepancy conflict (block C)
 *   - All-routes-blocked emergency override fail-safe
 *   - Low-confidence fallback protocol activation
 *   - Human operator overriding an agent-confirmed-safe route
 *
 * All assessments are marked `simulated: true`. None of this reads
 * from real sensors, badge readers, or access control hardware —
 * software-only mock data, same as the existing demo scenario.
 * -------------------------------------------------------------
 */

const now = () => new Date().toISOString();

/* -------------------------------------------------------------------- */
/* SCENARIO 1 — FALSE ALARM / STAND-DOWN                                */
/* Smoke reading below threshold, no confirmed hazard.                  */
/* Expect: emergencyLevel NORMAL or LOW, incidentConfirmed=false-ish.   */
/* -------------------------------------------------------------------- */
export function buildFalseAlarmStandDownInput(): CoordinatorInput {
  const fireAssessment: FireHazardAssessment = {
    agentId: 'agent_fire_hazard',
    agentName: 'Fire & Hazard Agent',
    agentType: 'fire_hazard',
    timestamp: now(),
    simulated: true,
    status: 'online',
    hazardDetected: false,
    hazardType: 'NONE' as FireHazardAssessment['hazardType'],
    severity: 'LOW',
    score: 8,
    location: 'Floor 2 Break Room',
    confidence: 0.95,
    recommendedAction: 'MONITOR — no action required',
    reasoning: [
      'Brief particulate spike traced to toaster smoke, not combustion',
      'Thermal sensors show no rate-of-rise anomaly',
    ],
  };

  const occupancyAssessment: OccupancyAssessment = {
    agentId: 'agent_occupancy',
    agentName: 'Occupancy Agent',
    agentType: 'occupancy',
    timestamp: now(),
    simulated: true,
    status: 'online',
    totalOccupants: 96,
    affectedOccupants: 4,
    affectedZones: ['Floor 2 Break Room'],
    occupancySeverity: 'LOW',
    assistanceRequired: 0,
    evacuationPressureScore: 5,
    reasoning: ['Minimal occupancy in the affected micro-zone', 'No mobility-support occupants present'],
  };

  const securityAssessment: SecurityAssessment = {
    agentId: 'agent_security',
    agentName: 'Security Agent',
    agentType: 'security',
    timestamp: now(),
    simulated: true,
    status: 'online',
    incidentVerified: false,
    confidence: 0.9,
    evidence: ['CCTV shows no visible smoke or occupant distress', 'All doors nominal'],
    accessStatus: 'OPEN',
    securitySeverity: 'LOW',
    reasoning: ['Visual verification found no hazard indicators'],
  };

  return {
    emergencyId: 'coord_eval_false_alarm',
    fireAssessment,
    occupancyAssessment,
    securityAssessment,
    availableRoutes: ['Exit A', 'Exit B', 'Exit C'],
    routeLocations: {
      'Exit A': 'Floor 2 North Corridor',
      'Exit B': 'Floor 2 West Wing Core',
      'Exit C': 'Ground Level Main Exit',
    },
    simulated: true,
    timestamp: now(),
  } as CoordinatorInput;
}

/* -------------------------------------------------------------------- */
/* SCENARIO 2 — SECURITY-LED INCIDENT (NO FIRE)                         */
/* Unauthorized after-hours access breach; fire agent reports clean.    */
/* Expect: severity driven entirely by securitySeverity, not fire.      */
/* -------------------------------------------------------------------- */
export function buildSecurityOnlyBreachInput(): CoordinatorInput {
  const fireAssessment: FireHazardAssessment = {
    agentId: 'agent_fire_hazard',
    agentName: 'Fire & Hazard Agent',
    agentType: 'fire_hazard',
    timestamp: now(),
    simulated: true,
    status: 'online',
    hazardDetected: false,
    hazardType: 'NONE' as FireHazardAssessment['hazardType'],
    severity: 'LOW',
    score: 2,
    location: 'N/A',
    confidence: 0.97,
    recommendedAction: 'NO ACTION — no thermal or particulate anomaly',
    reasoning: ['All floors within nominal thermal and smoke baselines'],
  };

  const occupancyAssessment: OccupancyAssessment = {
    agentId: 'agent_occupancy',
    agentName: 'Occupancy Agent',
    agentType: 'occupancy',
    timestamp: now(),
    simulated: true,
    status: 'online',
    totalOccupants: 6,
    affectedOccupants: 1,
    affectedZones: ['Server Room B1'],
    occupancySeverity: 'LOW',
    assistanceRequired: 0,
    evacuationPressureScore: 10,
    reasoning: ['After-hours occupancy is minimal (skeleton facilities crew only)'],
  };

  const securityAssessment: SecurityAssessment = {
    agentId: 'agent_security',
    agentName: 'Security Agent',
    agentType: 'security',
    timestamp: now(),
    simulated: true,
    status: 'online',
    incidentVerified: true,
    confidence: 0.93,
    evidence: [
      'Badge log shows forced entry attempt at Server Room B1 door at 02:14',
      'CCTV confirms unrecognized individual in restricted zone',
    ],
    accessStatus: 'BLOCKED',
    securitySeverity: 'HIGH',
    reasoning: ['Forced-entry sensor triggered outside authorized access window', 'No matching badge credential on file'],
  };

  return {
    emergencyId: 'coord_eval_security_only',
    fireAssessment,
    occupancyAssessment,
    securityAssessment,
    availableRoutes: ['Exit A', 'Exit B', 'Exit C'],
    routeLocations: {
      'Exit A': 'Ground Floor North',
      'Exit B': 'Ground Floor West',
      'Exit C': 'Ground Floor South',
    },
    simulated: true,
    timestamp: now(),
  } as CoordinatorInput;
}

/* -------------------------------------------------------------------- */
/* SCENARIO 3 — DUAL SIMULTANEOUS HAZARD (MULTI-CONFLICT)               */
/* Fire on Floor 4 near Exit A AND an independent security breach       */
/* near Exit C. Expect >=2 conflicts, both routes blocked, CRITICAL.    */
/* -------------------------------------------------------------------- */
export function buildDualHazardMultiConflictInput(): CoordinatorInput {
  const fireAssessment: FireHazardAssessment = {
    agentId: 'agent_fire_hazard',
    agentName: 'Fire & Hazard Agent',
    agentType: 'fire_hazard',
    timestamp: now(),
    simulated: true,
    status: 'online',
    hazardDetected: true,
    hazardType: 'FIRE',
    severity: 'HIGH',
    score: 88,
    location: 'Floor 4 Near Exit A',
    confidence: 0.94,
    recommendedAction: 'EVACUATE Floor 4 immediately',
    reasoning: ['Sustained thermal rate-of-rise', 'Smoke density exceeds critical threshold'],
  };

  const occupancyAssessment: OccupancyAssessment = {
    agentId: 'agent_occupancy',
    agentName: 'Occupancy Agent',
    agentType: 'occupancy',
    timestamp: now(),
    simulated: true,
    status: 'online',
    totalOccupants: 140,
    affectedOccupants: 51,
    affectedZones: ['Floor 4', 'Ground Floor South Concourse'],
    occupancySeverity: 'HIGH',
    assistanceRequired: 4,
    evacuationPressureScore: 84,
    reasoning: ['51 occupants across two affected zones', '4 occupants with registered mobility needs'],
  };

  const securityAssessment: SecurityAssessment = {
    agentId: 'agent_security',
    agentName: 'Security Agent',
    agentType: 'security',
    timestamp: now(),
    simulated: true,
    status: 'online',
    incidentVerified: true,
    confidence: 0.89,
    evidence: [
      'Exit A: UNSAFE due to heavy smoke spillover',
      'Exit C: unsafe — CCTV shows unauthorized crowd obstruction at Ground Floor South Concourse',
    ],
    accessStatus: 'BLOCKED',
    securitySeverity: 'HIGH',
    reasoning: ['Two independent CCTV feeds confirm separate obstructions at Exit A and Exit C'],
  };

  return {
    emergencyId: 'coord_eval_dual_hazard',
    fireAssessment,
    occupancyAssessment,
    securityAssessment,
    availableRoutes: ['Exit A', 'Exit B', 'Exit C'],
    routeLocations: {
      'Exit A': 'Floor 4 Near Hazard',
      'Exit B': 'Floor 4 West Wing Core',
      'Exit C': 'Ground Floor South Concourse',
    },
    simulated: true,
    timestamp: now(),
  } as CoordinatorInput;
}

/* -------------------------------------------------------------------- */
/* SCENARIO 4 — ALL EXITS BLOCKED (EMERGENCY OVERRIDE FAIL-SAFE)        */
/* Every primary route is independently compromised. Exercises the     */
/* fail-safe branch in detectConflicts() that injects an override      */
/* access vector when safeRoutes.length === 0.                         */
/* -------------------------------------------------------------------- */
export function buildAllExitsBlockedInput(): CoordinatorInput {
  const fireAssessment: FireHazardAssessment = {
    agentId: 'agent_fire_hazard',
    agentName: 'Fire & Hazard Agent',
    agentType: 'fire_hazard',
    timestamp: now(),
    simulated: true,
    status: 'online',
    hazardDetected: true,
    hazardType: 'FIRE',
    severity: 'CRITICAL',
    score: 97,
    location: 'hazard',
    confidence: 0.9,
    recommendedAction: 'IMMEDIATE EVACUATION — all standard routes compromised',
    reasoning: ['Fire has spread to multiple core corridors', 'Smoke has filled central stairwell shafts'],
  };

  const occupancyAssessment: OccupancyAssessment = {
    agentId: 'agent_occupancy',
    agentName: 'Occupancy Agent',
    agentType: 'occupancy',
    timestamp: now(),
    simulated: true,
    status: 'online',
    totalOccupants: 88,
    affectedOccupants: 60,
    affectedZones: ['Floor 3', 'Floor 4'],
    occupancySeverity: 'HIGH',
    assistanceRequired: 5,
    evacuationPressureScore: 95,
    reasoning: ['60 occupants trapped across two floors', '5 occupants with registered mobility needs'],
  };

  const securityAssessment: SecurityAssessment = {
    agentId: 'agent_security',
    agentName: 'Security Agent',
    agentType: 'security',
    timestamp: now(),
    simulated: true,
    status: 'online',
    incidentVerified: true,
    confidence: 0.85,
    evidence: [
      'Exit A: unsafe — solenoid failure and smoke',
      'Exit B: unsafe — corridor blocked by debris',
      'Exit C: unsafe — CCTV confirms flame visible at threshold',
    ],
    accessStatus: 'BLOCKED',
    securitySeverity: 'HIGH',
    reasoning: ['All three monitored egress points report independent obstructions'],
  };

  // routeLocations deliberately all resolve near "hazard" so every route
  // trips the isNearHazard check in detectConflicts(), forcing the
  // fail-safe branch to fire.
  return {
    emergencyId: 'coord_eval_all_blocked',
    fireAssessment,
    occupancyAssessment,
    securityAssessment,
    availableRoutes: ['Exit A', 'Exit B', 'Exit C'],
    routeLocations: {
      'Exit A': 'Floor 4 hazard corridor',
      'Exit B': 'Floor 3 hazard adjacent',
      'Exit C': 'hazard threshold',
    },
    simulated: true,
    timestamp: now(),
  } as CoordinatorInput;
}

/* -------------------------------------------------------------------- */
/* SCENARIO 5 — LOW-CONFIDENCE FALLBACK PROTOCOL                        */
/* Every agent reports, but with degraded/uncertain confidence.         */
/* Expect: fallbackActivated = true.                                    */
/* -------------------------------------------------------------------- */
export function buildLowConfidenceFallbackInput(): CoordinatorInput {
  const fireAssessment: FireHazardAssessment = {
    agentId: 'agent_fire_hazard',
    agentName: 'Fire & Hazard Agent',
    agentType: 'fire_hazard',
    timestamp: now(),
    simulated: true,
    status: 'online',
    hazardDetected: true,
    hazardType: 'FIRE',
    severity: 'HIGH',
    score: 62,
    location: 'Floor 4 Near Exit A',
    confidence: 0.38,
    recommendedAction: 'INVESTIGATE — sensor readings inconsistent across zone',
    reasoning: ['Two of four Floor 4 smoke sensors report conflicting readings', 'Possible sensor fault cannot be ruled out'],
  };

  const occupancyAssessment: OccupancyAssessment = {
    agentId: 'agent_occupancy',
    agentName: 'Occupancy Agent',
    agentType: 'occupancy',
    timestamp: now(),
    simulated: true,
    status: 'online',
    totalOccupants: 40,
    affectedOccupants: 20,
    affectedZones: ['Floor 4'],
    occupancySeverity: 'MEDIUM',
    assistanceRequired: 1,
    evacuationPressureScore: 40,
    reasoning: ['Badge telemetry gap of ~8 minutes reduces census reliability'],
  };

  const securityAssessment: SecurityAssessment = {
    agentId: 'agent_security',
    agentName: 'Security Agent',
    agentType: 'security',
    timestamp: now(),
    simulated: true,
    status: 'online',
    incidentVerified: false,
    confidence: 0.31,
    evidence: ['CCTV feed on Floor 4 is intermittently dropping frames', 'Unable to fully confirm or rule out obstruction'],
    accessStatus: 'BLOCKED',
    securitySeverity: 'MEDIUM',
    reasoning: ['Degraded camera feed prevents high-confidence verification'],
  };

  return {
    emergencyId: 'coord_eval_low_confidence',
    fireAssessment,
    occupancyAssessment,
    securityAssessment,
    availableRoutes: ['Exit A', 'Exit B', 'Exit C'],
    routeLocations: {
      'Exit A': 'Floor 4 Near Hazard',
      'Exit B': 'Floor 4 West Wing Core',
      'Exit C': 'Ground Level Main Exit',
    },
    simulated: true,
    timestamp: now(),
  } as CoordinatorInput;
}

/* -------------------------------------------------------------------- */
/* SCENARIO 6 — HEADCOUNT / ACCESS DISCREPANCY                          */
/* Occupancy census disagrees with security badge-entry telemetry.      */
/* Exercises conflict block C, which the primary demo never triggers.   */
/* -------------------------------------------------------------------- */
export function buildHeadcountDiscrepancyInput(): CoordinatorInput {
  const fireAssessment: FireHazardAssessment = {
    agentId: 'agent_fire_hazard',
    agentName: 'Fire & Hazard Agent',
    agentType: 'fire_hazard',
    timestamp: now(),
    simulated: true,
    status: 'online',
    hazardDetected: true,
    hazardType: 'FIRE',
    severity: 'MEDIUM',
    score: 44,
    location: 'Floor 2 East Wing',
    confidence: 0.8,
    recommendedAction: 'PRECAUTIONARY EVACUATION of Floor 2 East Wing',
    reasoning: ['Localized smoke source contained to one zone so far'],
  };

  const occupancyAssessment: OccupancyAssessment = {
    agentId: 'agent_occupancy',
    agentName: 'Occupancy Agent',
    agentType: 'occupancy',
    timestamp: now(),
    simulated: true,
    status: 'online',
    totalOccupants: 55,
    affectedOccupants: 22,
    affectedZones: ['Floor 2 East Wing'],
    occupancySeverity: 'MEDIUM',
    assistanceRequired: 1,
    evacuationPressureScore: 48,
    reasoning: ['22 badge-confirmed occupants in the affected zone'],
  };

  const securityAssessment: SecurityAssessment = {
    agentId: 'agent_security',
    agentName: 'Security Agent',
    agentType: 'security',
    timestamp: now(),
    simulated: true,
    status: 'online',
    incidentVerified: true,
    confidence: 0.82,
    evidence: [
      'Turnstile entries for Floor 2 East Wing this shift: 31 — exceeds Occupancy Agent badge count',
      'Exit A: available and unobstructed',
    ],
    accessStatus: 'OPEN',
    securitySeverity: 'MEDIUM',
    reasoning: ['Turnstile access log flags a 9-person discrepancy against badge telemetry'],
  };

  return {
    emergencyId: 'coord_eval_headcount_discrepancy',
    fireAssessment,
    occupancyAssessment,
    securityAssessment,
    availableRoutes: ['Exit A', 'Exit B', 'Exit C'],
    routeLocations: {
      'Exit A': 'Floor 2 East Wing Corridor',
      'Exit B': 'Floor 2 West Wing Core',
      'Exit C': 'Ground Level Main Exit',
    },
    simulated: true,
    timestamp: now(),
  } as CoordinatorInput;
}

/* -------------------------------------------------------------------- */
/* SCENARIO 7 — OPERATOR OVERRIDES AN AGENT-CONFIRMED-SAFE ROUTE        */
/* Agents agree Exit B is safe; a human operator note blocks it anyway  */
/* (e.g. known maintenance closure the agents can't see). Exercises     */
/* the human-in-the-loop override branch (block D) on a route the       */
/* automated agents did NOT flag.                                       */
/* -------------------------------------------------------------------- */
export function buildOperatorOverrideInput(): CoordinatorInput {
  const fireAssessment: FireHazardAssessment = {
    agentId: 'agent_fire_hazard',
    agentName: 'Fire & Hazard Agent',
    agentType: 'fire_hazard',
    timestamp: now(),
    simulated: true,
    status: 'online',
    hazardDetected: true,
    hazardType: 'FIRE',
    severity: 'HIGH',
    score: 80,
    location: 'Floor 4 Near Exit A',
    confidence: 0.91,
    recommendedAction: 'EVACUATE Floor 4',
    reasoning: ['Thermal and particulate thresholds both exceeded'],
  };

  const occupancyAssessment: OccupancyAssessment = {
    agentId: 'agent_occupancy',
    agentName: 'Occupancy Agent',
    agentType: 'occupancy',
    timestamp: now(),
    simulated: true,
    status: 'online',
    totalOccupants: 118,
    affectedOccupants: 39,
    affectedZones: ['Floor 4'],
    occupancySeverity: 'HIGH',
    assistanceRequired: 2,
    evacuationPressureScore: 70,
    reasoning: ['39 occupants in the hazard zone', '2 registered mobility-support occupants'],
  };

  const securityAssessment: SecurityAssessment = {
    agentId: 'agent_security',
    agentName: 'Security Agent',
    agentType: 'security',
    timestamp: now(),
    simulated: true,
    status: 'online',
    incidentVerified: true,
    confidence: 0.9,
    evidence: ['Exit A: UNSAFE due to smoke spillover', 'Exit B: AVAILABLE and unobstructed per CCTV and door hardware'],
    accessStatus: 'BLOCKED',
    securitySeverity: 'HIGH',
    reasoning: ['CCTV and solenoid telemetry both confirm Exit B is clear'],
  };

  const operatorNotes: OperatorNote[] = [
    {
      noteId: 'note_001',
      operatorId: 'op_lchen',
      emergencyId: 'coord_eval_operator_override',
      message: 'Exit B is under scheduled maintenance and structurally unsafe — mark blocked, agents cannot see the physical barricade.',
      timestamp: now(),
      source: 'HUMAN_OPERATOR',
    },
  ];

  return {
    emergencyId: 'coord_eval_operator_override',
    fireAssessment,
    occupancyAssessment,
    securityAssessment,
    availableRoutes: ['Exit A', 'Exit B', 'Exit C'],
    routeLocations: {
      'Exit A': 'Floor 4 Near Hazard',
      'Exit B': 'Floor 4 West Wing Core',
      'Exit C': 'Ground Level Main Exit',
    },
    operatorNotes,
    simulated: true,
    timestamp: now(),
  } as CoordinatorInput;
}

/* -------------------------------------------------------------------- */
/* SCENARIO REGISTRY                                                     */
/* -------------------------------------------------------------------- */
export type ScenarioId =
  | 'FALSE_ALARM_STANDDOWN'
  | 'SECURITY_ONLY_BREACH'
  | 'DUAL_HAZARD_MULTI_CONFLICT'
  | 'ALL_EXITS_BLOCKED'
  | 'LOW_CONFIDENCE_FALLBACK'
  | 'HEADCOUNT_DISCREPANCY'
  | 'OPERATOR_OVERRIDE';

const SCENARIO_BUILDERS: Record<ScenarioId, () => CoordinatorInput> = {
  FALSE_ALARM_STANDDOWN: buildFalseAlarmStandDownInput,
  SECURITY_ONLY_BREACH: buildSecurityOnlyBreachInput,
  DUAL_HAZARD_MULTI_CONFLICT: buildDualHazardMultiConflictInput,
  ALL_EXITS_BLOCKED: buildAllExitsBlockedInput,
  LOW_CONFIDENCE_FALLBACK: buildLowConfidenceFallbackInput,
  HEADCOUNT_DISCREPANCY: buildHeadcountDiscrepancyInput,
  OPERATOR_OVERRIDE: buildOperatorOverrideInput,
};

export const SCENARIO_LABELS: Record<ScenarioId, string> = {
  FALSE_ALARM_STANDDOWN: 'False Alarm / Stand-Down',
  SECURITY_ONLY_BREACH: 'Security-Only Breach (No Fire)',
  DUAL_HAZARD_MULTI_CONFLICT: 'Dual Simultaneous Hazard',
  ALL_EXITS_BLOCKED: 'All Exits Blocked (Fail-Safe Override)',
  LOW_CONFIDENCE_FALLBACK: 'Low-Confidence Fallback Protocol',
  HEADCOUNT_DISCREPANCY: 'Headcount / Access Discrepancy',
  OPERATOR_OVERRIDE: 'Human Operator Override',
};

/** Build the raw CoordinatorInput for a given scenario without evaluating it. */
export function buildScenarioInput(scenarioId: ScenarioId): CoordinatorInput {
  return SCENARIO_BUILDERS[scenarioId]();
}

/** Build and evaluate a single scenario through the real coordinator logic. */
export function runScenario(scenarioId: ScenarioId): CoordinatorAssessment {
  const input = buildScenarioInput(scenarioId);
  return evaluateCoordinator(input);
}

/** Run every extended scenario and return the full set of assessments. */
export function runAllExtendedScenarios(): Record<ScenarioId, CoordinatorAssessment> {
  const result = {} as Record<ScenarioId, CoordinatorAssessment>;
  (Object.keys(SCENARIO_BUILDERS) as ScenarioId[]).forEach((id) => {
    result[id] = runScenario(id);
  });
  return result;
}
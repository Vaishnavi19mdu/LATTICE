import { SharedEmergencyState, INITIAL_EMERGENCY_STATE } from './emergencyScenario';
import { StructuredMockEvent } from './mockEvents';

/**
 * scenarioPresets.ts
 * ------------------
 * Generates a randomized emergency scenario each time `getRandomScenario()`
 * is called. 5 distinct emergency types, each with its own agent roles,
 * dialogue, and topic flow. Every run also randomizes severity, floor,
 * occupancy, which exit is compromised, whether an agent goes offline,
 * and which adjacent building gets the mutual-aid alert — producing
 * many effectively-unique playthroughs from 5 base templates.
 */

// ---------- shared random helpers ----------
const rand = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
const pick = <T,>(arr: T[]): T => arr[rand(0, arr.length - 1)];
const uid = () => Math.random().toString(36).slice(2, 8);

const FLOORS = [2, 3, 4, 5, 6];
const NEARBY_BUILDINGS = ['Building B (Engineering)', 'Building C (Research Annex)', 'Building D (Library Wing)'];
const EXIT_KEYS: ('A' | 'B' | 'C')[] = ['A', 'B', 'C'];

interface ScenarioParams {
  floor: number;
  occupants: number;
  assistanceRequired: number;
  blockedExit: 'A' | 'B' | 'C';
  offlineAgent: string | null; // agentId or null
  targetBuilding: string;
  incidentId: string;
}

function randomParams(offlineCandidates: string[]): ScenarioParams {
  return {
    floor: pick(FLOORS),
    occupants: rand(18, 68),
    assistanceRequired: rand(0, 5),
    blockedExit: pick(EXIT_KEYS),
    offlineAgent: Math.random() < 0.25 ? pick(offlineCandidates) : null,
    targetBuilding: pick(NEARBY_BUILDINGS),
    incidentId: `INC-${new Date().getFullYear()}-${String(rand(1, 12)).padStart(2, '0')}${String(rand(1, 28)).padStart(2, '0')}-${uid()}`,
  };
}

function otherExits(blocked: 'A' | 'B' | 'C'): ('A' | 'B' | 'C')[] {
  return EXIT_KEYS.filter((e) => e !== blocked);
}

function buildExitState(blocked: 'A' | 'B' | 'C') {
  const state: Record<'A' | 'B' | 'C', 'available' | 'unsafe' | 'blocked' | 'checking'> = {
    A: 'available',
    B: 'available',
    C: 'available',
  };
  state[blocked] = 'unsafe';
  return state;
}

function baseInitialState(p: ScenarioParams, type: SharedEmergencyState['incident']['type'], severity: SharedEmergencyState['incident']['severity'], zoneLabel: string, smokePpm: number, temperatureC: number, offlineAgentIds: string[]): SharedEmergencyState {
  const agentStates: SharedEmergencyState['agentStates'] = {
    agent_fire_hazard: 'idle',
    agent_coordinator: 'idle',
    agent_occupancy: 'idle',
    agent_security: 'idle',
    agent_ethical_priority: 'idle',
    agent_cross_building: 'idle',
  };
  offlineAgentIds.forEach((id) => {
    if (agentStates[id] !== undefined) agentStates[id] = 'offline';
  });

  return {
    ...INITIAL_EMERGENCY_STATE,
    scenarioId: `${type.toUpperCase()}_FLOOR_${p.floor}_EMERGENCY`,
    incident: {
      id: p.incidentId,
      buildingId: 'building_A',
      type,
      floor: p.floor,
      zone: zoneLabel,
      severity,
      smokePpm,
      temperatureC,
    },
    occupancy: {
      total: p.occupants,
      assistanceRequired: p.assistanceRequired,
      floorOccupancy: { [String(p.floor)]: p.occupants },
    },
    exits: buildExitState(p.blockedExit),
    agentStates,
    crossBuildingAlerts: [],
    responsePlan: null,
    eventLogs: [],
    activeStepIndex: 0,
    totalSteps: 15,
    playbackMode: 'PAUSED',
    currentStage: 'IDLE',
    currentActivity: 'System nominal — Standby mode',
    operatorIntervention: null,
  };
}

// Generic event factory to cut repetition
function evt(
  i: number,
  from: [string, string, string],
  to: [string, string, string],
  topic: string,
  type: string,
  message: string,
  thinkingText: string,
  task: string,
  inputs: Record<string, string>,
  capabilitiesUsed: string[],
  reasoningSummary: string,
  nextAction: string,
  stateUpdates?: StructuredMockEvent['stateUpdates'],
  isInterrupt?: boolean
): StructuredMockEvent {
  return {
    id: `evt-${uid()}-${i}`,
    eventIndex: i,
    fromAgentId: from[0],
    fromAgentName: from[1],
    fromIcon: from[2],
    toAgentId: to[0],
    toAgentName: to[1],
    toIcon: to[2],
    type,
    topic,
    message,
    thinkingText,
    task,
    inputs,
    capabilitiesUsed,
    reasoningSummary,
    nextAction,
    isInterrupt,
    stateUpdates,
  };
}

const A_FIRE: [string, string, string] = ['agent_fire_hazard', 'Fire & Hazard Agent', '🔥'];
const A_COORD: [string, string, string] = ['agent_coordinator', 'Emergency Coordinator', '🧠'];
const A_OCC: [string, string, string] = ['agent_occupancy', 'Occupancy Agent', '👥'];
const A_SEC: [string, string, string] = ['agent_security', 'Security Agent', '🛡️'];
const A_ETH: [string, string, string] = ['agent_ethical_priority', 'Ethical Priority Agent', '❤️'];
const A_CROSS: [string, string, string] = ['agent_cross_building', 'Cross-Building Collaboration Agent', '🌐'];
const A_HUMAN: [string, string, string] = ['HUMAN_OPERATOR', 'LATTICE Operator', '👤'];
const A_CONSOLE: [string, string, string] = ['OPERATOR_CONSOLE', 'LATTICE Operator Console', '💻'];

// ============================================================
// TYPE 1: FIRE & SMOKE
// ============================================================
function buildFireScenario() {
  const p = randomParams(['agent_security', 'agent_cross_building']);
const severity = pick(['medium', 'high', 'critical'] as const);
  const smokePpm = rand(60, 140);
  const temperatureC = rand(55, 95);
  const zone = `Floor ${p.floor} Exit ${p.blockedExit} Corridor`;
  const [safe1, safe2] = otherExits(p.blockedExit);
  const initialState = baseInitialState(p, 'fire', severity, zone, smokePpm - 20, temperatureC - 15, p.offlineAgent ? [p.offlineAgent] : []);

  const events: StructuredMockEvent[] = [
    evt(1, A_FIRE, A_COORD, 'HAZARD_DETECTION_REPORT', 'hazard_detected', `Smoke detected on Floor ${p.floor}.`, 'Evaluating optical particle scatter & threshold deltas...', `Detecting smoke particle concentration on Floor ${p.floor}`, { 'Smoke Density': `${smokePpm - 20} PPM`, 'Threshold': '30 PPM', 'Location': zone }, ['detect_hazard', 'assess_severity'], `Smoke scatter exceeded threshold. Initiating incident broadcast.`, 'Transmit initial hazard alert to Emergency Coordinator', { incident: { ...initialState.incident, severity: 'medium' }, currentActivity: `Assessing Floor ${p.floor} smoke telemetry` }),
    evt(2, A_FIRE, A_COORD, 'THERMAL_ACCELERATION_UPDATE', 'hazard_assessment', 'Temperature is rising rapidly.', 'Cross-referencing thermal sensors and flame propagation rate...', 'Monitoring thermal gradient & flame spread', { 'Temperature': `${temperatureC}°C`, 'Hazard': severity.toUpperCase() }, ['assess_severity', 'track_propagation'], `Thermal rate of rise confirms active combustion. Upgrading severity to ${severity.toUpperCase()}.`, 'Recommend immediate zone response', { incident: { ...initialState.incident, severity, smokePpm, temperatureC }, currentActivity: 'Tracking thermal expansion & flame propagation' }),
    evt(3, A_COORD, A_OCC, 'OCCUPANCY_TELEMETRY_QUERY', 'occupancy_request', `Provide current Floor ${p.floor} occupancy.`, 'Querying Occupancy Agent via registry for live census...', 'Querying live population census & mobility needs', { 'Target Floor': `Floor ${p.floor}`, 'Incident Severity': severity.toUpperCase() }, ['synthesize_plan', 'query_occupancy'], 'Establishing occupant count prior to route calculation.', 'Await Occupancy Agent telemetry', { currentActivity: `Requesting population census for Floor ${p.floor}` }),
    evt(4, A_OCC, A_COORD, 'OCCUPANT_CENSUS_PAYLOAD', 'occupancy_response', `${p.occupants} occupants detected on Floor ${p.floor}.`, 'Counting active badge signals & cross-referencing registry...', 'Aggregating smart badge signals & accessibility registry', { 'Active Badges': String(p.occupants), 'Support Registry': `${p.assistanceRequired} occupants` }, ['get_occupancy', 'flag_vulnerable_persons'], `${p.occupants} badges confirmed. ${p.assistanceRequired} registered for mobility support.`, 'Transmit counts to Coordinator', { occupancy: { total: p.occupants, assistanceRequired: p.assistanceRequired, floorOccupancy: { [String(p.floor)]: p.occupants } }, currentActivity: `Occupancy telemetry delivered: ${p.occupants} occupants` }),
    evt(5, A_COORD, A_SEC, 'ROUTE_SECURITY_CHECK', 'route_verification_request', 'Verify available evacuation routes.', 'Identifying egress portals and querying Security Agent...', 'Requesting door solenoid & CCTV route validation', { 'Portals': `Exit A, Exit B, Exit C`, 'Zone': `Floor ${p.floor}` }, ['query_security_telemetry'], 'Checking electronic door hardware before assigning egress paths.', 'Await Security Agent confirmation', { currentActivity: 'Verifying exit status with Security Agent' }),
    p.offlineAgent === 'agent_security'
      ? evt(6, A_SEC, A_COORD, 'TELEMETRY_UNAVAILABLE_WARNING', 'security_alert', 'Security Agent feed unreachable.', 'Attempting to reconnect to CCTV/lock telemetry...', 'Validating electronic lock solenoids & optical feeds', { 'Status': 'OFFLINE' }, ['verify_incident'], 'Security telemetry feed is down. Incident verification pending manual dispatch.', 'Alert Coordinator to telemetry gap', { currentActivity: 'Security Agent OFFLINE — telemetry gap detected' })
      : evt(6, A_SEC, A_COORD, 'ACCESS_ANOMALY_DETECTED', 'security_alert', `Exit ${p.blockedExit} has an access anomaly.`, 'Checking electronic lock solenoid telemetry & CCTV optics...', 'Validating electronic lock solenoids & optical feeds', { [`Exit ${p.blockedExit} Solenoid`]: 'JAMMED (Error 504)', 'CCTV Feed': 'Corridor Obstruction' }, ['verify_incident', 'check_access_locks'], `Access control log confirms Exit ${p.blockedExit} solenoid failure.`, `Alert Coordinator to Exit ${p.blockedExit} hardware lock anomaly`, { exits: buildExitState(p.blockedExit), currentActivity: `Security alert: anomaly at Exit ${p.blockedExit}` }),
    evt(7, A_FIRE, A_COORD, 'CORRIDOR_FIRE_ENCROACHMENT', 'hazard_update', `Fire propagation is approaching the corridor near Exit ${p.blockedExit}.`, 'Detecting rapid smoke plume expansion...', 'Tracking real-time corridor smoke encroachment', { 'Smoke Vector': `Exit ${p.blockedExit} Corridor`, 'Expansion Rate': '+15 PPM/sec' }, ['detect_hazard', 'trigger_interrupt'], 'Smoke plume expansion is cutting off primary corridor access.', 'Trigger high-priority hazard interrupt', { incident: { ...initialState.incident, severity: 'critical', smokePpm: smokePpm + 30, temperatureC: temperatureC + 6, zone: `${zone} (ENCROACHING)` }, currentActivity: `Hazard interrupt: fire encroaching Exit ${p.blockedExit}` }, true),
    evt(8, A_COORD, A_COORD, 'MULTI_AGENT_CONFLICT_EVALUATION', 'conflict_detected', `Conflict detected. Exit ${p.blockedExit} cannot be considered safe.`, 'Cross-evaluating fire encroachment + lock anomaly...', 'Evaluating route conflict between fire location and egress route', { [`Exit ${p.blockedExit} Status`]: 'FIRE + LOCK FAILURE' }, ['resolve_conflicts', 'recalculate_routes'], `Dual hazard makes Exit ${p.blockedExit} unsafe. Disqualifying from route options.`, 'Re-evaluate remaining egress paths', { exits: buildExitState(p.blockedExit), currentActivity: `Conflict detected: Exit ${p.blockedExit} designated UNSAFE` }),
    evt(9, A_SEC, A_COORD, 'PRIMARY_ROUTE_CONFIRMATION', 'route_available', `Exit ${safe1} confirmed available.`, `Re-verifying Exit ${safe1} camera feed & magnetic locks...`, 'Confirming CCTV and door solenoids', { [`Exit ${safe1} Status`]: 'OPEN' }, ['check_access_locks', 'verify_incident'], `Camera feed confirms clear passageway at Exit ${safe1}.`, 'Confirm route availability to Coordinator', { currentActivity: `Route confirmed: Exit ${safe1} clear and operational` }),
    evt(10, A_ETH, A_COORD, 'EQUITY_ASSISTANCE_DISPATCH', 'assistance_priority', `${p.assistanceRequired} registered occupants require additional assistance.`, 'Calculating equity-weighted dispatch priority...', 'Evaluating registered mobility assistance requirements', { 'Mobility Support': `${p.assistanceRequired} occupants` }, ['evaluate_assistance_priority', 'equity_scoring'], `${p.assistanceRequired} occupants have pre-registered mobility requirements.`, 'Recommend dedicated assistance team dispatch', { currentActivity: `Dispatching assistance team for ${p.assistanceRequired} occupants` }),
    evt(11, A_COORD, A_COORD, 'GRAPH_REPLANNING_ENGINE', 'replanning_started', 'Re-evaluating evacuation routes using current hazard and occupancy information.', 'Executing graph replanning with dynamic hazard penalties...', 'Synthesizing inputs into adaptive response graph', { 'Excluded': `Exit ${p.blockedExit}`, 'Target Route': `Exit ${safe1}` }, ['recalculate_routes', 'synthesize_plan'], 'Synthesizing hazard, occupancy, and constraint data into an updated egress matrix.', 'Prepare campus mutual aid notification', { currentActivity: `Replanning egress graph to prioritize Exit ${safe1}` }),
    evt(12, A_CROSS, A_CROSS, 'CAMPUS_MUTUAL_AID_NOTIFICATION', 'cross_building_alert', `Building A reports a Floor ${p.floor} fire emergency. Avoid affected shared routes.`, 'Checking HVAC damper links & shared concourse doors...', 'Broadcasting mutual aid alert & dampening HVAC concourse', { 'Source': `Building A Floor ${p.floor}`, 'Action': 'Isolate Concourse & HVAC' }, ['identify_affected_buildings', 'broadcast_mutual_aid'], `Transmitting concourse isolation command to ${p.targetBuilding}.`, 'Confirm HVAC damper closure', (prev: SharedEmergencyState) => ({ crossBuildingAlerts: [...prev.crossBuildingAlerts, { id: `cb_${uid()}`, targetBuilding: p.targetBuilding, message: `Floor ${p.floor} fire emergency in Building A. Concourse HVAC isolated.`, timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }), status: 'active' }], currentActivity: `Mutual aid broadcast sent to ${p.targetBuilding}` })),
    evt(13, A_HUMAN, A_COORD, 'HUMAN_OVERRIDE_DIRECTIVE', 'operator_intervention', `Do not use Exit ${p.blockedExit}.`, 'Human operator issuing explicit directive via control console...', 'Processing human operator intervention constraint', { 'Directive': `Do not use Exit ${p.blockedExit}` }, ['human_in_the_loop_override'], `Human operator confirmed restriction on Exit ${p.blockedExit}.`, 'Acknowledge operator directive', { operatorIntervention: `Do not use Exit ${p.blockedExit}.`, currentActivity: `Operator instruction received: "Do not use Exit ${p.blockedExit}"` }, true),
    evt(14, A_COORD, A_COORD, 'DIRECTIVE_INTEGRATION_CONFIRMATION', 'operator_instruction_applied', `Operator instruction received. Exit ${p.blockedExit} removed from available route set.`, 'Applying operator hard constraint to egress graph...', `Locking Exit ${p.blockedExit} exclusion rule`, { 'Hard Constraint': `Exit ${p.blockedExit} = FORBIDDEN` }, ['resolve_conflicts', 'synthesize_plan'], `Exit ${p.blockedExit} permanently excluded per operator command.`, 'Finalize response plan', { exits: buildExitState(p.blockedExit), currentActivity: `Operator directive applied: Exit ${p.blockedExit} locked as FORBIDDEN` }),
    evt(15, A_COORD, A_CONSOLE, 'CONSOLIDATED_RESPONSE_PLAN', 'response_plan_generated', `Redirect Floor ${p.floor} occupants to Exit ${safe1}, dispatch assistance for ${p.assistanceRequired} occupants, isolate zone, notify ${p.targetBuilding}.`, 'Compiling final multi-agent response plan payload...', 'Generating final emergency response plan', { 'Primary Egress': `Exit ${safe1}` }, ['synthesize_plan', 'present_to_human'], 'Consolidated plan generated with agreement across all agents.', 'Await Operator final execution approval', { responsePlan: { emergencyLevel: 'CRITICAL', safeRoutes: [`Exit ${safe1}`, `Exit ${safe2}`], blockedRoutes: [`Exit ${p.blockedExit}`], recommendedActions: [`Evacuate all ${p.occupants} occupants via Exit ${safe1}`, `Dispatch support team for ${p.assistanceRequired} mobility occupants`, 'Isolate HVAC concourse ducting', `Maintain thermal monitoring along Exit ${safe1}`], humanDecision: null }, currentActivity: 'Response plan finalized — Awaiting operator approval' }),
  ];

  return { initialState, events };
}

// ============================================================
// TYPE 2: GAS LEAK
// ============================================================
function buildGasLeakScenario() {
  const p = randomParams(['agent_occupancy', 'agent_cross_building']);
const severity = pick(['high', 'critical'] as const);
  const zone = `Floor ${p.floor} Mechanical Riser near Exit ${p.blockedExit}`;
  const [safe1, safe2] = otherExits(p.blockedExit);
  const initialState = baseInitialState(p, 'gas', severity, zone, 0, 24, p.offlineAgent ? [p.offlineAgent] : []);

  const events: StructuredMockEvent[] = [
    evt(1, A_FIRE, A_COORD, 'GAS_CONCENTRATION_ALERT', 'hazard_detected', `Elevated natural gas concentration detected on Floor ${p.floor}.`, 'Cross-referencing VOC sensors near mechanical risers...', `Detecting gas concentration on Floor ${p.floor}`, { 'Gas Level': `${rand(40, 90)}% LEL`, 'Location': zone }, ['detect_hazard', 'assess_severity'], 'VOC sensor threshold breached near mechanical riser.', 'Transmit gas hazard alert to Coordinator', { incident: { ...initialState.incident, severity: 'medium' }, currentActivity: `Assessing gas concentration on Floor ${p.floor}` }),
    evt(2, A_SEC, A_COORD, 'IGNITION_SOURCE_LOCKDOWN', 'security_alert', 'Cutting power to non-essential circuits to eliminate ignition sources.', 'Scanning electrical panels for ignition risk near the leak zone...', 'De-energizing non-critical circuits near hazard zone', { 'Action': 'Emergency electrical lockdown', 'Zone': zone }, ['check_access_locks'], 'Isolating potential ignition sources is priority one for gas hazards.', 'Confirm lockdown completion to Coordinator', { currentActivity: 'Ignition source lockdown in progress' }),
    evt(3, A_COORD, A_OCC, 'OCCUPANCY_TELEMETRY_QUERY', 'occupancy_request', `Provide current Floor ${p.floor} occupancy for gas evacuation.`, 'Querying Occupancy Agent for live census...', 'Querying live population census & mobility needs', { 'Target Floor': `Floor ${p.floor}` }, ['synthesize_plan', 'query_occupancy'], 'Occupant count needed before staged evacuation.', 'Await Occupancy Agent response', { currentActivity: `Requesting population census for Floor ${p.floor}` }),
    evt(4, A_OCC, A_COORD, 'OCCUPANT_CENSUS_PAYLOAD', 'occupancy_response', `${p.occupants} occupants detected on Floor ${p.floor}.`, 'Aggregating smart badge signals...', 'Aggregating smart badge signals & accessibility registry', { 'Active Badges': String(p.occupants), 'Support Registry': `${p.assistanceRequired} occupants` }, ['get_occupancy', 'flag_vulnerable_persons'], `${p.occupants} badges confirmed, ${p.assistanceRequired} requiring mobility support.`, 'Transmit counts to Coordinator', { occupancy: { total: p.occupants, assistanceRequired: p.assistanceRequired, floorOccupancy: { [String(p.floor)]: p.occupants } }, currentActivity: 'Occupancy telemetry delivered' }),
    evt(5, A_COORD, A_SEC, 'VENTILATION_ROUTE_CHECK', 'route_verification_request', 'Verify ventilation and egress path status away from the leak zone.', 'Cross-checking HVAC exhaust direction and door status...', 'Requesting exhaust routing & door validation', { 'Zone': zone }, ['query_security_telemetry'], 'Must confirm evacuation path does not cross gas plume direction.', 'Await Security Agent confirmation', { currentActivity: 'Verifying safe evacuation vector' }),
    p.offlineAgent === 'agent_occupancy'
      ? evt(6, A_OCC, A_COORD, 'TELEMETRY_UNAVAILABLE_WARNING', 'occupancy_response', 'Occupancy Agent badge feed unreachable.', 'Attempting badge reader reconnect...', 'Validating badge reader uplink', { 'Status': 'OFFLINE' }, ['get_occupancy'], 'Badge census feed down — falling back to last known headcount.', 'Alert Coordinator to telemetry gap', { currentActivity: 'Occupancy Agent OFFLINE — using last known count' })
      : evt(6, A_SEC, A_COORD, 'ACCESS_ANOMALY_DETECTED', 'security_alert', `Exit ${p.blockedExit} sits directly downwind of the gas plume.`, 'Modeling plume drift relative to corridor airflow...', 'Assessing plume drift vs. egress corridors', { [`Exit ${p.blockedExit}`]: 'DOWNWIND OF LEAK' }, ['verify_incident'], `Exit ${p.blockedExit} evacuation path crosses the gas plume path — unsafe.`, `Flag Exit ${p.blockedExit} as compromised`, { exits: buildExitState(p.blockedExit), currentActivity: `Exit ${p.blockedExit} flagged unsafe — downwind of gas plume` }),
    evt(7, A_FIRE, A_COORD, 'GAS_CONCENTRATION_SPIKE', 'hazard_update', 'Gas concentration has spiked sharply near the mechanical riser.', 'Detecting rapid LEL percentage increase...', 'Tracking real-time gas concentration trend', { 'LEL Trend': '+18%/min' }, ['detect_hazard', 'trigger_interrupt'], 'Rapid LEL increase raises explosion risk — upgrading severity to CRITICAL.', 'Trigger high-priority hazard interrupt', { incident: { ...initialState.incident, severity: 'critical' }, currentActivity: 'Hazard interrupt: gas concentration spiking' }, true),
    evt(8, A_COORD, A_COORD, 'MULTI_AGENT_CONFLICT_EVALUATION', 'conflict_detected', `Conflict detected. Exit ${p.blockedExit} cannot be used for evacuation.`, 'Cross-evaluating plume drift + concentration spike...', 'Evaluating route conflict', { [`Exit ${p.blockedExit}`]: 'GAS EXPOSURE RISK' }, ['resolve_conflicts', 'recalculate_routes'], `Exit ${p.blockedExit} disqualified due to gas exposure risk.`, 'Re-evaluate remaining egress paths', { exits: buildExitState(p.blockedExit), currentActivity: `Exit ${p.blockedExit} designated UNSAFE` }),
    evt(9, A_SEC, A_COORD, 'PRIMARY_ROUTE_CONFIRMATION', 'route_available', `Exit ${safe1} confirmed upwind and clear.`, `Re-verifying Exit ${safe1} air quality sensors...`, 'Confirming upwind egress path', { [`Exit ${safe1}`]: 'UPWIND / CLEAR' }, ['check_access_locks', 'verify_incident'], `Air quality sensors confirm Exit ${safe1} is outside the plume path.`, 'Confirm route availability', { currentActivity: `Route confirmed: Exit ${safe1} clear of gas exposure` }),
    evt(10, A_ETH, A_COORD, 'EQUITY_ASSISTANCE_DISPATCH', 'assistance_priority', `${p.assistanceRequired} registered occupants require respiratory-safe evacuation assistance.`, 'Calculating priority for occupants with respiratory sensitivity...', 'Evaluating registered assistance requirements', { 'Mobility/Respiratory Support': `${p.assistanceRequired} occupants` }, ['evaluate_assistance_priority', 'equity_scoring'], `${p.assistanceRequired} occupants flagged for priority evacuation assistance.`, 'Recommend dedicated assistance team dispatch', { currentActivity: `Dispatching assistance team for ${p.assistanceRequired} occupants` }),
    evt(11, A_COORD, A_COORD, 'GRAPH_REPLANNING_ENGINE', 'replanning_started', 'Re-evaluating evacuation routes given plume trajectory.', 'Executing graph replanning weighted against gas exposure...', 'Synthesizing inputs into adaptive response graph', { 'Excluded': `Exit ${p.blockedExit}`, 'Target Route': `Exit ${safe1}` }, ['recalculate_routes', 'synthesize_plan'], 'Synthesizing plume, occupancy, and constraint data into updated egress matrix.', 'Prepare campus mutual aid notification', { currentActivity: `Replanning egress graph to prioritize Exit ${safe1}` }),
    evt(12, A_CROSS, A_CROSS, 'CAMPUS_MUTUAL_AID_NOTIFICATION', 'cross_building_alert', `Building A reports a Floor ${p.floor} gas leak. Isolate shared gas mains and ventilation.`, 'Checking shared gas main shutoffs and HVAC linkage...', 'Broadcasting mutual aid alert & isolating shared utilities', { 'Source': `Building A Floor ${p.floor}`, 'Action': 'Isolate Shared Gas Main & HVAC' }, ['identify_affected_buildings', 'broadcast_mutual_aid'], `Transmitting utility isolation command to ${p.targetBuilding}.`, 'Confirm utility isolation', (prev: SharedEmergencyState) => ({ crossBuildingAlerts: [...prev.crossBuildingAlerts, { id: `cb_${uid()}`, targetBuilding: p.targetBuilding, message: `Floor ${p.floor} gas leak in Building A. Shared gas main isolated.`, timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }), status: 'active' }], currentActivity: `Mutual aid broadcast sent to ${p.targetBuilding}` })),
    evt(13, A_HUMAN, A_COORD, 'HUMAN_OVERRIDE_DIRECTIVE', 'operator_intervention', `Do not use Exit ${p.blockedExit} — hold all elevators.`, 'Human operator issuing explicit directive via control console...', 'Processing human operator intervention constraint', { 'Directive': `Avoid Exit ${p.blockedExit}, hold elevators` }, ['human_in_the_loop_override'], 'Human operator confirmed restriction and elevator hold (spark risk).', 'Acknowledge operator directive', { operatorIntervention: `Do not use Exit ${p.blockedExit}. Hold all elevators.`, currentActivity: 'Operator instruction received: elevator hold + exit restriction' }, true),
    evt(14, A_COORD, A_COORD, 'DIRECTIVE_INTEGRATION_CONFIRMATION', 'operator_instruction_applied', `Operator instruction applied. Exit ${p.blockedExit} forbidden, elevators locked out.`, 'Applying operator hard constraints to response graph...', 'Locking exclusion + elevator lockout rules', { 'Hard Constraint': `Exit ${p.blockedExit} = FORBIDDEN, Elevators = LOCKED` }, ['resolve_conflicts', 'synthesize_plan'], 'Constraints permanently applied per operator command.', 'Finalize response plan', { exits: buildExitState(p.blockedExit), currentActivity: 'Operator directives applied' }),
    evt(15, A_COORD, A_CONSOLE, 'CONSOLIDATED_RESPONSE_PLAN', 'response_plan_generated', `Redirect Floor ${p.floor} occupants to Exit ${safe1} via stairs only, dispatch assistance for ${p.assistanceRequired}, isolate gas main, notify ${p.targetBuilding}.`, 'Compiling final multi-agent response plan payload...', 'Generating final emergency response plan', { 'Primary Egress': `Exit ${safe1} (stairs only)` }, ['synthesize_plan', 'present_to_human'], 'Consolidated plan generated with agreement across all agents.', 'Await Operator final execution approval', { responsePlan: { emergencyLevel: 'CRITICAL', safeRoutes: [`Exit ${safe1}`, `Exit ${safe2}`], blockedRoutes: [`Exit ${p.blockedExit}`], recommendedActions: [`Evacuate all ${p.occupants} occupants via Exit ${safe1} using stairs only`, `Dispatch respiratory-safe assistance for ${p.assistanceRequired} occupants`, 'Maintain gas main isolation', 'Keep elevators locked out until all-clear'], humanDecision: null }, currentActivity: 'Response plan finalized — Awaiting operator approval' }),
  ];

  return { initialState, events };
}

// ============================================================
// TYPE 3: STRUCTURAL / SEISMIC DAMAGE
// ============================================================
function buildStructuralScenario() {
  const p = randomParams(['agent_fire_hazard', 'agent_ethical_priority']);
const severity = pick(['high', 'critical'] as const); 
 const zone = `Floor ${p.floor} Stairwell near Exit ${p.blockedExit}`;
  const [safe1, safe2] = otherExits(p.blockedExit);
  const initialState = baseInitialState(p, 'structural', severity, zone, 0, 22, p.offlineAgent ? [p.offlineAgent] : []);

  const events: StructuredMockEvent[] = [
    evt(1, A_FIRE, A_COORD, 'STRUCTURAL_STRESS_ALERT', 'hazard_detected', `Structural stress sensors show abnormal deflection on Floor ${p.floor}.`, 'Cross-referencing strain gauges and vibration sensors...', `Detecting structural deflection on Floor ${p.floor}`, { 'Deflection': `${rand(12, 40)}mm`, 'Location': zone }, ['detect_hazard', 'assess_severity'], 'Strain gauge readings exceed safe deflection threshold.', 'Transmit structural alert to Coordinator', { incident: { ...initialState.incident, severity: 'medium' }, currentActivity: `Assessing structural integrity on Floor ${p.floor}` }),
    evt(2, A_SEC, A_COORD, 'DEBRIS_FIELD_REPORT', 'security_alert', `Debris field detected blocking approach to Exit ${p.blockedExit}.`, 'Reviewing CCTV footage of stairwell obstruction...', 'Surveying debris obstruction via camera feed', { [`Exit ${p.blockedExit} Corridor`]: 'PARTIAL COLLAPSE / DEBRIS' }, ['verify_incident'], `CCTV confirms partial ceiling collapse blocking Exit ${p.blockedExit} approach.`, 'Flag corridor as impassable', { exits: buildExitState(p.blockedExit), currentActivity: `Exit ${p.blockedExit} corridor blocked by debris` }),
    evt(3, A_COORD, A_OCC, 'OCCUPANCY_TELEMETRY_QUERY', 'occupancy_request', `Provide current Floor ${p.floor} occupancy.`, 'Querying Occupancy Agent for live census...', 'Querying live population census & mobility needs', { 'Target Floor': `Floor ${p.floor}` }, ['synthesize_plan', 'query_occupancy'], 'Occupant count required before structural evacuation planning.', 'Await Occupancy Agent response', { currentActivity: `Requesting population census for Floor ${p.floor}` }),
    evt(4, A_OCC, A_COORD, 'OCCUPANT_CENSUS_PAYLOAD', 'occupancy_response', `${p.occupants} occupants detected on Floor ${p.floor}.`, 'Aggregating smart badge signals...', 'Aggregating smart badge signals & accessibility registry', { 'Active Badges': String(p.occupants), 'Support Registry': `${p.assistanceRequired} occupants` }, ['get_occupancy', 'flag_vulnerable_persons'], `${p.occupants} badges confirmed, ${p.assistanceRequired} requiring mobility support — critical given structural risk.`, 'Transmit counts to Coordinator', { occupancy: { total: p.occupants, assistanceRequired: p.assistanceRequired, floorOccupancy: { [String(p.floor)]: p.occupants } }, currentActivity: 'Occupancy telemetry delivered' }),
    evt(5, A_COORD, A_SEC, 'ROUTE_INTEGRITY_CHECK', 'route_verification_request', 'Verify structural integrity of remaining stairwells.', 'Cross-checking strain readings for alternate stairwells...', 'Requesting structural validation of alternate routes', { 'Zone': zone }, ['query_security_telemetry'], 'Must confirm alternate stairwells have not sustained damage.', 'Await Security Agent confirmation', { currentActivity: 'Verifying alternate stairwell integrity' }),
    p.offlineAgent === 'agent_fire_hazard'
      ? evt(6, A_FIRE, A_COORD, 'TELEMETRY_UNAVAILABLE_WARNING', 'hazard_update', 'Fire & Hazard Agent sensor array offline — likely damaged in the event.', 'Attempting sensor array reconnect...', 'Validating hazard sensor uplink', { 'Status': 'OFFLINE' }, ['detect_hazard'], 'Sensor array unreachable, possibly physically damaged. Manual inspection recommended.', 'Alert Coordinator to sensor loss', { currentActivity: 'Fire & Hazard Agent OFFLINE — sensor array down' })
      : evt(6, A_FIRE, A_COORD, 'SECONDARY_HAZARD_CHECK', 'hazard_update', 'No secondary fire hazard detected, but gas line rupture risk flagged near collapse zone.', 'Screening for secondary hazards near structural damage...', 'Screening for fire/gas secondary hazards', { 'Secondary Risk': 'Gas line proximity to collapse zone' }, ['detect_hazard'], 'Collapse zone sits near a gas line — flagging as secondary risk for response plan.', 'Flag secondary hazard to Coordinator', { currentActivity: 'Secondary hazard (gas line proximity) flagged' }),
    evt(7, A_SEC, A_COORD, 'AFTERSHOCK_RISK_ESCALATION', 'hazard_update', `Structural monitoring flags elevated aftershock risk — Exit ${p.blockedExit} zone increasingly unstable.`, 'Monitoring continued vibration and deflection trend...', 'Tracking real-time structural stability trend', { 'Deflection Trend': 'Increasing' }, ['detect_hazard', 'trigger_interrupt'], 'Continued instability raises collapse risk — upgrading severity to CRITICAL.', 'Trigger high-priority hazard interrupt', { incident: { ...initialState.incident, severity: 'critical' }, currentActivity: 'Hazard interrupt: structural instability increasing' }, true),
    evt(8, A_COORD, A_COORD, 'MULTI_AGENT_CONFLICT_EVALUATION', 'conflict_detected', `Conflict detected. Exit ${p.blockedExit} zone is structurally unsafe.`, 'Cross-evaluating debris field + instability trend...', 'Evaluating route conflict', { [`Exit ${p.blockedExit}`]: 'STRUCTURAL FAILURE RISK' }, ['resolve_conflicts', 'recalculate_routes'], `Exit ${p.blockedExit} disqualified due to structural failure risk.`, 'Re-evaluate remaining egress paths', { exits: buildExitState(p.blockedExit), currentActivity: `Exit ${p.blockedExit} designated UNSAFE` }),
    evt(9, A_SEC, A_COORD, 'PRIMARY_ROUTE_CONFIRMATION', 'route_available', `Exit ${safe1} confirmed structurally sound.`, `Re-verifying Exit ${safe1} strain gauge readings...`, 'Confirming structural soundness of alternate route', { [`Exit ${safe1}`]: 'STRUCTURALLY SOUND' }, ['check_access_locks', 'verify_incident'], `Strain gauges confirm Exit ${safe1} stairwell is undamaged.`, 'Confirm route availability', { currentActivity: `Route confirmed: Exit ${safe1} structurally sound` }),
    evt(10, A_ETH, A_COORD, 'EQUITY_ASSISTANCE_DISPATCH', 'assistance_priority', `${p.assistanceRequired} registered occupants require assisted evacuation over debris-affected terrain.`, 'Calculating priority given terrain difficulty...', 'Evaluating registered assistance requirements', { 'Mobility Support': `${p.assistanceRequired} occupants` }, ['evaluate_assistance_priority', 'equity_scoring'], `${p.assistanceRequired} occupants flagged for physical-assist evacuation teams.`, 'Recommend dedicated assistance team dispatch', { currentActivity: `Dispatching physical-assist team for ${p.assistanceRequired} occupants` }),
    evt(11, A_COORD, A_COORD, 'GRAPH_REPLANNING_ENGINE', 'replanning_started', 'Re-evaluating evacuation routes given structural damage map.', 'Executing graph replanning weighted against collapse risk...', 'Synthesizing inputs into adaptive response graph', { 'Excluded': `Exit ${p.blockedExit}`, 'Target Route': `Exit ${safe1}` }, ['recalculate_routes', 'synthesize_plan'], 'Synthesizing structural, occupancy, and constraint data into updated egress matrix.', 'Prepare campus mutual aid notification', { currentActivity: `Replanning egress graph to prioritize Exit ${safe1}` }),
    evt(12, A_CROSS, A_CROSS, 'CAMPUS_MUTUAL_AID_NOTIFICATION', 'cross_building_alert', `Building A reports structural damage on Floor ${p.floor}. Requesting structural engineer dispatch.`, 'Checking shared structural monitoring network...', 'Broadcasting mutual aid alert & requesting engineering support', { 'Source': `Building A Floor ${p.floor}`, 'Action': 'Request Structural Engineer Dispatch' }, ['identify_affected_buildings', 'broadcast_mutual_aid'], `Requesting emergency structural assessment support from ${p.targetBuilding}.`, 'Confirm engineer dispatch', (prev: SharedEmergencyState) => ({ crossBuildingAlerts: [...prev.crossBuildingAlerts, { id: `cb_${uid()}`, targetBuilding: p.targetBuilding, message: `Structural damage on Floor ${p.floor} in Building A. Engineer dispatch requested.`, timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }), status: 'active' }], currentActivity: `Mutual aid broadcast sent to ${p.targetBuilding}` })),
    evt(13, A_HUMAN, A_COORD, 'HUMAN_OVERRIDE_DIRECTIVE', 'operator_intervention', `Do not use Exit ${p.blockedExit} — treat as permanent structural loss.`, 'Human operator issuing explicit directive via control console...', 'Processing human operator intervention constraint', { 'Directive': `Permanently close Exit ${p.blockedExit}` }, ['human_in_the_loop_override'], 'Human operator confirmed permanent closure pending engineering inspection.', 'Acknowledge operator directive', { operatorIntervention: `Do not use Exit ${p.blockedExit}. Treat as permanent structural loss.`, currentActivity: 'Operator instruction received: permanent exit closure' }, true),
    evt(14, A_COORD, A_COORD, 'DIRECTIVE_INTEGRATION_CONFIRMATION', 'operator_instruction_applied', `Operator instruction applied. Exit ${p.blockedExit} permanently removed from route set.`, 'Applying operator hard constraint to egress graph...', `Locking Exit ${p.blockedExit} exclusion rule`, { 'Hard Constraint': `Exit ${p.blockedExit} = PERMANENTLY FORBIDDEN` }, ['resolve_conflicts', 'synthesize_plan'], `Exit ${p.blockedExit} permanently excluded pending engineering review.`, 'Finalize response plan', { exits: buildExitState(p.blockedExit), currentActivity: `Operator directive applied: Exit ${p.blockedExit} permanently closed` }),
    evt(15, A_COORD, A_CONSOLE, 'CONSOLIDATED_RESPONSE_PLAN', 'response_plan_generated', `Redirect Floor ${p.floor} occupants to Exit ${safe1}, dispatch physical-assist team for ${p.assistanceRequired}, request engineer from ${p.targetBuilding}.`, 'Compiling final multi-agent response plan payload...', 'Generating final emergency response plan', { 'Primary Egress': `Exit ${safe1}` }, ['synthesize_plan', 'present_to_human'], 'Consolidated plan generated with agreement across all agents.', 'Await Operator final execution approval', { responsePlan: { emergencyLevel: 'CRITICAL', safeRoutes: [`Exit ${safe1}`, `Exit ${safe2}`], blockedRoutes: [`Exit ${p.blockedExit}`], recommendedActions: [`Evacuate all ${p.occupants} occupants via Exit ${safe1}`, `Dispatch physical-assist team for ${p.assistanceRequired} occupants`, 'Request structural engineer inspection', `Maintain continuous strain monitoring on Exit ${safe1} stairwell`], humanDecision: null }, currentActivity: 'Response plan finalized — Awaiting operator approval' }),
  ];

  return { initialState, events };
}

// ============================================================
// TYPE 4: ACTIVE SECURITY THREAT
// ============================================================
function buildSecurityThreatScenario() {
  const p = randomParams(['agent_fire_hazard', 'agent_occupancy']);
const severity = pick(['high', 'critical'] as const);
  const zone = `Floor ${p.floor} near Exit ${p.blockedExit}`;
  const [safe1, safe2] = otherExits(p.blockedExit);
  const initialState = baseInitialState(p, 'security', severity, zone, 0, 21, p.offlineAgent ? [p.offlineAgent] : []);

  const events: StructuredMockEvent[] = [
    evt(1, A_SEC, A_COORD, 'SECURITY_BREACH_DETECTED', 'hazard_detected', `Unauthorized access event detected on Floor ${p.floor}.`, 'Cross-referencing badge logs and CCTV motion detection...', `Detecting unauthorized access on Floor ${p.floor}`, { 'Event': 'Forced entry alarm', 'Location': zone }, ['detect_hazard', 'assess_severity'], 'Forced entry alarm triggered with no matching badge credential.', 'Transmit security alert to Coordinator', { incident: { ...initialState.incident, severity: 'high' }, currentActivity: `Investigating access breach on Floor ${p.floor}` }),
    evt(2, A_SEC, A_COORD, 'LOCKDOWN_INITIATED', 'security_alert', `Initiating partial lockdown near Exit ${p.blockedExit}.`, 'Engaging electronic locks to contain the threat perimeter...', 'Engaging containment lockdown protocol', { 'Action': `Lock down Exit ${p.blockedExit} corridor` }, ['check_access_locks'], `Locking down Exit ${p.blockedExit} corridor to contain the threat area.`, 'Confirm lockdown status to Coordinator', { exits: buildExitState(p.blockedExit), currentActivity: `Exit ${p.blockedExit} corridor under lockdown` }),
    evt(3, A_COORD, A_OCC, 'OCCUPANCY_TELEMETRY_QUERY', 'occupancy_request', `Provide current Floor ${p.floor} occupancy and shelter-in-place candidates.`, 'Querying Occupancy Agent for live census...', 'Querying live population census & mobility needs', { 'Target Floor': `Floor ${p.floor}` }, ['synthesize_plan', 'query_occupancy'], 'Occupant count required to determine shelter-in-place vs evacuate decision.', 'Await Occupancy Agent response', { currentActivity: `Requesting population census for Floor ${p.floor}` }),
    evt(4, A_OCC, A_COORD, 'OCCUPANT_CENSUS_PAYLOAD', 'occupancy_response', `${p.occupants} occupants detected on Floor ${p.floor}.`, 'Aggregating smart badge signals...', 'Aggregating smart badge signals & accessibility registry', { 'Active Badges': String(p.occupants), 'Support Registry': `${p.assistanceRequired} occupants` }, ['get_occupancy', 'flag_vulnerable_persons'], `${p.occupants} badges confirmed, ${p.assistanceRequired} requiring mobility support.`, 'Transmit counts to Coordinator', { occupancy: { total: p.occupants, assistanceRequired: p.assistanceRequired, floorOccupancy: { [String(p.floor)]: p.occupants } }, currentActivity: 'Occupancy telemetry delivered' }),
    evt(5, A_COORD, A_SEC, 'THREAT_LOCATION_UPDATE', 'route_verification_request', 'Request last known threat location and movement vector.', 'Cross-referencing CCTV tracking across floor cameras...', 'Requesting threat tracking update', { 'Zone': zone }, ['query_security_telemetry'], 'Must confirm threat position before clearing any evacuation route.', 'Await Security Agent update', { currentActivity: 'Tracking threat position via CCTV network' }),
    p.offlineAgent === 'agent_occupancy'
      ? evt(6, A_OCC, A_COORD, 'TELEMETRY_UNAVAILABLE_WARNING', 'occupancy_response', 'Occupancy Agent badge feed unreachable near affected zone.', 'Attempting badge reader reconnect...', 'Validating badge reader uplink', { 'Status': 'OFFLINE' }, ['get_occupancy'], 'Badge feed down in threat zone — falling back to last confirmed headcount.', 'Alert Coordinator to telemetry gap', { currentActivity: 'Occupancy Agent OFFLINE — using last known count' })
      : evt(6, A_SEC, A_COORD, 'THREAT_MOVEMENT_UPDATE', 'security_alert', `Threat has moved toward the Exit ${p.blockedExit} stairwell.`, 'Tracking movement across corridor camera network...', 'Tracking threat movement vector', { [`Exit ${p.blockedExit}`]: 'THREAT PROXIMITY — DO NOT USE' }, ['verify_incident'], `Threat is now within proximity of Exit ${p.blockedExit} — corridor is unsafe for evacuation.`, `Flag Exit ${p.blockedExit} as unsafe`, { exits: buildExitState(p.blockedExit), currentActivity: `Exit ${p.blockedExit} flagged unsafe — threat proximity` }),
    evt(7, A_SEC, A_COORD, 'THREAT_ESCALATION', 'hazard_update', 'Threat behavior has escalated — law enforcement notified and en route.', 'Correlating latest camera feed with escalation indicators...', 'Monitoring real-time threat escalation', { 'Status': 'Law enforcement notified' }, ['detect_hazard', 'trigger_interrupt'], 'Escalation indicators confirmed. Upgrading severity to CRITICAL and alerting all floor occupants.', 'Trigger high-priority hazard interrupt', { incident: { ...initialState.incident, severity: 'critical' }, currentActivity: 'Hazard interrupt: threat escalation confirmed' }, true),
    evt(8, A_COORD, A_COORD, 'MULTI_AGENT_CONFLICT_EVALUATION', 'conflict_detected', `Conflict detected. Exit ${p.blockedExit} is unusable due to threat proximity.`, 'Cross-evaluating threat position + lockdown status...', 'Evaluating route conflict', { [`Exit ${p.blockedExit}`]: 'THREAT PROXIMITY' }, ['resolve_conflicts', 'recalculate_routes'], `Exit ${p.blockedExit} disqualified — evacuation would route occupants toward the threat.`, 'Re-evaluate remaining egress paths', { exits: buildExitState(p.blockedExit), currentActivity: `Exit ${p.blockedExit} designated UNSAFE` }),
    evt(9, A_SEC, A_COORD, 'PRIMARY_ROUTE_CONFIRMATION', 'route_available', `Exit ${safe1} confirmed clear of threat activity.`, `Re-verifying Exit ${safe1} camera coverage...`, 'Confirming threat-clear egress path', { [`Exit ${safe1}`]: 'CLEAR OF THREAT' }, ['check_access_locks', 'verify_incident'], `Camera coverage confirms no threat activity along Exit ${safe1}.`, 'Confirm route availability', { currentActivity: `Route confirmed: Exit ${safe1} clear of threat` }),
    evt(10, A_ETH, A_COORD, 'EQUITY_ASSISTANCE_DISPATCH', 'assistance_priority', `${p.assistanceRequired} registered occupants require assisted evacuation away from the threat zone.`, 'Calculating priority given the active-threat context...', 'Evaluating registered assistance requirements', { 'Mobility Support': `${p.assistanceRequired} occupants` }, ['evaluate_assistance_priority', 'equity_scoring'], `${p.assistanceRequired} occupants flagged for priority extraction given elevated risk.`, 'Recommend dedicated assistance team dispatch', { currentActivity: `Dispatching priority extraction team for ${p.assistanceRequired} occupants` }),
    evt(11, A_COORD, A_COORD, 'GRAPH_REPLANNING_ENGINE', 'replanning_started', 'Re-evaluating evacuation routes given last known threat position.', 'Executing graph replanning weighted against threat proximity...', 'Synthesizing inputs into adaptive response graph', { 'Excluded': `Exit ${p.blockedExit}`, 'Target Route': `Exit ${safe1}` }, ['recalculate_routes', 'synthesize_plan'], 'Synthesizing threat, occupancy, and constraint data into updated egress matrix.', 'Prepare campus mutual aid notification', { currentActivity: `Replanning egress graph to prioritize Exit ${safe1}` }),
    evt(12, A_CROSS, A_CROSS, 'CAMPUS_MUTUAL_AID_NOTIFICATION', 'cross_building_alert', `Building A reports an active security threat on Floor ${p.floor}. Lock shared concourse access.`, 'Checking shared concourse door status...', 'Broadcasting mutual aid alert & sealing shared access points', { 'Source': `Building A Floor ${p.floor}`, 'Action': 'Seal Shared Concourse Access' }, ['identify_affected_buildings', 'broadcast_mutual_aid'], `Transmitting concourse lockdown command to ${p.targetBuilding}.`, 'Confirm concourse lockdown', (prev: SharedEmergencyState) => ({ crossBuildingAlerts: [...prev.crossBuildingAlerts, { id: `cb_${uid()}`, targetBuilding: p.targetBuilding, message: `Active security threat on Floor ${p.floor} in Building A. Shared concourse sealed.`, timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }), status: 'active' }], currentActivity: `Mutual aid broadcast sent to ${p.targetBuilding}` })),
    evt(13, A_HUMAN, A_COORD, 'HUMAN_OVERRIDE_DIRECTIVE', 'operator_intervention', `Do not use Exit ${p.blockedExit} — shelter remaining occupants until law enforcement clears the floor.`, 'Human operator issuing explicit directive via control console...', 'Processing human operator intervention constraint', { 'Directive': `Avoid Exit ${p.blockedExit}, shelter-in-place option` }, ['human_in_the_loop_override'], 'Human operator confirmed restriction and shelter-in-place fallback for occupants who cannot safely move.', 'Acknowledge operator directive', { operatorIntervention: `Do not use Exit ${p.blockedExit}. Shelter-in-place until cleared.`, currentActivity: 'Operator instruction received: exit restriction + shelter option' }, true),
    evt(14, A_COORD, A_COORD, 'DIRECTIVE_INTEGRATION_CONFIRMATION', 'operator_instruction_applied', `Operator instruction applied. Exit ${p.blockedExit} forbidden; shelter-in-place protocol active for stragglers.`, 'Applying operator hard constraints to response graph...', 'Locking exclusion + shelter-in-place fallback rule', { 'Hard Constraint': `Exit ${p.blockedExit} = FORBIDDEN` }, ['resolve_conflicts', 'synthesize_plan'], 'Constraints permanently applied per operator command.', 'Finalize response plan', { exits: buildExitState(p.blockedExit), currentActivity: 'Operator directives applied' }),
    evt(15, A_COORD, A_CONSOLE, 'CONSOLIDATED_RESPONSE_PLAN', 'response_plan_generated', `Redirect Floor ${p.floor} occupants to Exit ${safe1}, extract ${p.assistanceRequired} priority occupants, maintain shelter-in-place fallback, notify ${p.targetBuilding}.`, 'Compiling final multi-agent response plan payload...', 'Generating final emergency response plan', { 'Primary Egress': `Exit ${safe1}` }, ['synthesize_plan', 'present_to_human'], 'Consolidated plan generated with agreement across all agents.', 'Await Operator final execution approval', { responsePlan: { emergencyLevel: 'CRITICAL', safeRoutes: [`Exit ${safe1}`, `Exit ${safe2}`], blockedRoutes: [`Exit ${p.blockedExit}`], recommendedActions: [`Evacuate all ${p.occupants} occupants via Exit ${safe1}`, `Priority extraction for ${p.assistanceRequired} occupants`, 'Maintain shelter-in-place fallback for stragglers', 'Coordinate with law enforcement before reopening Exit ' + p.blockedExit], humanDecision: null }, currentActivity: 'Response plan finalized — Awaiting operator approval' }),
  ];

  return { initialState, events };
}

// ============================================================
// TYPE 5: FLOOD / WATER INTRUSION
// ============================================================
function buildFloodScenario() {
  const p = randomParams(['agent_security', 'agent_ethical_priority']);
const severity = pick(['high', 'critical'] as const);
  const lowerFloor = Math.max(1, p.floor - rand(1, 2));
  const zone = `Floor ${lowerFloor} near Exit ${p.blockedExit}`;
  const [safe1, safe2] = otherExits(p.blockedExit);
  const initialState = baseInitialState({ ...p, floor: lowerFloor }, 'flood', severity, zone, 0, 20, p.offlineAgent ? [p.offlineAgent] : []);

  const events: StructuredMockEvent[] = [
    evt(1, A_FIRE, A_COORD, 'WATER_INTRUSION_ALERT', 'hazard_detected', `Water intrusion detected on Floor ${lowerFloor}.`, 'Cross-referencing floor moisture sensors and drainage telemetry...', `Detecting water intrusion on Floor ${lowerFloor}`, { 'Water Level': `${rand(2, 14)}cm`, 'Location': zone }, ['detect_hazard', 'assess_severity'], 'Moisture sensors confirm active water intrusion exceeding drainage capacity.', 'Transmit water hazard alert to Coordinator', { incident: { ...initialState.incident, severity: 'medium' }, currentActivity: `Assessing water intrusion on Floor ${lowerFloor}` }),
    evt(2, A_SEC, A_COORD, 'ELECTRICAL_RISK_CHECK', 'security_alert', `Cutting power to affected circuits on Floor ${lowerFloor} to prevent electrical hazard.`, 'Cross-checking electrical panel locations against water level...', 'De-energizing circuits at risk of water contact', { 'Action': 'Emergency electrical isolation', 'Zone': zone }, ['check_access_locks'], 'Water rising near electrical panels — isolating power is priority one.', 'Confirm electrical isolation to Coordinator', { currentActivity: 'Electrical isolation in progress' }),
    evt(3, A_COORD, A_OCC, 'OCCUPANCY_TELEMETRY_QUERY', 'occupancy_request', `Provide current Floor ${lowerFloor} occupancy for flood evacuation.`, 'Querying Occupancy Agent for live census...', 'Querying live population census & mobility needs', { 'Target Floor': `Floor ${lowerFloor}` }, ['synthesize_plan', 'query_occupancy'], 'Occupant count needed before flood evacuation planning.', 'Await Occupancy Agent response', { currentActivity: `Requesting population census for Floor ${lowerFloor}` }),
    evt(4, A_OCC, A_COORD, 'OCCUPANT_CENSUS_PAYLOAD', 'occupancy_response', `${p.occupants} occupants detected on Floor ${lowerFloor}.`, 'Aggregating smart badge signals...', 'Aggregating smart badge signals & accessibility registry', { 'Active Badges': String(p.occupants), 'Support Registry': `${p.assistanceRequired} occupants` }, ['get_occupancy', 'flag_vulnerable_persons'], `${p.occupants} badges confirmed, ${p.assistanceRequired} requiring mobility support.`, 'Transmit counts to Coordinator', { occupancy: { total: p.occupants, assistanceRequired: p.assistanceRequired, floorOccupancy: { [String(lowerFloor)]: p.occupants } }, currentActivity: 'Occupancy telemetry delivered' }),
    evt(5, A_COORD, A_SEC, 'DRY_ROUTE_CHECK', 'route_verification_request', 'Verify which stairwells remain dry and passable.', 'Cross-checking floor moisture sensors near each stairwell...', 'Requesting dry-route validation', { 'Zone': zone }, ['query_security_telemetry'], 'Must confirm evacuation path avoids standing water and slip hazards.', 'Await Security Agent confirmation', { currentActivity: 'Verifying dry evacuation route' }),
    p.offlineAgent === 'agent_security'
      ? evt(6, A_SEC, A_COORD, 'TELEMETRY_UNAVAILABLE_WARNING', 'security_alert', 'Security Agent CCTV feed disrupted by water exposure near cameras.', 'Attempting to reconnect to affected camera cluster...', 'Validating CCTV uplink', { 'Status': 'OFFLINE' }, ['verify_incident'], 'Camera feed near flood zone is down — relying on moisture sensor data only.', 'Alert Coordinator to telemetry gap', { currentActivity: 'Security Agent OFFLINE — CCTV gap near flood zone' })
      : evt(6, A_SEC, A_COORD, 'STAIRWELL_FLOODING_CONFIRMED', 'security_alert', `Exit ${p.blockedExit} stairwell confirmed flooded and unsafe underfoot.`, 'Reviewing moisture sensor data for each stairwell...', 'Assessing stairwell flood depth', { [`Exit ${p.blockedExit}`]: 'FLOODED — SLIP HAZARD' }, ['verify_incident'], `Moisture sensors confirm standing water in Exit ${p.blockedExit} stairwell.`, `Flag Exit ${p.blockedExit} as unsafe`, { exits: buildExitState(p.blockedExit), currentActivity: `Exit ${p.blockedExit} flagged unsafe — flooded stairwell` }),
    evt(7, A_FIRE, A_COORD, 'WATER_LEVEL_RISING', 'hazard_update', 'Water level is rising faster than drainage capacity can compensate.', 'Detecting accelerating water level trend...', 'Tracking real-time water level trend', { 'Rise Rate': '+3cm/min' }, ['detect_hazard', 'trigger_interrupt'], 'Rising water threatens to reach electrical panels and block additional routes — upgrading severity to CRITICAL.', 'Trigger high-priority hazard interrupt', { incident: { ...initialState.incident, severity: 'critical' }, currentActivity: 'Hazard interrupt: water level rising rapidly' }, true),
    evt(8, A_COORD, A_COORD, 'MULTI_AGENT_CONFLICT_EVALUATION', 'conflict_detected', `Conflict detected. Exit ${p.blockedExit} stairwell is unsafe due to flooding.`, 'Cross-evaluating flood depth + rising water trend...', 'Evaluating route conflict', { [`Exit ${p.blockedExit}`]: 'FLOODED / SLIP HAZARD' }, ['resolve_conflicts', 'recalculate_routes'], `Exit ${p.blockedExit} disqualified due to flooding and electrical proximity risk.`, 'Re-evaluate remaining egress paths', { exits: buildExitState(p.blockedExit), currentActivity: `Exit ${p.blockedExit} designated UNSAFE` }),
    evt(9, A_SEC, A_COORD, 'PRIMARY_ROUTE_CONFIRMATION', 'route_available', `Exit ${safe1} confirmed dry and passable.`, `Re-verifying Exit ${safe1} moisture sensors...`, 'Confirming dry egress path', { [`Exit ${safe1}`]: 'DRY / CLEAR' }, ['check_access_locks', 'verify_incident'], `Moisture sensors confirm Exit ${safe1} stairwell remains dry.`, 'Confirm route availability', { currentActivity: `Route confirmed: Exit ${safe1} dry and passable` }),
    evt(10, A_ETH, A_COORD, 'EQUITY_ASSISTANCE_DISPATCH', 'assistance_priority', `${p.assistanceRequired} registered occupants require assisted evacuation over wet/slippery terrain.`, 'Calculating priority given slip-hazard terrain...', 'Evaluating registered assistance requirements', { 'Mobility Support': `${p.assistanceRequired} occupants` }, ['evaluate_assistance_priority', 'equity_scoring'], `${p.assistanceRequired} occupants flagged for assisted evacuation given slip-hazard conditions.`, 'Recommend dedicated assistance team dispatch', { currentActivity: `Dispatching assistance team for ${p.assistanceRequired} occupants` }),
    evt(11, A_COORD, A_COORD, 'GRAPH_REPLANNING_ENGINE', 'replanning_started', 'Re-evaluating evacuation routes given flood extent map.', 'Executing graph replanning weighted against flood depth...', 'Synthesizing inputs into adaptive response graph', { 'Excluded': `Exit ${p.blockedExit}`, 'Target Route': `Exit ${safe1}` }, ['recalculate_routes', 'synthesize_plan'], 'Synthesizing flood, occupancy, and constraint data into updated egress matrix.', 'Prepare campus mutual aid notification', { currentActivity: `Replanning egress graph to prioritize Exit ${safe1}` }),
    evt(12, A_CROSS, A_CROSS, 'CAMPUS_MUTUAL_AID_NOTIFICATION', 'cross_building_alert', `Building A reports flooding on Floor ${lowerFloor}. Check shared basement/utility connections.`, 'Checking shared utility tunnel water levels...', 'Broadcasting mutual aid alert & checking shared infrastructure', { 'Source': `Building A Floor ${lowerFloor}`, 'Action': 'Inspect Shared Utility Tunnels' }, ['identify_affected_buildings', 'broadcast_mutual_aid'], `Requesting shared infrastructure inspection from ${p.targetBuilding}.`, 'Confirm inspection status', (prev: SharedEmergencyState) => ({ crossBuildingAlerts: [...prev.crossBuildingAlerts, { id: `cb_${uid()}`, targetBuilding: p.targetBuilding, message: `Flooding on Floor ${lowerFloor} in Building A. Shared utility tunnels being inspected.`, timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }), status: 'active' }], currentActivity: `Mutual aid broadcast sent to ${p.targetBuilding}` })),
    evt(13, A_HUMAN, A_COORD, 'HUMAN_OVERRIDE_DIRECTIVE', 'operator_intervention', `Do not use Exit ${p.blockedExit} — keep it roped off until pumped dry.`, 'Human operator issuing explicit directive via control console...', 'Processing human operator intervention constraint', { 'Directive': `Avoid Exit ${p.blockedExit} until pumped` }, ['human_in_the_loop_override'], 'Human operator confirmed restriction pending facilities pump-out.', 'Acknowledge operator directive', { operatorIntervention: `Do not use Exit ${p.blockedExit} until pumped dry.`, currentActivity: 'Operator instruction received: exit restriction pending pump-out' }, true),
    evt(14, A_COORD, A_COORD, 'DIRECTIVE_INTEGRATION_CONFIRMATION', 'operator_instruction_applied', `Operator instruction applied. Exit ${p.blockedExit} removed from route set pending pump-out.`, 'Applying operator hard constraint to egress graph...', `Locking Exit ${p.blockedExit} exclusion rule`, { 'Hard Constraint': `Exit ${p.blockedExit} = FORBIDDEN (pending pump-out)` }, ['resolve_conflicts', 'synthesize_plan'], `Exit ${p.blockedExit} excluded until facilities confirms it's pumped dry.`, 'Finalize response plan', { exits: buildExitState(p.blockedExit), currentActivity: `Operator directive applied: Exit ${p.blockedExit} closed pending pump-out` }),
    evt(15, A_COORD, A_CONSOLE, 'CONSOLIDATED_RESPONSE_PLAN', 'response_plan_generated', `Redirect Floor ${lowerFloor} occupants to Exit ${safe1}, dispatch assistance for ${p.assistanceRequired}, coordinate pump-out, notify ${p.targetBuilding}.`, 'Compiling final multi-agent response plan payload...', 'Generating final emergency response plan', { 'Primary Egress': `Exit ${safe1}` }, ['synthesize_plan', 'present_to_human'], 'Consolidated plan generated with agreement across all agents.', 'Await Operator final execution approval', { responsePlan: { emergencyLevel: 'CRITICAL', safeRoutes: [`Exit ${safe1}`, `Exit ${safe2}`], blockedRoutes: [`Exit ${p.blockedExit}`], recommendedActions: [`Evacuate all ${p.occupants} occupants via Exit ${safe1}`, `Dispatch assistance team for ${p.assistanceRequired} occupants`, 'Coordinate facilities pump-out crew', `Maintain electrical isolation until water recedes`], humanDecision: null }, currentActivity: 'Response plan finalized — Awaiting operator approval' }),
  ];

  return { initialState, events };
}

// ============================================================
// PUBLIC API
// ============================================================
export type ScenarioBundle = {
  initialState: SharedEmergencyState;
  events: StructuredMockEvent[];
};

const SCENARIO_BUILDERS: Array<() => ScenarioBundle> = [
  buildFireScenario,
  buildGasLeakScenario,
  buildStructuralScenario,
  buildSecurityThreatScenario,
  buildFloodScenario,
];

/**
 * Returns a randomized scenario bundle: pick one of 5 emergency types,
 * each internally randomized (floor, occupancy, blocked exit, offline
 * agent, target building, severity). Call this on simulation start/reset.
 */
export function getRandomScenario(): ScenarioBundle {
  const builder = pick(SCENARIO_BUILDERS);
  return builder();
}
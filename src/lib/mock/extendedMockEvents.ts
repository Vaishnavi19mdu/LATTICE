// Update this path to match wherever StructuredMockEvent/PRIMARY_15_EVENTS
// actually live in your project (the file you shared it from wasn't named
// in what you sent me — swap in the real relative path here).
interface StructuredMockEvent {
  id: string;
  eventIndex: number;
  fromAgentId: string;
  fromAgentName: string;
  fromIcon: string;
  toAgentId: string;
  toAgentName: string;
  toIcon: string;
  type: string;
  topic: string;
  message: string;
  thinkingText?: string;
  isInterrupt?: boolean;
  task: string;
  inputs: Record<string, string | number | boolean | undefined>;
  capabilitiesUsed: string[];
  reasoningSummary: string;
  nextAction: string;
}

/**
 * EXTENDED SCENARIO EVENT SEQUENCES
 * -------------------------------------------------------------
 * Companion timeline scripts for two of the new coordinator.scenarios.ts
 * fixtures, in the same StructuredMockEvent shape as PRIMARY_15_EVENTS,
 * so they can drive the existing Agent Interaction / chat timeline UI.
 *
 * Kept intentionally shorter than the 15-step primary demo — these are
 * meant to read as quick, distinct "what if" branches rather than a
 * second full narrative.
 * -------------------------------------------------------------
 */

/* ---------------------------------------------------------- */
/* FALSE_ALARM_STANDDOWN — 5 steps                             */
/* ---------------------------------------------------------- */
export const FALSE_ALARM_EVENTS: StructuredMockEvent[] = [
  {
    id: 'fa-evt-001',
    eventIndex: 1,
    fromAgentId: 'agent_fire_hazard',
    fromAgentName: 'Fire & Hazard Agent',
    fromIcon: '🔥',
    toAgentId: 'agent_coordinator',
    toAgentName: 'Emergency Coordinator',
    toIcon: '🧠',
    type: 'hazard_detected',
    topic: 'MINOR_PARTICULATE_SPIKE',
    message: 'Brief particulate spike on Floor 2.',
    thinkingText: 'Evaluating optical particle scatter on Floor 2 sensors...',
    task: 'Detecting smoke particle concentration on Floor 2',
    inputs: { 'Smoke Density': '11 PPM', 'Threshold': '30 PPM', 'Location': 'Floor 2 Break Room' },
    capabilitiesUsed: ['detect_hazard', 'assess_severity'],
    reasoningSummary: 'Reading remains well under the 30 PPM alert threshold. Flagging as low-priority for monitoring.',
    nextAction: 'Continue monitoring, notify Coordinator for awareness only',
  },
  {
    id: 'fa-evt-002',
    eventIndex: 2,
    fromAgentId: 'agent_coordinator',
    fromAgentName: 'Emergency Coordinator',
    fromIcon: '🧠',
    toAgentId: 'agent_security',
    toAgentName: 'Security Agent',
    toIcon: '🛡️',
    type: 'route_verification_request',
    topic: 'VISUAL_VERIFICATION_REQUEST',
    message: 'Please visually verify Floor 2 Break Room.',
    thinkingText: 'Requesting independent visual confirmation before dismissing the reading...',
    task: 'Cross-checking sensor reading against CCTV feed',
    inputs: { 'Zone': 'Floor 2 Break Room', 'Fire Score': '8 / 100' },
    capabilitiesUsed: ['query_security_telemetry'],
    reasoningSummary: 'Low-confidence readings still get a second-source check before stand-down.',
    nextAction: 'Await Security Agent visual confirmation',
  },
  {
    id: 'fa-evt-003',
    eventIndex: 3,
    fromAgentId: 'agent_security',
    fromAgentName: 'Security Agent',
    fromIcon: '🛡️',
    toAgentId: 'agent_coordinator',
    toAgentName: 'Emergency Coordinator',
    toIcon: '🧠',
    type: 'route_available',
    topic: 'VISUAL_VERIFICATION_RESULT',
    message: 'No hazard visible. Likely toaster smoke.',
    thinkingText: 'Reviewing CCTV frame history around the reported timestamp...',
    task: 'Visually confirming or ruling out hazard',
    inputs: { 'CCTV Result': 'No smoke or occupant distress visible', 'Doors': 'Nominal' },
    capabilitiesUsed: ['verify_incident'],
    reasoningSummary: 'Camera footage shows no visible smoke, flame, or occupant reaction consistent with a real hazard.',
    nextAction: 'Confirm stand-down to Coordinator',
  },
  {
    id: 'fa-evt-004',
    eventIndex: 4,
    fromAgentId: 'agent_coordinator',
    fromAgentName: 'Emergency Coordinator',
    fromIcon: '🧠',
    toAgentId: 'agent_coordinator',
    toAgentName: 'Emergency Coordinator (Internal)',
    toIcon: '🧠',
    type: 'stand_down',
    topic: 'INCIDENT_STAND_DOWN',
    message: 'No incident confirmed. Standing down.',
    thinkingText: 'Combining low fire score, low occupancy severity, and negative visual verification...',
    task: 'Finalizing NORMAL/LOW severity determination',
    inputs: { 'Emergency Level': 'LOW', 'Incident Confirmed': 'false' },
    capabilitiesUsed: ['calculate_confidence', 'generate_response'],
    reasoningSummary: 'All three agents agree: no active hazard. Emergency level held at LOW with no route restrictions.',
    nextAction: 'Log event and return to routine monitoring',
  },
  {
    id: 'fa-evt-005',
    eventIndex: 5,
    fromAgentId: 'agent_coordinator',
    fromAgentName: 'Emergency Coordinator',
    fromIcon: '🧠',
    toAgentId: 'OPERATOR_CONSOLE',
    toAgentName: 'LATTICE Operator Console',
    toIcon: '💻',
    type: 'response_plan_generated',
    topic: 'STAND_DOWN_SUMMARY',
    message: 'No evacuation required. Floor 2 remains fully accessible.',
    thinkingText: 'Compiling stand-down summary for the operator log...',
    task: 'Generating stand-down summary',
    inputs: { 'All Exits': 'AVAILABLE', 'Action Required': 'None' },
    capabilitiesUsed: ['synthesize_plan', 'present_to_human'],
    reasoningSummary: 'Routine monitoring resumes; incident logged for historical trend analysis only.',
    nextAction: 'Await next telemetry cycle',
  },
];

/* ---------------------------------------------------------- */
/* ALL_EXITS_BLOCKED — 6 steps                                 */
/* ---------------------------------------------------------- */
export const ALL_EXITS_BLOCKED_EVENTS: StructuredMockEvent[] = [
  {
    id: 'ab-evt-001',
    eventIndex: 1,
    fromAgentId: 'agent_fire_hazard',
    fromAgentName: 'Fire & Hazard Agent',
    fromIcon: '🔥',
    toAgentId: 'agent_coordinator',
    toAgentName: 'Emergency Coordinator',
    toIcon: '🧠',
    type: 'hazard_detected',
    topic: 'MULTI_CORRIDOR_FIRE_SPREAD',
    message: 'Fire has spread across multiple core corridors.',
    thinkingText: 'Correlating thermal spikes across four independent zones...',
    isInterrupt: true,
    task: 'Assessing multi-zone thermal escalation',
    inputs: { 'Severity': 'CRITICAL', 'Score': '97 / 100', 'Zones Affected': 'Floor 3, Floor 4' },
    capabilitiesUsed: ['detect_hazard', 'assess_severity', 'track_propagation'],
    reasoningSummary: 'Fire has escalated to CRITICAL and is no longer contained to a single corridor.',
    nextAction: 'Alert Coordinator to multi-zone critical hazard',
  },
  {
    id: 'ab-evt-002',
    eventIndex: 2,
    fromAgentId: 'agent_security',
    fromAgentName: 'Security Agent',
    fromIcon: '🛡️',
    toAgentId: 'agent_coordinator',
    toAgentName: 'Emergency Coordinator',
    toIcon: '🧠',
    type: 'security_alert',
    topic: 'TRIPLE_ROUTE_FAILURE',
    message: 'All three monitored exits report obstructions.',
    thinkingText: 'Checking solenoid and CCTV status on Exit A, B, and C simultaneously...',
    isInterrupt: true,
    task: 'Validating all monitored egress points',
    inputs: { 'Exit A': 'Solenoid failure + smoke', 'Exit B': 'Corridor blocked by debris', 'Exit C': 'Flame visible at threshold' },
    capabilitiesUsed: ['check_access_locks', 'verify_incident'],
    reasoningSummary: 'Every standard egress point is independently compromised — no primary route remains viable.',
    nextAction: 'Escalate to Coordinator for emergency override evaluation',
  },
  {
    id: 'ab-evt-003',
    eventIndex: 3,
    fromAgentId: 'agent_coordinator',
    fromAgentName: 'Emergency Coordinator',
    fromIcon: '🧠',
    toAgentId: 'agent_coordinator',
    toAgentName: 'Emergency Coordinator (Internal)',
    toIcon: '🧠',
    type: 'conflict_detected',
    topic: 'ZERO_SAFE_ROUTES',
    message: 'Zero safe routes remain among primary exits.',
    thinkingText: 'Recomputing safe/blocked route sets against updated hazard and security data...',
    task: 'Evaluating whether any primary route remains usable',
    inputs: { 'Safe Routes Found': '0', 'Blocked Routes': 'Exit A, Exit B, Exit C' },
    capabilitiesUsed: ['resolve_conflicts', 'recalculate_routes'],
    reasoningSummary: 'All three configured routes are disqualified. Triggering the fail-safe override protocol.',
    nextAction: 'Activate emergency override access vector',
  },
  {
    id: 'ab-evt-004',
    eventIndex: 4,
    fromAgentId: 'agent_coordinator',
    fromAgentName: 'Emergency Coordinator',
    fromIcon: '🧠',
    toAgentId: 'agent_coordinator',
    toAgentName: 'Emergency Coordinator (Internal)',
    toIcon: '🧠',
    type: 'fallback_activated',
    topic: 'EMERGENCY_OVERRIDE_ACCESS',
    message: 'Activating Stairwell B emergency override access.',
    thinkingText: 'Engaging fail-safe branch: no configured route is safe, so an override vector is injected...',
    task: 'Activating fail-safe emergency route',
    inputs: { 'Override Route': 'Stairwell B (Emergency Override Access)', 'Reason': 'All primary routes obstructed' },
    capabilitiesUsed: ['fallback_protocol', 'recalculate_routes'],
    reasoningSummary: 'This is a last-resort route, not independently verified — human operator oversight is mandatory.',
    nextAction: 'Notify operator immediately; request manual verification of override route',
  },
  {
    id: 'ab-evt-005',
    eventIndex: 5,
    fromAgentId: 'agent_ethical_priority',
    fromAgentName: 'Ethical Priority Agent',
    fromIcon: '❤️',
    toAgentId: 'agent_coordinator',
    toAgentName: 'Emergency Coordinator',
    toIcon: '🧠',
    type: 'assistance_priority',
    topic: 'CRITICAL_ASSISTANCE_DISPATCH',
    message: '5 registered occupants require priority assistance.',
    thinkingText: 'Recalculating equity-weighted dispatch priority under fail-safe conditions...',
    task: 'Prioritizing mobility-support occupants under fail-safe route',
    inputs: { 'Mobility Support': '5 occupants', 'Route': 'Stairwell B (Override)' },
    capabilitiesUsed: ['evaluate_assistance_priority', 'equity_scoring'],
    reasoningSummary: 'Fail-safe conditions raise the priority of dedicated physical assistance for mobility-support occupants.',
    nextAction: 'Dispatch assistance team to override route',
  },
  {
    id: 'ab-evt-006',
    eventIndex: 6,
    fromAgentId: 'agent_coordinator',
    fromAgentName: 'Emergency Coordinator',
    fromIcon: '🧠',
    toAgentId: 'OPERATOR_CONSOLE',
    toAgentName: 'LATTICE Operator Console',
    toIcon: '💻',
    type: 'response_plan_generated',
    topic: 'FAIL_SAFE_RESPONSE_PLAN',
    message: 'All primary routes compromised. Emergency override route activated — operator confirmation required before use.',
    thinkingText: 'Compiling fail-safe response payload with mandatory human confirmation flag...',
    task: 'Generating fail-safe emergency response plan',
    inputs: { 'Emergency Level': 'CRITICAL', 'Route': 'Stairwell B (Override)', 'Operator Action': 'Confirmation required' },
    capabilitiesUsed: ['synthesize_plan', 'present_to_human'],
    reasoningSummary: 'This plan cannot auto-execute — a fail-safe override route always requires explicit human sign-off before use.',
    nextAction: 'Await mandatory operator confirmation',
  },
];
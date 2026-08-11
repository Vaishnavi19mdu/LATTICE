import { SharedEmergencyState } from '../mock/emergencyScenario';
import { ResponsePlanState } from '../mock/emergencyScenario';

const EXIT_LABELS: Record<'A' | 'B' | 'C', string> = {
  A: 'Exit A',
  B: 'Exit B',
  C: 'Exit C',
};

export function computeResponsePlan(state: SharedEmergencyState): ResponsePlanState {
  const { incident, occupancy, exits, responsePlan } = state;

  const safeRoutes: string[] = [];
  const blockedRoutes: string[] = [];
  (['A', 'B', 'C'] as const).forEach((key) => {
    const status = exits[key];
    if (status === 'available') {
      safeRoutes.push(EXIT_LABELS[key]);
    } else if (status === 'unsafe' || status === 'blocked') {
      blockedRoutes.push(EXIT_LABELS[key]);
    }
    // 'checking' -> counted as neither yet
  });

  // Deterministic severity mapping, mirroring the rule intent in coordinator.logic.ts
  // but operating on the actual sensor-level fields this app stores.
  let emergencyLevel: ResponsePlanState['emergencyLevel'] = 'LOW';
  if (
    incident.severity === 'critical' ||
    (incident.severity === 'high' && (blockedRoutes.length >= 1 || occupancy.assistanceRequired >= 3))
  ) {
    emergencyLevel = 'CRITICAL';
  } else if (incident.severity === 'high') {
    emergencyLevel = 'HIGH';
  } else if (incident.severity === 'medium') {
    emergencyLevel = 'MEDIUM';
  }

  const recommendedActions: string[] = [];
  blockedRoutes.forEach((r) => recommendedActions.push(`BLOCK_EXIT: Restrict access toward ${r}.`));
  if (emergencyLevel === 'CRITICAL' || emergencyLevel === 'HIGH') {
    recommendedActions.push(`EVACUATE_AFFECTED_ZONE: Initiate evacuation for ${incident.zone}.`);
    if (safeRoutes.length > 0) {
      recommendedActions.push(`REDIRECT_EVACUATION: Guide occupants via ${safeRoutes.join(', ')}.`);
    }
  }
  if (occupancy.assistanceRequired > 0) {
    recommendedActions.push(`REQUEST_ASSISTANCE: Dispatch mobility support for ${occupancy.assistanceRequired} occupants.`);
  }

  return {
    emergencyLevel,
    safeRoutes,
    blockedRoutes,
    recommendedActions,
    humanDecision: responsePlan?.humanDecision ?? null, // preserve prior operator decision unless changed
  };
}
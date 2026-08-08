import { EthicalPriorityInput, EthicalPriorityAssessment, PriorityLevel } from './ethicalPriority.types';

export function evaluateEthicalPriority(input: EthicalPriorityInput): EthicalPriorityAssessment {
  const reasoning: string[] = [];
  const priorities: string[] = [];
  const recommendedSupport: string[] = [];

  const affected = input.affectedOccupants ?? 20;
  const assistanceNeeds = input.registeredAssistanceNeeds ?? 0;
  const availableRoutes = input.availableRoutes || ['Stairwell B', 'Exit C'];
  const blockedRoutes = input.blockedRoutes || ['Exit A'];

  // 1. Evaluate Priority Level
  let priorityLevel: PriorityLevel = 'NORMAL';
  if (assistanceNeeds >= 3 || (assistanceNeeds >= 1 && blockedRoutes.length > 0)) {
    priorityLevel = 'HIGH';
  } else if (assistanceNeeds > 0 || affected >= 30) {
    priorityLevel = 'ELEVATED';
  }

  // 2. Formulate Safety Priorities
  if (assistanceNeeds > 0) {
    priorities.push(`Provide immediate dedicated support to ${assistanceNeeds} registered occupants with mobility/assistance needs.`);
    recommendedSupport.push(`Deploy floor wardens with assistive chair equipment to affected zones.`);
    reasoning.push(`Identified ${assistanceNeeds} explicitly registered occupants requiring dedicated mobility coordination.`);
  } else {
    priorities.push('Standard equitable evacuation flow management for all floor occupants.');
    recommendedSupport.push('Clear main egress pathways and verify lighting status.');
    reasoning.push('No specific registered assistance profiles logged for current zone; maintaining standard safety protocol.');
  }

  if (blockedRoutes.length > 0) {
    priorities.push(`Ensure clear directional signage diverting occupants away from obstructed route (${blockedRoutes.join(', ')}).`);
    recommendedSupport.push(`Post verbal or digital warning beacons at entrance to ${blockedRoutes.join(', ')}.`);
    reasoning.push(`Route obstacle detected: ${blockedRoutes.join(', ')} is unsafe. Active guidance required.`);
  }

  priorities.push(`Verify safe arrival of all ${affected} occupants at designated assembly point.`);

  // 3. Mandatory Non-discrimination & Anti-bias Verification
  reasoning.push('Ethical Compliance Standard: Priorities based exclusively on voluntary opt-in accessibility records and physical hazard locations.');
  reasoning.push('Zero reliance on visual appearance, demographic guessing, or CCTV facial profiling.');

  return {
    agentId: 'agent_ethical_priority',
    agentName: 'Ethical Priority Agent',
    agentType: 'ethical_priority',
    timestamp: input.timestamp || new Date().toISOString(),
    simulated: input.simulated ?? true,
    status: 'online',
    priorityLevel,
    assistanceRequired: assistanceNeeds,
    priorities,
    recommendedSupport,
    reasoning,
  };
}

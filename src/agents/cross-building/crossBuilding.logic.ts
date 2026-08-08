import { CrossBuildingInput, CrossBuildingAssessment } from './crossBuilding.types';

export function evaluateCrossBuilding(input: CrossBuildingInput): CrossBuildingAssessment {
  const reasoning: string[] = [];
  const notifications: string[] = [];
  const sharedInformation: string[] = [];
  const recommendedActions: string[] = [];

  const sourceId = input.sourceBuildingId || 'building_A';
  const area = input.affectedArea || 'North Passage / Concourse';
  const severity = input.severity || 'HIGH';
  const nearby = input.nearbyBuildings || ['building_B', 'building_C'];
  const sharedInfra = input.sharedInfrastructure ?? true;

  const affectedBuildingsSet = new Set<string>();

  let collaborationRequired = false;

  if (severity === 'HIGH' || severity === 'CRITICAL' || sharedInfra) {
    collaborationRequired = true;

    // Identify affected nearby structures
    nearby.forEach((bId) => {
      // e.g. building_B or Block B
      const readableName = bId === 'building_B' ? 'Block B' : (bId === 'building_C' ? 'Block C' : bId);
      affectedBuildingsSet.add(readableName);
    });

    reasoning.push(`Incident severity (${severity}) or shared infrastructure (${sharedInfra ? 'Yes' : 'No'}) triggers campus mutual aid protocol.`);
    
    // Prepare notifications
    Array.from(affectedBuildingsSet).forEach((bName) => {
      notifications.push(`ALERT to ${bName}: Hazard in adjacent ${sourceId} (${area}) may impact shared access ways or ventilation.`);
    });

    // Shared information package
    sharedInformation.push(`Incident Source: ${sourceId} - ${area}`);
    sharedInformation.push(`Severity Level: ${severity}`);
    sharedInformation.push(`Shared Infrastructure Status: ${sharedInfra ? 'Potentially Compromised' : 'Isolated'}`);

    // Recommended Actions
    recommendedActions.push(`Notify security command center at ${Array.from(affectedBuildingsSet).join(' and ')}.`);
    recommendedActions.push(`Prepare secondary egress pathways in ${Array.from(affectedBuildingsSet).join(', ')} for potential spillover evacuations.`);
    recommendedActions.push('Synchronize cross-building HVAC intake dampers to prevent external smoke ingress.');
  } else {
    collaborationRequired = false;
    reasoning.push(`Low incident severity (${severity}) confined within ${sourceId}. No external building relay required.`);
    recommendedActions.push(`Maintain local containment within ${sourceId}.`);
  }

  return {
    agentId: 'agent_cross_building',
    agentName: 'Cross-Building Collaboration Agent',
    agentType: 'cross_building',
    timestamp: input.timestamp || new Date().toISOString(),
    simulated: input.simulated ?? true,
    status: 'online',
    collaborationRequired,
    affectedBuildings: Array.from(affectedBuildingsSet),
    notifications,
    sharedInformation,
    recommendedActions,
    reasoning,
  };
}

import { OccupancyInput, OccupancyAssessment, OccupancySeverity } from './occupancy.types';

export function evaluateOccupancy(input: OccupancyInput): OccupancyAssessment {
  const reasoning: string[] = [];
  
  const floorOcc = input.floorOccupancy || {};
  const affectedFloors = input.affectedFloors || [];
  const registeredAssistance = input.registeredAssistanceNeeds ?? 0;

  // Calculate total occupants across all floors if floorOccupancy provided
  let calculatedTotal = 0;
  Object.values(floorOcc).forEach((count) => {
    calculatedTotal += count;
  });

  const totalOccupants = input.totalOccupants !== undefined && input.totalOccupants > 0 
    ? input.totalOccupants 
    : (calculatedTotal > 0 ? calculatedTotal : 100);

  // Calculate affected occupants on impacted floors
  let affectedOccupants = 0;
  const affectedZonesSet = new Set<string>();

  if (affectedFloors.length > 0) {
    affectedFloors.forEach((f) => {
      // Normalize floor key e.g., "Floor 4" -> "4"
      const normalizedKey = f.replace(/[^0-9]/g, '');
      const countOnFloor = floorOcc[normalizedKey] || floorOcc[f] || Math.round(totalOccupants / 5);
      affectedOccupants += countOnFloor;
      affectedZonesSet.add(`Floor ${normalizedKey || f}`);
      reasoning.push(`Zone Floor ${normalizedKey || f}: ${countOnFloor} active occupants detected.`);
    });
  } else {
    reasoning.push('No specific floors marked as affected; assessing overall building occupancy baseline.');
    affectedOccupants = Math.round(totalOccupants * 0.2); // baseline 20% estimate
  }

  const affectedZones = Array.from(affectedZonesSet).length > 0 
    ? Array.from(affectedZonesSet) 
    : ['General Building Area'];

  // Assistance required explicitly provided
  if (registeredAssistance > 0) {
    reasoning.push(`${registeredAssistance} occupants have registered assistance or mobility support profiles in building directory.`);
  } else {
    reasoning.push('Zero registered assistance requirements logged for the affected zone in building directory.');
  }

  // Evacuation pressure & Occupancy severity calculation
  const occupancyPercentage = (affectedOccupants / totalOccupants) * 100;
  let pressureScore = Math.min(100, Math.round(occupancyPercentage * 1.5 + registeredAssistance * 10));

  let occupancySeverity: OccupancySeverity = 'LOW';
  if (affectedOccupants >= 30 || registeredAssistance >= 3 || occupancyPercentage >= 40) {
    occupancySeverity = 'HIGH';
    reasoning.push(`High evacuation density (${affectedOccupants} occupants affected, ${registeredAssistance} requiring assistance).`);
  } else if (affectedOccupants >= 10 || registeredAssistance > 0 || occupancyPercentage >= 15) {
    occupancySeverity = 'MEDIUM';
    reasoning.push(`Moderate evacuation load across ${affectedZones.join(', ')}.`);
  } else {
    occupancySeverity = 'LOW';
    reasoning.push('Low occupant density in affected sector.');
  }

  // Mandatory privacy reminder in reasoning
  reasoning.push('Privacy Compliance: Assistance estimates derived strictly from explicit voluntary registry records; no camera profile inference utilized.');

  return {
    agentId: 'agent_occupancy',
    agentName: 'Occupancy Agent',
    agentType: 'occupancy',
    timestamp: input.timestamp || new Date().toISOString(),
    simulated: input.simulated ?? true,
    status: 'online',
    totalOccupants,
    affectedOccupants,
    affectedZones,
    occupancySeverity,
    assistanceRequired: registeredAssistance,
    evacuationPressureScore: pressureScore,
    reasoning,
  };
}

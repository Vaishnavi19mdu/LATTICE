import { fireHazardAgent, FireHazardAssessment, FireHazardInput } from '../../agents/fire-hazard';
import { occupancyAgent, OccupancyAssessment, OccupancyInput } from '../../agents/occupancy';
import { securityAgent, SecurityAssessment, SecurityInput } from '../../agents/security';
import { emergencyCoordinator, CoordinatorAssessment, CoordinatorInput } from '../../agents/coordinator';
import { ethicalPriorityAgent, EthicalPriorityAssessment, EthicalPriorityInput } from '../../agents/ethical-priority';
import { crossBuildingAgent, CrossBuildingAssessment, CrossBuildingInput } from '../../agents/cross-building';

export interface DemoScenario {
  id: string;
  name: string;
  description: string;
  fireInput: FireHazardInput;
  occupancyInput: OccupancyInput;
  securityInput: SecurityInput;
  availableRoutes: string[];
  routeLocations: Record<string, string>;
  crossBuildingInput: CrossBuildingInput;
}

export const DEMO_SCENARIOS: Record<string, DemoScenario> = {
  scenario_fire_block_a: {
    id: 'scenario_fire_block_a',
    name: 'Block A Floor 4 Fire Incident',
    description: 'Critical fire alarm trigger on Floor 4 with high smoke particulate, 42 occupants in zone, and 3 registered assistance requirements.',
    fireInput: {
      location: 'Block A Floor 4',
      smokeLevel: 82,
      temperature: 87,
      fireAlarm: true,
      gasLevel: 25,
      simulated: true,
    },
    occupancyInput: {
      totalOccupants: 124,
      floorOccupancy: { '1': 12, '2': 18, '3': 31, '4': 42, '5': 21 },
      affectedFloors: ['4'],
      registeredAssistanceNeeds: 3,
      simulated: true,
    },
    securityInput: {
      location: 'Block A Floor 4',
      cctvEventDetected: true,
      accessEventDetected: true,
      doorStatus: 'OPEN',
      securityAlert: true,
      simulated: true,
    },
    availableRoutes: ['Exit A', 'Stairwell B', 'Exit C'],
    routeLocations: {
      'Exit A': 'Floor 4 Near Hazard',
      'Stairwell B': 'Floor 4 West Wing Core',
      'Exit C': 'Ground Level South Exit',
    },
    crossBuildingInput: {
      sourceBuildingId: 'building_A',
      affectedArea: 'Block A Floor 4 / Shared Concourse',
      severity: 'CRITICAL',
      nearbyBuildings: ['building_B', 'building_C'],
      sharedInfrastructure: true,
      simulated: true,
    },
  },
  scenario_electrical_smoke: {
    id: 'scenario_electrical_smoke',
    name: 'Server Room Electrical Smoke Anomaly',
    description: 'Elevated particulate in Floor 2 server room without active pull-station alarm.',
    fireInput: {
      location: 'Floor 2 Server Room',
      smokeLevel: 48,
      temperature: 41,
      fireAlarm: false,
      gasLevel: 10,
      simulated: true,
    },
    occupancyInput: {
      totalOccupants: 90,
      floorOccupancy: { '1': 15, '2': 8, '3': 25, '4': 22, '5': 20 },
      affectedFloors: ['2'],
      registeredAssistanceNeeds: 0,
      simulated: true,
    },
    securityInput: {
      location: 'Floor 2 Server Room',
      cctvEventDetected: true,
      accessEventDetected: false,
      doorStatus: 'RESTRICTED',
      securityAlert: false,
      simulated: true,
    },
    availableRoutes: ['Stairwell A', 'Stairwell B', 'Main Elevator Lobby'],
    routeLocations: {
      'Stairwell A': 'North Core',
      'Stairwell B': 'West Wing',
      'Main Elevator Lobby': 'Center Core',
    },
    crossBuildingInput: {
      sourceBuildingId: 'building_A',
      affectedArea: 'Floor 2 Server Room',
      severity: 'MEDIUM',
      nearbyBuildings: ['building_B'],
      sharedInfrastructure: false,
      simulated: true,
    },
  },
  scenario_degraded_sensors: {
    id: 'scenario_degraded_sensors',
    name: 'Degraded Security Sensor Telemetry Test',
    description: 'Thermal anomaly detected while CCTV video stream and access logs are offline.',
    fireInput: {
      location: 'Floor 3 East Wing',
      smokeLevel: 65,
      temperature: 58,
      fireAlarm: true,
      simulated: true,
    },
    occupancyInput: {
      totalOccupants: 110,
      affectedFloors: ['3'],
      registeredAssistanceNeeds: 1,
      simulated: true,
    },
    securityInput: {
      location: 'Floor 3 East Wing',
      // cctv and access missing/null to test degraded mode
      doorStatus: 'UNKNOWN',
      securityAlert: true,
      simulated: true,
    },
    availableRoutes: ['Exit A', 'Stairwell B'],
    routeLocations: {
      'Exit A': 'Floor 3 East Wing',
      'Stairwell B': 'West Core',
    },
    crossBuildingInput: {
      sourceBuildingId: 'building_A',
      affectedArea: 'Floor 3 East Wing',
      severity: 'HIGH',
      nearbyBuildings: ['building_B'],
      sharedInfrastructure: false,
      simulated: true,
    },
  },
  scenario_nominal: {
    id: 'scenario_nominal',
    name: 'Nominal Building Standby State',
    description: 'Baseline environmental and occupancy monitoring with zero anomalies.',
    fireInput: {
      location: 'Building Wide',
      smokeLevel: 5,
      temperature: 22,
      fireAlarm: false,
      gasLevel: 2,
      simulated: true,
    },
    occupancyInput: {
      totalOccupants: 150,
      floorOccupancy: { '1': 30, '2': 35, '3': 40, '4': 25, '5': 20 },
      affectedFloors: [],
      registeredAssistanceNeeds: 4,
      simulated: true,
    },
    securityInput: {
      location: 'Building Wide',
      cctvEventDetected: false,
      accessEventDetected: false,
      doorStatus: 'OPEN',
      securityAlert: false,
      simulated: true,
    },
    availableRoutes: ['Exit A', 'Exit B', 'Stairwell A', 'Stairwell B'],
    routeLocations: {},
    crossBuildingInput: {
      sourceBuildingId: 'building_A',
      affectedArea: 'None',
      severity: 'LOW',
      nearbyBuildings: ['building_B', 'building_C'],
      sharedInfrastructure: false,
      simulated: true,
    },
  },
};

export interface SimulationRunResult {
  scenarioId: string;
  scenarioName: string;
  scenarioDescription: string;
  timestamp: string;
  fireResult: FireHazardAssessment;
  occupancyResult: OccupancyAssessment;
  securityResult: SecurityAssessment;
  coordinatorResult: CoordinatorAssessment;
  ethicalResult: EthicalPriorityAssessment;
  crossBuildingResult: CrossBuildingAssessment;
  timelineSteps: Array<{
    agentName: string;
    agentIcon: string;
    agentColor: string;
    headline: string;
    reasoning: string[];
  }>;
}

export function runDemoScenario(scenarioId: string = 'scenario_fire_block_a'): SimulationRunResult {
  const scenario = DEMO_SCENARIOS[scenarioId] || DEMO_SCENARIOS.scenario_fire_block_a;

  // 1. Process SENSING AGENTS
  const fireResult = fireHazardAgent.process(scenario.fireInput);
  const occupancyResult = occupancyAgent.process(scenario.occupancyInput);
  const securityResult = securityAgent.process(scenario.securityInput);

  // 2. Process COORDINATOR
  const coordinatorInput: CoordinatorInput = {
    fireAssessment: fireResult,
    occupancyAssessment: occupancyResult,
    securityAssessment: securityResult,
    availableRoutes: scenario.availableRoutes,
    routeLocations: scenario.routeLocations,
    buildingId: scenario.fireInput.buildingId,
    simulated: true,
  };
  const coordinatorResult = emergencyCoordinator.process(coordinatorInput);

  // 3. Process ETHICAL PRIORITY AGENT
  const ethicalInput: EthicalPriorityInput = {
    affectedOccupants: occupancyResult.affectedOccupants,
    registeredAssistanceNeeds: occupancyResult.assistanceRequired,
    availableRoutes: coordinatorResult.safeRoutes,
    blockedRoutes: coordinatorResult.blockedRoutes,
    simulated: true,
  };
  const ethicalResult = ethicalPriorityAgent.process(ethicalInput);

  // 4. Process CROSS-BUILDING COLLABORATION AGENT
  const crossBuildingInput: CrossBuildingInput = {
    ...scenario.crossBuildingInput,
    severity: coordinatorResult.emergencyLevel === 'CRITICAL' || coordinatorResult.emergencyLevel === 'HIGH' ? 'HIGH' : 'LOW',
    simulated: true,
  };
  const crossBuildingResult = crossBuildingAgent.process(crossBuildingInput);

  // 5. Construct Multi-Agent Reasoning Chain Timeline
  const timelineSteps = [
    {
      agentName: fireHazardAgent.info.name,
      agentIcon: fireHazardAgent.info.icon,
      agentColor: fireHazardAgent.info.accentColor,
      headline: `Hazard Severity: ${fireResult.severity} (${fireResult.score}/100)`,
      reasoning: fireResult.reasoning,
    },
    {
      agentName: occupancyAgent.info.name,
      agentIcon: occupancyAgent.info.icon,
      agentColor: occupancyAgent.info.accentColor,
      headline: `Impacted Occupants: ${occupancyResult.affectedOccupants} (${occupancyResult.assistanceRequired} with registered assistance needs)`,
      reasoning: occupancyResult.reasoning,
    },
    {
      agentName: securityAgent.info.name,
      agentIcon: securityAgent.info.icon,
      agentColor: securityAgent.info.accentColor,
      headline: `Incident Verified: ${securityResult.incidentVerified ? 'YES' : 'NO'} (Confidence: ${securityResult.confidence})`,
      reasoning: securityResult.reasoning,
    },
    {
      agentName: emergencyCoordinator.info.name,
      agentIcon: emergencyCoordinator.info.icon,
      agentColor: emergencyCoordinator.info.accentColor,
      headline: `Coordinated Level: ${coordinatorResult.emergencyLevel} | Conflicts: ${coordinatorResult.conflicts.length}`,
      reasoning: coordinatorResult.reasoning,
    },
    {
      agentName: ethicalPriorityAgent.info.name,
      agentIcon: ethicalPriorityAgent.info.icon,
      agentColor: ethicalPriorityAgent.info.accentColor,
      headline: `Priority Allocation: ${ethicalResult.priorityLevel} (${ethicalResult.assistanceRequired} assistance allocations)`,
      reasoning: ethicalResult.reasoning,
    },
    {
      agentName: crossBuildingAgent.info.name,
      agentIcon: crossBuildingAgent.info.icon,
      agentColor: crossBuildingAgent.info.accentColor,
      headline: `Campus Relay Required: ${crossBuildingResult.collaborationRequired ? 'YES' : 'NO'}`,
      reasoning: crossBuildingResult.reasoning,
    },
  ];

  return {
    scenarioId: scenario.id,
    scenarioName: scenario.name,
    scenarioDescription: scenario.description,
    timestamp: new Date().toISOString(),
    fireResult,
    occupancyResult,
    securityResult,
    coordinatorResult,
    ethicalResult,
    crossBuildingResult,
    timelineSteps,
  };
}

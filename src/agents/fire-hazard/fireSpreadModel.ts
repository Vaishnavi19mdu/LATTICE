/**
 * fireSpreadModel.ts
 *
 * Room/object-context fire spread model. Complementary to the live-sensor
 * scoring in fireHazard.logic.ts: where that module reasons from real-time
 * smoke%, temperature, alarm state, and gas level, this module reasons
 * from *static/contextual* risk factors — what room it is, what's in it,
 * how many people, how ventilated it is, and how hard it would be to
 * escape.
 *
 * Produces two distinct outputs:
 *  - severity / riskScore   → how bad the situation is
 *  - spreadRate / estimatedSpreadMinutes / spreadConfidence → how fast
 *    it's likely to move to the next zone, and how confident the model
 *    is in that speed classification.
 *
 * FIRE_SPREAD_REFERENCE_DATA is retained as labeled reference data (not
 * currently consumed by predictFireSpread, which is a hand-tuned scoring
 * function) — useful documentation of expected severity bands per
 * room/object combination, and a ready-made fixture set if this ever
 * moves to a trained model.
 */

export type Ventilation = 'Poor' | 'Average' | 'Good';

/** Severity scale for this module specifically — distinct casing from
 *  SeverityLevel in fireHazard.types.ts, so the two are never confused
 *  when both appear in the same assessment. */
export type FireSpreadSeverity = 'Low' | 'Medium' | 'High' | 'Critical';

export type SpreadRate = 'Slow' | 'Moderate' | 'Fast' | 'Extreme';

export interface FireSpreadInput {
  room: string;
  objects: string;
  occupants: number;
  ventilation: Ventilation;
  smoke_level: number;
  fire_load: number;
  explosion_risk: number;
  escape_difficulty: number;
}

export interface FireSpreadPrediction {
  severity: FireSpreadSeverity;
  riskScore: number; // 0 - 100, how bad the situation is

  /** How fast the fire is likely to reach the next adjacent zone. */
  spreadRate: SpreadRate;
  /** Rough estimated minutes until the fire reaches an adjacent zone. */
  estimatedSpreadMinutes: number;
  /** 0.0 - 1.0 — confidence in the spreadRate classification specifically
   *  (highest when the spread-velocity score sits solidly inside a band,
   *  lowest right at a band boundary where the call is more of a toss-up). */
  spreadConfidence: number;
}

interface FireSpreadReferenceRow extends FireSpreadInput {
  severity: FireSpreadSeverity;
}

export const FIRE_SPREAD_REFERENCE_DATA: FireSpreadReferenceRow[] = [
  { room: 'Kitchen', objects: 'Gas Stove,LPG Cylinder', occupants: 3, ventilation: 'Poor', smoke_level: 25, fire_load: 180, explosion_risk: 10, escape_difficulty: 4, severity: 'Critical' },
  { room: 'Kitchen', objects: 'Gas Stove,Microwave', occupants: 2, ventilation: 'Good', smoke_level: 15, fire_load: 60, explosion_risk: 1, escape_difficulty: 2, severity: 'Medium' },
  { room: 'Kitchen', objects: 'LPG Cylinder,Wooden Cabinet', occupants: 4, ventilation: 'Poor', smoke_level: 30, fire_load: 200, explosion_risk: 10, escape_difficulty: 5, severity: 'Critical' },
  { room: 'Kitchen', objects: 'Gas Stove,Curtains', occupants: 2, ventilation: 'Average', smoke_level: 18, fire_load: 110, explosion_risk: 4, escape_difficulty: 3, severity: 'High' },
  { room: 'Kitchen', objects: 'Gas Stove,LPG Cylinder,Curtains', occupants: 5, ventilation: 'Poor', smoke_level: 35, fire_load: 240, explosion_risk: 10, escape_difficulty: 6, severity: 'Critical' },
  { room: 'Bedroom', objects: 'Bed,Curtains', occupants: 2, ventilation: 'Average', smoke_level: 15, fire_load: 130, explosion_risk: 0, escape_difficulty: 3, severity: 'High' },
  { room: 'Bedroom', objects: 'Bed,Wardrobe', occupants: 2, ventilation: 'Good', smoke_level: 12, fire_load: 90, explosion_risk: 0, escape_difficulty: 2, severity: 'Medium' },
  { room: 'Bedroom', objects: 'Bed,Curtains,Bookshelf', occupants: 3, ventilation: 'Poor', smoke_level: 20, fire_load: 180, explosion_risk: 0, escape_difficulty: 4, severity: 'High' },
  { room: 'Bedroom', objects: 'Bed', occupants: 1, ventilation: 'Good', smoke_level: 10, fire_load: 70, explosion_risk: 0, escape_difficulty: 1, severity: 'Medium' },
  { room: 'Bedroom', objects: 'Bed,Curtains,Laptop', occupants: 2, ventilation: 'Average', smoke_level: 18, fire_load: 150, explosion_risk: 3, escape_difficulty: 3, severity: 'High' },
  { room: 'Living Room', objects: 'Sofa,TV,Curtains', occupants: 4, ventilation: 'Average', smoke_level: 20, fire_load: 190, explosion_risk: 2, escape_difficulty: 4, severity: 'High' },
  { room: 'Living Room', objects: 'Sofa,Bookshelf', occupants: 3, ventilation: 'Average', smoke_level: 18, fire_load: 150, explosion_risk: 0, escape_difficulty: 3, severity: 'High' },
  { room: 'Living Room', objects: 'TV', occupants: 2, ventilation: 'Good', smoke_level: 10, fire_load: 20, explosion_risk: 0, escape_difficulty: 1, severity: 'Low' },
  { room: 'Living Room', objects: 'Sofa,Curtains,Bookshelf', occupants: 5, ventilation: 'Poor', smoke_level: 25, fire_load: 240, explosion_risk: 0, escape_difficulty: 5, severity: 'High' },
  { room: 'Living Room', objects: 'Sofa,TV,LPG Cylinder', occupants: 4, ventilation: 'Poor', smoke_level: 28, fire_load: 260, explosion_risk: 10, escape_difficulty: 5, severity: 'Critical' },
  { room: 'Utility Room', objects: 'Inverter Battery', occupants: 1, ventilation: 'Poor', smoke_level: 15, fire_load: 50, explosion_risk: 8, escape_difficulty: 2, severity: 'High' },
  { room: 'Utility Room', objects: 'Inverter Battery,Paint Cans', occupants: 1, ventilation: 'Poor', smoke_level: 22, fire_load: 180, explosion_risk: 9, escape_difficulty: 3, severity: 'Critical' },
  { room: 'Utility Room', objects: 'Electrical Panel', occupants: 0, ventilation: 'Average', smoke_level: 15, fire_load: 40, explosion_risk: 6, escape_difficulty: 2, severity: 'Medium' },
  { room: 'Storage Room', objects: 'Paint Cans,Petrol Can', occupants: 0, ventilation: 'Poor', smoke_level: 30, fire_load: 300, explosion_risk: 10, escape_difficulty: 4, severity: 'Critical' },
  { room: 'Storage Room', objects: 'Petrol Can,Paint Cans,Cardboard Boxes', occupants: 0, ventilation: 'Poor', smoke_level: 35, fire_load: 350, explosion_risk: 10, escape_difficulty: 5, severity: 'Critical' },
];

function calculateRiskScore(input: FireSpreadInput): number {
  let score = 0;

  score += input.smoke_level * 0.25;
  score += input.fire_load * 0.15;
  score += input.explosion_risk * 2;
  score += input.escape_difficulty * 4;

  if (input.ventilation === 'Poor') {
    score += 15;
  } else if (input.ventilation === 'Average') {
    score += 7;
  }

  score += input.occupants * 2;

  return Math.min(Math.round(score), 100);
}

function determineSeverity(riskScore: number): FireSpreadSeverity {
  if (riskScore >= 75) return 'Critical';
  if (riskScore >= 50) return 'High';
  if (riskScore >= 25) return 'Medium';
  return 'Low';
}

/**
 * Distinct from riskScore: weights the factors that drive how quickly
 * fire propagates rather than how severe the situation is overall.
 * Fuel quantity (fire_load) and explosive materials dominate — those are
 * what make a fire jump rather than smolder. Poor ventilation traps heat
 * near the ceiling, accelerating flashover and spread to adjoining
 * spaces. Existing smoke level is a proxy for how actively the fire is
 * already combusting.
 */
function calculateSpreadVelocityScore(input: FireSpreadInput): number {
  let score = 0;

  score += input.fire_load * 0.22;
  score += input.explosion_risk * 3.5;
  score += input.smoke_level * 0.3;

  if (input.ventilation === 'Poor') {
    score += 20;
  } else if (input.ventilation === 'Average') {
    score += 8;
  }

  return Math.min(Math.round(score), 100);
}

const SPREAD_RATE_BANDS: { min: number; rate: SpreadRate; estimatedMinutes: number }[] = [
  { min: 75, rate: 'Extreme', estimatedMinutes: 2 },
  { min: 50, rate: 'Fast', estimatedMinutes: 5 },
  { min: 25, rate: 'Moderate', estimatedMinutes: 12 },
  { min: 0, rate: 'Slow', estimatedMinutes: 25 },
];

const SPREAD_RATE_BOUNDARIES = [25, 50, 75];

function classifySpreadRate(velocityScore: number): { rate: SpreadRate; estimatedMinutes: number; confidence: number } {
  const band = SPREAD_RATE_BANDS.find((b) => velocityScore >= b.min)!;

  // Confidence is highest when velocityScore sits deep inside its band
  // (far from any threshold boundary) and lowest right at a boundary,
  // where the classification is closer to a coin flip between two bands.
  const distanceToNearestBoundary = Math.min(...SPREAD_RATE_BOUNDARIES.map((b) => Math.abs(velocityScore - b)));
  const confidence = Math.min(0.97, Math.max(0.5, 0.55 + distanceToNearestBoundary / 45));

  return { rate: band.rate, estimatedMinutes: band.estimatedMinutes, confidence: Number(confidence.toFixed(2)) };
}

export function predictFireSpread(input: FireSpreadInput): FireSpreadPrediction {
  const riskScore = calculateRiskScore(input);
  const severity = determineSeverity(riskScore);

  const velocityScore = calculateSpreadVelocityScore(input);
  const { rate, estimatedMinutes, confidence } = classifySpreadRate(velocityScore);

  return {
    severity,
    riskScore,
    spreadRate: rate,
    estimatedSpreadMinutes: estimatedMinutes,
    spreadConfidence: confidence,
  };
}
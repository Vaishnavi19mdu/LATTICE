import { FireHazardInput, FireHazardAssessment, SeverityLevel, HazardType } from './fireHazard.types';
import { predictFireSpread } from './fireSpreadModel';

export function evaluateFireHazard(input: FireHazardInput): FireHazardAssessment {
  const reasoning: string[] = [];
  let score = 0;
  let dataPointsCount = 0;

  const location = input.location || 'Unspecified Zone';
  const smoke = input.smokeLevel ?? null;
  const temp = input.temperature ?? null;
  const alarm = input.fireAlarm ?? null;
  const gas = input.gasLevel ?? null;

  // 1. Smoke Level contribution (0 - 40 points)
  if (smoke !== null) {
    dataPointsCount++;
    if (smoke >= 75) {
      score += 40;
      reasoning.push(`Smoke level (${smoke}%) is critically above the high-risk threshold.`);
    } else if (smoke >= 40) {
      score += 25;
      reasoning.push(`Smoke level (${smoke}%) indicates moderate combustion particulate count.`);
    } else if (smoke > 15) {
      score += 10;
      reasoning.push(`Smoke level (${smoke}%) is slightly elevated above ambient baseline.`);
    } else {
      reasoning.push(`Smoke level (${smoke}%) is within normal clear baseline.`);
    }
  } else {
    reasoning.push('Smoke sensor data unavailable or offline.');
  }

  // 2. Temperature contribution (0 - 35 points)
  if (temp !== null) {
    dataPointsCount++;
    if (temp >= 70) {
      score += 35;
      reasoning.push(`Temperature (${temp}°C) indicates active flame thermal signature.`);
    } else if (temp >= 45) {
      score += 20;
      reasoning.push(`Temperature (${temp}°C) is significantly elevated above standard room ambient.`);
    } else if (temp > 32) {
      score += 10;
      reasoning.push(`Temperature (${temp}°C) shows mild thermal anomaly.`);
    } else {
      reasoning.push(`Temperature (${temp}°C) is normal.`);
    }
  } else {
    reasoning.push('Thermal sensor data unavailable.');
  }

  // 3. Fire Alarm contribution (0 - 25 points)
  if (alarm !== null) {
    dataPointsCount++;
    if (alarm) {
      score += 25;
      reasoning.push('Physical fire alarm pull-station or optical strobe active.');
    } else {
      reasoning.push('Physical fire alarm circuit inactive.');
    }
  }

  // 4. Gas Level contribution (bonus 0 - 10 points)
  if (gas !== null) {
    dataPointsCount++;
    if (gas >= 50) {
      score += 10;
      reasoning.push(`Combustible or toxic gas accumulation detected (${gas}%).`);
    } else if (gas > 20) {
      score += 5;
      reasoning.push(`Trace gas reading elevated (${gas}%).`);
    }
  }

  // Normalize sensor-only score to max 100
  score = Math.min(100, score);

  // 5. Optional room/object context blend (fire-spread severity model)
  let fireSpreadPrediction: FireHazardAssessment['fireSpreadPrediction'];
  if (input.fireSpreadContext) {
    dataPointsCount++;
    fireSpreadPrediction = predictFireSpread(input.fireSpreadContext);

    reasoning.push(
      `Room-context fire-spread model rates ${input.fireSpreadContext.room} (${input.fireSpreadContext.objects}) as ${fireSpreadPrediction.severity} risk (score ${fireSpreadPrediction.riskScore}/100), factoring ventilation (${input.fireSpreadContext.ventilation}), fire load, explosion risk, and escape difficulty.`
    );

    // Blend: live sensor readings stay primary (70%), room/object context
    // adjusts the picture (30%) — contextual risk alone shouldn't override
    // what live sensors are actually reporting, but should meaningfully
    // shift the assessment.
    score = Math.round(score * 0.7 + fireSpreadPrediction.riskScore * 0.3);
  }

  // Severity Determination
  let severity: SeverityLevel = 'LOW';
  if (score >= 75) severity = 'CRITICAL';
  else if (score >= 50) severity = 'HIGH';
  else if (score >= 25) severity = 'MEDIUM';

  // Hazard Type Determination
  let hazardType: HazardType = 'UNKNOWN';
  if (score < 15) {
    hazardType = 'UNKNOWN';
  } else if ((smoke ?? 0) > (temp ?? 0) && (smoke ?? 0) > 40) {
    hazardType = 'SMOKE';
  } else if ((temp ?? 0) >= 45 || alarm) {
    hazardType = 'FIRE';
  } else if ((gas ?? 0) > 30) {
    hazardType = 'ENVIRONMENTAL';
  } else {
    hazardType = 'FIRE';
  }

  const hazardDetected = score >= 25;

  // Confidence calculation based on data points available
  let confidence = dataPointsCount > 0 ? Math.min(0.95, 0.4 + dataPointsCount * 0.15) : 0.3;
  if (dataPointsCount < 2) {
    reasoning.push('Confidence reduced due to limited sensor input channels.');
  }

  // Recommended Action
  let recommendedAction = 'Maintain standard environmental monitoring.';
  if (severity === 'CRITICAL') {
    recommendedAction = `Immediate suppression dispatch and automated HVAC damper isolation for ${location}.`;
  } else if (severity === 'HIGH') {
    recommendedAction = `Initiate localized fire alert and activate smoke containment pressurization in ${location}.`;
  } else if (severity === 'MEDIUM') {
    recommendedAction = `Dispatch security patrol to visually inspect ${location} for thermal sources.`;
  }

  return {
    agentId: 'agent_fire_hazard',
    agentName: 'Fire & Hazard Agent',
    agentType: 'fire_hazard',
    timestamp: input.timestamp || new Date().toISOString(),
    simulated: input.simulated ?? true,
    status: dataPointsCount < 2 ? 'degraded' : 'online',
    hazardDetected,
    hazardType,
    severity,
    score,
    location,
    confidence: Number(confidence.toFixed(2)),
    reasoning,
    recommendedAction,
    fireSpreadPrediction,
  };
}
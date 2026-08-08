import { SecurityInput, SecurityAssessment, SecuritySeverity, DoorAccessStatus } from './security.types';

export function evaluateSecurity(input: SecurityInput): SecurityAssessment {
  const reasoning: string[] = [];
  const evidence: string[] = [];
  
  const location = input.location || 'Target Zone';
  const cctv = input.cctvEventDetected ?? null;
  const access = input.accessEventDetected ?? null;
  const doorStatus: DoorAccessStatus = input.doorStatus || 'OPEN';
  const alert = input.securityAlert ?? null;

  let positiveEvidenceCount = 0;
  let totalChannelsAvailable = 0;

  // 1. CCTV Assessment
  if (cctv !== null) {
    totalChannelsAvailable++;
    if (cctv) {
      positiveEvidenceCount++;
      evidence.push(`CCTV camera feed in ${location} detected visual anomaly matching reported event.`);
      reasoning.push(`Visual confirmation: CCTV motion/optical trigger verified on ${location}.`);
    } else {
      reasoning.push(`CCTV feed active in ${location} but no visual obstruction/fire event observed.`);
    }
  } else {
    reasoning.push('CCTV video stream unavailable or channel degraded.');
  }

  // 2. Access Control / Card Swipes / Motion
  if (access !== null) {
    totalChannelsAvailable++;
    if (access) {
      positiveEvidenceCount++;
      evidence.push(`Door access controller in ${location} logged emergency break-glass or unforced access event.`);
      reasoning.push(`Access telemetry: Emergency door sensor trigger verified in ${location}.`);
    } else {
      reasoning.push('Door access controllers reporting normal secure telemetry.');
    }
  } else {
    reasoning.push('Access control telemetry stream offline.');
  }

  // 3. System Security Alert State
  if (alert !== null) {
    totalChannelsAvailable++;
    if (alert) {
      positiveEvidenceCount++;
      evidence.push(`Active security system alarm broadcast triggered for ${location}.`);
      reasoning.push('Security alarm relay: Active system perimeter alert level flagged.');
    } else {
      reasoning.push('Perimeter security alarm relay quiet.');
    }
  }

  // 4. Door physical status
  if (doorStatus === 'BLOCKED') {
    evidence.push(`Physical egress door in ${location} reports BLOCKED status.`);
    reasoning.push(`Egress constraint: Door in ${location} is physically obstructed.`);
  } else if (doorStatus === 'RESTRICTED') {
    reasoning.push(`Door in ${location} is locked/restricted under access protocol.`);
  }

  // Incident Verification & Confidence calculation
  const incidentVerified = positiveEvidenceCount >= 1;
  
  let confidence = 0.3;
  if (totalChannelsAvailable > 0) {
    if (positiveEvidenceCount >= 2) {
      confidence = 0.92;
    } else if (positiveEvidenceCount === 1) {
      confidence = 0.65;
    } else {
      confidence = 0.45;
    }
  } else {
    reasoning.push('Confidence severely reduced (0.35) due to complete absence of security sensor telemetry.');
  }

  // Security Severity
  let securitySeverity: SecuritySeverity = 'LOW';
  if (positiveEvidenceCount >= 2 || doorStatus === 'BLOCKED') {
    securitySeverity = 'HIGH';
  } else if (positiveEvidenceCount === 1 || alert) {
    securitySeverity = 'MEDIUM';
  }

  return {
    agentId: 'agent_security',
    agentName: 'Security Agent',
    agentType: 'security',
    timestamp: input.timestamp || new Date().toISOString(),
    simulated: input.simulated ?? true,
    status: totalChannelsAvailable < 2 ? 'degraded' : 'online',
    incidentVerified,
    confidence: Number(confidence.toFixed(2)),
    evidence,
    accessStatus: doorStatus,
    securitySeverity,
    reasoning,
  };
}

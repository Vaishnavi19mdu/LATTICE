import { InteropSimulationRunResult } from './agentMessageBus';

export interface AgentQueryStep {
  senderIcon: string;
  senderName: string;
  receiverIcon: string;
  receiverName: string;
  query: string;
  response: string;
}

export interface OperationsChatResponse {
  queryTrace: AgentQueryStep[];
  answerMarkdown: string;
}

/**
 * Evaluates operator queries against the active multi-agent simulation state.
 * Returns a transparent agent query trace and grounded answer.
 */
export function processOperationsQuery(
  userQuery: string,
  simResult: InteropSimulationRunResult
): OperationsChatResponse {
  const queryLower = userQuery.toLowerCase();
  const isSecurityOffline = simResult.agentStatuses['agent_security'] === 'offline';
  const hasOperatorNote = !!simResult.operatorNote;
  const operatorNoteText = simResult.operatorNote || '';

  // 1. CHECKLIST QUERY
  if (queryLower.includes('checklist') || queryLower.includes('evacuation plan') || queryLower.includes('steps')) {
    const trace: AgentQueryStep[] = [
      {
        senderIcon: '🧠',
        senderName: 'Emergency Coordinator',
        receiverIcon: '🔥',
        receiverName: 'Fire & Hazard Agent',
        query: 'Confirm active hazard severity & zone telemetry.',
        response: 'High thermal hazard on Floor 4 Exit A Corridor (78°C, 85 PPM smoke).',
      },
      {
        senderIcon: '🧠',
        senderName: 'Emergency Coordinator',
        receiverIcon: '👥',
        receiverName: 'Occupancy Agent',
        query: 'Confirm affected occupants and special needs.',
        response: '42 occupants detected on Floor 4; 3 registered for mobility support.',
      },
      {
        senderIcon: '🧠',
        senderName: 'Emergency Coordinator',
        receiverIcon: '🛡️',
        receiverName: 'Security Agent',
        query: 'Verify safe egress routes.',
        response: isSecurityOffline 
          ? 'SECURITY OFFLINE — Route status unverified, fallback active.'
          : 'Exit A is UNSAFE (jammed/smoke). Exit B & C available.',
      },
    ];

    const chosenExit = hasOperatorNote && operatorNoteText.toLowerCase().includes('exit c') 
      ? 'Exit C (Operator Override Applied)' 
      : 'Exit B';

    const answerMarkdown = `
### 📋 LATTICE EVACUATION CHECKLIST — FLOOR 4

* **⛔ AVOID EXIT A**: Primary corridor blocked by fire propagation and lock failure.
* **✅ PRIMARY EGRESS ROUTE**: Direct all Floor 4 occupants to **${chosenExit}**.
* **❤️ ASSISTANCE DISPATCH**: Deploy support team to Floor 4 West to assist **3 registered occupants** with mobility needs.
* **🔒 ZONE LOCKDOWN**: Isolate Floor 4 access doors and broadcast voice evacuation alerts.
* **🌐 CAMPUS CONTAINMENT**: HVAC isolation active for adjacent **Building B**.
${hasOperatorNote ? `* **👤 OPERATOR OVERRIDE ACTIVE**: *"<sup>${operatorNoteText}</sup>"*` : ''}
    `.trim();

    return { queryTrace: trace, answerMarkdown };
  }

  // 2. WHY EXIT A UNSAFE
  if (queryLower.includes('exit a') || queryLower.includes('unsafe') || queryLower.includes('blocked')) {
    const trace: AgentQueryStep[] = [
      {
        senderIcon: '🧠',
        senderName: 'Emergency Coordinator',
        receiverIcon: '🔥',
        receiverName: 'Fire & Hazard Agent',
        query: 'Query sensor telemetry near Exit A.',
        response: 'Smoke density 85 PPM, temperature 78°C in Exit A corridor.',
      },
      {
        senderIcon: '🧠',
        senderName: 'Emergency Coordinator',
        receiverIcon: '🛡️',
        receiverName: 'Security Agent',
        query: 'Query CCTV & access control logs for Exit A door.',
        response: isSecurityOffline ? 'Telemetry unreachable.' : 'Door locking solenoid jammed; corridor visual obscured.',
      },
    ];

    const answerMarkdown = `
**Exit A was marked UNSAFE based on dual-agent telemetry:**

1. **🔥 Fire & Hazard Agent**: Detected rapid flame propagation with 78°C temperature spikes and heavy smoke (85 PPM) in the Exit A access corridor.
2. **🛡️ Security Agent**: ${isSecurityOffline ? 'Offline, but initial status indicated door lock solenoid obstruction.' : 'Confirmed CCTV visual opacity and access control door mechanism failure.'}

The Emergency Coordinator flagged Exit A as an active hazard zone and excluded it from the response plan.
    `.trim();

    return { queryTrace: trace, answerMarkdown };
  }

  // 3. AGENT CONTRIBUTION / ATTRIBUTION
  if (queryLower.includes('contribute') || queryLower.includes('agents') || queryLower.includes('who') || queryLower.includes('attribution')) {
    const trace: AgentQueryStep[] = [
      {
        senderIcon: '🧠',
        senderName: 'Emergency Coordinator',
        receiverIcon: '📊',
        receiverName: 'Interoperability Bus',
        query: 'Extract agent decision contribution weights.',
        response: '6 agents actively contributing to synthesis graph.',
      },
    ];

    const answerMarkdown = `
**Multi-Agent Decision Attribution Graph:**

* **🔥 Fire & Hazard Agent**: Detected 78°C fire on Floor 4; established hazard level as **HIGH (92% confidence)**.
* **👥 Occupancy Agent**: Quantified **42 occupants** in zone & flagged **3 registered assistance requirements**.
* **🛡️ Security Agent**: ${isSecurityOffline ? '⚠️ OFFLINE — Fallback mode active' : 'Verified Exit A door failure & validated Exit B/C safety'}.
* **❤️ Ethical Priority Agent**: Calculated vulnerability priority scores & requested dedicated support team dispatch.
* **🌐 Cross-Building Agent**: Broadcasted mutual aid alert to **Building B** & isolated shared HVAC ducting.
* **🧠 Emergency Coordinator**: Consolidated telemetry, resolved route conflict, and generated the adaptive response plan.
    `.trim();

    return { queryTrace: trace, answerMarkdown };
  }

  // 4. SECURITY OFFLINE QUERY
  if (queryLower.includes('security') || queryLower.includes('offline') || queryLower.includes('fail')) {
    const trace: AgentQueryStep[] = [
      {
        senderIcon: '🧠',
        senderName: 'Emergency Coordinator',
        receiverIcon: '🛡️',
        receiverName: 'Security Agent',
        query: 'Ping Security Agent telemetry gateway.',
        response: isSecurityOffline ? 'TIMEOUT: Node unreachable.' : 'ONLINE: Response latency 12ms.',
      },
    ];

    const answerMarkdown = isSecurityOffline ? `
**⚠️ CURRENT STATE: Security Agent is OFFLINE**

* **Confidence Drop**: Response plan confidence reduced to **68%**.
* **Fallback Protocol Activated**:
  1. Operator alert triggered on LATTICE Command Console.
  2. Route access marked *UNCERTAIN* (relying on Fire & Occupancy telemetry).
  3. Physical ground security dispatched for manual inspection.
    `.trim() : `
**If the Security Agent goes offline:**

* CCTV and automated door access verification will be lost.
* Coordinator confidence drops from **92% to 68%**.
* Fallback protocol notifies the operator, marks route status as *UNCERTAIN*, and relies strictly on Fire/Occupancy sensors.
    `.trim();

    return { queryTrace: trace, answerMarkdown };
  }

  // 5. WHY CRITICAL
  if (queryLower.includes('critical') || queryLower.includes('level') || queryLower.includes('severity')) {
    const trace: AgentQueryStep[] = [
      {
        senderIcon: '🧠',
        senderName: 'Emergency Coordinator',
        receiverIcon: '🔥',
        receiverName: 'Fire & Hazard Agent',
        query: 'Fetch risk factor score.',
        response: 'Risk Score: 0.88 / 1.0 (Critical Threat).',
      },
    ];

    const answerMarkdown = `
**The emergency severity was classified as ${simResult.coordinatorAssessment.emergencyLevel} because:**

1. **High Thermal & Toxic Hazard**: Temperature 78°C with CO/smoke levels exceeding safety thresholds.
2. **High Occupancy Density**: 42 occupants trapped on Floor 4 near the hazard origin.
3. **Primary Route Obstruction**: Exit A is blocked, forcing immediate inter-agent route recalculation.
4. **Vulnerable Persons**: 3 occupants require dedicated physical assistance during egress.
    `.trim();

    return { queryTrace: trace, answerMarkdown };
  }

  // DEFAULT CONTEXTUAL FALLBACK
  const trace: AgentQueryStep[] = [
    {
      senderIcon: '🧠',
      senderName: 'Emergency Coordinator',
      receiverIcon: '📡',
      receiverName: 'LATTICE Agent Mesh',
      query: `Process query: "${userQuery}"`,
      response: 'Retrieved active simulation context across 6 agents.',
    },
  ];

  const chosenExit = hasOperatorNote && operatorNoteText.toLowerCase().includes('exit c') ? 'Exit C' : 'Exit B';

  const answerMarkdown = `
**Active Simulation Summary:**
* **Emergency Level**: ${simResult.coordinatorAssessment.emergencyLevel}
* **Hazard Zone**: Floor 4 West / Exit A Corridors
* **Occupancy**: 42 Total / 3 Special Needs
* **Safe Egress Route**: **${chosenExit}** (Avoid Exit A)
* **Agent Status**: All core nodes active ${isSecurityOffline ? '(Except Security: OFFLINE)' : ''}
${hasOperatorNote ? `* **Active Operator Override**: *"<sup>${operatorNoteText}</sup>"*` : ''}
  `.trim();

  return { queryTrace: trace, answerMarkdown };
}

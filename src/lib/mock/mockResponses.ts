import { SharedEmergencyState } from './emergencyScenario';

/**
 * Generates dynamic markdown responses for the Operations Chat assistant based on the actual current emergency state.
 */
export function generateOperationsChatResponse(userQuery: string, state: SharedEmergencyState): string {
  const q = userQuery.toLowerCase();

  if (q.includes('checklist') || q.includes('evacuation') || q.includes('what should i do')) {
    const exitAStatusStr = state.exits.A === 'unsafe' ? '⛔ **AVOID EXIT A** — Fire propagation and door solenoid failure detected.' : '⚠️ **CHECKING EXIT A** — Thermal sensors active.';
    const exitBStatusStr = state.exits.B === 'available' ? '✅ **USE EXIT B** — Confirmed clear and operational by Security Agent.' : '⚠️ Checking Exit B.';
    
    return `### 📋 LATTICE EVACUATION CHECKLIST — FLOOR 4

* ${exitAStatusStr}
* ${exitBStatusStr}
* ❤️ **ASSISTANCE DISPATCH** — Support team assigned for **${state.occupancy.assistanceRequired} registered occupants** on Floor 4.
* 🔒 **ISOLATE ZONE** — Fire alarm active on Floor 4 (${state.incident.smokePpm} PPM smoke, ${state.incident.temperatureC}°C).
* 🌐 **CROSS-BUILDING ALERT** — Concourse damper isolated for **Building B**.

*Current Status:* **${state.incident.severity.toUpperCase()} HAZARD LEVEL** (${state.occupancy.total} occupants total).`;
  }

  if (q.includes('exit') || q.includes('route') || q.includes('door') || q.includes('stairwell')) {
    return `### 🚪 EMERGENCY ROUTE STATUS SUMMARY

* **Exit A (East Corridor):** \`${state.exits.A.toUpperCase()}\` — Fire encroachment and electronic lock error 504.
* **Exit B (West Stairwell):** \`${state.exits.B.toUpperCase()}\` — Primary clear egress path verified by Security CCTV.
* **Exit C (Ground Annex):** \`${state.exits.C.toUpperCase()}\` — Secondary clear path.

> **Operator Instruction in effect:** ${state.operatorIntervention || 'None (Automated Agent Mesh Active)'}`;
  }

  if (q.includes('occupant') || q.includes('people') || q.includes('count') || q.includes('mobility')) {
    return `### 👥 OCCUPANCY TELEMETRY — FLOOR 4

* **Total Active Badges:** **${state.occupancy.total} occupants**
* **Registered Mobility Support:** **${state.occupancy.assistanceRequired} occupants**
* **Assistance Priority Score:** \`HIGH\` (Assigned by Ethical Priority Agent)

All occupants are instructed to route through **Exit B**.`;
  }

  if (q.includes('building b') || q.includes('campus') || q.includes('cross')) {
    const alertCount = state.crossBuildingAlerts.length;
    return `### 🌐 CROSS-BUILDING COORDINATION STATUS

* **Target Building:** Building B (Engineering Annex)
* **Alert Status:** ${alertCount > 0 ? '🟢 **MUTUAL AID BROADCAST SENT**' : '⚪ Standby'}
* **Automated Actions:**
  * Shared HVAC damper isolated
  * Concourse glass doors locked to prevent smoke ingress`;
  }

  // Default response
  return `### 🧠 LATTICE EMERGENCY SYSTEM SUMMARY

* **Active Incident:** Fire & Smoke on **Floor 4** (${state.incident.smokePpm} PPM / ${state.incident.temperatureC}°C)
* **Primary Egress Route:** **Exit B (Stairwell B)**
* **Restricted Route:** **Exit A (UNSAFE)**
* **Active Agents:** Fire & Hazard, Occupancy, Security, Coordinator, Ethical Priority, Cross-Building
* **Current Activity:** ${state.currentActivity}

Ask about **"evacuation checklist"**, **"route status"**, or **"occupants count"** for specific breakdown.`;
}

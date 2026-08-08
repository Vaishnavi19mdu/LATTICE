# LATTICE

### Building Emergency Agent Network

LATTICE is a multi-agent emergency response system that enables specialized AI agents to communicate, share capabilities, analyze emergency conditions, and coordinate response decisions across connected buildings.

The system combines **agent interoperability, emergency reasoning, human oversight, and adaptive response** into a single architecture.

---

## Overview

Traditional building emergency systems often operate independently. Fire detection, occupancy, security, and building management systems may have access to different parts of an incident without a shared mechanism for collaboration.

LATTICE addresses this problem through a network of specialized agents.

```text
Building Systems
       ↓
Specialized Agents
       ↓
Interoperability Layer
       ↓
Emergency Coordination
       ↓
Human Control
       ↓
Response & Replanning
```

---

## Architecture

LATTICE currently consists of six specialized functional agents/components supported by an interoperability layer and a human-control layer.

| Component                             | Responsibility                                                   |
| ------------------------------------- | ---------------------------------------------------------------- |
| **Fire & Hazard Agent**               | Detects and assesses environmental hazards                       |
| **Occupancy Agent**                   | Provides occupancy and affected-zone information                 |
| **Security Agent**                    | Provides security context and incident verification              |
| **Emergency Coordinator**             | Combines agent outputs and generates response plans              |
| **Ethical Priority**                  | Incorporates registered assistance requirements into planning    |
| **Cross-Building Collaboration**      | Coordinates emergency information between buildings              |
| **Agent Registry / Interoperability** | Enables discovery, capability exchange, and message routing      |
| **Human Override**                    | Allows operators to review, approve, reject, or modify decisions |

---

## Agent Interaction

Agents communicate through structured messages rather than relying on tightly coupled point-to-point connections.

For example:

```text
Fire Agent
    ↓
"Smoke detected on Floor 4"
    ↓
Interoperability Layer
    ↓
Occupancy Agent
    ↓
"42 occupants in affected zone"
    ↓
Security Agent
    ↓
"Exit A inaccessible"
    ↓
Emergency Coordinator
    ↓
"Recommend Exit B"
    ↓
Human Operator
    ↓
Approve / Reject / Modify
```

The interaction model allows an agent to request information or capabilities from another agent when required.

---

## Emergency Coordination

The Emergency Coordinator evaluates information from multiple agents before producing a response.

It considers:

* Hazard severity
* Occupancy conditions
* Security verification
* Conflicting information
* Agent confidence
* Available capabilities
* Ethical priorities
* Current building state

### Example conflict

```text
Occupancy Agent:
Exit A is the nearest available route.

Fire Agent:
Fire propagation detected near Exit A.

Coordinator:
Exit A marked unsafe.
Alternative route recommended.
```

This prevents the system from blindly following a single agent's recommendation.

---

## Interoperability

The interoperability layer provides the communication foundation for LATTICE.

Core capabilities include:

* Agent discovery
* Capability discovery
* Structured message exchange
* Message routing
* Agent-to-agent requests
* Cross-building communication

Example capabilities:

```text
Fire Agent
├── detect_hazard
└── assess_severity

Occupancy Agent
├── get_occupancy
└── identify_affected_zone

Security Agent
├── verify_incident
└── retrieve_security_event
```

---

## Human-in-the-Loop

LATTICE does not treat AI-generated decisions as automatically executable actions.

Critical decisions can be reviewed by an authorized operator.

```text
AI Response Plan
       ↓
Human Review
   ┌───┼────┐
   ↓   ↓    ↓
Approve Reject Modify
       ↓
   Final Action
```

Operators can also add notes to incidents, providing traceability for emergency decisions.

---

## Resilience

Emergency conditions can change rapidly, and individual agents may become unavailable.

LATTICE includes mechanisms for:

### Fallback Protocols

Predefined alternatives when confidence is low or expected information is unavailable.

### Agent Failure Handling

Continued operation using available agents while indicating reduced confidence.

### Adaptive Replanning

Re-evaluation of the response when new information or changing conditions are detected.

```text
New Event
   ↓
Re-evaluate
   ↓
Conflict / Change Detected
   ↓
Update Response
   ↓
Human Review
   ↓
Replan
```

---

## Cross-Building Collaboration

LATTICE can extend beyond a single building.

```text
┌─────────────┐
│ Building A  │
└──────┬──────┘
       ↕
┌─────────────┐
│ Building B  │
└──────┬──────┘
       ↕
┌─────────────┐
│ Building C  │
└─────────────┘
```

A building experiencing an emergency can communicate relevant information to connected building networks.

This enables:

* Shared emergency awareness
* Mutual aid coordination
* Cross-building alerts
* Dynamic response adjustments

---

## Emergency Simulation

The prototype includes a simulated emergency environment for demonstrating the agent network.

The simulation can represent:

* Fire and smoke events
* Occupancy conditions
* Security events
* Agent-to-agent communication
* Conflicting information
* Response planning
* Human intervention
* Cross-building events
* Adaptive replanning

The interface exposes the reasoning process through live agent interaction and event logs.

---

## Technology Stack

**Frontend**

* React
* TypeScript
* Vite

**Backend / Services**

* Firebase
* Real-time application state
* Authentication integration

**Agent Layer**

* TypeScript-based specialized agents
* Structured agent types
* Agent logic modules
* Interoperability layer
* Message schemas

**Development**

* Git / GitHub
* Environment-based configuration
* Simulated emergency data for demonstration

---

## Project Structure

```text
lattice/
│
├── agents/
│   ├── fire-hazard/
│   │   ├── FireHazardAgent.ts
│   │   ├── fireHazard.types.ts
│   │   ├── fireHazard.logic.ts
│   │   └── index.ts
│   │
│   ├── occupancy/
│   │   ├── OccupancyAgent.ts
│   │   ├── occupancy.types.ts
│   │   ├── occupancy.logic.ts
│   │   └── index.ts
│   │
│   ├── security/
│   │   ├── SecurityAgent.ts
│   │   ├── security.types.ts
│   │   ├── security.logic.ts
│   │   └── index.ts
│   │
│   ├── coordinator/
│   │   ├── EmergencyCoordinator.ts
│   │   ├── coordinator.types.ts
│   │   ├── coordinator.logic.ts
│   │   └── index.ts
│   │
│   ├── ethical-priority/
│   │   ├── EthicalPriorityAgent.ts
│   │   ├── ethicalPriority.types.ts
│   │   ├── ethicalPriority.logic.ts
│   │   └── index.ts
│   │
│   └── cross-building/
│       ├── CrossBuildingAgent.ts
│       ├── crossBuilding.types.ts
│       ├── crossBuilding.logic.ts
│       └── index.ts
│
├── app/
│   ├── landing/
│   ├── dashboard/
│   ├── agents/
│   ├── emergency/
│   ├── decision-control/
│   └── network/
│
├── components/
│   ├── ui/
│   └── shared/
│
├── lib/
│   ├── firebase/
│   └── interoperability/
│
├── types/
│   ├── agent.types.ts
│   ├── emergency.types.ts
│   └── building.types.ts
│
├── public/
│   └── images/
│
├── package.json
├── tsconfig.json
└── README.md
```

---

## Getting Started

### Prerequisites

* Node.js
* npm
* Firebase project
* Required environment variables

### Installation

```bash
git clone <repository-url>

cd lattice

npm install
```

### Environment Variables

Create a `.env.local` file:

```env
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=

AI_API_KEY=
AI_MODEL=
AI_BASE_URL=
```

Do not commit environment files or secret API keys to the repository.

### Run locally

```bash
npm run dev
```

The development server will start locally and provide the application URL.

---

## Development Status

LATTICE is currently a **functional prototype / hackathon implementation**.

Current development focuses on:

* Multi-agent emergency simulation
* Agent interoperability
* Emergency coordination logic
* Human-in-the-loop decision control
* Cross-building communication
* Failure and fallback handling
* Responsive operator interface
* Hardware and SOS integration pathways

The emergency scenarios currently use simulated/mock data for demonstration and testing.

---

## Safety Notice

LATTICE is a research and prototype system and is **not intended to replace certified fire safety, emergency management, building control, or life-safety systems**.

Any real-world deployment would require appropriate validation, regulatory compliance, infrastructure integration, security testing, and qualified human oversight.

---

## Team

**Team:** 11 Dimensions


/**
 * index.ts
 *
 * Single entry point for the rest of the app. Existing or future agent
 * runtimes should only ever import `getAIProvider()` from here — never
 * import GroqProvider directly elsewhere. That keeps Groq fully swappable
 * and keeps the mock-fallback guarantee in one place.
 *
 *   Existing Agent
 *        ↓
 *   getAIProvider()  (this file)
 *        ↓
 *   GroqProvider  →  (unavailable) →  MockProvider
 *
 * Also re-exports the simulation/agent-runtime layer (AgentRuntime,
 * getAgentRuntime, InterventionConstraints) so EmergencyContext and other
 * consumers only ever import from '../lib/ai'.
 */

import type { AIProvider, SharedEmergencyState } from './AIProvider';
import { GroqProvider } from './GroqProvider';

export type { AIProvider, AIProviderConfig, SharedEmergencyState } from './AIProvider';
export { GroqProvider } from './GroqProvider';

export type { AgentRuntime, InterventionConstraints, StateChangeListener } from './AgentRuntime';
export { getAgentRuntime } from './AgentRuntime';

class MockProvider implements AIProvider {
  readonly name = 'Mock';
  readonly modelName = 'mock-simulation';

  isAvailable(): boolean {
    return true;
  }

  async generateAgentResponse(agentId: string): Promise<string> {
    return `[Mock AI Response]\nAgent "${agentId}" simulated assessment — no live AI provider configured.`;
  }
}

let cachedProvider: AIProvider | null = null;

/**
 * Returns the active AI provider. Currently always resolves to GroqProvider
 * (which internally mock-falls-back per request if no key is set). Exposed
 * as a function — not a bare singleton export — so a future provider swap
 * or per-call config override doesn't require changing every call site.
 */
export function getAIProvider(): AIProvider {
  if (!cachedProvider) {
    cachedProvider = new GroqProvider();
  }
  return cachedProvider;
}

/** Explicit mock provider, useful for tests or an offline demo mode. */
export function getMockProvider(): AIProvider {
  return new MockProvider();
}
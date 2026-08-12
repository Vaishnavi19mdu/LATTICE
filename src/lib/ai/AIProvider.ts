/**
 * AIProvider.ts
 *
 * Shared contract for any AI backend LATTICE agents can optionally use.
 * Keeping this as an interface (not a class) means GroqProvider, a future
 * OpenAI/Anthropic provider, and MockProvider are all interchangeable —
 * nothing in the rest of the app needs to know which one is active.
 */

import { GroqProvider } from './GroqProvider';

export interface AIProviderConfig {
  apiKey?: string;
  modelName?: string;
  baseUrl?: string;
}

/**
 * Minimal shape of "current state" a provider needs to reason about an
 * emergency. This intentionally mirrors your existing SharedEmergencyState
 * concept loosely — swap the `any` for your real type once this file lives
 * inside the project and can import it directly.
 */
export type SharedEmergencyState = Record<string, unknown>;

export interface AIProvider {
  /** Human-readable provider name, e.g. "Groq" or "Mock" */
  readonly name: string;

  /** Model identifier currently configured, e.g. "llama-3.3-70b-versatile" */
  readonly modelName: string;

  /**
   * Whether this provider is actually configured and reachable
   * (has an API key, etc). Does NOT guarantee the network call will
   * succeed — just that it's not obviously running in mock mode.
   */
  isAvailable(): boolean;

  /**
   * Ask the provider to generate a concise operational assessment for a
   * given agent, given a free-text prompt and the current emergency state.
   * Implementations must never throw — on failure, return a safe fallback
   * string and log the technical error internally.
   */
  generateAgentResponse(
    agentId: string,
    prompt: string,
    currentState: SharedEmergencyState
  ): Promise<string>;
}

/**
 * Thin adapter around the active provider that exposes `isConfigured()` as
 * an alias for `isAvailable()`. Some consumers (e.g. OperationsChatWidget)
 * call `.isConfigured()` directly; keeping the alias here means neither the
 * AIProvider interface nor GroqProvider itself need to change.
 */
class DefaultAIProviderAdapter implements AIProvider {
  constructor(private readonly inner: AIProvider) {}

  get name(): string {
    return this.inner.name;
  }

  get modelName(): string {
    return this.inner.modelName;
  }

  isAvailable(): boolean {
    return this.inner.isAvailable();
  }

  /** Alias for isAvailable(), used by chat/UI components. */
  isConfigured(): boolean {
    return this.inner.isAvailable();
  }

  generateAgentResponse(
    agentId: string,
    prompt: string,
    currentState: SharedEmergencyState
  ): Promise<string> {
    return this.inner.generateAgentResponse(agentId, prompt, currentState);
  }
}

/**
 * App-wide default provider instance. Components can import this directly
 * (`import { defaultAIProvider } from '.../lib/ai/AIProvider'`) instead of
 * going through the index.ts factory when they just need the one active
 * provider and don't care about swapping implementations.
 */
export const defaultAIProvider: AIProvider & { isConfigured(): boolean } = new DefaultAIProviderAdapter(
  new GroqProvider()
);
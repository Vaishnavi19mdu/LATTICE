/**
 * GroqProvider.ts
 *
 * Isolated Groq adapter. This is the ONLY file that talks to the Groq API.
 * If Groq is down, misconfigured, or has no key set, callers always get a
 * usable string back — the simulation never breaks because of this module.
 *
 * SECURITY NOTE (prototype phase):
 * Vite `VITE_*` env vars are bundled into the client and are NOT secret.
 * This is fine for a prototype / internal demo, but before any real
 * deployment this call should move behind a server route so the Groq key
 * never ships to the browser. Keeping the provider isolated here (rather
 * than scattered through agent logic) is what makes that migration a
 * one-file change later instead of a rewrite.
 */

import type { AIProvider, AIProviderConfig, SharedEmergencyState } from './AIProvider';

const DEFAULT_CONFIG: Required<AIProviderConfig> = {
  apiKey: (import.meta as any).env?.VITE_GROQ_API_KEY || '',
  modelName: 'llama-3.3-70b-versatile',
  baseUrl: 'https://api.groq.com/openai/v1',
};

const MOCK_RESPONSE =
  '[Mock AI Response]\nProcessing the current emergency telemetry and evaluating available response options.';

export class GroqProvider implements AIProvider {
  readonly name = 'Groq';
  private config: Required<AIProviderConfig>;

  constructor(overrides: AIProviderConfig = {}) {
    this.config = { ...DEFAULT_CONFIG, ...overrides };
  }

  get modelName(): string {
    return this.config.modelName;
  }

  isAvailable(): boolean {
    return Boolean(this.config.apiKey);
  }

  async generateAgentResponse(
    agentId: string,
    prompt: string,
    currentState: SharedEmergencyState
  ): Promise<string> {
    if (!this.isAvailable()) {
      return MOCK_RESPONSE;
    }

    const systemMessage = [
      `You are agent "${agentId}" in the LATTICE emergency coordination system.`,
      '',
      'Analyze the supplied emergency event and current state.',
      'Respond with a concise operational assessment.',
      'Do not invent sensor readings or facts that are not present in the supplied state.',
    ].join('\n');

    const userMessage = [
      `Event / prompt: ${prompt}`,
      '',
      `Current state (JSON): ${safeStringify(currentState)}`,
    ].join('\n');

    try {
      const response = await fetch(`${this.config.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.config.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: this.config.modelName,
          messages: [
            { role: 'system', content: systemMessage },
            { role: 'user', content: userMessage },
          ],
          temperature: 0.4,
          max_tokens: 300,
        }),
      });

      if (!response.ok) {
        console.error(`[GroqProvider] request failed: ${response.status} ${response.statusText}`);
        return safeFallback();
      }

      const data = await response.json();
      const text: string | undefined = data?.choices?.[0]?.message?.content;

      if (!text) {
        console.error('[GroqProvider] response had no content', data);
        return safeFallback();
      }

      return text.trim();
    } catch (err) {
      // Never leak the API key or raw error details to the UI.
      console.error('[GroqProvider] network/parse error:', err);
      return safeFallback();
    }
  }
}

function safeFallback(): string {
  return '[AI Provider Unavailable]\nFalling back to standard agent logic — Groq request could not complete.';
}

function safeStringify(value: unknown): string {
  try {
    return JSON.stringify(value);
  } catch {
    return '{}';
  }
}
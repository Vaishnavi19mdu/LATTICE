import { SharedEmergencyState } from '../mock/emergencyScenario';

/**
 * AIProvider interface for real Groq LLM integration.
 * Enables seamless switching from MockAgentRuntime to LLMAgentRuntime
 * without altering the UI or event subscriptions.
 */
export interface AIProviderConfig {
  apiKey?: string;
  modelName?: string;
  baseUrl?: string;
}

export class AIProviderAdapter {
  private config: AIProviderConfig;

  constructor(config: AIProviderConfig = {}) {
    this.config = {
      apiKey: config.apiKey || (import.meta as any).env?.VITE_GROQ_API_KEY || '',
      modelName: config.modelName || 'llama-3.3-70b-versatile',
      baseUrl: config.baseUrl || 'https://api.groq.com/openai/v1',
    };
  }

  public isConfigured(): boolean {
    return Boolean(this.config.apiKey && this.config.apiKey.length > 5);
  }

  public async generateAgentResponse(
    agentId: string,
    prompt: string,
    currentState: SharedEmergencyState
  ): Promise<string> {
    if (!this.isConfigured()) {
      // Structured fallback when no key is set — keeps app usable offline
      return `[Mock AI Response for ${agentId}]: Processing event "${prompt}" with high confidence based on current telemetry.`;
    }

    try {
      const response = await fetch(`${this.config.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.config.apiKey}`,
        },
        body: JSON.stringify({
          model: this.config.modelName,
          messages: [
            {
              role: 'system',
              content: `You are agent "${agentId}" in an emergency coordination simulation. Respond concisely (1-2 sentences) with a realistic operational assessment based on the given event and state.`,
            },
            {
              role: 'user',
              content: `Event: ${prompt}\n\nCurrent state: ${JSON.stringify(currentState).slice(0, 1500)}`,
            },
          ],
          temperature: 0.6,
          max_tokens: 150,
        }),
      });

      if (!response.ok) {
        const errText = await response.text();
        console.error(`Groq API error (${response.status}):`, errText);
        return `[AI Error for ${agentId}]: Falling back to default response.`;
      }

      const data = await response.json();
      const content = data?.choices?.[0]?.message?.content;
      return content?.trim() || `[Empty AI Response for ${agentId}]`;
    } catch (err) {
      console.error('Groq request failed:', err);
      return `[AI Error for ${agentId}]: Request failed, using fallback.`;
    }
  }
}

export const defaultAIProvider = new AIProviderAdapter();
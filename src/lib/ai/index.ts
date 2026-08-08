import { AgentRuntime } from './AgentRuntime';
import { mockAgentRuntime } from './MockAgentRuntime';

/**
 * Returns the currently active AgentRuntime.
 * Default implementation is MockAgentRuntimeImpl (works offline with 0 API keys).
 * // In the future, this can dynamically switch to LLMAgentRuntime when VITE_GROQ_API_KEY is configured.
 */
export function getAgentRuntime(): AgentRuntime {
  return mockAgentRuntime;
}

export * from './AgentRuntime';
export * from './AIProvider';

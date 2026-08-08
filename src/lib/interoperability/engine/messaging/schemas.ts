import type { MessageType } from "./messageTypes";

/**
 * Base message exchanged between agents.
 */
export interface AgentMessage<T = unknown> {
  messageId: string;
  senderAgentId: string;
  receiverAgentId: string;
  messageType: MessageType;
  timestamp: string;
  payload: T;
}

/**
 * Request sent from one agent to another.
 */
export interface RequestMessage<T = unknown> extends AgentMessage<T> {
  messageType: "REQUEST";
}

/**
 * Response returned from a request.
 */
export interface ResponseMessage<T = unknown> extends AgentMessage<T> {
  messageType: "RESPONSE";
}

/**
 * Standard capability request payload.
 */
export interface CapabilityRequest {
  capability: string;
}

/**
 * Standard capability response payload.
 */
export interface CapabilityResponse {
  capability: string;
  available: boolean;
}
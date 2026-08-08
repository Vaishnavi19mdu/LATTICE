/**
 * Defines the supported communication patterns
 * between interoperable agents.
 */
export type MessageType =
  | "REQUEST"
  | "RESPONSE"
  | "EVENT"
  | "ERROR";
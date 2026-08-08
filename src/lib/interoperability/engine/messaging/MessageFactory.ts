import type {
  AgentMessage,
  RequestMessage,
  ResponseMessage,
} from "./schemas";

export class MessageFactory {
  static createRequest<T>(
    senderAgentId: string,
    receiverAgentId: string,
    payload: T
  ): RequestMessage<T> {
    return {
      messageId: crypto.randomUUID(),
      senderAgentId,
      receiverAgentId,
      messageType: "REQUEST",
      timestamp: new Date().toISOString(),
      payload,
    };
  }

  static createResponse<T>(
    senderAgentId: string,
    receiverAgentId: string,
    payload: T
  ): ResponseMessage<T> {
    return {
      messageId: crypto.randomUUID(),
      senderAgentId,
      receiverAgentId,
      messageType: "RESPONSE",
      timestamp: new Date().toISOString(),
      payload,
    };
  }

  static createEvent<T>(
    senderAgentId: string,
    receiverAgentId: string,
    payload: T
  ): AgentMessage<T> {
    return {
      messageId: crypto.randomUUID(),
      senderAgentId,
      receiverAgentId,
      messageType: "EVENT",
      timestamp: new Date().toISOString(),
      payload,
    };
  }

  static createError(
    senderAgentId: string,
    receiverAgentId: string,
    message: string
  ): AgentMessage<{ error: string }> {
    return {
      messageId: crypto.randomUUID(),
      senderAgentId,
      receiverAgentId,
      messageType: "ERROR",
      timestamp: new Date().toISOString(),
      payload: {
        error: message,
      },
    };
  }
}
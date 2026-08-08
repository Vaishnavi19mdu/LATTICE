import type { AgentMessage } from "./schemas";
import { AgentRegistry } from "../registry";

export class MessageRouter {
  constructor(private readonly registry: AgentRegistry) {}

  send(message: AgentMessage): boolean {
    const receiver = this.registry.getAgent(message.receiverAgentId);
    if (!receiver) {
      console.warn("Receiver not found.");
      return false;
    }
    if (receiver.status === "offline") {
      console.warn("Receiver offline.");
      return false;
    }
    console.log("Routing message");
    console.log(message);
    return true;
  }
}
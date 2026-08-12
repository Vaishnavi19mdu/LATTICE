import { SOSDialer } from './SOSDialer';

/**
 * Basic implementation of SOSDialer for demo/simulation purposes.
 * Logs the dial attempt and resolves true after a short delay,
 * simulating a successful emergency call/notification.
 *
 * Swap this out later for a real integration (Twilio call, webhook
 * to a monitoring service, push notification, etc.) — just implement
 * the same SOSDialer interface and pass your version into useSOSTrigger
 * instead of this one.
 */
export class ConsoleSOSDialer implements SOSDialer {
  async dial(recipient: string): Promise<boolean> {
    console.log(`📞 Dialing SOS recipient: ${recipient}...`);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    console.log(`✅ SOS call connected to ${recipient} (simulated)`);
    return true;
  }
}
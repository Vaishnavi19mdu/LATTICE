export interface SOSDialer {
  dial(recipient: string): Promise<boolean>;
}
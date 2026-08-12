export type SOSStatus =
  | "IDLE"
  | "SOUNDING"
  | "READY_TO_DIAL"
  | "COMPLETED";

export interface SOSRequest {
  recipient: string;
}

export class SOSManager {
  private status: SOSStatus = "IDLE";

  private readonly temporarySeverity = "HIGH";

  constructor(
    private readonly soundDurationMs = 8000
  ) {}

  getStatus(): SOSStatus {
    return this.status;
  }

  getTemporarySeverity(): string {
    return this.temporarySeverity;
  }

  async triggerSOS(
    request: SOSRequest
  ): Promise<void> {

    if (this.status !== "IDLE") {
      throw new Error(
        "SOS is already active."
      );
    }

    console.log(
      "SOS Activated"
    );

    console.log(
      "Temporary Severity:",
      this.temporarySeverity
    );

    console.log(
      "Recipient:",
      request.recipient
    );

    this.status = "SOUNDING";

    console.log(
      "SOS Sound Started..."
    );

    await this.waitForSoundDuration();

    this.status = "READY_TO_DIAL";

    console.log(
      "SOS Sound Completed."
    );
  }

  completeSOS(): void {
    this.status = "COMPLETED";
  }

  reset(): void {
    this.status = "IDLE";
  }

  private waitForSoundDuration(): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(
        resolve,
        this.soundDurationMs
      );
    });
  }
}
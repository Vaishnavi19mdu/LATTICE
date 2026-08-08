export type EmergencySeverity = 'low' | 'medium' | 'high' | 'critical';

export interface EmergencyIncident {
  id: string;
  buildingId: string;
  severity: EmergencySeverity;
  type: string;
  status: 'active' | 'resolved' | 'monitoring';
  detectedAt: string;
  description: string;
}

import React, { useState } from 'react';
import { X, Building2 } from 'lucide-react';

/* ============================================================================
   TYPES
   ========================================================================== */

export interface RegisterBuildingFormData {
  // 1. Basic Information
  buildingName: string;
  buildingId: string;
  buildingType: string;
  description: string;

  // 2. Location
  address: string;
  city: string;
  state: string;
  postalCode: string;

  // 3. Building Configuration
  floors: number;
  occupancyCapacity: number;
  currentOccupancy: number;
  assemblyPoint: string;
  emergencyContact: string;

  // 4. Operations
  assignedOperator: string;
  buildingStatus: 'Operational' | 'Monitoring' | 'Emergency' | 'Offline';
  monitoringEnabled: boolean;

  // 5. Emergency Configuration
  primaryEmergencyExit: string;
  emergencyResponseZone: string;
  assistanceRequirements: string;
}

const BUILDING_TYPES = ['Office', 'Residential', 'Hospital', 'Campus', 'Industrial', 'Other'];
const BUILDING_STATUSES: RegisterBuildingFormData['buildingStatus'][] = [
  'Operational',
  'Monitoring',
  'Emergency',
  'Offline',
];

const EMPTY_FORM: RegisterBuildingFormData = {
  buildingName: '',
  buildingId: '',
  buildingType: 'Office',
  description: '',
  address: '',
  city: '',
  state: '',
  postalCode: '',
  floors: 1,
  occupancyCapacity: 0,
  currentOccupancy: 0,
  assemblyPoint: '',
  emergencyContact: '',
  assignedOperator: '',
  buildingStatus: 'Operational',
  monitoringEnabled: true,
  primaryEmergencyExit: '',
  emergencyResponseZone: '',
  assistanceRequirements: '',
};

interface RegisterBuildingModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: RegisterBuildingFormData) => void;
  /** Names to populate the "Assigned Building Operator" dropdown, e.g. ['Vaishnavi', 'Arun', 'Priya'] */
  operatorOptions?: string[];
}

/* ============================================================================
   SMALL FIELD PRIMITIVES
   ========================================================================== */

const FieldLabel: React.FC<{ children: React.ReactNode; required?: boolean }> = ({ children, required }) => (
  <label className="block text-[10px] font-mono-tech font-bold text-[#A99BC9] uppercase tracking-wider mb-1.5">
    {children}
    {required && <span className="text-[#E26161] ml-0.5">*</span>}
  </label>
);

const inputClass =
  'w-full px-3 py-2.5 bg-[#1F1D29] text-[#F3F3F3] border border-[#423F4F] rounded-[6px] text-sm font-sans placeholder:text-[#565E75] focus:outline-none focus:border-[#A99BC9] transition-colors';

const SectionTitle: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <h3 className="text-xs font-mono-tech font-extrabold text-[#F3F3F3] uppercase tracking-wider pb-2 mb-4 border-b border-[#423F4F]/60">
    {children}
  </h3>
);

/* ============================================================================
   MODAL
   ========================================================================== */

export const RegisterBuildingModal: React.FC<RegisterBuildingModalProps> = ({
  open,
  onClose,
  onSubmit,
  operatorOptions = [],
}) => {
  const [form, setForm] = useState<RegisterBuildingFormData>(EMPTY_FORM);
  const [errors, setErrors] = useState<Partial<Record<keyof RegisterBuildingFormData, string>>>({});

  if (!open) return null;

  const update = <K extends keyof RegisterBuildingFormData>(key: K, value: RegisterBuildingFormData[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const validate = (): boolean => {
    const next: Partial<Record<keyof RegisterBuildingFormData, string>> = {};
    if (!form.buildingName.trim()) next.buildingName = 'Required';
    if (!form.buildingId.trim()) next.buildingId = 'Required';
    if (!form.address.trim()) next.address = 'Required';
    if (!form.city.trim()) next.city = 'Required';
    if (!form.floors || form.floors < 1) next.floors = 'Must be at least 1';
    if (!form.occupancyCapacity || form.occupancyCapacity < 1) next.occupancyCapacity = 'Required';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    onSubmit(form);
    setForm(EMPTY_FORM);
    onClose();
  };

  const handleCancel = () => {
    setForm(EMPTY_FORM);
    setErrors({});
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={handleCancel}
    >
      <div
        className="w-full max-w-2xl max-h-[90vh] bg-[#292733] border border-[#423F4F] rounded-[10px] shadow-2xl flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* HEADER */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#423F4F] shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-[6px] bg-[#A99BC9]/15 border border-[#A99BC9]/30 flex items-center justify-center">
              <Building2 className="w-4.5 h-4.5 text-[#A99BC9]" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-[#F3F3F3] font-mono-tech tracking-wide">
                REGISTER BUILDING
              </h2>
              <p className="text-[11px] text-[#565E75]">Add a new building to the LATTICE campus mesh</p>
            </div>
          </div>
          <button
            onClick={handleCancel}
            className="p-2 rounded-[6px] text-[#565E75] hover:text-[#F3F3F3] hover:bg-[#423F4F] transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-4.5 h-4.5" />
          </button>
        </div>

        {/* BODY */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-8">
          {/* 1. BASIC INFORMATION */}
          <div>
            <SectionTitle>Basic Information</SectionTitle>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <FieldLabel required>Building Name</FieldLabel>
                <input
                  className={inputClass}
                  placeholder="e.g. Operations Tower"
                  value={form.buildingName}
                  onChange={(e) => update('buildingName', e.target.value)}
                />
                {errors.buildingName && <p className="text-[10px] text-[#E26161] mt-1">{errors.buildingName}</p>}
              </div>
              <div>
                <FieldLabel required>Building ID</FieldLabel>
                <input
                  className={inputClass}
                  placeholder="e.g. BLD-A001"
                  value={form.buildingId}
                  onChange={(e) => update('buildingId', e.target.value)}
                />
                {errors.buildingId && <p className="text-[10px] text-[#E26161] mt-1">{errors.buildingId}</p>}
              </div>
              <div>
                <FieldLabel>Building Type</FieldLabel>
                <select
                  className={inputClass}
                  value={form.buildingType}
                  onChange={(e) => update('buildingType', e.target.value)}
                >
                  {BUILDING_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>
              <div className="sm:col-span-2">
                <FieldLabel>Description</FieldLabel>
                <input
                  className={inputClass}
                  placeholder="Short optional description"
                  value={form.description}
                  onChange={(e) => update('description', e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* 2. LOCATION */}
          <div>
            <SectionTitle>Location</SectionTitle>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <FieldLabel required>Address</FieldLabel>
                <input
                  className={inputClass}
                  placeholder="Street address"
                  value={form.address}
                  onChange={(e) => update('address', e.target.value)}
                />
                {errors.address && <p className="text-[10px] text-[#E26161] mt-1">{errors.address}</p>}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <FieldLabel required>City</FieldLabel>
                  <input
                    className={inputClass}
                    value={form.city}
                    onChange={(e) => update('city', e.target.value)}
                  />
                  {errors.city && <p className="text-[10px] text-[#E26161] mt-1">{errors.city}</p>}
                </div>
                <div>
                  <FieldLabel>State</FieldLabel>
                  <input
                    className={inputClass}
                    value={form.state}
                    onChange={(e) => update('state', e.target.value)}
                  />
                </div>
                <div>
                  <FieldLabel>Postal Code</FieldLabel>
                  <input
                    className={inputClass}
                    value={form.postalCode}
                    onChange={(e) => update('postalCode', e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* 3. BUILDING CONFIGURATION */}
          <div>
            <SectionTitle>Building Configuration</SectionTitle>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <FieldLabel required>Number of Floors</FieldLabel>
                <input
                  type="number"
                  min={1}
                  className={inputClass}
                  value={form.floors}
                  onChange={(e) => update('floors', Number(e.target.value))}
                />
                {errors.floors && <p className="text-[10px] text-[#E26161] mt-1">{errors.floors}</p>}
              </div>
              <div>
                <FieldLabel required>Occupancy Capacity</FieldLabel>
                <input
                  type="number"
                  min={1}
                  className={inputClass}
                  value={form.occupancyCapacity}
                  onChange={(e) => update('occupancyCapacity', Number(e.target.value))}
                />
                {errors.occupancyCapacity && (
                  <p className="text-[10px] text-[#E26161] mt-1">{errors.occupancyCapacity}</p>
                )}
              </div>
              <div>
                <FieldLabel>Current Occupancy (optional)</FieldLabel>
                <input
                  type="number"
                  min={0}
                  className={inputClass}
                  value={form.currentOccupancy}
                  onChange={(e) => update('currentOccupancy', Number(e.target.value))}
                />
              </div>
              <div>
                <FieldLabel>Emergency Assembly Point</FieldLabel>
                <input
                  className={inputClass}
                  placeholder="e.g. North Plaza"
                  value={form.assemblyPoint}
                  onChange={(e) => update('assemblyPoint', e.target.value)}
                />
              </div>
              <div className="sm:col-span-2">
                <FieldLabel>Primary Emergency Contact</FieldLabel>
                <input
                  className={inputClass}
                  placeholder="Name of primary contact"
                  value={form.emergencyContact}
                  onChange={(e) => update('emergencyContact', e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* 4. OPERATIONS */}
          <div>
            <SectionTitle>Operations</SectionTitle>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <FieldLabel>Assigned Building Operator</FieldLabel>
                <select
                  className={inputClass}
                  value={form.assignedOperator}
                  onChange={(e) => update('assignedOperator', e.target.value)}
                >
                  <option value="">Unassigned</option>
                  {operatorOptions.map((name) => (
                    <option key={name} value={name}>
                      {name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <FieldLabel>Building Status</FieldLabel>
                <select
                  className={inputClass}
                  value={form.buildingStatus}
                  onChange={(e) => update('buildingStatus', e.target.value as RegisterBuildingFormData['buildingStatus'])}
                >
                  {BUILDING_STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
              <div className="sm:col-span-2 flex items-center justify-between p-3.5 bg-[#1F1D29] rounded-[6px] border border-[#423F4F]">
                <div>
                  <p className="text-xs font-bold text-[#F3F3F3] font-mono-tech">LATTICE Monitoring</p>
                  <p className="text-[10px] text-[#565E75] mt-0.5">Enable live agent monitoring for this building</p>
                </div>
                <button
                  type="button"
                  onClick={() => update('monitoringEnabled', !form.monitoringEnabled)}
                  className={`shrink-0 w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                    form.monitoringEnabled ? 'bg-[#7AE04C]' : 'bg-[#423F4F]'
                  }`}
                  aria-pressed={form.monitoringEnabled}
                >
                  <span
                    className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${
                      form.monitoringEnabled ? 'translate-x-5' : 'translate-x-0.5'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* 5. EMERGENCY CONFIGURATION */}
          <div>
            <SectionTitle>Emergency Configuration</SectionTitle>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <FieldLabel>Primary Emergency Exit</FieldLabel>
                <input
                  className={inputClass}
                  placeholder="e.g. Exit B — West Stairwell"
                  value={form.primaryEmergencyExit}
                  onChange={(e) => update('primaryEmergencyExit', e.target.value)}
                />
              </div>
              <div>
                <FieldLabel>Emergency Response Zone</FieldLabel>
                <input
                  className={inputClass}
                  placeholder="e.g. Zone 4-North"
                  value={form.emergencyResponseZone}
                  onChange={(e) => update('emergencyResponseZone', e.target.value)}
                />
              </div>
              <div className="sm:col-span-2">
                <FieldLabel>Assistance Requirements (optional)</FieldLabel>
                <input
                  className={inputClass}
                  placeholder="e.g. Dedicated mobility-support egress on Floor 4"
                  value={form.assistanceRequirements}
                  onChange={(e) => update('assistanceRequirements', e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-[#423F4F] shrink-0 bg-[#292733]">
          <button
            onClick={handleCancel}
            className="py-2.5 px-5 bg-transparent hover:bg-[#423F4F] text-[#A99BC9] hover:text-[#F3F3F3] border border-[#423F4F] text-xs font-mono-tech font-bold uppercase tracking-wider rounded-[6px] transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="py-2.5 px-5 bg-[#F3F3F3] hover:bg-white text-[#292733] text-xs font-mono-tech font-extrabold uppercase tracking-wider rounded-[6px] transition-colors cursor-pointer"
          >
            Register Building
          </button>
        </div>
      </div>
    </div>
  );
};

export default RegisterBuildingModal;
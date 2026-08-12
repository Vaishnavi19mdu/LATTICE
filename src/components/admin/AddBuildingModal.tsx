import React, { useState } from 'react';
import { X, Building as BuildingIcon } from 'lucide-react';
import { addBuilding, BuildingStatus, NewBuildingInput } from '../../data/buildingStore';

interface AddBuildingModalProps {
  open: boolean;
  onClose: () => void;
  onCreated: (buildingId: string) => void;
  operatorOptions: string[];
}

const emptyForm: NewBuildingInput = {
  name: '',
  buildingId: '',
  type: '',
  address: '',
  city: '',
  state: '',
  postalCode: '',
  floors: 1,
  occupancyCapacity: 0,
  assemblyPoint: '',
  emergencyContact: '',
  status: 'OPERATIONAL',
  operator: '',
  monitoringEnabled: true,
};

const inputClass =
  'w-full px-3 py-2 bg-[#F3F3F3] rounded-[6px] border border-[#423F4F]/15 text-[#292733] text-xs font-mono-tech font-bold focus:outline-none focus:border-[#A99BC9] transition-colors';
const labelClass = 'text-[10px] text-[#565E75] uppercase font-bold font-mono-tech block mb-1';

export const AddBuildingModal: React.FC<AddBuildingModalProps> = ({ open, onClose, onCreated, operatorOptions }) => {
  const [form, setForm] = useState<NewBuildingInput>(emptyForm);
  const [errors, setErrors] = useState<Record<string, string>>({});

  if (!open) return null;

  const set = <K extends keyof NewBuildingInput>(key: K, value: NewBuildingInput[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = 'Building name is required';
    if (!form.buildingId.trim()) e.buildingId = 'Building ID is required';
    if (!form.type.trim()) e.type = 'Building type is required';
    if (!form.address.trim()) e.address = 'Address is required';
    if (!form.floors || form.floors < 1) e.floors = 'Must be at least 1 floor';
    if (!form.occupancyCapacity || form.occupancyCapacity < 1) e.occupancyCapacity = 'Must be greater than 0';
    if (!form.operator.trim()) e.operator = 'Assign a building operator';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    const created = addBuilding(form);
    setForm(emptyForm);
    setErrors({});
    onCreated(created.id);
    onClose();
  };

  const handleCancel = () => {
    setForm(emptyForm);
    setErrors({});
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#292733]/50 backdrop-blur-sm">
      <div className="bg-white rounded-[8px] border border-[#423F4F]/10 shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#423F4F]/10 sticky top-0 bg-white z-10">
          <div className="flex items-center gap-2.5">
            <BuildingIcon className="w-4 h-4 text-[#A99BC9]" />
            <h2 className="text-base font-extrabold text-[#292733]">REGISTER NEW BUILDING</h2>
          </div>
          <button onClick={handleCancel} className="p-1.5 text-[#565E75] hover:text-[#292733] hover:bg-[#F3F3F3] rounded transition-colors cursor-pointer" aria-label="Close">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Basic Information */}
          <div className="space-y-3">
            <h3 className="font-mono-tech text-[10px] font-bold text-[#A99BC9] uppercase tracking-wider border-b border-[#423F4F]/10 pb-2">Basic Information</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>Building Name *</label>
                <input className={inputClass} value={form.name} onChange={(e) => set('name', e.target.value)} placeholder="Building D" />
                {errors.name && <p className="text-[10px] text-[#E26161] mt-1 font-mono-tech">{errors.name}</p>}
              </div>
              <div>
                <label className={labelClass}>Building ID *</label>
                <input className={inputClass} value={form.buildingId} onChange={(e) => set('buildingId', e.target.value)} placeholder="BLDG-D" />
                {errors.buildingId && <p className="text-[10px] text-[#E26161] mt-1 font-mono-tech">{errors.buildingId}</p>}
              </div>
              <div>
                <label className={labelClass}>Building Type *</label>
                <input className={inputClass} value={form.type} onChange={(e) => set('type', e.target.value)} placeholder="Research Wing" />
                {errors.type && <p className="text-[10px] text-[#E26161] mt-1 font-mono-tech">{errors.type}</p>}
              </div>
              <div>
                <label className={labelClass}>Address *</label>
                <input className={inputClass} value={form.address} onChange={(e) => set('address', e.target.value)} placeholder="4 LATTICE Way" />
                {errors.address && <p className="text-[10px] text-[#E26161] mt-1 font-mono-tech">{errors.address}</p>}
              </div>
              <div>
                <label className={labelClass}>City</label>
                <input className={inputClass} value={form.city} onChange={(e) => set('city', e.target.value)} placeholder="Chennai" />
              </div>
              <div>
                <label className={labelClass}>State</label>
                <input className={inputClass} value={form.state} onChange={(e) => set('state', e.target.value)} placeholder="Tamil Nadu" />
              </div>
              <div>
                <label className={labelClass}>Postal Code</label>
                <input className={inputClass} value={form.postalCode} onChange={(e) => set('postalCode', e.target.value)} placeholder="600001" />
              </div>
            </div>
          </div>

          {/* Building Details */}
          <div className="space-y-3">
            <h3 className="font-mono-tech text-[10px] font-bold text-[#A99BC9] uppercase tracking-wider border-b border-[#423F4F]/10 pb-2">Building Details</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>Number of Floors *</label>
                <input type="number" min={1} className={inputClass} value={form.floors} onChange={(e) => set('floors', Number(e.target.value))} />
                {errors.floors && <p className="text-[10px] text-[#E26161] mt-1 font-mono-tech">{errors.floors}</p>}
              </div>
              <div>
                <label className={labelClass}>Occupancy Capacity *</label>
                <input type="number" min={1} className={inputClass} value={form.occupancyCapacity} onChange={(e) => set('occupancyCapacity', Number(e.target.value))} />
                {errors.occupancyCapacity && <p className="text-[10px] text-[#E26161] mt-1 font-mono-tech">{errors.occupancyCapacity}</p>}
              </div>
              <div>
                <label className={labelClass}>Emergency Assembly Point</label>
                <input className={inputClass} value={form.assemblyPoint} onChange={(e) => set('assemblyPoint', e.target.value)} placeholder="West Plaza" />
              </div>
              <div>
                <label className={labelClass}>Primary Emergency Contact</label>
                <input className={inputClass} value={form.emergencyContact} onChange={(e) => set('emergencyContact', e.target.value)} placeholder="Name or extension" />
              </div>
            </div>
          </div>

          {/* System Configuration */}
          <div className="space-y-3">
            <h3 className="font-mono-tech text-[10px] font-bold text-[#A99BC9] uppercase tracking-wider border-b border-[#423F4F]/10 pb-2">System Configuration</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>Building Status</label>
                <select className={inputClass} value={form.status} onChange={(e) => set('status', e.target.value as BuildingStatus)}>
                  <option value="OPERATIONAL">OPERATIONAL</option>
                  <option value="WARNING">WARNING</option>
                  <option value="CRITICAL">CRITICAL</option>
                </select>
              </div>
              <div>
                <label className={labelClass}>Assigned Building Operator *</label>
                <select className={inputClass} value={form.operator} onChange={(e) => set('operator', e.target.value)}>
                  <option value="">Select operator…</option>
                  {operatorOptions.map((op) => (
                    <option key={op} value={op}>{op}</option>
                  ))}
                </select>
                {errors.operator && <p className="text-[10px] text-[#E26161] mt-1 font-mono-tech">{errors.operator}</p>}
              </div>
            </div>
            <label className="flex items-center gap-2.5 pt-1 cursor-pointer">
              <input type="checkbox" checked={form.monitoringEnabled} onChange={(e) => set('monitoringEnabled', e.target.checked)} className="w-4 h-4 accent-[#7AE04C]" />
              <span className="text-xs font-bold text-[#292733] font-mono-tech">Enable LATTICE Monitoring</span>
            </label>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-[#423F4F]/10 sticky bottom-0 bg-white">
          <button onClick={handleCancel} className="py-2 px-4 text-xs font-mono-tech font-bold uppercase tracking-wider text-[#565E75] hover:text-[#292733] hover:bg-[#F3F3F3] rounded-[6px] transition-colors cursor-pointer">
            Cancel
          </button>
          <button onClick={handleSubmit} className="py-2 px-4 bg-[#292733] hover:bg-[#423F4F] text-white text-xs font-mono-tech font-extrabold uppercase tracking-wider rounded-[6px] transition-colors cursor-pointer">
            Register Building
          </button>
        </div>
      </div>
    </div>
  );
};
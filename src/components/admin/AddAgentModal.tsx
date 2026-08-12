import React, { useState } from 'react';
import { X, Bot } from 'lucide-react';
import { addAgent, AgentStatus, CAPABILITY_OPTIONS, NewAgentInput } from '../../data/agentRegistryStore';
import { BuildingRecord } from '../../data/buildingStore';

interface AddAgentModalProps {
  open: boolean;
  onClose: () => void;
  onCreated: (agentId: string) => void;
  buildings: BuildingRecord[];
}

const emptyForm: NewAgentInput = {
  name: '',
  agentId: '',
  type: '',
  description: '',
  assignedBuildingId: '',
  department: '',
  capabilities: [],
  status: 'Active',
  confidenceThreshold: 80,
  priorityLevel: 'Medium',
};

const inputClass =
  'w-full px-3 py-2 bg-[#F3F3F3] rounded-[6px] border border-[#423F4F]/15 text-[#292733] text-xs font-mono-tech font-bold focus:outline-none focus:border-[#A99BC9] transition-colors';
const labelClass = 'text-[10px] text-[#565E75] uppercase font-bold font-mono-tech block mb-1';

export const AddAgentModal: React.FC<AddAgentModalProps> = ({ open, onClose, onCreated, buildings }) => {
  const [form, setForm] = useState<NewAgentInput>(emptyForm);
  const [errors, setErrors] = useState<Record<string, string>>({});

  if (!open) return null;

  const set = <K extends keyof NewAgentInput>(key: K, value: NewAgentInput[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const toggleCapability = (cap: string) => {
    set('capabilities', form.capabilities.includes(cap) ? form.capabilities.filter((c) => c !== cap) : [...form.capabilities, cap]);
  };

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = 'Agent name is required';
    if (!form.agentId.trim()) e.agentId = 'Agent ID is required';
    if (!form.type.trim()) e.type = 'Agent type is required';
    if (!form.assignedBuildingId) e.assignedBuildingId = 'Assign a building';
    if (form.capabilities.length === 0) e.capabilities = 'Select at least one capability';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    const created = addAgent(form);
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
            <Bot className="w-4 h-4 text-[#6B9FD4]" />
            <h2 className="text-base font-extrabold text-[#292733]">REGISTER NEW AGENT</h2>
          </div>
          <button onClick={handleCancel} className="p-1.5 text-[#565E75] hover:text-[#292733] hover:bg-[#F3F3F3] rounded transition-colors cursor-pointer" aria-label="Close">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Agent Information */}
          <div className="space-y-3">
            <h3 className="font-mono-tech text-[10px] font-bold text-[#A99BC9] uppercase tracking-wider border-b border-[#423F4F]/10 pb-2">Agent Information</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>Agent Name *</label>
                <input className={inputClass} value={form.name} onChange={(e) => set('name', e.target.value)} placeholder="Emergency Coordinator" />
                {errors.name && <p className="text-[10px] text-[#E26161] mt-1 font-mono-tech">{errors.name}</p>}
              </div>
              <div>
                <label className={labelClass}>Agent ID *</label>
                <input className={inputClass} value={form.agentId} onChange={(e) => set('agentId', e.target.value)} placeholder="AGT-COORD-D" />
                {errors.agentId && <p className="text-[10px] text-[#E26161] mt-1 font-mono-tech">{errors.agentId}</p>}
              </div>
              <div className="sm:col-span-2">
                <label className={labelClass}>Agent Type *</label>
                <input className={inputClass} value={form.type} onChange={(e) => set('type', e.target.value)} placeholder="Local response planning" />
                {errors.type && <p className="text-[10px] text-[#E26161] mt-1 font-mono-tech">{errors.type}</p>}
              </div>
              <div className="sm:col-span-2">
                <label className={labelClass}>Description</label>
                <textarea className={inputClass} rows={2} value={form.description} onChange={(e) => set('description', e.target.value)} placeholder="What this agent is responsible for…" />
              </div>
            </div>
          </div>

          {/* Assignment */}
          <div className="space-y-3">
            <h3 className="font-mono-tech text-[10px] font-bold text-[#A99BC9] uppercase tracking-wider border-b border-[#423F4F]/10 pb-2">Assignment</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>Assigned Building *</label>
                <select className={inputClass} value={form.assignedBuildingId} onChange={(e) => set('assignedBuildingId', e.target.value)}>
                  <option value="">Select building…</option>
                  {buildings.map((b) => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </select>
                {errors.assignedBuildingId && <p className="text-[10px] text-[#E26161] mt-1 font-mono-tech">{errors.assignedBuildingId}</p>}
              </div>
              <div>
                <label className={labelClass}>Department / Domain</label>
                <input className={inputClass} value={form.department} onChange={(e) => set('department', e.target.value)} placeholder="Safety" />
              </div>
            </div>
          </div>

          {/* Capabilities */}
          <div className="space-y-3">
            <h3 className="font-mono-tech text-[10px] font-bold text-[#A99BC9] uppercase tracking-wider border-b border-[#423F4F]/10 pb-2">Capabilities *</h3>
            <div className="flex flex-wrap gap-2">
              {CAPABILITY_OPTIONS.map((cap) => {
                const active = form.capabilities.includes(cap);
                return (
                  <button
                    key={cap}
                    type="button"
                    onClick={() => toggleCapability(cap)}
                    className={`px-3 py-1.5 rounded-[6px] border font-mono-tech text-[11px] font-bold transition-colors cursor-pointer ${
                      active ? 'bg-[#292733] text-white border-[#292733]' : 'bg-[#F3F3F3] text-[#565E75] border-[#423F4F]/15 hover:border-[#423F4F]/40'
                    }`}
                  >
                    {cap}
                  </button>
                );
              })}
            </div>
            {errors.capabilities && <p className="text-[10px] text-[#E26161] font-mono-tech">{errors.capabilities}</p>}
          </div>

          {/* Status + Configuration */}
          <div className="space-y-3">
            <h3 className="font-mono-tech text-[10px] font-bold text-[#A99BC9] uppercase tracking-wider border-b border-[#423F4F]/10 pb-2">Status &amp; Configuration</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className={labelClass}>Status</label>
                <select className={inputClass} value={form.status} onChange={(e) => set('status', e.target.value as AgentStatus)}>
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                  <option value="Maintenance">Maintenance</option>
                </select>
              </div>
              <div>
                <label className={labelClass}>Confidence Threshold (%)</label>
                <input type="number" min={0} max={100} className={inputClass} value={form.confidenceThreshold} onChange={(e) => set('confidenceThreshold', Number(e.target.value))} />
              </div>
              <div>
                <label className={labelClass}>Priority Level</label>
                <select className={inputClass} value={form.priorityLevel} onChange={(e) => set('priorityLevel', e.target.value as NewAgentInput['priorityLevel'])}>
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-[#423F4F]/10 sticky bottom-0 bg-white">
          <button onClick={handleCancel} className="py-2 px-4 text-xs font-mono-tech font-bold uppercase tracking-wider text-[#565E75] hover:text-[#292733] hover:bg-[#F3F3F3] rounded-[6px] transition-colors cursor-pointer">
            Cancel
          </button>
          <button onClick={handleSubmit} className="py-2 px-4 bg-[#292733] hover:bg-[#423F4F] text-white text-xs font-mono-tech font-extrabold uppercase tracking-wider rounded-[6px] transition-colors cursor-pointer">
            Register Agent
          </button>
        </div>
      </div>
    </div>
  );
};
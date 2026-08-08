import React from 'react';
import { Building2, Network, UserCheck, CheckCircle2 } from 'lucide-react';
import { useEmergency } from '../../context/EmergencyContext';
import { getRoleConfig, BUILDING_OPERATOR_CONFIG, NETWORK_OPERATOR_CONFIG } from '../../config/roleConfig';

export const RoleSwitcher: React.FC = () => {
  const { state, selectRole } = useEmergency();
  const activeRoleConfig = getRoleConfig(state.selectedRole);

  return (
    <div className="bg-[#1F2028] border border-[#565E75]/40 rounded-[8px] p-3.5 space-y-3 font-mono-tech text-xs">
      <div className="flex items-center justify-between border-b border-[#565E75]/30 pb-2">
        <span className="text-[10px] uppercase tracking-widest text-[#A99BC9] font-extrabold flex items-center gap-1.5">
          <UserCheck className="w-3.5 h-3.5 text-[#A99BC9]" />
          CURRENT OPERATOR ROLE
        </span>
        <span className="text-[9px] bg-[#292733] text-[#7AE04C] px-1.5 py-0.5 rounded border border-[#7AE04C]/30 font-bold">
          LIVE DEMO SWITCHER
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {/* ROLE 1: BUILDING OPERATOR */}
        <button
          onClick={() => selectRole('BUILDING_OPERATOR')}
          className={`p-2.5 rounded-[6px] border text-left transition-all cursor-pointer flex flex-col justify-between ${
            activeRoleConfig.role === 'building_operator'
              ? 'bg-[#423F4F] border-[#A99BC9] text-[#F3F3F3] shadow-md ring-1 ring-[#A99BC9]/50'
              : 'bg-[#292733]/70 border-[#565E75]/30 text-[#F3F3F3]/70 hover:text-[#F3F3F3] hover:bg-[#292733]'
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="font-extrabold text-xs flex items-center gap-1.5 text-[#F3F3F3]">
              👤 {BUILDING_OPERATOR_CONFIG.displayName}
            </span>
            {activeRoleConfig.role === 'building_operator' && (
              <CheckCircle2 className="w-3.5 h-3.5 text-[#7AE04C]" />
            )}
          </div>
          <div className="text-[10px] text-[#A99BC9] font-sans font-medium leading-tight">
            {BUILDING_OPERATOR_CONFIG.scope}
          </div>
          <div className="mt-1 text-[9px] text-[#7AE04C] font-bold">
            ● {BUILDING_OPERATOR_CONFIG.category}
          </div>
        </button>

        {/* ROLE 2: NETWORK OPERATOR */}
        <button
          onClick={() => selectRole('NETWORK_OPERATOR')}
          className={`p-2.5 rounded-[6px] border text-left transition-all cursor-pointer flex flex-col justify-between ${
            activeRoleConfig.role === 'network_operator'
              ? 'bg-[#423F4F] border-[#A99BC9] text-[#F3F3F3] shadow-md ring-1 ring-[#A99BC9]/50'
              : 'bg-[#292733]/70 border-[#565E75]/30 text-[#F3F3F3]/70 hover:text-[#F3F3F3] hover:bg-[#292733]'
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="font-extrabold text-xs flex items-center gap-1.5 text-[#F3F3F3]">
              🌐 {NETWORK_OPERATOR_CONFIG.displayName}
            </span>
            {activeRoleConfig.role === 'network_operator' && (
              <CheckCircle2 className="w-3.5 h-3.5 text-[#7AE04C]" />
            )}
          </div>
          <div className="text-[10px] text-[#A99BC9] font-sans font-medium leading-tight">
            {NETWORK_OPERATOR_CONFIG.scope}
          </div>
          <div className="mt-1 text-[9px] text-[#7AE04C] font-bold">
            ● {NETWORK_OPERATOR_CONFIG.category}
          </div>
        </button>
      </div>

      <div className="p-2 bg-[#292733] rounded border border-[#423F4F] text-[10px] font-sans text-[#A99BC9]">
        {activeRoleConfig.role === 'building_operator' ? (
          <p>
            <strong>Scope: {BUILDING_OPERATOR_CONFIG.scope} ({BUILDING_OPERATOR_CONFIG.category}).</strong> {BUILDING_OPERATOR_CONFIG.description}
          </p>
        ) : (
          <p>
            <strong>Scope: {NETWORK_OPERATOR_CONFIG.scope} ({NETWORK_OPERATOR_CONFIG.category}).</strong> {NETWORK_OPERATOR_CONFIG.description}
          </p>
        )}
      </div>
    </div>
  );
};

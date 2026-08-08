import React from 'react';
import { UserCheck, Network, Building2, Shield, Radio, CheckCircle2 } from 'lucide-react';
import { useEmergency } from '../../context/EmergencyContext';
import { getRoleConfig } from '../../config/roleConfig';
import { getProfileForRole } from '../../lib/auth/devAuth';

interface OperatorProfileCardProps {
  compact?: boolean;
  className?: string;
}

export const OperatorProfileCard: React.FC<OperatorProfileCardProps> = ({ compact = false, className = '' }) => {
  const { state } = useEmergency();
  const roleConfig = getRoleConfig(state.selectedRole);
  const profile = getProfileForRole(state.selectedRole);

  const isBuildingOp = roleConfig.role === 'building_operator';

  if (compact) {
    return (
      <div className={`p-3 bg-[#423F4F]/60 rounded-[6px] border border-[#565E75]/40 flex items-center justify-between font-mono-tech ${className}`}>
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="w-8 h-8 rounded-full bg-[#A99BC9] text-[#292733] flex items-center justify-center font-bold shrink-0">
            {isBuildingOp ? <UserCheck className="w-4 h-4" /> : <Network className="w-4 h-4" />}
          </div>
          <div className="overflow-hidden">
            <p className="text-xs font-bold text-[#F3F3F3] truncate">{roleConfig.displayName}</p>
            <p className="text-[10px] text-[#A99BC9] truncate">{roleConfig.category}</p>
          </div>
        </div>

        <div className="text-right shrink-0">
          <span className="text-[9px] bg-[#292733] text-[#7AE04C] px-1.5 py-0.5 rounded border border-[#7AE04C]/30 font-bold block">
            ● ONLINE
          </span>
          <span className="text-[9px] text-[#A99BC9] block mt-0.5 font-bold">
            {roleConfig.scope}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-[#1F2028] border border-[#565E75]/40 rounded-[8px] p-4 font-mono-tech text-xs space-y-3 ${className}`}>
      {/* Header Badge */}
      <div className="flex items-center justify-between border-b border-[#565E75]/30 pb-2.5">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded bg-[#A99BC9]/20 border border-[#A99BC9]/40 flex items-center justify-center text-[#A99BC9]">
            {isBuildingOp ? <UserCheck className="w-4 h-4" /> : <Network className="w-4 h-4" />}
          </div>
          <div>
            <span className="text-[10px] text-[#A99BC9] uppercase font-extrabold tracking-wider block leading-none">
              ACTIVE OPERATOR PROFILE
            </span>
            <span className="text-xs font-extrabold text-[#F3F3F3]">{roleConfig.displayName}</span>
          </div>
        </div>

        <span className="text-[9px] bg-[#7AE04C]/10 text-[#7AE04C] px-2 py-0.5 rounded border border-[#7AE04C]/30 font-bold flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-[#7AE04C] animate-pulse"></span>
          <span>ONLINE</span>
        </span>
      </div>

      {/* Role Details Grid */}
      <div className="grid grid-cols-2 gap-2 text-[10px]">
        <div className="p-2 bg-[#292733] rounded border border-[#423F4F]">
          <span className="text-[#A99BC9] block uppercase font-bold text-[9px]">CATEGORY</span>
          <span className="text-[#F3F3F3] font-extrabold">{roleConfig.category}</span>
        </div>

        <div className="p-2 bg-[#292733] rounded border border-[#423F4F]">
          <span className="text-[#A99BC9] block uppercase font-bold text-[9px]">ACCESS LEVEL</span>
          <span className="text-[#F3F3F3] font-extrabold">{roleConfig.accessLevel}</span>
        </div>

        <div className="p-2 bg-[#292733] rounded border border-[#423F4F]">
          <span className="text-[#A99BC9] block uppercase font-bold text-[9px]">SCOPE</span>
          <span className="text-[#F3F3F3] font-extrabold">{roleConfig.scope}</span>
        </div>

        <div className="p-2 bg-[#292733] rounded border border-[#423F4F]">
          <span className="text-[#A99BC9] block uppercase font-bold text-[9px]">SCOPE TYPE</span>
          <span className="text-[#F3F3F3] font-extrabold">{roleConfig.scopeTypeLabel}</span>
        </div>
      </div>

      {/* Scope Details Summary */}
      <div className="p-2.5 bg-[#292733] rounded border border-[#423F4F] space-y-1">
        <span className="text-[9px] text-[#A99BC9] uppercase font-bold block">
          {isBuildingOp ? 'ASSIGNED SCOPE' : 'NETWORK SCOPE'}
        </span>
        {isBuildingOp ? (
          <div className="flex items-center gap-2 text-xs font-bold text-[#F3F3F3]">
            <Building2 className="w-3.5 h-3.5 text-[#E26161]" />
            <span>Building A</span>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-xs font-bold text-[#F3F3F3]">
            <Radio className="w-3.5 h-3.5 text-[#6B9FD4]" />
            <span>A • B • C (Campus Mesh)</span>
          </div>
        )}
      </div>

      {/* Description */}
      <p className="text-[10px] text-[#A99BC9] font-sans leading-tight">
        {roleConfig.description}
      </p>
    </div>
  );
};

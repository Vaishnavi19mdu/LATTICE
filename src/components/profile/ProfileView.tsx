import React from 'react';
import { Settings, Building as BuildingIcon, Network, ShieldCheck, Clock, KeyRound, Mail } from 'lucide-react';
import { OperatorRoleConfig } from '../../types/role.types';
import { useAuth } from '../../lib/firebase/authContext';

interface ProfileLike {
  name: string;
  category?: string;
  scope?: string;
  [key: string]: any;
}

interface ProfileViewProps {
  profile: ProfileLike;
  roleConfig: OperatorRoleConfig;
  onOpenSettings: () => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({ profile, roleConfig, onOpenSettings }) => {
  const { profile: accountProfile } = useAuth();
  const isBuildingOperator = roleConfig.role === 'building_operator';

  return (
    <div className="space-y-6 font-sans max-w-3xl">
      {/* Identity Card */}
      <div className="bg-white border border-[#423F4F]/10 rounded-[8px] p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-[#292733] text-[#A99BC9] flex items-center justify-center text-2xl font-bold shrink-0 border-2 border-[#A99BC9]/40">
              {roleConfig.iconType === 'user' ? '👤' : '🌐'}
            </div>
            <div>
              <h1 className="text-xl font-extrabold text-[#292733] tracking-tight">{profile.name}</h1>
              <p className="text-xs text-[#565E75] font-mono-tech mt-0.5">{roleConfig.displayName} · {roleConfig.scope}</p>
              <span className="inline-flex items-center gap-1.5 mt-2 px-2.5 py-1 bg-[#7AE04C]/10 border border-[#7AE04C]/30 text-[#292733] rounded font-mono-tech text-[10px] font-bold uppercase">
                <span className="w-1.5 h-1.5 rounded-full bg-[#7AE04C]" /> Online
              </span>
            </div>
          </div>

          <button
            onClick={onOpenSettings}
            className="py-2 px-4 bg-[#292733] hover:bg-[#423F4F] text-[#F3F3F3] rounded-[6px] font-mono-tech text-xs font-bold uppercase tracking-wider flex items-center gap-2 cursor-pointer transition-all"
          >
            <Settings className="w-3.5 h-3.5 text-[#A99BC9]" />
            <span>Edit in Settings</span>
          </button>
        </div>
      </div>

      {/* Scope Card */}
      <div className="bg-white border border-[#423F4F]/10 rounded-[8px] p-6 shadow-sm space-y-4">
        <h2 className="text-sm font-extrabold text-[#292733] uppercase font-mono-tech flex items-center gap-2">
          {isBuildingOperator ? <BuildingIcon className="w-4 h-4 text-[#E26161]" /> : <Network className="w-4 h-4 text-[#7AE04C]" />}
          <span>{isBuildingOperator ? 'Assigned Building' : 'Network Scope'}</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono-tech text-xs">
          <div className="p-3 bg-[#F3F3F3] rounded border border-[#423F4F]/10">
            <span className="text-[10px] text-[#565E75] uppercase block font-bold">Scope</span>
            <span className="font-extrabold text-[#292733]">{roleConfig.scope}</span>
          </div>
          <div className="p-3 bg-[#F3F3F3] rounded border border-[#423F4F]/10">
            <span className="text-[10px] text-[#565E75] uppercase block font-bold">Access Level</span>
            <span className="font-extrabold text-[#292733]">{roleConfig.accessLevel}</span>
          </div>
          <div className="p-3 bg-[#F3F3F3] rounded border border-[#423F4F]/10">
            <span className="text-[10px] text-[#565E75] uppercase block font-bold">Department</span>
            <span className="font-extrabold text-[#292733]">{roleConfig.department}</span>
          </div>
        </div>

        <div>
          <span className="text-[10px] text-[#565E75] uppercase block font-bold font-mono-tech mb-1.5">
            {isBuildingOperator ? 'Building' : 'Buildings Covered'}
          </span>
          <div className="flex flex-wrap gap-1.5">
            {roleConfig.buildings.map((b) => (
              <span key={b} className="px-2.5 py-1 bg-[#F3F3F3] text-[#292733] rounded border border-[#423F4F]/15 text-[10px] font-bold font-mono-tech">
                {b}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Permissions Card */}
      <div className="bg-white border border-[#423F4F]/10 rounded-[8px] p-6 shadow-sm space-y-3">
        <h2 className="text-sm font-extrabold text-[#292733] uppercase font-mono-tech flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-[#6B9FD4]" />
          <span>Permissions</span>
        </h2>
        <div className="flex flex-wrap gap-1.5">
          {roleConfig.permissions.map((p) => (
            <span key={p} className="px-2.5 py-1 bg-[#6B9FD4]/10 text-[#292733] rounded border border-[#6B9FD4]/30 text-[10px] font-bold font-mono-tech">
              {p.replace(/_/g, ' ')}
            </span>
          ))}
        </div>
      </div>

      {/* Account Card — real signed-in Firestore profile */}
      {accountProfile && (
        <div className="bg-white border border-[#423F4F]/10 rounded-[8px] p-6 shadow-sm space-y-3">
          <h2 className="text-sm font-extrabold text-[#292733] uppercase font-mono-tech flex items-center gap-2">
            <Mail className="w-4 h-4 text-[#E26161]" />
            <span>Account</span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-mono-tech text-xs">
            <div className="p-3 bg-[#F3F3F3] rounded border border-[#423F4F]/10">
              <span className="text-[10px] text-[#565E75] uppercase block font-bold">Email</span>
              <span className="font-extrabold text-[#292733] break-all">{accountProfile.email}</span>
            </div>
            <div className="p-3 bg-[#F3F3F3] rounded border border-[#423F4F]/10">
              <span className="text-[10px] text-[#565E75] uppercase block font-bold">Registered Role</span>
              <span className="font-extrabold text-[#292733]">{accountProfile.role}</span>
            </div>
          </div>
        </div>
      )}

      {/* Session Card */}
      <div className="bg-white border border-[#423F4F]/10 rounded-[8px] p-6 shadow-sm space-y-3">
        <h2 className="text-sm font-extrabold text-[#292733] uppercase font-mono-tech flex items-center gap-2">
          <Clock className="w-4 h-4 text-[#E6B85C]" />
          <span>Session & Security</span>
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-mono-tech text-xs">
          <div className="p-3 bg-[#F3F3F3] rounded border border-[#423F4F]/10 flex items-center gap-2">
            <KeyRound className="w-3.5 h-3.5 text-[#565E75]" />
            <div>
              <span className="text-[10px] text-[#565E75] uppercase block font-bold">Session ID</span>
              <span className="font-bold text-[#292733]">{roleConfig.id}</span>
            </div>
          </div>
          <div className="p-3 bg-[#F3F3F3] rounded border border-[#423F4F]/10">
            <span className="text-[10px] text-[#565E75] uppercase block font-bold">Session Timeout</span>
            <span className="font-bold text-[#292733]">Managed under Settings</span>
          </div>
        </div>
      </div>
    </div>
  );
};
import React from 'react';
import {
  Network,
  Bot,
  GitMerge,
  ShieldAlert,
  Lock,
  ClipboardList,
  Building as BuildingIcon,
  Activity,
} from 'lucide-react';
import {
  SettingsShell,
  SettingsSection,
  ToggleRow,
  TextField,
  SelectField,
  SliderField,
  Pill,
  SettingsSaveBar,
  SettingsSectionDef,
} from './SettingsPrimitives';
import { useAuth } from '../../lib/firebase/authContext';
import { useAccountSettings } from '../../hooks/useAccountSettings';
import { DEFAULT_NETWORK_ADMINISTRATOR_SETTINGS } from '../../types/settings.types';

const ACCENT = '#7AE04C';

export const NetworkAdministratorSettings: React.FC = () => {
  const { user, profile } = useAuth();

  const { data, update, save, status, error } = useAccountSettings(
    user?.uid,
    'networkAdministrator',
    DEFAULT_NETWORK_ADMINISTRATOR_SETTINGS
  );

  const buildings = [
    { name: 'Building A', status: 'Emergency', tone: 'bad' as const, floors: 12 },
    { name: 'Building B', status: 'Monitoring', tone: 'warn' as const, floors: 5 },
    { name: 'Building C', status: 'Operational', tone: 'ok' as const, floors: 4 },
  ];

  const sections: SettingsSectionDef[] = [
    {
      id: 'campus_network',
      label: 'Campus Network',
      icon: <Network className="w-3.5 h-3.5" />,
      render: () => (
        <SettingsSection icon={<Network className="w-4 h-4" />} title="Campus / Network" description="The mesh network of buildings this account administers.">
          <TextField label="Network Name" value={data.networkName} onChange={(v) => update({ networkName: v })} />
          <div>
            <span className="block text-[10px] font-mono-tech font-bold uppercase text-[#565E75] mb-2">Connected Buildings</span>
            <div className="space-y-2">
              {buildings.map((b) => (
                <div key={b.name} className="p-3 bg-[#F3F3F3] rounded-[6px] border border-[#423F4F]/10 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <BuildingIcon className="w-4 h-4 text-[#565E75]" />
                    <span className="text-xs font-bold text-[#292733]">{b.name}</span>
                    <span className="text-[10px] text-[#565E75] font-mono-tech">{b.floors} floors</span>
                  </div>
                  <Pill tone={b.tone}>{b.status}</Pill>
                </div>
              ))}
            </div>
          </div>
          <button className="text-xs font-bold text-[#292733] underline decoration-[#7AE04C] underline-offset-2 cursor-pointer">
            + Register a new building
          </button>
          <ToggleRow
            label="Inter-Building Communication"
            description="Allow buildings on this mesh to exchange status and alerts directly."
            checked={data.interBuildingComms}
            onChange={(v) => update({ interBuildingComms: v })}
          />
        </SettingsSection>
      ),
    },
    {
      id: 'agent_registry',
      label: 'Agent Registry',
      icon: <Bot className="w-3.5 h-3.5" />,
      render: () => (
        <SettingsSection icon={<Bot className="w-4 h-4" />} title="Agent Registry" description="Every agent advertising capabilities across the network, and how they're found.">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {['Fire & Hazard', 'Occupancy', 'Security', 'Coordinator', 'Ethical Priority', 'Cross-Building'].map((a) => (
              <div key={a} className="p-2.5 bg-[#F3F3F3] rounded border border-[#423F4F]/10 text-center space-y-1">
                <span className="text-[10px] font-bold text-[#292733] block truncate">{a}</span>
                <Pill tone="ok">● Healthy</Pill>
              </div>
            ))}
          </div>
          <ToggleRow
            label="Agent Discovery"
            description="Let new agents announce themselves to the registry automatically."
            checked={data.discoveryEnabled}
            onChange={(v) => update({ discoveryEnabled: v })}
          />
          <SelectField
            label="Message Routing Strategy"
            value={data.messageRouting}
            onChange={(v) => update({ messageRouting: v })}
            options={[
              { value: 'shortest_path', label: 'Shortest path' },
              { value: 'priority_weighted', label: 'Priority-weighted' },
              { value: 'broadcast', label: 'Broadcast to all nodes' },
            ]}
          />
        </SettingsSection>
      ),
    },
    {
      id: 'interoperability',
      label: 'Interoperability',
      icon: <GitMerge className="w-3.5 h-3.5" />,
      render: () => (
        <SettingsSection icon={<GitMerge className="w-4 h-4" />} title="Interoperability" description="How agents from different buildings speak to each other.">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <SelectField
              label="Message Schema Version"
              value={data.schemaVersion}
              onChange={(v) => update({ schemaVersion: v })}
              options={[
                { value: 'v2.3', label: 'v2.3 (current)' },
                { value: 'v2.2', label: 'v2.2 (legacy)' },
                { value: 'v3.0-beta', label: 'v3.0 (beta)' },
              ]}
            />
            <SelectField
              label="Routing Policy"
              value={data.routingPolicy}
              onChange={(v) => update({ routingPolicy: v })}
              options={[
                { value: 'priority_weighted', label: 'Priority-weighted' },
                { value: 'round_robin', label: 'Round robin' },
                { value: 'nearest_node', label: 'Nearest node' },
              ]}
            />
          </div>
          <ToggleRow
            label="Cross-Building Communication"
            description="Permit direct agent-to-agent messaging between buildings."
            checked={data.crossBuildingComms}
            onChange={(v) => update({ crossBuildingComms: v })}
          />
          <SelectField
            label="Agent Discovery Permissions"
            value={data.discoveryPermission}
            onChange={(v) => update({ discoveryPermission: v })}
            options={[
              { value: 'registered_only', label: 'Registered agents only' },
              { value: 'open', label: 'Open discovery' },
              { value: 'admin_approval', label: 'Requires administrator approval' },
            ]}
          />
        </SettingsSection>
      ),
    },
    {
      id: 'network_policies',
      label: 'Network Policies',
      icon: <ShieldAlert className="w-3.5 h-3.5" />,
      render: () => (
        <SettingsSection icon={<ShieldAlert className="w-4 h-4" />} title="Emergency Network Policies" description="Campus-wide rules for how an emergency in one building affects the rest.">
          <ToggleRow label="Cross-Building Escalation" description="Escalate an incident to neighboring buildings automatically." checked={data.crossEscalation} onChange={(v) => update({ crossEscalation: v })} />
          <ToggleRow label="Mutual-Aid Rules" description="Allow buildings to share resources (routes, staff, shelter) during an incident." checked={data.mutualAid} onChange={(v) => update({ mutualAid: v })} />
          <SelectField
            label="Campus-Wide Alert Policy"
            value={data.campusAlertPolicy}
            onChange={(v) => update({ campusAlertPolicy: v })}
            options={[
              { value: 'notify_adjacent', label: 'Notify adjacent buildings only' },
              { value: 'notify_all', label: 'Notify all campus buildings' },
              { value: 'silent_monitor', label: 'Silent monitoring only' },
            ]}
          />
          <SelectField
            label="Priority Rules"
            value={data.priorityRule}
            onChange={(v) => update({ priorityRule: v })}
            options={[
              { value: 'life_safety_first', label: 'Life safety first' },
              { value: 'nearest_incident_first', label: 'Nearest incident first' },
              { value: 'occupancy_weighted', label: 'Occupancy-weighted' },
            ]}
          />
          <SelectField
            label="Fallback Policy"
            value={data.fallbackPolicy}
            onChange={(v) => update({ fallbackPolicy: v })}
            options={[
              { value: 'isolate_and_hold', label: 'Isolate affected building & hold' },
              { value: 'full_campus_evac', label: 'Trigger full campus evacuation' },
              { value: 'manual_review', label: 'Route to manual review' },
            ]}
          />
        </SettingsSection>
      ),
    },
    {
      id: 'security_access',
      label: 'Security & Access',
      icon: <Lock className="w-3.5 h-3.5" />,
      render: () => (
        <SettingsSection icon={<Lock className="w-4 h-4" />} title="Security & Access" description="Who can administer the network, and how they authenticate.">
          <div>
            <span className="block text-[10px] font-mono-tech font-bold uppercase text-[#565E75] mb-2">Administrator Accounts</span>
            <div className="space-y-2">
              <div className="p-2.5 bg-[#F3F3F3] rounded border border-[#423F4F]/10 flex items-center justify-between">
                <span className="text-xs font-bold text-[#292733]">{profile?.name || 'You'} (this session)</span>
                <Pill tone="ok">Network Administrator</Pill>
              </div>
            </div>
          </div>
          <ToggleRow label="Require Multi-Factor Authentication" description="Enforce MFA for all administrator accounts." checked={data.mfaRequired} onChange={(v) => update({ mfaRequired: v })} />
          <SliderField label="Session Timeout" value={data.sessionTimeout} onChange={(v) => update({ sessionTimeout: v })} min={5} max={120} step={5} suffix=" min" />
          <ToggleRow
            label="Show API / Integration Credentials"
            description="Reveal API keys used for third-party integrations."
            checked={data.apiCredentialsVisible}
            onChange={(v) => update({ apiCredentialsVisible: v })}
          />
          {data.apiCredentialsVisible && (
            <div className="p-3 bg-[#292733] rounded-[6px] font-mono-tech text-[11px] text-[#7AE04C] break-all">
              lattice_api_key_••••••••••••••••••••••
            </div>
          )}
        </SettingsSection>
      ),
    },
    {
      id: 'monitoring_audit',
      label: 'Monitoring & Audit',
      icon: <ClipboardList className="w-3.5 h-3.5" />,
      render: () => (
        <SettingsSection icon={<ClipboardList className="w-4 h-4" />} title="Monitoring & Audit" description="Network-wide activity, message health, and the configuration change log.">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: 'Messages / min', value: '142', icon: Activity, color: '#6B9FD4' },
              { label: 'Failed Messages', value: '0', icon: ShieldAlert, color: '#7AE04C' },
              { label: 'Agent Failures (24h)', value: '0', icon: Bot, color: '#7AE04C' },
              { label: 'Config Changes (24h)', value: '3', icon: ClipboardList, color: '#E6B85C' },
            ].map((m) => (
              <div key={m.label} className="p-3 bg-[#F3F3F3] rounded border border-[#423F4F]/10 space-y-1">
                <m.icon className="w-4 h-4" style={{ color: m.color }} />
                <span className="text-lg font-extrabold text-[#292733] block">{m.value}</span>
                <span className="text-[10px] text-[#565E75] font-mono-tech uppercase block">{m.label}</span>
              </div>
            ))}
          </div>

          <div>
            <span className="block text-[10px] font-mono-tech font-bold uppercase text-[#565E75] mb-2">Recent Audit History</span>
            <div className="space-y-2 font-mono-tech text-xs">
              <div className="p-2.5 bg-[#F3F3F3] rounded border-l-4 border-l-[#7AE04C]">
                <span className="font-bold text-[#292733] block">Routing policy changed to priority-weighted</span>
                <span className="text-[10px] text-[#565E75]">2 min ago</span>
              </div>
              <div className="p-2.5 bg-[#F3F3F3] rounded border-l-4 border-l-[#6B9FD4]">
                <span className="font-bold text-[#292733] block">Building B mutual-aid rule enabled</span>
                <span className="text-[10px] text-[#565E75]">18 min ago</span>
              </div>
            </div>
          </div>
        </SettingsSection>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <SettingsShell
        eyebrow="Campus-Wide Network Configuration"
        title="Network Administrator Settings"
        subtitle="How do I configure and monitor the entire agent network?"
        accent={ACCENT}
        sections={sections}
      />
      <SettingsSaveBar status={status} error={error} onSave={() => save()} />
    </div>
  );
};
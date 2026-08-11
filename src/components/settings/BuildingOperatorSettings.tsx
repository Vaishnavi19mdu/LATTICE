import React from 'react';
import {
  Building as BuildingIcon,
  Bot,
  ShieldAlert,
  Bell,
  UserCheck,
  IdCard,
  Flame,
  Users,
  Shield,
  Brain,
} from 'lucide-react';
import {
  SettingsShell,
  SettingsSection,
  ToggleRow,
  TextField,
  NumberField,
  SelectField,
  SliderField,
  Pill,
  SettingsSaveBar,
  SettingsSectionDef,
} from './SettingsPrimitives';
import { useAuth } from '../../lib/firebase/authContext';
import { useAccountSettings } from '../../hooks/useAccountSettings';
import { DEFAULT_BUILDING_OPERATOR_SETTINGS } from '../../types/settings.types';

const ACCENT = '#E26161';

export const BuildingOperatorSettings: React.FC = () => {
  const { user, profile } = useAuth();

  const seededDefaults = {
    ...DEFAULT_BUILDING_OPERATOR_SETTINGS,
    buildingId: profile?.buildingId || DEFAULT_BUILDING_OPERATOR_SETTINGS.buildingId,
  };

  const { data, update, save, status, error } = useAccountSettings(
    user?.uid,
    'buildingOperator',
    seededDefaults
  );

  const sections: SettingsSectionDef[] = [
    {
      id: 'building_profile',
      label: 'Building Profile',
      icon: <BuildingIcon className="w-3.5 h-3.5" />,
      render: () => (
        <SettingsSection icon={<BuildingIcon className="w-4 h-4" />} title="Building Profile" description="Core identity and layout for your assigned building.">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <TextField label="Building Name" value={data.buildingName} onChange={(v) => update({ buildingName: v })} />
            <TextField
              label="Building ID"
              value={data.buildingId}
              onChange={() => {}}
              disabled
              helper="Assigned at registration — contact a Network Administrator to change."
            />
            <SelectField
              label="Building Type"
              value={data.buildingType}
              onChange={(v) => update({ buildingType: v })}
              options={[
                { value: 'office_tower', label: 'Office Tower' },
                { value: 'residential', label: 'Residential' },
                { value: 'mixed_use', label: 'Mixed Use' },
                { value: 'research_lab', label: 'Research / Lab' },
                { value: 'industrial', label: 'Industrial' },
              ]}
            />
            <NumberField label="Number of Floors" value={data.floors} onChange={(v) => update({ floors: v })} min={1} max={200} />
          </div>
          <TextField label="Building Zones" value={data.zones} onChange={(v) => update({ zones: v })} helper="Comma-separated list of named zones used in agent reasoning." />
          <TextField label="Emergency Exits" value={data.exits} onChange={(v) => update({ exits: v })} />
          <TextField label="Assembly Points" value={data.assemblyPoints} onChange={(v) => update({ assemblyPoints: v })} />
        </SettingsSection>
      ),
    },
    {
      id: 'agents',
      label: 'Agents',
      icon: <Bot className="w-3.5 h-3.5" />,
      render: () => (
        <>
          <SettingsSection icon={<Bot className="w-4 h-4" />} title="Agent Configuration" description="Enable, disable, and monitor the agents assigned to this building.">
            <ToggleRow
              label="Fire & Hazard Agent"
              description="Detects fire, smoke, and hazard escalation on each floor."
              checked={data.agents.fireHazard}
              onChange={(v) => update({ agents: { ...data.agents, fireHazard: v } })}
            />
            <ToggleRow
              label="Occupancy Agent"
              description="Tracks occupant counts and mobility-assistance needs."
              checked={data.agents.occupancy}
              onChange={(v) => update({ agents: { ...data.agents, occupancy: v } })}
            />
            <ToggleRow
              label="Security Agent"
              description="Monitors access control and security anomalies."
              checked={data.agents.security}
              onChange={(v) => update({ agents: { ...data.agents, security: v } })}
            />
            <ToggleRow
              label="Emergency Coordinator"
              description="Synthesizes agent outputs into a single response plan."
              checked={data.agents.coordinator}
              onChange={(v) => update({ agents: { ...data.agents, coordinator: v } })}
            />
          </SettingsSection>

          <SettingsSection icon={<Brain className="w-4 h-4" />} title="Agent Health & Confidence" description="Live status and the confidence bar agents must clear before acting autonomously.">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { label: 'Fire & Hazard', icon: Flame, color: '#E26161' },
                { label: 'Occupancy', icon: Users, color: '#A99BC9' },
                { label: 'Security', icon: Shield, color: '#6B9FD4' },
                { label: 'Coordinator', icon: Brain, color: '#E6B85C' },
              ].map((a) => (
                <div key={a.label} className="p-2.5 bg-[#F3F3F3] rounded border border-[#423F4F]/10 flex flex-col items-center gap-1 text-center">
                  <a.icon className="w-4 h-4" style={{ color: a.color }} />
                  <span className="text-[10px] font-bold text-[#292733]">{a.label}</span>
                  <Pill tone="ok">● Healthy</Pill>
                </div>
              ))}
            </div>
            <SliderField
              label="Agent Confidence Threshold"
              value={data.confidenceThreshold}
              onChange={(v) => update({ confidenceThreshold: v })}
              min={50}
              max={99}
            />
          </SettingsSection>
        </>
      ),
    },
    {
      id: 'emergency_preferences',
      label: 'Emergency Preferences',
      icon: <ShieldAlert className="w-3.5 h-3.5" />,
      render: () => (
        <SettingsSection icon={<ShieldAlert className="w-4 h-4" />} title="Emergency Preferences" description="Defaults the coordinator falls back on when generating a response plan.">
          <SelectField
            label="Default Emergency Level Threshold"
            value={data.emergencyThreshold}
            onChange={(v) => update({ emergencyThreshold: v })}
            options={[
              { value: 'low', label: 'Low — flag only' },
              { value: 'medium', label: 'Medium — notify operator' },
              { value: 'high', label: 'High — require operator approval' },
              { value: 'critical', label: 'Critical — auto-escalate immediately' },
            ]}
          />
          <SelectField
            label="Preferred Evacuation Route"
            value={data.preferredRoute}
            onChange={(v) => update({ preferredRoute: v })}
            options={[
              { value: 'exit_a', label: 'Exit A — Main Lobby' },
              { value: 'exit_b', label: 'Exit B — East Stair' },
              { value: 'exit_c', label: 'Exit C — Loading Dock' },
              { value: 'auto', label: 'Auto-select safest route' },
            ]}
          />
          <ToggleRow
            label="Assistance Priority Routing"
            description="Route occupants who need mobility assistance first."
            checked={data.assistancePriority}
            onChange={(v) => update({ assistancePriority: v })}
          />
          <ToggleRow
            label="Automatic Alert Dispatch"
            description="Send alerts automatically once severity crosses the threshold above."
            checked={data.autoAlerts}
            onChange={(v) => update({ autoAlerts: v })}
          />
          <SelectField
            label="Fallback Response Configuration"
            value={data.fallbackMode}
            onChange={(v) => update({ fallbackMode: v })}
            options={[
              { value: 'nearest_safe_exit', label: 'Route to nearest verified-safe exit' },
              { value: 'hold_in_place', label: 'Hold-in-place until manual review' },
              { value: 'full_evacuation', label: 'Trigger full-building evacuation' },
            ]}
          />
        </SettingsSection>
      ),
    },
    {
      id: 'alerts',
      label: 'Alerts',
      icon: <Bell className="w-3.5 h-3.5" />,
      render: () => (
        <SettingsSection icon={<Bell className="w-4 h-4" />} title="Notifications & Alerts" description="Choose which events page you or your on-call team.">
          <ToggleRow label="Critical Incident Alerts" description="Fire, hazard escalation, or full evacuation triggers." checked={data.alerts.critical} onChange={(v) => update({ alerts: { ...data.alerts, critical: v } })} />
          <ToggleRow label="Agent Failure Alerts" description="An agent goes offline or stops reporting." checked={data.alerts.agentFailure} onChange={(v) => update({ alerts: { ...data.alerts, agentFailure: v } })} />
          <ToggleRow label="Low-Confidence Alerts" description="An agent's confidence drops below your threshold." checked={data.alerts.lowConfidence} onChange={(v) => update({ alerts: { ...data.alerts, lowConfidence: v } })} />
          <ToggleRow label="Occupancy Alerts" description="Unexpected occupancy spikes or assistance requests." checked={data.alerts.occupancy} onChange={(v) => update({ alerts: { ...data.alerts, occupancy: v } })} />
          <ToggleRow label="Security Alerts" description="Access-control or perimeter anomalies." checked={data.alerts.security} onChange={(v) => update({ alerts: { ...data.alerts, security: v } })} />
        </SettingsSection>
      ),
    },
    {
      id: 'human_control',
      label: 'Human Control',
      icon: <UserCheck className="w-3.5 h-3.5" />,
      render: () => (
        <SettingsSection icon={<UserCheck className="w-4 h-4" />} title="Human Control" description="How much autonomy the agent network has before it needs you.">
          <ToggleRow label="Require Approval for Critical Actions" description="Coordinator must wait for operator sign-off above your emergency threshold." checked={data.requireApproval} onChange={(v) => update({ requireApproval: v })} />
          <ToggleRow label="Allow Response Modification" description="Let operators edit a generated plan instead of only approve/reject." checked={data.allowModification} onChange={(v) => update({ allowModification: v })} />
          <ToggleRow label="Operator Notes" description="Attach freeform notes to any plan or intervention." checked={data.operatorNotesEnabled} onChange={(v) => update({ operatorNotesEnabled: v })} />
          <SelectField
            label="Override Permissions"
            value={data.overridePermission}
            onChange={(v) => update({ overridePermission: v })}
            options={[
              { value: 'operator_only', label: 'Building Operator only' },
              { value: 'operator_and_admin', label: 'Building Operator + Network Administrator' },
              { value: 'admin_only', label: 'Network Administrator only' },
            ]}
          />
        </SettingsSection>
      ),
    },
    {
      id: 'account',
      label: 'Account',
      icon: <IdCard className="w-3.5 h-3.5" />,
      render: () => (
        <SettingsSection icon={<IdCard className="w-4 h-4" />} title="Account" description="Your operator identity and session — from your LATTICE account.">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <TextField label="Operator Name" value={profile?.name || ''} onChange={() => {}} disabled />
            <TextField label="Email" value={profile?.email || ''} onChange={() => {}} disabled />
            <TextField label="Role" value={profile?.role || ''} onChange={() => {}} disabled />
            <TextField label="Assigned Building" value={profile?.buildingId || ''} onChange={() => {}} disabled />
          </div>
        </SettingsSection>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <SettingsShell
        eyebrow="Local Building Configuration"
        title="Building Operator Settings"
        subtitle="How do I configure and control my building?"
        accent={ACCENT}
        sections={sections}
      />
      <SettingsSaveBar status={status} error={error} onSave={() => save()} />
    </div>
  );
};
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../lib/firebase/authContext';
import { useEmergency } from '../../context/EmergencyContext';
import { useAutoRole } from '../../hooks/useAutoRole';
import { getAllAgents } from '../../lib/interoperability/agentRegistry';
import { runDemoScenario, SimulationRunResult } from '../../lib/interoperability/demoScenario';
import { AgentDetailPage } from '../agents/AgentDetailPage';
import { EmergencySimulationView } from '../../components/simulation/EmergencySimulationView';
import { AgentInteractionSuite } from '../../components/simulation/AgentInteractionSuite';
import { BuildingComparisonView } from '../../components/simulation/BuildingComparisonView';
import { OperationsChatWidget } from '../../components/simulation/OperationsChatWidget';
import { BuildingOperatorOverview } from '../../components/dashboard/BuildingOperatorOverview';
import { NetworkOperatorOverview } from '../../components/dashboard/NetworkOperatorOverview';
import { BuildingOperatorSettings } from '../../components/settings/BuildingOperatorSettings';
import { NetworkAdministratorSettings } from '../../components/settings/NetworkAdministratorSettings';
import { getRoleConfig } from '../../config/roleConfig';
import { getProfileForRole } from '../../lib/auth/devAuth';
import {
  Cpu,
  LayoutDashboard,
  Bot,
  ShieldAlert,
  GitMerge,
  Radio,
  LogOut,
  ArrowLeft,
  Building as BuildingIcon,
  CheckCircle2,
  Flame,
  Users,
  Shield,
  Brain,
  HeartHandshake,
  Network,
  AlertTriangle,
  ArrowRight,
  Zap,
  Columns,
  MessageSquare,
  UserCheck,
  Settings as SettingsIcon,
  Menu,
  X
} from 'lucide-react';

interface DashboardPageProps {
  onNavigateToLanding: () => void;
}

const AGENT_ICONS: Record<string, any> = {
  agent_fire_hazard: Flame,
  agent_occupancy: Users,
  agent_security: Shield,
  agent_coordinator: Brain,
  agent_ethical_priority: HeartHandshake,
  agent_cross_building: Network,
};

type DashboardTab =
  | 'dashboard'
  | 'agents'
  | 'emergency'
  | 'interaction'
  | 'decision'
  | 'network'
  | 'comparison'
  | 'chat'
  | 'settings';

export const DashboardPage: React.FC<DashboardPageProps> = ({ onNavigateToLanding }) => {
  const { logout } = useAuth();
  const { state } = useEmergency();

  // Auto-assigns the signed-in account's role into EmergencyContext on load/login.
  // RoleSwitcher below can still override it manually within the session (demo-only).
  useAutoRole();

  const [activeTab, setActiveTab] = useState<DashboardTab>('dashboard');
  const [inspectAgentId, setInspectAgentId] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);

  const currentRole = state.selectedRole;
  const roleConfig = getRoleConfig(currentRole);
  const profile = getProfileForRole(currentRole);

  // Switch tab away from Network-only views if switching back to Building Operator
  useEffect(() => {
    if (roleConfig.role === 'building_operator' && (activeTab === 'comparison' || activeTab === 'network')) {
      setActiveTab('dashboard');
    }
  }, [roleConfig.role, activeTab]);

  // Demo simulation state
  const [selectedScenarioId] = useState<string>('scenario_fire_block_a');
  const [simulationResult] = useState<SimulationRunResult>(() => runDemoScenario('scenario_fire_block_a'));

  const agents = getAllAgents();

  const handleLogout = async () => {
    try {
      await logout();
      onNavigateToLanding();
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  // If inspecting a specific agent, render AgentDetailPage
  if (inspectAgentId) {
    return (
      <AgentDetailPage
        initialAgentId={inspectAgentId}
        onBackToDashboard={() => setInspectAgentId(null)}
      />
    );
  }

  const navButtonClass = (tab: DashboardTab) =>
    `w-full flex items-center gap-3 px-3.5 py-2.5 rounded-[6px] font-bold transition-all text-left cursor-pointer focus-visible:outline-2 focus-visible:outline-[#A99BC9] ${
      activeTab === tab
        ? 'bg-[#423F4F] text-[#F3F3F3] border border-[#565E75]'
        : 'text-[#F3F3F3]/70 hover:text-[#F3F3F3] hover:bg-[#423F4F]/40'
    }`;

  return (
    <div className="min-h-screen bg-[#F3F3F3] text-[#423F4F] flex flex-col md:flex-row font-sans">
      {/* SIDEBAR NAVIGATION */}
      <aside className="w-full md:w-72 bg-[#292733] text-[#F3F3F3] border-r border-[#423F4F] flex flex-col justify-between shrink-0">
        <div>
          {/* Header & Logo with Mobile Toggle */}
          <div className="p-4 sm:p-5 border-b border-[#565E75]/30 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-[#423F4F] rounded-[4px] border border-[#565E75] flex items-center justify-center font-bold">
                <Cpu className="w-4 h-4 text-[#A99BC9]" />
              </div>
              <div>
                <span className="font-extrabold text-base sm:text-lg tracking-wider text-[#F3F3F3] block leading-none">LATTICE</span>
                <span className="font-mono-tech text-[9px] text-[#A99BC9] tracking-widest uppercase">COMMAND CENTER</span>
              </div>
            </div>

            {/* Mobile Menu Toggle Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 text-[#A99BC9] hover:text-[#F3F3F3] hover:bg-[#423F4F] rounded transition-colors cursor-pointer"
              aria-label="Toggle Navigation Menu"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

          {/* SIDEBAR CONTENT (Always visible on desktop, toggleable on mobile) */}
          <div className={`${isMobileMenuOpen ? 'block' : 'hidden md:block'}`}>
            {/* DEMO ROLE SWITCHER EMBEDDED IN SIDEBAR */}


            {/* Navigation Links */}
            <nav className="p-4 space-y-1 font-mono-tech text-xs uppercase tracking-wider">
              <button
                onClick={() => { setActiveTab('dashboard'); setIsMobileMenuOpen(false); }}
                className={navButtonClass('dashboard')}
              >
                <LayoutDashboard className="w-4 h-4 text-[#A99BC9]" />
                <span>Overview</span>
              </button>

              <button
                onClick={() => { setActiveTab('interaction'); setIsMobileMenuOpen(false); }}
                className={navButtonClass('interaction')}
              >
                <Zap className="w-4 h-4 text-[#E6B85C]" />
                <span>Agent Interaction</span>
              </button>

              <button
                onClick={() => { setActiveTab('emergency'); setIsMobileMenuOpen(false); }}
                className={navButtonClass('emergency')}
              >
                <ShieldAlert className="w-4 h-4 text-[#E26161]" />
                <span>Emergency Simulation</span>
              </button>

              <button
                onClick={() => { setActiveTab('decision'); setIsMobileMenuOpen(false); }}
                className={navButtonClass('decision')}
              >
                <GitMerge className="w-4 h-4 text-[#E6B85C]" />
                <span>Decision Control</span>
              </button>

              <button
                onClick={() => { setActiveTab('chat'); setIsMobileMenuOpen(false); }}
                className={navButtonClass('chat')}
              >
                <MessageSquare className="w-4 h-4 text-[#6B9FD4]" />
                <span>Operations Chat</span>
              </button>

              {/* NETWORK OPERATOR SPECIFIC MENU ITEMS */}
              {roleConfig.role === 'network_operator' && (
                <>
                  <button
                    onClick={() => { setActiveTab('comparison'); setIsMobileMenuOpen(false); }}
                    className={navButtonClass('comparison')}
                  >
                    <Columns className="w-4 h-4 text-[#7AE04C]" />
                    <span>Building Comparison</span>
                  </button>

                  <button
                    onClick={() => { setActiveTab('network'); setIsMobileMenuOpen(false); }}
                    className={navButtonClass('network')}
                  >
                    <Radio className="w-4 h-4 text-[#7AE04C]" />
                    <span>Network</span>
                  </button>
                </>
              )}
              

              <button
                onClick={() => { setActiveTab('agents'); setIsMobileMenuOpen(false); }}
                className={navButtonClass('agents')}
              >
                <Bot className="w-4 h-4 text-[#6B9FD4]" />
                <span>Agent Network</span>
              </button>

              <button
                onClick={() => { setActiveTab('settings'); setIsMobileMenuOpen(false); }}
                className={navButtonClass('settings')}
              >
                <SettingsIcon className="w-4 h-4 text-[#A99BC9]" />
                <span>Settings</span>
              </button>
            </nav>

            {/* ROLE SCOPE SUMMARY LIST */}
            <div className="p-4 border-t border-[#565E75]/30 space-y-2 font-mono-tech text-xs">
              <span className="text-[10px] text-[#A99BC9] font-bold uppercase block">
                {roleConfig.role === 'building_operator' ? 'MY BUILDING' : 'BUILDING NETWORK'}
              </span>

              {roleConfig.role === 'building_operator' ? (
                <div className="p-2.5 bg-[#423F4F]/60 rounded border border-[#565E75]/40 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <BuildingIcon className="w-4 h-4 text-[#E26161]" />
                    <span className="font-bold text-[#F3F3F3]">Building A</span>
                  </div>
                  <span className="text-[9px] bg-[#E26161] text-white px-1.5 py-0.5 rounded font-extrabold animate-pulse">
                    🔴 Active Incident
                  </span>
                </div>
              ) : (
                <div className="space-y-1.5">
                  <div className="p-2 bg-[#423F4F]/60 rounded border border-[#565E75]/40 flex items-center justify-between">
                    <span className="font-bold text-[#F3F3F3] text-[11px]">🏢 Building A</span>
                    <span className="text-[8px] bg-[#E26161] text-white px-1 rounded font-bold">🔴 Emergency</span>
                  </div>
                  <div className="p-2 bg-[#423F4F]/60 rounded border border-[#565E75]/40 flex items-center justify-between">
                    <span className="font-bold text-[#F3F3F3] text-[11px]">🏢 Building B</span>
                    <span className="text-[8px] bg-[#E6B85C] text-[#292733] px-1 rounded font-bold">⚠ Monitoring</span>
                  </div>
                  <div className="p-2 bg-[#423F4F]/60 rounded border border-[#565E75]/40 flex items-center justify-between">
                    <span className="font-bold text-[#F3F3F3] text-[11px]">🏢 Building C</span>
                    <span className="text-[8px] bg-[#7AE04C] text-[#292733] px-1 rounded font-bold">● Operational</span>
                  </div>
                </div>
              )}
            </div>

            {/* User Info & Footer Actions */}
            <div className="p-4 border-t border-[#565E75]/30 space-y-3 font-mono-tech">
              {/* User Profile Badge */}
              <div className="p-3 bg-[#423F4F]/50 rounded-[6px] border border-[#565E75]/30 space-y-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-[#A99BC9] text-[#292733] flex items-center justify-center font-bold text-xs shrink-0">
                    {roleConfig.iconType === 'user' ? '👤' : '🌐'}
                  </div>
                  <div className="overflow-hidden">
                    <p className="text-xs font-bold text-[#F3F3F3] truncate">{roleConfig.displayName}</p>
                    <p className="text-[10px] text-[#A99BC9] font-bold truncate">{roleConfig.category}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-1 text-[9px] pt-1 border-t border-[#565E75]/20">
                  <div>
                    <span className="text-[#A99BC9] block uppercase">SCOPE</span>
                    <span className="text-[#F3F3F3] font-bold truncate block">{roleConfig.scope}</span>
                  </div>
                  <div>
                    <span className="text-[#A99BC9] block uppercase">LEVEL</span>
                    <span className="text-[#F3F3F3] font-bold truncate block">{roleConfig.accessLevel}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-1.5 pt-1">
                <button
                  onClick={() => { setActiveTab('settings'); setIsMobileMenuOpen(false); }}
                  className="w-full py-2 px-3 bg-[#423F4F]/40 hover:bg-[#423F4F] text-[#F3F3F3]/80 hover:text-[#F3F3F3] border border-[#565E75]/30 rounded-[6px] text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-[#A99BC9]"
                >
                  <SettingsIcon className="w-3.5 h-3.5 text-[#A99BC9]" />
                  <span>ACCOUNT SETTINGS</span>
                </button>

                <button
                  onClick={onNavigateToLanding}
                  className="w-full py-2 px-3 bg-[#423F4F]/40 hover:bg-[#423F4F] text-[#F3F3F3]/80 hover:text-[#F3F3F3] border border-[#565E75]/30 rounded-[6px] text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-[#A99BC9]"
                >
                  <ArrowLeft className="w-3.5 h-3.5 text-[#A99BC9]" />
                  <span>BACK TO LANDING</span>
                </button>

                <button
                  onClick={handleLogout}
                  className="w-full py-2 px-3 bg-[#E26161]/20 hover:bg-[#E26161]/30 text-[#E26161] border border-[#E26161]/30 rounded-[6px] text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-[#E26161]"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>LOG OUT</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* TOP BAR */}
        <header className="bg-white border-b border-[#423F4F]/10 px-4 sm:px-6 py-3 sm:py-4 flex flex-wrap items-center justify-between gap-2 sm:gap-4">
          <div className="flex items-center gap-2 sm:gap-4 flex-wrap">
            {/* Active Role Indicator */}
            <div className="flex items-center gap-2 px-2.5 sm:px-3 py-1.5 bg-[#423F4F] text-[#F3F3F3] rounded-[6px] font-mono-tech text-[11px] sm:text-xs font-bold uppercase tracking-wider shadow-sm">
              <UserCheck className="w-3.5 h-3.5 text-[#A99BC9] shrink-0" />
              <span>
                {roleConfig.role === 'building_operator'
                  ? '👤 BUILDING OPERATOR (BLDG A)'
                  : '🌐 NETWORK OPERATOR (CAMPUS MESH)'}
              </span>
            </div>

            {/* System Status Indicator */}
            <div className="flex items-center gap-2 px-2.5 sm:px-3 py-1.5 bg-[#F3F3F3] rounded-[6px] border border-[#423F4F]/10 font-mono-tech text-[11px] sm:text-xs font-bold text-[#565E75]">
              <span className="relative flex h-2 w-2 shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#7AE04C] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#7AE04C]"></span>
              </span>
              <span className="text-[#292733] whitespace-nowrap">● 6 AGENTS ONLINE</span>
            </div>
          </div>

          {/* User Metadata & Landing Page Button */}
          <div className="flex items-center gap-2 sm:gap-4 ml-auto sm:ml-0">
            <div className="text-right font-mono-tech hidden md:block">
              <p className="text-xs font-extrabold text-[#292733]">{profile.name}</p>
              <p className="text-[10px] text-[#565E75] uppercase font-bold">{profile.category} ({profile.scope})</p>
            </div>

            <button
              onClick={() => setActiveTab('settings')}
              className="p-2 rounded-[6px] border border-[#423F4F]/10 text-[#565E75] hover:text-[#292733] hover:bg-[#F3F3F3] transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-[#A99BC9]"
              aria-label="Open Settings"
              title="Settings"
            >
              <SettingsIcon className="w-4 h-4" />
            </button>

            <button
              onClick={onNavigateToLanding}
              className="btn-lattice-secondary py-1.5 px-2.5 sm:px-3 text-[11px] sm:text-xs font-mono-tech uppercase tracking-wider flex items-center gap-1.5 cursor-pointer focus-visible:outline-2 focus-visible:outline-[#A99BC9] whitespace-nowrap"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-[#423F4F] shrink-0" />
              <span>LANDING PAGE</span>
            </button>
          </div>
        </header>

        {/* DASHBOARD BODY */}
        <main className="p-6 sm:p-8 space-y-8 overflow-y-auto max-w-7xl">
          {/* TAB 1: COMMAND CENTER MAIN OVERVIEW */}
          {activeTab === 'dashboard' && (
            roleConfig.role === 'building_operator' ? (
              <BuildingOperatorOverview onNavigateTab={(t) => setActiveTab(t)} />
            ) : (
              <NetworkOperatorOverview onNavigateTab={(t) => setActiveTab(t)} />
            )
          )}

          {/* TAB 2: AGENT INTERACTION SUITE */}
          {/* TAB 2: AGENT INTERACTION SUITE */}
{activeTab === 'interaction' && (
  <div className="space-y-6">
    <AgentInteractionSuite onNavigateToApproval={() => setActiveTab('decision')} />
  </div>
)}
          {/* TAB 3: BUILDING COMPARISON TAB */}
          {activeTab === 'comparison' && (
            <div className="space-y-6">
              <BuildingComparisonView />
            </div>
          )}

          {/* TAB 4: EMERGENCY SIMULATION TAB */}
          {activeTab === 'emergency' && (
            <div className="space-y-6">
              <EmergencySimulationView />
            </div>
          )}

          {/* TAB 5: DECISION CONTROL TAB */}
          {activeTab === 'decision' && (
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-[8px] border border-[#423F4F]/10 shadow-sm">
                <h1 className="text-2xl font-extrabold text-[#292733] mb-1">DECISION CONTROL & CONFLICT MATRIX</h1>
                <p className="text-xs text-[#565E75]">
                  Visualizes Emergency Coordinator conflict detection and route safety determinations across agents.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Safe Routes */}
                <div className="bg-white p-6 rounded-[8px] border border-[#423F4F]/10 shadow-sm space-y-3">
                  <h3 className="font-extrabold text-sm text-[#7AE04C] uppercase font-mono-tech flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#7AE04C]" />
                    <span>COORDINATED SAFE EGRESS ROUTES</span>
                  </h3>
                  <div className="space-y-2 font-mono-tech text-xs">
                    {simulationResult.coordinatorResult.safeRoutes.map((route, idx) => (
                      <div key={idx} className="p-3 bg-[#7AE04C]/10 rounded-[6px] border border-[#7AE04C]/30 text-[#292733] font-bold">
                        ✓ {route} (Verified Unobstructed)
                      </div>
                    ))}
                  </div>
                </div>

                {/* Blocked Routes & Conflicts */}
                <div className="bg-white p-6 rounded-[8px] border border-[#423F4F]/10 shadow-sm space-y-3">
                  <h3 className="font-extrabold text-sm text-[#E26161] uppercase font-mono-tech flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-[#E26161]" />
                    <span>IDENTIFIED OBSTACLES & ROUTE CONFLICTS</span>
                  </h3>
                  <div className="space-y-2 font-mono-tech text-xs">
                    {simulationResult.coordinatorResult.conflicts.length > 0 ? (
                      simulationResult.coordinatorResult.conflicts.map((conf, idx) => (
                        <div key={idx} className="p-3 bg-[#E26161]/10 rounded-[6px] border border-[#E26161]/30 text-[#E26161] font-bold">
                          ⚠ {conf}
                        </div>
                      ))
                    ) : (
                      <div className="p-3 bg-[#F3F3F3] rounded-[6px] border border-[#423F4F]/10 text-[#565E75]">
                        No route conflicts detected in current scenario.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: OPERATIONS CHAT TAB */}
          {activeTab === 'chat' && (
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-[8px] border border-[#423F4F]/10 shadow-sm">
                <h1 className="text-2xl font-extrabold text-[#292733] mb-1">OPERATIONS CHAT & COMMAND INTERACTION</h1>
                <p className="text-xs text-[#565E75]">
                  Direct natural language command interface for operators to query agent reasoning or request custom overrides.
                </p>
              </div>

              <div className="bg-[#292733] p-4 rounded-[8px] border border-[#423F4F]">
                <OperationsChatWidget />
              </div>
            </div>
          )}

          {/* TAB 7: AGENT NETWORK TAB */}
          {activeTab === 'agents' && (
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-[8px] border border-[#423F4F]/10 shadow-sm">
                <h1 className="text-2xl font-extrabold text-[#292733] mb-2">LATTICE AGENT REGISTRY & CAPABILITIES</h1>
                <p className="text-xs text-[#565E75] leading-relaxed">
                  All six agents advertise their functional capabilities to the registry. Click any agent card to inspect its logic sandbox or test custom parameter combinations.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {agents.map((agent) => {
                  const Icon = AGENT_ICONS[agent.id] || Bot;
                  return (
                    <div
                      key={agent.id}
                      className="p-6 bg-white border border-[#423F4F]/10 rounded-[8px] shadow-sm flex flex-col justify-between space-y-4"
                    >
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div
                            className="w-11 h-11 rounded-[6px] flex items-center justify-center font-bold text-lg shadow-sm"
                            style={{ backgroundColor: agent.accentColor, color: '#292733' }}
                          >
                            <Icon className="w-6 h-6" />
                          </div>

                          <span className="font-mono-tech text-xs font-bold text-[#7AE04C] bg-[#7AE04C]/10 px-2.5 py-1 rounded border border-[#7AE04C]/20">
                            ● {agent.status.toUpperCase()}
                          </span>
                        </div>

                        <h2 className="text-base font-extrabold text-[#292733]">{agent.name}</h2>
                        <p className="text-xs text-[#565E75] leading-relaxed">{agent.description}</p>

                        <div className="pt-2 font-mono-tech text-xs space-y-1.5">
                          <span className="text-[10px] text-[#565E75] uppercase block font-bold">ADVERTISED CAPABILITIES:</span>
                          <div className="flex flex-wrap gap-1.5">
                            {agent.capabilities.map((cap) => (
                              <span key={cap} className="px-2 py-0.5 bg-[#F3F3F3] text-[#292733] rounded border border-[#423F4F]/15 text-[10px] font-bold">
                                {cap}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => setInspectAgentId(agent.id)}
                        className="w-full py-2.5 px-4 bg-[#292733] hover:bg-[#423F4F] text-[#F3F3F3] rounded-[6px] font-mono-tech text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer focus-visible:outline-2 focus-visible:outline-[#A99BC9]"
                      >
                        <span>OPEN AGENT LAB</span>
                        <ArrowRight className="w-4 h-4 text-[#A99BC9]" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 8: MUTUAL AID MESH TAB */}
          {activeTab === 'network' && (
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-[8px] border border-[#423F4F]/10 shadow-sm">
                <h1 className="text-2xl font-extrabold text-[#292733] mb-1">CAMPUS CROSS-BUILDING MUTUAL AID NETWORK</h1>
                <p className="text-xs text-[#565E75]">
                  Monitors inter-building communication channels and shared infrastructure notifications.
                </p>
              </div>

              <BuildingComparisonView />
            </div>
          )}

          {/* TAB 9: SETTINGS TAB */}
          {activeTab === 'settings' && (
            <div className="space-y-6">
              {roleConfig.role === 'building_operator' ? (
                <BuildingOperatorSettings />
              ) : (
                <NetworkAdministratorSettings />
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};
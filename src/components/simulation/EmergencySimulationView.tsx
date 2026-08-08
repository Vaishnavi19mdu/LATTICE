import React, { useState, useEffect } from 'react';
import { 
  Building, 
  Flame, 
  Users, 
  ShieldAlert, 
  Play, 
  Pause, 
  RotateCcw, 
  ShieldCheck, 
  Activity, 
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Radio,
  Layers,
  Sparkles
} from 'lucide-react';
import { BuildingStageView } from './BuildingStageView';
import { runAgentSimulation, InteropSimulationRunResult } from '../../lib/interoperability/agentMessageBus';
import { OperatorNote } from '../../agents/coordinator/coordinator.types';

export const EmergencySimulationView: React.FC = () => {
  const [activeStepIndex, setActiveStepIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isSecurityOffline, setIsSecurityOffline] = useState<boolean>(false);
  const [playbackSpeed] = useState<number>(1200);

  // Compute live simulation state
  const simResult: InteropSimulationRunResult = runAgentSimulation({
    scenarioId: isSecurityOffline ? 'SECURITY_OFFLINE' : 'EXIT_A_CONFLICT',
    agentStatuses: {
      agent_security: isSecurityOffline ? 'offline' : 'online',
    },
    operatorNotes: [],
    humanDecision: null,
  });

  // TIMER FOR STEP PLAYBACK
  useEffect(() => {
    let timer: any = null;
    if (isPlaying && activeStepIndex < 10) {
      timer = setTimeout(() => {
        setActiveStepIndex((prev) => prev + 1);
      }, playbackSpeed);
    } else if (activeStepIndex >= 10) {
      setIsPlaying(false);
    }
    return () => clearTimeout(timer);
  }, [isPlaying, activeStepIndex, playbackSpeed]);

  const handleStart = () => {
    if (activeStepIndex >= 10) setActiveStepIndex(1);
    setIsPlaying(true);
  };

  const handlePause = () => {
    setIsPlaying(false);
  };

  const handleReset = () => {
    setIsPlaying(false);
    setActiveStepIndex(0);
  };

  const isFireActive = activeStepIndex >= 1;

  return (
    <div className="space-y-6 font-sans">
      {/* HEADER BAR */}
      <div className="bg-[#292733] text-[#F3F3F3] p-5 rounded-[8px] border border-[#423F4F] shadow-md flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Building className="w-5 h-5 text-[#E26161]" />
            <h1 className="text-xl font-extrabold text-[#F3F3F3] tracking-tight">
              LATTICE — EMERGENCY SIMULATION & BUILDING TELEMETRY
            </h1>
          </div>
          <p className="text-xs text-[#A99BC9] mt-0.5">
            Physical situation overview: floorplan status, fire propagation, occupancy metrics, and egress portal safety.
          </p>
        </div>

        {/* CONTROLS */}
        <div className="flex flex-wrap items-center gap-2 font-mono-tech text-xs">
          {!isPlaying ? (
            <button
              onClick={handleStart}
              className="py-2.5 px-4 bg-[#7AE04C] hover:bg-[#68c83e] text-[#292733] font-bold rounded-[6px] transition-all cursor-pointer flex items-center gap-1.5 shadow-sm"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>▶ START EMERGENCY SIMULATION</span>
            </button>
          ) : (
            <button
              onClick={handlePause}
              className="py-2.5 px-4 bg-[#E6B85C] hover:bg-[#d4a64a] text-[#292733] font-bold rounded-[6px] transition-all cursor-pointer flex items-center gap-1.5 shadow-sm"
            >
              <Pause className="w-4 h-4 fill-current" />
              <span>PAUSE SIMULATION</span>
            </button>
          )}

          <button
            onClick={handleReset}
            className="py-2.5 px-3 bg-[#423F4F] hover:bg-[#565E75] text-[#F3F3F3] font-bold rounded-[6px] transition-all cursor-pointer flex items-center gap-1"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>RESET</span>
          </button>

          <button
            onClick={() => setIsSecurityOffline((prev) => !prev)}
            className={`py-2.5 px-3.5 rounded-[6px] font-bold transition-all cursor-pointer flex items-center gap-1.5 border ${
              isSecurityOffline 
                ? 'bg-[#E26161] text-[#F3F3F3] border-[#E26161]' 
                : 'bg-[#1F2028] text-[#A99BC9] border-[#423F4F] hover:bg-[#423F4F]'
            }`}
          >
            {isSecurityOffline ? <ShieldAlert className="w-3.5 h-3.5" /> : <ShieldCheck className="w-3.5 h-3.5" />}
            <span>{isSecurityOffline ? '✓ RESTORE SECURITY' : '⚠ SECURITY OFFLINE'}</span>
          </button>
        </div>
      </div>

      {/* STEP PROGRESS TRACKER */}
      <div className="bg-white p-4 rounded-[8px] border border-[#423F4F]/10 shadow-sm space-y-2 font-mono-tech">
        <div className="flex justify-between items-center text-xs">
          <span className="font-extrabold text-[#292733] flex items-center gap-2">
            <Layers className="w-4 h-4 text-[#A99BC9]" />
            BUILDING SIMULATION STEP: {activeStepIndex} / 10
          </span>
          <span className="font-bold text-[#A99BC9]">
            {activeStepIndex === 0 && 'STATUS: STANDBY — ALL FLOORS NOMINAL'}
            {activeStepIndex > 0 && activeStepIndex < 10 && 'STATUS: EMERGENCY PROPAGATION IN PROGRESS'}
            {activeStepIndex >= 10 && 'STATUS: SIMULATION COMPLETE — STATE CONTAINED'}
          </span>
        </div>

        <div className="w-full h-2 bg-[#F3F3F3] rounded-full overflow-hidden border border-[#423F4F]/10">
          <div
            className="h-full bg-gradient-to-r from-[#A99BC9] via-[#E6B85C] to-[#E26161] transition-all duration-500"
            style={{ width: `${(activeStepIndex / 10) * 100}%` }}
          />
        </div>
      </div>

      {/* EMERGENCY SUMMARY METRICS BAR */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 font-mono-tech">
        <div className="p-4 bg-white rounded-[8px] border border-[#423F4F]/10 shadow-sm space-y-1">
          <span className="text-[10px] text-[#565E75] uppercase font-bold block">HAZARD LOCATION</span>
          <div className="flex items-center gap-2">
            <Flame className={`w-5 h-5 ${isFireActive ? 'text-[#E26161] animate-pulse' : 'text-[#565E75]'}`} />
            <span className="font-extrabold text-sm text-[#292733]">
              {isFireActive ? 'FLOOR 4 (EXIT A CORRIDOR)' : 'NO HAZARD DETECTED'}
            </span>
          </div>
        </div>

        <div className="p-4 bg-white rounded-[8px] border border-[#423F4F]/10 shadow-sm space-y-1">
          <span className="text-[10px] text-[#565E75] uppercase font-bold block">ZONE OCCUPANCY</span>
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-[#E6B85C]" />
            <span className="font-extrabold text-sm text-[#292733]">
              42 TOTAL (3 MOBILITY SUPPORT)
            </span>
          </div>
        </div>

        <div className="p-4 bg-white rounded-[8px] border border-[#423F4F]/10 shadow-sm space-y-1">
          <span className="text-[10px] text-[#565E75] uppercase font-bold block">EMERGENCY SEVERITY</span>
          <div className="flex items-center gap-2">
            <AlertTriangle className={`w-5 h-5 ${isFireActive ? 'text-[#E26161]' : 'text-[#7AE04C]'}`} />
            <span className={`font-extrabold text-sm ${isFireActive ? 'text-[#E26161]' : 'text-[#7AE04C]'}`}>
              {isFireActive ? simResult.coordinatorAssessment.emergencyLevel : 'LEVEL 0 — CLEAR'}
            </span>
          </div>
        </div>

        <div className="p-4 bg-white rounded-[8px] border border-[#423F4F]/10 shadow-sm space-y-1">
          <span className="text-[10px] text-[#565E75] uppercase font-bold block">MUTUAL AID STATUS</span>
          <div className="flex items-center gap-2">
            <Radio className="w-5 h-5 text-[#A99BC9]" />
            <span className="font-extrabold text-sm text-[#292733]">
              {activeStepIndex >= 9 ? 'BUILDING B ALERTED' : 'STANDBY'}
            </span>
          </div>
        </div>
      </div>

      {/* BUILDING STAGE VISUALIZER */}
      <BuildingStageView
        fireSeverity={simResult.fireAssessment?.severity || 'HIGH'}
        exitAStatus={simResult.coordinatorAssessment.blockedRoutes.includes('Exit A') ? 'BLOCKED' : 'SAFE'}
        exitBStatus="SAFE"
        exitCStatus="SAFE"
        occupantsCount={42}
        specialNeedsCount={3}
        buildingBAlert={activeStepIndex >= 9}
        activeStepIndex={activeStepIndex}
      />

      {/* EGRESS ROUTE SAFETY MATRIX */}
      <div className="bg-white p-6 rounded-[8px] border border-[#423F4F]/10 shadow-sm space-y-4 font-mono-tech">
        <h3 className="font-extrabold text-sm text-[#292733] uppercase">GROUND EGRESS PORTAL SAFETY DETERMINATIONS</h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className={`p-4 rounded-[6px] border ${
            simResult.coordinatorAssessment.blockedRoutes.includes('Exit A')
              ? 'bg-[#E26161]/10 border-[#E26161] text-[#E26161]'
              : 'bg-[#7AE04C]/10 border-[#7AE04C] text-[#292733]'
          }`}>
            <div className="flex items-center justify-between mb-2">
              <span className="font-extrabold text-sm">EXIT A (NORTH)</span>
              {simResult.coordinatorAssessment.blockedRoutes.includes('Exit A') ? (
                <XCircle className="w-4 h-4 text-[#E26161]" />
              ) : (
                <CheckCircle2 className="w-4 h-4 text-[#7AE04C]" />
              )}
            </div>
            <p className="font-sans text-xs">
              {simResult.coordinatorAssessment.blockedRoutes.includes('Exit A')
                ? 'UNSAFE: Primary corridor compromised by fire propagation and lock solenoid jamming.'
                : 'VERIFIED CLEAR: Primary corridor open.'}
            </p>
          </div>

          <div className="p-4 rounded-[6px] border bg-[#7AE04C]/10 border-[#7AE04C] text-[#292733]">
            <div className="flex items-center justify-between mb-2">
              <span className="font-extrabold text-sm text-[#7AE04C]">EXIT B (WEST)</span>
              <CheckCircle2 className="w-4 h-4 text-[#7AE04C]" />
            </div>
            <p className="font-sans text-xs text-[#292733]">
              RECOMMENDED EGRESS ROUTE: Stairwell B clear; direct path away from Floor 4 fire origin.
            </p>
          </div>

          <div className="p-4 rounded-[6px] border bg-[#F3F3F3] border-[#423F4F]/20 text-[#292733]">
            <div className="flex items-center justify-between mb-2">
              <span className="font-extrabold text-sm">EXIT C (SOUTH)</span>
              <CheckCircle2 className="w-4 h-4 text-[#A99BC9]" />
            </div>
            <p className="font-sans text-xs text-[#565E75]">
              ALTERNATE EGRESS ROUTE: Unobstructed; designated secondary backup for building occupants.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

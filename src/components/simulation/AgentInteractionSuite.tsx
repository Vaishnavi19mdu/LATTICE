import React, { useState } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Zap, 
  MessageSquare, 
  Brain, 
  Clock, 
  Send, 
  CheckCircle2, 
  Sparkles, 
  ChevronRight, 
  User, 
  Building2, 
  ShieldAlert,
  Flame,
  Globe
} from 'lucide-react';
import { useEmergency } from '../../context/EmergencyContext';
import { AgentNetworkView } from './AgentNetworkView';
import { Building2DView } from './Building2DView';
import { OperationsChatWidget } from './OperationsChatWidget';
import { useSmartAutoScroll } from '../../hooks/useSmartAutoScroll';

export const AgentInteractionSuite: React.FC = () => {
  const {
    state,
    eventQueue,
    runScenario,
    pauseScenario,
    stepNext,
    resetScenario,
    injectOperatorIntervention,
    selectRole,
    selectBuilding,
  } = useEmergency();

  const [customInput, setCustomInput] = useState('');

  const currentStepIndex = state.activeStepIndex;
  const currentEvent = eventQueue[currentStepIndex] || eventQueue[eventQueue.length - 1];
  const visibleEvents = eventQueue.slice(0, currentStepIndex);

  // Smart internal auto-scroll for Conversation Feed (never moves document/window)
  const {
    containerRef: conversationContainerRef,
    isAtBottom: isConvAtBottom,
    unreadCount: convUnreadCount,
    handleScroll: handleConvScroll,
    scrollToBottom: scrollToConvBottom,
  } = useSmartAutoScroll<HTMLDivElement>(`${currentStepIndex}_${state.currentStage}_${visibleEvents.length}`);

  // Smart internal auto-scroll for Chronological Audit Log
  const {
    containerRef: auditLogContainerRef,
    isAtBottom: isAuditAtBottom,
    unreadCount: auditUnreadCount,
    handleScroll: handleAuditScroll,
    scrollToBottom: scrollToAuditBottom,
  } = useSmartAutoScroll<HTMLDivElement>(state.eventLogs.length);

  const handleIntervene = (text: string) => {
    if (!text.trim()) return;
    injectOperatorIntervention(text);
    setCustomInput('');
  };

  return (
    <div className="space-y-6 font-sans">
      {/* TOP BAR: HEADER, ROLE SWITCHER & CONTROL BUTTONS */}
      <div className="bg-[#292733] text-[#F3F3F3] p-5 rounded-[8px] border border-[#423F4F] shadow-md flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-[#E6B85C] animate-pulse" />
            <h1 className="text-xl font-extrabold text-[#F3F3F3] tracking-tight">
              AGENT INTERACTION & MULTI-AGENT RUNTIME
            </h1>
            <span className={`px-2.5 py-0.5 rounded text-[11px] font-mono-tech font-bold uppercase flex items-center gap-1.5 ${
              state.playbackMode === 'LIVE'
                ? 'bg-[#7AE04C]/20 text-[#7AE04C] border border-[#7AE04C]/40 animate-pulse'
                : 'bg-[#E6B85C]/20 text-[#E6B85C] border border-[#E6B85C]/40'
            }`}>
              <span className="w-2 h-2 rounded-full bg-current"></span>
              {state.playbackMode === 'LIVE' ? '● LIVE MULTI-AGENT MESH' : state.playbackMode === 'STEP' ? 'STEP MODE' : 'Ⅱ PAUSED'}
            </span>
          </div>
          <p className="text-xs text-[#A99BC9] mt-0.5">
            Decoupled multi-agent runtime executing inter-agent packet exchange, conflict detection, explainable reasoning, and human-in-the-loop overrides.
          </p>
        </div>

        {/* ROLE SELECTOR & PLAYBACK CONTROLS */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Role Selector */}
          <div className="flex items-center bg-[#1F2028] p-1 rounded-[6px] border border-[#423F4F] font-mono-tech text-xs">
            <button
              onClick={() => selectRole('BUILDING_OPERATOR')}
              className={`px-3 py-1.5 rounded-[4px] font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                state.selectedRole === 'BUILDING_OPERATOR'
                  ? 'bg-[#A99BC9] text-[#292733]'
                  : 'text-[#A99BC9] hover:text-[#F3F3F3]'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>Building A Operator</span>
            </button>

            <button
              onClick={() => selectRole('NETWORK_OPERATOR')}
              className={`px-3 py-1.5 rounded-[4px] font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                state.selectedRole === 'NETWORK_OPERATOR'
                  ? 'bg-[#A99BC9] text-[#292733]'
                  : 'text-[#A99BC9] hover:text-[#F3F3F3]'
              }`}
            >
              <Globe className="w-3.5 h-3.5" />
              <span>Campus Network Operator</span>
            </button>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-1.5 font-mono-tech text-xs">
            {state.playbackMode !== 'LIVE' ? (
              <button
                onClick={runScenario}
                className="py-2.5 px-4 bg-[#7AE04C] hover:bg-[#68c83e] text-[#292733] font-bold rounded-[6px] transition-all cursor-pointer flex items-center gap-1.5 shadow-sm"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>▶ RUN</span>
              </button>
            ) : (
              <button
                onClick={pauseScenario}
                className="py-2.5 px-4 bg-[#E6B85C] hover:bg-[#d4a64a] text-[#292733] font-bold rounded-[6px] transition-all cursor-pointer flex items-center gap-1.5 shadow-sm"
              >
                <Pause className="w-4 h-4 fill-current" />
                <span>Ⅱ PAUSE</span>
              </button>
            )}

            <button
              onClick={stepNext}
              className="py-2.5 px-3.5 bg-[#423F4F] hover:bg-[#565E75] text-[#F3F3F3] font-bold rounded-[6px] transition-all cursor-pointer flex items-center gap-1 border border-[#565E75]/50"
            >
              <span>STEP</span>
              <ChevronRight className="w-4 h-4 text-[#E6B85C]" />
            </button>

            <button
              onClick={resetScenario}
              className="py-2.5 px-3 bg-[#423F4F] hover:bg-[#565E75] text-[#F3F3F3] font-bold rounded-[6px] transition-all cursor-pointer flex items-center gap-1"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>RESET</span>
            </button>
          </div>
        </div>
      </div>

      {/* HERO SECTION: AGENT NETWORK + LIVE 2D BUILDING FLOORPLAN TELEMETRY */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* LEFT: AGENT NETWORK GRAPH (6 COLUMNS) */}
        <div className="lg:col-span-6 flex flex-col">
          <AgentNetworkView
            activeSenderId={state.currentActiveAgentId}
            activeReceiverId={state.currentReceiverAgentId}
            activeMessageType={currentEvent?.topic || null}
            agentStates={state.agentStates}
            currentStage={state.currentStage}
          />
        </div>

        {/* RIGHT: LIVE 2D BUILDING FLOORPLAN TELEMETRY (6 COLUMNS) */}
        <div className="lg:col-span-6 flex flex-col">
          <Building2DView state={state} />
        </div>
      </div>

      {/* SECOND SECTION: LIVE AGENT CONVERSATION FEED */}
      <div className="bg-white border border-[#423F4F]/10 rounded-[8px] p-5 shadow-sm space-y-4 font-sans relative">
        <div className="flex items-center justify-between border-b border-[#423F4F]/10 pb-3 font-mono-tech">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-[#A99BC9]" />
            <h3 className="font-extrabold text-sm text-[#292733] tracking-tight">LIVE AGENT CONVERSATION FEED</h3>
          </div>
          <span className="text-xs font-bold text-[#565E75]">
            EVENT {currentStepIndex} / {eventQueue.length}
          </span>
        </div>

        <div className="relative">
          <div
            ref={conversationContainerRef}
            onScroll={handleConvScroll}
            className="space-y-3 h-[360px] overflow-y-auto pr-2 font-sans"
          >
            {visibleEvents.map((evt, idx) => {
              const isLatest = idx === visibleEvents.length - 1;

              return (
                <div
                  key={evt.id}
                  className={`p-4 rounded-[8px] border transition-all ${
                    evt.isInterrupt
                      ? 'bg-[#E26161]/10 border-[#E26161] shadow-[0_0_12px_rgba(226,97,97,0.15)]'
                      : isLatest
                      ? 'bg-[#A99BC9]/10 border-[#A99BC9] ring-2 ring-[#A99BC9]/20'
                      : 'bg-[#F3F3F3]/80 border-[#423F4F]/10'
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-2 font-mono-tech text-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-7 h-7 rounded-full bg-[#292733] text-white flex items-center justify-center text-sm font-bold shadow-sm">
                        {evt.fromIcon}
                      </span>
                      <span className="font-extrabold text-[#292733] text-sm">{evt.fromAgentName}</span>
                      <span className="text-[#A99BC9] font-bold">➔</span>
                      <span className="font-bold text-[#565E75]">{evt.toAgentName}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      {evt.isInterrupt && (
                        <span className="bg-[#E26161] text-white font-extrabold text-[9px] px-2 py-0.5 rounded animate-pulse">
                          ⚡ INTERRUPT
                        </span>
                      )}
                      <span className="text-[10px] text-[#565E75] bg-white px-2 py-0.5 rounded border border-[#423F4F]/10 font-bold">
                        EVENT #{evt.eventIndex}
                      </span>
                    </div>
                  </div>

                  <p className="text-sm font-medium text-[#292733] leading-relaxed bg-white p-3 rounded-[6px] border border-[#423F4F]/10 shadow-2xs">
                    "{evt.message}"
                  </p>

                  <div className="mt-2 flex items-center justify-between text-[11px] font-mono-tech text-[#565E75]">
                    <span className="font-bold">TOPIC: {evt.topic}</span>
                    <span className="font-bold text-[#7AE04C] flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#7AE04C]" /> DELIVERED
                    </span>
                  </div>
                </div>
              );
            })}

            {/* ACTIVE THINKING / TRANSMITTING STAGE INDICATOR */}
            {state.currentStage !== 'DELIVERED' && currentEvent && (
              <div className="p-4 bg-[#292733] text-[#F3F3F3] rounded-[8px] border border-[#A99BC9] font-mono-tech text-xs space-y-2 shadow-md">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-base">{currentEvent.fromIcon}</span>
                    <span className="font-extrabold text-sm text-[#F3F3F3]">{currentEvent.fromAgentName}</span>
                  </div>
                  <span className="px-2.5 py-0.5 bg-[#E6B85C] text-[#292733] font-extrabold text-[10px] rounded animate-pulse">
                    ● {state.currentStage}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-[#E6B85C] text-xs pt-1">
                  <Sparkles className="w-4 h-4 animate-spin text-[#A99BC9]" />
                  <span>
                    {state.currentStage === 'RECEIVING' && `Transmitting packet to ${currentEvent.toAgentName}...`}
                    {state.currentStage === 'THINKING' && currentEvent.thinkingText}
                    {state.currentStage === 'TYPING' && `Finalizing event payload...`}
                  </span>
                </div>
              </div>
            )}

            {visibleEvents.length === 0 && state.currentStage === 'DELIVERED' && (
              <div className="p-10 text-center text-[#565E75] font-mono-tech text-xs bg-[#F3F3F3] rounded-[8px] border border-dashed border-[#423F4F]/20">
                Press <strong>▶ RUN</strong> or <strong>STEP →</strong> to start the live multi-agent simulation.
              </div>
            )}
          </div>

          {/* NEW MESSAGES FLOATING INDICATOR */}
          {!isConvAtBottom && convUnreadCount > 0 && (
            <button
              onClick={scrollToConvBottom}
              className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-[#292733] hover:bg-[#423F4F] text-[#F3F3F3] font-mono-tech text-xs font-bold px-3.5 py-1.5 rounded-full shadow-lg border border-[#A99BC9] flex items-center gap-2 z-20 cursor-pointer transition-all animate-bounce"
            >
              <span className="text-[#7AE04C] font-bold">↓</span>
              <span>{convUnreadCount} new {convUnreadCount === 1 ? 'event' : 'events'}</span>
            </button>
          )}
        </div>
      </div>

      {/* THIRD SECTION: CURRENT ACTIVE AGENT REASONING */}
      <div className="bg-[#292733] text-[#F3F3F3] p-5 rounded-[8px] border border-[#423F4F] shadow-md space-y-4 font-sans">
        <div className="flex items-center justify-between border-b border-[#565E75]/40 pb-3 font-mono-tech">
          <div className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-[#A99BC9]" />
            <h3 className="font-extrabold text-sm tracking-tight text-[#F3F3F3]">CURRENT AGENT REASONING & TASK</h3>
          </div>
          <span className="text-[10px] text-[#7AE04C] font-bold bg-[#7AE04C]/20 px-2 py-0.5 rounded border border-[#7AE04C]/40">
            {state.currentActivity}
          </span>
        </div>

        {currentEvent ? (
          <div className="space-y-3 font-mono-tech text-xs">
            <div className="p-3.5 bg-[#1F2028] rounded border border-[#423F4F] flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{currentEvent.fromIcon}</span>
                <div>
                  <h4 className="font-extrabold text-sm text-[#F3F3F3]">{currentEvent.fromAgentName}</h4>
                  <span className="text-[10px] text-[#A99BC9]">TARGET NODE: {currentEvent.toAgentName}</span>
                </div>
              </div>

              <div className="text-right">
                <span className="text-[10px] font-bold uppercase text-[#E6B85C] block">CURRENT TASK</span>
                <span className="text-xs font-semibold text-[#F3F3F3]">{currentEvent.task}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3 bg-[#1F2028] rounded border border-[#423F4F] space-y-1">
                <span className="text-[10px] text-[#A99BC9] uppercase font-bold block">INPUT PARAMETERS:</span>
                <div className="space-y-1 font-sans text-xs">
                  {Object.entries(currentEvent.inputs).map(([k, v]) => (
                    <div key={k} className="flex justify-between text-[11px]">
                      <span className="text-[#565E75]">{k}:</span>
                      <span className="font-bold text-[#F3F3F3]">{v}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-3 bg-[#1F2028] rounded border border-[#423F4F] space-y-1">
                <span className="text-[10px] text-[#A99BC9] uppercase font-bold block">CAPABILITIES INVOKED:</span>
                <div className="flex flex-wrap gap-1 pt-1">
                  {currentEvent.capabilitiesUsed.map((cap) => (
                    <span key={cap} className="px-2 py-0.5 bg-[#423F4F] text-[#7AE04C] rounded text-[10px] font-bold">
                      {cap}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-3 bg-[#1F2028] rounded border border-[#A99BC9]/40 space-y-1 font-sans">
              <span className="font-mono-tech text-[10px] font-bold text-[#A99BC9] uppercase block">
                EXPLAINABLE REASONING SUMMARY:
              </span>
              <p className="text-xs text-[#F3F3F3] leading-relaxed">
                {currentEvent.reasoningSummary}
              </p>
            </div>
          </div>
        ) : (
          <div className="p-6 text-center text-[#565E75] font-mono-tech text-xs bg-[#1F2028] rounded border border-[#423F4F]">
            No step active.
          </div>
        )}
      </div>

      {/* FOURTH SECTION: CHRONOLOGICAL EVENT LOGS */}
      <div className="bg-white border border-[#423F4F]/10 rounded-[8px] p-5 shadow-sm space-y-3 font-mono-tech relative">
        <div className="flex items-center justify-between border-b border-[#423F4F]/10 pb-2">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#A99BC9]" />
            <h3 className="font-extrabold text-xs text-[#292733] uppercase">CHRONOLOGICAL EVENT AUDIT LOG</h3>
          </div>
          <span className="text-[10px] text-[#565E75] font-bold">{state.eventLogs.length} EVENTS RECORDED</span>
        </div>

        <div className="relative">
          <div
            ref={auditLogContainerRef}
            onScroll={handleAuditScroll}
            className="space-y-1.5 text-xs h-[180px] overflow-y-auto pr-1"
          >
            {state.eventLogs.map((log) => (
              <div key={log.id} className="p-2 bg-[#F3F3F3] rounded border border-[#423F4F]/10 flex items-center justify-between gap-3 text-[11px]">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-[10px] font-bold bg-[#292733] text-white px-1.5 py-0.5 rounded">
                    #{log.eventIndex}
                  </span>
                  <span className="font-bold text-[#292733] whitespace-nowrap">
                    {log.senderIcon} {log.senderName} ➔ {log.receiverName}
                  </span>
                  <span className="text-[#565E75] truncate">
                    "{log.message}"
                  </span>
                </div>

                <span className="text-[10px] font-bold text-[#7AE04C] bg-[#7AE04C]/10 px-2 py-0.5 rounded border border-[#7AE04C]/30 shrink-0">
                  {log.status}
                </span>
              </div>
            ))}

            {state.eventLogs.length === 0 && (
              <div className="p-3 text-center text-[#565E75] text-[11px]">
                Audit log empty. Start simulation to record trace events.
              </div>
            )}
          </div>

          {!isAuditAtBottom && auditUnreadCount > 0 && (
            <button
              onClick={scrollToAuditBottom}
              className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-[#292733] hover:bg-[#423F4F] text-[#F3F3F3] font-mono-tech text-[11px] font-bold px-3 py-1 rounded-full shadow-lg border border-[#A99BC9] flex items-center gap-1.5 z-20 cursor-pointer transition-all animate-bounce"
            >
              <span className="text-[#7AE04C] font-bold">↓</span>
              <span>{auditUnreadCount} new {auditUnreadCount === 1 ? 'log' : 'logs'}</span>
            </button>
          )}
        </div>
      </div>

      {/* FIFTH SECTION: HUMAN OPERATOR INTERVENTION */}
      <div className="bg-[#292733] text-[#F3F3F3] p-4 rounded-[8px] border border-[#423F4F] shadow-md space-y-3 font-sans">
        <div className="flex items-center justify-between border-b border-[#565E75]/40 pb-2 font-mono-tech">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-[#E6B85C]" />
            <h3 className="font-extrabold text-xs text-[#F3F3F3] uppercase">HUMAN OPERATOR INTERVENTION</h3>
          </div>
          <span className="text-[10px] text-[#A99BC9]">HUMAN-IN-THE-LOOP OVERRIDE CONTROL</span>
        </div>

        <div className="flex flex-wrap items-center gap-2 font-mono-tech text-[11px]">
          <span className="text-[#565E75]">PRESET OVERRIDES:</span>
          <button
            onClick={() => handleIntervene("Do not use Exit A. Redirect occupants directly to Exit B.")}
            className="px-2.5 py-1 bg-[#423F4F] hover:bg-[#565E75] text-[#F3F3F3] rounded border border-[#565E75] font-bold cursor-pointer transition-all"
          >
            "Do not use Exit A"
          </button>
          <button
            onClick={() => handleIntervene("Prioritize Floor 4 mobility occupants for immediate support team dispatch.")}
            className="px-2.5 py-1 bg-[#423F4F] hover:bg-[#565E75] text-[#F3F3F3] rounded border border-[#565E75] font-bold cursor-pointer transition-all"
          >
            "Prioritize Mobility Support"
          </button>
          <button
            onClick={() => handleIntervene("Lock connecting concourse doors to Building B immediately.")}
            className="px-2.5 py-1 bg-[#423F4F] hover:bg-[#565E75] text-[#F3F3F3] rounded border border-[#565E75] font-bold cursor-pointer transition-all"
          >
            "Isolate Concourse"
          </button>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="text"
            value={customInput}
            onChange={(e) => setCustomInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleIntervene(customInput)}
            placeholder="Type custom human operator instruction..."
            className="flex-1 bg-[#1F2028] border border-[#423F4F] rounded-[6px] px-3.5 py-2 text-xs text-[#F3F3F3] placeholder-[#565E75] focus:outline-none focus:border-[#A99BC9] font-mono-tech"
          />

          <button
            onClick={() => handleIntervene(customInput)}
            disabled={!customInput.trim()}
            className="py-2 px-4 bg-[#E6B85C] hover:bg-[#d4a64a] disabled:opacity-50 text-[#292733] font-bold rounded-[6px] transition-all cursor-pointer font-mono-tech text-xs flex items-center gap-1.5 shadow-sm"
          >
            <Send className="w-3.5 h-3.5" />
            <span>INTERVENE</span>
          </button>
        </div>
      </div>

      {/* OPERATIONS CHATBOT WIDGET */}
      <OperationsChatWidget />
    </div>
  );
};

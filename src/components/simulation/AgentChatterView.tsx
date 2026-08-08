import React from 'react';
import { MessageSquare, ArrowRight, Zap, Bot, UserCheck } from 'lucide-react';
import { useSmartAutoScroll } from '../../hooks/useSmartAutoScroll';

export interface ChatterMessage {
  id: string;
  stepIndex: number;
  timestamp: string;
  senderId: string;
  senderName: string;
  senderIcon: string;
  senderColor: string;
  receiverId: string;
  receiverName: string;
  dialogueText: string;
  topic: string;
  isInterrupt?: boolean;
}

interface AgentChatterProps {
  messages: ChatterMessage[];
  activeStepIndex: number;
}

export const AgentChatterView: React.FC<AgentChatterProps> = ({
  messages,
  activeStepIndex,
}) => {
  const visibleMessages = messages.filter((m) => m.stepIndex <= activeStepIndex);

  const {
    containerRef: chatterContainerRef,
    isAtBottom: isChatterAtBottom,
    unreadCount: chatterUnreadCount,
    handleScroll: handleChatterScroll,
    scrollToBottom: scrollToChatterBottom,
  } = useSmartAutoScroll<HTMLDivElement>(visibleMessages.length);

  return (
    <div className="bg-white border border-[#423F4F]/10 rounded-[8px] p-5 shadow-sm space-y-4 font-sans relative">
      <div className="flex items-center justify-between border-b border-[#423F4F]/10 pb-3 font-mono-tech">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-[#A99BC9]" />
          <h3 className="font-extrabold text-sm text-[#292733]">LIVE INTER-AGENT CHATTER & DIALOGUE STREAM</h3>
        </div>
        <span className="text-xs font-bold text-[#565E75]">
          {visibleMessages.length} / {messages.length} DIALOGUE EVENTS
        </span>
      </div>

      <div className="relative">
        <div
          ref={chatterContainerRef}
          onScroll={handleChatterScroll}
          className="space-y-3 h-[360px] overflow-y-auto pr-1 font-sans"
        >
          {visibleMessages.map((msg, idx) => {
            const isLatest = msg.stepIndex === activeStepIndex;

            return (
              <div
                key={msg.id}
                className={`p-3.5 rounded-[8px] border transition-all ${
                  msg.isInterrupt
                    ? 'bg-[#E26161]/10 border-[#E26161] shadow-[0_0_10px_rgba(226,97,97,0.15)]'
                    : isLatest
                    ? 'bg-[#A99BC9]/10 border-[#A99BC9] ring-2 ring-[#A99BC9]/30'
                    : 'bg-[#F3F3F3] border-[#423F4F]/10'
                }`}
              >
                {/* Header */}
                <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5 font-mono-tech text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-[#292733] text-white flex items-center justify-center text-xs font-bold shadow-sm">
                      {msg.senderIcon}
                    </span>

                    <span className="font-extrabold text-[#292733]">{msg.senderName}</span>

                    <ArrowRight className="w-3.5 h-3.5 text-[#A99BC9]" />

                    <span className="font-bold text-[#565E75]">{msg.receiverName}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    {msg.isInterrupt && (
                      <span className="bg-[#E26161] text-white font-extrabold text-[9px] px-1.5 py-0.5 rounded animate-pulse">
                        ⚡ INTERRUPT
                      </span>
                    )}
                    <span className="text-[10px] text-[#565E75] bg-white px-2 py-0.5 rounded border border-[#423F4F]/10 font-bold">
                      {msg.timestamp}
                    </span>
                  </div>
                </div>

                {/* Natural Language Dialogue */}
                <p className="text-xs font-medium text-[#292733] leading-relaxed bg-white/80 p-2.5 rounded border border-[#423F4F]/10 italic">
                  "{msg.dialogueText}"
                </p>

                <div className="mt-1 flex items-center justify-between text-[10px] font-mono-tech text-[#565E75]">
                  <span>TOPIC: {msg.topic}</span>
                  <span className="font-bold text-[#A99BC9]">STATUS: DELIVERED & ACKNOWLEDGED</span>
                </div>
              </div>
            );
          })}

          {visibleMessages.length === 0 && (
            <div className="p-8 text-center text-[#565E75] font-mono-tech text-xs bg-[#F3F3F3] rounded-[8px] border border-dashed border-[#423F4F]/20">
              Press <strong>▶ START EMERGENCY SIMULATION</strong> to initialize live inter-agent dialogue.
            </div>
          )}
        </div>

        {!isChatterAtBottom && chatterUnreadCount > 0 && (
          <button
            onClick={scrollToChatterBottom}
            className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-[#292733] hover:bg-[#423F4F] text-[#F3F3F3] font-mono-tech text-xs font-bold px-3.5 py-1.5 rounded-full shadow-lg border border-[#A99BC9] flex items-center gap-2 z-20 cursor-pointer transition-all animate-bounce"
          >
            <span className="text-[#7AE04C] font-bold">↓</span>
            <span>{chatterUnreadCount} new {chatterUnreadCount === 1 ? 'message' : 'messages'}</span>
          </button>
        )}
      </div>
    </div>
  );
};

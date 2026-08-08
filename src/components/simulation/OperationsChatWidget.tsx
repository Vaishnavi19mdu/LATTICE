import React, { useState } from 'react';
import { Bot, Send, Sparkles, HelpCircle } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { useEmergency } from '../../context/EmergencyContext';
import { generateOperationsChatResponse } from '../../lib/mock/mockResponses';
import { defaultAIProvider } from '../../lib/ai/AIProvider';
import { useSmartAutoScroll } from '../../hooks/useSmartAutoScroll';

interface ChatHistoryItem {
  id: string;
  sender: 'OPERATOR' | 'ASSISTANT';
  text: string;
  timestamp: string;
}

const QUICK_PROMPTS = [
  'Give me the evacuation checklist.',
  'Why is Exit A unsafe?',
  'What is the occupant count on Floor 4?',
  'What is the status of Building B?',
  'Show emergency summary.',
];

export const OperationsChatWidget: React.FC = () => {
  const { state } = useEmergency();
  const [messages, setMessages] = useState<ChatHistoryItem[]>([
    {
      id: 'msg_welcome',
      sender: 'ASSISTANT',
      text: 'LATTICE Operations Assistant active. Connected directly to the live multi-agent emergency runtime. Ask about route safety, evacuation checklists, or occupant status.',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [inputQuery, setInputQuery] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const {
    containerRef: chatContainerRef,
    isAtBottom: isChatAtBottom,
    unreadCount: chatUnreadCount,
    handleScroll: handleChatScroll,
    scrollToBottom: scrollToChatBottom,
  } = useSmartAutoScroll<HTMLDivElement>(`${messages.length}_${isProcessing}`);

  const handleSendQuery = async (queryText: string) => {
    if (!queryText.trim() || isProcessing) return;

    const userMsg: ChatHistoryItem = {
      id: `user_${Date.now()}`,
      sender: 'OPERATOR',
      text: queryText.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputQuery('');
    setIsProcessing(true);

    try {
      let responseMarkdown: string;

      if (defaultAIProvider.isConfigured()) {
        // Real Groq call — grounded with the live emergency state as context
        responseMarkdown = await defaultAIProvider.generateAgentResponse(
          'operations_assistant',
          queryText,
          state as any
        );
      } else {
        // No API key set — fall back to the keyword-matched mock responder
        await new Promise((r) => setTimeout(r, 400));
        responseMarkdown = generateOperationsChatResponse(queryText, state);
      }

      const botMsg: ChatHistoryItem = {
        id: `bot_${Date.now()}`,
        sender: 'ASSISTANT',
        text: responseMarkdown,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, botMsg]);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="bg-white border border-[#423F4F]/10 rounded-[8px] p-5 shadow-sm space-y-4 font-sans">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#423F4F]/10 pb-3 font-mono-tech">
        <div className="flex items-center gap-2">
          <Bot className="w-5 h-5 text-[#A99BC9]" />
          <h3 className="font-extrabold text-sm text-[#292733]">LATTICE OPERATIONS ASSISTANT CHAT</h3>
        </div>
        <span className="text-[10px] font-bold text-[#7AE04C] bg-[#7AE04C]/15 px-2.5 py-0.5 rounded border border-[#7AE04C]/30">
          {defaultAIProvider.isConfigured() ? 'LIVE AI — GROQ CONNECTED' : 'GROUNDED IN LIVE EMERGENCY STATE'}
        </span>
      </div>

      {/* QUICK PROMPT CHIPS */}
      <div className="flex flex-wrap items-center gap-1.5 font-mono-tech text-[11px]">
        <span className="text-[#565E75] font-bold mr-1 flex items-center gap-1">
          <HelpCircle className="w-3.5 h-3.5 text-[#A99BC9]" /> QUICK OPERATOR QUERIES:
        </span>
        {QUICK_PROMPTS.map((prompt, i) => (
          <button
            key={i}
            onClick={() => handleSendQuery(prompt)}
            disabled={isProcessing}
            className="px-2.5 py-1 bg-[#F3F3F3] hover:bg-[#A99BC9]/20 text-[#292733] font-semibold border border-[#423F4F]/20 rounded-[6px] transition-all cursor-pointer disabled:opacity-50"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* CHAT MESSAGES STREAM */}
      <div className="relative">
        <div
          ref={chatContainerRef}
          onScroll={handleChatScroll}
          className="space-y-4 h-[360px] overflow-y-auto pr-1 font-sans"
        >
          {messages.map((item) => (
            <div
              key={item.id}
              className={`p-4 rounded-[8px] border transition-all ${
                item.sender === 'OPERATOR'
                  ? 'bg-[#292733] text-[#F3F3F3] border-[#423F4F] ml-8'
                  : 'bg-[#F3F3F3] border-[#423F4F]/15 mr-8'
              }`}
            >
              <div className="flex items-center justify-between mb-2 font-mono-tech text-xs">
                <div className="flex items-center gap-2">
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] ${
                    item.sender === 'OPERATOR' ? 'bg-[#A99BC9] text-[#292733]' : 'bg-[#292733] text-white'
                  }`}>
                    {item.sender === 'OPERATOR' ? '👤' : '🧠'}
                  </span>
                  <span className="font-extrabold">{item.sender === 'OPERATOR' ? 'OPERATOR' : 'LATTICE ASSISTANT'}</span>
                </div>
                <span className="text-[10px] opacity-70">{item.timestamp}</span>
              </div>

              {/* MESSAGE CONTENT WITH PROPER MARKDOWN RENDERING */}
              <div className={`text-xs font-medium leading-relaxed ${item.sender === 'OPERATOR' ? 'text-[#F3F3F3]' : 'text-[#292733]'}`}>
                <ReactMarkdown
                  components={{
                    h1: ({ children }) => <h1 className={`text-sm font-extrabold my-2 border-b pb-1 ${item.sender === 'OPERATOR' ? 'text-[#F3F3F3] border-[#565E75]' : 'text-[#292733] border-[#423F4F]/20'}`}>{children}</h1>,
                    h2: ({ children }) => <h2 className={`text-xs font-extrabold my-1.5 ${item.sender === 'OPERATOR' ? 'text-[#F3F3F3]' : 'text-[#292733]'}`}>{children}</h2>,
                    h3: ({ children }) => <h3 className={`text-xs font-extrabold my-1.5 ${item.sender === 'OPERATOR' ? 'text-[#A99BC9]' : 'text-[#292733]'}`}>{children}</h3>,
                    p: ({ children }) => <p className="mb-1.5 last:mb-0 leading-relaxed">{children}</p>,
                    strong: ({ children }) => <strong className={`font-extrabold ${item.sender === 'OPERATOR' ? 'text-[#E6B85C]' : 'text-[#292733]'}`}>{children}</strong>,
                    ul: ({ children }) => <ul className="list-disc pl-4 space-y-1.5 my-1.5">{children}</ul>,
                    ol: ({ children }) => <ol className="list-decimal pl-4 space-y-1.5 my-1.5">{children}</ol>,
                    li: ({ children }) => <li className="leading-normal">{children}</li>,
                    code: ({ children }) => <code className="bg-[#1F2028] text-[#7AE04C] px-1.5 py-0.5 rounded text-[11px] font-mono">{children}</code>,
                  }}
                >
                  {item.text}
                </ReactMarkdown>
              </div>
            </div>
          ))}

          {isProcessing && (
            <div className="p-3 bg-[#F3F3F3] rounded-[8px] border border-[#423F4F]/10 font-mono-tech text-xs text-[#A99BC9] flex items-center gap-2 animate-pulse">
              <Sparkles className="w-4 h-4 text-[#E6B85C]" />
              <span>Consulting live emergency state and multi-agent mesh...</span>
            </div>
          )}
        </div>

        {!isChatAtBottom && chatUnreadCount > 0 && (
          <button
            onClick={scrollToChatBottom}
            className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-[#292733] hover:bg-[#423F4F] text-[#F3F3F3] font-mono-tech text-xs font-bold px-3.5 py-1.5 rounded-full shadow-lg border border-[#A99BC9] flex items-center gap-2 z-20 cursor-pointer transition-all animate-bounce"
          >
            <span className="text-[#7AE04C] font-bold">↓</span>
            <span>{chatUnreadCount} new {chatUnreadCount === 1 ? 'message' : 'messages'}</span>
          </button>
        )}
      </div>

      {/* INPUT FORM */}
      <div className="flex items-center gap-2 pt-2 border-t border-[#423F4F]/10">
        <input
          type="text"
          value={inputQuery}
          onChange={(e) => setInputQuery(e.target.value)}
          placeholder="Ask LATTICE Assistant about the emergency, routes, or agent reasoning..."
          className="flex-1 p-2.5 bg-[#F3F3F3] text-[#292733] border border-[#423F4F]/20 rounded-[6px] font-sans text-xs focus:outline-none focus:border-[#A99BC9]"
          onKeyDown={(e) => e.key === 'Enter' && handleSendQuery(inputQuery)}
        />

        <button
          onClick={() => handleSendQuery(inputQuery)}
          disabled={!inputQuery.trim() || isProcessing}
          className="py-2.5 px-4 bg-[#292733] hover:bg-[#423F4F] text-[#F3F3F3] font-mono-tech text-xs font-bold rounded-[6px] transition-all cursor-pointer disabled:opacity-50 flex items-center gap-1.5 shrink-0"
        >
          <Send className="w-3.5 h-3.5" />
          <span>QUERY</span>
        </button>
      </div>
    </div>
  );
};
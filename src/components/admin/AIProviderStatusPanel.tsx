import React, { useMemo, useState } from 'react';
import { Brain, Loader2 } from 'lucide-react';
import { getAIProvider } from '../../lib/ai';
import { AgentRecord } from '../../data/agentRegistryStore';

interface AIProviderStatusPanelProps {
  agents: AgentRecord[];
}

const SCENARIO_OPTIONS = [
  'Floor 4 fire detected, smoke spreading to stairwell B',
  'Water leak reported on Floor 2, contained',
  'Unauthorized access attempt at Exit A',
  'Mutual aid corridor requested from Building B',
];

export const AIProviderStatusPanel: React.FC<AIProviderStatusPanelProps> = ({ agents }) => {
  const provider = useMemo(() => getAIProvider(), []);
  const configured = provider.isAvailable();

  const [selectedAgentId, setSelectedAgentId] = useState(agents[0]?.id ?? '');
  const [scenario, setScenario] = useState(SCENARIO_OPTIONS[0]);
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<string | null>(null);

  const selectedAgent = agents.find((a) => a.id === selectedAgentId);

  const runTest = async () => {
    if (!selectedAgent) return;
    setLoading(true);
    setResponse(null);
    try {
      const result = await provider.generateAgentResponse(selectedAgent.agentId, scenario, {
        agent: selectedAgent.name,
        building: selectedAgent.assignedBuildingName,
        capabilities: selectedAgent.capabilities,
      });
      setResponse(result);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white border border-[#423F4F]/10 rounded-[8px] shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-[#423F4F]/10 flex items-center gap-2.5 bg-[#F3F3F3]/50">
        <Brain className="w-4 h-4 text-[#A99BC9]" />
        <h3 className="font-extrabold text-sm text-[#292733] uppercase font-mono-tech tracking-wide">AI Provider Status</h3>
      </div>

      <div className="p-6 space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono-tech text-xs">
          <div>
            <span className="text-[10px] text-[#565E75] uppercase font-bold block">Provider</span>
            <span className="font-extrabold text-[#292733]">{provider.name}</span>
          </div>
          <div>
            <span className="text-[10px] text-[#565E75] uppercase font-bold block">Model</span>
            <span className="font-extrabold text-[#292733]">{provider.modelName}</span>
          </div>
          <div>
            <span className="text-[10px] text-[#565E75] uppercase font-bold block">Status</span>
            <span className={`font-extrabold flex items-center gap-1.5 ${configured ? 'text-[#7AE04C]' : 'text-[#565E75]'}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${configured ? 'bg-[#7AE04C]' : 'bg-[#565E75]'}`}></span>
              {configured ? 'Configured' : 'Mock Mode'}
            </span>
          </div>
        </div>

        {!configured && (
          <p className="text-[11px] text-[#565E75] font-mono-tech leading-relaxed bg-[#F3F3F3] p-3 rounded-[6px] border border-[#423F4F]/10">
            No <code>VITE_GROQ_API_KEY</code> detected. Test responses will use the mock fallback so the simulation keeps working — set the key in your <code>.env</code> to enable live responses.
          </p>
        )}

        <div className="space-y-3 border-t border-[#423F4F]/10 pt-5">
          <h4 className="font-mono-tech text-[10px] font-bold text-[#A99BC9] uppercase tracking-wider">Test Agent Response</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] text-[#565E75] uppercase font-bold font-mono-tech block mb-1">Agent</label>
              <select
                className="w-full px-3 py-2 bg-[#F3F3F3] rounded-[6px] border border-[#423F4F]/15 text-[#292733] text-xs font-mono-tech font-bold"
                value={selectedAgentId}
                onChange={(e) => setSelectedAgentId(e.target.value)}
              >
                {agents.map((a) => (
                  <option key={a.id} value={a.id}>{a.name} ({a.assignedBuildingName})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-[10px] text-[#565E75] uppercase font-bold font-mono-tech block mb-1">Scenario / Event</label>
              <select
                className="w-full px-3 py-2 bg-[#F3F3F3] rounded-[6px] border border-[#423F4F]/15 text-[#292733] text-xs font-mono-tech font-bold"
                value={scenario}
                onChange={(e) => setScenario(e.target.value)}
              >
                {SCENARIO_OPTIONS.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>

          <button
            onClick={runTest}
            disabled={!selectedAgent || loading}
            className="py-2 px-4 bg-[#292733] hover:bg-[#423F4F] disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-mono-tech font-extrabold uppercase tracking-wider rounded-[6px] transition-colors cursor-pointer flex items-center gap-2"
          >
            {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            {loading ? 'Sending…' : 'Test Agent Response'}
          </button>

          {response && selectedAgent && (
            <div className="p-4 bg-[#F3F3F3] rounded-[6px] border border-[#423F4F]/10 font-mono-tech text-xs space-y-2">
              <div>
                <span className="text-[10px] text-[#565E75] uppercase font-bold block">Agent</span>
                <span className="font-bold text-[#292733]">{selectedAgent.name}</span>
              </div>
              <div>
                <span className="text-[10px] text-[#565E75] uppercase font-bold block">Event</span>
                <span className="font-bold text-[#292733]">{scenario}</span>
              </div>
              <div>
                <span className="text-[10px] text-[#565E75] uppercase font-bold block">Response</span>
                <p className="text-[#292733] whitespace-pre-wrap leading-relaxed">{response}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
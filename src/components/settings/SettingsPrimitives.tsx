import React, { useState } from 'react';

/* ------------------------------------------------------------------ */
/*  Layout shell: header + left section-nav (mirrors the role's       */
/*  distinct information architecture) + right content pane.          */
/* ------------------------------------------------------------------ */

export interface SettingsSectionDef {
  id: string;
  label: string;
  icon: React.ReactNode;
  render: () => React.ReactNode;
}

interface SettingsShellProps {
  eyebrow: string;
  title: string;
  subtitle: string;
  accent: string; // hex color used for active nav state / accents
  sections: SettingsSectionDef[];
}

export const SettingsShell: React.FC<SettingsShellProps> = ({ eyebrow, title, subtitle, accent, sections }) => {
  const [activeId, setActiveId] = useState<string>(sections[0]?.id ?? '');
  const active = sections.find((s) => s.id === activeId) ?? sections[0];

  return (
    <div className="space-y-6 font-sans">
      {/* Header */}
      <div className="bg-white border border-[#423F4F]/10 rounded-[8px] p-6 shadow-sm">
        <span
          className="font-mono-tech text-[10px] font-bold uppercase tracking-widest block mb-1"
          style={{ color: accent }}
        >
          {eyebrow}
        </span>
        <h1 className="text-2xl font-extrabold text-[#292733] tracking-tight">{title}</h1>
        <p className="text-xs text-[#565E75] mt-1 font-mono-tech">{subtitle}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-6 items-start">
        {/* Left section nav — the role's own settings tree */}
        <nav className="bg-[#292733] rounded-[8px] p-2.5 space-y-1 lg:sticky lg:top-6 shadow-sm">
          {sections.map((s, idx) => {
            const isActive = s.id === active?.id;
            const isLast = idx === sections.length - 1;
            return (
              <button
                key={s.id}
                onClick={() => setActiveId(s.id)}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-[6px] font-mono-tech text-xs font-bold uppercase tracking-wide text-left transition-all cursor-pointer relative ${
                  isActive
                    ? 'bg-[#423F4F] text-[#F3F3F3] border border-[#565E75]'
                    : 'text-[#F3F3F3]/65 hover:text-[#F3F3F3] hover:bg-[#423F4F]/40'
                }`}
              >
                <span className="font-mono-tech text-[10px] text-[#565E75] shrink-0">
                  {isLast ? '└─' : '├─'}
                </span>
                <span style={isActive ? { color: accent } : undefined} className="shrink-0">
                  {s.icon}
                </span>
                <span className="truncate">{s.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Active section content */}
        <div className="space-y-5 min-w-0">{active?.render()}</div>
      </div>
    </div>
  );
};

/* ------------------------------------------------------------------ */
/*  Section card                                                       */
/* ------------------------------------------------------------------ */

export const SettingsSection: React.FC<{
  icon: React.ReactNode;
  title: string;
  description?: string;
  children: React.ReactNode;
}> = ({ icon, title, description, children }) => (
  <div className="bg-white border border-[#423F4F]/10 rounded-[8px] shadow-sm overflow-hidden">
    <div className="p-5 border-b border-[#423F4F]/10 flex items-start gap-3">
      <div className="w-9 h-9 rounded-[6px] bg-[#292733] text-[#A99BC9] flex items-center justify-center shrink-0">
        {icon}
      </div>
      <div className="min-w-0">
        <h3 className="text-sm font-extrabold text-[#292733] uppercase tracking-wide font-mono-tech">{title}</h3>
        {description && <p className="text-xs text-[#565E75] mt-0.5">{description}</p>}
      </div>
    </div>
    <div className="p-5 space-y-4">{children}</div>
  </div>
);

/* ------------------------------------------------------------------ */
/*  Form controls                                                      */
/* ------------------------------------------------------------------ */

export const ToggleRow: React.FC<{
  label: string;
  description?: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}> = ({ label, description, checked, onChange }) => (
  <div className="flex items-center justify-between gap-4 py-0.5">
    <div className="min-w-0">
      <p className="text-xs font-bold text-[#292733]">{label}</p>
      {description && <p className="text-[10px] text-[#565E75] font-mono-tech mt-0.5">{description}</p>}
    </div>
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative shrink-0 w-10 h-[22px] rounded-full transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-[#A99BC9] focus-visible:outline-offset-2 ${
        checked ? 'bg-[#7AE04C]' : 'bg-[#423F4F]/20'
      }`}
    >
      <span
        className={`absolute top-[2px] left-[2px] w-[18px] h-[18px] bg-white rounded-full shadow transition-transform ${
          checked ? 'translate-x-[18px]' : 'translate-x-0'
        }`}
      />
    </button>
  </div>
);

export const TextField: React.FC<{
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  disabled?: boolean;
  helper?: string;
}> = ({ label, value, onChange, placeholder, disabled, helper }) => (
  <div>
    <label className="block text-[10px] font-mono-tech font-bold uppercase text-[#565E75] mb-1">{label}</label>
    <input
      type="text"
      value={value}
      disabled={disabled}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
      className="w-full px-3.5 py-2.5 bg-[#F3F3F3] border border-[#423F4F]/20 rounded-[6px] text-xs font-sans text-[#292733] focus:bg-white focus:border-[#423F4F] focus-visible:outline-2 focus-visible:outline-[#A99BC9] focus-visible:outline-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
    />
    {helper && <p className="text-[10px] text-[#565E75] font-mono-tech mt-1">{helper}</p>}
  </div>
);

export const NumberField: React.FC<{
  label: string;
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
}> = ({ label, value, onChange, min, max }) => (
  <div>
    <label className="block text-[10px] font-mono-tech font-bold uppercase text-[#565E75] mb-1">{label}</label>
    <input
      type="number"
      value={value}
      min={min}
      max={max}
      onChange={(e) => onChange(Number(e.target.value))}
      className="w-full px-3.5 py-2.5 bg-[#F3F3F3] border border-[#423F4F]/20 rounded-[6px] text-xs font-sans text-[#292733] focus:bg-white focus:border-[#423F4F] focus-visible:outline-2 focus-visible:outline-[#A99BC9] focus-visible:outline-offset-2 transition-all"
    />
  </div>
);

export const SelectField: React.FC<{
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}> = ({ label, value, onChange, options }) => (
  <div>
    <label className="block text-[10px] font-mono-tech font-bold uppercase text-[#565E75] mb-1">{label}</label>
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full px-3.5 py-2.5 bg-[#F3F3F3] border border-[#423F4F]/20 rounded-[6px] text-xs font-sans text-[#292733] focus:bg-white focus:border-[#423F4F] focus-visible:outline-2 focus-visible:outline-[#A99BC9] focus-visible:outline-offset-2 transition-all"
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  </div>
);

export const SliderField: React.FC<{
  label: string;
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  step?: number;
  suffix?: string;
}> = ({ label, value, onChange, min = 0, max = 100, step = 1, suffix = '%' }) => (
  <div>
    <div className="flex items-center justify-between mb-1">
      <label className="text-[10px] font-mono-tech font-bold uppercase text-[#565E75]">{label}</label>
      <span className="text-[10px] font-mono-tech font-bold text-[#292733]">
        {value}
        {suffix}
      </span>
    </div>
    <input
      type="range"
      value={value}
      min={min}
      max={max}
      step={step}
      onChange={(e) => onChange(Number(e.target.value))}
      className="w-full accent-[#423F4F] cursor-pointer"
    />
  </div>
);

export const Pill: React.FC<{ tone?: 'ok' | 'warn' | 'bad' | 'neutral'; children: React.ReactNode }> = ({
  tone = 'neutral',
  children,
}) => {
  const toneMap: Record<string, string> = {
    ok: 'bg-[#7AE04C]/15 text-[#292733] border-[#7AE04C]/40',
    warn: 'bg-[#E6B85C]/15 text-[#292733] border-[#E6B85C]/40',
    bad: 'bg-[#E26161]/15 text-[#E26161] border-[#E26161]/40',
    neutral: 'bg-[#F3F3F3] text-[#565E75] border-[#423F4F]/15',
  };
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded font-mono-tech text-[10px] font-bold border ${toneMap[tone]}`}>
      {children}
    </span>
  );
};

/* ------------------------------------------------------------------ */
/*  Footer action bar (Save / Discard) — presentational only in demo   */
/* ------------------------------------------------------------------ */

export const SettingsSaveBar: React.FC<{
  onSave: () => void;
  status: 'loading' | 'ready' | 'saving' | 'saved' | 'error';
  error?: string | null;
}> = ({ onSave, status, error }) => {
  const label =
    status === 'loading'
      ? 'Loading your saved settings…'
      : status === 'saving'
      ? 'Saving…'
      : status === 'saved'
      ? '✓ Saved to your account'
      : status === 'error'
      ? error || 'Something went wrong.'
      : 'Changes are saved to your account and load automatically next time you sign in.';

  return (
    <div className="flex items-center justify-between bg-white border border-[#423F4F]/10 rounded-[8px] p-4 shadow-sm font-mono-tech">
      <span className={`text-[10px] ${status === 'error' ? 'text-[#E26161] font-bold' : 'text-[#565E75]'}`}>{label}</span>
      <button
        onClick={onSave}
        disabled={status === 'saving' || status === 'loading'}
        className="px-5 py-2 bg-[#292733] hover:bg-[#423F4F] disabled:opacity-50 disabled:cursor-not-allowed text-[#F3F3F3] text-xs font-bold uppercase tracking-wider rounded-[6px] cursor-pointer transition-all"
      >
        {status === 'saving' ? 'Saving…' : 'Save Changes'}
      </button>
    </div>
  );
};
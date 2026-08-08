import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ShieldCheck, Cpu, Terminal, Layers, CheckCircle2, Lock, Radio } from 'lucide-react';

interface SystemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEnterSystem?: () => void;
}

export const SystemModal: React.FC<SystemModalProps> = ({ isOpen, onClose, onEnterSystem }) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-[#292733]/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 12 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-3xl bg-[#423F4F] text-[#F3F3F3] rounded-[8px] border border-[#565E75] shadow-2xl overflow-hidden my-8"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-[#565E75]/40 bg-[#292733]">
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-[4px] bg-[#A99BC9] text-[#292733] flex items-center justify-center font-bold">
                <Cpu className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-extrabold text-base tracking-wide text-[#F3F3F3]">LATTICE SYSTEM ARCHITECTURE</h3>
                <p className="font-mono-tech text-[10px] text-[#A99BC9]">PHASE 2 DEPLOYED // AUTHENTICATED COMMAND CENTER</p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-[6px] bg-[#423F4F] hover:bg-[#565E75] text-[#F3F3F3] flex items-center justify-center transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-[#A99BC9] focus-visible:outline-offset-2"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Body */}
          <div className="p-6 sm:p-8 space-y-6 max-h-[75vh] overflow-y-auto font-sans">
            {/* Phase 2 Notice Box */}
            <div className="p-4 bg-[#292733] rounded-[6px] border border-[#7AE04C]/40 flex items-start gap-3.5">
              <ShieldCheck className="w-5 h-5 text-[#7AE04C] shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-sm text-[#F3F3F3] mb-1">Phase 2 Active: Authenticated Command Center Online</h4>
                <p className="text-xs text-[#F3F3F3]/80 leading-relaxed font-mono-tech">
                  Firebase Authentication and Firestore profile persistence are active. Registered operators and administrators can authenticate and monitor building agent networks.
                </p>
              </div>
            </div>

            {/* 6 Intelligent Agents Specs */}
            <div>
              <h4 className="font-mono-tech text-xs uppercase text-[#A99BC9] tracking-wider mb-3 font-semibold">
                // THE 6 INTELLIGENT AGENT MODULES
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-mono-tech text-xs">
                <div className="p-3 bg-[#292733] rounded-[6px] border border-[#565E75]/30">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-[#E26161]">01. FIRE & HAZARD AGENT</span>
                    <span className="text-[10px] text-[#7AE04C]">ONLINE</span>
                  </div>
                  <p className="text-[11px] text-[#F3F3F3]/70 font-sans">Thermal anomaly classification & smoke plume tracking.</p>
                </div>

                <div className="p-3 bg-[#292733] rounded-[6px] border border-[#565E75]/30">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-[#E6B85C]">02. OCCUPANCY AGENT</span>
                    <span className="text-[10px] text-[#7AE04C]">ONLINE</span>
                  </div>
                  <p className="text-[11px] text-[#F3F3F3]/70 font-sans">Real-time room counts, exit corridor flow estimation.</p>
                </div>

                <div className="p-3 bg-[#292733] rounded-[6px] border border-[#565E75]/30">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-[#6B9FD4]">03. SECURITY & ACCESS AGENT</span>
                    <span className="text-[10px] text-[#7AE04C]">ONLINE</span>
                  </div>
                  <p className="text-[11px] text-[#F3F3F3]/70 font-sans">Perimeter locking, emergency egress door releasing.</p>
                </div>

                <div className="p-3 bg-[#292733] rounded-[6px] border border-[#565E75]/30">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-[#A99BC9]">04. EMERGENCY COORDINATOR</span>
                    <span className="text-[10px] text-[#7AE04C]">ONLINE</span>
                  </div>
                  <p className="text-[11px] text-[#F3F3F3]/70 font-sans">Synthesizes observations to formulate response plans.</p>
                </div>

                <div className="p-3 bg-[#292733] rounded-[6px] border border-[#565E75]/30">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-[#E0B7C9]">05. ETHICAL PRIORITY AGENT</span>
                    <span className="text-[10px] text-[#7AE04C]">ONLINE</span>
                  </div>
                  <p className="text-[11px] text-[#F3F3F3]/70 font-sans">Prioritizes vulnerable zones & safety allocation.</p>
                </div>

                <div className="p-3 bg-[#292733] rounded-[6px] border border-[#565E75]/30">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-[#7AE04C]">06. CROSS-BUILDING AGENT</span>
                    <span className="text-[10px] text-[#7AE04C]">ONLINE</span>
                  </div>
                  <p className="text-[11px] text-[#F3F3F3]/70 font-sans">Campus-wide relaying & mutual aid coordination.</p>
                </div>
              </div>
            </div>

            {/* Principles */}
            <div className="pt-2 border-t border-[#565E75]/40 font-mono-tech text-xs space-y-2">
              <div className="flex items-center gap-2 text-[#7AE04C]">
                <CheckCircle2 className="w-4 h-4" />
                <span>INTEROPERABLE AGENT PROTOCOL: ZERO-TRUST PEER EXCHANGE</span>
              </div>
              <div className="flex items-center gap-2 text-[#7AE04C]">
                <CheckCircle2 className="w-4 h-4" />
                <span>DETERMINISTIC HUMAN CONTROL: HUMAN OPERATOR OVERRIDE AT ALL TIMES</span>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 bg-[#292733] border-t border-[#565E75]/40 flex flex-wrap items-center justify-between gap-3">
            <span className="font-mono-tech text-xs text-[#565E75]">STATUS: SYSTEM OPERATIONAL</span>
            <div className="flex items-center gap-3">
              {onEnterSystem && (
                <button
                  onClick={() => {
                    onClose();
                    onEnterSystem();
                  }}
                  className="btn-lattice-primary text-xs uppercase tracking-wider py-2 px-4 cursor-pointer focus-visible:outline-2 focus-visible:outline-[#A99BC9] focus-visible:outline-offset-2"
                >
                  ENTER COMMAND CENTER →
                </button>
              )}
              <button
                onClick={onClose}
                className="btn-lattice-secondary text-xs uppercase tracking-wider py-2 px-4 cursor-pointer focus-visible:outline-2 focus-visible:outline-[#A99BC9] focus-visible:outline-offset-2"
              >
                CLOSE
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

import React from 'react';
import { motion } from 'motion/react';
import { Flame, Users, Shield, Cpu, ArrowRight, ShieldCheck, CheckCircle, RefreshCw, Layers } from 'lucide-react';

export const HowItWorksSection: React.FC = () => {
  return (
    <section id="how-it-works" className="py-20 md:py-32 px-4 lg:px-8 bg-[#F3F3F3] text-[#423F4F] relative">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="mb-16 max-w-2xl">
          <div className="inline-flex items-center gap-2 mb-3 px-3 py-1 bg-[#423F4F]/10 rounded-[6px] border border-[#423F4F]/20">
            <span className="w-2 h-2 rounded-full bg-[#423F4F]"></span>
            <span className="font-mono-tech text-xs tracking-widest text-[#565E75] uppercase font-bold">
              SYSTEM MECHANICS
            </span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-extrabold text-[#423F4F] tracking-tight leading-tight mb-4">
            How LATTICE Works
          </h2>

          <p className="text-base sm:text-lg text-[#565E75] leading-relaxed">
            A three-stage autonomous collaboration cycle designed for high-stakes emergency environments.
          </p>
        </div>

        {/* Three Equal Width Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
          
          {/* CARD 01: DETECT */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="bg-white text-[#423F4F] rounded-[8px] p-6 sm:p-8 border border-[#423F4F]/10 shadow-sm flex flex-col justify-between relative group hover:shadow-md hover:border-[#423F4F]/20 transition-all"
          >
            <div>
              {/* Card Number & Header */}
              <div className="flex items-center justify-between border-b border-[#423F4F]/10 pb-4 mb-6">
                <span className="font-mono-tech text-3xl font-bold text-[#A99BC9]">01</span>
                <span className="font-mono-tech text-[10px] font-bold uppercase tracking-widest bg-[#F3F3F3] text-[#565E75] px-2.5 py-1 rounded-[4px] border border-[#423F4F]/10">
                  INPUT_PHASE
                </span>
              </div>

              {/* Title */}
              <h3 className="text-xl font-extrabold uppercase tracking-widest mb-3 text-[#292733]">
                DETECT
              </h3>

              {/* Text */}
              <p className="text-xs sm:text-sm text-[#565E75] leading-relaxed mb-6 font-normal">
                Specialized agents understand different parts of the environment.
              </p>
            </div>

            {/* Agent Labels Container */}
            <div className="space-y-3 pt-4 border-t border-[#423F4F]/10">
              <span className="font-mono-tech text-[10px] text-[#A99BC9] uppercase tracking-wider block font-bold">
                // ACTIVE AGENT DOMAINS
              </span>

              <div className="flex flex-wrap gap-2 font-mono-tech text-xs">
                <div className="bg-[#F3F3F3] px-3 py-2 rounded-[6px] border border-[#E26161]/30 text-[#E26161] flex items-center gap-2 font-bold">
                  <span>🔥</span>
                  <span>Fire & Hazard</span>
                </div>

                <div className="bg-[#F3F3F3] px-3 py-2 rounded-[6px] border border-[#6B9FD4]/30 text-[#6B9FD4] flex items-center gap-2 font-bold">
                  <span>👥</span>
                  <span>Occupancy</span>
                </div>

                <div className="bg-[#F3F3F3] px-3 py-2 rounded-[6px] border border-[#565E75]/30 text-[#565E75] flex items-center gap-2 font-bold">
                  <span>🛡️</span>
                  <span>Security</span>
                </div>
              </div>
            </div>
          </motion.div>


          {/* CARD 02: COLLABORATE */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-white text-[#423F4F] rounded-[8px] p-6 sm:p-8 border border-[#423F4F]/10 shadow-sm flex flex-col justify-between relative group hover:shadow-md hover:border-[#423F4F]/20 transition-all"
          >
            <div>
              {/* Card Number & Header */}
              <div className="flex items-center justify-between border-b border-[#423F4F]/10 pb-4 mb-6">
                <span className="font-mono-tech text-3xl font-bold text-[#A99BC9]">02</span>
                <span className="font-mono-tech text-[10px] font-bold uppercase tracking-widest bg-[#F3F3F3] text-[#565E75] px-2.5 py-1 rounded-[4px] border border-[#423F4F]/10">
                  SYNC_LAYER
                </span>
              </div>

              {/* Title */}
              <h3 className="text-xl font-extrabold uppercase tracking-widest mb-3 text-[#292733]">
                COLLABORATE
              </h3>

              {/* Text */}
              <p className="text-xs sm:text-sm text-[#565E75] leading-relaxed mb-6 font-normal">
                Agents discover capabilities, exchange information, and resolve conflicting observations through an interoperable network.
              </p>
            </div>

            {/* Subtle Node/Network Visualization */}
            <div className="bg-[#F3F3F3] p-4 rounded-[6px] border border-[#423F4F]/10">
              <span className="font-mono-tech text-[10px] text-[#A99BC9] uppercase tracking-wider block font-bold mb-3">
                // MESH DISCOVERY PROTOCOL
              </span>

              <div className="relative h-24 w-full bg-white rounded border border-[#423F4F]/10 p-2 flex items-center justify-around overflow-hidden">
                {/* SVG Connecting lines animation */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none stroke-[#A99BC9]/50 stroke-[1.5]">
                  <line x1="20%" y1="50%" x2="50%" y2="50%" strokeDasharray="3 2" />
                  <line x1="50%" y1="50%" x2="80%" y2="50%" strokeDasharray="3 2" />
                </svg>

                {/* Node 1 */}
                <div className="relative z-10 flex flex-col items-center">
                  <div className="w-7 h-7 rounded-[4px] bg-[#6B9FD4] text-white flex items-center justify-center font-bold text-xs shadow-sm">
                    A1
                  </div>
                  <span className="font-mono-tech text-[9px] text-[#565E75] mt-1 font-bold">HAZARD</span>
                </div>

                {/* Node 2 */}
                <div className="relative z-10 flex flex-col items-center">
                  <div className="w-7 h-7 rounded-[4px] bg-[#A99BC9] text-white flex items-center justify-center font-bold text-xs shadow-sm animate-pulse">
                    BUS
                  </div>
                  <span className="font-mono-tech text-[9px] text-[#A99BC9] mt-1 font-bold">INTEROP</span>
                </div>

                {/* Node 3 */}
                <div className="relative z-10 flex flex-col items-center">
                  <div className="w-7 h-7 rounded-[4px] bg-[#7AE04C] text-[#292733] flex items-center justify-center font-bold text-xs shadow-sm">
                    A2
                  </div>
                  <span className="font-mono-tech text-[9px] text-[#565E75] mt-1 font-bold">HUMAN</span>
                </div>
              </div>
            </div>
          </motion.div>


          {/* CARD 03: RESPOND */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="bg-white text-[#423F4F] rounded-[8px] p-6 sm:p-8 border border-[#423F4F]/10 shadow-sm flex flex-col justify-between relative group hover:shadow-md hover:border-[#423F4F]/20 transition-all"
          >
            <div>
              {/* Card Number & Header */}
              <div className="flex items-center justify-between border-b border-[#423F4F]/10 pb-4 mb-6">
                <span className="font-mono-tech text-3xl font-bold text-[#A99BC9]">03</span>
                <span className="font-mono-tech text-[10px] font-bold uppercase tracking-widest bg-[#F3F3F3] text-[#565E75] px-2.5 py-1 rounded-[4px] border border-[#423F4F]/10">
                  ACTION_EXE
                </span>
              </div>

              {/* Title */}
              <h3 className="text-xl font-extrabold uppercase tracking-widest mb-3 text-[#292733]">
                RESPOND
              </h3>

              {/* Text */}
              <p className="text-xs sm:text-sm text-[#565E75] leading-relaxed mb-6 font-normal">
                The system generates an adaptive response plan while human operators retain final control over critical actions.
              </p>
            </div>

            {/* Sequence Flow */}
            <div className="bg-[#F3F3F3] p-4 rounded-[6px] border border-[#423F4F]/10">
              <span className="font-mono-tech text-[10px] text-[#A99BC9] uppercase tracking-wider block font-bold mb-3">
                // CONTROL LOOP SEQUENCE
              </span>

              <div className="font-mono-tech text-[10px] sm:text-[11px] font-bold text-[#423F4F] bg-white p-2.5 rounded-[6px] border border-[#423F4F]/10 text-center leading-relaxed">
                <span className="text-[#565E75]">AI PLAN</span>
                <span className="mx-1 text-[#A99BC9]">→</span>
                <span className="text-[#E6B85C]">APPROVE / MODIFY / REJECT</span>
                <span className="mx-1 text-[#A99BC9]">→</span>
                <span className="text-[#7AE04C]">RESPOND</span>
                <span className="mx-1 text-[#A99BC9]">→</span>
                <span className="text-[#6B9FD4]">REPLAN</span>
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
};

import React from 'react';
import { motion } from 'motion/react';
import { ArrowDown, Cpu, Shield, Users, Radio, CheckCircle2, ChevronRight } from 'lucide-react';

interface HeroSectionProps {
  onOpenSystemModal: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onOpenSystemModal }) => {
  const scrollToCore = () => {
    const el = document.getElementById('visual-core');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section id="hero" className="relative pt-16 md:pt-24 pb-20 md:pb-28 px-4 lg:px-8 grid-bg-subtle overflow-hidden">
      {/* Background architectural design accent lines */}
      <div className="absolute inset-0 pointer-events-none opacity-40">
        <div className="max-w-7xl mx-auto h-full grid grid-cols-4 md:grid-cols-12 gap-4">
          <div className="border-r border-[#423F4F]/10 h-full"></div>
          <div className="hidden md:block border-r border-[#423F4F]/10 h-full"></div>
          <div className="hidden md:block border-r border-[#423F4F]/10 h-full"></div>
          <div className="border-r border-[#423F4F]/10 h-full"></div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto relative z-10 text-left">
        {/* Technical Eyebrow */}
        <motion.div 
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 mb-6 px-3 py-1 bg-[#423F4F]/8 border border-[#423F4F]/20 rounded-[6px]"
        >
          <span className="w-2 h-2 rounded-full bg-[#A99BC9]"></span>
          <span className="font-mono-tech text-xs tracking-widest uppercase text-[#565E75] font-semibold">
            11 DIMENSIONS × LATTICE
          </span>
        </motion.div>

        {/* Main Heading */}
        <motion.h1 
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-[#423F4F] tracking-tight leading-[1.08] mb-6"
        >
          Emergency intelligence,<br className="hidden sm:block" /> connected.
        </motion.h1>

        {/* Subtitle */}
        <motion.p 
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="font-mono-tech text-sm sm:text-base md:text-lg text-[#565E75] font-medium max-w-3xl mb-6 tracking-tight"
        >
          Layered Agentic Technology for Trusted Interoperable Collaborative Emergencies
        </motion.p>

        {/* Supporting Text */}
        <motion.p 
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="text-base sm:text-xl text-[#423F4F]/90 leading-relaxed font-normal max-w-2xl mb-10"
        >
          LATTICE transforms isolated building systems into a cooperative network of intelligent agents that detect, communicate, reason, and adapt together during emergencies.
        </motion.p>

        {/* CTAs */}
        <motion.div 
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 mb-14"
        >
          <button 
            onClick={scrollToCore}
            className="btn-lattice-primary text-sm uppercase tracking-wider py-3.5 px-7 flex items-center justify-center gap-2 cursor-pointer shadow-sm focus-visible:outline-2 focus-visible:outline-[#A99BC9] focus-visible:outline-offset-2"
          >
            <span>Explore LATTICE</span>
            <ArrowDown className="w-4 h-4 text-[#A99BC9]" />
          </button>

          <button 
            onClick={onOpenSystemModal}
            className="btn-lattice-secondary text-sm uppercase tracking-wider py-3.5 px-7 flex items-center justify-center gap-2 cursor-pointer focus-visible:outline-2 focus-visible:outline-[#A99BC9] focus-visible:outline-offset-2"
          >
            <span>Enter System →</span>
          </button>
        </motion.div>

        {/* Compact Technical Status Row */}
        <motion.div 
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="pt-8 border-t border-[#423F4F]/15 flex flex-wrap items-center gap-6 sm:gap-10 font-mono-tech text-xs sm:text-sm text-[#565E75]"
        >
          <div className="flex items-center gap-2.5">
            <span className="text-[#7AE04C] font-bold">●</span>
            <span className="font-semibold text-[#423F4F]">6 INTELLIGENT AGENTS</span>
          </div>

          <div className="flex items-center gap-2.5">
            <span className="text-[#6B9FD4] font-bold">●</span>
            <span className="font-semibold text-[#423F4F]">INTEROPERABLE</span>
          </div>

          <div className="flex items-center gap-2.5">
            <span className="text-[#A99BC9] font-bold">●</span>
            <span className="font-semibold text-[#423F4F]">HUMAN CONTROLLED</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

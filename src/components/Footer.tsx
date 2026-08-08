import React from 'react';
import { Cpu, Activity } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="px-6 lg:px-10 py-6 border-t border-[#423F4F]/10 bg-white text-[10px] text-[#565E75] font-mono-tech uppercase tracking-widest">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="font-bold text-[#292733]">LATTICE</span>
          <span>/</span>
          <span>Building Emergency Agent Network</span>
        </div>

        <div className="flex items-center gap-6">
          <span>SECURE PROTOCOL ACTIVE</span>
          <span className="font-extrabold text-[#423F4F]">11 DIMENSIONS</span>
        </div>
      </div>
    </footer>
  );
};

import React from 'react';
import { ShieldAlert, Cpu, Activity, ArrowRight } from 'lucide-react';

interface NavbarProps {
  onOpenSystemModal: () => void;
  onNavigateToLogin: () => void;
  onNavigateToSignup: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ 
  onOpenSystemModal,
  onNavigateToLogin,
  onNavigateToSignup,
}) => {
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-white/70 backdrop-blur-md border-b border-[#423F4F]/10 px-6 lg:px-10 py-4 transition-all">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-[#423F4F] flex items-center justify-center rounded-[4px]">
            <div className="w-3.5 h-3.5 border border-white rotate-45 transition-transform hover:rotate-90"></div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-xl tracking-tighter text-[#292733]">LATTICE</span>
              <span className="font-mono-tech text-[10px] tracking-widest text-[#565E75] bg-[#F3F3F3] px-1.5 py-0.5 rounded border border-[#423F4F]/10">
                v1.0.42
              </span>
            </div>
            <p className="font-mono-tech text-[10px] text-[#565E75] tracking-widest uppercase hidden sm:block">
              SECURE PROTOCOL ACTIVE
            </p>
          </div>
        </div>

        {/* Center Nav Links */}
        <nav className="hidden md:flex items-center gap-6 lg:gap-8 font-mono-tech text-xs font-semibold text-[#565E75] uppercase tracking-widest">
          <button 
            onClick={() => scrollToSection('hero')} 
            className="hover:text-[#292733] transition-colors py-1 cursor-pointer focus-visible:outline-2 focus-visible:outline-[#A99BC9] focus-visible:outline-offset-2 rounded px-1"
          >
            OVERVIEW
          </button>
          <div className="h-3 w-px bg-[#423F4F]/20"></div>
          <button 
            onClick={() => scrollToSection('visual-core')} 
            className="hover:text-[#292733] transition-colors py-1 cursor-pointer focus-visible:outline-2 focus-visible:outline-[#A99BC9] focus-visible:outline-offset-2 rounded px-1"
          >
            VISUAL CORE
          </button>
          <div className="h-3 w-px bg-[#423F4F]/20"></div>
          <button 
            onClick={() => scrollToSection('how-it-works')} 
            className="hover:text-[#292733] transition-colors py-1 cursor-pointer focus-visible:outline-2 focus-visible:outline-[#A99BC9] focus-visible:outline-offset-2 rounded px-1"
          >
            ARCHITECTURE
          </button>
        </nav>

        {/* Right Status & Actions */}
        <div className="flex items-center gap-3 lg:gap-4">
          <div className="hidden lg:flex items-center gap-2 font-mono-tech text-[10px] tracking-widest text-[#565E75] bg-[#F3F3F3] px-3 py-1.5 rounded-[6px] border border-[#423F4F]/10 font-bold">
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#7AE04C] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#7AE04C]"></span>
            </span>
            <span>6 AGENTS ONLINE</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onNavigateToLogin}
              className="px-3 py-2 text-xs font-mono-tech font-bold uppercase tracking-wider text-[#423F4F] hover:bg-[#423F4F]/5 rounded-[6px] transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-[#A99BC9] focus-visible:outline-offset-2"
            >
              SIGN IN
            </button>

            <button
              onClick={onNavigateToSignup}
              className="hidden sm:inline-block px-3 py-2 text-xs font-mono-tech font-bold uppercase tracking-wider text-[#A99BC9] bg-[#423F4F] hover:bg-[#292733] rounded-[6px] transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-[#A99BC9] focus-visible:outline-offset-2"
            >
              SIGN UP
            </button>

            <button
              onClick={onOpenSystemModal}
              className="btn-lattice-primary flex items-center gap-2 text-xs uppercase tracking-wider font-mono-tech py-2 px-3.5 sm:px-4 shadow-md shadow-[#423F4F]/10 cursor-pointer focus-visible:outline-2 focus-visible:outline-[#A99BC9] focus-visible:outline-offset-2"
            >
              <span>ENTER SYSTEM</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#A99BC9]" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

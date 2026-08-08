import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Flame, Users, ShieldAlert, Eye, Cpu, Layers, Radio, Check } from 'lucide-react';
import smartBuildingImg from '../assets/images/smart_building_lattice_1785915860702.jpg';

type PerspectiveType = 'all' | 'hazard' | 'occupancy' | 'security' | 'interop';

interface NodePin {
  id: string;
  name: string;
  code: string;
  top: string; // percentage
  left: string; // percentage
  perspective: 'hazard' | 'occupancy' | 'security' | 'interop';
  color: string;
  status: string;
  data: string;
}

const NODES: NodePin[] = [
  {
    id: 'n1',
    name: 'Thermal & Smoke Sensor Node #04',
    code: 'AGENT_HAZARD_01',
    top: '28%',
    left: '42%',
    perspective: 'hazard',
    color: '#E26161',
    status: 'ACTIVE_MONITORING',
    data: 'Temp: 22.4°C | CO: 0.0ppm | IR Array: Normal'
  },
  {
    id: 'n2',
    name: 'Zone B Occupancy Estimator',
    code: 'AGENT_OCCUPANCY_02',
    top: '48%',
    left: '62%',
    perspective: 'occupancy',
    color: '#E6B85C',
    status: 'FLOW_OPTIMIZED',
    data: 'Lobby Occupancy: 14 | Exit Corridor Clear'
  },
  {
    id: 'n3',
    name: 'Access Control & Perimeter Mesh',
    code: 'AGENT_SECURITY_01',
    top: '68%',
    left: '35%',
    perspective: 'security',
    color: '#6B9FD4',
    status: 'SECURE_GATEWAY',
    data: 'Perimeter Locked | Automated Door Override Ready'
  },
  {
    id: 'n4',
    name: 'HVAC Air Isolation Damper #12',
    code: 'AGENT_ENVIRONMENT',
    top: '22%',
    left: '70%',
    perspective: 'hazard',
    color: '#A99BC9',
    status: 'STANDBY',
    data: 'Positive Pressure Active | Smoke Containment Ready'
  },
  {
    id: 'n5',
    name: 'Human Command Interface Link',
    code: 'AGENT_HUMAN_CONTROL',
    top: '80%',
    left: '52%',
    perspective: 'interop',
    color: '#7AE04C',
    status: 'SUPERVISOR_ENGAGED',
    data: 'Master Override Token: VALIDATED | Audit Log Syncing'
  },
  {
    id: 'n6',
    name: 'Interoperability Message Bus',
    code: 'AGENT_BUS_01',
    top: '38%',
    left: '25%',
    perspective: 'interop',
    color: '#E0B7C9',
    status: 'PEER_CONNECTED',
    data: 'Latency: 1.2ms | Zero-Trust Token Active'
  }
];

export const VisualCoreSection: React.FC = () => {
  const [activePerspective, setActivePerspective] = useState<PerspectiveType>('all');
  const [hoveredNode, setHoveredNode] = useState<NodePin | null>(null);

  const filteredNodes = activePerspective === 'all' 
    ? NODES 
    : NODES.filter(n => n.perspective === activePerspective || n.perspective === 'interop');

  return (
    <section id="visual-core" className="py-20 md:py-32 px-4 lg:px-8 bg-[#292733] text-[#F3F3F3] relative overflow-hidden">
      {/* Background technical layout grid lines */}
      <div className="absolute inset-0 pointer-events-none opacity-10">
        <div className="w-full h-full grid grid-cols-6 md:grid-cols-12 gap-2">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="border-r border-[#F3F3F3]"></div>
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Section Header */}
        <div className="mb-12 max-w-3xl">
          {/* Overlay small label */}
          <div className="inline-flex items-center gap-2 mb-3 px-3 py-1 bg-[#423F4F] rounded-[6px] border border-[#565E75]/40">
            <span className="w-2 h-2 rounded-full bg-[#A99BC9] animate-pulse"></span>
            <span className="font-mono-tech text-xs tracking-widest text-[#E0B7C9] uppercase font-medium">
              ONE BUILDING. MULTIPLE INTELLIGENCES.
            </span>
          </div>

          {/* Overlay headline */}
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-[#F3F3F3] tracking-tight leading-tight mb-4">
            Every emergency tells a different story depending on where you look.
          </h2>

          {/* Supporting text */}
          <p className="text-base sm:text-lg text-[#F3F3F3]/80 font-normal leading-relaxed">
            Hazard. People. Security. Context. LATTICE brings those perspectives together.
          </p>
        </div>

        {/* Perspective Controls Bar */}
        <div className="mb-6 flex flex-wrap items-center gap-2 sm:gap-3 bg-[#423F4F]/60 p-2 rounded-[8px] border border-[#565E75]/30">
          <span className="font-mono-tech text-xs text-[#E0B7C9] px-2 uppercase tracking-wider hidden sm:inline">
            // FILTER PERSPECTIVE:
          </span>

          <button
            onClick={() => setActivePerspective('all')}
            className={`font-mono-tech text-xs px-3 py-1.5 rounded-[6px] transition-all cursor-pointer flex items-center gap-1.5 ${
              activePerspective === 'all'
                ? 'bg-[#F3F3F3] text-[#292733] font-bold shadow-sm'
                : 'bg-[#292733]/50 text-[#F3F3F3]/70 hover:text-[#F3F3F3] hover:bg-[#292733]'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>ALL PERSPECTIVES</span>
          </button>

          <button
            onClick={() => setActivePerspective('hazard')}
            className={`font-mono-tech text-xs px-3 py-1.5 rounded-[6px] transition-all cursor-pointer flex items-center gap-1.5 ${
              activePerspective === 'hazard'
                ? 'bg-[#E26161] text-[#F3F3F3] font-bold shadow-sm'
                : 'bg-[#292733]/50 text-[#F3F3F3]/70 hover:text-[#F3F3F3] hover:bg-[#292733]'
            }`}
          >
            <Flame className="w-3.5 h-3.5 text-[#E26161]" />
            <span>HAZARD PERSPECTIVE</span>
          </button>

          <button
            onClick={() => setActivePerspective('occupancy')}
            className={`font-mono-tech text-xs px-3 py-1.5 rounded-[6px] transition-all cursor-pointer flex items-center gap-1.5 ${
              activePerspective === 'occupancy'
                ? 'bg-[#E6B85C] text-[#292733] font-bold shadow-sm'
                : 'bg-[#292733]/50 text-[#F3F3F3]/70 hover:text-[#F3F3F3] hover:bg-[#292733]'
            }`}
          >
            <Users className="w-3.5 h-3.5 text-[#E6B85C]" />
            <span>OCCUPANCY PERSPECTIVE</span>
          </button>

          <button
            onClick={() => setActivePerspective('security')}
            className={`font-mono-tech text-xs px-3 py-1.5 rounded-[6px] transition-all cursor-pointer flex items-center gap-1.5 ${
              activePerspective === 'security'
                ? 'bg-[#6B9FD4] text-[#F3F3F3] font-bold shadow-sm'
                : 'bg-[#292733]/50 text-[#F3F3F3]/70 hover:text-[#F3F3F3] hover:bg-[#292733]'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5 text-[#6B9FD4]" />
            <span>SECURITY PERSPECTIVE</span>
          </button>
        </div>

        {/* Visual Centerpiece Area */}
        <div className="relative rounded-[10px] overflow-hidden border border-[#565E75]/40 bg-[#423F4F] shadow-2xl">
          {/* Main Realistic Smart Building Image */}
          <div className="relative aspect-[16/9] w-full bg-[#292733]">
            <img 
              src={smartBuildingImg} 
              alt="LATTICE Smart Building Emergency Intelligence Visualization"
              className="w-full h-full object-cover opacity-90 transition-opacity duration-700"
              referrerPolicy="no-referrer"
            />

            {/* Subtle Vignette & Gradient Overlays for architectural integration */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#292733]/90 via-transparent to-[#292733]/40 pointer-events-none"></div>

            {/* SVG Network Vector Grid overlay connecting building floors */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none stroke-[#A99BC9]/30 stroke-[1.5] stroke-dasharray-[4_4]">
              {/* Geometric connection paths between nodes */}
              <line x1="25%" y1="38%" x2="42%" y2="28%" />
              <line x1="42%" y1="28%" x2="70%" y2="22%" />
              <line x1="42%" y1="28%" x2="62%" y2="48%" />
              <line x1="62%" y1="48%" x2="52%" y2="80%" />
              <line x1="35%" y1="68%" x2="52%" y2="80%" />
              <line x1="25%" y1="38%" x2="35%" y2="68%" />
            </svg>

            {/* Interactive Agent Pins overlay */}
            {filteredNodes.map((node) => {
              const isHovered = hoveredNode?.id === node.id;
              return (
                <div
                  key={node.id}
                  style={{ top: node.top, left: node.left }}
                  className="absolute transform -translate-x-1/2 -translate-y-1/2 z-20 group cursor-pointer"
                  onMouseEnter={() => setHoveredNode(node)}
                  onMouseLeave={() => setHoveredNode(null)}
                >
                  {/* Ping Animation ring */}
                  <span 
                    className="absolute -inset-2 rounded-full opacity-60 animate-ping"
                    style={{ backgroundColor: node.color }}
                  ></span>

                  {/* Node Badge */}
                  <div 
                    className="relative w-7 h-7 rounded-[6px] border border-[#F3F3F3]/80 flex items-center justify-center shadow-lg transition-transform group-hover:scale-125"
                    style={{ backgroundColor: node.color }}
                  >
                    <Cpu className="w-3.5 h-3.5 text-[#292733]" />
                  </div>

                  {/* Tooltip Card on Hover */}
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 hidden group-hover:flex flex-col w-64 bg-[#292733] border border-[#565E75] rounded-[6px] p-3 shadow-2xl z-30 pointer-events-none">
                    <div className="flex items-center justify-between border-b border-[#565E75]/50 pb-1.5 mb-1.5">
                      <span className="font-mono-tech text-[10px] uppercase font-bold text-[#A99BC9]">
                        {node.code}
                      </span>
                      <span 
                        className="font-mono-tech text-[9px] px-1.5 py-0.5 rounded text-[#292733] font-bold"
                        style={{ backgroundColor: node.color }}
                      >
                        {node.status}
                      </span>
                    </div>
                    <p className="text-xs font-bold text-[#F3F3F3] mb-1">{node.name}</p>
                    <p className="font-mono-tech text-[10px] text-[#F3F3F3]/70">{node.data}</p>
                  </div>
                </div>
              );
            })}

            {/* Top Right Live Telemetry Bar */}
            <div className="absolute top-4 right-4 bg-[#292733]/85 backdrop-blur-md border border-[#565E75]/50 px-3.5 py-2 rounded-[6px] hidden sm:flex items-center gap-3 text-xs font-mono-tech">
              <div className="flex items-center gap-1.5">
                <Radio className="w-3.5 h-3.5 text-[#7AE04C] animate-pulse" />
                <span className="text-[#F3F3F3]">MESH: ACTIVE</span>
              </div>
              <span className="text-[#565E75]">|</span>
              <span className="text-[#E0B7C9]">PERSPECTIVES: 4 SYNCHRONIZED</span>
            </div>

            {/* Bottom Left Legend overlay */}
            <div className="absolute bottom-4 left-4 bg-[#292733]/90 backdrop-blur-md border border-[#565E75]/50 p-3 rounded-[6px] max-w-sm hidden md:block">
              <p className="font-mono-tech text-[11px] text-[#A99BC9] uppercase font-bold mb-1.5">
                // ACTIVE PERSPECTIVE DATA
              </p>
              <div className="space-y-1 font-mono-tech text-[10px] text-[#F3F3F3]/80">
                <div className="flex items-center justify-between">
                  <span>● HAZARD DETECTION:</span>
                  <span className="text-[#7AE04C] font-semibold">NOMINAL</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>● OCCUPANCY DENSITY:</span>
                  <span className="text-[#6B9FD4] font-semibold">REAL-TIME</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>● HUMAN CONTROL LINK:</span>
                  <span className="text-[#A99BC9] font-semibold">READY</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

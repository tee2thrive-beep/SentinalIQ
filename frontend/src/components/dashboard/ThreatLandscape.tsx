import React from 'react';
import { Globe, ShieldAlert } from 'lucide-react';

export const ThreatLandscape: React.FC = () => {
  return (
    <div className="p-5 cyber-card rounded-2xl border border-[#1e2438] relative overflow-hidden flex flex-col justify-between shadow-2xl font-mono">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#1e2438] pb-3 mb-3">
        <div className="flex items-center space-x-2">
          <Globe className="w-4 h-4 text-cyan-400 animate-pulse" />
          <h2 className="text-xs font-bold text-slate-100 uppercase tracking-wider">THREAT LANDSCAPE MAP</h2>
        </div>

        <span className="px-2.5 py-0.5 bg-[#050713] border border-[#1e2438] text-slate-400 rounded text-[10px] font-bold">
          Global View ∨
        </span>
      </div>

      {/* Holographic Cyber World Map Container */}
      <div className="relative h-64 w-full bg-[#050713] border border-[#1e2438] rounded-xl overflow-hidden flex items-center justify-center">
        {/* Radar Sweeper Line Animation */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
          <div className="w-96 h-96 rounded-full border border-cyan-500/30 animate-radar" style={{ background: 'conic-gradient(from 0deg at 50% 50%, rgba(6, 182, 212, 0.4) 0deg, transparent 60deg, transparent 360deg)' }}></div>
        </div>

        {/* Latitude & Longitude Cyber Grid */}
        <svg className="absolute inset-0 w-full h-full opacity-30" viewBox="0 0 800 400" fill="none">
          <line x1="0" y1="100" x2="800" y2="100" stroke="#1e2438" strokeWidth="1" strokeDasharray="4 4" />
          <line x1="0" y1="200" x2="800" y2="200" stroke="#3b82f6" strokeWidth="1" opacity="0.4" />
          <line x1="0" y1="300" x2="800" y2="300" stroke="#1e2438" strokeWidth="1" strokeDasharray="4 4" />

          <line x1="200" y1="0" x2="200" y2="400" stroke="#1e2438" strokeWidth="1" strokeDasharray="4 4" />
          <line x1="400" y1="0" x2="400" y2="400" stroke="#3b82f6" strokeWidth="1" opacity="0.4" />
          <line x1="600" y1="0" x2="600" y2="400" stroke="#1e2438" strokeWidth="1" strokeDasharray="4 4" />
        </svg>

        {/* Detailed High-Tech World Map SVG */}
        <svg className="w-full h-full relative z-10" viewBox="0 0 800 400" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="arc-red-purple" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ef4444" />
              <stop offset="50%" stopColor="#ec4899" />
              <stop offset="100%" stopColor="#a855f7" />
            </linearGradient>

            <linearGradient id="arc-cyan-red" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#06b6d4" />
              <stop offset="100%" stopColor="#ef4444" />
            </linearGradient>

            <radialGradient id="node-glow-red" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#ef4444" stopOpacity="1" />
              <stop offset="100%" stopColor="#ef4444" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* CONTINENT MAP PATHS */}
          <g fill="#1a2238" stroke="#2a365c" strokeWidth="1" opacity="0.85">
            {/* North America */}
            <path d="M 120,80 L 160,70 L 220,90 L 260,110 L 240,160 L 210,180 L 180,170 L 150,190 L 130,150 L 100,120 Z" />
            <path d="M 230,185 L 250,210 L 220,230 L 200,200 Z" />

            {/* South America */}
            <path d="M 240,240 L 280,250 L 290,290 L 260,350 L 240,360 L 230,310 L 220,270 Z" />

            {/* Europe */}
            <path d="M 400,90 L 450,85 L 470,110 L 440,140 L 410,130 L 390,110 Z" />

            {/* Africa */}
            <path d="M 400,150 L 460,145 L 490,190 L 470,260 L 430,290 L 400,240 L 390,190 Z" />

            {/* Asia */}
            <path d="M 480,80 L 580,70 L 680,90 L 720,130 L 660,180 L 600,190 L 540,170 L 490,130 Z" />
            <path d="M 620,195 L 650,210 L 630,240 L 600,220 Z" />

            {/* Australia */}
            <path d="M 650,260 L 710,250 L 730,290 L 680,320 L 640,290 Z" />
          </g>

          {/* Glowing Arc Attack Trajectories */}
          <path d="M 180,130 Q 340,30 450,110" stroke="url(#arc-red-purple)" strokeWidth="2.5" fill="none" strokeDasharray="8 4" className="animate-pulse" />
          <path d="M 660,120 Q 450,20 180,130" stroke="url(#arc-cyan-red)" strokeWidth="2" fill="none" strokeDasharray="6 3" />
          <path d="M 450,110 Q 560,180 670,280" stroke="url(#arc-red-purple)" strokeWidth="2" fill="none" />
          <path d="M 260,280 Q 360,200 450,110" stroke="url(#arc-cyan-red)" strokeWidth="1.5" fill="none" strokeDasharray="4 4" />

          {/* Interactive Attack Nodes & Target Rings */}
          {/* Node 1: North America (Attacker Origin) */}
          <circle cx="180" cy="130" r="10" fill="url(#node-glow-red)" />
          <circle cx="180" cy="130" r="4" fill="#ef4444" className="animate-ping" />
          <circle cx="180" cy="130" r="2.5" fill="#ffffff" />

          {/* Node 2: Europe (Target Asset Server) */}
          <circle cx="450" cy="110" r="12" fill="url(#node-glow-red)" />
          <circle cx="450" cy="110" r="5" fill="#ec4899" className="animate-ping" />
          <circle cx="450" cy="110" r="3" fill="#ffffff" />

          {/* Node 3: Asia */}
          <circle cx="660" cy="120" r="4" fill="#06b6d4" />
          <circle cx="660" cy="120" r="2" fill="#ffffff" />

          {/* Node 4: Australia */}
          <circle cx="670" cy="280" r="4" fill="#a855f7" />
          <circle cx="670" cy="280" r="2" fill="#ffffff" />
        </svg>

        {/* Floating Cyber Threat Popover Box */}
        <div className="absolute top-4 right-4 p-3 bg-[#0c0f1d]/95 border border-rose-500/70 rounded-xl space-y-1 text-[11px] shadow-2xl backdrop-blur-md glow-red max-w-[220px] z-20">
          <div className="flex items-center space-x-1.5 text-rose-400 font-bold">
            <ShieldAlert className="w-4 h-4 text-rose-500 animate-pulse" />
            <span>Data Exfiltration Detected</span>
          </div>
          <div className="text-slate-300 font-mono text-[10px]">
            <span>External IP: </span>
            <strong className="text-cyan-400 font-bold">185.199.108.153</strong>
          </div>
          <div className="flex items-center justify-between text-[10px]">
            <span className="text-slate-400">Location: Unknown</span>
            <span className="px-2 py-0.5 bg-rose-950 text-rose-300 border border-rose-500/50 rounded font-bold uppercase tracking-wider">
              Critical
            </span>
          </div>
        </div>
      </div>

      {/* Bottom Metric Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 pt-3 border-t border-[#1e2438] text-[11px]">
        <div className="p-2 bg-[#050713] border border-[#1e2438] rounded-lg">
          <span className="text-slate-500 block text-[9px] uppercase font-semibold">COUNTRIES</span>
          <strong className="text-slate-200 text-sm">24</strong>
        </div>

        <div className="p-2 bg-[#050713] border border-[#1e2438] rounded-lg">
          <span className="text-slate-500 block text-[9px] uppercase font-semibold">ASSETS AT RISK</span>
          <strong className="text-rose-400 text-sm">189</strong>
        </div>

        <div className="p-2 bg-[#050713] border border-[#1e2438] rounded-lg">
          <span className="text-slate-500 block text-[9px] uppercase font-semibold">USERS IMPACTED</span>
          <strong className="text-purple-400 text-sm">327</strong>
        </div>

        <div className="p-2 bg-[#050713] border border-[#1e2438] rounded-lg">
          <span className="text-slate-500 block text-[9px] uppercase font-semibold">EXFILTRATED DATA</span>
          <strong className="text-amber-400 text-sm">12 GB</strong>
        </div>
      </div>
    </div>
  );
};

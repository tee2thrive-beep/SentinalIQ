import React from 'react';
import { Globe, ShieldAlert, Server, Users, Database } from 'lucide-react';

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

      {/* Holographic Cyber Globe SVG Map Container */}
      <div className="relative h-64 w-full bg-[#050713]/90 border border-[#1e2438] rounded-xl overflow-hidden flex items-center justify-center">
        {/* Ambient Grid Lines */}
        <div className="absolute inset-0 bg-[radial-gradient(#1e2438_1px,transparent_1px)] [background-size:16px_16px] opacity-40"></div>

        {/* Global World Map Paths */}
        <svg className="w-full h-full opacity-60" viewBox="0 0 800 400" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* World Continents Outlines */}
          <path d="M150 120 C 180 110, 220 130, 250 150 C 230 180, 180 220, 140 190 Z" fill="#1e2438" stroke="#3b82f6" strokeWidth="0.5" />
          <path d="M400 100 C 450 80, 520 90, 580 120 C 560 170, 480 200, 420 160 Z" fill="#1e2438" stroke="#3b82f6" strokeWidth="0.5" />
          <path d="M600 180 C 650 160, 720 190, 750 240 C 700 280, 620 260, 580 210 Z" fill="#1e2438" stroke="#3b82f6" strokeWidth="0.5" />
          <path d="M220 250 C 260 240, 290 280, 270 330 C 240 340, 210 310, 210 280 Z" fill="#1e2438" stroke="#3b82f6" strokeWidth="0.5" />

          {/* Glowing Attack Trajectory Arcs */}
          <path d="M 220 140 Q 380 40 520 130" stroke="url(#gradient-arc-1)" strokeWidth="2" fill="none" strokeDasharray="6 4" />
          <path d="M 680 210 Q 480 80 240 160" stroke="url(#gradient-arc-2)" strokeWidth="2" fill="none" strokeDasharray="8 4" />
          <path d="M 450 110 Q 320 200 230 270" stroke="url(#gradient-arc-1)" strokeWidth="2" fill="none" />

          {/* Gradients */}
          <defs>
            <linearGradient id="gradient-arc-1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ef4444" />
              <stop offset="100%" stopColor="#a855f7" />
            </linearGradient>
            <linearGradient id="gradient-arc-2" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#06b6d4" />
              <stop offset="100%" stopColor="#ef4444" />
            </linearGradient>
          </defs>

          {/* Attack Node Pingers */}
          <circle cx="220" cy="140" r="5" fill="#ef4444" className="animate-ping" />
          <circle cx="520" cy="130" r="4" fill="#a855f7" />
          <circle cx="680" cy="210" r="4" fill="#06b6d4" />
        </svg>

        {/* Floating Threat Popover Box */}
        <div className="absolute top-6 right-8 p-3 bg-[#0c0f1d]/95 border border-rose-500/60 rounded-xl space-y-1 text-[11px] shadow-2xl backdrop-blur-md glow-red max-w-[210px]">
          <div className="flex items-center space-x-1.5 text-rose-400 font-bold">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Data Exfiltration Detected</span>
          </div>
          <div className="text-slate-300 font-mono text-[10px]">
            <span>External IP: </span>
            <strong className="text-cyan-400 font-bold">185.199.108.153</strong>
          </div>
          <div className="flex items-center justify-between text-[10px]">
            <span className="text-slate-400">Location: Unknown</span>
            <span className="px-1.5 py-0.2 bg-rose-950 text-rose-300 border border-rose-500/40 rounded font-bold">Critical</span>
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

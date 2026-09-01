import React from 'react';
import { NavLink } from 'react-router-dom';
import { Shield, LayoutDashboard, ListOrdered, Scale, SlidersHorizontal, Sliders, FileText, Activity, Radio, Cpu } from 'lucide-react';

export const Sidebar: React.FC = () => {
  const navItems = [
    { to: '/', label: 'Command Center', icon: LayoutDashboard },
    { to: '/incidents', label: 'Priority Queue', icon: ListOrdered },
    { to: '/compare', label: 'Compare Queue', icon: Scale },
    { to: '/priority-config', label: 'Edit Priority Weights', icon: SlidersHorizontal },
    { to: '/simulations', label: 'What-If Simulations', icon: Sliders },
    { to: '/reports', label: 'Reports', icon: FileText },
    { to: '/status', label: 'System Status', icon: Activity },
  ];

  return (
    <aside className="w-64 bg-[#070b15] border-r border-[#151d30] flex flex-col min-h-screen select-none font-mono relative z-20">
      {/* Brand Header */}
      <div className="p-5 border-b border-[#151d30] flex items-center space-x-3 bg-[#080d1a]/50">
        <div className="p-2.5 bg-gradient-to-br from-blue-600/30 to-purple-600/30 border border-blue-500/50 rounded-xl text-cyan-400 shadow-[0_0_15px_rgba(59,130,246,0.3)]">
          <Shield className="w-6 h-6" />
        </div>
        <div>
          <h1 className="font-mono font-extrabold text-base tracking-wider text-slate-100 flex items-center gap-1">
            Sentinel<span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400">IQ</span>
          </h1>
          <p className="text-[9px] text-slate-400 font-mono tracking-tight">Cyber Incident Prioritization Engine</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1.5 pt-4">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                `flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-purple-900/40 via-blue-900/20 to-transparent text-purple-200 border-l-2 border-purple-400 border-y border-r border-purple-500/30 shadow-[0_0_15px_rgba(168,85,247,0.15)] font-bold'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-[#0d1424] hover:border-l-2 hover:border-slate-500'
                }`
              }
            >
              <Icon className="w-4 h-4" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Bottom Live System Status Widget (Exact matches screenshot) */}
      <div className="p-4 m-3 bg-[#090e1c] border border-[#182238] rounded-2xl space-y-3 shadow-inner">
        <div>
          <div className="flex items-center justify-between text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-1">
            <span>System Status</span>
            <Radio className="w-3 h-3 text-emerald-400 animate-pulse" />
          </div>
          <div className="inline-flex items-center gap-1.5 text-xs text-emerald-400 font-bold">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            All Systems Operational
          </div>
        </div>

        {/* Live Ingestion Wave Visualizer */}
        <div className="pt-2 border-t border-[#151d30] flex items-center justify-between">
          <div>
            <span className="text-[9px] text-slate-400 uppercase block font-semibold">Live Ingestion</span>
            <strong className="text-sm font-bold text-slate-100 font-mono">2,341 <span className="text-[9px] text-slate-400 font-normal">events/min</span></strong>
          </div>
          <Cpu className="w-5 h-5 text-cyan-400/80 animate-pulse" />
        </div>

        {/* Sparkline wave */}
        <div className="h-6 w-full flex items-end justify-between gap-1 pt-1 opacity-75">
          {[40, 65, 30, 85, 45, 95, 60, 75, 40, 90, 55, 80, 100].map((h, idx) => (
            <div
              key={idx}
              style={{ height: `${h}%` }}
              className="w-1 bg-gradient-to-t from-cyan-600 to-blue-400 rounded-t-sm"
            ></div>
          ))}
        </div>

        <div className="text-[9px] text-slate-400 text-center font-mono border-t border-[#151d30] pt-2">
          SentinelIQ v2.0.0 • PS-03 Edition
        </div>
      </div>
    </aside>
  );
};

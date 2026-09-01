import React from 'react';
import { NavLink } from 'react-router-dom';
import { Shield, LayoutDashboard, AlertCircle, Share2, ListOrdered, Scale, SlidersHorizontal, Sliders, FileText, Database, Radio, Settings, Activity } from 'lucide-react';

export const Sidebar: React.FC = () => {
  const navItems = [
    { to: '/', label: 'Command Center', icon: LayoutDashboard },
    { to: '/incidents', label: 'Priority Queue', icon: ListOrdered },
    { to: '/compare', label: 'Compare Queue', icon: Scale },
    { to: '/priority-config', label: 'Edit Priority Weights', icon: SlidersHorizontal },
    { to: '/simulations', label: 'What-If Lab', icon: Sliders },
    { to: '/reports', label: 'Reports', icon: FileText },
    { to: '/status', label: 'System Status', icon: Activity },
  ];

  return (
    <aside className="w-64 bg-[#050713] border-r border-[#1e2438] flex flex-col min-h-screen select-none font-mono shadow-[4px_0_25px_rgba(5,7,19,0.8)]">
      {/* Brand Header */}
      <div className="p-5 border-b border-[#1e2438] flex items-center space-x-3">
        <div className="p-2.5 bg-purple-950/50 border border-purple-500/40 rounded-xl text-purple-400 glow-purple">
          <Shield className="w-6 h-6" />
        </div>
        <div>
          <h1 className="font-bold text-base tracking-wider text-slate-100 flex items-center gap-1">
            Sentinel<span className="text-purple-400">IQ</span>
          </h1>
          <p className="text-[10px] text-slate-500 font-mono tracking-wide">Cyber Incident Prioritization Engine</p>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 p-4 space-y-1.5">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                `flex items-center justify-between px-4 py-2.5 rounded-xl text-xs font-bold tracking-wide transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-purple-900/60 to-slate-900 text-purple-300 border border-purple-500/50 shadow-[0_0_15px_rgba(168,85,247,0.2)]'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-[#0c0f1d]'
                }`
              }
            >
              <div className="flex items-center space-x-3">
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </div>

              {item.label === 'Alerts' && (
                <span className="px-1.5 py-0.5 bg-rose-600 text-white rounded-full text-[10px] font-bold">112</span>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Bottom Ingestion Status Card */}
      <div className="p-4 border-t border-[#1e2438] bg-[#0c0f1d]/60 space-y-3">
        <div className="space-y-1">
          <div className="flex items-center justify-between text-[10px] text-slate-400 uppercase font-semibold">
            <span>System Status</span>
            <span className="inline-flex items-center gap-1 text-emerald-400 font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              All Operational
            </span>
          </div>

          {/* Mini Waveform Visualization */}
          <div className="h-6 w-full bg-[#050713] border border-[#1e2438] rounded-lg overflow-hidden flex items-end justify-between px-1 py-0.5 space-x-0.5">
            {[40, 65, 30, 85, 45, 90, 60, 75, 50, 95, 40, 70, 85, 30, 60, 90, 50, 80].map((h, idx) => (
              <div
                key={idx}
                className="w-1 bg-gradient-to-t from-blue-600 to-cyan-400 rounded-t"
                style={{ height: `${h}%` }}
              ></div>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between text-xs font-bold pt-1">
          <div>
            <span className="text-[9px] text-slate-500 block uppercase">LIVE INGESTION</span>
            <strong className="text-slate-200">2,341 <span className="text-[9px] text-slate-400 font-normal">events / min</span></strong>
          </div>
          <span className="text-[10px] text-purple-400 font-mono">v2.0.0</span>
        </div>
      </div>
    </aside>
  );
};

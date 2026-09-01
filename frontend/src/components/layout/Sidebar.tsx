import React from 'react';
import { NavLink } from 'react-router-dom';
import { Shield, LayoutDashboard, ListOrdered, Scale, SlidersHorizontal, Sliders, FileText, Activity } from 'lucide-react';

export const Sidebar: React.FC = () => {
  const navItems = [
    { to: '/', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/incidents', label: 'Priority Queue', icon: ListOrdered },
    { to: '/compare', label: 'Compare Queue', icon: Scale },
    { to: '/priority-config', label: 'Edit Priority Weights', icon: SlidersHorizontal },
    { to: '/simulations', label: 'What-If Simulations', icon: Sliders },
    { to: '/reports', label: 'Reports', icon: FileText },
    { to: '/status', label: 'System Status', icon: Activity },
  ];

  return (
    <aside className="w-64 bg-[#090d16] border-r border-[#1f293d] flex flex-col min-h-screen select-none">
      {/* Brand Header */}
      <div className="p-5 border-b border-[#1f293d] flex items-center space-x-3">
        <div className="p-2 bg-blue-600/20 border border-blue-500/40 rounded-lg text-blue-400">
          <Shield className="w-6 h-6" />
        </div>
        <div>
          <h1 className="font-mono font-bold text-base tracking-wider text-slate-100">Sentinel<span className="text-blue-400">IQ</span></h1>
          <p className="text-[10px] text-slate-400 font-mono tracking-wide">Incident Prioritization v1.0</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                `flex items-center space-x-3 px-3.5 py-2.5 rounded-lg text-xs font-semibold tracking-wide transition-all ${
                  isActive
                    ? 'bg-blue-600/15 text-blue-400 border border-blue-500/30 shadow-sm shadow-blue-950'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-[#111827]'
                }`
              }
            >
              <Icon className="w-4 h-4" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Footer Info */}
      <div className="p-4 border-t border-[#1f293d] text-[11px] text-slate-400 font-mono space-y-1">
        <div className="flex items-center justify-between">
          <span>Engine Status:</span>
          <span className="inline-flex items-center gap-1.5 text-emerald-400 font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            ACTIVE
          </span>
        </div>
        <div className="text-[10px] text-slate-400 truncate">PS-03 Hackathon Edition</div>
      </div>
    </aside>
  );
};

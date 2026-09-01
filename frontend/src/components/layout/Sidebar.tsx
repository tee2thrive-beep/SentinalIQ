import React from 'react';
import { NavLink } from 'react-router-dom';
import { Shield, LayoutDashboard, ListOrdered, Scale, SlidersHorizontal, Sliders, FileText, Activity, Radio } from 'lucide-react';

export const Sidebar: React.FC = () => {
  const menuGroups = [
    {
      title: 'MAIN WORKSPACE',
      items: [
        { to: '/', label: 'Dashboard', icon: LayoutDashboard, badge: null },
        { to: '/incidents', label: 'Priority Queue', icon: ListOrdered, badge: '111' },
      ],
    },
    {
      title: 'ANALYST TOOLS',
      items: [
        { to: '/compare', label: 'Compare Incidents', icon: Scale, badge: null },
        { to: '/priority-config', label: 'Edit Priority Weights', icon: SlidersHorizontal, badge: null },
        { to: '/simulations', label: 'What-If Simulations', icon: Sliders, badge: null },
      ],
    },
    {
      title: 'SYSTEM & REPORTS',
      items: [
        { to: '/reports', label: 'Reports & Exports', icon: FileText, badge: null },
        { to: '/status', label: 'System Status', icon: Activity, badge: 'Active' },
      ],
    },
  ];

  return (
    <aside className="w-64 bg-[#090d16] border-r border-[#1e293b] flex flex-col min-h-screen select-none font-sans relative z-20">
      {/* Brand Header */}
      <div className="p-5 border-b border-[#1e293b] flex items-center space-x-3 bg-[#0d1320]">
        <div className="p-2 bg-blue-600/20 border border-blue-500/30 rounded-lg text-blue-400">
          <Shield className="w-6 h-6" />
        </div>
        <div>
          <h1 className="font-mono font-bold text-base tracking-wider text-slate-100 flex items-center gap-1">
            Sentinel<span className="text-blue-400">IQ</span>
          </h1>
          <p className="text-[10px] text-slate-400 font-sans tracking-wide">Incident Prioritization Engine</p>
        </div>
      </div>

      {/* Structured Navigation Groups */}
      <nav className="flex-1 p-3 space-y-6 pt-4">
        {menuGroups.map((group, idx) => (
          <div key={idx} className="space-y-1">
            <h2 className="px-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest font-mono">
              {group.title}
            </h2>
            <div className="space-y-1 pt-1">
              {group.items.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.to === '/'}
                    className={({ isActive }) =>
                      `flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                        isActive
                          ? 'bg-blue-600 text-white font-semibold shadow-sm'
                          : 'text-slate-400 hover:text-slate-100 hover:bg-[#131c2e]'
                      }`
                    }
                  >
                    <div className="flex items-center space-x-2.5">
                      <Icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </div>

                    {item.badge && (
                      <span className="px-1.5 py-0.5 bg-blue-950/80 border border-blue-500/30 text-blue-300 text-[10px] font-bold font-mono rounded">
                        {item.badge}
                      </span>
                    )}
                  </NavLink>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Bottom Operational Status */}
      <div className="p-4 border-t border-[#1e293b] bg-[#0d1320] text-xs space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[11px] text-slate-400 font-mono">Engine Status:</span>
          <span className="inline-flex items-center gap-1.5 text-emerald-400 font-semibold font-mono text-[11px]">
            <Radio className="w-3 h-3 text-emerald-400 animate-pulse" />
            OPERATIONAL
          </span>
        </div>
        <p className="text-[10px] text-slate-500 font-mono">PS-03 Hackathon Edition • 111 Incidents</p>
      </div>
    </aside>
  );
};

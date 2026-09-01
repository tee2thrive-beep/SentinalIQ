import React from 'react';
import { PieChart, Activity, ShieldAlert, Flame, Gauge, Info } from 'lucide-react';

export const AttackDistribution: React.FC = () => {
  const categories = [
    { label: 'Authentication', count: 32, pct: '28.6%', color: 'bg-blue-500', text: 'text-blue-400' },
    { label: 'Endpoint', count: 28, pct: '25.0%', color: 'bg-purple-500', text: 'text-purple-400' },
    { label: 'Network', count: 24, pct: '21.4%', color: 'bg-cyan-500', text: 'text-cyan-400' },
    { label: 'Firewall', count: 18, pct: '16.1%', color: 'bg-amber-500', text: 'text-amber-400' },
    { label: 'Email', count: 10, pct: '8.9%', color: 'bg-emerald-500', text: 'text-emerald-400' },
  ];

  return (
    <div className="p-5 cyber-card rounded-2xl border border-[#1e2438] flex flex-col justify-between shadow-2xl font-mono space-y-4">
      {/* ATTACK DISTRIBUTION */}
      <div>
        <div className="flex items-center justify-between border-b border-[#1e2438] pb-2 mb-3">
          <div className="flex items-center space-x-2">
            <PieChart className="w-4 h-4 text-purple-400" />
            <h3 className="text-xs font-bold text-slate-100 uppercase tracking-wider">ATTACK DISTRIBUTION</h3>
          </div>
          <span className="text-[10px] text-slate-500">112 Total Alerts</span>
        </div>

        {/* Donut Graphic + Legend */}
        <div className="grid grid-cols-12 gap-3 items-center">
          {/* Donut Center SVG */}
          <div className="col-span-5 flex items-center justify-center relative">
            <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 36 36">
              <path strokeDasharray="28.6, 100" className="text-blue-500" strokeWidth="3.8" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
              <path strokeDasharray="25, 100" strokeDashoffset="-28.6" className="text-purple-500" strokeWidth="3.8" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
              <path strokeDasharray="21.4, 100" strokeDashoffset="-53.6" className="text-cyan-500" strokeWidth="3.8" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
              <path strokeDasharray="16.1, 100" strokeDashoffset="-75" className="text-amber-500" strokeWidth="3.8" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="text-base font-extrabold text-slate-100 leading-none">112</span>
              <span className="text-[8px] text-slate-400 font-bold uppercase">Total</span>
            </div>
          </div>

          {/* Legend Items */}
          <div className="col-span-7 space-y-1 text-[11px]">
            {categories.map((c) => (
              <div key={c.label} className="flex items-center justify-between">
                <div className="flex items-center space-x-1.5 truncate">
                  <span className={`w-2 h-2 rounded-full ${c.color}`}></span>
                  <span className="text-slate-300 font-semibold truncate">{c.label}</span>
                </div>
                <span className="font-bold text-slate-400 text-[10px]">{c.count} ({c.pct})</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* SEVERITY BREAKDOWN */}
      <div className="pt-2 border-t border-[#1e2438]">
        <div className="flex items-center justify-between pb-2 mb-2">
          <div className="flex items-center space-x-2">
            <Activity className="w-4 h-4 text-cyan-400" />
            <h3 className="text-xs font-bold text-slate-100 uppercase tracking-wider">SEVERITY BREAKDOWN</h3>
          </div>
        </div>

        {/* Waveform Bar Distribution */}
        <div className="grid grid-cols-4 gap-2 text-center text-[10px]">
          <div className="p-2 bg-rose-950/40 border border-rose-500/40 rounded-xl">
            <span className="text-rose-400 font-bold block">CRITICAL</span>
            <strong className="text-slate-100 text-sm font-extrabold">2</strong>
            <span className="text-slate-500 block text-[9px]">(1.8%)</span>
          </div>

          <div className="p-2 bg-amber-950/40 border border-amber-500/40 rounded-xl">
            <span className="text-amber-400 font-bold block">HIGH</span>
            <strong className="text-slate-100 text-sm font-extrabold">5</strong>
            <span className="text-slate-500 block text-[9px]">(4.5%)</span>
          </div>

          <div className="p-2 bg-yellow-950/40 border border-yellow-500/40 rounded-xl">
            <span className="text-yellow-400 font-bold block">MEDIUM</span>
            <strong className="text-slate-100 text-sm font-extrabold">7</strong>
            <span className="text-slate-500 block text-[9px]">(6.3%)</span>
          </div>

          <div className="p-2 bg-blue-950/40 border border-blue-500/40 rounded-xl">
            <span className="text-cyan-400 font-bold block">LOW</span>
            <strong className="text-slate-100 text-sm font-extrabold">98</strong>
            <span className="text-slate-500 block text-[9px]">(87.4%)</span>
          </div>
        </div>
      </div>
    </div>
  );
};

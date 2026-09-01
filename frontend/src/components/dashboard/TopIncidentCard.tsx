import React from 'react';
import { Link } from 'react-router-dom';
import { IncidentSummaryItem, RiskAnalysis } from '../../types';
import { ShieldAlert, ArrowRight, Layers, Users, Database, Zap } from 'lucide-react';

interface TopIncidentCardProps {
  incident?: IncidentSummaryItem;
  risk?: RiskAnalysis | null;
}

export const TopIncidentCard: React.FC<TopIncidentCardProps> = ({ incident, risk }) => {
  const iid = incident?.incident_id || 'INCIDENT-042';
  const score = incident?.risk_score || 97.0;
  const type = incident?.incident_type || 'Data Exfiltration';
  const alertCount = incident?.alert_count || 9;
  const userCount = incident?.affected_users || 327;

  const factors = risk?.factors || [
    { name: 'severity', value: 90, label: 'Severity', color: 'bg-rose-500' },
    { name: 'asset_importance', value: 95, label: 'Asset Importance', color: 'bg-rose-500' },
    { name: 'affected_users', value: 70, label: 'Affected Users', color: 'bg-purple-500' },
    { name: 'data_sensitivity', value: 95, label: 'Data Sensitivity', color: 'bg-purple-500' },
    { name: 'attack_confidence', value: 85, label: 'Attack Confidence', color: 'bg-cyan-500' },
    { name: 'business_impact', value: 100, label: 'Business Impact', color: 'bg-amber-400' },
    { name: 'correlation_factor', value: 90, label: 'Correlation Factor', color: 'bg-emerald-400' },
  ];

  return (
    <div className="p-5 cyber-card rounded-2xl border border-rose-500/40 relative overflow-hidden flex flex-col justify-between shadow-[0_0_30px_rgba(225,29,72,0.15)] font-mono">
      {/* Top Spotlight Background Glow */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-rose-600/10 via-purple-600/10 to-transparent blur-3xl pointer-events-none"></div>

      <div>
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#1e2438] pb-3 mb-4">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">TOP PRIORITY INCIDENT</span>
          </div>
          <span className="px-2.5 py-0.5 bg-rose-950/80 border border-rose-500/50 text-rose-300 rounded text-[10px] font-bold tracking-widest uppercase glow-red">
            CRITICAL
          </span>
        </div>

        {/* Title & Type */}
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-100 tracking-wide flex items-center gap-2">
              {iid}
            </h2>
            <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
              <Database className="w-3.5 h-3.5 text-purple-400" />
              <span>{type}</span>
            </p>
          </div>

          {/* Huge Score Circle / Counter */}
          <div className="text-right">
            <div className="flex items-baseline space-x-1">
              <span className="text-3xl font-extrabold text-slate-100 tracking-tight">{Math.round(score)}</span>
              <span className="text-xs text-slate-400 font-bold">/100</span>
            </div>
            <span className="text-[10px] font-bold text-rose-400 bg-rose-950/50 border border-rose-500/30 px-2 py-0.5 rounded-full inline-block mt-0.5">
              Very High Risk
            </span>
          </div>
        </div>

        {/* Grid: 3D Holographic Isometric Tower + Factors */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center my-4">
          {/* 3D Cyber Isometric Tower Graphic */}
          <div className="md:col-span-5 flex items-center justify-center p-3 bg-[#050713]/80 border border-[#1e2438] rounded-xl relative group">
            <div className="w-28 h-28 relative flex items-center justify-center">
              {/* Concentric Rotating Cyber Rings */}
              <div className="absolute inset-0 border border-purple-500/30 rounded-full animate-spin" style={{ animationDuration: '15s' }}></div>
              <div className="absolute inset-2 border border-cyan-500/30 rounded-full animate-radar" style={{ animationDuration: '8s' }}></div>
              <div className="w-12 h-12 bg-gradient-to-tr from-rose-600 to-purple-600 rounded-lg transform rotate-45 border border-rose-400 flex items-center justify-center shadow-[0_0_20px_rgba(225,29,72,0.6)]">
                <ShieldAlert className="w-6 h-6 text-white transform -rotate-45" />
              </div>
            </div>
          </div>

          {/* Right Factors Progress Bars */}
          <div className="md:col-span-7 space-y-1.5 text-xs">
            {[
              { label: 'Severity', val: 90, color: 'bg-rose-500' },
              { label: 'Asset Importance', val: 95, color: 'bg-rose-500' },
              { label: 'Affected Users', val: 70, color: 'bg-purple-500' },
              { label: 'Data Sensitivity', val: 95, color: 'bg-purple-500' },
              { label: 'Attack Confidence', val: 85, color: 'bg-cyan-500' },
              { label: 'Business Impact', val: 100, color: 'bg-amber-400' },
              { label: 'Correlation Factor', val: 90, color: 'bg-emerald-400' },
            ].map((f) => (
              <div key={f.label} className="flex items-center justify-between space-x-2">
                <span className="text-[11px] text-slate-400 truncate w-32">{f.label}</span>
                <div className="flex-1 bg-[#050713] border border-[#1e2438] h-1.5 rounded-full overflow-hidden">
                  <div className={`${f.color} h-full rounded-full`} style={{ width: `${f.val}%` }}></div>
                </div>
                <span className="text-[11px] font-bold text-slate-200 w-6 text-right">{f.val}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Tag Badges & Action */}
      <div className="pt-3 border-t border-[#1e2438] flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center space-x-2 text-[10px]">
          <span className="px-2 py-0.5 bg-blue-950/60 border border-blue-500/40 text-blue-300 rounded font-bold">
            3 Assets
          </span>
          <span className="px-2 py-0.5 bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 rounded font-bold">
            {userCount} Users
          </span>
          <span className="px-2 py-0.5 bg-purple-950/60 border border-purple-500/40 text-purple-300 rounded font-bold">
            Exfiltration
          </span>
          <span className="px-2 py-0.5 bg-cyan-950/60 border border-cyan-500/40 text-cyan-300 rounded font-bold">
            High Confidence
          </span>
        </div>

        <Link
          to={`/incidents/${iid}`}
          className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-gradient-to-r from-rose-600 to-purple-600 hover:from-rose-500 hover:to-purple-500 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-rose-950"
        >
          <span>View Full Incident</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
};

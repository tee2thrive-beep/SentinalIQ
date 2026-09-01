import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../services/api';
import { IncidentSummaryItem } from '../types';
import { PriorityQueueTable } from '../components/incidents/PriorityQueueTable';
import { Loader } from '../components/common/Loader';
import { ErrorState } from '../components/common/ErrorState';
import { 
  Flame, 
  Layers, 
  ShieldAlert, 
  AlertTriangle, 
  CheckCircle2, 
  ArrowRight, 
  TrendingUp, 
  Activity, 
  Users, 
  Globe, 
  Zap, 
  Database,
  Lock,
  Terminal,
  Crosshair
} from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [incidents, setIncidents] = useState<IncidentSummaryItem[]>([]);
  const [topIncident, setTopIncident] = useState<IncidentSummaryItem | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    async function loadDashboardData() {
      try {
        setLoading(true);
        setError(null);
        const data = await api.fetchIncidents(1, 100);
        setIncidents(data.items);
        if (data.items.length > 0) {
          setTopIncident(data.items[0]);
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load dashboard data.');
      } finally {
        setLoading(false);
      }
    }
    loadDashboardData();
  }, []);

  if (loading) return <Loader label="Initializing SentinelIQ Cyber Command Center..." />;
  if (error) return <ErrorState message={error} onRetry={() => window.location.reload()} />;

  const criticalCount = incidents.filter((i) => i.risk_level === 'CRITICAL').length;
  const highCount = incidents.filter((i) => i.risk_level === 'HIGH').length;
  const mediumCount = incidents.filter((i) => i.risk_level === 'MEDIUM').length;

  return (
    <div className="space-y-6 font-mono select-none">
      {/* 1. Top KPI Stat Cards Row (5 Stat Cards - Matching Screenshot) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        {/* Stat Card 1: Raw Alerts */}
        <div className="cyber-card p-4 rounded-2xl border border-cyan-500/30 relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Raw Alerts</span>
            <div className="p-1.5 bg-cyan-950/60 border border-cyan-500/40 rounded-lg text-cyan-400">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <strong className="text-2xl font-extrabold text-slate-100">159</strong>
            <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-0.5">
              ↑ 28% <span className="text-slate-400 font-normal">vs shift</span>
            </span>
          </div>
          {/* Sparkline wave */}
          <div className="h-4 w-full flex items-end gap-1 pt-2 opacity-60">
            {[30, 50, 40, 70, 60, 90, 80, 100].map((v, i) => (
              <div key={i} style={{ height: `${v}%` }} className="w-full bg-cyan-400 rounded-t-sm"></div>
            ))}
          </div>
        </div>

        {/* Stat Card 2: Correlated Incidents */}
        <div className="cyber-card p-4 rounded-2xl border border-purple-500/30 relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Correlated Incidents</span>
            <div className="p-1.5 bg-purple-950/60 border border-purple-500/40 rounded-lg text-purple-400">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <strong className="text-2xl font-extrabold text-slate-100">{incidents.length}</strong>
            <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-0.5">
              ↑ 12% <span className="text-slate-400 font-normal">vs shift</span>
            </span>
          </div>
          <div className="h-4 w-full flex items-end gap-1 pt-2 opacity-60">
            {[40, 30, 60, 50, 80, 70, 90, 100].map((v, i) => (
              <div key={i} style={{ height: `${v}%` }} className="w-full bg-purple-400 rounded-t-sm"></div>
            ))}
          </div>
        </div>

        {/* Stat Card 3: Critical Incidents */}
        <div className="cyber-card p-4 rounded-2xl border border-rose-500/40 relative overflow-hidden group shadow-[0_0_20px_rgba(239,68,68,0.15)]">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-rose-300 font-bold uppercase tracking-wider">Critical Incidents</span>
            <div className="p-1.5 bg-rose-950/60 border border-rose-500/50 rounded-lg text-rose-400 animate-pulse">
              <ShieldAlert className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <strong className="text-2xl font-extrabold text-rose-400">{criticalCount}</strong>
            <span className="text-[10px] text-rose-400 font-bold flex items-center gap-0.5">
              ↑ 100% <span className="text-slate-400 font-normal">vs shift</span>
            </span>
          </div>
          <div className="h-4 w-full flex items-end gap-1 pt-2 opacity-75">
            {[60, 80, 70, 90, 85, 100, 95, 100].map((v, i) => (
              <div key={i} style={{ height: `${v}%` }} className="w-full bg-rose-500 rounded-t-sm"></div>
            ))}
          </div>
        </div>

        {/* Stat Card 4: High Priority */}
        <div className="cyber-card p-4 rounded-2xl border border-amber-500/30 relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-amber-300 font-bold uppercase tracking-wider">High Priority</span>
            <div className="p-1.5 bg-amber-950/60 border border-amber-500/40 rounded-lg text-amber-400">
              <Flame className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <strong className="text-2xl font-extrabold text-amber-400">{highCount}</strong>
            <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-0.5">
              ↑ 25% <span className="text-slate-400 font-normal">vs shift</span>
            </span>
          </div>
          <div className="h-4 w-full flex items-end gap-1 pt-2 opacity-60">
            {[30, 40, 60, 50, 75, 65, 80, 85].map((v, i) => (
              <div key={i} style={{ height: `${v}%` }} className="w-full bg-amber-400 rounded-t-sm"></div>
            ))}
          </div>
        </div>

        {/* Stat Card 5: Medium Priority */}
        <div className="cyber-card p-4 rounded-2xl border border-blue-500/30 relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-blue-300 font-bold uppercase tracking-wider">Medium Priority</span>
            <div className="p-1.5 bg-blue-950/60 border border-blue-500/40 rounded-lg text-blue-400">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <strong className="text-2xl font-extrabold text-blue-300">{mediumCount}</strong>
            <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-0.5">
              ↑ 7% <span className="text-slate-400 font-normal">vs shift</span>
            </span>
          </div>
          <div className="h-4 w-full flex items-end gap-1 pt-2 opacity-60">
            {[20, 35, 40, 50, 60, 55, 70, 75].map((v, i) => (
              <div key={i} style={{ height: `${v}%` }} className="w-full bg-blue-400 rounded-t-sm"></div>
            ))}
          </div>
        </div>
      </div>

      {/* 2. Middle Row: Threat Distribution & Featured Top Priority Incident (Matching Screenshot) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left 5 Cols: Attack Category Breakdown */}
        <div className="lg:col-span-5 cyber-card p-5 rounded-2xl border border-[#151d30] space-y-4">
          <div className="flex items-center justify-between border-b border-[#151d30] pb-3">
            <h2 className="text-xs font-bold uppercase text-slate-200 tracking-wider flex items-center gap-2">
              <Crosshair className="w-4 h-4 text-cyan-400" />
              <span>Attack Category Distribution</span>
            </h2>
            <span className="text-[10px] text-slate-400 bg-[#090e1c] border border-[#182238] px-2 py-0.5 rounded font-mono">Global View</span>
          </div>

          <div className="grid grid-cols-2 gap-4 items-center">
            {/* Visual Ring Donut */}
            <div className="relative w-36 h-36 mx-auto flex items-center justify-center">
              <div className="w-36 h-36 rounded-full border-8 border-cyan-500/20 border-t-cyan-400 border-r-purple-500 border-b-rose-500 animate-spin-slow"></div>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <strong className="text-xl font-extrabold text-slate-100">159</strong>
                <span className="text-[9px] text-slate-400 uppercase tracking-widest">Total Alerts</span>
              </div>
            </div>

            {/* Category Legend list */}
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-slate-300">
                  <span className="w-2 h-2 rounded-full bg-cyan-400"></span> Authentication
                </span>
                <strong className="text-slate-100">45 <span className="text-[10px] text-slate-400">(28%)</span></strong>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-slate-300">
                  <span className="w-2 h-2 rounded-full bg-purple-400"></span> Exfiltration
                </span>
                <strong className="text-slate-100">38 <span className="text-[10px] text-slate-400">(24%)</span></strong>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-slate-300">
                  <span className="w-2 h-2 rounded-full bg-rose-400"></span> Malware
                </span>
                <strong className="text-slate-100">32 <span className="text-[10px] text-slate-400">(20%)</span></strong>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-slate-300">
                  <span className="w-2 h-2 rounded-full bg-amber-400"></span> Phishing
                </span>
                <strong className="text-slate-100">24 <span className="text-[10px] text-slate-400">(15%)</span></strong>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-slate-300">
                  <span className="w-2 h-2 rounded-full bg-emerald-400"></span> Network / DDoS
                </span>
                <strong className="text-slate-100">20 <span className="text-[10px] text-slate-400">(13%)</span></strong>
              </div>
            </div>
          </div>

          {/* Bottom Footprint metrics */}
          <div className="pt-3 border-t border-[#151d30] grid grid-cols-4 gap-2 text-center text-xs">
            <div className="p-2 bg-[#090e1c] rounded-xl border border-[#182238]">
              <span className="text-xs font-bold text-cyan-400 block">35</span>
              <span className="text-[9px] text-slate-400 uppercase block">Assets</span>
            </div>
            <div className="p-2 bg-[#090e1c] rounded-xl border border-[#182238]">
              <span className="text-xs font-bold text-purple-400 block">55</span>
              <span className="text-[9px] text-slate-400 uppercase block">Users</span>
            </div>
            <div className="p-2 bg-[#090e1c] rounded-xl border border-[#182238]">
              <span className="text-xs font-bold text-rose-400 block">8</span>
              <span className="text-[9px] text-slate-400 uppercase block">Campaigns</span>
            </div>
            <div className="p-2 bg-[#090e1c] rounded-xl border border-[#182238]">
              <span className="text-xs font-bold text-emerald-400 block">12 GB</span>
              <span className="text-[9px] text-slate-400 uppercase block">Exfiltrated</span>
            </div>
          </div>
        </div>

        {/* Right 7 Cols: TOP PRIORITY INCIDENT Hero Card (Matching Screenshot) */}
        {topIncident && (
          <div className="lg:col-span-7 cyber-card p-5 rounded-2xl border border-rose-500/40 relative overflow-hidden space-y-4 shadow-[0_0_30px_rgba(239,68,68,0.15)]">
            <div className="flex items-center justify-between border-b border-[#151d30] pb-3">
              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold uppercase text-slate-400 tracking-wider">TOP PRIORITY INCIDENT</span>
                <span className="px-2 py-0.5 bg-rose-950/80 border border-rose-500/60 text-rose-300 text-[10px] font-bold rounded">
                  RANK #1
                </span>
              </div>
              <span className="px-2 py-0.5 bg-rose-600 text-white font-bold text-[10px] rounded tracking-widest uppercase">
                {topIncident.risk_level}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
              {/* Left Column: ID, Score & Gauge */}
              <div className="md:col-span-5 space-y-3 text-center md:text-left">
                <div>
                  <h3 className="text-xl font-extrabold text-slate-100 flex items-center gap-2">
                    <span>{topIncident.incident_id}</span>
                  </h3>
                  <p className="text-xs text-slate-300 font-bold mt-0.5">{topIncident.incident_type}</p>
                </div>

                {/* Score Circle Display */}
                <div className="p-4 bg-[#090e1c] border border-rose-500/40 rounded-2xl inline-block text-center shadow-[0_0_20px_rgba(239,68,68,0.2)]">
                  <div className="text-3xl font-extrabold text-rose-400 font-mono">
                    {topIncident.risk_score.toFixed(1)} <span className="text-sm font-normal text-slate-400">/ 100</span>
                  </div>
                  <span className="text-[10px] text-rose-300 uppercase tracking-widest font-bold block mt-1">
                    Very High Risk
                  </span>
                </div>

                <div className="flex flex-wrap gap-1.5 pt-1">
                  <span className="px-2 py-1 bg-[#090e1c] border border-[#182238] text-[10px] text-cyan-300 rounded-lg">
                    {topIncident.alert_count} Correlated Alerts
                  </span>
                  <span className="px-2 py-1 bg-[#090e1c] border border-[#182238] text-[10px] text-purple-300 rounded-lg">
                    {topIncident.affected_users} Affected Users
                  </span>
                </div>
              </div>

              {/* Right Column: 6 Factor Scoring Bars (Exact Color Code from Screenshot) */}
              <div className="md:col-span-7 space-y-2 text-xs">
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] font-bold">
                    <span className="text-slate-300">Alert Severity (25%)</span>
                    <span className="text-rose-400 font-mono">90.0</span>
                  </div>
                  <div className="h-2 bg-[#090e1c] border border-[#182238] rounded-full overflow-hidden">
                    <div className="bg-rose-500 h-full rounded-full" style={{ width: '90%' }}></div>
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] font-bold">
                    <span className="text-slate-300">Asset Importance (20%)</span>
                    <span className="text-rose-400 font-mono">95.0</span>
                  </div>
                  <div className="h-2 bg-[#090e1c] border border-[#182238] rounded-full overflow-hidden">
                    <div className="bg-rose-500 h-full rounded-full" style={{ width: '95%' }}></div>
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] font-bold">
                    <span className="text-slate-300">Affected Users (15%)</span>
                    <span className="text-purple-400 font-mono">70.0</span>
                  </div>
                  <div className="h-2 bg-[#090e1c] border border-[#182238] rounded-full overflow-hidden">
                    <div className="bg-purple-500 h-full rounded-full" style={{ width: '70%' }}></div>
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] font-bold">
                    <span className="text-slate-300">Data Sensitivity (15%)</span>
                    <span className="text-purple-400 font-mono">95.0</span>
                  </div>
                  <div className="h-2 bg-[#090e1c] border border-[#182238] rounded-full overflow-hidden">
                    <div className="bg-purple-500 h-full rounded-full" style={{ width: '95%' }}></div>
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] font-bold">
                    <span className="text-slate-300">Attack Confidence (15%)</span>
                    <span className="text-cyan-400 font-mono">85.0</span>
                  </div>
                  <div className="h-2 bg-[#090e1c] border border-[#182238] rounded-full overflow-hidden">
                    <div className="bg-cyan-500 h-full rounded-full" style={{ width: '85%' }}></div>
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] font-bold">
                    <span className="text-slate-300">Business Impact (10%)</span>
                    <span className="text-amber-400 font-mono">100.0</span>
                  </div>
                  <div className="h-2 bg-[#090e1c] border border-[#182238] rounded-full overflow-hidden">
                    <div className="bg-amber-400 h-full rounded-full" style={{ width: '100%' }}></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Action */}
            <div className="pt-3 border-t border-[#151d30] flex items-center justify-between">
              <span className="text-xs text-slate-400">Main Drivers: <strong className="text-rose-300 font-bold">{topIncident.dominant_factors.join(', ')}</strong></span>
              <button
                onClick={() => navigate(`/incidents/${topIncident.incident_id}`)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold transition-all shadow-lg"
              >
                <span>View Full Investigation Report</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 3. Attack Progression Timeline Widget for Top Incident (Matching Screenshot) */}
      <div className="cyber-card p-5 rounded-2xl border border-[#151d30] space-y-3">
        <div className="flex items-center justify-between border-b border-[#151d30] pb-2">
          <h3 className="text-xs font-bold uppercase text-slate-200 tracking-wider flex items-center gap-2">
            <Activity className="w-4 h-4 text-purple-400" />
            <span>Attack Progression Timeline — {topIncident?.incident_id || 'INC-0021'}</span>
          </h3>
          <span className="text-[10px] text-purple-400 bg-purple-950/50 border border-purple-500/30 px-2 py-0.5 rounded font-bold">
            6 Stage Progression
          </span>
        </div>

        {/* Timeline Node Chain */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-2">
          <div className="p-3 bg-[#090e1c] border border-blue-500/40 rounded-xl space-y-1 relative">
            <span className="text-[9px] text-blue-400 block font-bold">STAGE 1 • 02:13:07 AM</span>
            <strong className="text-xs text-slate-100 block">Initial Access</strong>
            <p className="text-[10px] text-slate-400 leading-tight">Phishing email link execution from external IP</p>
          </div>

          <div className="p-3 bg-[#090e1c] border border-purple-500/40 rounded-xl space-y-1 relative">
            <span className="text-[9px] text-purple-400 block font-bold">STAGE 2 • 02:13:12 AM</span>
            <strong className="text-xs text-slate-100 block">Privilege Escalation</strong>
            <p className="text-[10px] text-slate-400 leading-tight">Abnormal admin credential escalation</p>
          </div>

          <div className="p-3 bg-[#090e1c] border border-purple-500/40 rounded-xl space-y-1 relative">
            <span className="text-[9px] text-purple-400 block font-bold">STAGE 3 • 02:13:16 AM</span>
            <strong className="text-xs text-slate-100 block">Execution</strong>
            <p className="text-[10px] text-slate-400 leading-tight">Malware payload execution on payment domain</p>
          </div>

          <div className="p-3 bg-[#090e1c] border border-cyan-500/40 rounded-xl space-y-1 relative">
            <span className="text-[9px] text-cyan-400 block font-bold">STAGE 4 • 02:13:21 AM</span>
            <strong className="text-xs text-slate-100 block">Lateral Movement</strong>
            <p className="text-[10px] text-slate-400 leading-tight">SSH pivot to payment-gateway AST-0001</p>
          </div>

          <div className="p-3 bg-[#090e1c] border border-amber-500/40 rounded-xl space-y-1 relative">
            <span className="text-[9px] text-amber-400 block font-bold">STAGE 5 • 02:13:27 AM</span>
            <strong className="text-xs text-slate-100 block">Collection</strong>
            <p className="text-[10px] text-slate-400 leading-tight">Staging cardholder database data</p>
          </div>

          <div className="p-3 bg-rose-950/40 border border-rose-500/60 rounded-xl space-y-1 relative shadow-[0_0_15px_rgba(239,68,68,0.2)]">
            <span className="text-[9px] text-rose-400 block font-bold">STAGE 6 • 02:13:34 AM</span>
            <strong className="text-xs text-rose-200 block">Exfiltration</strong>
            <p className="text-[10px] text-rose-300/80 leading-tight">Outbound TLS exfiltration of 12 GB</p>
          </div>
        </div>
      </div>

      {/* 4. Priority Queue Main Table */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-100 tracking-wider flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-blue-400" />
            <span>Deterministic Priority Queue ({incidents.length} Incidents)</span>
          </h2>
          <Link to="/incidents" className="text-xs text-blue-400 hover:underline flex items-center gap-1">
            View All Incidents <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <PriorityQueueTable items={incidents.slice(0, 10)} />
      </div>
    </div>
  );
};

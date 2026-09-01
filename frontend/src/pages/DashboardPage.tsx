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
  ArrowRight, 
  Scale,
  SlidersHorizontal,
  Sliders,
  FileText,
  PlusCircle,
  Compass
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

  if (loading) return <Loader label="Loading SentinelIQ SOC Command Center..." />;
  if (error) return <ErrorState message={error} onRetry={() => window.location.reload()} />;

  const criticalCount = incidents.filter((i) => i.risk_level === 'CRITICAL').length;
  const highCount = incidents.filter((i) => i.risk_level === 'HIGH').length;
  const mediumCount = incidents.filter((i) => i.risk_level === 'MEDIUM').length;

  return (
    <div className="space-y-6 font-sans select-none">
      {/* 1. Quick Feature Navigator Box (Easy Sitemap Navigation) */}
      <div className="bg-[#111726] border border-[#1e293b] p-5 rounded-xl space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase text-slate-400 font-mono tracking-wider flex items-center gap-2">
            <Compass className="w-4 h-4 text-blue-400" />
            <span>Feature Quick Navigator — Explore All Tools</span>
          </h2>
          <span className="text-[11px] text-slate-500 font-mono">PS-03 Hackathon Toolkit</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Link
            to="/incidents"
            className="p-3 bg-[#0d1320] hover:bg-[#162032] border border-[#1e293b] hover:border-blue-500/50 rounded-xl transition-all group"
          >
            <div className="flex items-center space-x-2 text-blue-400 font-semibold text-xs font-mono">
              <Layers className="w-4 h-4" />
              <span>Priority Queue</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">View & triage all 111 incidents</p>
          </Link>

          <Link
            to="/compare"
            className="p-3 bg-[#0d1320] hover:bg-[#162032] border border-[#1e293b] hover:border-purple-500/50 rounded-xl transition-all group"
          >
            <div className="flex items-center space-x-2 text-purple-400 font-semibold text-xs font-mono">
              <Scale className="w-4 h-4" />
              <span>Compare Incidents</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Justify why Incident A outranks B</p>
          </Link>

          <Link
            to="/priority-config"
            className="p-3 bg-[#0d1320] hover:bg-[#162032] border border-[#1e293b] hover:border-cyan-500/50 rounded-xl transition-all group"
          >
            <div className="flex items-center space-x-2 text-cyan-400 font-semibold text-xs font-mono">
              <SlidersHorizontal className="w-4 h-4" />
              <span>Edit Weights</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Re-weight 6 factors live</p>
          </Link>

          <Link
            to="/simulations"
            className="p-3 bg-[#0d1320] hover:bg-[#162032] border border-[#1e293b] hover:border-amber-500/50 rounded-xl transition-all group"
          >
            <div className="flex items-center space-x-2 text-amber-400 font-semibold text-xs font-mono">
              <Sliders className="w-4 h-4" />
              <span>What-If Simulations</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Test 4 scenario weight profiles</p>
          </Link>
        </div>
      </div>

      {/* 2. Top KPI Metrics (4 Clean Metric Cards) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 font-mono">
        <div className="bg-[#111726] border border-[#1e293b] p-4 rounded-xl">
          <span className="text-[11px] text-slate-400 font-semibold block">TOTAL INCIDENT QUEUE</span>
          <strong className="text-2xl font-bold text-blue-400 block mt-1">{incidents.length}</strong>
        </div>

        <div className="bg-[#111726] border border-rose-500/30 p-4 rounded-xl">
          <span className="text-[11px] text-rose-300 font-semibold block">CRITICAL RISK INCIDENTS</span>
          <strong className="text-2xl font-bold text-rose-400 block mt-1">{criticalCount}</strong>
        </div>

        <div className="bg-[#111726] border border-amber-500/30 p-4 rounded-xl">
          <span className="text-[11px] text-amber-300 font-semibold block">HIGH RISK INCIDENTS</span>
          <strong className="text-2xl font-bold text-amber-400 block mt-1">{highCount}</strong>
        </div>

        <div className="bg-[#111726] border border-blue-500/30 p-4 rounded-xl">
          <span className="text-[11px] text-blue-300 font-semibold block">MEDIUM RISK INCIDENTS</span>
          <strong className="text-2xl font-bold text-blue-300 block mt-1">{mediumCount}</strong>
        </div>
      </div>

      {/* 3. Featured Rank #1 Incident Summary */}
      {topIncident && (
        <div className="bg-[#111726] border border-rose-500/40 p-5 rounded-xl space-y-4">
          <div className="flex items-center justify-between border-b border-[#1e293b] pb-3">
            <div className="flex items-center space-x-2 font-mono">
              <span className="px-2 py-0.5 bg-rose-600 text-white font-bold text-xs rounded">
                RANK #1
              </span>
              <h2 className="text-base font-bold text-slate-100">{topIncident.incident_id}</h2>
              <span className="px-2 py-0.5 bg-rose-950 text-rose-300 border border-rose-500/40 text-[11px] font-bold rounded">
                {topIncident.risk_level}
              </span>
            </div>

            <button
              onClick={() => navigate(`/incidents/${topIncident.incident_id}`)}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-semibold transition-colors shadow-sm"
            >
              <span>Investigate Incident</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
            <div className="md:col-span-4 space-y-2">
              <h3 className="text-sm font-bold text-slate-200">{topIncident.incident_type}</h3>
              <div className="text-3xl font-extrabold text-rose-400 font-mono">
                {topIncident.risk_score.toFixed(1)} <span className="text-xs text-slate-400 font-normal">/ 100</span>
              </div>
              <p className="text-xs text-slate-400">
                Correlates <strong className="text-slate-200">{topIncident.alert_count} raw alerts</strong> across system assets.
              </p>
            </div>

            <div className="md:col-span-8 grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs font-mono">
              <div className="p-2.5 bg-[#0d1320] border border-[#1e293b] rounded-lg">
                <span className="text-[10px] text-slate-400 block">Severity (25%)</span>
                <strong className="text-rose-400">90.0 / 100</strong>
              </div>

              <div className="p-2.5 bg-[#0d1320] border border-[#1e293b] rounded-lg">
                <span className="text-[10px] text-slate-400 block">Asset Value (20%)</span>
                <strong className="text-rose-400">95.0 / 100</strong>
              </div>

              <div className="p-2.5 bg-[#0d1320] border border-[#1e293b] rounded-lg">
                <span className="text-[10px] text-slate-400 block">Affected Users (15%)</span>
                <strong className="text-purple-400">70.0 / 100</strong>
              </div>

              <div className="p-2.5 bg-[#0d1320] border border-[#1e293b] rounded-lg">
                <span className="text-[10px] text-slate-400 block">Data Sensitivity (15%)</span>
                <strong className="text-purple-400">95.0 / 100</strong>
              </div>

              <div className="p-2.5 bg-[#0d1320] border border-[#1e293b] rounded-lg">
                <span className="text-[10px] text-slate-400 block">Attack Confidence (15%)</span>
                <strong className="text-cyan-400">85.0 / 100</strong>
              </div>

              <div className="p-2.5 bg-[#0d1320] border border-[#1e293b] rounded-lg">
                <span className="text-[10px] text-slate-400 block">Business Impact (10%)</span>
                <strong className="text-amber-400">100.0 / 100</strong>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. Main Priority Investigation Queue Table */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-100 tracking-wide font-mono flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-blue-400" />
            <span>Prioritized Investigation Queue (Top 10 Incidents)</span>
          </h2>
          <Link to="/incidents" className="text-xs text-blue-400 hover:underline flex items-center gap-1 font-mono">
            View All 111 Incidents <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <PriorityQueueTable items={incidents.slice(0, 10)} />
      </div>
    </div>
  );
};

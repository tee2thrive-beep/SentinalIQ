import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { IncidentSummaryItem, RiskAnalysis } from '../types';
import { TopIncidentCard } from '../components/dashboard/TopIncidentCard';
import { ThreatLandscape } from '../components/dashboard/ThreatLandscape';
import { AttackDistribution } from '../components/dashboard/AttackDistribution';
import { LiveAlertStream } from '../components/dashboard/LiveAlertStream';
import { AttackTimelineStream } from '../components/dashboard/AttackTimelineStream';
import { PriorityQueueTable } from '../components/incidents/PriorityQueueTable';
import { Loader } from '../components/common/Loader';
import { ErrorState } from '../components/common/ErrorState';
import { AlertCircle, Shield, Flame, Gauge, Activity, Radio, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export const DashboardPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [queueItems, setQueueItems] = useState<IncidentSummaryItem[]>([]);
  const [topRisk, setTopRisk] = useState<RiskAnalysis | null>(null);

  useEffect(() => {
    async function loadDashboard() {
      try {
        setLoading(true);
        setError(null);
        const data = await api.fetchIncidents(1, 10);
        setQueueItems(data.items);

        if (data.items.length > 0) {
          const riskData = await api.fetchIncidentRisk(data.items[0].incident_id).catch(() => null);
          setTopRisk(riskData);
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load dashboard data.');
      } finally {
        setLoading(false);
      }
    }
    loadDashboard();
  }, []);

  if (loading) return <Loader label="Initializing Command Center AI Pipeline..." />;
  if (error) return <ErrorState message={error} onRetry={() => window.location.reload()} />;

  const topIncident = queueItems[0];

  return (
    <div className="space-y-6 font-mono">
      {/* Top 5 Metric Cards Row */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {/* 1. RAW ALERTS */}
        <div className="p-4 cyber-card rounded-2xl border border-blue-500/30 flex items-center justify-between shadow-lg">
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-semibold block">RAW ALERTS</span>
            <strong className="text-2xl font-extrabold text-slate-100">112</strong>
            <span className="text-[10px] text-emerald-400 font-bold block mt-0.5">↑ 28% vs last hour</span>
          </div>
          <div className="p-2 bg-blue-950/50 border border-blue-500/40 rounded-xl text-blue-400 glow-blue">
            <Radio className="w-5 h-5 animate-pulse" />
          </div>
        </div>

        {/* 2. CORRELATED INCIDENTS */}
        <div className="p-4 cyber-card rounded-2xl border border-purple-500/30 flex items-center justify-between shadow-lg">
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-semibold block">CORRELATED INCIDENTS</span>
            <strong className="text-2xl font-extrabold text-slate-100">14</strong>
            <span className="text-[10px] text-emerald-400 font-bold block mt-0.5">↑ 12% vs last hour</span>
          </div>
          <div className="p-2 bg-purple-950/50 border border-purple-500/40 rounded-xl text-purple-400 glow-purple">
            <Activity className="w-5 h-5" />
          </div>
        </div>

        {/* 3. CRITICAL INCIDENTS */}
        <div className="p-4 cyber-card rounded-2xl border border-rose-500/40 flex items-center justify-between shadow-lg">
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-semibold block">CRITICAL INCIDENTS</span>
            <strong className="text-2xl font-extrabold text-rose-400">2</strong>
            <span className="text-[10px] text-rose-400 font-bold block mt-0.5">↑ 100% vs last hour</span>
          </div>
          <div className="p-2 bg-rose-950/50 border border-rose-500/40 rounded-xl text-rose-400 glow-red">
            <Shield className="w-5 h-5" />
          </div>
        </div>

        {/* 4. HIGH PRIORITY */}
        <div className="p-4 cyber-card rounded-2xl border border-amber-500/30 flex items-center justify-between shadow-lg">
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-semibold block">HIGH PRIORITY</span>
            <strong className="text-2xl font-extrabold text-amber-400">5</strong>
            <span className="text-[10px] text-emerald-400 font-bold block mt-0.5">↑ 25% vs last hour</span>
          </div>
          <div className="p-2 bg-amber-950/50 border border-amber-500/40 rounded-xl text-amber-400">
            <Flame className="w-5 h-5" />
          </div>
        </div>

        {/* 5. MEDIUM PRIORITY */}
        <div className="p-4 cyber-card rounded-2xl border border-yellow-500/30 flex items-center justify-between shadow-lg">
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-semibold block">MEDIUM PRIORITY</span>
            <strong className="text-2xl font-extrabold text-yellow-400">7</strong>
            <span className="text-[10px] text-emerald-400 font-bold block mt-0.5">↑ 7% vs last hour</span>
          </div>
          <div className="p-2 bg-yellow-950/50 border border-yellow-500/40 rounded-xl text-yellow-400">
            <Gauge className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Middle Section: Threat Map (4) | Attack Dist (3) | Top Priority Incident (5) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <div className="lg:col-span-4">
          <ThreatLandscape />
        </div>

        <div className="lg:col-span-3">
          <AttackDistribution />
        </div>

        <div className="lg:col-span-5">
          <TopIncidentCard incident={topIncident} risk={topRisk} />
        </div>
      </div>

      {/* Bottom Section: Priority Queue (7) | Live Alert Stream (5) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <div className="lg:col-span-7 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-100 uppercase tracking-wider flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
              <span>INVESTIGATION PRIORITY QUEUE (TOP 5)</span>
            </h3>
            <Link to="/incidents" className="text-xs text-purple-400 hover:underline flex items-center gap-1">
              View All Queue <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <PriorityQueueTable items={queueItems.slice(0, 5)} />
        </div>

        <div className="lg:col-span-5">
          <LiveAlertStream />
        </div>
      </div>

      {/* Full-width Horizontal Attack Timeline */}
      <AttackTimelineStream />
    </div>
  );
};

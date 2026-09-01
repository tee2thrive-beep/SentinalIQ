import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { IncidentSummaryItem } from '../types';
import { PriorityQueueTable } from '../components/incidents/PriorityQueueTable';
import { Loader } from '../components/common/Loader';
import { ErrorState } from '../components/common/ErrorState';
import { ListOrdered, Filter, Search, ChevronLeft, ChevronRight, ShieldAlert, Sparkles, SlidersHorizontal } from 'lucide-react';
import { Link } from 'react-router-dom';

export const PriorityQueuePage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [incidents, setIncidents] = useState<IncidentSummaryItem[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // Filters & Pagination State
  const [page, setPage] = useState(1);
  const [pageSize] = useState(15);
  const [riskFilter, setRiskFilter] = useState('ALL');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const loadQueue = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.fetchIncidents(page, pageSize, riskFilter, typeFilter);
      setIncidents(data.items);
      setTotal(data.total);
      setTotalPages(data.total_pages);
    } catch (err: any) {
      setError(err.message || 'Failed to load priority queue.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadQueue();
  }, [page, riskFilter, typeFilter]);

  const filteredIncidents = incidents.filter((item) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      item.incident_id.toLowerCase().includes(q) ||
      item.incident_type.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6 font-mono">
      {/* Header Banner */}
      <div className="cyber-card p-5 rounded-2xl border border-blue-500/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-blue-950/60 border border-blue-500/40 rounded-xl text-cyan-400">
            <ListOrdered className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-100 flex items-center gap-2">
              <span>Investigation Priority Queue</span>
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Ranked deterministically by 6-Factor Risk Score DESC & 8-Level Tie-Breaker Hierarchy
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <Link
            to="/compare"
            className="px-3.5 py-2 bg-purple-950/40 hover:bg-purple-900/50 text-purple-300 border border-purple-500/40 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
          >
            <span>Compare Queue</span>
          </Link>
          <Link
            to="/priority-config"
            className="px-3.5 py-2 bg-blue-950/40 hover:bg-blue-900/50 text-blue-300 border border-blue-500/40 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span>Edit Weights</span>
          </Link>
        </div>
      </div>

      {/* Filter Tabs & Live Search Bar */}
      <div className="cyber-card p-4 rounded-2xl border border-[#151d30] flex flex-col lg:flex-row items-center justify-between gap-4">
        {/* Risk Level Pills */}
        <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
          {['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].map((level) => {
            const isActive = riskFilter === level;
            return (
              <button
                key={level}
                onClick={() => { setRiskFilter(level); setPage(1); }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  isActive
                    ? level === 'CRITICAL' ? 'bg-rose-600 text-white shadow-[0_0_15px_rgba(239,68,68,0.4)]'
                    : level === 'HIGH' ? 'bg-amber-600 text-white shadow-[0_0_15px_rgba(245,158,11,0.4)]'
                    : level === 'MEDIUM' ? 'bg-blue-600 text-white shadow-[0_0_15px_rgba(59,130,246,0.4)]'
                    : 'bg-purple-600 text-white shadow-[0_0_15px_rgba(168,85,247,0.4)]'
                    : 'bg-[#090e1c] text-slate-400 hover:text-slate-200 border border-[#182238]'
                }`}
              >
                {level === 'ALL' ? 'ALL LEVELS' : level}
              </button>
            );
          })}
        </div>

        {/* Live Filter Search Input */}
        <div className="relative w-full lg:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filter by ID or Attack Type..."
            className="w-full bg-[#090e1c] border border-[#182238] rounded-xl pl-9 pr-4 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500/60 font-mono transition-all"
          />
        </div>
      </div>

      {/* Main Table View */}
      {loading ? (
        <Loader label="Loading priority investigation queue..." />
      ) : error ? (
        <ErrorState message={error} onRetry={loadQueue} />
      ) : (
        <div className="space-y-4">
          <PriorityQueueTable items={filteredIncidents} />

          {/* Pagination Footer */}
          <div className="cyber-card p-4 rounded-2xl border border-[#151d30] flex items-center justify-between text-xs">
            <span className="text-slate-400">
              Showing Page <strong className="text-slate-100 font-bold">{page}</strong> of <strong className="text-slate-100 font-bold">{totalPages}</strong> ({total} Total Incidents)
            </span>

            <div className="flex items-center space-x-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="p-2 bg-[#090e1c] border border-[#182238] rounded-xl hover:bg-[#111827] disabled:opacity-40 transition-colors"
              >
                <ChevronLeft className="w-4 h-4 text-slate-300" />
              </button>

              <span className="px-3 py-1 bg-blue-950/60 border border-blue-500/40 text-blue-300 rounded-xl font-bold">
                {page} / {totalPages}
              </span>

              <button
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="p-2 bg-[#090e1c] border border-[#182238] rounded-xl hover:bg-[#111827] disabled:opacity-40 transition-colors"
              >
                <ChevronRight className="w-4 h-4 text-slate-300" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

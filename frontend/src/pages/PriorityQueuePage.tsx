import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { IncidentSummaryItem } from '../types';
import { PriorityQueueTable } from '../components/incidents/PriorityQueueTable';
import { Loader } from '../components/common/Loader';
import { ErrorState } from '../components/common/ErrorState';
import { ListOrdered, Filter, Search, ChevronLeft, ChevronRight } from 'lucide-react';

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

  // Client-side search filtering if query typed
  const filteredIncidents = incidents.filter(item => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      item.incident_id.toLowerCase().includes(q) ||
      item.incident_type.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#111827] border border-[#1f293d] p-5 rounded-xl">
        <div>
          <div className="flex items-center space-x-2">
            <ListOrdered className="w-5 h-5 text-blue-400" />
            <h1 className="text-lg font-bold text-slate-100 font-mono tracking-wide">Investigation Priority Queue</h1>
          </div>
          <p className="text-xs text-slate-400 font-mono mt-1">
            Ordered deterministically by Risk Score DESC & 8-Level Tie-Breaker Hierarchy.
          </p>
        </div>
        <div className="text-right font-mono">
          <span className="text-xs text-slate-400">Total Queue Count:</span>
          <div className="text-2xl font-bold text-blue-400">{total} Incidents</div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-[#111827] border border-[#1f293d] p-4 rounded-xl">
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          {/* Risk Level Filter */}
          <div className="flex items-center space-x-2 text-xs font-mono text-slate-400">
            <Filter className="w-4 h-4 text-slate-500" />
            <span>Risk Level:</span>
            <select
              value={riskFilter}
              onChange={(e) => { setRiskFilter(e.target.value); setPage(1); }}
              className="bg-[#0f172a] border border-[#1f293d] text-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-blue-500/60 font-semibold"
            >
              <option value="ALL">ALL LEVELS</option>
              <option value="CRITICAL">CRITICAL</option>
              <option value="HIGH">HIGH</option>
              <option value="MEDIUM">MEDIUM</option>
              <option value="LOW">LOW</option>
            </select>
          </div>

          {/* Incident Type Filter */}
          <div className="flex items-center space-x-2 text-xs font-mono text-slate-400">
            <span>Type:</span>
            <select
              value={typeFilter}
              onChange={(e) => { setTypeFilter(e.target.value); setPage(1); }}
              className="bg-[#0f172a] border border-[#1f293d] text-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-blue-500/60 font-semibold"
            >
              <option value="ALL">ALL TYPES</option>
              <option value="Multi-stage">Multi-stage Attack</option>
              <option value="Data Exfiltration">Data Exfiltration</option>
              <option value="Ransomware">Ransomware Outbreak</option>
              <option value="DDoS">DDoS Attack</option>
              <option value="Malware">Malware Infection</option>
              <option value="Brute Force">Brute Force Attack</option>
              <option value="Phishing">Phishing Campaign</option>
              <option value="Unauthorized">Unauthorized Access</option>
            </select>
          </div>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search ID or type..."
            className="w-full bg-[#0f172a] border border-[#1f293d] rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500/60 font-mono"
          />
        </div>
      </div>

      {/* Main Priority Queue Table */}
      {loading ? (
        <Loader label="Loading priority queue items..." />
      ) : error ? (
        <ErrorState message={error} onRetry={loadQueue} />
      ) : (
        <>
          <PriorityQueueTable items={filteredIncidents} />

          {/* Pagination */}
          <div className="flex items-center justify-between bg-[#111827] border border-[#1f293d] p-4 rounded-xl font-mono text-xs text-slate-400">
            <div>
              Showing page <strong className="text-slate-200">{page}</strong> of <strong className="text-slate-200">{totalPages}</strong> ({total} total items)
            </div>
            <div className="flex items-center space-x-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage(p => p - 1)}
                className="inline-flex items-center gap-1 px-3 py-1.5 bg-[#0f172a] border border-[#1f293d] hover:bg-[#1e293b] disabled:opacity-40 disabled:cursor-not-allowed rounded-lg font-semibold text-slate-300 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
                Previous
              </button>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage(p => p + 1)}
                className="inline-flex items-center gap-1 px-3 py-1.5 bg-[#0f172a] border border-[#1f293d] hover:bg-[#1e293b] disabled:opacity-40 disabled:cursor-not-allowed rounded-lg font-semibold text-slate-300 transition-colors"
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

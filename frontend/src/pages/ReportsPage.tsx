import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { IncidentReport } from '../types';
import { Loader } from '../components/common/Loader';
import { ErrorState } from '../components/common/ErrorState';
import { RiskBadge } from '../components/common/RiskBadge';
import { FileText, Search, Code, Eye, X } from 'lucide-react';

interface ReportIndexItem {
  incident_id: string;
  incident_type: string;
  risk_score: number;
  risk_level: string;
  priority_rank: number;
  report_path_json: string;
  report_path_md: string;
}

export const ReportsPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reportsIndex, setReportsIndex] = useState<ReportIndexItem[]>([]);
  const [search, setSearch] = useState('');
  const [selectedReport, setSelectedReport] = useState<IncidentReport | null>(null);
  const [viewMode, setViewMode] = useState<'json' | 'summary'>('summary');
  const [fetchingReport, setFetchingReport] = useState(false);

  const loadReportsIndex = async () => {
    try {
      setLoading(true);
      setError(null);
      // Fetch incidents queue as report index
      const data = await api.fetchIncidents(1, 100);
      const items: ReportIndexItem[] = data.items.map(item => ({
        incident_id: item.incident_id,
        incident_type: item.incident_type,
        risk_score: item.risk_score,
        risk_level: item.risk_level,
        priority_rank: item.priority_rank,
        report_path_json: `data/reports/${item.incident_id}.json`,
        report_path_md: `data/reports/markdown/${item.incident_id}.md`
      }));
      setReportsIndex(items);
    } catch (err: any) {
      setError(err.message || 'Failed to load reports index.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReportsIndex();
  }, []);

  const handleOpenReport = async (incidentId: string) => {
    try {
      setFetchingReport(true);
      const rep = await api.fetchIncidentReport(incidentId);
      setSelectedReport(rep);
    } catch (err: any) {
      alert(`Failed to load report for ${incidentId}`);
    } finally {
      setFetchingReport(false);
    }
  };

  const filtered = reportsIndex.filter(r => {
    if (!search) return true;
    const q = search.toLowerCase();
    return r.incident_id.toLowerCase().includes(q) || r.incident_type.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#111827] border border-[#1f293d] p-5 rounded-xl">
        <div>
          <div className="flex items-center space-x-2">
            <FileText className="w-5 h-5 text-blue-400" />
            <h1 className="text-lg font-bold text-slate-100 font-mono tracking-wide">Generated Incident Investigation Reports</h1>
          </div>
          <p className="text-xs text-slate-400 font-mono mt-1">
            Browse and inspect canonical JSON and formatted Markdown reports for all 111 prioritized incidents.
          </p>
        </div>
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search report ID..."
            className="w-full bg-[#0f172a] border border-[#1f293d] rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500/60 font-mono"
          />
        </div>
      </div>

      {loading ? (
        <Loader label="Loading reports directory..." />
      ) : error ? (
        <ErrorState message={error} onRetry={loadReportsIndex} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((item) => (
            <div
              key={item.incident_id}
              onClick={() => handleOpenReport(item.incident_id)}
              className="p-4 bg-[#111827] border border-[#1f293d] hover:border-blue-500/40 rounded-xl space-y-3 cursor-pointer transition-all hover:shadow-lg group"
            >
              <div className="flex items-center justify-between font-mono text-xs">
                <div className="flex items-center space-x-2">
                  <span className="px-2 py-0.5 bg-blue-500/10 text-blue-400 border border-blue-500/30 rounded font-bold">
                    #{item.priority_rank}
                  </span>
                  <span className="font-bold text-slate-100 group-hover:text-blue-300">{item.incident_id}</span>
                </div>
                <RiskBadge level={item.risk_level} size="sm" />
              </div>

              <div className="font-mono text-xs">
                <span className="text-slate-300 font-semibold">{item.incident_type}</span>
                <p className="text-slate-400 text-[11px] mt-0.5">Risk Score: <strong className="text-slate-200">{item.risk_score.toFixed(2)}</strong></p>
              </div>

              <div className="pt-2 border-t border-[#1f293d] flex items-center justify-between text-[11px] font-mono text-slate-400">
                <span className="truncate">data/reports/{item.incident_id}.json</span>
                <span className="text-blue-400 font-semibold group-hover:underline">View Report →</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Report Modal Viewer */}
      {selectedReport && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#111827] border border-[#1f293d] rounded-2xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="p-4 border-b border-[#1f293d] flex items-center justify-between bg-[#0f172a]">
              <div className="flex items-center space-x-3">
                <FileText className="w-5 h-5 text-blue-400" />
                <h3 className="font-mono font-bold text-slate-100 text-sm">
                  Report: {selectedReport.incident.incident_id} ({selectedReport.incident.incident_type})
                </h3>
                <RiskBadge level={selectedReport.incident.risk_level} size="sm" />
              </div>

              <div className="flex items-center space-x-3">
                <div className="flex bg-[#1e293b] p-0.5 rounded-lg border border-[#374151] text-xs font-mono">
                  <button
                    onClick={() => setViewMode('summary')}
                    className={`px-3 py-1 rounded-md font-semibold transition-colors ${viewMode === 'summary' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}
                  >
                    Executive View
                  </button>
                  <button
                    onClick={() => setViewMode('json')}
                    className={`px-3 py-1 rounded-md font-semibold transition-colors ${viewMode === 'json' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}
                  >
                    Canonical JSON
                  </button>
                </div>
                <button
                  onClick={() => setSelectedReport(null)}
                  className="p-1.5 text-slate-400 hover:text-slate-100 rounded-lg hover:bg-[#1e293b] transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto flex-1 font-mono text-xs space-y-4">
              {viewMode === 'json' ? (
                <pre className="p-4 bg-[#090d16] text-blue-300 rounded-xl border border-[#1f293d] text-[11px] leading-relaxed overflow-x-auto">
                  {JSON.stringify(selectedReport, null, 2)}
                </pre>
              ) : (
                <div className="space-y-4">
                  <div className="p-4 bg-[#0f172a] border border-[#1f293d] rounded-xl space-y-2">
                    <span className="text-slate-400 font-bold uppercase text-[11px]">Executive Summary</span>
                    <p className="text-slate-200 text-xs leading-relaxed">{selectedReport.executive_summary}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-[#0f172a] border border-[#1f293d] rounded-xl space-y-1">
                      <span className="text-slate-400 text-[10px] block">Risk Score Formula</span>
                      <strong className="text-blue-300 text-xs">{selectedReport.risk_analysis.formula}</strong>
                    </div>
                    <div className="p-3 bg-[#0f172a] border border-[#1f293d] rounded-xl space-y-1">
                      <span className="text-slate-400 text-[10px] block">Dominant Risk Drivers</span>
                      <strong className="text-amber-300 text-xs capitalize">{selectedReport.risk_analysis.dominant_factors.slice(0, 3).join(', ')}</strong>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <span className="text-slate-400 font-bold uppercase text-[11px]">Automated Recommendations ({selectedReport.recommendations.length})</span>
                    {selectedReport.recommendations.map((rec, idx) => (
                      <div key={idx} className="p-3 bg-[#0f172a] border border-[#1f293d] rounded-lg">
                        <span className="text-rose-400 font-bold">[{rec.priority}] {rec.action}</span>
                        <p className="text-slate-300 mt-1 text-[11px]">{rec.details}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

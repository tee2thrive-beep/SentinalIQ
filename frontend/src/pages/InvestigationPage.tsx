import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { IncidentReport } from '../types';
import { Loader } from '../components/common/Loader';
import { ErrorState } from '../components/common/ErrorState';
import { RiskBadge } from '../components/common/RiskBadge';
import { RiskMathCard } from '../components/investigation/RiskMathCard';
import { TimelineCard } from '../components/investigation/TimelineCard';
import { CorrelationCards } from '../components/investigation/CorrelationCards';
import { ProgressionCard } from '../components/investigation/ProgressionCard';
import { RecommendationsCard } from '../components/investigation/RecommendationsCard';
import { ArrowLeft, Award, Layers, Users, Server, ShieldCheck, FileText } from 'lucide-react';

export const InvestigationPage: React.FC = () => {
  const { incidentId } = useParams<{ incidentId: string }>();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [report, setReport] = useState<IncidentReport | null>(null);

  const loadReport = async () => {
    if (!incidentId) return;
    try {
      setLoading(true);
      setError(null);
      const data = await api.fetchIncidentReport(incidentId.toUpperCase());
      setReport(data);
    } catch (err: any) {
      setError(err.response?.status === 404 ? `Incident '${incidentId}' not found.` : err.message || 'Failed to load report.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReport();
  }, [incidentId]);

  if (loading) return <Loader label={`Generating investigation workspace for ${incidentId}...`} />;
  if (error || !report) return <ErrorState message={error || 'Incident not found'} onRetry={loadReport} />;

  const inc = report.incident;
  const pe = report.priority_explanation;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Back Button & Top Summary Header */}
      <div className="space-y-4">
        <button
          onClick={() => navigate('/incidents')}
          className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#111827] hover:bg-[#1e293b] text-slate-300 border border-[#1f293d] rounded-lg text-xs font-mono font-semibold transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Priority Queue
        </button>

        <div className="p-6 bg-gradient-to-r from-[#111827] to-[#0f172a] border border-[#1f293d] rounded-xl flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="flex items-center space-x-3">
              <span className="px-2.5 py-1 bg-blue-600/20 text-blue-400 border border-blue-500/40 rounded-lg text-xs font-mono font-bold">
                RANK #{inc.priority_rank}
              </span>
              <h1 className="text-2xl font-extrabold text-slate-100 font-mono tracking-tight">{inc.incident_id}</h1>
              <RiskBadge level={inc.risk_level} size="lg" />
            </div>
            <h2 className="text-base font-bold text-slate-300 mt-1 font-mono">{inc.incident_type}</h2>
            <div className="flex flex-wrap items-center gap-4 mt-3 text-xs font-mono text-slate-400">
              <span className="flex items-center gap-1.5"><Layers className="w-3.5 h-3.5 text-slate-500" /> {inc.alert_count} Correlated Alerts</span>
              <span className="flex items-center gap-1.5"><Users className="w-3.5 h-3.5 text-slate-500" /> {inc.affected_user_count} Affected User(s)</span>
              <span className="text-slate-500">Bounds: {inc.first_seen} to {inc.last_seen}</span>
            </div>
          </div>

          <div className="text-left lg:text-right bg-[#090d16] p-4 rounded-xl border border-[#1f293d] shrink-0">
            <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">Defensible Risk Score</span>
            <div className="text-3xl font-extrabold font-mono text-blue-400 tracking-tight">
              {inc.risk_score.toFixed(2)} <span className="text-xs text-slate-500 font-normal">/ 100.0</span>
            </div>
            <p className="text-[10px] font-mono text-slate-400 mt-1">Priority Band: <strong className="text-slate-200">{inc.priority_band}</strong></p>
          </div>
        </div>
      </div>

      {/* Executive Summary Card */}
      <div className="bg-[#111827] border border-[#1f293d] rounded-xl p-6 space-y-2">
        <div className="flex items-center space-x-2 text-blue-400 font-mono text-xs font-bold uppercase tracking-wider">
          <FileText className="w-4 h-4" />
          <span>Executive Investigation Summary</span>
        </div>
        <p className="text-sm font-mono text-slate-200 leading-relaxed bg-[#0f172a] p-4 rounded-lg border border-[#1f293d]/80">
          {report.executive_summary}
        </p>
      </div>

      {/* Priority Queue Explanation Card */}
      <div className="bg-[#111827] border border-[#1f293d] rounded-xl p-5 space-y-3 font-mono text-xs">
        <div className="flex items-center space-x-2 text-amber-400 font-bold uppercase tracking-wider">
          <Award className="w-4 h-4" />
          <span>Queue Rank Explanation (# {pe.priority_rank})</span>
        </div>
        <div className="bg-[#0f172a] p-4 rounded-lg border border-[#1f293d] space-y-2">
          <p className="text-slate-200 font-semibold">Primary Reason: <span className="text-blue-300">{pe.primary_reason}</span></p>
          {pe.compared_with_next ? (
            <div className="text-slate-400 space-y-1 pt-2 border-t border-[#1f293d]">
              <p>Ranked above next item <strong className="text-slate-200">{pe.compared_with_next.incident_id}</strong> (Score: {pe.compared_with_next.risk_score.toFixed(2)})</p>
              <p>Score Difference: <strong className="text-emerald-400">+{pe.compared_with_next.score_difference.toFixed(2)} pts</strong> | Deciding Factor: <code className="text-blue-300">{pe.compared_with_next.deciding_factor}</code></p>
            </div>
          ) : (
            <p className="text-slate-400 italic">Lowest priority item in investigation queue.</p>
          )}
        </div>
      </div>

      {/* Six-Factor Risk Score Analysis */}
      <RiskMathCard riskAnalysis={report.risk_analysis} />

      {/* Attack Progression Pipeline */}
      <ProgressionCard incidentType={inc.incident_type} timeline={report.timeline} />

      {/* Chronological Attack Timeline */}
      <TimelineCard timeline={report.timeline} />

      {/* Correlation Pair Evidence */}
      <CorrelationCards correlations={report.correlation_evidence} />

      {/* Affected Entities (Assets & Users) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Affected Assets */}
        <div className="bg-[#111827] border border-[#1f293d] rounded-xl p-5 space-y-4">
          <div className="flex items-center space-x-2 border-b border-[#1f293d] pb-3">
            <Server className="w-5 h-5 text-blue-400" />
            <h3 className="text-sm font-bold text-slate-100 tracking-wide font-mono">Target Asset Context ({report.affected_assets.length})</h3>
          </div>
          <div className="space-y-3">
            {report.affected_assets.map((ast) => (
              <div key={ast.asset_id} className="p-3 bg-[#0f172a] border border-[#1f293d] rounded-lg font-mono text-xs space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-blue-300">{ast.asset_id} ({ast.name})</span>
                  <span className="px-2 py-0.5 bg-blue-500/10 text-blue-400 border border-blue-500/30 rounded text-[10px] font-bold">{ast.criticality} CRITICALITY</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-400 pt-1 border-t border-[#1f293d]/50">
                  <span>Asset Type: <strong className="text-slate-200">{ast.asset_type}</strong></span>
                  <span>Impact Rating: <strong className="text-amber-400">{ast.business_impact}</strong></span>
                  <span>Data Sensitivity: <strong className="text-purple-400">{ast.data_sensitivity}</strong></span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Affected Users */}
        <div className="bg-[#111827] border border-[#1f293d] rounded-xl p-5 space-y-4">
          <div className="flex items-center space-x-2 border-b border-[#1f293d] pb-3">
            <Users className="w-5 h-5 text-blue-400" />
            <h3 className="text-sm font-bold text-slate-100 tracking-wide font-mono">Affected User Context ({report.affected_users.length})</h3>
          </div>
          <div className="space-y-3">
            {report.affected_users.map((usr) => (
              <div key={usr.user_id} className="p-3 bg-[#0f172a] border border-[#1f293d] rounded-lg font-mono text-xs space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-200">{usr.user_id} ({usr.username})</span>
                  <span className="px-2 py-0.5 bg-slate-800 text-slate-300 rounded text-[10px] font-bold">{usr.privilege_level} PRIVILEGE</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-400 pt-1 border-t border-[#1f293d]/50">
                  <span>Role: <strong className="text-slate-200">{usr.role}</strong></span>
                  <span>Department: <strong className="text-slate-200">{usr.department}</strong></span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Automated Investigation & Containment Recommendations */}
      <RecommendationsCard recommendations={report.recommendations} />
    </div>
  );
};

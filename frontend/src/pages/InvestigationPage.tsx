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
import { ArrowLeft, Award, Layers, Users, Server, ShieldCheck, FileText, Download, Activity, CheckCircle2, ChevronRight, Scale } from 'lucide-react';
import { Link } from 'react-router-dom';

export const InvestigationPage: React.FC = () => {
  const { incidentId } = useParams<{ incidentId: string }>();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [report, setReport] = useState<IncidentReport | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'timeline' | 'correlation' | 'playbook'>('overview');

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

  const handleDownloadJSON = () => {
    if (!report) return;
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(report, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `${report.incident.incident_id}_investigation_report.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  if (loading) return <Loader label={`Generating investigation workspace for ${incidentId}...`} />;
  if (error || !report) return <ErrorState message={error || 'Incident not found'} onRetry={loadReport} />;

  const inc = report.incident;
  const pe = report.priority_explanation;

  return (
    <div className="space-y-6 max-w-7xl mx-auto font-mono">
      {/* Breadcrumb Navigation Bar */}
      <div className="flex items-center space-x-2 text-xs text-slate-400">
        <Link to="/" className="hover:text-blue-400">Command Center</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <Link to="/incidents" className="hover:text-blue-400">Priority Queue</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-slate-100 font-bold">{inc.incident_id}</span>
      </div>

      {/* Top Incident Summary Hero Card */}
      <div className="cyber-card p-6 rounded-2xl border border-rose-500/40 relative overflow-hidden space-y-4 shadow-[0_0_30px_rgba(239,68,68,0.15)]">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="flex items-center space-x-3">
              <span className="px-2.5 py-1 bg-rose-950/80 text-rose-300 border border-rose-500/50 rounded-lg text-xs font-extrabold">
                RANK #{inc.priority_rank}
              </span>
              <h1 className="text-2xl font-extrabold text-slate-100">{inc.incident_id}</h1>
              <RiskBadge level={inc.risk_level} size="lg" />
            </div>

            <h2 className="text-base font-bold text-slate-300 mt-1">{inc.incident_type}</h2>

            <div className="flex flex-wrap items-center gap-4 mt-3 text-xs text-slate-400">
              <span className="flex items-center gap-1.5"><Layers className="w-4 h-4 text-cyan-400" /> {inc.alert_count} Correlated Alerts</span>
              <span className="flex items-center gap-1.5"><Users className="w-4 h-4 text-purple-400" /> {inc.affected_user_count} Affected User(s)</span>
              <span className="text-slate-400">Timeline: {inc.first_seen} → {inc.last_seen}</span>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <button
              onClick={handleDownloadJSON}
              className="px-4 py-2 bg-[#090e1c] hover:bg-[#111827] text-slate-200 border border-[#182238] rounded-xl text-xs font-bold transition-all flex items-center gap-2"
            >
              <Download className="w-4 h-4 text-blue-400" />
              <span>Export JSON Report</span>
            </button>

            <Link
              to={`/compare?a=${inc.incident_id}&b=INC-0001`}
              className="px-4 py-2 bg-purple-950/50 hover:bg-purple-900/60 text-purple-300 border border-purple-500/40 rounded-xl text-xs font-bold transition-all flex items-center gap-2"
            >
              <Scale className="w-4 h-4 text-purple-400" />
              <span>Compare Incident</span>
            </Link>

            <div className="p-4 bg-[#090e1c] border border-rose-500/40 rounded-2xl text-center shrink-0">
              <span className="text-[10px] text-slate-400 uppercase tracking-widest block font-bold">Defensible Risk Score</span>
              <strong className="text-3xl font-extrabold text-rose-400 font-mono">
                {inc.risk_score.toFixed(2)} <span className="text-xs text-slate-400 font-normal">/ 100</span>
              </strong>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Tabs Header */}
      <div className="cyber-card p-2 rounded-2xl border border-[#151d30] flex space-x-2">
        {[
          { id: 'overview', label: '1. Executive Risk & Factors', icon: FileText },
          { id: 'timeline', label: '2. Attack Sequence & Progression', icon: Activity },
          { id: 'correlation', label: '3. Graph Evidence & Entities', icon: Layers },
          { id: 'playbook', label: '4. Containment & Recommendations', icon: ShieldCheck },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 flex items-center justify-center space-x-2 py-2.5 px-3 rounded-xl text-xs font-bold transition-all ${
                isActive
                  ? 'bg-blue-600 text-white shadow-[0_0_15px_rgba(59,130,246,0.3)]'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-[#090e1c]'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab 1: Executive Overview & Risk Math */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Executive Summary Card */}
          <div className="cyber-card p-5 rounded-2xl border border-[#151d30] space-y-2">
            <div className="flex items-center space-x-2 text-blue-400 text-xs font-bold uppercase tracking-wider">
              <FileText className="w-4 h-4" />
              <span>Executive Investigation Summary</span>
            </div>
            <p className="text-xs text-slate-200 leading-relaxed bg-[#090e1c] p-4 rounded-xl border border-[#182238]">
              {report.executive_summary}
            </p>
          </div>

          {/* Priority Queue Explanation Card */}
          <div className="cyber-card p-5 rounded-2xl border border-[#151d30] space-y-3 text-xs">
            <div className="flex items-center space-x-2 text-amber-400 font-bold uppercase tracking-wider">
              <Award className="w-4 h-4" />
              <span>Queue Rank Explanation (Rank #{pe.priority_rank})</span>
            </div>
            <div className="bg-[#090e1c] p-4 rounded-xl border border-[#182238] space-y-2">
              <p className="text-slate-200 font-semibold">Primary Reason: <span className="text-blue-300">{pe.primary_reason}</span></p>
              {pe.compared_with_next && (
                <div className="text-slate-400 space-y-1 pt-2 border-t border-[#182238]">
                  <p>Ranked above next item <strong className="text-slate-200">{pe.compared_with_next.incident_id}</strong> (Score: {pe.compared_with_next.risk_score.toFixed(2)})</p>
                  <p>Score Difference: <strong className="text-emerald-400">+{pe.compared_with_next.score_difference.toFixed(2)} pts</strong> | Deciding Factor: <code className="text-blue-300">{pe.compared_with_next.deciding_factor}</code></p>
                </div>
              )}
            </div>
          </div>

          {/* Six-Factor Risk Score Analysis */}
          <RiskMathCard riskAnalysis={report.risk_analysis} />
        </div>
      )}

      {/* Tab 2: Attack Timeline & Progression */}
      {activeTab === 'timeline' && (
        <div className="space-y-6">
          <ProgressionCard incidentType={inc.incident_type} timeline={report.timeline} />
          <TimelineCard timeline={report.timeline} />
        </div>
      )}

      {/* Tab 3: Correlation Evidence & Target Entities */}
      {activeTab === 'correlation' && (
        <div className="space-y-6">
          <CorrelationCards correlations={report.correlation_evidence} />

          {/* Affected Entities (Assets & Users) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Affected Assets */}
            <div className="cyber-card p-5 rounded-2xl border border-[#151d30] space-y-4">
              <div className="flex items-center space-x-2 border-b border-[#151d30] pb-3">
                <Server className="w-5 h-5 text-blue-400" />
                <h3 className="text-sm font-bold text-slate-100 tracking-wide">Target Asset Context ({report.affected_assets.length})</h3>
              </div>
              <div className="space-y-3">
                {report.affected_assets.map((ast) => (
                  <div key={ast.asset_id} className="p-3 bg-[#090e1c] border border-[#182238] rounded-xl text-xs space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-blue-300">{ast.asset_id} ({ast.name})</span>
                      <span className="px-2 py-0.5 bg-blue-950/60 text-blue-400 border border-blue-500/30 rounded text-[10px] font-bold">{ast.criticality} CRITICALITY</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-400 pt-1 border-t border-[#182238]">
                      <span>Asset Type: <strong className="text-slate-200">{ast.asset_type}</strong></span>
                      <span>Impact Rating: <strong className="text-amber-400">{ast.business_impact}</strong></span>
                      <span>Data Sensitivity: <strong className="text-purple-400">{ast.data_sensitivity}</strong></span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Affected Users */}
            <div className="cyber-card p-5 rounded-2xl border border-[#151d30] space-y-4">
              <div className="flex items-center space-x-2 border-b border-[#151d30] pb-3">
                <Users className="w-5 h-5 text-blue-400" />
                <h3 className="text-sm font-bold text-slate-100 tracking-wide">Affected User Context ({report.affected_users.length})</h3>
              </div>
              <div className="space-y-3">
                {report.affected_users.map((usr) => (
                  <div key={usr.user_id} className="p-3 bg-[#090e1c] border border-[#182238] rounded-xl text-xs space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-200">{usr.user_id} ({usr.username})</span>
                      <span className="px-2 py-0.5 bg-purple-950/60 text-purple-300 border border-purple-500/30 rounded text-[10px] font-bold">{usr.privilege_level} PRIVILEGE</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-400 pt-1 border-t border-[#182238]">
                      <span>Role: <strong className="text-slate-200">{usr.role}</strong></span>
                      <span>Department: <strong className="text-slate-200">{usr.department}</strong></span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Containment & Playbook Recommendations */}
      {activeTab === 'playbook' && (
        <div className="space-y-6">
          <RecommendationsCard recommendations={report.recommendations} />
        </div>
      )}
    </div>
  );
};

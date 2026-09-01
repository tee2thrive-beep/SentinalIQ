export interface HealthResponse {
  status: string;
  service: string;
  version: string;
}

export interface IncidentSummaryItem {
  priority_rank: number;
  incident_id: string;
  risk_score: number;
  risk_level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  priority_band: string;
  incident_type: string;
  first_seen: string;
  alert_count: number;
  affected_users: number;
  dominant_factors: string[];
  tie_group_id?: string | null;
}

export interface IncidentListResponse {
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
  items: IncidentSummaryItem[];
}

export interface RiskFactor {
  name: string;
  value: number;
  weight: number;
  contribution: number;
  status: string;
  source: string;
  evidence: string;
}

export interface RiskAnalysis {
  formula: string;
  risk_score: number;
  risk_level: string;
  factors: RiskFactor[];
  dominant_factors: string[];
  contribution_sum: number;
}

export interface TimelineEvent {
  timestamp: string;
  alert_id: string;
  alert_type: string;
  category: string;
  severity: number;
  confidence: number;
  source_ip: string;
  destination_ip: string;
  user_id: string;
  username: string;
  asset_id: string;
  asset_name: string;
}

export interface Correlation {
  correlation_id: string;
  alert_id_1: string;
  alert_id_2: string;
  correlation_score: number;
  signals: string[];
  evidence_summary: string;
}

export interface Recommendation {
  type: string;
  action: string;
  priority: string;
  details: string;
  status: string;
  automated_note?: string;
}

export interface AffectedUser {
  user_id: string;
  username: string;
  role: string;
  department: string;
  privilege_level: string;
}

export interface AffectedAsset {
  asset_id: string;
  name: string;
  asset_type: string;
  criticality: string;
  business_impact: number;
  data_sensitivity: number;
}

export interface PriorityExplanation {
  priority_rank: number;
  risk_score: number;
  risk_level: string;
  tie_group_id?: string | null;
  primary_reason: string;
  compared_with_next?: {
    incident_id: string;
    risk_score: number;
    score_difference: number;
    deciding_factor: string;
  } | null;
}

export interface IncidentReport {
  report_version: string;
  generated_at: string;
  incident: {
    incident_id: string;
    incident_type: string;
    risk_score: number;
    risk_level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    priority_rank: number;
    priority_band: string;
    first_seen: string;
    last_seen: string;
    alert_count: number;
    affected_user_count: number;
    tie_group_id?: string | null;
  };
  executive_summary: string;
  risk_analysis: RiskAnalysis;
  timeline: TimelineEvent[];
  correlation_evidence: Correlation[];
  classification: {
    incident_type: string;
    classification_evidence: string[];
  };
  affected_users: AffectedUser[];
  affected_assets: AffectedAsset[];
  priority_explanation: PriorityExplanation;
  recommendations: Recommendation[];
  limitations: string[];
}

export interface MoverRecord {
  incident_id: string;
  incident_type: string;
  baseline_rank: number;
  simulated_rank: number;
  rank_change: number;
  baseline_score: number;
  simulated_score: number;
  score_delta: number;
  baseline_risk_level: string;
  simulated_risk_level: string;
  risk_level_changed: boolean;
  baseline_dominant_factors: string[];
  simulated_dominant_factors: string[];
  dominant_factors_changed: boolean;
}

export interface SimulationScenario {
  scenario_name: string;
  title: string;
  purpose: string;
  weights: Record<string, number>;
  incident_count: number;
  average_score: number;
  highest_score: number;
  lowest_score: number;
  risk_level_distribution: {
    CRITICAL: number;
    HIGH: number;
    MEDIUM: number;
    LOW: number;
  };
  risk_level_changes_count: number;
  dominant_factor_changes_count: number;
  top_10: any[];
  top_upward_movers: MoverRecord[];
  top_downward_movers: MoverRecord[];
  risk_level_changes: MoverRecord[];
  dominant_factor_changes: MoverRecord[];
}

export interface SensitivityFactor {
  factor: string;
  display_name: string;
  baseline_weight: number;
  sensitivity_score: number;
  sensitivity_rank: number;
  plus_perturbation: {
    weight: number;
    average_absolute_rank_change: number;
    maximum_rank_change: number;
    incidents_moved: number;
    risk_level_changes: number;
  };
  minus_perturbation: {
    weight: number;
    average_absolute_rank_change: number;
    maximum_rank_change: number;
    incidents_moved: number;
    risk_level_changes: number;
  };
  explanation: string;
}

export interface SensitivityPayload {
  perturbation_delta: number;
  factor_sensitivity_ranking: SensitivityFactor[];
  factor_details: Record<string, SensitivityFactor>;
}

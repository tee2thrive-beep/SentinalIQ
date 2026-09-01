import axios from 'axios';
import {
  HealthResponse,
  IncidentListResponse,
  IncidentReport,
  TimelineEvent,
  RiskAnalysis,
  Correlation,
  Recommendation,
  SimulationScenario,
  SensitivityPayload
} from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

const client = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 60000,
});


export const api = {
  async fetchHealth(): Promise<HealthResponse> {
    const res = await client.get<HealthResponse>('/health');
    return res.data;
  },

  async fetchIncidents(
    page: number = 1,
    pageSize: number = 20,
    riskLevel?: string,
    incidentType?: string
  ): Promise<IncidentListResponse> {
    const params: Record<string, any> = { page, page_size: pageSize };
    if (riskLevel && riskLevel !== 'ALL') params.risk_level = riskLevel;
    if (incidentType && incidentType !== 'ALL') params.incident_type = incidentType;
    
    try {
      const res = await client.get<IncidentListResponse>('/incidents', { params });
      if (page === 1 && (!riskLevel || riskLevel === 'ALL')) {
        try {
          sessionStorage.setItem('sentineliq_incidents_cache', JSON.stringify(res.data));
        } catch {}
      }
      return res.data;
    } catch (err) {
      const cached = sessionStorage.getItem('sentineliq_incidents_cache');
      if (cached && page === 1) {
        return JSON.parse(cached);
      }
      throw err;
    }
  },

  async fetchIncidentReport(incidentId: string): Promise<IncidentReport> {
    const res = await client.get<IncidentReport>(`/incidents/${incidentId}`);
    return res.data;
  },

  async fetchIncidentTimeline(incidentId: string): Promise<TimelineEvent[]> {
    const res = await client.get<TimelineEvent[]>(`/incidents/${incidentId}/timeline`);
    return res.data;
  },

  async fetchIncidentRisk(incidentId: string): Promise<RiskAnalysis> {
    const res = await client.get<RiskAnalysis>(`/incidents/${incidentId}/risk`);
    return res.data;
  },

  async fetchIncidentCorrelations(incidentId: string): Promise<Correlation[]> {
    const res = await client.get<Correlation[]>(`/incidents/${incidentId}/correlations`);
    return res.data;
  },

  async fetchIncidentRecommendations(incidentId: string): Promise<Recommendation[]> {
    const res = await client.get<Recommendation[]>(`/incidents/${incidentId}/recommendations`);
    return res.data;
  },

  async fetchSimulationScenarios(): Promise<Record<string, SimulationScenario>> {
    const res = await client.get<Record<string, SimulationScenario>>('/simulations/scenarios');
    return res.data;
  },

  async fetchSimulationSensitivity(): Promise<SensitivityPayload> {
    const res = await client.get<SensitivityPayload>('/simulations/sensitivity');
    return res.data;
  },

  async simulateCustomWeights(weights: Record<string, number>) {
    const res = await client.post('/simulations/custom-weights', { weights });
    return res.data;
  },

  async createCustomAlert(payload: {
    alert_type: string;
    category: string;
    severity: number;
    confidence: number;
    source_ip?: string;
    destination_ip?: string;
    asset_id?: string;
    user_id?: string;
  }) {
    const res = await client.post('/alerts', payload);
    return res.data;
  }
};


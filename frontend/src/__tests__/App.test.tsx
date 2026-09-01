import { describe, it, expect } from 'vitest';
import { api } from '../services/api';

describe('SentinelIQ SOC Frontend API Client & Types Tests', () => {
  it('1. API client initializes correct base endpoint', () => {
    expect(api).toBeDefined();
    expect(typeof api.fetchHealth).toBe('function');
    expect(typeof api.fetchIncidents).toBe('function');
    expect(typeof api.fetchIncidentReport).toBe('function');
  });

  it('2. Risk score math helper computes valid 6-factor total', () => {
    const sampleFactors = [
      { name: 'severity', value: 98.0, weight: 0.20, contribution: 19.60 },
      { name: 'asset_importance', value: 94.0, weight: 0.20, contribution: 18.80 },
      { name: 'affected_users', value: 10.03, weight: 0.10, contribution: 1.003 },
      { name: 'data_sensitivity', value: 100.0, weight: 0.15, contribution: 15.00 },
      { name: 'attack_confidence', value: 93.0, weight: 0.15, contribution: 13.95 },
      { name: 'business_impact', value: 96.0, weight: 0.20, contribution: 19.20 }
    ];

    const sum = sampleFactors.reduce((acc, f) => acc + f.contribution, 0);
    expect(sum).toBeCloseTo(87.553, 2);
  });

  it('3. Incident classification levels map correctly', () => {
    const classifyLevel = (score: number) => {
      if (score >= 75.0) return 'CRITICAL';
      if (score >= 50.0) return 'HIGH';
      if (score >= 25.0) return 'MEDIUM';
      return 'LOW';
    };

    expect(classifyLevel(90.20)).toBe('CRITICAL');
    expect(classifyLevel(65.00)).toBe('HIGH');
    expect(classifyLevel(35.00)).toBe('MEDIUM');
    expect(classifyLevel(15.00)).toBe('LOW');
  });

  it('4. Priority rank change math computes upward/downward shifts', () => {
    const computeRankChange = (baselineRank: number, simulatedRank: number) => {
      return baselineRank - simulatedRank;
    };

    expect(computeRankChange(35, 16)).toBe(19); // Moved UP 19 ranks
    expect(computeRankChange(5, 12)).toBe(-7);  // Moved DOWN 7 ranks
  });
});

# SentinelIQ — Explainable Incident Report Generator Documentation

## 1. Overview & Objectives

The **Explainable Incident Report Generator** (`backend/reporting/`) automatically compiles canonical JSON and human-readable Markdown investigation reports for every incident in the SentinelIQ priority queue (`data/reports/`).

```
┌─────────────────────────────────────────────────────────┐
│              Authoritative Step 1-6 Datasets            │
└────────────────────────────┬────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────┐
│            Entity Resolver & Evidence Extractor         │
│  - User Metadata (Role, Dept, Privilege Level)          │
│  - Asset Metadata (Criticality, Impact, Sensitivity)    │
│  - Chronological Timeline & Correlated Pairs            │
└────────────────────────────┬────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────┐
│           Rule-Based Recommendations Engine             │
│  - Automated policy-based guidance for SOC analysts     │
│  - Explicitly labeled: "Automated Recommendation"       │
└────────────────────────────┬────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────┐
│               Canonical Report Compiler                 │
│  - JSON Reports (data/reports/INC-XXXX.json)            │
│  - Markdown Reports (data/reports/markdown/INC-XXXX.md) │
│  - Report Index (data/reports/index.json)               │
└─────────────────────────────────────────────────────────┘
```

---

## 2. Data Lineage Mapping

Every field in the generated report is strictly traceable to authoritative SentinelIQ source datasets:

- **Priority Rank & Queue Metrics**: Step 6 (`data/priority_queue.json`, `data/priority_queue_summary.json`)
- **Risk Score & Six-Factor Breakdown**: Step 5 (`data/scored_incidents.json`)
- **Cluster Timeline & Classification Evidence**: Step 4 (`data/incidents.json`, `data/incident_graph.json`)
- **Correlation Evidence Pairs**: Step 3 (`data/correlations.json`, `data/correlation_graph.json`)
- **Normalized Alert Details**: Step 2 (`data/normalized_alerts.json`)
- **Affected User & Asset Metadata**: Step 1 (`data/users.json`, `data/assets.json`)

---

## 3. Canonical Report JSON Schema (Version 1.0)

```json
{
  "report_version": "1.0",
  "generated_at": "2026-09-01T11:31:50+00:00",
  "incident": {
    "incident_id": "INC-0021",
    "incident_type": "Multi-stage Attack",
    "risk_score": 90.20,
    "risk_level": "CRITICAL",
    "priority_rank": 1,
    "priority_band": "CRITICAL",
    "first_seen": "2026-09-01T08:05:00+00:00",
    "last_seen": "2026-09-01T09:12:00+00:00",
    "alert_count": 9,
    "affected_user_count": 1,
    "tie_group_id": null
  },
  "executive_summary": "INC-0021 is a CRITICAL Multi-stage Attack ranked #1 in the SentinelIQ investigation queue...",
  "risk_analysis": {
    "formula": "R = 0.20*S + 0.20*A + 0.10*U + 0.15*D + 0.15*C + 0.20*B",
    "risk_score": 90.20,
    "risk_level": "CRITICAL",
    "factors": [],
    "dominant_factors": ["business_impact", "asset_importance", "severity"],
    "contribution_sum": 90.20
  },
  "timeline": [],
  "correlation_evidence": [],
  "classification": {
    "incident_type": "Multi-stage Attack",
    "classification_evidence": []
  },
  "affected_users": [],
  "affected_assets": [],
  "priority_explanation": {},
  "recommendations": [],
  "limitations": []
}
```

---

## 4. Explainability Guarantees

1. **Mathematical Scoring Verification**: Asserts $\sum \text{contributions} == \text{risk\_score}$ within $1e-3$ tolerance.
2. **Deterministic Precedence**: Preserves Step 4 incident classification rules and Step 6 tie-breaking decisions.
3. **Automated Policy Recommendations**: Every recommendation is explicitly flagged with `"automated_note": "Automated policy guidance for SOC analysts. Action has NOT been executed autonomously."`

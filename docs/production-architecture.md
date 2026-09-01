# SentinelIQ — Production Architecture & Data Lineage

This document describes the high-level production architecture, component interactions, and complete analytical data lineage of the **SentinelIQ Cyber Incident Prioritization Engine (PS-03)**.

---

## 1. High-Level Production Architecture

```
                    ┌────────────────────────┐
                    │      Analyst Browser   │
                    └───────────┬────────────┘
                                │
                                ▼ HTTPS (Port 443)
                    ┌────────────────────────┐
                    │     Nginx Gateway      │
                    │ (Static SPA + Reverse) │
                    └─────┬────────────┬─────┘
                          │            │
             / (Static)   │            │ /api (Proxy)
                          ▼            ▼
┌───────────────────────────┐        ┌───────────────────────────┐
│   Vite React Production   │        │      FastAPI Backend      │
│   (frontend/dist/)        │        │      (backend/api/app.py) │
└───────────────────────────┘        └─────────────┬─────────────┘
                                                   │
                                                   ▼
                                     ┌───────────────────────────┐
                                     │ Authoritative Datasets    │
                                     │ (Steps 1–8 JSON Files)    │
                                     └───────────────────────────┘
```

---

## 2. Complete Data Lineage Pipeline (Steps 1–10)

```
RAW ALERTS (159 Alerts, 35 Assets, 55 Users) ──► Step 1 Dataset Generator
   │
   ▼
COMMON ALERT SCHEMA & NORMALIZATION ──────────► Step 2 Normalization Engine
   │
   ▼
MULTI-SIGNAL CORRELATION EVIDENCE ───────────► Step 3 Correlation Engine
   │
   ▼
GRAPH CLUSTERING & CLASSIFICATION ──────────► Step 4 Clustering Engine (111 Incidents)
   │
   ▼
SIX-FACTOR RISK SCORING ─────────────────────► Step 5 Risk Engine (Score 0–100)
   │
   ▼
DETERMINISTIC PRIORITY QUEUE ────────────────► Step 6 Priority Queue & Tie-Breaker
   │
   ▼
WHAT-IF SIMULATION & SENSITIVITY ────────────► Step 7 Weight Simulation Engine
   │
   ▼
EXPLAINABLE REPORT GENERATOR & API ──────────► Step 8 Canonical Reports & FastAPI
   │
   ▼
SOC ANALYST DASHBOARD FRONTEND ─────────────► Step 9 React + Vite Workspace
   │
   ▼
PRODUCTION HARDENING & DEPLOYMENT ──────────► Step 10 Containerization & Hardening
```

---

## 3. Preservation of Analytical Methodology

Step 10 is infrastructure and production hardening. It does **NOT** alter:
- **Step 5 Formula**: $R = 0.20S + 0.20A + 0.10U + 0.15D + 0.15C + 0.20B$
- **Step 6 Ordering**: Deterministic Priority Rank $1..111$ with 8-level tie-breaker hierarchy.
- **Step 7 Simulation Math**: Proportional factor sensitivity rankings.
- **Step 8 Report Schema**: Canonical report structure and API response models.

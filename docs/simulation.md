# SentinelIQ — What-If Weight Simulation & Sensitivity Analysis Documentation

## 1. Overview & Objectives

The **What-If Weight Simulation & Sensitivity Analysis Engine** allows security leadership and analysts to model alternative organizational risk priorities by testing custom factor weight configurations.

```
┌─────────────────────────────────────────────────────────┐
│              Scored Incident Datasets (111)             │
└────────────────────────────┬────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────┐
│           What-If Simulation Engine & Validator         │
│   (Predefined / Custom Weight Configurations: Sum = 1.0)│
└────────────────────────────┬────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────┐
│          Step 6 Deterministic Tie-Breaker Queue          │
│        (Regenerates queue order for each scenario)      │
└────────────────────────────┬────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────┐
│            Comparison Engine vs Baseline               │
│ - Score Deltas            - Rank Changes (Pos = UP)     │
│ - Risk-Level Shifts       - Dominant Factor Shifts      │
│ - Top 10 Upward / Downward Movers                       │
└────────────────────────────┬────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────┐
│       Proportional Sensitivity Analyzer (+/- 5%)        │
│ - Factor Sensitivity Score = AvgRank+ + AvgRank-        │
│ - Factor Influence Ranking                              │
└─────────────────────────────────────────────────────────┘
```

> [!IMPORTANT]
> **NO BASELINE MUTATION**: Step 7 stores all simulation artifacts in `data/simulation/`. The original Step 5 baseline (`data/scored_incidents.json`) and Step 6 priority queue (`data/priority_queue.json`) remain untouched.

---

## 2. Predefined What-If Scenarios

| Scenario Name | Severity | Asset Importance | Affected Users | Data Sensitivity | Attack Confidence | Business Impact | Strategic Purpose |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :--- |
| **baseline** | `0.20` | `0.20` | `0.10` | `0.15` | `0.15` | `0.20` | Default balanced reference model |
| **user_impact_focus** | `0.15` | `0.15` | **`0.25`** | `0.15` | `0.15` | `0.15` | Prioritizes threats affecting broader user populations |
| **data_protection_focus** | `0.15` | `0.15` | `0.10` | **`0.30`** | `0.15` | `0.15` | Prioritizes confidential PII / data breach risks |
| **business_continuity_focus** | `0.15` | `0.20` | `0.10` | `0.10` | `0.15` | **`0.30`** | Prioritizes mission-critical operational downtime risks |
| **high_confidence_focus** | `0.15` | `0.15` | `0.10` | `0.15` | **`0.30`** | `0.15` | Prioritizes threats with highest detection certainty |

---

## 3. Comparison Metrics vs Baseline

- **Score Delta**: $\text{score\_delta} = \text{simulated\_score} - \text{baseline\_score}$
- **Rank Change**: $\text{rank\_change} = \text{baseline\_rank} - \text{simulated\_rank}$
  - **Positive (+)** = Moved UP in priority queue (higher investigation urgency).
  - **Negative (-)** = Moved DOWN in priority queue.
  - **Zero (0)** = Unchanged position.

---

## 4. Proportional Sensitivity Analysis ($\pm 5\%$ Perturbations)

To measure the intrinsic influence of each factor on the priority queue, the engine perturbs each factor weight by $\Delta = \pm 0.05$ while redistributing $\Delta$ proportionally across the remaining 5 factors to maintain $\sum w_i = 1.0$:

$$w_j' = \max\left(0.0, w_j - \Delta \cdot \frac{w_j}{\sum_{m \neq k} w_m}\right)$$

### Sensitivity Score Formula
$$\text{sensitivity\_score} = \text{average\_absolute\_rank\_change\_plus} + \text{average\_absolute\_rank\_change\_minus}$$

Factors are ranked by `sensitivity_score` **DESCENDING**, identifying which scoring factor exerts the greatest structural control over incident rankings.

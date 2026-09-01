# SentinelIQ — Priority Queue & Deterministic Tie-Breaker Documentation

## 1. Overview & Architecture

The **Priority Queue Engine** converts scored incident clusters (`data/scored_incidents.json`) into an ordered, explainable investigation queue (`data/priority_queue.json`).

```
┌─────────────────────────────────────────────────────────┐
│               Scored Incidents Dataset (111)            │
└────────────────────────────┬────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────┐
│              Primary Sorting Rule Evaluator             │
│                 (risk_score DESCENDING)                 │
└────────────────────────────┬────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────┐
│        8-Level Deterministic Tie-Breaker Engine         │
│          (Activates when |Score_A - Score_B| <= 1e-6)   │
└────────────────────────────┬────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────┐
│         Adjacent Comparator & Evidence Generator        │
│    - Ranks 1..N                - Deciding Factors       │
│    - Score Differences         - Tie Group Assignments  │
└────────────────────────────┬────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────┐
│                Priority Queue Datasets                  │
│    (priority_queue.json, .csv, queue_summary.json)      │
└─────────────────────────────────────────────────────────┘
```

> [!IMPORTANT]
> **NO SCORE RECALCULATION**: The priority queue layer strictly determines investigation ordering. It does **NOT** recalculate risk scores, add bonuses, or apply penalties.

---

## 2. Primary Sorting & Floating-Point Tolerance

1. **Primary Sort Rule**: Incidents are ordered primarily by `risk_score` **DESCENDING**.
2. **Floating-Point Equality Tolerance**: `FLOAT_TOLERANCE = 1e-6`. Scores $S_A$ and $S_B$ are treated as tied if $|S_A - S_B| \le 10^{-6}$.

---

## 3. The 8-Level Deterministic Tie-Breaker Hierarchy

When two incidents have equal primary risk scores within tolerance, ordering is strictly resolved using the following multi-key hierarchy:

$$\text{risk\_score DESC} \longrightarrow$$
1. `maximum_severity` **DESCENDING**
2. `incident_asset_importance` **DESCENDING**
3. `incident_business_impact` **DESCENDING**
4. `incident_data_sensitivity` **DESCENDING**
5. `incident_confidence` **DESCENDING**
6. `normalized_affected_users` **DESCENDING**
7. `first_seen` **ASCENDING** (earlier timestamp ranks higher)
8. `incident_id` **ASCENDING** (lexicographical fallback, e.g. `INC-0001` before `INC-0002`)

---

## 4. Tie Group Detection

- When multiple incidents share an identical `risk_score` within tolerance, they are assigned a deterministic `tie_group_id` (e.g. `TG-0001`).
- Incidents with unique risk scores have `tie_group_id: null`.

---

## 5. Adjacent Comparisons & Ranking Reasons

For every ranked incident $k$ at rank $R_k$, the engine compares it against incident $k+1$ at rank $R_{k+1}$ to store structured comparative evidence:

- **Distinct Scores**:
  ```json
  {
    "primary": "Higher risk score",
    "compared_with_next": {
      "incident_id": "INC-0001",
      "risk_score": 89.50,
      "score_difference": 0.70,
      "deciding_factor": "risk_score"
    }
  }
  ```
- **Tied Scores**:
  ```json
  {
    "primary": "Risk scores are tied",
    "tie_breaker": "Higher maximum severity",
    "this_value": 98.0,
    "other_value": 95.0,
    "compared_with_next": {
      "incident_id": "INC-0004",
      "risk_score": 75.00,
      "score_difference": 0.00,
      "deciding_factor": "maximum_severity"
    }
  }
  ```

---

## 6. Queue Integrity Verification

Before exporting data, the engine enforces strict integrity assertions:
1. **Completeness**: 100% of input incidents must appear in the queue.
2. **Uniqueness**: Ranks must be consecutive integers $1..N$ with 0 duplicate incident IDs.
3. **Immutability**: Input `risk_score` values must remain unchanged.
4. **Determinism**: Re-running the queue engine yields identical outputs.

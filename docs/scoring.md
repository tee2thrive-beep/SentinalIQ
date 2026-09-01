# SentinelIQ — Six-Factor Risk Scoring Engine Documentation

## 1. Overview & Principles

The **Six-Factor Incident Risk Scoring Engine** computes a transparent, explainable risk score ($0–100$) for every clustered incident.

```
┌─────────────────────────────────────────────────────────┐
│               Incident Cluster Features                 │
└────────────────────────────┬────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────┐
│             Six-Factor Extraction Engine                │
│  - Severity (S)           - Asset Importance (A)        │
│  - Affected Users (U)     - Data Sensitivity (D)        │
│  - Attack Confidence (C)  - Business Impact (B)         │
└────────────────────────────┬────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────┐
│              Weighted Linear Risk Formula               │
│ R = 0.20S + 0.20A + 0.10U + 0.15D + 0.15C + 0.20B       │
└────────────────────────────┬────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────┐
│           Explainability & Dominant Driver Engine       │
│  - Risk Breakdown Dictionary    - Top 3 Dominant Drivers│
│  - Natural Language Summary     - Integrity Verification│
└─────────────────────────────────────────────────────────┘
```

> [!IMPORTANT]
> **EXCLUSION OF CLUSTER SCORE**: Per explicit specification, `cluster_score` (graph correlation coherence) is retained in metadata for context but **MUST NOT** secretly alter `risk_score`. There are no hidden multipliers, bonuses, or machine learning models.

---

## 2. Mathematical Formula & Factor Mappings

$$R = 0.20 \cdot S + 0.20 \cdot A + 0.10 \cdot U + 0.15 \cdot D + 0.15 \cdot C + 0.20 \cdot B$$

| Factor ($i$) | Symbol | Incident Source Field | Description | Default Weight ($w_i$) |
| :--- | :---: | :--- | :--- | :---: |
| **Severity** | $S$ | `maximum_severity` | Maximum single-alert severity score (`0–100`) | `0.20` |
| **Asset Importance** | $A$ | `incident_asset_importance` | Max normalized asset criticality & business value | `0.20` |
| **Affected Users** | $U$ | `normalized_affected_users` | Logarithmically scaled unique affected user count | `0.10` |
| **Data Sensitivity** | $D$ | `incident_data_sensitivity` | Max target asset data confidentiality rating | `0.15` |
| **Attack Confidence** | $C$ | `incident_confidence` | Corroborated incident attack confidence score | `0.15` |
| **Business Impact** | $B$ | `incident_business_impact` | Max potential organizational impact rating | `0.20` |

---

## 3. Factor Contributions & Score Integrity

For each factor, its contribution is calculated as:

$$\text{contribution}_i = \text{value}_i \times \text{weight}_i$$

- **Integrity Constraint**: $\sum_{i=1}^{6} \text{contribution}_i == R$ (verified to floating-point precision of $10^{-6}$).

---

## 4. Risk Level & Status Classification

Both overall incident `risk_score` and individual factor values are classified using standard status tiers:

| Score Range | Status / Risk Level | Description |
| :---: | :---: | :--- |
| `0.00 – 24.99` | **LOW** | Minor anomaly, minimal business impact |
| `25.00 – 49.99` | **MEDIUM** | Moderate threat requiring standard investigation |
| `50.00 – 74.99` | **HIGH** | Significant threat targeting important assets |
| `75.00 – 100.00` | **CRITICAL** | Urgent multi-stage or high-impact critical breach |

---

## 5. Dominant Factors & Deterministic Tie-Breaking

The top 3 dominant risk drivers are identified by sorting factor contributions descending. In the event of equal contributions, deterministic tie-breaking is enforced:

1. **Contribution** (highest weighted contribution first)
2. **Raw Value** (highest raw factor value second)
3. **Fixed Order** (`severity` $\rightarrow$ `business_impact` $\rightarrow$ `asset_importance` $\rightarrow$ `data_sensitivity` $\rightarrow$ `attack_confidence` $\rightarrow$ `affected_users`)

---

## 6. Weight Validation Rules

The scoring engine enforces strict configuration validation:
- All 6 factor weights must be present.
- Each weight must satisfy $0.0 \le w_i \le 1.0$.
- Sum of weights must equal $1.0$ within $10^{-6}$ tolerance. Invalid configurations raise an explicit `ValueError`.

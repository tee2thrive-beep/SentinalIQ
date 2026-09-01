# SentinelIQ — Correlation Engine Documentation

## 1. Overview & Architecture

The **Correlation Engine** evaluates pairs of normalized cybersecurity alerts to compute relationship strength and generate human-understandable evidence.

```
┌─────────────────────────────────────────────────────────┐
│              Normalized Alert Stream (159)              │
└────────────────────────────┬────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────┐
│             Candidate Pair Indexer & Bucketer           │
│   (Indexes by User, Asset, Source IP, Destination IP)   │
└────────────────────────────┬────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────┐
│              7 Independent Signal Evaluators            │
│  - Same User              - Same Asset                  │
│  - Same Source IP         - Same Destination IP         │
│  - Temporal Decay         - Threat Taxonomy             │
│  - Attack Stage Progression                             │
└────────────────────────────┬────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────┐
│              Weighted Correlation Evaluator             │
│   Score = Sum(w_i * signal_i) * 100  (Threshold >= 25)  │
└────────────────────────────┬────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────┐
│                  Correlations & Graph                   │
│   (correlations.json, correlations.csv, graph.json)     │
└─────────────────────────────────────────────────────────┘
```

> [!IMPORTANT]
> **CORRELATION SCORE VS INCIDENT PRIORITY SCORE**: The correlation score ($0–100$) indicates *the likelihood that two alerts belong to the same multi-stage threat event*. It does **NOT** measure business risk or incident severity. Final incident risk prioritization occurs later in Step 5.

---

## 2. Correlation Signal Definitions & Formulas

The engine combines 7 independent, deterministic signal evaluators:

### 2.1. Same User (`same_user`)
- **Condition**: Returns `1.0` if both alerts reference an identical, non-empty `user_id`.
- **Evidence**: `"Same user involved ({user_id})"`

### 2.2. Same Asset (`same_asset`)
- **Condition**: Returns `1.0` if both alerts target an identical, non-empty `asset_id`.
- **Evidence**: `"Same target asset affected ({asset_id})"`

### 2.3. Same Source IP (`same_source_ip`)
- **Condition**: Returns `1.0` if both alerts originate from an identical non-empty `source_ip`.
- **Evidence**: `"Same source IP address ({source_ip})"`
- *Internal Infrastructure Consideration*: Common internal proxies or security scanners may generate high source IP repetition. This signal is weighted at 15% and evaluated alongside user and asset signals.

### 2.4. Same Destination IP (`same_destination_ip`)
- **Condition**: Returns `1.0` if both alerts target an identical non-empty `destination_ip`.
- **Evidence**: `"Same destination IP address ({destination_ip})"`

### 2.5. Temporal Proximity & Exponential Time Decay (`temporal_proximity`)
Instead of a rigid binary cut-off, temporal proximity uses an exponential decay model over time difference $\Delta t = |t_a - t_b|$ in seconds:

$$\text{score} = \exp\left( -\frac{\Delta t}{\tau} \right) \quad \text{where } \tau = \frac{\text{window\_seconds}}{3.0}$$

With default correlation window $\text{window\_seconds} = 7200\text{s}$ ($2\text{ hours}$):
- $\Delta t = 0\text{s} \rightarrow 1.00$ (Evidence: `"Occurred simultaneously"`)
- $\Delta t = 300\text{s} (5\text{ mins}) \rightarrow 0.88$ (Evidence: `"Occurred within 5.0 minutes of each other"`)
- $\Delta t = 1800\text{s} (30\text{ mins}) \rightarrow 0.47$
- $\Delta t = 7200\text{s} (2\text{ hours}) \rightarrow 0.05$
- $\Delta t > 7200\text{s} \rightarrow 0.00$

### 2.6. Threat Taxonomy & Related Alert Types (`related_alert_types`)
- **Condition**: Evaluates if the threat categories of both alerts are taxonomically related (e.g. `Credential Theft` $\leftrightarrow$ `Successful Login`, `SQL Injection` $\leftrightarrow$ `Web Server Compromise`).
- **Evidence**: `"Related alert categories ({type_a} and {type_b})"`

### 2.7. Attack Stage Progression (`attack_progression`)
- **Condition**: Maps alert types to MITRE ATT&CK kill-chain stages (1: Recon $\rightarrow$ 2: Execution $\rightarrow$ 3: PrivEsc/Creds $\rightarrow$ 4: Auth $\rightarrow$ 5: Lateral Movement $\rightarrow$ 6: C2 $\rightarrow$ 7: Collection $\rightarrow$ 8: Exfiltration). Returns `1.0` if `alert_a` stage precedes or equals `alert_b` stage in chronological sequence.
- **Evidence**: `"Plausible attack progression: {type_a} ({stage_a}) -> {type_b} ({stage_b})"`

---

## 3. Weighted Correlation Formula

$$\text{Correlation Score} = \left( \frac{\sum_{i=1}^{7} w_i \cdot \text{signal\_score}_i}{\sum_{i=1}^{7} w_i} \right) \times 100.0$$

### Configurable Signal Weights
- `same_user`: **0.20**
- `same_asset`: **0.20**
- `same_source_ip`: **0.15**
- `same_destination_ip`: **0.10**
- `temporal_proximity`: **0.15**
- `related_alert_types`: **0.10**
- `attack_progression`: **0.10**

---

## 4. Scalable Candidate Pair Indexing ($O(N)$ vs $O(N^2)$)

To prevent $O(N^2)$ comparison overhead (e.g. 10,000 alerts = 50 million pairs), alerts are indexed into hash buckets by `user_id`, `asset_id`, `source_ip`, and `destination_ip`. Only pairs sharing entity buckets within the correlation time window ($\Delta t \le 7200\text{s}$) are evaluated.

---

## 5. False Positive Considerations & Limitations

1. **Internal Shared Infrastructure**: Shared NAT proxies, central domain controllers, or internal security scanners may generate candidate pairs. The engine mitigates false positives by requiring multi-signal co-occurrence (e.g., matching user AND target asset AND temporal proximity).
2. **Correlation vs Causation**: High correlation score indicates strong circumstantial evidence that alerts are related; final incident validation occurs in clustering (Step 4).

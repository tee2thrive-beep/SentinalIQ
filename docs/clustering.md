# SentinelIQ — Incident Clustering Engine Documentation

## 1. Overview & Clustering Strategy

The **Incident Clustering Engine** converts pairwise alert correlation records into unified, explainable **Incident Clusters**.

```
┌─────────────────────────────────────────────────────────┐
│               Pairwise Correlation Edges (201)           │
└────────────────────────────┬────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────┐
│          Graph Connected Component Evaluator            │
│       (Clustering Threshold >= 45.0 Correlation)         │
└────────────────────────────┬────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────┐
│               Weak Bridge Edge Pruner                   │
│   (Prunes < 55.0 score edges with single signal)        │
└────────────────────────────┬────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────┐
│               Incident Feature Aggregators              │
│  - Affected Users Log Normalization                     │
│  - Max Asset Importance / Sensitivity / Impact          │
│  - Max & Avg Severity & Confidence                      │
│  - Kill Chain Progression & Precedence Classifier       │
└────────────────────────────┬────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────┐
│                Incident Datasets & Graph                │
│    (incidents.json, incidents.csv, incident_graph.json) │
└─────────────────────────────────────────────────────────┘
```

> [!IMPORTANT]
> **CLUSTER SCORE VS RISK SCORE**: The `cluster_score` ($0–100$) measures *internal cluster coherence and correlation signal strength*. It does **NOT** measure business impact or threat priority. Final six-factor risk prioritization occurs in Step 5.

---

## 2. Graph Connected Components & Weak Bridge Pruning

1. **Graph Construction**: Normalized alerts form nodes; correlation records exceeding `clustering_threshold = 45.0` form undirected edges.
2. **Weak Bridge Handling**: Single-signal edges (e.g. temporal proximity without matching user, asset, or IP) with correlation scores below `weak_bridge_threshold = 55.0` are pruned to prevent weak bridges from improperly merging distinct attack campaigns.
3. **Deterministic Ordering & Incident IDs**: Clusters are sorted chronologically by `first_seen` timestamp, then by `maximum_severity` (descending). Sequential IDs are assigned: `INC-0001`, `INC-0002`, ...

---

## 3. Resolving Deferred Affected-User Normalization

Raw alerts in Step 1 reference individual target users. At the incident level, unique affected users ($u$) are aggregated across all alerts in the cluster:

$$\text{normalized\_affected\_users} = \min \left( 100.0, 100.0 \times \frac{\log_{10}(1 + u)}{\log_{10}(1 + 1000)} \right)$$

- **Logarithmic Scaling Rationale**: $u=1$ yields $10.03$, $u=10$ yields $34.71$, $u=100$ yields $66.82$, $u=1000+$ yields $100.0$. This prevents large user populations from overwhelming technical risk factors.

---

## 4. Incident-Level Feature Aggregations

### 4.1. Asset Factors ($\max$)
- **`incident_asset_importance`**: $\max(\text{normalized\_asset\_importance})$ across cluster alerts.
- **`incident_data_sensitivity`**: $\max(\text{normalized\_data\_sensitivity})$ across cluster alerts.
- **`incident_business_impact`**: $\max(\text{normalized\_business\_impact})$ across cluster alerts.
- *Rationale*: A single high-value or PII database host dictates the criticality of the entire security incident.

### 4.2. Severity & Confidence Aggregations
- **`maximum_severity`**: $\max(\text{severity})$ — ensures extreme threats are never masked.
- **`average_severity`**: Mean severity across cluster alerts.
- **`maximum_confidence`**: $\max(\text{confidence})$.
- **`average_confidence`**: Mean confidence across cluster alerts.
- **`incident_confidence`**: Corroborated confidence: $\min(100.0, \text{maximum\_confidence} + 2.0 \times (\text{alert\_count} - 1))$.

---

## 5. Deterministic Incident Classification Hierarchy

Incident types are assigned using a deterministic precedence chain:

1. `Ransomware Outbreak` (contains `Ransomware Indicator`)
2. `Data Exfiltration` (contains `Data Exfiltration` or `Large Data Transfer`)
3. `Multi-stage Attack` (contains $\ge 3$ distinct kill-chain stages)
4. `Account Takeover` (contains `Impossible Travel` or `New Admin Account`)
5. `Web Application Attack` (contains `SQL Injection` or `Web Attack` or `Web Server Compromise`)
6. `DDoS Attack` (contains `DDoS`)
7. `Brute Force Attack` (contains `Brute Force`)
8. `Malware Infection` (contains `Malware Detection` or `Suspicious PowerShell`)
9. `Insider Data Theft` (contains `Unusual File Access`)
10. *Fallback*: Most frequent alert type.

---

## 6. Limitations

- **Graph Granularity**: Overly loose correlation thresholds could combine distinct concurrent incidents into mega-clusters. The engine prevents this via weak-bridge pruning and configurable signal thresholds.

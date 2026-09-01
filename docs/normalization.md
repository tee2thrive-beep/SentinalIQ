# SentinelIQ — Normalization Engine Documentation

## 1. Why Normalization Is Required

In cybersecurity incident response, risk factors originate from heterogeneous sources with different measurement units, continuous ranges, and qualitative tiers:
- Alert severities are reported on a 0–100 integer scale.
- Asset criticalities and data sensitivity are assigned via organizational asset management databases.
- Affected user populations vary from a single workstation user to thousands of enterprise employees.

To calculate a defensible, multi-attribute priority score in later stages ($\text{Priority Score} = \sum w_i \cdot \text{Factor}_i$), **all inputs must be normalized to a uniform 0–100 scale**. Without standard normalization, factors with high raw magnitudes (such as user counts) would skew priority rankings and distort risk visibility.

---

## 2. Factor Normalization Inventory

| Factor | Status | Source | Formula | Scale | Scope |
| :--- | :--- | :--- | :--- | :---: | :---: |
| **Severity** | Native | `alert.severity` | $\text{severity}$ | `0–100` | Alert |
| **Confidence** | Native | `alert.confidence` | $\text{confidence}$ | `0–100` | Alert |
| **Asset Importance** | Derived | Asset metadata | $0.6 \times \text{criticality} + 0.4 \times \text{business\_value}$ | `0–100` | Alert (via Asset FK) |
| **Data Sensitivity** | Derived | Asset metadata | $1.0 \times \text{data\_sensitivity}$ | `0–100` | Alert (via Asset FK) |
| **Business Impact** | Derived | Asset metadata | $0.5 \times \text{criticality} + 0.3 \times \text{business\_value} + 0.2 \times \text{data\_sensitivity}$ | `0–100` | Alert (via Asset FK) |
| **Affected Users** | **Deferred** | Incident aggregate | $100.0 \times \frac{\log(1 + u)}{\log(1 + u_{ref})}$ ($u_{ref}=1000$) | `0–100` | **Incident Level** |

---

## 3. Detailed Derivations & Mathematical Formulas

### 3.1. Native Factors: Severity & Confidence
- **Raw Severity**: Integer `0–100` reported directly by detection sensors.
- **Raw Confidence**: Integer `0–100` reflecting detector accuracy.
- **Transformation**: Preserved as `normalized_severity` and `normalized_confidence` without distortion.

### 3.2. Asset Importance Derivation
Target asset importance is a composite function of technical operational criticality and business strategic value:

$$\text{normalized\_asset\_importance} = 0.6 \times \text{criticality} + 0.4 \times \text{business\_value}$$

- **Rationale**: $60\%$ weight is assigned to operational criticality (e.g., Domain Controllers, Financial DBs), while $40\%$ is assigned to business strategic value. Both source fields are 0–100 in the asset schema.

### 3.3. Data Sensitivity Derivation
$$\text{normalized\_data\_sensitivity} = 1.0 \times \text{data\_sensitivity}$$

- **Rationale**: Directly reflects confidentiality requirements (e.g., restricted PII data = 95–100, public internal wiki = 10–30).

### 3.4. Business Impact Derivation
$$\text{normalized\_business_impact} = 0.5 \times \text{criticality} + 0.3 \times \text{business\_value} + 0.2 \times \text{data\_sensitivity}$$

- **Rationale**: Captures potential organizational impact across operational downtime ($50\%$), strategic loss ($30\%$), and regulatory compliance data breach exposure ($20\%$).

### 3.5. Affected Users Normalization (Deferred to Incident Stage)
Raw security alerts reference an individual target user (`user_id`). At the single-alert stage, fabricating an arbitrary user count would be inaccurate.

During **Step 4 (Incident Clustering)**, multiple correlated alerts will be aggregated into unified incidents, allowing exact count of unique affected users ($u$). The incident-level user score will be normalized using logarithmic saturation:

$$\text{normalized\_affected\_users} = \min \left( 100.0, 100.0 \times \frac{\log_{10}(1 + u)}{\log_{10}(1 + 1000)} \right)$$

- **Logarithmic Scaling Rationale**: The difference between 1 user and 10 users ($+9$ users) represents a $10\times$ risk increase. The difference between 5,000 and 5,009 users is negligible. Logarithmic scaling prevents large user populations from dominating all other security factors.

---

## 4. Error Handling & Validation Safeguards

1. **Foreign Key Verification**: Alerts referencing unknown `asset_id` or `user_id` values are rejected during validation with clear error messages.
2. **Strict Range Enforcement**: Values outside `0–100` or malformed IP addresses / timestamps trigger explicit parser/validator exceptions.
3. **No Silent Mutations**: Rejection reports record all invalid entries in `rejected_records` log without altering original data.

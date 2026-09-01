# SentinelIQ — Synthetic Cybersecurity Dataset Documentation

## Overview

This dataset provides synthetic cybersecurity telemetry generated for **SentinelIQ**, a hackathon prototype for **PS-03 — Cyber Incident Prioritization Engine**.

> [!IMPORTANT]
> **SYNTHETIC DATA DISCLAIMER**: This dataset consists entirely of artificially generated synthetic data created specifically for software testing, algorithm validation, and hackathon demonstration purposes. It does not represent real-world enterprise telemetry, live security incidents, or real user records.

---

## Dataset Purpose & Rationale

Building cybersecurity engines (correlation, incident clustering, risk prioritization) requires complex, multi-stage attack scenarios intertwined with benign background traffic. Using synthetic data allows us to:
1. **Safely Test Correlation Algorithms**: Embed deterministic, multi-step kill chains (e.g. Phishing $\rightarrow$ Privilege Escalation $\rightarrow$ Data Exfiltration) without handling sensitive real-world logs.
2. **Ensure Reproducibility**: Guarantee fixed random seed seeding (`seed=42`) for predictable testing and benchmarking across development runs.
3. **Control Signal-to-Noise Ratio**: Test algorithm resilience by mixing 45 correlated attack alerts with 114 benign background noise events.

---

## Data File Specifications

The dataset is generated in both **JSON** and **CSV** formats inside the `data/` directory:

| Entity | JSON File | CSV File | Record Count | Description |
| :--- | :--- | :--- | :---: | :--- |
| **Assets** | `data/assets.json` | `data/assets.csv` | **35** | IT & cloud assets across LOW, MEDIUM, HIGH, and CRITICAL tiers. |
| **Users** | `data/users.json` | `data/users.csv` | **55** | Corporate users across departments with assigned privilege levels. |
| **Alerts** | `data/alerts.json` | `data/alerts.csv` | **159** | Raw security alerts containing timestamps, IPs, severities, and descriptions. |

---

## Field Definitions

### 1. Assets Schema (`assets.json` / `assets.csv`)

| Field | Type | Description | Scale / Values |
| :--- | :--- | :--- | :--- |
| `asset_id` | string | Unique primary key identifier | e.g. `ast_dc_01`, `ast_db_fin`, `ast_wkst_01` |
| `hostname` | string | Fully qualified domain name | e.g. `fin-db-prod.corp.internal` |
| `asset_type` | string | Classification of hardware or cloud entity | `workstation`, `laptop`, `web_server`, `application_server`, `database_server`, `domain_controller`, `file_server`, `email_server`, `firewall`, `cloud_server`, `test_server` |
| `department` | string | Department managing or using the asset | `Finance`, `HR`, `IT`, `Engineering`, `Sales`, `Operations`, `Security`, `Executive` |
| `criticality` | integer | Operational importance to the business | **0–100** (Low: 10–39, Medium: 40–69, High: 70–89, Critical: 90–100) |
| `data_sensitivity` | integer | Confidentiality level of hosted data | **0–100** (PII / Restricted: 90–100, Confidential: 70–89, Internal: 40–69, Public: 10–39) |
| `business_value` | integer | Financial / strategic asset valuation | **0–100** |
| `owner_department`| string | Primary administrative owner department | e.g. `IT`, `Finance`, `Engineering` |

---

### 2. Users Schema (`users.json` / `users.csv`)

| Field | Type | Description | Scale / Values |
| :--- | :--- | :--- | :--- |
| `user_id` | string | Unique primary key identifier | e.g. `usr_fin_mgr`, `usr_sysadmin`, `usr_008` |
| `username` | string | Corporate single sign-on handle | e.g. `alice.smith`, `charlie.admin` |
| `department` | string | Organizational unit | `Finance`, `HR`, `IT`, `Engineering`, `Sales`, `Operations`, `Security`, `Executive` |
| `role` | string | Formal job function | e.g. `Finance Manager`, `DevOps Engineer`, `SOC Analyst` |
| `privilege_level` | string | System Access Authorization Level | `standard` (70%), `elevated` (20%), `administrator` (10%) |
| `asset_id` | string | Primary workstation/laptop assigned to user | References `assets.asset_id` |
| `risk_level` | string | Pre-existing user behavioral risk rating | `low`, `medium`, `high` |

---

### 3. Raw Alerts Schema (`alerts.json` / `alerts.csv`)

| Field | Type | Description | Scale / Values |
| :--- | :--- | :--- | :--- |
| `alert_id` | string | Unique primary key identifier | e.g. `alt_0001` through `alt_0159` |
| `timestamp` | string | ISO 8601 UTC timestamp | e.g. `2026-09-01T08:05:00+00:00` |
| `alert_type` | string | Standardized security threat category | `Failed Login`, `Successful Login After Failures`, `Port Scan`, `Brute Force`, `Malware Detection`, `Suspicious PowerShell`, `Credential Theft`, `Privilege Escalation`, `Unauthorized Access`, `SQL Injection`, `Web Attack`, `Data Exfiltration`, `DDoS`, `Suspicious DNS`, `Suspicious Email`, `Impossible Travel`, `New Admin Account`, `Ransomware Indicator`, `Lateral Movement`, `Command and Control` |
| `source_ip` | string | Originating network IP address | Private (`10.0.x.x`, `192.168.x.x`, `172.16.x.x`) or External (`185.220.101.5`, `198.51.100.44`, `203.0.113.15`, `45.33.32.x`) |
| `destination_ip` | string | Target entity IP address | Target asset interface IP |
| `user_id` | string | User context tied to alert | References `users.user_id` |
| `asset_id` | string | Target asset tied to alert | References `assets.asset_id` |
| `severity` | integer | Initial raw detector severity | **0–100** |
| `description` | string | Human-readable log narrative | Narrative detailing detection context |
| `confidence` | integer | Detection engine confidence score | **0–100** |
| `status` | string | Current alert state | `open`, `investigating`, `closed` |

---

## Embedded Correlated Attack Campaigns

To test graph correlation and incident clustering algorithms, **8 multi-stage attack campaigns** are woven into the timeline without explicit `campaign_id` tags. Correlation engines must discover these campaigns via entity resolution, shared IP addresses, user accounts, target assets, and tight time windows:

```
Campaign 1: Credential Theft & Financial Exfiltration (7 alerts)
   Phishing Email ──► Credential Theft (LSASS Dump) ──► Successful Login ──► Privilege Escalation ──► Lateral Movement ──► Unauthorized DB Query ──► Data Exfiltration (185.220.101.5)

Campaign 2: Phishing & C2 Malware Campaign (5 alerts)
   Phishing Email ──► Encoded PowerShell ──► Trojan Dropper Malware ──► Beaconing C2 Traffic (198.51.100.44) ──► SMB Lateral Movement

Campaign 3: External Brute Force to Payment Server (5 alerts)
   SSH Brute Force ──► Login After Failures ──► Sudo Privilege Escalation ──► Payment Memory Access

Campaign 4: Web Application SQL Injection to Customer Database (5 alerts)
   Web Vulnerability Scan ──► SQL Injection ──► Webshell Execution ──► DB Dump ──► DNS Tunnel Exfiltration

Campaign 5: Multi-Host Ransomware Outbreak (5 alerts)
   PowerShell Shadow Copy Disable ──► Ransomware Renaming ──► WMI Lateral Movement ──► Ransom Note Drop ──► Secondary Host Infection

Campaign 6: Edge DDoS & Botnet Orchestration (4 alerts)
   Subnet Port Scan ──► UDP Flood 50Gbps ──► HTTP Slowloris ──► Inbound Botnet C2

Campaign 7: Account Takeover & Impossible Travel (5 alerts)
   London Login ──► Impossible Travel (Tokyo 5m later) ──► Cloud Portal Access ──► New Admin Account Creation ──► Executive Database Access

Campaign 8: Insider Malicious Data Theft (4 alerts)
   DB Backup Access ──► Proprietary Source Download ──► Cloud C2 Link ──► Exfiltration to Personal MegaUpload (15GB)
```

---

## Known Limitations

1. **Static Telemetry**: Generated offline in a single batch rather than streaming live.
2. **Simplified Network Topology**: Network subnets are simplified into flat internal zones (`10.0.x.x`, `192.168.x.x`, `172.16.x.x`) without full BGP/VLAN routing metadata.
3. **Fixed Seeding**: Default seed is set to `42` for determinism. Changing the seed will generate a different valid synthetic environment.

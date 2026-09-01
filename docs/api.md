# SentinelIQ — REST API Contract Documentation

## 1. Overview & Base URL

The **SentinelIQ REST API** (`backend/api/`) exposes investigative data, priority queues, and report payloads to SOC web dashboards and security analysts.

- **Base URL**: `http://localhost:8000/api`
- **Format**: `application/json`
- **Error Codes**:
  - `400 Bad Request` — Invalid query parameters or filter criteria.
  - `404 Not Found` — Specified incident ID does not exist.

---

## 2. API Endpoints

### `GET /api/health`
Returns the operational health status of the SentinelIQ prioritization engine.

**Response (200 OK)**:
```json
{
  "status": "ok",
  "service": "SentinelIQ",
  "version": "1.0"
}
```

---

### `GET /api/incidents`
Returns the ordered investigation priority queue with pagination and filtering. Preserves Step 6 priority rank ordering.

**Query Parameters**:
- `page` (int, default=1): Page number (1-indexed).
- `page_size` (int, default=20, max=100): Items per page.
- `risk_level` (string, optional): Filter by risk level (`LOW`, `MEDIUM`, `HIGH`, `CRITICAL`).
- `incident_type` (string, optional): Filter by incident type name substring.

**Response (200 OK)**:
```json
{
  "total": 111,
  "page": 1,
  "page_size": 2,
  "total_pages": 56,
  "items": [
    {
      "priority_rank": 1,
      "incident_id": "INC-0021",
      "risk_score": 90.20,
      "risk_level": "CRITICAL",
      "priority_band": "CRITICAL",
      "incident_type": "Multi-stage Attack",
      "first_seen": "2026-09-01T08:05:00+00:00",
      "alert_count": 9,
      "affected_users": 1,
      "dominant_factors": ["business_impact", "asset_importance", "severity"],
      "tie_group_id": null
    }
  ]
}
```

---

### `GET /api/incidents/{incident_id}`
Returns the complete canonical investigation report for a specific incident.

**Response (200 OK)**: Full JSON report matching version 1.0 schema.  
**Response (404 Not Found)**: `{"detail": "Incident ID 'INC-9999' not found."}`

---

### `GET /api/incidents/{incident_id}/timeline`
Returns the chronological timeline of alerts belonging to the incident.

---

### `GET /api/incidents/{incident_id}/risk`
Returns the risk score formula, six-factor values, weights, contributions, and dominant factor drivers.

---

### `GET /api/incidents/{incident_id}/correlations`
Returns the correlation evidence relationships between alerts in the incident.

---

### `GET /api/incidents/{incident_id}/recommendations`
Returns the rule-based automated investigation and containment recommendations.

# SentinelIQ — Operations & Runbook Guide

This runbook provides administrative guidelines for managing, monitoring, troubleshooting, and recovering the **SentinelIQ Cyber Incident Prioritization Engine (PS-03)** in production.

---

## 1. Daily Operations & System Checks

### Health & Readiness Endpoints
- **Health Check**: `GET /api/health` — Verifies HTTP server listener responsiveness.
- **Readiness Check**: `GET /api/ready` — Verifies that all Step 1–8 datasets are loaded and indexed in memory.

### Monitoring Commands
```bash
# Check FastAPI backend process
curl -s http://localhost:8000/api/health | jq .

# Check readiness status & indexed counts
curl -s http://localhost:8000/api/ready | jq .
```

---

## 2. Structured Logging & Log Analysis

Log entries are emitted to `stdout` in standard key-value format:
`[TIMESTAMP] [LEVEL] [LOGGER]: MESSAGE`

### Inspecting Logs
```bash
# Direct process logs
uvicorn backend.api.app:app ... | grep "ERROR"

# Docker logs
docker compose logs -f --tail=100
```

---

## 3. Data Integrity & Backups

### Authoritative Canonical Datasets
SentinelIQ relies on JSON datasets stored in `data/`:
- `data/scored_incidents.json` (111 scored incidents)
- `data/priority_queue.json` (111 ranked incidents)
- `data/reports/` (111 canonical JSON investigation reports)
- `data/simulation/` (What-if scenario comparisons)

### Backup Procedure
To preserve generated datasets and reports:
```bash
tar -czvf sentineliq_data_backup_$(date +%F).tar.gz data/
```

---

## 4. Troubleshooting Common Issues

| Symptom | Cause | Solution |
| :--- | :--- | :--- |
| **503 Service Unavailable on `/api/ready`** | Missing or corrupted `data/` JSON files | Verify `data/` directory contents exist and run data generator if needed. |
| **CORS Policy Error in Browser** | `SENTINELIQ_CORS_ORIGINS` misconfigured | Add frontend origin URL to `SENTINELIQ_CORS_ORIGINS` in `.env`. |
| **404 Not Found on Route Refresh** | Missing Nginx SPA fallback rule | Ensure `try_files $uri $uri/ /index.html;` is present in `nginx.conf`. |
| **Port 8000 Already in Use** | Port conflict with another process | Change `SENTINELIQ_API_PORT` in `.env` or terminate conflicting process. |

---

## 5. System Recovery Sequence

If the backend service crashes or fails readiness check:
1. Restart backend process:
   ```bash
   uvicorn backend.api.app:app --host 0.0.0.0 --port 8000
   ```
2. Verify readiness:
   ```bash
   curl http://localhost:8000/api/ready
   ```
3. Verify test suite passing:
   ```bash
   python -m unittest discover -s tests
   ```

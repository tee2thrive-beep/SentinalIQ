# SentinelIQ — Production Deployment Guide

This document provides step-by-step instructions for deploying the **SentinelIQ Cyber Incident Prioritization Engine (PS-03)** in local, virtual machine (VPS/Linux), Nginx reverse proxy, and Docker container environments.

---

## 1. Prerequisites

- **Python**: Version 3.10+ (Python 3.14 verified)
- **Node.js**: Version 18+ (Node 20 verified)
- **Git**: For cloning the repository
- **Nginx** (Optional): For reverse proxying and static asset serving
- **Docker & Docker Compose** (Optional): For containerized deployment

---

## 2. Environment Configuration

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
2. Configure variables for your deployment target:
   ```ini
   SENTINELIQ_ENV=production
   SENTINELIQ_API_HOST=0.0.0.0
   SENTINELIQ_API_PORT=8000
   SENTINELIQ_CORS_ORIGINS=https://sentineliq.example.com
   SENTINELIQ_LOG_LEVEL=INFO
   VITE_API_BASE_URL=https://sentineliq.example.com
   ```

---

## 3. Option A: Native Linux / Bare Metal Deployment

### Step 1: Backend Setup
```bash
# Create and activate Python virtual environment
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate

# Install backend dependencies
pip install -r requirements.txt

# Start FastAPI Uvicorn production server
uvicorn backend.api.app:app --host 0.0.0.0 --port 8000 --workers 4
```

### Step 2: Frontend Build & Static Serving
```bash
cd frontend

# Install Node dependencies
npm ci

# Build production SPA bundle
npm run build
```
The compiled static assets are generated in `frontend/dist/`.

---

## 4. Option B: Nginx Reverse Proxy & HTTPS Deployment

1. Copy `deploy/nginx.conf` to your Nginx configuration directory (`/etc/nginx/sites-available/sentineliq.conf`).
2. Copy `frontend/dist/` to `/var/www/sentineliq/dist`.
3. Enable site and restart Nginx:
   ```bash
   sudo ln -s /etc/nginx/sites-available/sentineliq.conf /etc/nginx/sites-enabled/
   sudo systemctl restart nginx
   ```
4. Obtain free SSL/TLS certificate via Certbot:
   ```bash
   sudo certbot --nginx -d sentineliq.example.com
   ```

---

## 5. Option C: Containerized Docker Deployment

To build and launch the entire production application in an isolated container stack:

```bash
# Build and run containers in detached mode
docker compose up --build -d

# Verify container status and health
docker compose ps

# View container logs
docker compose logs -f
```
The API and embedded SPA will be available at `http://localhost:8000`.

---

## 6. Deployment Verification

Execute health and readiness probes:
```bash
# Health check
curl -f http://localhost:8000/api/health

# Readiness check
curl -f http://localhost:8000/api/ready
```
Expected output: `{"status": "ok", ...}` and `{"status": "ready", ...}`.

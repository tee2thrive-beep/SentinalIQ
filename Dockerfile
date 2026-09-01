# Stage 1: Build React Frontend
FROM node:20-alpine AS build-stage
WORKDIR /app/frontend

COPY frontend/package*.json ./
RUN npm ci

COPY frontend/ ./
RUN npm run build

# Stage 2: Production Python API Runtime
FROM python:3.11-slim AS runtime-stage

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application backend & datasets
COPY backend/ ./backend/
COPY data/ ./data/
COPY docs/ ./docs/

# Copy compiled frontend static bundle
COPY --from=build-stage /app/frontend/dist ./frontend/dist

# Set production environment variables
ENV SENTINELIQ_ENV=production \
    SENTINELIQ_API_HOST=0.0.0.0 \
    SENTINELIQ_API_PORT=8000 \
    SENTINELIQ_LOG_LEVEL=INFO \
    PYTHONPATH=/app

EXPOSE 8000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD curl -f http://localhost:8000/api/health || exit 1

CMD ["uvicorn", "backend.api.app:app", "--host", "0.0.0.0", "--port", "8000"]

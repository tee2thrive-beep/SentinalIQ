from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from typing import Dict, Any, Optional

from backend.reporting.evidence import load_reporting_datasets
from backend.reporting.generator import generate_incident_report

from backend.api.store import IncidentDataStore

from backend.config import settings
from backend.api.logger import logger
from fastapi.responses import JSONResponse
from fastapi.requests import Request
from fastapi import HTTPException

from fastapi.exceptions import RequestValidationError

def create_app() -> FastAPI:
    app = FastAPI(
        title="SentinelIQ — Cyber Incident Prioritization Engine",
        description="Explainable Cyber Incident Prioritization & Investigation API Contract",
        version=settings.VERSION
    )

    origins = settings.cors_origins
    logger.info(f"Initializing SentinelIQ API (env={settings.ENV}, cors_origins={origins})")

    app.add_middleware(
        CORSMiddleware,
        allow_origins=origins,
        allow_credentials=True,
        allow_methods=["GET", "POST", "OPTIONS"],
        allow_headers=["*"],
    )

    @app.exception_handler(RequestValidationError)
    async def validation_exception_handler(request: Request, exc: RequestValidationError):
        logger.warning(f"Validation Error on {request.url.path}: {exc.errors()}")
        return JSONResponse(
            status_code=422,
            content={"error": True, "status_code": 422, "detail": exc.errors()}
        )

    @app.exception_handler(HTTPException)
    async def http_exception_handler(request: Request, exc: HTTPException):
        logger.warning(f"HTTP {exc.status_code} on {request.url.path}: {exc.detail}")
        return JSONResponse(
            status_code=exc.status_code,
            content={"error": True, "status_code": exc.status_code, "detail": exc.detail}
        )


    @app.exception_handler(Exception)
    async def unhandled_exception_handler(request: Request, exc: Exception):
        logger.error(f"Unhandled Server Error on {request.url.path}: {str(exc)}")
        return JSONResponse(
            status_code=500,
            content={"error": True, "status_code": 500, "detail": "Internal server error occurred."}
        )

    @app.get("/")
    def root_welcome():
        return {
            "service": "SentinelIQ — Cyber Incident Prioritization Engine",
            "status": "operational",
            "version": settings.VERSION,
            "endpoints": {
                "health": "/api/health",
                "ready": "/api/ready",
                "incidents": "/api/incidents",
                "docs": "/docs"
            }
        }

    # Import and include routes
    from backend.api.routes import router
    app.include_router(router, prefix="/api")

    return app


app = create_app()


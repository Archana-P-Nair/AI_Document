# backend/app/main.py
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from app.database import engine, Base, SessionLocal
from app.routes import auth_routes, project_routes, document_routes
from sqlalchemy import text
import logging
import os

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(
    title="AI Document Platform API",
    description="Backend API for AI-powered document generation",
    version="1.0.0"
)

# FINAL WORKING CORS — THIS FIXES REGISTER/LOGIN ON VERCEL
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],           # Allows your frontend from any domain
    allow_credentials=True,
    allow_methods=["*"],           # Allows GET, POST, OPTIONS, etc.
    allow_headers=["*"],
)

# Database startup
@app.on_event("startup")
async def startup_event():
    try:
        Base.metadata.create_all(bind=engine)
        logger.info("Database tables ready")

        db = SessionLocal()
        db.execute(text("SELECT 1"))
        db.close()
        logger.info("Database connection successful")
    except Exception as e:
        logger.error(f"Database startup failed: {e}")

    # Check for Gemini API Key
    if not os.getenv("GEMINI_API_KEY"):
        logger.warning("GEMINI_API_KEY not found in environment variables!")

# Include routers
app.include_router(auth_routes.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(project_routes.router, prefix="/api/projects", tags=["Projects"])
app.include_router(document_routes.router, prefix="/api/documents", tags=["Documents"])

# Root & health
@app.get("/")
def read_root():
    return {"message": "AI Document Platform API is running", "status": "active"}

@app.get("/health")
def health_check():
    try:
        db = SessionLocal()
        db.execute(text("SELECT 1"))
        db.close()
        return {"status": "healthy", "database": "connected"}
    except Exception as e:
        return {"status": "unhealthy", "error": str(e)}

# Debug route (optional - you can keep it)
@app.get("/debug/routes")
def debug_routes():
    routes = [
        {"path": r.path, "methods": list(r.methods)} for r in app.routes
    ]
    return {"total_routes": len(routes), "routes": routes}

# Global exception handler
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled error: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error"}
    )

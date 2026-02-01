from fastapi import FastAPI, HTTPException, Depends, status, UploadFile, File, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, StreamingResponse, FileResponse
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from typing import List, Optional
import logging
from datetime import datetime

from app.database import engine, get_db
from app.models import Base
from app import routers

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Create tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Mineralogický deník API",
    description="API pro správu mineralogických lokalit",
    version="1.0.0"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify exact origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(routers.auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(routers.locations.router, prefix="/api/locations", tags=["locations"])
app.include_router(routers.photos.router, prefix="/api/photos", tags=["photos"])
app.include_router(routers.blogs.router, prefix="/api/blogs", tags=["blogs"])
app.include_router(routers.finds.router, prefix="/api/finds", tags=["finds"])
app.include_router(routers.exports.router, prefix="/api/exports", tags=["exports"])
app.include_router(routers.users.router, prefix="/api/users", tags=["users"])
app.include_router(routers.tags.router, prefix="/api/tags", tags=["tags"])

@app.get("/")
async def root():
    return {
        "message": "Mineralogický deník API",
        "version": "1.0.0",
        "status": "running"
    }

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat()
    }

@app.on_event("startup")
async def startup_event():
    logger.info("Starting Mineralogický deník API...")
    # Create upload directory
    import os
    os.makedirs("/app/uploads", exist_ok=True)
    os.makedirs("/app/uploads/photos", exist_ok=True)
    os.makedirs("/app/uploads/thumbnails", exist_ok=True)

@app.on_event("shutdown")
async def shutdown_event():
    logger.info("Shutting down Mineralogický deník API...")

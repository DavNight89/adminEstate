"""
PropertyPro Backend API
FastAPI server for property management
"""
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Optional
from datetime import datetime
import uvicorn


# Import routers
from api.properties import router as properties_router
from api.tenants import router as tenants_router
from api.workorders import router as workorders_router
from api.transactions import router as transactions_router
from api.documents import router as documents_router
from api.analytics import router as analytics_router

# Initialize FastAPI app
app = FastAPI(
    title="PropertyPro API",
    description="Backend API for Property Management System",
    version="1.0.0"
)

# Configure CORS for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # React dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(properties_router, prefix="/api/properties", tags=["Properties"])
app.include_router(tenants_router, prefix="/api/tenants", tags=["Tenants"])
app.include_router(workorders_router, prefix="/api/workorders", tags=["Work Orders"])
app.include_router(transactions_router, prefix="/api/transactions", tags=["Transactions"])
app.include_router(documents_router, prefix="/api/documents", tags=["Documents"])
app.include_router(analytics_router, prefix="/api/analytics", tags=["Analytics"])

@app.get("/")
async def root():
    """Health check endpoint"""
    return {
        "message": "PropertyPro API is running",
        "version": "1.0.0",
        "timestamp": datetime.now().isoformat()
    }

@app.get("/health")
async def health_check():
    """Detailed health check"""
    return {
        "status": "healthy",
        "database": "connected",
        "timestamp": datetime.now().isoformat()
    }

if __name__ == "__main__":
    # Run with: python main.py
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True  # Auto-reload on code changes
    )

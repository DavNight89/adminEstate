"""
DataFrame API Endpoints
Alternative API endpoints using DataFrame service
These can be used to test the DataFrame functionality
"""
from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional, Dict, Any
from models.schemas import Property, PropertyCreate, PropertyUpdate
from services.dataframe_service import df_service

router = APIRouter(prefix="/dataframe", tags=["DataFrame Service"])

@router.get("/properties", response_model=List[Property])
async def get_properties_df(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    search: Optional[str] = None
):
    """Get all properties using DataFrame service"""
    properties = await df_service.get_properties(skip=skip, limit=limit, search=search)
    return properties

@router.get("/properties/{property_id}", response_model=Property)
async def get_property_df(property_id: str):
    """Get a specific property by ID using DataFrame service"""
    property = await df_service.get_property(property_id)
    if not property:
        raise HTTPException(status_code=404, detail="Property not found")
    return property

@router.post("/properties", response_model=Property, status_code=201)
async def create_property_df(property_data: PropertyCreate):
    """Create a new property using DataFrame service"""
    property = await df_service.create_property(property_data)
    return property

@router.get("/analytics", response_model=Dict[str, Any])
async def get_analytics_df():
    """Get property analytics using DataFrame service"""
    analytics = df_service.get_property_analytics()
    return analytics

@router.get("/occupancy-trends", response_model=Dict[str, Any])
async def get_occupancy_trends_df():
    """Get occupancy trends using DataFrame service"""
    trends = df_service.get_occupancy_trends()
    return trends

@router.get("/data-summary", response_model=Dict[str, Any])
async def get_data_summary_df():
    """Get comprehensive data summary"""
    summary = df_service.get_data_summary()
    return summary

@router.post("/export-excel")
async def export_excel_df(filename: str = "property_data.xlsx"):
    """Export all data to Excel file"""
    success = df_service.export_to_excel(filename)
    if success:
        return {"message": f"Data exported to {filename}", "success": True}
    else:
        raise HTTPException(status_code=500, detail="Export failed")

@router.get("/health")
async def health_check_df():
    """Health check for DataFrame service"""
    return {
        "service": "DataFrame Service",
        "status": "healthy",
        "data_directory": str(df_service.data_dir),
        "records": {
            "properties": len(df_service.df_properties),
            "tenants": len(df_service.df_tenants),
            "workorders": len(df_service.df_workorders),
            "transactions": len(df_service.df_transactions),
            "documents": len(df_service.df_documents)
        }
    }
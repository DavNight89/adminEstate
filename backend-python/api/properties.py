"""
Properties API endpoints
"""
from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional
from models.schemas import Property, PropertyCreate, PropertyUpdate
from services.database import db_service

router = APIRouter()

@router.get("/", response_model=List[Property])
async def get_properties(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    search: Optional[str] = None
):
    """Get all properties with optional search"""
    properties = await db_service.get_properties(skip=skip, limit=limit, search=search)
    return properties

@router.get("/{property_id}", response_model=Property)
async def get_property(property_id: str):
    """Get a specific property by ID"""
    property = await db_service.get_property(property_id)
    if not property:
        raise HTTPException(status_code=404, detail="Property not found")
    return property

@router.post("/", response_model=Property, status_code=201)
async def create_property(property_data: PropertyCreate):
    """Create a new property"""
    property = await db_service.create_property(property_data)
    return property

@router.put("/{property_id}", response_model=Property)
async def update_property(property_id: str, property_data: PropertyUpdate):
    """Update an existing property"""
    property = await db_service.update_property(property_id, property_data)
    if not property:
        raise HTTPException(status_code=404, detail="Property not found")
    return property

@router.delete("/{property_id}")
async def delete_property(property_id: str):
    """Delete a property"""
    success = await db_service.delete_property(property_id)
    if not success:
        raise HTTPException(status_code=404, detail="Property not found")
    return {"message": "Property deleted successfully"}

@router.get("/{property_id}/tenants")
async def get_property_tenants(property_id: str):
    """Get all tenants for a specific property"""
    tenants = await db_service.get_property_tenants(property_id)
    return tenants

@router.get("/{property_id}/workorders")
async def get_property_workorders(property_id: str):
    """Get all work orders for a specific property"""
    workorders = await db_service.get_property_workorders(property_id)
    return workorders

@router.get("/{property_id}/occupancy")
async def get_property_occupancy(property_id: str):
    """Get occupancy statistics for a property"""
    property = await db_service.get_property(property_id)
    if not property:
        raise HTTPException(status_code=404, detail="Property not found")

    return {
        "property_id": property_id,
        "total_units": property.units,
        "occupied_units": property.occupied,
        "vacant_units": property.units - property.occupied,
        "occupancy_rate": (property.occupied / property.units * 100) if property.units > 0 else 0
    }

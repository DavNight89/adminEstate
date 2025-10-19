"""
Work Orders API endpoints
"""
from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional
from models.schemas import WorkOrder, WorkOrderCreate, WorkOrderUpdate, WorkOrderStatus, WorkOrderPriority
from services.database import db_service

router = APIRouter()

@router.get("/", response_model=List[WorkOrder])
async def get_workorders(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    status: Optional[WorkOrderStatus] = None,
    priority: Optional[WorkOrderPriority] = None,
    property_id: Optional[str] = None
):
    """Get all work orders with optional filters"""
    workorders = await db_service.get_workorders(
        skip=skip,
        limit=limit,
        status=status,
        priority=priority,
        property_id=property_id
    )
    return workorders

@router.get("/{workorder_id}", response_model=WorkOrder)
async def get_workorder(workorder_id: str):
    """Get a specific work order by ID"""
    workorder = await db_service.get_workorder(workorder_id)
    if not workorder:
        raise HTTPException(status_code=404, detail="Work order not found")
    return workorder

@router.post("/", response_model=WorkOrder, status_code=201)
async def create_workorder(workorder_data: WorkOrderCreate):
    """Create a new work order"""
    workorder = await db_service.create_workorder(workorder_data)
    return workorder

@router.put("/{workorder_id}", response_model=WorkOrder)
async def update_workorder(workorder_id: str, workorder_data: WorkOrderUpdate):
    """Update an existing work order"""
    workorder = await db_service.update_workorder(workorder_id, workorder_data)
    if not workorder:
        raise HTTPException(status_code=404, detail="Work order not found")
    return workorder

@router.delete("/{workorder_id}")
async def delete_workorder(workorder_id: str):
    """Delete a work order"""
    success = await db_service.delete_workorder(workorder_id)
    if not success:
        raise HTTPException(status_code=404, detail="Work order not found")
    return {"message": "Work order deleted successfully"}

@router.patch("/{workorder_id}/status")
async def update_workorder_status(workorder_id: str, status: WorkOrderStatus):
    """Update work order status"""
    workorder = await db_service.update_workorder_status(workorder_id, status)
    if not workorder:
        raise HTTPException(status_code=404, detail="Work order not found")
    return workorder

@router.get("/urgent/list")
async def get_urgent_workorders():
    """Get all high-priority open work orders"""
    workorders = await db_service.get_workorders(
        status=WorkOrderStatus.OPEN,
        priority=WorkOrderPriority.HIGH
    )
    return {
        "count": len(workorders),
        "workorders": workorders
    }

"""
Tenants API endpoints
"""
from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional
from models.schemas import Tenant, TenantCreate, TenantUpdate, TenantStatus
from services.database import db_service

router = APIRouter()

@router.get("/", response_model=List[Tenant])
async def get_tenants(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    status: Optional[TenantStatus] = None,
    property_id: Optional[str] = None
):
    """Get all tenants with optional filters"""
    tenants = await db_service.get_tenants(
        skip=skip,
        limit=limit,
        status=status,
        property_id=property_id
    )
    return tenants

@router.get("/{tenant_id}", response_model=Tenant)
async def get_tenant(tenant_id: str):
    """Get a specific tenant by ID"""
    tenant = await db_service.get_tenant(tenant_id)
    if not tenant:
        raise HTTPException(status_code=404, detail="Tenant not found")
    return tenant

@router.post("/", response_model=Tenant, status_code=201)
async def create_tenant(tenant_data: TenantCreate):
    """Create a new tenant"""
    tenant = await db_service.create_tenant(tenant_data)
    return tenant

@router.put("/{tenant_id}", response_model=Tenant)
async def update_tenant(tenant_id: str, tenant_data: TenantUpdate):
    """Update an existing tenant"""
    tenant = await db_service.update_tenant(tenant_id, tenant_data)
    if not tenant:
        raise HTTPException(status_code=404, detail="Tenant not found")
    return tenant

@router.delete("/{tenant_id}")
async def delete_tenant(tenant_id: str):
    """Delete a tenant"""
    success = await db_service.delete_tenant(tenant_id)
    if not success:
        raise HTTPException(status_code=404, detail="Tenant not found")
    return {"message": "Tenant deleted successfully"}

@router.get("/{tenant_id}/transactions")
async def get_tenant_transactions(tenant_id: str):
    """Get all transactions for a specific tenant"""
    transactions = await db_service.get_tenant_transactions(tenant_id)
    return transactions

@router.get("/{tenant_id}/workorders")
async def get_tenant_workorders(tenant_id: str):
    """Get all work orders for a specific tenant"""
    workorders = await db_service.get_tenant_workorders(tenant_id)
    return workorders

@router.get("/overdue/list")
async def get_overdue_tenants():
    """Get all tenants with overdue payments"""
    tenants = await db_service.get_tenants(status=TenantStatus.OVERDUE)
    return {
        "count": len(tenants),
        "total_outstanding": sum(t.outstanding_balance for t in tenants),
        "tenants": tenants
    }

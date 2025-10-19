"""
Pydantic models for request/response validation
Matches data structure from your React app
"""
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime, date
from enum import Enum

# ===== ENUMS =====
class PropertyType(str, Enum):
    RESIDENTIAL = "residential"
    COMMERCIAL = "commercial"
    MIXED = "mixed"

class TenantStatus(str, Enum):
    ACTIVE = "active"
    OVERDUE = "overdue"
    INACTIVE = "inactive"

class WorkOrderStatus(str, Enum):
    OPEN = "Open"
    IN_PROGRESS = "In Progress"
    COMPLETED = "Completed"
    CLOSED = "Closed"

class WorkOrderPriority(str, Enum):
    LOW = "Low"
    MEDIUM = "Medium"
    HIGH = "High"
    URGENT = "Urgent"

class TransactionType(str, Enum):
    INCOME = "income"
    EXPENSE = "expense"

# ===== PROPERTY MODELS =====
class PropertyBase(BaseModel):
    name: str
    address: str
    type: PropertyType
    units: int = 0
    occupied: int = 0
    value: Optional[float] = None

class PropertyCreate(PropertyBase):
    pass

class PropertyUpdate(PropertyBase):
    pass

class Property(PropertyBase):
    id: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

# ===== TENANT MODELS =====
class TenantBase(BaseModel):
    name: str
    email: Optional[str] = None
    phone: Optional[str] = None
    property: str  # Property ID
    unit: Optional[str] = None
    rent: float
    lease_start: date
    lease_end: date
    status: TenantStatus = TenantStatus.ACTIVE
    outstanding_balance: float = 0.0

class TenantCreate(TenantBase):
    pass

class TenantUpdate(TenantBase):
    pass

class Tenant(TenantBase):
    id: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

# ===== WORK ORDER MODELS =====
class WorkOrderBase(BaseModel):
    title: str
    description: str
    property: str  # Property ID
    tenant: Optional[str] = None  # Tenant ID
    category: str
    priority: WorkOrderPriority
    status: WorkOrderStatus = WorkOrderStatus.OPEN
    assigned_to: Optional[str] = None
    estimated_cost: Optional[float] = None
    actual_cost: Optional[float] = None
    due_date: Optional[date] = None
    completed_date: Optional[date] = None

class WorkOrderCreate(WorkOrderBase):
    pass

class WorkOrderUpdate(WorkOrderBase):
    pass

class WorkOrder(WorkOrderBase):
    id: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

# ===== TRANSACTION MODELS =====
class TransactionBase(BaseModel):
    type: TransactionType
    amount: float
    description: str
    date: date
    category: str
    property: Optional[str] = None  # Property ID
    tenant: Optional[str] = None  # Tenant ID

class TransactionCreate(TransactionBase):
    pass

class TransactionUpdate(TransactionBase):
    pass

class Transaction(TransactionBase):
    id: str
    created_at: datetime

    class Config:
        from_attributes = True

# ===== DOCUMENT MODELS =====
class DocumentBase(BaseModel):
    name: str
    type: str
    category: str
    property: Optional[str] = None
    tenant: Optional[str] = None
    size: int  # bytes
    url: str

class DocumentCreate(DocumentBase):
    pass

class Document(DocumentBase):
    id: str
    uploaded_at: datetime

    class Config:
        from_attributes = True

# ===== ANALYTICS MODELS =====
class FinancialStats(BaseModel):
    monthly_income: float
    monthly_expenses: float
    net_income: float
    outstanding_balance: float
    overdue_count: int

class QuickStats(BaseModel):
    total_properties: int
    total_tenants: int
    total_units: int
    occupied_units: int
    vacant_units: int
    occupancy_rate: float
    monthly_revenue: float
    pending_work_orders: int
    urgent_work_orders: int
    overdue_payments: int

class ExpenseCategory(BaseModel):
    category: str
    amount: float
    budget: float
    percentage: float
    count: int

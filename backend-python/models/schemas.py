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

# ===== APPLICATION MODELS =====
class ApplicationStatus(str, Enum):
    SUBMITTED = "submitted"
    SCREENING = "screening"
    APPROVED = "approved"
    CONDITIONAL = "conditional"
    REJECTED = "rejected"
    WITHDRAWN = "withdrawn"

# Nested Models for Application
class AddressInfo(BaseModel):
    street: str
    city: str
    state: str
    zip: str
    landlordName: Optional[str] = None
    landlordPhone: Optional[str] = None
    monthlyRent: Optional[float] = None
    moveInDate: Optional[str] = None

class EmergencyContact(BaseModel):
    name: str
    relationship: str
    phone: str

class PersonalReference(BaseModel):
    name: str
    relationship: str
    phone: str
    email: Optional[str] = None

class Occupant(BaseModel):
    name: str
    age: Optional[int] = None
    relationship: str

class Pet(BaseModel):
    type: str  # dog, cat, other
    breed: Optional[str] = None
    weight: Optional[int] = None
    name: Optional[str] = None

class Vehicle(BaseModel):
    make: str
    model: str
    year: Optional[int] = None
    licensePlate: str
    color: Optional[str] = None

class AdditionalIncome(BaseModel):
    source: str
    monthlyAmount: float
    description: Optional[str] = None

# Main Application Models
class ApplicationBase(BaseModel):
    firstName: str
    lastName: str
    email: str
    phone: str
    dateOfBirth: str
    propertyId: str
    propertyName: str
    desiredUnit: Optional[str] = None
    desiredMoveInDate: str
    leaseTerm: int = 12  # months

    currentEmployer: str
    jobTitle: str
    employmentStartDate: str
    monthlyIncome: float
    employerPhone: str
    additionalIncome: List[AdditionalIncome] = []

    currentAddress: AddressInfo
    previousAddresses: List[AddressInfo] = []

    emergencyContact: EmergencyContact
    personalReferences: List[PersonalReference] = []

    occupants: List[Occupant] = []
    pets: List[Pet] = []
    vehicles: List[Vehicle] = []

    hasEvictions: bool = False
    hasBankruptcy: bool = False
    hasCriminalHistory: bool = False
    disclosureNotes: Optional[str] = None

    backgroundCheckConsent: bool
    creditCheckConsent: bool
    consentSignature: str
    consentDate: Optional[str] = None

class ApplicationCreate(ApplicationBase):
    pass

class ApplicationUpdate(BaseModel):
    status: Optional[ApplicationStatus] = None
    reviewedBy: Optional[str] = None
    decisionReason: Optional[str] = None
    screeningId: Optional[str] = None
    tenantId: Optional[str] = None

class Application(ApplicationBase):
    id: int
    status: ApplicationStatus = ApplicationStatus.SUBMITTED
    submittedDate: str
    documents: List[str] = []
    screeningId: Optional[str] = None
    reviewedBy: Optional[str] = None
    reviewedDate: Optional[str] = None
    decisionReason: Optional[str] = None
    tenantId: Optional[str] = None
    createdAt: str
    updatedAt: str

    class Config:
        from_attributes = True

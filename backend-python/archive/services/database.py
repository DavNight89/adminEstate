"""
Database Service
Manages data storage and retrieval
For demo: uses in-memory storage
For production: would use PostgreSQL with SQLAlchemy
"""
from typing import List, Optional
from datetime import datetime, date
import uuid

from models.schemas import (
    Property, PropertyCreate, PropertyUpdate,
    Tenant, TenantCreate, TenantUpdate, TenantStatus,
    WorkOrder, WorkOrderCreate, WorkOrderUpdate, WorkOrderStatus, WorkOrderPriority,
    Transaction, TransactionCreate, TransactionUpdate, TransactionType,
    Document, DocumentCreate
)

class DatabaseService:
    """
    Database service for managing all data
    Demo uses in-memory storage
    Production would use:
      - PostgreSQL database
      - SQLAlchemy ORM
      - Alembic for migrations
    """

    def __init__(self):
        # In-memory storage (for demo)
        self.properties = []
        self.tenants = []
        self.workorders = []
        self.transactions = []
        self.documents = []

        # No hardcoded data - start with empty database
        print("🗄️ Database initialized with empty collections")

    # ===== PROPERTIES =====
    async def get_properties(
        self,
        skip: int = 0,
        limit: int = 100,
        search: Optional[str] = None
    ) -> List[Property]:
        """Get all properties"""
        properties = self.properties[skip:skip + limit]
        if search:
            properties = [p for p in properties
                         if search.lower() in p.name.lower()
                         or search.lower() in p.address.lower()]
        return properties

    async def get_property(self, property_id: str) -> Optional[Property]:
        """Get property by ID"""
        return next((p for p in self.properties if p.id == property_id), None)

    async def create_property(self, property_data: PropertyCreate) -> Property:
        """Create new property"""
        property = Property(
            id=f"prop-{uuid.uuid4().hex[:8]}",
            **property_data.dict(),
            created_at=datetime.now(),
            updated_at=datetime.now()
        )
        self.properties.append(property)
        return property

    async def update_property(
        self,
        property_id: str,
        property_data: PropertyUpdate
    ) -> Optional[Property]:
        """Update property"""
        property = await self.get_property(property_id)
        if not property:
            return None

        for key, value in property_data.dict().items():
            setattr(property, key, value)
        property.updated_at = datetime.now()
        return property

    async def delete_property(self, property_id: str) -> bool:
        """Delete property"""
        property = await self.get_property(property_id)
        if not property:
            return False
        self.properties.remove(property)
        return True

    async def get_property_tenants(self, property_id: str) -> List[Tenant]:
        """Get all tenants for a property"""
        return [t for t in self.tenants if t.property == property_id]

    async def get_property_workorders(self, property_id: str) -> List[WorkOrder]:
        """Get all work orders for a property"""
        return [wo for wo in self.workorders if wo.property == property_id]

    # ===== TENANTS =====
    async def get_tenants(
        self,
        skip: int = 0,
        limit: int = 100,
        status: Optional[TenantStatus] = None,
        property_id: Optional[str] = None
    ) -> List[Tenant]:
        """Get all tenants"""
        tenants = self.tenants
        if status:
            tenants = [t for t in tenants if t.status == status]
        if property_id:
            tenants = [t for t in tenants if t.property == property_id]
        return tenants[skip:skip + limit]

    async def get_tenant(self, tenant_id: str) -> Optional[Tenant]:
        """Get tenant by ID"""
        return next((t for t in self.tenants if t.id == tenant_id), None)

    async def create_tenant(self, tenant_data: TenantCreate) -> Tenant:
        """Create new tenant"""
        tenant = Tenant(
            id=f"tenant-{uuid.uuid4().hex[:8]}",
            **tenant_data.dict(),
            created_at=datetime.now(),
            updated_at=datetime.now()
        )
        self.tenants.append(tenant)
        return tenant

    async def update_tenant(
        self,
        tenant_id: str,
        tenant_data: TenantUpdate
    ) -> Optional[Tenant]:
        """Update tenant"""
        tenant = await self.get_tenant(tenant_id)
        if not tenant:
            return None

        for key, value in tenant_data.dict().items():
            setattr(tenant, key, value)
        tenant.updated_at = datetime.now()
        return tenant

    async def delete_tenant(self, tenant_id: str) -> bool:
        """Delete tenant"""
        tenant = await self.get_tenant(tenant_id)
        if not tenant:
            return False
        self.tenants.remove(tenant)
        return True

    async def get_tenant_transactions(self, tenant_id: str) -> List[Transaction]:
        """Get all transactions for a tenant"""
        return [t for t in self.transactions if t.tenant == tenant_id]

    async def get_tenant_workorders(self, tenant_id: str) -> List[WorkOrder]:
        """Get all work orders for a tenant"""
        return [wo for wo in self.workorders if wo.tenant == tenant_id]

    # ===== WORK ORDERS =====
    async def get_workorders(
        self,
        skip: int = 0,
        limit: int = 100,
        status: Optional[WorkOrderStatus] = None,
        priority: Optional[WorkOrderPriority] = None,
        property_id: Optional[str] = None
    ) -> List[WorkOrder]:
        """Get all work orders"""
        workorders = self.workorders
        if status:
            workorders = [wo for wo in workorders if wo.status == status]
        if priority:
            workorders = [wo for wo in workorders if wo.priority == priority]
        if property_id:
            workorders = [wo for wo in workorders if wo.property == property_id]
        return workorders[skip:skip + limit]

    async def get_workorder(self, workorder_id: str) -> Optional[WorkOrder]:
        """Get work order by ID"""
        return next((wo for wo in self.workorders if wo.id == workorder_id), None)

    async def create_workorder(self, workorder_data: WorkOrderCreate) -> WorkOrder:
        """Create new work order"""
        workorder = WorkOrder(
            id=f"wo-{uuid.uuid4().hex[:8]}",
            **workorder_data.dict(),
            created_at=datetime.now(),
            updated_at=datetime.now()
        )
        self.workorders.append(workorder)
        return workorder

    async def update_workorder(
        self,
        workorder_id: str,
        workorder_data: WorkOrderUpdate
    ) -> Optional[WorkOrder]:
        """Update work order"""
        workorder = await self.get_workorder(workorder_id)
        if not workorder:
            return None

        for key, value in workorder_data.dict().items():
            setattr(workorder, key, value)
        workorder.updated_at = datetime.now()
        return workorder

    async def update_workorder_status(
        self,
        workorder_id: str,
        status: WorkOrderStatus
    ) -> Optional[WorkOrder]:
        """Update work order status"""
        workorder = await self.get_workorder(workorder_id)
        if not workorder:
            return None

        workorder.status = status
        if status == WorkOrderStatus.COMPLETED:
            workorder.completed_date = date.today()
        workorder.updated_at = datetime.now()
        return workorder

    async def delete_workorder(self, workorder_id: str) -> bool:
        """Delete work order"""
        workorder = await self.get_workorder(workorder_id)
        if not workorder:
            return False
        self.workorders.remove(workorder)
        return True

    # ===== TRANSACTIONS =====
    async def get_transactions(
        self,
        skip: int = 0,
        limit: int = 100,
        type: Optional[TransactionType] = None,
        start_date: Optional[date] = None,
        end_date: Optional[date] = None,
        property_id: Optional[str] = None,
        tenant_id: Optional[str] = None
    ) -> List[Transaction]:
        """Get all transactions"""
        transactions = self.transactions
        if type:
            transactions = [t for t in transactions if t.type == type]
        if start_date:
            transactions = [t for t in transactions if t.date >= start_date]
        if end_date:
            transactions = [t for t in transactions if t.date <= end_date]
        if property_id:
            transactions = [t for t in transactions if t.property == property_id]
        if tenant_id:
            transactions = [t for t in transactions if t.tenant == tenant_id]
        return transactions[skip:skip + limit]

    async def get_transaction(self, transaction_id: str) -> Optional[Transaction]:
        """Get transaction by ID"""
        return next((t for t in self.transactions if t.id == transaction_id), None)

    async def create_transaction(self, transaction_data: TransactionCreate) -> Transaction:
        """Create new transaction"""
        transaction = Transaction(
            id=f"txn-{uuid.uuid4().hex[:8]}",
            **transaction_data.dict(),
            created_at=datetime.now()
        )
        self.transactions.append(transaction)
        return transaction

    async def update_transaction(
        self,
        transaction_id: str,
        transaction_data: TransactionUpdate
    ) -> Optional[Transaction]:
        """Update transaction"""
        transaction = await self.get_transaction(transaction_id)
        if not transaction:
            return None

        for key, value in transaction_data.dict().items():
            setattr(transaction, key, value)
        return transaction

    async def delete_transaction(self, transaction_id: str) -> bool:
        """Delete transaction"""
        transaction = await self.get_transaction(transaction_id)
        if not transaction:
            return False
        self.transactions.remove(transaction)
        return True

    # ===== DOCUMENTS =====
    async def get_documents(
        self,
        skip: int = 0,
        limit: int = 100,
        category: Optional[str] = None,
        property_id: Optional[str] = None,
        tenant_id: Optional[str] = None
    ) -> List[Document]:
        """Get all documents"""
        documents = self.documents
        if category:
            documents = [d for d in documents if d.category == category]
        if property_id:
            documents = [d for d in documents if d.property == property_id]
        if tenant_id:
            documents = [d for d in documents if d.tenant == tenant_id]
        return documents[skip:skip + limit]

    async def get_document(self, document_id: str) -> Optional[Document]:
        """Get document by ID"""
        return next((d for d in self.documents if d.id == document_id), None)

    async def create_document(self, document_data: DocumentCreate) -> Document:
        """Create new document"""
        document = Document(
            id=f"doc-{uuid.uuid4().hex[:8]}",
            **document_data.dict(),
            uploaded_at=datetime.now()
        )
        self.documents.append(document)
        return document

    async def delete_document(self, document_id: str) -> bool:
        """Delete document"""
        document = await self.get_document(document_id)
        if not document:
            return False
        self.documents.remove(document)
        return True

# Singleton instance
db_service = DatabaseService()

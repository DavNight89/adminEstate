# PostgreSQL Database Schema Design
## AdminEstate - Database Migration Plan

**Created**: 2025-11-09
**Status**: DESIGN PHASE
**Estimated Implementation**: 2-3 days

---

## Overview

This document outlines the PostgreSQL database schema to replace the current JSON file storage system. The schema maintains all existing functionality while adding data integrity, relationships, and scalability.

### Migration Benefits
- ✅ **ACID Compliance** - Atomic transactions, consistent data
- ✅ **Concurrent Users** - Multiple property managers simultaneously
- ✅ **Data Integrity** - Foreign keys, constraints, validation
- ✅ **Query Performance** - Indexed searches, complex analytics
- ✅ **Scalability** - Handle 10,000+ records efficiently
- ✅ **Backup & Recovery** - Built-in PostgreSQL tools

---

## Database Tables

### 1. Properties Table

```sql
CREATE TABLE properties (
    id BIGINT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    address TEXT NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('Residential', 'Commercial', 'Mixed-Use', 'Condominium')),
    units INTEGER NOT NULL CHECK (units > 0),
    occupied INTEGER NOT NULL DEFAULT 0 CHECK (occupied >= 0 AND occupied <= units),
    monthly_revenue DECIMAL(10, 2) DEFAULT 0.00,
    purchase_price DECIMAL(12, 2),
    purchase_date DATE,
    status VARCHAR(20) DEFAULT 'Active' CHECK (status IN ('Active', 'Inactive', 'Under Renovation')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_properties_name ON properties(name);
CREATE INDEX idx_properties_type ON properties(type);
CREATE INDEX idx_properties_status ON properties(status);
```

**Fields Mapping**:
- `id` - Existing property ID (unchanged)
- `name` - Property name (e.g., "Sunset Apartments")
- `address` - Full property address
- `type` - Property type with validation
- `units` - Total units available
- `occupied` - Currently occupied units (constrained ≤ total units)
- `monthly_revenue` - Total monthly revenue
- `purchase_price` - Property purchase cost
- `purchase_date` - Date property was acquired
- `status` - Active/Inactive status

---

### 2. Tenants Table

```sql
CREATE TABLE tenants (
    id BIGINT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    phone VARCHAR(50),
    property_id BIGINT NOT NULL REFERENCES properties(id) ON DELETE RESTRICT,
    property_name VARCHAR(255) NOT NULL, -- Denormalized for compatibility
    unit VARCHAR(50) NOT NULL,
    rent DECIMAL(10, 2) NOT NULL CHECK (rent > 0),
    lease_start DATE,
    lease_end DATE,
    status VARCHAR(20) DEFAULT 'Current' CHECK (status IN ('Current', 'Past', 'Pending')),
    balance DECIMAL(10, 2) DEFAULT 0.00,
    avatar VARCHAR(10),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    -- Ensure one tenant per unit per property
    UNIQUE(property_id, unit)
);

-- Indexes
CREATE INDEX idx_tenants_email ON tenants(email);
CREATE INDEX idx_tenants_property_id ON tenants(property_id);
CREATE INDEX idx_tenants_status ON tenants(status);
CREATE INDEX idx_tenants_property_unit ON tenants(property_name, unit);
```

**Fields Mapping**:
- `id` - Tenant ID
- `name` - Tenant full name
- `email` - Unique email (used for tenant portal login)
- `property_id` - Foreign key to properties table
- `property_name` - Denormalized property name (keeps existing API compatible)
- `unit` - Unit number/identifier
- `rent` - Monthly rent amount
- `lease_start`, `lease_end` - Lease term dates
- `status` - Current/Past/Pending status
- `balance` - Outstanding balance (positive = owed, negative = credit)

**Constraints**:
- One tenant per unit per property (UNIQUE constraint)
- Email must be unique across all tenants
- Rent must be positive

---

### 3. Work Orders Table

```sql
CREATE TABLE work_orders (
    id BIGINT PRIMARY KEY,
    property VARCHAR(255) NOT NULL,
    tenant VARCHAR(255) NOT NULL,
    unit VARCHAR(50) NOT NULL,
    issue VARCHAR(500) NOT NULL,
    description TEXT,
    category VARCHAR(50) NOT NULL CHECK (category IN ('plumbing', 'electrical', 'hvac', 'appliance', 'pest', 'structural', 'other')),
    priority VARCHAR(20) DEFAULT 'normal' CHECK (priority IN ('urgent', 'normal', 'low')),
    status VARCHAR(20) DEFAULT 'Pending' CHECK (status IN ('Pending', 'In Progress', 'Completed', 'Cancelled')),
    date DATE NOT NULL,
    location VARCHAR(255),
    access_instructions TEXT,
    preferred_time VARCHAR(20) CHECK (preferred_time IN ('morning', 'afternoon', 'evening', 'anytime')),
    photos TEXT[], -- Array of file paths
    source VARCHAR(50) DEFAULT 'manual' CHECK (source IN ('manual', 'tenant_portal')),
    message_id BIGINT,
    submitted_at TIMESTAMP,
    approved_at TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_work_orders_property ON work_orders(property);
CREATE INDEX idx_work_orders_status ON work_orders(status);
CREATE INDEX idx_work_orders_category ON work_orders(category);
CREATE INDEX idx_work_orders_message_id ON work_orders(message_id);
```

**Fields Mapping**:
- `photos` - PostgreSQL TEXT array storing file paths (e.g., `{"/uploads/maintenance/123.jpg", "/uploads/maintenance/124.jpg"}`)
- `message_id` - Links to messages table for tenant portal requests
- `source` - Tracks if created manually or from tenant portal

---

### 4. Messages Table

```sql
CREATE TABLE messages (
    id BIGINT PRIMARY KEY,
    from_name VARCHAR(255) NOT NULL,
    from_email VARCHAR(255) NOT NULL,
    to_name VARCHAR(255),
    to_email VARCHAR(255),
    property VARCHAR(255),
    unit VARCHAR(50),
    subject VARCHAR(500) NOT NULL,
    message TEXT NOT NULL,
    date DATE NOT NULL,
    time VARCHAR(20) NOT NULL,
    read BOOLEAN DEFAULT FALSE,
    type VARCHAR(50) DEFAULT 'general_message' CHECK (type IN ('general_message', 'maintenance_request', 'approval_notification')),
    status VARCHAR(50),
    maintenance_data JSONB, -- Store maintenance request details
    work_order_id BIGINT,
    reply_to BIGINT REFERENCES messages(id) ON DELETE SET NULL,
    submitted_at TIMESTAMP,
    approved_at TIMESTAMP,
    sent_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_messages_from_email ON messages(from_email);
CREATE INDEX idx_messages_to_email ON messages(to_email);
CREATE INDEX idx_messages_type ON messages(type);
CREATE INDEX idx_messages_reply_to ON messages(reply_to);
CREATE INDEX idx_messages_read ON messages(read);
CREATE INDEX idx_messages_work_order_id ON messages(work_order_id);
```

**Fields Mapping**:
- `maintenance_data` - JSONB field storing maintenance request structure (category, priority, location, etc.)
- `reply_to` - Self-referencing foreign key for message threads
- `read` - Boolean tracking if message has been read
- `type` - Message category (general, maintenance request, approval notification)

**Why JSONB for maintenance_data**:
- Flexible structure for maintenance details
- Indexed and queryable
- Avoids need for separate maintenance_requests table
- Maintains compatibility with existing API structure

---

### 5. Applications Table

```sql
CREATE TABLE applications (
    id BIGINT PRIMARY KEY,
    status VARCHAR(50) DEFAULT 'screening' CHECK (status IN ('screening', 'approved', 'rejected', 'withdrawn')),
    submitted_date TIMESTAMP NOT NULL,

    -- Personal Information
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    date_of_birth DATE,
    ssn VARCHAR(20), -- Encrypted in production

    -- Property Details
    property_id VARCHAR(50) NOT NULL,
    property_name VARCHAR(255),
    desired_unit VARCHAR(50),
    desired_move_in_date DATE,
    lease_term INTEGER,

    -- Employment
    current_employer VARCHAR(255),
    job_title VARCHAR(255),
    employment_start_date DATE,
    monthly_income DECIMAL(10, 2),
    employer_phone VARCHAR(50),
    additional_income JSONB DEFAULT '[]'::jsonb,

    -- Addresses
    current_address JSONB,
    previous_addresses JSONB DEFAULT '[]'::jsonb,

    -- References
    emergency_contact JSONB,
    personal_references JSONB DEFAULT '[]'::jsonb,

    -- Additional Details
    occupants JSONB DEFAULT '[]'::jsonb,
    pets JSONB DEFAULT '[]'::jsonb,
    vehicles JSONB DEFAULT '[]'::jsonb,

    -- Background
    has_evictions BOOLEAN DEFAULT FALSE,
    has_bankruptcy BOOLEAN DEFAULT FALSE,
    has_criminal_history BOOLEAN DEFAULT FALSE,
    disclosure_notes TEXT,

    -- Consents
    background_check_consent BOOLEAN DEFAULT FALSE,
    credit_check_consent BOOLEAN DEFAULT FALSE,
    consent_signature VARCHAR(255),
    consent_date TIMESTAMP,

    -- Screening
    documents JSONB DEFAULT '[]'::jsonb,
    screening_id VARCHAR(100),
    reviewed_by VARCHAR(255),
    reviewed_date TIMESTAMP,
    decision_reason TEXT,
    tenant_id BIGINT REFERENCES tenants(id) ON DELETE SET NULL,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_applications_email ON applications(email);
CREATE INDEX idx_applications_status ON applications(status);
CREATE INDEX idx_applications_property_id ON applications(property_id);
CREATE INDEX idx_applications_submitted_date ON applications(submitted_date);
```

**Design Notes**:
- Uses JSONB for arrays/complex objects (pets, vehicles, references, addresses)
- Maintains exact structure from current JSON schema
- `ssn` field should be encrypted in production (not in scope for initial migration)
- `tenant_id` links to tenants table when application is approved

---

### 6. Transactions Table

```sql
CREATE TABLE transactions (
    id BIGSERIAL PRIMARY KEY,
    property_id BIGINT REFERENCES properties(id) ON DELETE CASCADE,
    tenant_id BIGINT REFERENCES tenants(id) ON DELETE SET NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('income', 'expense', 'payment', 'refund')),
    category VARCHAR(100),
    amount DECIMAL(10, 2) NOT NULL,
    date DATE NOT NULL,
    description TEXT,
    payment_method VARCHAR(50),
    reference_number VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_transactions_property_id ON transactions(property_id);
CREATE INDEX idx_transactions_tenant_id ON transactions(tenant_id);
CREATE INDEX idx_transactions_type ON transactions(type);
CREATE INDEX idx_transactions_date ON transactions(date);
```

**Future Use**:
- Currently empty in JSON schema
- Ready for rent payment tracking
- Expense management
- Financial reporting

---

### 7. Documents Table

```sql
CREATE TABLE documents (
    id BIGSERIAL PRIMARY KEY,
    property_id BIGINT REFERENCES properties(id) ON DELETE CASCADE,
    tenant_id BIGINT REFERENCES tenants(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    file_path TEXT NOT NULL,
    file_size BIGINT,
    mime_type VARCHAR(100),
    uploaded_by VARCHAR(255),
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    notes TEXT
);

-- Indexes
CREATE INDEX idx_documents_property_id ON documents(property_id);
CREATE INDEX idx_documents_tenant_id ON documents(tenant_id);
CREATE INDEX idx_documents_category ON documents(category);
CREATE INDEX idx_documents_uploaded_at ON documents(uploaded_at);
```

**Future Use**:
- Currently empty in JSON schema
- Ready for lease documents
- Maintenance receipts
- Legal documents

---

## Entity Relationships

```
properties (1) ----< (many) tenants
    ↓
    └──< (many) transactions
    └──< (many) documents

tenants (1) ----< (many) transactions
    ↓
    └──< (many) documents

messages (1) ----< (many) messages (self-referencing via reply_to)
    ↓
    └──< (0..1) work_orders (via message_id)

applications (0..1) ----< (1) tenants (when approved)
```

---

## Data Migration Strategy

### Step 1: Read Current JSON Data
```python
import json

with open('src/data.json', 'r') as f:
    data = json.load(f)

properties = data['properties']
tenants = data['tenants']
work_orders = data['workOrders']
messages = data['messages']
applications = data['applications']
```

### Step 2: Insert into PostgreSQL
```python
import psycopg2
from psycopg2.extras import execute_batch

conn = psycopg2.connect(
    dbname="adminestate",
    user="postgres",
    password="your_password",
    host="localhost"
)

# Insert properties
with conn.cursor() as cur:
    execute_batch(cur, """
        INSERT INTO properties (id, name, address, type, units, occupied,
                                monthly_revenue, purchase_price, purchase_date, status)
        VALUES (%(id)s, %(name)s, %(address)s, %(type)s, %(units)s, %(occupied)s,
                %(monthlyRevenue)s, %(purchasePrice)s, %(purchaseDate)s, %(status)s)
    """, properties)

conn.commit()
```

### Step 3: Update Backend API
- Replace `read_data()` with PostgreSQL queries
- Replace `write_data()` with INSERT/UPDATE statements
- Add connection pooling
- Maintain same JSON response structure (no frontend changes needed)

---

## Backend Implementation Changes

### Current Approach (JSON File)
```python
def read_data():
    with open(DATA_FILE, 'r') as f:
        return json.load(f)

def write_data(data):
    with open(DATA_FILE, 'w') as f:
        json.dump(data, f, indent=2)
```

### New Approach (PostgreSQL)
```python
import psycopg2
from psycopg2.extras import RealDictCursor
from contextlib import contextmanager

@contextmanager
def get_db_connection():
    conn = psycopg2.connect(
        dbname="adminestate",
        user="postgres",
        password=os.getenv('DB_PASSWORD'),
        host="localhost",
        cursor_factory=RealDictCursor
    )
    try:
        yield conn
    finally:
        conn.close()

def get_properties():
    with get_db_connection() as conn:
        with conn.cursor() as cur:
            cur.execute("SELECT * FROM properties ORDER BY created_at DESC")
            return cur.fetchall()

def get_tenants():
    with get_db_connection() as conn:
        with conn.cursor() as cur:
            cur.execute("SELECT * FROM tenants ORDER BY created_at DESC")
            return cur.fetchall()
```

---

## API Endpoint Compatibility

### GET /api/properties
**Before**: Return `data['properties']`
**After**: `SELECT * FROM properties` → Convert to JSON

**Response Format**: UNCHANGED (frontend compatible)

### GET /api/tenants
**Before**: Return `data['tenants']`
**After**: `SELECT * FROM tenants` → Convert to JSON

**Response Format**: UNCHANGED

### POST /api/messages/send
**Before**: Append to `data['messages']`, write file
**After**: `INSERT INTO messages (...) VALUES (...)` → Return JSON

**Response Format**: UNCHANGED

**Key Point**: Frontend never changes. Only backend storage mechanism changes.

---

## Performance Improvements

### Current System (JSON)
- **Read All Data**: Load entire 380-line JSON file
- **Query Tenant**: Loop through all tenants in memory
- **Concurrent Users**: File locking prevents simultaneous writes
- **Search**: O(n) linear scan

### With PostgreSQL
- **Read Properties**: `SELECT * FROM properties` (indexed, fast)
- **Query Tenant**: `SELECT * FROM tenants WHERE email = ?` (indexed, instant)
- **Concurrent Users**: ACID transactions, row-level locking
- **Search**: O(log n) with B-tree indexes

**Expected Performance Gains**:
- 10x faster queries with indexes
- 100x faster searches (indexed vs linear scan)
- Unlimited concurrent users (vs single-user JSON file locking)

---

## Installation Requirements

### 1. Install PostgreSQL
```bash
# Windows (via Chocolatey)
choco install postgresql

# Or download installer from postgresql.org
```

### 2. Install Python Driver
```bash
pip install psycopg2-binary
```

### 3. Create Database
```bash
psql -U postgres
CREATE DATABASE adminestate;
\q
```

### 4. Run Schema Migration
```bash
cd backend-python
python migrate_to_postgres.py
```

---

## Migration Checklist

### Phase 1: Database Setup (2-4 hours)
- [ ] Install PostgreSQL
- [ ] Create `adminestate` database
- [ ] Run schema creation script
- [ ] Verify tables created with `\dt` in psql
- [ ] Install `psycopg2-binary` Python package

### Phase 2: Data Migration (2-3 hours)
- [ ] Write migration script (`migrate_to_postgres.py`)
- [ ] Backup current `data.json`
- [ ] Migrate properties (5 records)
- [ ] Migrate tenants (10 records)
- [ ] Migrate work orders (1 record)
- [ ] Migrate messages (2 records)
- [ ] Migrate applications (1 record)
- [ ] Verify row counts match JSON records

### Phase 3: Backend Refactoring (1-2 days)
- [ ] Create database connection module (`db.py`)
- [ ] Update `/api/properties` endpoint
- [ ] Update `/api/tenants` endpoint
- [ ] Update `/api/messages` endpoints (GET, POST, PUT)
- [ ] Update `/api/work_orders` endpoints
- [ ] Update `/api/applications` endpoints
- [ ] Update `/api/maintenance/approve` endpoint
- [ ] Add connection pooling
- [ ] Add error handling for DB failures

### Phase 4: Testing (4-6 hours)
- [ ] Test AdminEstate: View properties
- [ ] Test AdminEstate: Add/edit property
- [ ] Test AdminEstate: View tenants
- [ ] Test AdminEstate: Add/edit tenant
- [ ] Test AdminEstate: Communication Center
- [ ] Test AdminEstate: Send message
- [ ] Test AdminEstate: Approve maintenance request
- [ ] Test Tenant Portal: Login
- [ ] Test Tenant Portal: Submit maintenance request
- [ ] Test Tenant Portal: View messages
- [ ] Test Tenant Portal: Reply to messages
- [ ] Performance testing: 100+ records
- [ ] Concurrent user testing: Multiple browsers

### Phase 5: Deployment (1-2 hours)
- [ ] Document PostgreSQL setup in README
- [ ] Add environment variable for DB password
- [ ] Create backup script
- [ ] Update `.gitignore` (exclude DB credentials)
- [ ] Archive old `data.json` as `data.json.backup`

---

## Rollback Plan

If migration fails or issues arise:

1. **Stop Flask Backend**
2. **Restore Original Code**:
   ```bash
   git checkout backend-python/app_simple.py
   ```
3. **Keep `data.json.backup`** - Original data preserved
4. **Restart Flask** - System returns to JSON file storage

**Zero Data Loss**: Migration never deletes `data.json`, only creates new PostgreSQL database.

---

## Future Enhancements (Post-Migration)

Once PostgreSQL is working:

1. **Multi-User Authentication**
   - Create `users` table
   - JWT tokens
   - Property manager accounts

2. **Advanced Analytics**
   - Complex SQL queries
   - Date range reports
   - Revenue forecasting

3. **Tenant Payment Tracking**
   - Payment history
   - Outstanding balances
   - Late fees calculation

4. **Real-Time Features**
   - PostgreSQL LISTEN/NOTIFY
   - WebSocket integration
   - Live updates

---

## Estimated Timeline

| Phase | Duration | Description |
|-------|----------|-------------|
| **Database Setup** | 2-4 hours | Install PostgreSQL, create schema |
| **Data Migration** | 2-3 hours | Write migration script, move data |
| **Backend Refactor** | 1-2 days | Update all API endpoints |
| **Testing** | 4-6 hours | Comprehensive testing both apps |
| **Deployment** | 1-2 hours | Documentation, environment setup |
| **TOTAL** | **2-3 days** | Complete migration |

---

## Questions for Review

Before proceeding with implementation:

1. ✅ **Schema Approval**: Does this table structure match your needs?
2. ✅ **Data Integrity**: Are the constraints (foreign keys, checks) acceptable?
3. ✅ **JSONB Usage**: Comfortable with JSONB for complex fields (pets, vehicles, maintenance_data)?
4. ✅ **Migration Strategy**: Prefer all-at-once migration or gradual endpoint-by-endpoint?
5. ✅ **PostgreSQL Installation**: Need help with Windows PostgreSQL setup?

---

**Next Step**: Once approved, I'll create:
1. `backend-python/schema.sql` - Database creation script
2. `backend-python/migrate_to_postgres.py` - Data migration script
3. `backend-python/db.py` - Database connection module
4. Updated `app_simple.py` with PostgreSQL queries

**Ready to proceed?**

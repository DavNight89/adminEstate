-- AdminEstate PostgreSQL Database Schema
-- Created: 2025-11-09
-- Purpose: Replace JSON file storage with PostgreSQL database

-- Drop existing tables if they exist (for clean migration)
DROP TABLE IF EXISTS documents CASCADE;
DROP TABLE IF EXISTS transactions CASCADE;
DROP TABLE IF EXISTS messages CASCADE;
DROP TABLE IF EXISTS work_orders CASCADE;
DROP TABLE IF EXISTS applications CASCADE;
DROP TABLE IF EXISTS tenants CASCADE;
DROP TABLE IF EXISTS properties CASCADE;

-- =============================================================================
-- 1. PROPERTIES TABLE
-- =============================================================================
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

COMMENT ON TABLE properties IS 'Property portfolio with constraints and validation';
COMMENT ON COLUMN properties.occupied IS 'Current occupied units (constrained to be <= total units)';

-- =============================================================================
-- 2. TENANTS TABLE
-- =============================================================================
CREATE TABLE tenants (
    id BIGINT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    phone VARCHAR(50),
    property_id BIGINT NOT NULL REFERENCES properties(id) ON DELETE RESTRICT,
    property_name VARCHAR(255) NOT NULL, -- Denormalized for API compatibility
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

COMMENT ON TABLE tenants IS 'Tenant records with unique email and property relationships';
COMMENT ON COLUMN tenants.email IS 'Unique email used for Tenant Portal login';
COMMENT ON COLUMN tenants.property_name IS 'Denormalized property name for API compatibility';

-- =============================================================================
-- 3. WORK ORDERS TABLE
-- =============================================================================
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
CREATE INDEX idx_work_orders_date ON work_orders(date);

COMMENT ON TABLE work_orders IS 'Maintenance work orders from manual entry or tenant portal';
COMMENT ON COLUMN work_orders.photos IS 'Array of file paths to uploaded photos';
COMMENT ON COLUMN work_orders.message_id IS 'Links to messages table for tenant portal requests';

-- =============================================================================
-- 4. MESSAGES TABLE
-- =============================================================================
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
CREATE INDEX idx_messages_date ON messages(date DESC);

-- GIN index for JSONB queries
CREATE INDEX idx_messages_maintenance_data ON messages USING GIN (maintenance_data);

COMMENT ON TABLE messages IS 'Communication center messages with threading support';
COMMENT ON COLUMN messages.maintenance_data IS 'JSONB field storing maintenance request details';
COMMENT ON COLUMN messages.reply_to IS 'Self-referencing foreign key for message threads';

-- =============================================================================
-- 5. APPLICATIONS TABLE
-- =============================================================================
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
    ssn VARCHAR(20), -- Should be encrypted in production

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

-- GIN indexes for JSONB queries
CREATE INDEX idx_applications_pets ON applications USING GIN (pets);
CREATE INDEX idx_applications_vehicles ON applications USING GIN (vehicles);

COMMENT ON TABLE applications IS 'Tenant applications with screening workflow';
COMMENT ON COLUMN applications.ssn IS 'WARNING: Should be encrypted in production';
COMMENT ON COLUMN applications.tenant_id IS 'Links to tenants table when application is approved';

-- =============================================================================
-- 6. TRANSACTIONS TABLE
-- =============================================================================
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
CREATE INDEX idx_transactions_date ON transactions(date DESC);

COMMENT ON TABLE transactions IS 'Financial transactions for rent payments and expenses';

-- =============================================================================
-- 7. DOCUMENTS TABLE
-- =============================================================================
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
CREATE INDEX idx_documents_uploaded_at ON documents(uploaded_at DESC);

COMMENT ON TABLE documents IS 'Document management for leases, receipts, and legal files';

-- =============================================================================
-- FUNCTIONS AND TRIGGERS
-- =============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for auto-updating updated_at
CREATE TRIGGER update_properties_updated_at
    BEFORE UPDATE ON properties
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tenants_updated_at
    BEFORE UPDATE ON tenants
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_work_orders_updated_at
    BEFORE UPDATE ON work_orders
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_applications_updated_at
    BEFORE UPDATE ON applications
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Function to validate occupied units constraint
CREATE OR REPLACE FUNCTION validate_occupied_units()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.occupied > NEW.units THEN
        RAISE EXCEPTION 'Occupied units (%) cannot exceed total units (%)', NEW.occupied, NEW.units;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to enforce occupied <= units
CREATE TRIGGER check_occupied_units
    BEFORE INSERT OR UPDATE ON properties
    FOR EACH ROW
    EXECUTE FUNCTION validate_occupied_units();

-- =============================================================================
-- INITIAL DATA VERIFICATION
-- =============================================================================

-- View to check table row counts (useful for migration verification)
CREATE OR REPLACE VIEW migration_summary AS
SELECT
    'properties' AS table_name, COUNT(*) AS row_count FROM properties
UNION ALL
SELECT 'tenants', COUNT(*) FROM tenants
UNION ALL
SELECT 'work_orders', COUNT(*) FROM work_orders
UNION ALL
SELECT 'messages', COUNT(*) FROM messages
UNION ALL
SELECT 'applications', COUNT(*) FROM applications
UNION ALL
SELECT 'transactions', COUNT(*) FROM transactions
UNION ALL
SELECT 'documents', COUNT(*) FROM documents
ORDER BY table_name;

-- =============================================================================
-- GRANT PERMISSIONS (adjust username as needed)
-- =============================================================================

-- Grant all privileges to postgres user (development)
-- In production, create a dedicated user with limited privileges
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO postgres;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO postgres;

-- =============================================================================
-- COMPLETION MESSAGE
-- =============================================================================

DO $$
BEGIN
    RAISE NOTICE '========================================';
    RAISE NOTICE 'AdminEstate Database Schema Created Successfully';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Tables Created: 7';
    RAISE NOTICE 'Indexes Created: 35+';
    RAISE NOTICE 'Triggers Created: 5';
    RAISE NOTICE 'Views Created: 1';
    RAISE NOTICE '';
    RAISE NOTICE 'Next Steps:';
    RAISE NOTICE '1. Run migration script: python migrate_to_postgres.py';
    RAISE NOTICE '2. Verify data: SELECT * FROM migration_summary;';
    RAISE NOTICE '3. Update backend: Modify app_simple.py to use PostgreSQL';
    RAISE NOTICE '========================================';
END $$;

"""
AdminEstate - PostgreSQL Database Connection Module
Created: 2025-11-09
Purpose: Centralized database connection and query utilities

This module provides:
- Database connection pooling
- Context managers for transactions
- Helper functions for common queries
- Error handling and logging
"""

import os
import json
from contextlib import contextmanager
from typing import Dict, List, Any, Optional
import psycopg2
from psycopg2.extras import RealDictCursor, Json, execute_batch
from psycopg2.pool import SimpleConnectionPool
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Database configuration
DB_CONFIG = {
    'dbname': os.getenv('DB_NAME', 'adminestate'),
    'user': os.getenv('DB_USER', 'postgres'),
    'password': os.getenv('DB_PASSWORD', ''),
    'host': os.getenv('DB_HOST', 'localhost'),
    'port': int(os.getenv('DB_PORT', 5432))
}

# Connection pool (lazy initialization)
_connection_pool: Optional[SimpleConnectionPool] = None


def init_connection_pool(min_conn=1, max_conn=10):
    """Initialize the connection pool"""
    global _connection_pool

    if _connection_pool is not None:
        return

    try:
        _connection_pool = SimpleConnectionPool(
            min_conn,
            max_conn,
            **DB_CONFIG
        )
        print(f"[OK] Database connection pool initialized ({min_conn}-{max_conn} connections)")
    except psycopg2.OperationalError as e:
        print(f"[ERROR] Failed to initialize database pool: {e}")
        print("  Using fallback JSON file storage")
        _connection_pool = None


def close_connection_pool():
    """Close all connections in the pool"""
    global _connection_pool

    if _connection_pool is not None:
        _connection_pool.closeall()
        _connection_pool = None
        print("[OK] Database connection pool closed")


@contextmanager
def get_db_connection():
    """
    Context manager for database connections.
    Automatically returns connection to pool when done.

    Usage:
        with get_db_connection() as conn:
            with conn.cursor() as cur:
                cur.execute("SELECT * FROM properties")
                results = cur.fetchall()
    """
    if _connection_pool is None:
        init_connection_pool()

    if _connection_pool is None:
        raise Exception("Database connection pool not available")

    conn = _connection_pool.getconn()
    try:
        yield conn
    except Exception as e:
        conn.rollback()
        raise e
    finally:
        _connection_pool.putconn(conn)


@contextmanager
def get_db_cursor(commit=True):
    """
    Context manager for database cursor with auto-commit.

    Args:
        commit: Whether to commit transaction on success (default: True)

    Usage:
        with get_db_cursor() as cur:
            cur.execute("INSERT INTO properties (...) VALUES (...)")
    """
    with get_db_connection() as conn:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            try:
                yield cur
                if commit:
                    conn.commit()
            except Exception as e:
                conn.rollback()
                raise e


# =============================================================================
# PROPERTIES QUERIES
# =============================================================================

def get_all_properties() -> List[Dict[str, Any]]:
    """Get all properties"""
    with get_db_cursor(commit=False) as cur:
        cur.execute("""
            SELECT id, name, address, type, units, occupied,
                   monthly_revenue as "monthlyRevenue",
                   purchase_price as "purchasePrice",
                   purchase_date as "purchaseDate",
                   status, created_at, updated_at
            FROM properties
            ORDER BY created_at DESC
        """)
        return [dict(row) for row in cur.fetchall()]


def get_property_by_id(property_id: int) -> Optional[Dict[str, Any]]:
    """Get property by ID"""
    with get_db_cursor(commit=False) as cur:
        cur.execute("""
            SELECT id, name, address, type, units, occupied,
                   monthly_revenue as "monthlyRevenue",
                   purchase_price as "purchasePrice",
                   purchase_date as "purchaseDate",
                   status, created_at, updated_at
            FROM properties
            WHERE id = %s
        """, (property_id,))
        row = cur.fetchone()
        return dict(row) if row else None


def create_property(property_data: Dict[str, Any]) -> int:
    """Create new property and return ID"""
    with get_db_cursor() as cur:
        cur.execute("""
            INSERT INTO properties
            (id, name, address, type, units, occupied, monthly_revenue,
             purchase_price, purchase_date, status)
            VALUES
            (%(id)s, %(name)s, %(address)s, %(type)s, %(units)s, %(occupied)s,
             %(monthlyRevenue)s, %(purchasePrice)s, %(purchaseDate)s, %(status)s)
            RETURNING id
        """, property_data)
        return cur.fetchone()['id']


def update_property(property_id: int, property_data: Dict[str, Any]) -> bool:
    """Update property"""
    with get_db_cursor() as cur:
        cur.execute("""
            UPDATE properties
            SET name = %(name)s,
                address = %(address)s,
                type = %(type)s,
                units = %(units)s,
                occupied = %(occupied)s,
                monthly_revenue = %(monthlyRevenue)s,
                purchase_price = %(purchasePrice)s,
                purchase_date = %(purchaseDate)s,
                status = %(status)s,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = %(id)s
        """, {**property_data, 'id': property_id})
        return cur.rowcount > 0


def delete_property(property_id: int) -> bool:
    """Delete property"""
    with get_db_cursor() as cur:
        cur.execute("DELETE FROM properties WHERE id = %s", (property_id,))
        return cur.rowcount > 0


# =============================================================================
# TENANTS QUERIES
# =============================================================================

def get_all_tenants() -> List[Dict[str, Any]]:
    """Get all tenants"""
    with get_db_cursor(commit=False) as cur:
        cur.execute("""
            SELECT id, name, email, phone, property_id as "propertyId",
                   property_name as property, unit, rent,
                   lease_start as "leaseStart",
                   lease_end as "leaseEnd",
                   status, balance, avatar, created_at, updated_at
            FROM tenants
            ORDER BY created_at DESC
        """)
        return [dict(row) for row in cur.fetchall()]


def get_tenant_by_email(email: str) -> Optional[Dict[str, Any]]:
    """Get tenant by email (for Tenant Portal login)"""
    with get_db_cursor(commit=False) as cur:
        cur.execute("""
            SELECT id, name, email, phone, property_id as "propertyId",
                   property_name as property, unit, rent,
                   lease_start as "leaseStart",
                   lease_end as "leaseEnd",
                   status, balance, avatar, created_at, updated_at
            FROM tenants
            WHERE email = %s
        """, (email,))
        row = cur.fetchone()
        return dict(row) if row else None


def create_tenant(tenant_data: Dict[str, Any]) -> int:
    """Create new tenant and return ID"""
    with get_db_cursor() as cur:
        cur.execute("""
            INSERT INTO tenants
            (id, name, email, phone, property_id, property_name, unit, rent,
             lease_start, lease_end, status, balance, avatar, created_at, updated_at)
            VALUES
            (%(id)s, %(name)s, %(email)s, %(phone)s,
             (SELECT id FROM properties WHERE name = %(property)s LIMIT 1),
             %(property)s, %(unit)s, %(rent)s, %(leaseStart)s, %(leaseEnd)s,
             %(status)s, %(balance)s, %(avatar)s, %(created_at)s, %(updated_at)s)
            RETURNING id
        """, tenant_data)
        return cur.fetchone()['id']


def update_tenant(tenant_id: int, tenant_data: Dict[str, Any]) -> bool:
    """Update tenant"""
    with get_db_cursor() as cur:
        cur.execute("""
            UPDATE tenants
            SET name = %(name)s,
                email = %(email)s,
                phone = %(phone)s,
                property_id = (SELECT id FROM properties WHERE name = %(property)s LIMIT 1),
                property_name = %(property)s,
                unit = %(unit)s,
                rent = %(rent)s,
                lease_start = %(leaseStart)s,
                lease_end = %(leaseEnd)s,
                status = %(status)s,
                balance = %(balance)s,
                avatar = %(avatar)s,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = %(id)s
        """, {**tenant_data, 'id': tenant_id})
        return cur.rowcount > 0


# =============================================================================
# MESSAGES QUERIES
# =============================================================================

def get_all_messages(tenant_email: Optional[str] = None) -> List[Dict[str, Any]]:
    """Get all messages, optionally filtered by tenant email"""
    with get_db_cursor(commit=False) as cur:
        if tenant_email:
            cur.execute("""
                SELECT id, from_name as "from", from_email as "fromEmail",
                       to_name as "to", to_email as "toEmail",
                       property, unit, subject, message, date, time, read,
                       type, status, maintenance_data as "maintenanceData",
                       work_order_id as "workOrderId", reply_to as "replyTo",
                       submitted_at as "submittedAt", approved_at as "approvedAt",
                       sent_at as "sentAt"
                FROM messages
                WHERE from_email = %s OR to_email = %s
                ORDER BY submitted_at DESC NULLS LAST, created_at DESC
            """, (tenant_email, tenant_email))
        else:
            cur.execute("""
                SELECT id, from_name as "from", from_email as "fromEmail",
                       to_name as "to", to_email as "toEmail",
                       property, unit, subject, message, date, time, read,
                       type, status, maintenance_data as "maintenanceData",
                       work_order_id as "workOrderId", reply_to as "replyTo",
                       submitted_at as "submittedAt", approved_at as "approvedAt",
                       sent_at as "sentAt"
                FROM messages
                ORDER BY submitted_at DESC NULLS LAST, created_at DESC
            """)

        return [dict(row) for row in cur.fetchall()]


def create_message(message_data: Dict[str, Any]) -> int:
    """Create new message and return ID"""
    with get_db_cursor() as cur:
        # Convert maintenance_data to JSONB if present
        maintenance_data = message_data.get('maintenanceData')
        if maintenance_data:
            maintenance_data = Json(maintenance_data)

        cur.execute("""
            INSERT INTO messages
            (id, from_name, from_email, to_name, to_email, property, unit,
             subject, message, date, time, read, type, status, maintenance_data,
             work_order_id, reply_to, submitted_at, approved_at, sent_at)
            VALUES
            (%(id)s, %(from)s, %(fromEmail)s, %(to)s, %(toEmail)s, %(property)s,
             %(unit)s, %(subject)s, %(message)s, %(date)s, %(time)s, %(read)s,
             %(type)s, %(status)s, %(maintenanceData)s, %(workOrderId)s, %(replyTo)s,
             %(submittedAt)s, %(approvedAt)s, %(sentAt)s)
            RETURNING id
        """, {
            **message_data,
            'maintenanceData': maintenance_data,
            'read': message_data.get('read', False),
            'to': message_data.get('to'),
            'toEmail': message_data.get('toEmail'),
            'property': message_data.get('property'),
            'unit': message_data.get('unit'),
            'status': message_data.get('status'),
            'workOrderId': message_data.get('workOrderId'),
            'replyTo': message_data.get('replyTo'),
            'submittedAt': message_data.get('submittedAt'),
            'approvedAt': message_data.get('approvedAt'),
            'sentAt': message_data.get('sentAt')
        })
        return cur.fetchone()['id']


def mark_message_as_read(message_id: int) -> bool:
    """Mark message as read"""
    with get_db_cursor() as cur:
        cur.execute("""
            UPDATE messages
            SET read = TRUE
            WHERE id = %s
        """, (message_id,))
        return cur.rowcount > 0


def update_message_status(message_id: int, status: str, work_order_id: Optional[int] = None) -> bool:
    """Update message status and work order ID"""
    with get_db_cursor() as cur:
        cur.execute("""
            UPDATE messages
            SET status = %s,
                work_order_id = %s,
                approved_at = CASE WHEN %s = 'approved' THEN CURRENT_TIMESTAMP ELSE approved_at END
            WHERE id = %s
        """, (status, work_order_id, status, message_id))
        return cur.rowcount > 0


# =============================================================================
# WORK ORDERS QUERIES
# =============================================================================

def get_all_work_orders() -> List[Dict[str, Any]]:
    """Get all work orders"""
    with get_db_cursor(commit=False) as cur:
        cur.execute("""
            SELECT id, property, tenant, unit, issue, description, category,
                   priority, status, date, location,
                   access_instructions as "accessInstructions",
                   preferred_time as "preferredTime",
                   photos, source,
                   message_id as "messageId",
                   submitted_at as "submittedAt",
                   approved_at as "approvedAt",
                   updated_at as "updatedAt"
            FROM work_orders
            ORDER BY date DESC
        """)
        return [dict(row) for row in cur.fetchall()]


def get_work_order_by_id(work_order_id: int) -> Optional[Dict[str, Any]]:
    """Get work order by ID"""
    with get_db_cursor(commit=False) as cur:
        cur.execute("""
            SELECT id, property, tenant, unit, issue, description, category,
                   priority, status, date, location,
                   access_instructions as "accessInstructions",
                   preferred_time as "preferredTime",
                   photos, source,
                   message_id as "messageId",
                   submitted_at as "submittedAt",
                   approved_at as "approvedAt",
                   updated_at as "updatedAt"
            FROM work_orders
            WHERE id = %s
        """, (work_order_id,))
        row = cur.fetchone()
        return dict(row) if row else None


def create_work_order(work_order_data: Dict[str, Any]) -> int:
    """Create new work order and return ID"""
    with get_db_cursor() as cur:
        cur.execute("""
            INSERT INTO work_orders
            (id, property, tenant, unit, issue, description, category, priority,
             status, date, location, access_instructions, preferred_time, photos,
             source, message_id, submitted_at, approved_at)
            VALUES
            (%(id)s, %(property)s, %(tenant)s, %(unit)s, %(issue)s, %(description)s,
             %(category)s, %(priority)s, %(status)s, %(date)s, %(location)s,
             %(accessInstructions)s, %(preferredTime)s, %(photos)s, %(source)s,
             %(messageId)s, %(submittedAt)s, %(approvedAt)s)
            RETURNING id
        """, work_order_data)
        return cur.fetchone()['id']


def update_work_order_status(work_order_id: int, status: str) -> bool:
    """Update work order status"""
    with get_db_cursor() as cur:
        cur.execute("""
            UPDATE work_orders
            SET status = %s,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = %s
        """, (status, work_order_id))
        return cur.rowcount > 0


# =============================================================================
# APPLICATIONS QUERIES
# =============================================================================

def get_all_applications() -> List[Dict[str, Any]]:
    """Get all applications"""
    with get_db_cursor(commit=False) as cur:
        cur.execute("""
            SELECT id, status, submitted_date as "submittedDate",
                   first_name as "firstName", last_name as "lastName",
                   email, phone, date_of_birth as "dateOfBirth", ssn,
                   property_id as "propertyId", property_name as "propertyName",
                   desired_unit as "desiredUnit", desired_move_in_date as "desiredMoveInDate",
                   lease_term as "leaseTerm", current_employer as "currentEmployer",
                   job_title as "jobTitle", employment_start_date as "employmentStartDate",
                   monthly_income as "monthlyIncome", employer_phone as "employerPhone",
                   additional_income as "additionalIncome", current_address as "currentAddress",
                   previous_addresses as "previousAddresses", emergency_contact as "emergencyContact",
                   personal_references as "personalReferences", occupants, pets, vehicles,
                   has_evictions as "hasEvictions", has_bankruptcy as "hasBankruptcy",
                   has_criminal_history as "hasCriminalHistory", disclosure_notes as "disclosureNotes",
                   background_check_consent as "backgroundCheckConsent",
                   credit_check_consent as "creditCheckConsent",
                   consent_signature as "consentSignature", consent_date as "consentDate",
                   documents, screening_id as "screeningId", reviewed_by as "reviewedBy",
                   reviewed_date as "reviewedDate", decision_reason as "decisionReason",
                   tenant_id as "tenantId", created_at as "createdAt",
                   updated_at as "updatedAt", last_updated as "lastUpdated"
            FROM applications
            ORDER BY submitted_date DESC
        """)
        return [dict(row) for row in cur.fetchall()]


def get_application_by_id(application_id: int) -> Optional[Dict[str, Any]]:
    """Get application by ID"""
    with get_db_cursor(commit=False) as cur:
        cur.execute("""
            SELECT id, status, submitted_date as "submittedDate",
                   first_name as "firstName", last_name as "lastName",
                   email, phone, date_of_birth as "dateOfBirth", ssn,
                   property_id as "propertyId", property_name as "propertyName",
                   desired_unit as "desiredUnit", desired_move_in_date as "desiredMoveInDate",
                   lease_term as "leaseTerm", current_employer as "currentEmployer",
                   job_title as "jobTitle", employment_start_date as "employmentStartDate",
                   monthly_income as "monthlyIncome", employer_phone as "employerPhone",
                   additional_income as "additionalIncome", current_address as "currentAddress",
                   previous_addresses as "previousAddresses", emergency_contact as "emergencyContact",
                   personal_references as "personalReferences", occupants, pets, vehicles,
                   has_evictions as "hasEvictions", has_bankruptcy as "hasBankruptcy",
                   has_criminal_history as "hasCriminalHistory", disclosure_notes as "disclosureNotes",
                   background_check_consent as "backgroundCheckConsent",
                   credit_check_consent as "creditCheckConsent",
                   consent_signature as "consentSignature", consent_date as "consentDate",
                   documents, screening_id as "screeningId", reviewed_by as "reviewedBy",
                   reviewed_date as "reviewedDate", decision_reason as "decisionReason",
                   tenant_id as "tenantId", created_at as "createdAt",
                   updated_at as "updatedAt", last_updated as "lastUpdated"
            FROM applications
            WHERE id = %s
        """, (application_id,))
        row = cur.fetchone()
        return dict(row) if row else None


def create_application(application_data: Dict[str, Any]) -> int:
    """Create new application and return ID"""
    with get_db_cursor() as cur:
        # Convert JSONB fields
        additional_income = Json(application_data.get('additionalIncome', []))
        current_address = Json(application_data.get('currentAddress', {}))
        previous_addresses = Json(application_data.get('previousAddresses', []))
        emergency_contact = Json(application_data.get('emergencyContact', {}))
        personal_references = Json(application_data.get('personalReferences', []))
        occupants = Json(application_data.get('occupants', []))
        pets = Json(application_data.get('pets', []))
        vehicles = Json(application_data.get('vehicles', []))
        documents = Json(application_data.get('documents', []))

        cur.execute("""
            INSERT INTO applications
            (id, status, submitted_date, first_name, last_name, email, phone, date_of_birth, ssn,
             property_id, property_name, desired_unit, desired_move_in_date, lease_term,
             current_employer, job_title, employment_start_date, monthly_income, employer_phone,
             additional_income, current_address, previous_addresses, emergency_contact,
             personal_references, occupants, pets, vehicles, has_evictions, has_bankruptcy,
             has_criminal_history, disclosure_notes, background_check_consent, credit_check_consent,
             consent_signature, consent_date, documents, screening_id)
            VALUES
            (%(id)s, %(status)s, %(submittedDate)s, %(firstName)s, %(lastName)s, %(email)s,
             %(phone)s, %(dateOfBirth)s, %(ssn)s, %(propertyId)s, %(propertyName)s,
             %(desiredUnit)s, %(desiredMoveInDate)s, %(leaseTerm)s, %(currentEmployer)s,
             %(jobTitle)s, %(employmentStartDate)s, %(monthlyIncome)s, %(employerPhone)s,
             %s, %s, %s, %s, %s, %s, %s, %s, %(hasEvictions)s, %(hasBankruptcy)s,
             %(hasCriminalHistory)s, %(disclosureNotes)s, %(backgroundCheckConsent)s,
             %(creditCheckConsent)s, %(consentSignature)s, %(consentDate)s, %s, %(screeningId)s)
            RETURNING id
        """, {
            **application_data,
            'additionalIncome': additional_income,
            'currentAddress': current_address,
            'previousAddresses': previous_addresses,
            'emergencyContact': emergency_contact,
            'personalReferences': personal_references,
            'occupants': occupants,
            'pets': pets,
            'vehicles': vehicles,
            'documents': documents
        })
        return cur.fetchone()['id']


def update_application(application_id: int, application_data: Dict[str, Any]) -> bool:
    """Update application"""
    with get_db_cursor() as cur:
        # Convert JSONB fields if present
        jsonb_fields = {}
        if 'additionalIncome' in application_data:
            jsonb_fields['additionalIncome'] = Json(application_data['additionalIncome'])
        if 'currentAddress' in application_data:
            jsonb_fields['currentAddress'] = Json(application_data['currentAddress'])
        if 'previousAddresses' in application_data:
            jsonb_fields['previousAddresses'] = Json(application_data['previousAddresses'])
        if 'emergencyContact' in application_data:
            jsonb_fields['emergencyContact'] = Json(application_data['emergencyContact'])
        if 'personalReferences' in application_data:
            jsonb_fields['personalReferences'] = Json(application_data['personalReferences'])
        if 'occupants' in application_data:
            jsonb_fields['occupants'] = Json(application_data['occupants'])
        if 'pets' in application_data:
            jsonb_fields['pets'] = Json(application_data['pets'])
        if 'vehicles' in application_data:
            jsonb_fields['vehicles'] = Json(application_data['vehicles'])
        if 'documents' in application_data:
            jsonb_fields['documents'] = Json(application_data['documents'])

        cur.execute("""
            UPDATE applications
            SET status = %(status)s,
                first_name = %(firstName)s,
                last_name = %(lastName)s,
                email = %(email)s,
                phone = %(phone)s,
                property_name = %(propertyName)s,
                reviewed_by = %(reviewedBy)s,
                reviewed_date = %(reviewedDate)s,
                decision_reason = %(decisionReason)s,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = %(id)s
        """, {**application_data, 'id': application_id, **jsonb_fields})
        return cur.rowcount > 0


def delete_application(application_id: int) -> bool:
    """Delete application"""
    with get_db_cursor() as cur:
        cur.execute("DELETE FROM applications WHERE id = %s", (application_id,))
        return cur.rowcount > 0


def get_application_stats() -> Dict[str, Any]:
    """Get application statistics"""
    with get_db_cursor(commit=False) as cur:
        cur.execute("""
            SELECT
                COUNT(*) as total,
                COUNT(*) FILTER (WHERE status = 'screening') as screening,
                COUNT(*) FILTER (WHERE status = 'approved') as approved,
                COUNT(*) FILTER (WHERE status = 'rejected') as rejected
            FROM applications
        """)
        return dict(cur.fetchone())


# =============================================================================
# UTILITY FUNCTIONS
# =============================================================================

def test_connection() -> bool:
    """Test database connection"""
    try:
        with get_db_cursor(commit=False) as cur:
            cur.execute("SELECT 1")
            return True
    except Exception as e:
        print(f"Database connection test failed: {e}")
        return False


def get_database_stats() -> Dict[str, int]:
    """Get row counts for all tables"""
    with get_db_cursor(commit=False) as cur:
        cur.execute("SELECT * FROM migration_summary")
        results = cur.fetchall()
        return {row['table_name']: row['row_count'] for row in results}


# Initialize connection pool on module import
init_connection_pool()

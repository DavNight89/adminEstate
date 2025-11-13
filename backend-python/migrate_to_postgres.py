#!/usr/bin/env python3
"""
AdminEstate - JSON to PostgreSQL Migration Script
Created: 2025-11-09
Purpose: Migrate data from data.json to PostgreSQL database

This script:
1. Reads existing data.json file
2. Connects to PostgreSQL database
3. Migrates all records to PostgreSQL tables
4. Verifies migration success
5. Creates backup of data.json

PREREQUISITES:
- PostgreSQL installed and running
- Database 'adminestate' created: CREATE DATABASE adminestate;
- Schema created: psql -U postgres -d adminestate -f schema.sql
- psycopg2 installed: pip install psycopg2-binary
"""

import json
import os
import sys
import shutil
from datetime import datetime
import psycopg2
from psycopg2.extras import execute_batch, Json
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Configuration
DATA_FILE = os.path.join(os.path.dirname(__file__), '..', 'src', 'data.json')
BACKUP_FILE = os.path.join(os.path.dirname(__file__), '..', 'src', 'data.json.backup')

# Database connection settings
DB_CONFIG = {
    'dbname': os.getenv('DB_NAME', 'adminestate'),
    'user': os.getenv('DB_USER', 'postgres'),
    'password': os.getenv('DB_PASSWORD', ''),
    'host': os.getenv('DB_HOST', 'localhost'),
    'port': int(os.getenv('DB_PORT', 5432))
}


def print_header(message):
    """Print formatted header message"""
    print("\n" + "=" * 80)
    print(f"  {message}")
    print("=" * 80)


def print_step(step_num, message):
    """Print formatted step message"""
    print(f"\n[Step {step_num}] {message}")


def print_success(message):
    """Print success message"""
    print(f"✓ {message}")


def print_error(message):
    """Print error message"""
    print(f"✗ ERROR: {message}")


def read_json_data():
    """Read data from JSON file"""
    print_step(1, "Reading data.json file...")

    if not os.path.exists(DATA_FILE):
        print_error(f"data.json not found at: {DATA_FILE}")
        sys.exit(1)

    with open(DATA_FILE, 'r', encoding='utf-8') as f:
        data = json.load(f)

    print_success(f"Loaded data.json successfully")
    print(f"   - Properties: {len(data.get('properties', []))}")
    print(f"   - Tenants: {len(data.get('tenants', []))}")
    print(f"   - Work Orders: {len(data.get('workOrders', []))}")
    print(f"   - Messages: {len(data.get('messages', []))}")
    print(f"   - Applications: {len(data.get('applications', []))}")
    print(f"   - Transactions: {len(data.get('transactions', []))}")
    print(f"   - Documents: {len(data.get('documents', []))}")

    return data


def create_backup():
    """Create backup of data.json"""
    print_step(2, "Creating backup of data.json...")

    try:
        shutil.copy2(DATA_FILE, BACKUP_FILE)
        print_success(f"Backup created: {BACKUP_FILE}")
    except Exception as e:
        print_error(f"Failed to create backup: {e}")
        sys.exit(1)


def get_db_connection():
    """Create PostgreSQL database connection"""
    try:
        # Try to get password from environment variable first
        password = os.getenv('POSTGRES_PASSWORD', DB_CONFIG['password'])

        conn = psycopg2.connect(
            dbname=DB_CONFIG['dbname'],
            user=DB_CONFIG['user'],
            password=password,
            host=DB_CONFIG['host'],
            port=DB_CONFIG['port']
        )
        return conn
    except psycopg2.OperationalError as e:
        print_error(f"Could not connect to PostgreSQL: {e}")
        print("\nPlease ensure:")
        print("1. PostgreSQL is running")
        print("2. Database 'adminestate' exists: CREATE DATABASE adminestate;")
        print("3. Set POSTGRES_PASSWORD environment variable or update DB_CONFIG in script")
        sys.exit(1)


def migrate_properties(conn, properties):
    """Migrate properties to PostgreSQL"""
    print_step(3, f"Migrating {len(properties)} properties...")

    with conn.cursor() as cur:
        sql = """
            INSERT INTO properties
            (id, name, address, type, units, occupied, monthly_revenue,
             purchase_price, purchase_date, status, created_at, updated_at)
            VALUES
            (%(id)s, %(name)s, %(address)s, %(type)s, %(units)s, %(occupied)s,
             %(monthlyRevenue)s, %(purchasePrice)s, %(purchaseDate)s, %(status)s,
             CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
            ON CONFLICT (id) DO UPDATE SET
                name = EXCLUDED.name,
                address = EXCLUDED.address,
                type = EXCLUDED.type,
                units = EXCLUDED.units,
                occupied = EXCLUDED.occupied,
                monthly_revenue = EXCLUDED.monthly_revenue,
                purchase_price = EXCLUDED.purchase_price,
                purchase_date = EXCLUDED.purchase_date,
                status = EXCLUDED.status,
                updated_at = CURRENT_TIMESTAMP
        """

        execute_batch(cur, sql, properties)
        conn.commit()

        print_success(f"Migrated {len(properties)} properties")


def migrate_tenants(conn, tenants):
    """Migrate tenants to PostgreSQL"""
    print_step(4, f"Migrating {len(tenants)} tenants...")

    with conn.cursor() as cur:
        sql = """
            INSERT INTO tenants
            (id, name, email, phone, property_id, property_name, unit, rent,
             lease_start, lease_end, status, balance, avatar, created_at, updated_at)
            VALUES
            (%(id)s, %(name)s, %(email)s, %(phone)s,
             (SELECT id FROM properties WHERE name = %(property)s LIMIT 1),
             %(property)s, %(unit)s, %(rent)s, %(leaseStart)s, %(leaseEnd)s,
             %(status)s, %(balance)s, %(avatar)s, %(created_at)s, %(updated_at)s)
            ON CONFLICT (id) DO UPDATE SET
                name = EXCLUDED.name,
                email = EXCLUDED.email,
                phone = EXCLUDED.phone,
                property_id = EXCLUDED.property_id,
                property_name = EXCLUDED.property_name,
                unit = EXCLUDED.unit,
                rent = EXCLUDED.rent,
                lease_start = EXCLUDED.lease_start,
                lease_end = EXCLUDED.lease_end,
                status = EXCLUDED.status,
                balance = EXCLUDED.balance,
                avatar = EXCLUDED.avatar,
                updated_at = CURRENT_TIMESTAMP
        """

        # Convert empty strings to None for proper NULL handling
        for tenant in tenants:
            if tenant.get('leaseStart') == '':
                tenant['leaseStart'] = None
            if tenant.get('leaseEnd') == '':
                tenant['leaseEnd'] = None

        execute_batch(cur, sql, tenants)
        conn.commit()

        print_success(f"Migrated {len(tenants)} tenants")


def migrate_work_orders(conn, work_orders):
    """Migrate work orders to PostgreSQL"""
    print_step(5, f"Migrating {len(work_orders)} work orders...")

    if len(work_orders) == 0:
        print_success("No work orders to migrate")
        return

    with conn.cursor() as cur:
        sql = """
            INSERT INTO work_orders
            (id, property, tenant, unit, issue, description, category, priority,
             status, date, location, access_instructions, preferred_time, photos,
             source, message_id, submitted_at, approved_at, updated_at)
            VALUES
            (%(id)s, %(property)s, %(tenant)s, %(unit)s, %(issue)s, %(description)s,
             %(category)s, %(priority)s, %(status)s, %(date)s, %(location)s,
             %(accessInstructions)s, %(preferredTime)s, %(photos)s, %(source)s,
             %(messageId)s, %(submittedAt)s, %(approvedAt)s, %(updatedAt)s)
            ON CONFLICT (id) DO UPDATE SET
                status = EXCLUDED.status,
                updated_at = CURRENT_TIMESTAMP
        """

        # Convert photo lists to PostgreSQL arrays
        for wo in work_orders:
            if 'photos' in wo and isinstance(wo['photos'], list):
                # Keep as list, psycopg2 will convert to PostgreSQL array
                pass
            else:
                wo['photos'] = []

        execute_batch(cur, sql, work_orders)
        conn.commit()

        print_success(f"Migrated {len(work_orders)} work orders")


def migrate_messages(conn, messages):
    """Migrate messages to PostgreSQL"""
    print_step(6, f"Migrating {len(messages)} messages...")

    if len(messages) == 0:
        print_success("No messages to migrate")
        return

    with conn.cursor() as cur:
        sql = """
            INSERT INTO messages
            (id, from_name, from_email, to_name, to_email, property, unit,
             subject, message, date, time, read, type, status, maintenance_data,
             work_order_id, reply_to, submitted_at, approved_at, sent_at, created_at)
            VALUES
            (%(id)s, %(from)s, %(fromEmail)s, %(to)s, %(toEmail)s, %(property)s,
             %(unit)s, %(subject)s, %(message)s, %(date)s, %(time)s, %(read)s,
             %(type)s, %(status)s, %(maintenanceData)s, %(workOrderId)s, %(replyTo)s,
             %(submittedAt)s, %(approvedAt)s, %(sentAt)s, CURRENT_TIMESTAMP)
            ON CONFLICT (id) DO UPDATE SET
                read = EXCLUDED.read,
                status = EXCLUDED.status,
                work_order_id = EXCLUDED.work_order_id,
                approved_at = EXCLUDED.approved_at
        """

        # Prepare messages for PostgreSQL
        for msg in messages:
            # Handle maintenance_data as JSONB
            if 'maintenanceData' in msg and msg['maintenanceData']:
                msg['maintenanceData'] = Json(msg['maintenanceData'])
            else:
                msg['maintenanceData'] = None

            # Set defaults for missing fields
            msg.setdefault('to', None)
            msg.setdefault('toEmail', None)
            msg.setdefault('property', None)
            msg.setdefault('unit', None)
            msg.setdefault('status', None)
            msg.setdefault('workOrderId', None)
            msg.setdefault('replyTo', None)
            msg.setdefault('submittedAt', None)
            msg.setdefault('approvedAt', None)
            msg.setdefault('sentAt', None)

        execute_batch(cur, sql, messages)
        conn.commit()

        print_success(f"Migrated {len(messages)} messages")


def migrate_applications(conn, applications):
    """Migrate applications to PostgreSQL"""
    print_step(7, f"Migrating {len(applications)} applications...")

    if len(applications) == 0:
        print_success("No applications to migrate")
        return

    with conn.cursor() as cur:
        sql = """
            INSERT INTO applications
            (id, status, submitted_date, first_name, last_name, email, phone,
             date_of_birth, ssn, property_id, property_name, desired_unit,
             desired_move_in_date, lease_term, current_employer, job_title,
             employment_start_date, monthly_income, employer_phone, additional_income,
             current_address, previous_addresses, emergency_contact, personal_references,
             occupants, pets, vehicles, has_evictions, has_bankruptcy, has_criminal_history,
             disclosure_notes, background_check_consent, credit_check_consent,
             consent_signature, consent_date, documents, screening_id, reviewed_by,
             reviewed_date, decision_reason, tenant_id, created_at, updated_at, last_updated)
            VALUES
            (%(id)s, %(status)s, %(submittedDate)s, %(firstName)s, %(lastName)s,
             %(email)s, %(phone)s, %(dateOfBirth)s, %(ssn)s, %(propertyId)s,
             %(propertyName)s, %(desiredUnit)s, %(desiredMoveInDate)s, %(leaseTerm)s,
             %(currentEmployer)s, %(jobTitle)s, %(employmentStartDate)s, %(monthlyIncome)s,
             %(employerPhone)s, %(additionalIncome)s, %(currentAddress)s, %(previousAddresses)s,
             %(emergencyContact)s, %(personalReferences)s, %(occupants)s, %(pets)s,
             %(vehicles)s, %(hasEvictions)s, %(hasBankruptcy)s, %(hasCriminalHistory)s,
             %(disclosureNotes)s, %(backgroundCheckConsent)s, %(creditCheckConsent)s,
             %(consentSignature)s, %(consentDate)s, %(documents)s, %(screeningId)s,
             %(reviewedBy)s, %(reviewedDate)s, %(decisionReason)s, %(tenantId)s,
             %(createdAt)s, %(updatedAt)s, %(lastUpdated)s)
            ON CONFLICT (id) DO UPDATE SET
                status = EXCLUDED.status,
                updated_at = CURRENT_TIMESTAMP,
                last_updated = CURRENT_TIMESTAMP
        """

        # Convert complex fields to JSONB
        for app in applications:
            for field in ['additionalIncome', 'currentAddress', 'previousAddresses',
                          'emergencyContact', 'personalReferences', 'occupants',
                          'pets', 'vehicles', 'documents']:
                if field in app and app[field] is not None:
                    app[field] = Json(app[field])
                else:
                    app[field] = Json([]) if field != 'currentAddress' else None

        execute_batch(cur, sql, applications)
        conn.commit()

        print_success(f"Migrated {len(applications)} applications")


def verify_migration(conn, original_data):
    """Verify migration success by comparing row counts"""
    print_step(8, "Verifying migration...")

    with conn.cursor() as cur:
        cur.execute("SELECT * FROM migration_summary ORDER BY table_name")
        results = cur.fetchall()

        print("\nMigration Summary:")
        print("-" * 50)

        all_good = True

        for table_name, row_count in results:
            # Map table names to JSON keys
            json_keys = {
                'properties': 'properties',
                'tenants': 'tenants',
                'work_orders': 'workOrders',
                'messages': 'messages',
                'applications': 'applications',
                'transactions': 'transactions',
                'documents': 'documents'
            }

            json_key = json_keys.get(table_name, table_name)
            expected_count = len(original_data.get(json_key, []))

            status = "✓" if row_count == expected_count else "✗"
            print(f"{status} {table_name:20} | Expected: {expected_count:3} | Actual: {row_count:3}")

            if row_count != expected_count:
                all_good = False

        print("-" * 50)

        if all_good:
            print_success("All data migrated successfully!")
        else:
            print_error("Row count mismatch detected!")
            return False

    return True


def main():
    """Main migration function"""
    print_header("AdminEstate - JSON to PostgreSQL Migration")

    # Step 1: Read JSON data
    data = read_json_data()

    # Step 2: Create backup
    create_backup()

    # Step 3-7: Connect and migrate
    print_step(3, "Connecting to PostgreSQL...")
    conn = get_db_connection()
    print_success("Connected to PostgreSQL successfully")

    try:
        # Migrate each table
        migrate_properties(conn, data.get('properties', []))
        migrate_tenants(conn, data.get('tenants', []))
        migrate_work_orders(conn, data.get('workOrders', []))
        migrate_messages(conn, data.get('messages', []))
        migrate_applications(conn, data.get('applications', []))

        # Transactions and documents are empty, but tables exist
        if len(data.get('transactions', [])) > 0:
            print_step(8, "Migrating transactions...")
            # Add migration code if needed

        if len(data.get('documents', [])) > 0:
            print_step(9, "Migrating documents...")
            # Add migration code if needed

        # Verify migration
        if verify_migration(conn, data):
            print_header("Migration Completed Successfully!")
            print("\nNext Steps:")
            print("1. Update backend-python/app_simple.py to use PostgreSQL")
            print("2. Test API endpoints with both AdminEstate and Tenant Portal")
            print("3. Keep data.json.backup for rollback if needed")
        else:
            print_error("Migration verification failed!")
            return 1

    except Exception as e:
        print_error(f"Migration failed: {e}")
        import traceback
        traceback.print_exc()
        conn.rollback()
        return 1

    finally:
        conn.close()
        print("\nDatabase connection closed.")

    return 0


if __name__ == '__main__':
    sys.exit(main())

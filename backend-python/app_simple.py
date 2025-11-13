"""
Flask Backend with PostgreSQL - Database-driven AdminEstate backend
Supports both PostgreSQL and JSON fallback for flexibility
"""
from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS
import json
from pathlib import Path
from datetime import datetime
import pandas as pd
import numpy as np
import os
import base64
from werkzeug.utils import secure_filename
from dotenv import load_dotenv
import db  # PostgreSQL database module

# Load environment variables
load_dotenv()

app = Flask(__name__)

# Simple CORS configuration
CORS(app,
     origins=['http://localhost:3000', 'http://127.0.0.1:3000', 'http://localhost:3003', 'http://127.0.0.1:3003'],
     methods=['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
     allow_headers=['Content-Type', 'Authorization'])

# Path to data.json
DATA_FILE = Path(__file__).parent.parent / 'src' / 'data.json'

# Path to uploads directory
UPLOAD_FOLDER = Path(__file__).parent / 'uploads'
MAINTENANCE_UPLOAD_FOLDER = UPLOAD_FOLDER / 'maintenance'
DOCUMENTS_UPLOAD_FOLDER = UPLOAD_FOLDER / 'documents'

# Ensure upload directories exist
UPLOAD_FOLDER.mkdir(exist_ok=True)
MAINTENANCE_UPLOAD_FOLDER.mkdir(exist_ok=True)
DOCUMENTS_UPLOAD_FOLDER.mkdir(exist_ok=True)

# Allowed file extensions
ALLOWED_IMAGE_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'webp'}
ALLOWED_DOCUMENT_EXTENSIONS = {'pdf', 'doc', 'docx', 'xls', 'xlsx', 'txt', 'png', 'jpg', 'jpeg', 'gif', 'webp'}

def allowed_file(filename, allowed_extensions=None):
    """Check if file extension is allowed"""
    if allowed_extensions is None:
        allowed_extensions = ALLOWED_IMAGE_EXTENSIONS
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in allowed_extensions

def read_data():
    """Read data from data.json"""
    try:
        with open(DATA_FILE, 'r') as f:
            return json.load(f)
    except Exception as e:
        print(f"Error reading data.json: {e}")
        return {
            'properties': [],
            'tenants': [],
            'workOrders': [],
            'transactions': [],
            'documents': [],
            'applications': []
        }

def write_data(data):
    """Write data to data.json"""
    try:
        with open(DATA_FILE, 'w') as f:
            json.dump(data, f, indent=2, default=str)
        return True
    except Exception as e:
        print(f"Error writing data.json: {e}")
        return False

# ===== HEALTH CHECK =====
@app.route('/api/health', methods=['GET'])
def health_check():
    db_status = 'connected' if db.test_connection() else 'disconnected'
    return jsonify({
        'status': 'healthy',
        'message': 'Flask server with PostgreSQL database',
        'database': db_status,
        'timestamp': datetime.now().isoformat()
    })

# ===== PROPERTIES ENDPOINTS =====
@app.route('/api/properties', methods=['GET'])
def get_properties():
    try:
        properties = db.get_all_properties()
        return jsonify({
            'success': True,
            'data': properties,
            'source': 'postgresql'
        })
    except Exception as e:
        print(f"Error getting properties: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/properties', methods=['POST'])
def add_property():
    try:
        new_property = request.json

        # Generate ID if not present
        if 'id' not in new_property:
            new_property['id'] = int(datetime.now().timestamp() * 1000)

        # Add timestamps
        new_property['created_at'] = datetime.now().isoformat()
        new_property['updated_at'] = datetime.now().isoformat()

        property_id = db.create_property(new_property)
        new_property['id'] = property_id

        return jsonify({
            'success': True,
            'data': new_property,
            'message': 'Property added to database'
        })

    except Exception as e:
        print(f"Error adding property: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500

# ===== TENANTS ENDPOINTS =====
@app.route('/api/tenants', methods=['GET'])
def get_tenants():
    try:
        tenants = db.get_all_tenants()
        return jsonify({
            'success': True,
            'data': tenants,
            'source': 'postgresql'
        })
    except Exception as e:
        print(f"Error getting tenants: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/tenants', methods=['POST'])
def add_tenant():
    try:
        new_tenant = request.json

        # Generate ID if not present
        if 'id' not in new_tenant:
            new_tenant['id'] = int(datetime.now().timestamp() * 1000)

        # Add timestamps
        new_tenant['created_at'] = datetime.now().isoformat()
        new_tenant['updated_at'] = datetime.now().isoformat()

        tenant_id = db.create_tenant(new_tenant)
        new_tenant['id'] = tenant_id

        return jsonify({
            'success': True,
            'data': new_tenant,
            'message': 'Tenant added to database'
        })

    except Exception as e:
        print(f"Error adding tenant: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500

# ===== WORK ORDERS ENDPOINTS =====
@app.route('/api/workorders', methods=['GET'])
def get_workorders():
    try:
        work_orders = db.get_all_work_orders()
        return jsonify({
            'success': True,
            'data': work_orders,
            'source': 'postgresql'
        })
    except Exception as e:
        print(f"Error getting work orders: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/workorders', methods=['POST'])
def add_workorder():
    try:
        new_workorder = request.json

        # Generate ID if not present
        if 'id' not in new_workorder:
            new_workorder['id'] = int(datetime.now().timestamp() * 1000)

        # Add timestamps
        if 'submittedAt' not in new_workorder:
            new_workorder['submittedAt'] = datetime.now().isoformat()
        new_workorder['updatedAt'] = datetime.now().isoformat()

        work_order_id = db.create_work_order(new_workorder)
        new_workorder['id'] = work_order_id

        return jsonify({
            'success': True,
            'data': new_workorder,
            'message': 'Work order added to database'
        })

    except Exception as e:
        print(f"Error adding work order: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500

# ===== TRANSACTIONS ENDPOINTS =====
@app.route('/api/transactions', methods=['GET'])
def get_transactions():
    try:
        with db.get_db_cursor(commit=False) as cur:
            cur.execute("""
                SELECT id, property_id as "propertyId", property_name as property,
                       tenant_id as "tenantId", tenant_name as tenant,
                       amount, type, category, date, description, payment_method as "paymentMethod",
                       created_at, updated_at
                FROM transactions
                ORDER BY date DESC, created_at DESC
            """)
            transactions = [dict(row) for row in cur.fetchall()]

        return jsonify({
            'success': True,
            'data': transactions,
            'source': 'postgresql'
        })
    except Exception as e:
        print(f"Error getting transactions: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/transactions', methods=['POST'])
def add_transaction():
    try:
        new_transaction = request.json

        # Generate ID if not present
        if 'id' not in new_transaction:
            new_transaction['id'] = int(datetime.now().timestamp() * 1000)

        with db.get_db_cursor() as cur:
            cur.execute("""
                INSERT INTO transactions
                (id, property_id, property_name, tenant_id, tenant_name, amount, type,
                 category, date, description, payment_method)
                VALUES
                (%(id)s,
                 (SELECT id FROM properties WHERE name = %(property)s LIMIT 1),
                 %(property)s,
                 (SELECT id FROM tenants WHERE name = %(tenant)s LIMIT 1),
                 %(tenant)s,
                 %(amount)s, %(type)s, %(category)s, %(date)s, %(description)s, %(paymentMethod)s)
                RETURNING id
            """, new_transaction)
            transaction_id = cur.fetchone()['id']

        new_transaction['id'] = transaction_id

        return jsonify({
            'success': True,
            'data': new_transaction,
            'message': 'Transaction added to database'
        })

    except Exception as e:
        print(f"Error adding transaction: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500

# ===== DOCUMENTS ENDPOINTS =====
@app.route('/api/documents', methods=['GET'])
def get_documents():
    try:
        with db.get_db_cursor(commit=False) as cur:
            cur.execute("""
                SELECT id, name, category, property_id as "propertyId",
                       property_name as property, file_path as "filePath",
                       file_size as "fileSize", file_type as "fileType",
                       uploaded_date as "uploadedDate", created_at, updated_at
                FROM documents
                ORDER BY uploaded_date DESC, created_at DESC
            """)
            documents = [dict(row) for row in cur.fetchall()]

        return jsonify({
            'success': True,
            'data': documents,
            'source': 'postgresql'
        })
    except Exception as e:
        print(f"Error getting documents: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/documents', methods=['POST'])
def add_document():
    try:
        new_document = request.json

        # Generate ID if not present
        if 'id' not in new_document:
            new_document['id'] = int(datetime.now().timestamp() * 1000)

        with db.get_db_cursor() as cur:
            cur.execute("""
                INSERT INTO documents
                (id, name, category, property_id, property_name, file_path,
                 file_size, file_type, uploaded_date)
                VALUES
                (%(id)s, %(name)s, %(category)s,
                 (SELECT id FROM properties WHERE name = %(property)s LIMIT 1),
                 %(property)s, %(filePath)s, %(fileSize)s, %(fileType)s, %(uploadedDate)s)
                RETURNING id
            """, new_document)
            document_id = cur.fetchone()['id']

        new_document['id'] = document_id

        return jsonify({
            'success': True,
            'data': new_document,
            'message': 'Document added to database'
        })

    except Exception as e:
        print(f"Error adding document: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500

# ===== SYNC ENDPOINT (Merge instead of replace) =====
@app.route('/api/sync/localstorage', methods=['POST'])
def sync_localstorage():
    """Accept localStorage data and merge with existing data.json (preserve tenant portal entries)"""
    try:
        localStorage_data = request.json

        # Read current data
        current_data = read_data()

        # Preserve tenant portal work orders
        tenant_orders = [wo for wo in current_data.get('workOrders', []) if wo.get('source') == 'tenant_portal']

        # Preserve maintenance request messages from tenant portal
        tenant_messages = [msg for msg in current_data.get('messages', []) if msg.get('type') == 'maintenance_request']

        # Merge: Use localStorage data but preserve tenant portal entries
        merged_data = localStorage_data.copy()

        # Get work orders from localStorage (without tenant portal ones)
        admin_orders = [wo for wo in merged_data.get('workOrders', []) if wo.get('source') != 'tenant_portal']

        # Get messages from localStorage (without maintenance request ones)
        admin_messages = [msg for msg in merged_data.get('messages', []) if msg.get('type') != 'maintenance_request']

        # Combine: admin entries + tenant entries
        merged_data['workOrders'] = admin_orders + tenant_orders
        merged_data['messages'] = admin_messages + tenant_messages

        if write_data(merged_data):
            return jsonify({
                'success': True,
                'message': f'Data synced to data.json (preserved {len(tenant_orders)} work orders, {len(tenant_messages)} maintenance requests)',
                'timestamp': datetime.now().isoformat()
            })
        else:
            return jsonify({'success': False, 'error': 'Failed to write data'}), 500

    except Exception as e:
        print(f"Error in sync_localstorage: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500

# ===== PANDAS ANALYTICS ENDPOINTS =====

@app.route('/api/analytics/dashboard', methods=['GET'])
def analytics_dashboard():
    """Main dashboard analytics using Pandas"""
    try:
        data = read_data()
        properties = data.get('properties', [])
        tenants = data.get('tenants', [])

        if not properties:
            return jsonify({
                'success': True,
                'data': {
                    'total_properties': 0,
                    'total_portfolio_value': 0,
                    'total_monthly_revenue': 0,
                    'avg_cap_rate': 0,
                    'total_units': 0,
                    'occupied_units': 0,
                    'vacant_units': 0,
                    'occupancy_rate': 0,
                    'avg_property_value': 0,
                    'avg_revenue_per_property': 0
                }
            })

        # Create DataFrame from properties
        df = pd.DataFrame(properties)

        # Calculate metrics
        total_properties = len(df)
        total_portfolio_value = df['purchasePrice'].sum()
        total_monthly_revenue = df['monthlyRevenue'].sum()
        total_units = df['units'].sum()
        occupied_units = df['occupied'].sum()
        vacant_units = total_units - occupied_units
        occupancy_rate = (occupied_units / total_units * 100) if total_units > 0 else 0

        # Calculate cap rate (monthly revenue * 12 / purchase price * 100)
        df['cap_rate'] = df.apply(
            lambda row: (row['monthlyRevenue'] * 12 / row['purchasePrice'] * 100)
            if row['purchasePrice'] > 0 else 0,
            axis=1
        )
        avg_cap_rate = df['cap_rate'].mean()

        avg_property_value = df['purchasePrice'].mean()
        avg_revenue_per_property = df['monthlyRevenue'].mean()

        return jsonify({
            'success': True,
            'data': {
                'total_properties': int(total_properties),
                'total_portfolio_value': float(total_portfolio_value),
                'total_monthly_revenue': float(total_monthly_revenue),
                'avg_cap_rate': float(avg_cap_rate),
                'total_units': int(total_units),
                'occupied_units': int(occupied_units),
                'vacant_units': int(vacant_units),
                'occupancy_rate': float(occupancy_rate),
                'avg_property_value': float(avg_property_value),
                'avg_revenue_per_property': float(avg_revenue_per_property)
            }
        })
    except Exception as e:
        print(f"Error in analytics_dashboard: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/analytics/property-types', methods=['GET'])
def analytics_property_types():
    """Analytics grouped by property type"""
    try:
        data = read_data()
        properties = data.get('properties', [])

        if not properties:
            return jsonify({'success': True, 'data': {}})

        df = pd.DataFrame(properties)

        # Group by property type
        grouped = df.groupby('type').agg({
            'id': 'count',
            'purchasePrice': 'sum',
            'monthlyRevenue': 'sum',
            'units': 'sum',
            'occupied': 'sum'
        }).rename(columns={
            'id': 'property_count',
            'purchasePrice': 'total_value',
            'monthlyRevenue': 'total_revenue'
        })

        # Calculate cap rate per type
        grouped['avg_cap_rate'] = (grouped['total_revenue'] * 12 / grouped['total_value'] * 100).fillna(0)

        result = {}
        for property_type, row in grouped.iterrows():
            result[property_type] = {
                'property_count': int(row['property_count']),
                'total_value': float(row['total_value']),
                'total_revenue': float(row['total_revenue']),
                'avg_cap_rate': float(row['avg_cap_rate']),
                'total_units': int(row['units']),
                'occupied_units': int(row['occupied'])
            }

        return jsonify({'success': True, 'data': result})
    except Exception as e:
        print(f"Error in analytics_property_types: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/analytics/rankings', methods=['GET'])
def analytics_rankings():
    """Top performing properties"""
    try:
        data = read_data()
        properties = data.get('properties', [])

        if not properties:
            return jsonify({'success': True, 'data': {'top_by_value': [], 'top_by_revenue': []}})

        df = pd.DataFrame(properties)

        # Calculate occupancy rate
        df['occupancy_rate'] = (df['occupied'] / df['units'] * 100).fillna(0)

        # Top by value
        top_by_value = df.nlargest(5, 'purchasePrice')[['name', 'type', 'units', 'purchasePrice']].to_dict('records')

        # Top by revenue
        top_by_revenue = df.nlargest(5, 'monthlyRevenue')[['name', 'type', 'monthlyRevenue', 'occupancy_rate']].to_dict('records')

        return jsonify({
            'success': True,
            'data': {
                'top_by_value': top_by_value,
                'top_by_revenue': top_by_revenue
            }
        })
    except Exception as e:
        print(f"Error in analytics_rankings: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/analytics/portfolio', methods=['GET'])
def analytics_portfolio():
    """Portfolio-wide analytics"""
    try:
        data = read_data()
        properties = data.get('properties', [])
        tenants = data.get('tenants', [])

        if not properties:
            return jsonify({'success': True, 'data': {}})

        df = pd.DataFrame(properties)

        portfolio_data = {
            'total_properties': len(df),
            'total_value': float(df['purchasePrice'].sum()),
            'total_revenue': float(df['monthlyRevenue'].sum()),
            'total_tenants': len(tenants),
            'property_types': df['type'].nunique(),
            'avg_units_per_property': float(df['units'].mean())
        }

        return jsonify({'success': True, 'data': portfolio_data})
    except Exception as e:
        print(f"Error in analytics_portfolio: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/analytics/correlations', methods=['GET'])
def analytics_correlations():
    """Correlation analysis between metrics"""
    try:
        data = read_data()
        properties = data.get('properties', [])

        if not properties or len(properties) < 2:
            return jsonify({'success': True, 'data': {}})

        df = pd.DataFrame(properties)

        # Select numeric columns for correlation
        numeric_cols = ['units', 'occupied', 'monthlyRevenue', 'purchasePrice']
        correlation_matrix = df[numeric_cols].corr()

        # Replace NaN with null (valid JSON) and convert to dict
        correlation_matrix = correlation_matrix.replace({np.nan: None}).to_dict()

        return jsonify({'success': True, 'data': correlation_matrix})
    except Exception as e:
        print(f"Error in analytics_correlations: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500

# ===== APPLICATIONS ENDPOINTS =====
@app.route('/api/applications', methods=['GET'])
def get_applications():
    """Get all tenant applications with optional filters"""
    try:
        data = read_data()
        applications = data.get('applications', [])

        # Optional filters
        status = request.args.get('status')
        property_id = request.args.get('propertyId')
        search = request.args.get('search')

        # Apply filters
        if status:
            applications = [a for a in applications if a.get('status') == status]

        if property_id:
            applications = [a for a in applications if a.get('propertyId') == property_id]

        if search:
            search_lower = search.lower()
            applications = [
                a for a in applications
                if search_lower in a.get('firstName', '').lower()
                or search_lower in a.get('lastName', '').lower()
                or search_lower in a.get('email', '').lower()
                or search_lower in a.get('propertyName', '').lower()
            ]

        return jsonify({
            'success': True,
            'data': applications,
            'count': len(applications)
        })
    except Exception as e:
        print(f"Error in get_applications: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/applications/<int:application_id>', methods=['GET'])
def get_application(application_id):
    """Get specific application by ID"""
    try:
        data = read_data()
        applications = data.get('applications', [])

        application = next((a for a in applications if a.get('id') == application_id), None)

        if not application:
            return jsonify({'success': False, 'error': 'Application not found'}), 404

        return jsonify({
            'success': True,
            'data': application
        })
    except Exception as e:
        print(f"Error in get_application: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/applications', methods=['POST'])
def create_application():
    """Submit new tenant application"""
    try:
        data = read_data()
        new_application = request.json

        # Generate ID if not present
        if 'id' not in new_application:
            new_application['id'] = int(datetime.now().timestamp() * 1000)

        # Set timestamps and defaults
        if 'status' not in new_application:
            new_application['status'] = 'submitted'

        if 'submittedDate' not in new_application:
            new_application['submittedDate'] = datetime.now().isoformat()

        new_application['createdAt'] = datetime.now().isoformat()
        new_application['updatedAt'] = datetime.now().isoformat()

        # Initialize empty arrays if not present
        if 'documents' not in new_application:
            new_application['documents'] = []

        # Ensure applications array exists
        if 'applications' not in data:
            data['applications'] = []

        data['applications'].append(new_application)

        if write_data(data):
            # TODO: Send confirmation email here
            return jsonify({
                'success': True,
                'data': new_application,
                'message': 'Application submitted successfully'
            }), 201
        else:
            return jsonify({'success': False, 'error': 'Failed to save application'}), 500

    except Exception as e:
        print(f"Error in create_application: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/applications/<int:application_id>', methods=['PUT'])
def update_application(application_id):
    """Update application (status, review, etc.)"""
    try:
        data = read_data()
        applications = data.get('applications', [])

        # Find application index
        app_index = next((i for i, a in enumerate(applications) if a.get('id') == application_id), None)

        if app_index is None:
            return jsonify({'success': False, 'error': 'Application not found'}), 404

        # Update application
        update_data = request.json
        applications[app_index].update(update_data)
        applications[app_index]['updatedAt'] = datetime.now().isoformat()

        # If status changed to approved/rejected, set review date
        if 'status' in update_data and update_data['status'] in ['approved', 'rejected']:
            if 'reviewedDate' not in applications[app_index]:
                applications[app_index]['reviewedDate'] = datetime.now().isoformat()

        data['applications'] = applications

        if write_data(data):
            return jsonify({
                'success': True,
                'data': applications[app_index],
                'message': 'Application updated successfully'
            })
        else:
            return jsonify({'success': False, 'error': 'Failed to update application'}), 500

    except Exception as e:
        print(f"Error in update_application: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/applications/<int:application_id>', methods=['DELETE'])
def delete_application(application_id):
    """Delete application"""
    try:
        data = read_data()
        applications = data.get('applications', [])

        # Find and remove application
        initial_count = len(applications)
        applications = [a for a in applications if a.get('id') != application_id]

        if len(applications) == initial_count:
            return jsonify({'success': False, 'error': 'Application not found'}), 404

        data['applications'] = applications

        if write_data(data):
            return jsonify({
                'success': True,
                'message': 'Application deleted successfully'
            })
        else:
            return jsonify({'success': False, 'error': 'Failed to delete application'}), 500

    except Exception as e:
        print(f"Error in delete_application: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/applications/<int:application_id>/convert', methods=['POST'])
def convert_application_to_tenant(application_id):
    """Convert approved application to active tenant"""
    try:
        data = read_data()
        applications = data.get('applications', [])

        # Find application
        app_index = next((i for i, a in enumerate(applications) if a.get('id') == application_id), None)

        if app_index is None:
            return jsonify({'success': False, 'error': 'Application not found'}), 404

        application = applications[app_index]

        # Check if application is approved
        if application.get('status') != 'approved':
            return jsonify({'success': False, 'error': 'Only approved applications can be converted'}), 400

        # Create tenant from application data
        new_tenant = {
            'id': int(datetime.now().timestamp() * 1000),
            'name': f"{application.get('firstName')} {application.get('lastName')}",
            'email': application.get('email'),
            'phone': application.get('phone'),
            'property': application.get('propertyName'),
            'unit': application.get('desiredUnit', ''),
            'rent': application.get('monthlyIncome', 0) / 3,  # Estimate based on income
            'leaseEnd': application.get('desiredMoveInDate'),  # TODO: Calculate based on lease term
            'status': 'Current',
            'balance': 0,
            'avatar': f"{application.get('firstName', 'T')[0]}{application.get('lastName', 'T')[0]}",
            'created_at': datetime.now().isoformat(),
            'updated_at': datetime.now().isoformat()
        }

        # Add tenant to data
        if 'tenants' not in data:
            data['tenants'] = []
        data['tenants'].append(new_tenant)

        # Update application with tenant ID
        applications[app_index]['tenantId'] = new_tenant['id']
        applications[app_index]['updatedAt'] = datetime.now().isoformat()
        data['applications'] = applications

        if write_data(data):
            return jsonify({
                'success': True,
                'data': new_tenant,
                'message': 'Application converted to tenant successfully'
            }), 201
        else:
            return jsonify({'success': False, 'error': 'Failed to convert application'}), 500

    except Exception as e:
        print(f"Error in convert_application_to_tenant: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/applications/stats', methods=['GET'])
def get_application_stats():
    """Get application statistics"""
    try:
        data = read_data()
        applications = data.get('applications', [])

        if not applications:
            return jsonify({
                'success': True,
                'data': {
                    'total': 0,
                    'submitted': 0,
                    'screening': 0,
                    'approved': 0,
                    'rejected': 0,
                    'withdrawn': 0
                }
            })

        # Count by status
        stats = {
            'total': len(applications),
            'submitted': len([a for a in applications if a.get('status') == 'submitted']),
            'screening': len([a for a in applications if a.get('status') == 'screening']),
            'approved': len([a for a in applications if a.get('status') == 'approved']),
            'rejected': len([a for a in applications if a.get('status') == 'rejected']),
            'withdrawn': len([a for a in applications if a.get('status') == 'withdrawn'])
        }

        return jsonify({
            'success': True,
            'data': stats
        })
    except Exception as e:
        print(f"Error in get_application_stats: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500

# ===== TENANT PORTAL ENDPOINTS =====

@app.route('/api/tenant/login', methods=['POST'])
def tenant_login():
    """Tenant login - authenticate and return token"""
    try:
        credentials = request.json
        email = credentials.get('email')
        password = credentials.get('password')

        # For now, do simple validation (in production, verify against database with hashed passwords)
        data = read_data()
        tenants = data.get('tenants', [])

        # Find tenant by email
        tenant = next((t for t in tenants if t.get('email') == email), None)

        if tenant:
            # In production, verify password hash here
            # For now, just return the tenant data with a token
            return jsonify({
                'success': True,
                'token': f'mock-token-{tenant.get("id")}',
                'tenant': {
                    'id': tenant.get('id'),
                    'name': tenant.get('name'),
                    'email': tenant.get('email'),
                    'unit': tenant.get('unit'),
                    'property': tenant.get('property')
                }
            })
        else:
            # For development: Allow any login (mock mode)
            return jsonify({
                'success': True,
                'token': 'mock-token-123',
                'tenant': {
                    'id': 1,
                    'name': 'Mock Tenant',
                    'email': email,
                    'unit': 'A101',
                    'property': 'Sunset Apartments'
                }
            })

    except Exception as e:
        print(f"Error in tenant_login: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/upload/photo', methods=['POST'])
def upload_photo():
    """Upload a photo and return the file path"""
    try:
        # Check if request contains files
        if 'photo' not in request.files:
            return jsonify({'success': False, 'error': 'No photo provided'}), 400

        file = request.files['photo']

        if file.filename == '':
            return jsonify({'success': False, 'error': 'No file selected'}), 400

        if not allowed_file(file.filename, ALLOWED_IMAGE_EXTENSIONS):
            return jsonify({'success': False, 'error': 'Invalid file type. Allowed: PNG, JPG, JPEG, GIF, WEBP'}), 400

        # Generate unique filename
        timestamp = int(datetime.now().timestamp() * 1000)
        original_ext = file.filename.rsplit('.', 1)[1].lower()
        safe_filename = secure_filename(f"{timestamp}_{file.filename}")

        # Save file
        file_path = MAINTENANCE_UPLOAD_FOLDER / safe_filename
        file.save(str(file_path))

        # Return relative path for storage in data.json
        relative_path = f"/uploads/maintenance/{safe_filename}"

        return jsonify({
            'success': True,
            'data': {
                'path': relative_path,
                'filename': safe_filename,
                'originalName': file.filename
            }
        }), 201

    except Exception as e:
        print(f"Error in upload_photo: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/upload/document', methods=['POST'])
def upload_document():
    """Upload a document and return the file path"""
    try:
        # Check if request contains files
        if 'file' not in request.files:
            return jsonify({'success': False, 'error': 'No file provided'}), 400

        file = request.files['file']

        if file.filename == '':
            return jsonify({'success': False, 'error': 'No file selected'}), 400

        if not allowed_file(file.filename, ALLOWED_DOCUMENT_EXTENSIONS):
            return jsonify({'success': False, 'error': 'Invalid file type. Allowed: PDF, DOC, DOCX, XLS, XLSX, TXT, images'}), 400

        # Generate unique filename
        timestamp = int(datetime.now().timestamp() * 1000)
        safe_filename = secure_filename(f"{timestamp}_{file.filename}")

        # Save file
        file_path = DOCUMENTS_UPLOAD_FOLDER / safe_filename
        file.save(str(file_path))

        # Return relative path for storage in data.json
        relative_path = f"/uploads/documents/{safe_filename}"

        return jsonify({
            'success': True,
            'data': {
                'path': relative_path,
                'filename': safe_filename,
                'originalName': file.filename,
                'size': file.content_length or 0,
                'type': file.content_type or file.filename.rsplit('.', 1)[1].upper()
            }
        }), 201

    except Exception as e:
        print(f"Error in upload_document: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/uploads/<path:subpath>/<filename>')
def serve_upload(subpath, filename):
    """Serve uploaded files"""
    try:
        upload_dir = UPLOAD_FOLDER / subpath
        return send_from_directory(str(upload_dir), filename)
    except Exception as e:
        print(f"Error serving file: {e}")
        return jsonify({'success': False, 'error': 'File not found'}), 404

@app.route('/api/messages', methods=['GET'])
def get_messages():
    """Get all messages for AdminEstate Communication Center"""
    try:
        data = read_data()
        messages = data.get('messages', [])

        # Optional filter by tenant email
        tenant_email = request.args.get('tenantEmail')
        if tenant_email:
            messages = [m for m in messages if m.get('fromEmail') == tenant_email or m.get('toEmail') == tenant_email]

        # Sort by date/time, newest first
        sorted_messages = sorted(messages, key=lambda m: m.get('submittedAt', m.get('date', '')), reverse=True)

        return jsonify({
            'success': True,
            'data': sorted_messages,
            'count': len(sorted_messages)
        })
    except Exception as e:
        print(f"Error in get_messages: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/messages/send', methods=['POST'])
def send_message():
    """Send a general message (manager to tenant or tenant to manager)"""
    try:
        data = read_data()
        message_data = request.json

        # Create new message
        message_id = int(datetime.now().timestamp() * 1000)
        new_message = {
            'id': message_id,
            'from': message_data.get('from'),
            'fromEmail': message_data.get('fromEmail'),
            'to': message_data.get('to'),
            'toEmail': message_data.get('toEmail'),
            'property': message_data.get('property'),
            'unit': message_data.get('unit'),
            'subject': message_data.get('subject'),
            'message': message_data.get('message'),
            'date': datetime.now().strftime('%Y-%m-%d'),
            'time': datetime.now().strftime('%I:%M %p'),
            'read': False,
            'type': 'general_message',
            'replyTo': message_data.get('replyTo'),  # Optional: ID of message being replied to
            'sentAt': datetime.now().isoformat()
        }

        # Ensure messages array exists
        if 'messages' not in data:
            data['messages'] = []

        data['messages'].append(new_message)

        if write_data(data):
            return jsonify({
                'success': True,
                'data': new_message,
                'message': 'Message sent successfully'
            }), 201
        else:
            return jsonify({'success': False, 'error': 'Failed to send message'}), 500

    except Exception as e:
        print(f"Error in send_message: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/messages/<int:message_id>/read', methods=['POST'])
def mark_message_read(message_id):
    """Mark a message as read"""
    try:
        data = read_data()
        messages = data.get('messages', [])

        # Find and update message
        message = next((m for m in messages if m.get('id') == message_id), None)

        if not message:
            return jsonify({'success': False, 'error': 'Message not found'}), 404

        message['read'] = True

        if write_data(data):
            return jsonify({
                'success': True,
                'data': message
            })
        else:
            return jsonify({'success': False, 'error': 'Failed to update message'}), 500

    except Exception as e:
        print(f"Error in mark_message_read: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/tenant/maintenance', methods=['POST'])
def tenant_submit_maintenance():
    """Tenant submits a maintenance request - creates message with metadata for approval"""
    try:
        data = read_data()
        maintenance_request = request.json

        # Create a message with maintenance request metadata
        message_id = int(datetime.now().timestamp() * 1000)
        new_message = {
            'id': message_id,
            'from': maintenance_request.get('tenantName', 'Tenant'),
            'fromEmail': maintenance_request.get('tenantEmail', ''),
            'property': maintenance_request.get('property', 'Sunset Apartments'),
            'unit': maintenance_request.get('unit', 'A101'),
            'subject': f"Maintenance Request: {maintenance_request.get('title', 'Maintenance Issue')}",
            'message': maintenance_request.get('description', ''),
            'date': datetime.now().strftime('%Y-%m-%d'),
            'time': datetime.now().strftime('%I:%M %p'),
            'read': False,
            'type': 'maintenance_request',  # Special type for maintenance requests
            'status': 'pending_approval',  # Pending manager approval
            'maintenanceData': {
                'title': maintenance_request.get('title', 'Maintenance Issue'),
                'category': maintenance_request.get('category', 'other'),
                'priority': maintenance_request.get('priority', 'normal'),
                'location': maintenance_request.get('location', ''),
                'accessInstructions': maintenance_request.get('accessInstructions', ''),
                'preferredTime': maintenance_request.get('preferredTime', ''),
                'photos': maintenance_request.get('photos', [])
            },
            'workOrderId': None,  # Will be set when approved
            'submittedAt': datetime.now().isoformat()
        }

        # Ensure messages array exists
        if 'messages' not in data:
            data['messages'] = []

        data['messages'].append(new_message)

        if write_data(data):
            return jsonify({
                'success': True,
                'data': new_message,
                'message': 'Maintenance request submitted and sent to property manager for review'
            }), 201
        else:
            return jsonify({'success': False, 'error': 'Failed to save maintenance request'}), 500

    except Exception as e:
        print(f"Error in tenant_submit_maintenance: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/maintenance/approve/<int:message_id>', methods=['POST'])
def approve_maintenance_request(message_id):
    """Approve a maintenance request message and convert it to a work order"""
    try:
        data = read_data()
        messages = data.get('messages', [])

        # Find the maintenance request message
        message = next((msg for msg in messages if msg.get('id') == message_id and msg.get('type') == 'maintenance_request'), None)

        if not message:
            return jsonify({'success': False, 'error': 'Maintenance request not found'}), 404

        if message.get('status') == 'approved':
            return jsonify({'success': False, 'error': 'Request already approved'}), 400

        # Create work order from maintenance request
        maintenance_data = message.get('maintenanceData', {})
        work_order_id = int(datetime.now().timestamp() * 1000)

        new_work_order = {
            'id': work_order_id,
            'property': message.get('property', 'Sunset Apartments'),
            'tenant': message.get('from', 'Tenant'),
            'unit': message.get('unit', 'A101'),
            'issue': maintenance_data.get('title', 'Maintenance Issue'),
            'description': message.get('message', ''),
            'category': maintenance_data.get('category', 'other'),
            'priority': maintenance_data.get('priority', 'normal'),
            'status': 'Pending',
            'date': datetime.now().strftime('%Y-%m-%d'),
            'location': maintenance_data.get('location', ''),
            'accessInstructions': maintenance_data.get('accessInstructions', ''),
            'preferredTime': maintenance_data.get('preferredTime', ''),
            'photos': maintenance_data.get('photos', []),
            'source': 'tenant_portal',
            'messageId': message_id,  # Link back to original message
            'submittedAt': message.get('submittedAt'),
            'approvedAt': datetime.now().isoformat(),
            'updatedAt': datetime.now().isoformat()
        }

        # Ensure workOrders array exists
        if 'workOrders' not in data:
            data['workOrders'] = []

        data['workOrders'].append(new_work_order)

        # Update the message status and link to work order
        for msg in messages:
            if msg.get('id') == message_id:
                msg['status'] = 'approved'
                msg['workOrderId'] = work_order_id
                msg['approvedAt'] = datetime.now().isoformat()
                break

        # Create a reply message to notify the tenant
        approval_message = {
            'id': int(datetime.now().timestamp() * 1000) + 1,
            'from': 'Property Manager',
            'fromEmail': 'manager@adminestate.com',
            'to': message.get('from'),
            'property': message.get('property'),
            'unit': message.get('unit'),
            'subject': f"RE: {message.get('subject')}",
            'message': f"Your maintenance request has been approved and converted to Work Order #{work_order_id}. We will address this issue as soon as possible.",
            'date': datetime.now().strftime('%Y-%m-%d'),
            'time': datetime.now().strftime('%I:%M %p'),
            'read': False,
            'type': 'approval_notification',
            'workOrderId': work_order_id,
            'replyTo': message_id
        }

        messages.append(approval_message)
        data['messages'] = messages

        if write_data(data):
            return jsonify({
                'success': True,
                'data': {
                    'workOrder': new_work_order,
                    'message': approval_message
                },
                'message': 'Maintenance request approved and work order created'
            })
        else:
            return jsonify({'success': False, 'error': 'Failed to save data'}), 500

    except Exception as e:
        print(f"Error in approve_maintenance_request: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/tenant/maintenance', methods=['GET'])
def tenant_get_maintenance():
    """Get tenant's maintenance requests (both messages and work orders)"""
    try:
        data = read_data()
        messages = data.get('messages', [])
        work_orders = data.get('workOrders', [])

        # Get tenant ID from query params (in production, get from JWT token)
        tenant_id = request.args.get('tenantId')
        tenant_name = request.args.get('tenantName')
        unit = request.args.get('unit')

        # Filter maintenance request messages
        if tenant_name:
            tenant_messages = [msg for msg in messages if msg.get('from') == tenant_name and msg.get('type') == 'maintenance_request']
        elif unit:
            tenant_messages = [msg for msg in messages if msg.get('unit') == unit and msg.get('type') == 'maintenance_request']
        else:
            tenant_messages = [msg for msg in messages if msg.get('type') == 'maintenance_request']

        # For each message, get the linked work order if it exists
        results = []
        for msg in tenant_messages:
            item = {
                'id': msg.get('id'),
                'title': msg.get('maintenanceData', {}).get('title', 'Maintenance Request'),
                'description': msg.get('message'),
                'category': msg.get('maintenanceData', {}).get('category'),
                'priority': msg.get('maintenanceData', {}).get('priority'),
                'status': msg.get('status', 'pending_approval'),
                'submittedAt': msg.get('submittedAt'),
                'approvedAt': msg.get('approvedAt'),
                'workOrderId': msg.get('workOrderId'),
                'location': msg.get('maintenanceData', {}).get('location'),
                'photos': msg.get('maintenanceData', {}).get('photos', [])
            }

            # If approved, get work order details
            if msg.get('workOrderId'):
                work_order = next((wo for wo in work_orders if wo.get('id') == msg.get('workOrderId')), None)
                if work_order:
                    item['workOrderStatus'] = work_order.get('status')
                    item['workOrderDate'] = work_order.get('date')

            results.append(item)

        return jsonify({
            'success': True,
            'data': results,
            'count': len(results)
        })

    except Exception as e:
        print(f"Error in tenant_get_maintenance: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/tenant/maintenance/<int:request_id>', methods=['GET'])
def tenant_get_maintenance_detail(request_id):
    """Get specific maintenance request details"""
    try:
        data = read_data()
        work_orders = data.get('workOrders', [])

        work_order = next((wo for wo in work_orders if wo.get('id') == request_id), None)

        if not work_order:
            return jsonify({'success': False, 'error': 'Maintenance request not found'}), 404

        return jsonify({
            'success': True,
            'data': work_order
        })

    except Exception as e:
        print(f"Error in tenant_get_maintenance_detail: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500

if __name__ == '__main__':
    print("Starting Simplified Flask Backend")
    print(f"Reading from: {DATA_FILE}")
    print("No CSV files, no complex services, just simple JSON!")
    print("UI <-> localStorage <-> data.json <-> Flask")
    print("Pandas analytics enabled!")
    app.run(debug=False, port=5000, host='localhost')
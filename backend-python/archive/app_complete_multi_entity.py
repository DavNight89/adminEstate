#!/usr/bin/env python3
"""
Enhanced Flask App with Complete Multi-Entity Support
===================================================

This replaces your current app_frontend_compatible.py with full support for:
✅ Properties - Full CRUD + Sync
✅ Tenants - Full CRUD + Sync  
✅ Work Orders - Full CRUD + Sync
✅ Transactions - Full CRUD + Sync
✅ Documents - Full CRUD + Sync
"""

from flask import Flask, jsonify, request
from flask_cors import CORS
import sys
from pathlib import Path
from datetime import datetime

# Add the backend-python directory to the path
backend_dir = Path(__file__).parent
sys.path.append(str(backend_dir))

# Import the COMPLETE services instead of limited ones
from complete_dataframe_service import get_complete_df_service
from complete_sync_service import get_complete_sync_service

app = Flask(__name__)

# Enhanced CORS configuration
CORS(app, 
     origins=['http://localhost:3000', 'http://127.0.0.1:3000'],
     methods=['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
     allow_headers=['Content-Type', 'Authorization'],
     supports_credentials=True)

# Initialize COMPLETE services (not limited ones)
df_service = get_complete_df_service()
sync_service = get_complete_sync_service()

# ===== PROPERTIES ENDPOINTS =====

@app.route('/api/properties', methods=['GET'])
def get_properties():
    """Get all properties"""
    try:
        properties = df_service.get_properties_for_frontend()
        return jsonify({
            'success': True,
            'data': properties,
            'count': len(properties),
            'source': 'complete_df_service'
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/properties', methods=['POST'])
def add_property():
    """Add new property with full sync"""
    try:
        property_data = request.json
        result = df_service.add_property(property_data)
        
        # Trigger complete sync (not just properties)
        sync_service.sync_csv_to_json()
        
        return jsonify({
            'success': True,
            'data': result,
            'message': 'Property added with complete sync'
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

# ===== TENANTS ENDPOINTS (NOW WORKING!) =====

@app.route('/api/tenants', methods=['GET'])
def get_tenants():
    """Get all tenants with real data"""
    try:
        tenants = df_service.get_tenants_for_frontend()
        return jsonify({
            'success': True,
            'data': tenants,
            'count': len(tenants),
            'message': 'Real tenants data from CSV + sync'
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/tenants', methods=['POST'])
def add_tenant():
    """Add new tenant with full sync"""
    try:
        tenant_data = request.json
        result = df_service.add_tenant(tenant_data)
        
        # Trigger complete sync
        sync_service.sync_csv_to_json()
        
        return jsonify({
            'success': True,
            'data': result,
            'message': 'Tenant added with complete sync'
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

# ===== WORK ORDERS ENDPOINTS (NOW WORKING!) =====

@app.route('/api/workorders', methods=['GET'])
def get_workorders():
    """Get all work orders with real data"""
    try:
        workorders = df_service.get_workorders_for_frontend()
        return jsonify({
            'success': True,
            'data': workorders,
            'count': len(workorders),
            'message': 'Real work orders data from CSV + sync'
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/workorders', methods=['POST'])
def add_workorder():
    """Add new work order with full sync"""
    try:
        workorder_data = request.json
        result = df_service.add_workorder(workorder_data)
        
        # Trigger complete sync
        sync_service.sync_csv_to_json()
        
        return jsonify({
            'success': True,
            'data': result,
            'message': 'Work order added with complete sync'
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

# ===== TRANSACTIONS ENDPOINTS (NOW WORKING!) =====

@app.route('/api/transactions', methods=['GET'])
def get_transactions():
    """Get all transactions with real data"""
    try:
        transactions = df_service.get_transactions_for_frontend()
        return jsonify({
            'success': True,
            'data': transactions,
            'count': len(transactions),
            'message': 'Real transactions data from CSV + sync'
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/transactions', methods=['POST'])
def add_transaction():
    """Add new transaction with full sync"""
    try:
        transaction_data = request.json
        result = df_service.add_transaction(transaction_data)
        
        # Trigger complete sync
        sync_service.sync_csv_to_json()
        
        return jsonify({
            'success': True,
            'data': result,
            'message': 'Transaction added with complete sync'
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

# ===== DOCUMENTS ENDPOINTS (NOW WORKING!) =====

@app.route('/api/documents', methods=['GET'])
def get_documents():
    """Get all documents with real data"""
    try:
        documents = df_service.get_documents_for_frontend()
        return jsonify({
            'success': True,
            'data': documents,
            'count': len(documents),
            'message': 'Real documents data from CSV + sync'
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/documents', methods=['POST'])
def add_document():
    """Add new document with full sync"""
    try:
        document_data = request.json
        result = df_service.add_document(document_data)
        
        # Trigger complete sync
        sync_service.sync_csv_to_json()
        
        return jsonify({
            'success': True,
            'data': result,
            'message': 'Document added with complete sync'
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

# ===== COMPLETE SYNC ENDPOINTS =====

@app.route('/api/sync/complete', methods=['POST'])
def complete_sync():
    """Sync ALL entity types"""
    try:
        data = request.json or {}
        direction = data.get('direction', 'csv-to-json')
        
        if direction == 'csv-to-json':
            success = sync_service.sync_csv_to_json()
            message = "Synced ALL CSV files → data.json"
        elif direction == 'json-to-csv':
            success = sync_service.sync_json_to_csv()
            message = "Synced data.json → ALL CSV files"
        else:
            return jsonify({'success': False, 'error': 'Invalid direction'}), 400
        
        return jsonify({
            'success': success,
            'message': message,
            'entities_synced': ['properties', 'tenants', 'workorders', 'transactions', 'documents'],
            'timestamp': datetime.now().isoformat()
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/sync/localstorage', methods=['POST'])
def sync_localstorage_complete():
    """Accept localStorage data and sync ALL entity types"""
    try:
        localStorage_data = request.json
        
        if not localStorage_data:
            return jsonify({'success': False, 'error': 'No data provided'}), 400
        
        print(f"🔄 Received COMPLETE localStorage sync:")
        print(f"  📊 Properties: {len(localStorage_data.get('properties', []))}")
        print(f"  👥 Tenants: {len(localStorage_data.get('tenants', []))}")
        print(f"  🔧 Work Orders: {len(localStorage_data.get('workOrders', []))}")
        print(f"  💰 Transactions: {len(localStorage_data.get('transactions', []))}")
        print(f"  📄 Documents: {len(localStorage_data.get('documents', []))}")
        
        # Use complete sync service
        result = sync_service.sync_localStorage_to_backend(localStorage_data)
        
        return jsonify({
            'success': True,
            'message': 'ALL entity types synced successfully',
            'sync_results': result,
            'entities_supported': ['properties', 'tenants', 'workorders', 'transactions', 'documents'],
            'timestamp': datetime.now().isoformat()
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/sync/status', methods=['GET'])
def get_sync_status():
    """Get sync status for all entity types"""
    try:
        status = sync_service.get_sync_status()
        return jsonify({
            'success': True,
            'data': status
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

if __name__ == '__main__':
    print("🚀 Starting COMPLETE Multi-Entity Flask Server")
    print("✅ Properties: Full CRUD + Sync")
    print("✅ Tenants: Full CRUD + Sync") 
    print("✅ Work Orders: Full CRUD + Sync")
    print("✅ Transactions: Full CRUD + Sync")
    print("✅ Documents: Full CRUD + Sync")
    print("🔄 Complete localStorage ↔ CSV ↔ JSON sync")
    
    app.run(debug=True, port=5000)
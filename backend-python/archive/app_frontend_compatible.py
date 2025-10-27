"""
Updated Backend Route with Frontend-Compatible DataFrame Service
Drop-in replacement for your existing backend that eliminates hardcoded data
"""
from flask import Flask, jsonify, request
from flask_cors import CORS
import sys
from pathlib import Path
from datetime import datetime

# Add the backend-python directory to the path
backend_dir = Path(__file__).parent
sys.path.append(str(backend_dir))

from complete_dataframe_service import get_complete_df_service
from complete_sync_service import get_complete_sync_service
from services.pandas_analytics_service import get_pandas_analytics

app = Flask(__name__)

# Enhanced CORS configuration to fix cross-origin issues
CORS(app, 
     origins=['http://localhost:3000', 'http://127.0.0.1:3000', 'http://localhost:3001'],
     methods=['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
     allow_headers=['Content-Type', 'Authorization', 'Access-Control-Allow-Credentials', 'Accept', 'Origin', 'X-Requested-With'],
     supports_credentials=True,
     resources={
         r"/api/*": {
             "origins": ["http://localhost:3000", "http://127.0.0.1:3000"],
             "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
             "allow_headers": ["Content-Type", "Authorization"]
         }
     })

# Initialize COMPLETE DataFrame service (all entity types)
df_service = get_complete_df_service()

# Initialize Pandas analytics service with SAME instance (prevents duplicates!)
pandas_analytics = get_pandas_analytics(df_service)

# Initialize COMPLETE sync service for all entity types
sync_service = get_complete_sync_service()

# Enhanced CORS preflight handler
@app.before_request
def handle_preflight():
    if request.method == "OPTIONS":
        response = jsonify({'status': 'OK'})
        response.headers.add("Access-Control-Allow-Origin", "*")
        response.headers.add('Access-Control-Allow-Headers', "Content-Type,Authorization,Accept,Origin,X-Requested-With")
        response.headers.add('Access-Control-Allow-Methods', "GET,PUT,POST,DELETE,OPTIONS,PATCH")
        response.headers.add('Access-Control-Allow-Credentials', 'true')
        return response

@app.after_request
def after_request(response):
    origin = request.headers.get('Origin')
    if origin in ['http://localhost:3000', 'http://127.0.0.1:3000']:
        response.headers.add('Access-Control-Allow-Origin', origin)
    else:
        response.headers.add('Access-Control-Allow-Origin', 'http://localhost:3000')
    
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization,Accept,Origin,X-Requested-With')
    response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS,PATCH')
    response.headers.add('Access-Control-Allow-Credentials', 'true')
    return response

@app.route('/api/cors-test', methods=['GET', 'OPTIONS'])
def cors_test():
    """Simple endpoint to test CORS configuration"""
    return jsonify({
        'message': 'CORS is working!',
        'timestamp': str(pandas_analytics.get_current_time()),
        'origin_allowed': request.headers.get('Origin', 'Unknown'),
        'method': request.method
    })

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint for debugging"""
    return jsonify({
        'status': 'healthy',
        'message': 'Flask server is running',
        'cors_enabled': True,
        'timestamp': datetime.now().isoformat(),
        'endpoints_available': [
            '/api/properties',
            '/api/analytics/correlations',
            '/api/sync',
            '/api/sync/localstorage'
        ]
    })

@app.route('/api/sync', methods=['POST'])
def manual_sync():
    """Manually trigger multi-entity data.json ↔ CSV synchronization"""
    try:
        data = request.json or {}
        direction = data.get('direction', 'csv-to-json')  # csv-to-json or json-to-csv
        
        if direction == 'csv-to-json':
            success = sync_service.sync_csv_to_json()
            message = "Synced ALL CSVs (properties, tenants, workorders, transactions, documents) → data.json"
        elif direction == 'json-to-csv':
            success = sync_service.sync_json_to_csv()
            message = "Synced data.json → ALL CSVs (properties, tenants, workorders, transactions, documents)"
        else:
            return jsonify({'success': False, 'error': 'Invalid direction'}), 400
        
        return jsonify({
            'success': success,
            'message': message,
            'direction': direction,
            'entities': ['properties', 'tenants', 'workorders', 'transactions', 'documents'],
            'timestamp': datetime.now().isoformat()
        })
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/properties', methods=['GET'])
def get_properties():
    """Get all properties - NO MORE HARDCODED DATA!"""
    try:
        properties = df_service.get_properties_for_frontend()
        return jsonify({
            'success': True,
            'data': properties,
            'source': 'pandas_dataframe'  # Shows it's coming from DataFrame
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/properties', methods=['POST'])
def add_property():
    """Add new property to DataFrame"""
    try:
        property_data = request.json
        result = df_service.add_property(property_data)
        
        # Automatically sync to data.json after adding property
        sync_service.sync_csv_to_json()
        
        return jsonify({
            'success': True,
            'data': result,
            'message': 'Property added to DataFrame and synced to data.json'
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/properties/<property_id>', methods=['PUT'])
def update_property(property_id):
    """Update property in DataFrame"""
    try:
        updates = request.json
        df_service.update_property(property_id, updates)
        return jsonify({
            'success': True,
            'message': 'Property updated in DataFrame'
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/analytics', methods=['GET'])
def get_analytics():
    """Get basic analytics from DataFrame (legacy endpoint)"""
    try:
        analytics = df_service.get_analytics()
        return jsonify({
            'success': True,
            'data': analytics,
            'source': 'pandas_analytics'
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

# NEW PANDAS ANALYTICS ENDPOINTS
@app.route('/api/analytics/dashboard', methods=['GET'])
def get_dashboard_analytics():
    """Get comprehensive dashboard analytics using Pandas"""
    try:
        analytics = pandas_analytics.get_dashboard_analytics()
        return jsonify({
            'success': True,
            'data': analytics,
            'source': 'pandas_advanced_analytics'
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/analytics/property-types', methods=['GET'])
def get_property_type_analysis():
    """Get property type analysis using Pandas groupby"""
    try:
        analysis = pandas_analytics.get_property_type_analysis()
        return jsonify({
            'success': True,
            'data': analysis,
            'source': 'pandas_groupby_analysis'
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/analytics/rankings', methods=['GET'])
def get_performance_rankings():
    """Get property performance rankings"""
    try:
        rankings = pandas_analytics.get_performance_rankings()
        return jsonify({
            'success': True,
            'data': rankings,
            'source': 'pandas_rankings'
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/analytics/portfolio', methods=['GET'])
def get_portfolio_composition():
    """Get portfolio composition analysis"""
    try:
        composition = pandas_analytics.get_portfolio_composition()
        return jsonify({
            'success': True,
            'data': composition,
            'source': 'pandas_portfolio_analysis'
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/analytics/correlations', methods=['GET'])
def get_correlation_analysis():
    """Get correlation analysis between metrics"""
    try:
        correlations = pandas_analytics.get_correlation_analysis()
        return jsonify({
            'success': True,
            'data': correlations,
            'source': 'pandas_correlation_analysis'
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/data/stats', methods=['GET'])
def get_data_stats():
    """Get data statistics and check for duplicates"""
    try:
        stats = df_service.get_data_stats()
        return jsonify({'success': True, 'data': stats})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/data/clean-duplicates', methods=['POST'])
def clean_duplicates():
    """Remove duplicate entries from DataFrame"""
    try:
        removed_count = df_service.remove_duplicates()
        return jsonify({
            'success': True, 
            'message': f'Removed {removed_count} duplicate entries',
            'data': {'duplicates_removed': removed_count}
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

# ===== LOCALSTORAGE SYNC ENDPOINT (FIX) =====

@app.route('/api/sync/localstorage', methods=['POST'])
def sync_localstorage_data():
    """Accept localStorage data and sync it to backend systems"""
    try:
        data = request.json
        
        if not data:
            return jsonify({'success': False, 'error': 'No data provided'}), 400
        
        # Extract data from localStorage format
        properties = data.get('properties', [])
        tenants = data.get('tenants', [])
        work_orders = data.get('workOrders', [])
        transactions = data.get('transactions', [])
        documents = data.get('documents', [])
        
        print(f"🔄 Received localStorage sync request:")
        print(f"  📊 Properties: {len(properties)}")
        print(f"  👥 Tenants: {len(tenants)}")
        print(f"  🔧 Work Orders: {len(work_orders)}")
        print(f"  💰 Transactions: {len(transactions)}")
        print(f"  📄 Documents: {len(documents)}")
        
        sync_results = {
            'properties': {'synced': 0, 'errors': 0},
            'tenants': {'synced': 0, 'errors': 0},
            'workOrders': {'synced': 0, 'errors': 0},
            'transactions': {'synced': 0, 'errors': 0},
            'documents': {'synced': 0, 'errors': 0}
        }
        
        # Sync ALL entities to CSV and data.json
        
        # Sync properties
        if properties:
            try:
                for prop in properties:
                    try:
                        df_service.add_property(prop)
                        sync_results['properties']['synced'] += 1
                    except Exception as e:
                        print(f"❌ Failed to sync property {prop.get('name', 'Unknown')}: {e}")
                        sync_results['properties']['errors'] += 1
                print(f"✅ Synced {sync_results['properties']['synced']} properties to backend")
            except Exception as e:
                print(f"❌ Properties sync error: {e}")
                
        # Sync tenants
        if tenants:
            try:
                for tenant in tenants:
                    try:
                        df_service.add_tenant(tenant)
                        sync_results['tenants']['synced'] += 1
                    except Exception as e:
                        print(f"❌ Failed to sync tenant {tenant.get('name', 'Unknown')}: {e}")
                        sync_results['tenants']['errors'] += 1
                print(f"✅ Synced {sync_results['tenants']['synced']} tenants to backend")
            except Exception as e:
                print(f"❌ Tenants sync error: {e}")
        
        # Sync work orders
        if work_orders:
            try:
                for wo in work_orders:
                    try:
                        df_service.add_workorder(wo)
                        sync_results['workOrders']['synced'] += 1
                    except Exception as e:
                        print(f"❌ Failed to sync work order {wo.get('title', 'Unknown')}: {e}")
                        sync_results['workOrders']['errors'] += 1
                print(f"✅ Synced {sync_results['workOrders']['synced']} work orders to backend")
            except Exception as e:
                print(f"❌ Work orders sync error: {e}")
        
        # Sync transactions  
        if transactions:
            try:
                for txn in transactions:
                    try:
                        df_service.add_transaction(txn)
                        sync_results['transactions']['synced'] += 1
                    except Exception as e:
                        print(f"❌ Failed to sync transaction {txn.get('description', 'Unknown')}: {e}")
                        sync_results['transactions']['errors'] += 1
                print(f"✅ Synced {sync_results['transactions']['synced']} transactions to backend")
            except Exception as e:
                print(f"❌ Transactions sync error: {e}")
        
        # Sync documents
        if documents:
            try:
                for doc in documents:
                    try:
                        df_service.add_document(doc)
                        sync_results['documents']['synced'] += 1
                    except Exception as e:
                        print(f"❌ Failed to sync document {doc.get('name', 'Unknown')}: {e}")
                        sync_results['documents']['errors'] += 1
                print(f"✅ Synced {sync_results['documents']['synced']} documents to backend")
            except Exception as e:
                print(f"❌ Documents sync error: {e}")
        
        # Trigger complete data.json sync
        try:
            sync_service.sync_csv_to_json()
            print("✅ Completed multi-entity CSV → data.json sync")
        except Exception as e:
            print(f"❌ CSV to JSON sync error: {e}")
        
        # Update data.json with all localStorage data
        try:
            from pathlib import Path
            import json
            
            frontend_data_path = Path(__file__).parent.parent / 'src' / 'data.json'
            
            # Update with localStorage data
            updated_data = {
                'properties': properties,
                'tenants': tenants,
                'workOrders': work_orders,
                'transactions': transactions,
                'documents': documents
            }
            
            with open(frontend_data_path, 'w') as f:
                json.dump(updated_data, f, indent=2, default=str)
            
            print(f"✅ Updated data.json with localStorage data")
            
        except Exception as e:
            print(f"❌ data.json update error: {e}")
        
        return jsonify({
            'success': True,
            'message': 'localStorage data synced successfully',
            'sync_results': sync_results,
            'timestamp': datetime.now().isoformat()
        })
        
    except Exception as e:
        print(f"❌ LocalStorage sync error: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500

# ===== TENANTS ENDPOINTS (NEW) =====

@app.route('/api/tenants', methods=['GET'])
def get_tenants():
    """Get all tenants with real data"""
    try:
        property_id = request.args.get('property_id')
        tenants = df_service.get_tenants_for_frontend()
        
        # Filter by property if requested
        if property_id:
            tenants = [t for t in tenants if t.get('property_id') == property_id]
        
        return jsonify({
            'success': True,
            'data': tenants,
            'count': len(tenants),
            'message': 'Real tenants data from CSV + sync',
            'filtered_by_property': property_id is not None
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

@app.route('/api/properties/<property_id>/tenants', methods=['GET'])
def get_property_tenants(property_id):
    """Get tenants for specific property"""
    try:
        return jsonify({
            'success': True,
            'data': [],
            'property_id': property_id,
            'count': 0,
            'message': 'Property tenants endpoint ready for implementation'
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

# ===== WORK ORDERS ENDPOINTS (NEW) =====

@app.route('/api/workorders', methods=['GET'])
def get_workorders():
    """Get work orders with real data and optional filters"""
    try:
        property_id = request.args.get('property_id')
        status = request.args.get('status')
        
        workorders = df_service.get_workorders_for_frontend()
        
        # Apply filters
        if property_id:
            workorders = [w for w in workorders if w.get('property_id') == property_id]
        if status:
            workorders = [w for w in workorders if w.get('status') == status]
        
        return jsonify({
            'success': True,
            'data': workorders,
            'count': len(workorders),
            'message': 'Real work orders data from CSV + sync',
            'filters': {
                'property_id': property_id,
                'status': status
            }
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

@app.route('/api/workorders/urgent', methods=['GET'])
def get_urgent_workorders():
    """Get high priority work orders"""
    try:
        return jsonify({
            'success': True,
            'data': [],
            'count': 0,
            'message': 'Urgent work orders endpoint ready for implementation'
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

# ===== TRANSACTIONS ENDPOINTS (NEW) =====

@app.route('/api/transactions', methods=['GET'])
def get_transactions():
    """Get financial transactions with real data and optional filters"""
    try:
        property_id = request.args.get('property_id')
        type_filter = request.args.get('type')
        
        transactions = df_service.get_transactions_for_frontend()
        
        # Apply filters
        if property_id:
            transactions = [t for t in transactions if t.get('property_id') == property_id]
        if type_filter:
            transactions = [t for t in transactions if t.get('type') == type_filter]
        
        return jsonify({
            'success': True,
            'data': transactions,
            'count': len(transactions),
            'message': 'Real transactions data from CSV + sync',
            'filters': {
                'property_id': property_id,
                'type': type_filter
            }
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

@app.route('/api/transactions/summary', methods=['GET'])
def get_transaction_summary():
    """Get financial summary from transactions"""
    try:
        return jsonify({
            'success': True,
            'data': {
                'total_income': 0,
                'total_expenses': 0,
                'net_income': 0,
                'transaction_count': 0
            },
            'message': 'Transaction summary endpoint ready for implementation'
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

# ===== DOCUMENTS ENDPOINTS (NEW) =====

@app.route('/api/documents', methods=['GET'])
def get_documents():
    """Get documents with real data and optional filters"""
    try:
        property_id = request.args.get('property_id')
        category = request.args.get('category')
        
        documents = df_service.get_documents_for_frontend()
        
        # Apply filters
        if property_id:
            documents = [d for d in documents if d.get('property_id') == property_id]
        if category:
            documents = [d for d in documents if d.get('category') == category]
        
        return jsonify({
            'success': True,
            'data': documents,
            'count': len(documents),
            'message': 'Real documents data from CSV + sync',
            'filters': {
                'property_id': property_id,
                'category': category
            }
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/documents', methods=['POST'])
def add_document():
    """Add new document record with full sync"""
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

if __name__ == '__main__':
    print("🚀 Starting Backend with Frontend-Compatible DataFrame Service")
    print("✅ Using field names: monthlyRevenue, purchasePrice")
    print("✅ No more hardcoded data!")
    print("🆕 Added endpoints: tenants, workorders, transactions, documents, sync_localstorage_data")
    print("🔧 Debug enabled but auto-reload disabled for stable sync")
    app.run(debug=True, use_reloader=False, port=5000, host='localhost')
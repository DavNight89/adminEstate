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

from test_frontend_compatibility import FrontendCompatibleDataFrameService
from services.pandas_analytics_service import get_pandas_analytics
from continuous_sync import ContinuousDataSync

app = Flask(__name__)
# Enable CORS for React frontend with comprehensive settings
CORS(app, 
     origins=['http://localhost:3000', 'http://127.0.0.1:3000'],
     methods=['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
     allow_headers=['Content-Type', 'Authorization', 'Access-Control-Allow-Credentials'],
     supports_credentials=True)

# Initialize DataFrame service with frontend-compatible schema
df_service = FrontendCompatibleDataFrameService()

# Initialize Pandas analytics service with SAME instance (prevents duplicates!)
pandas_analytics = get_pandas_analytics(df_service)

# Initialize sync service for automatic data.json ↔ CSV sync
sync_service = ContinuousDataSync()

# Add explicit CORS preflight handler
@app.before_request
def handle_preflight():
    if request.method == "OPTIONS":
        response = jsonify({'status': 'OK'})
        response.headers.add("Access-Control-Allow-Origin", "http://localhost:3000")
        response.headers.add('Access-Control-Allow-Headers', "Content-Type,Authorization")
        response.headers.add('Access-Control-Allow-Methods', "GET,PUT,POST,DELETE,OPTIONS")
        return response

@app.after_request
def after_request(response):
    response.headers.add('Access-Control-Allow-Origin', 'http://localhost:3000')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
    response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
    return response

@app.route('/api/cors-test', methods=['GET'])
def cors_test():
    """Simple endpoint to test CORS configuration"""
    return jsonify({
        'message': 'CORS is working!',
        'timestamp': str(pandas_analytics.get_current_time()),
        'origin_allowed': 'http://localhost:3000'
    })

@app.route('/api/sync', methods=['POST'])
def manual_sync():
    """Manually trigger data.json ↔ CSV synchronization"""
    try:
        data = request.json or {}
        direction = data.get('direction', 'csv-to-json')  # csv-to-json or json-to-csv
        
        if direction == 'csv-to-json':
            success = sync_service.sync_csv_to_json()
            message = "Synced properties.csv → data.json"
        elif direction == 'json-to-csv':
            success = sync_service.sync_json_to_csv()
            message = "Synced data.json → properties.csv"
        else:
            return jsonify({'success': False, 'error': 'Invalid direction'}), 400
        
        return jsonify({
            'success': success,
            'message': message,
            'direction': direction,
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

if __name__ == '__main__':
    print("🚀 Starting Backend with Frontend-Compatible DataFrame Service")
    print("✅ Using field names: monthlyRevenue, purchasePrice")
    print("✅ No more hardcoded data!")
    app.run(debug=True, port=5000)
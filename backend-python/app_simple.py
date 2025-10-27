"""
Simplified Flask Backend - Reads directly from data.json
No complex services, no CSV files, no sync issues!
"""
from flask import Flask, jsonify, request
from flask_cors import CORS
import json
from pathlib import Path
from datetime import datetime
import pandas as pd
import numpy as np

app = Flask(__name__)

# Simple CORS configuration
CORS(app, 
     origins=['http://localhost:3000', 'http://127.0.0.1:3000'],
     methods=['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
     allow_headers=['Content-Type', 'Authorization'])

# Path to data.json
DATA_FILE = Path(__file__).parent.parent / 'src' / 'data.json'

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
            'documents': []
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
    return jsonify({
        'status': 'healthy',
        'message': 'Simplified Flask server reading from data.json',
        'timestamp': datetime.now().isoformat()
    })

# ===== PROPERTIES ENDPOINTS =====
@app.route('/api/properties', methods=['GET'])
def get_properties():
    data = read_data()
    return jsonify({
        'success': True,
        'data': data.get('properties', []),
        'source': 'data.json'
    })

@app.route('/api/properties', methods=['POST'])
def add_property():
    try:
        data = read_data()
        new_property = request.json
        
        # Add timestamp if not present
        if 'created_at' not in new_property:
            new_property['created_at'] = datetime.now().isoformat()
        new_property['updated_at'] = datetime.now().isoformat()
        
        data['properties'].append(new_property)
        
        if write_data(data):
            return jsonify({
                'success': True,
                'data': new_property,
                'message': 'Property added to data.json'
            })
        else:
            return jsonify({'success': False, 'error': 'Failed to write data'}), 500
            
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

# ===== TENANTS ENDPOINTS =====
@app.route('/api/tenants', methods=['GET'])
def get_tenants():
    data = read_data()
    return jsonify({
        'success': True,
        'data': data.get('tenants', []),
        'source': 'data.json'
    })

@app.route('/api/tenants', methods=['POST'])
def add_tenant():
    try:
        data = read_data()
        new_tenant = request.json
        
        if 'created_at' not in new_tenant:
            new_tenant['created_at'] = datetime.now().isoformat()
        new_tenant['updated_at'] = datetime.now().isoformat()
        
        data['tenants'].append(new_tenant)
        
        if write_data(data):
            return jsonify({
                'success': True,
                'data': new_tenant,
                'message': 'Tenant added to data.json'
            })
        else:
            return jsonify({'success': False, 'error': 'Failed to write data'}), 500
            
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

# ===== WORK ORDERS ENDPOINTS =====
@app.route('/api/workorders', methods=['GET'])
def get_workorders():
    data = read_data()
    return jsonify({
        'success': True,
        'data': data.get('workOrders', []),
        'source': 'data.json'
    })

@app.route('/api/workorders', methods=['POST'])
def add_workorder():
    try:
        data = read_data()
        new_workorder = request.json
        
        if 'created_at' not in new_workorder:
            new_workorder['created_at'] = datetime.now().isoformat()
        new_workorder['updated_at'] = datetime.now().isoformat()
        
        data['workOrders'].append(new_workorder)
        
        if write_data(data):
            return jsonify({
                'success': True,
                'data': new_workorder,
                'message': 'Work order added to data.json'
            })
        else:
            return jsonify({'success': False, 'error': 'Failed to write data'}), 500
            
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

# ===== TRANSACTIONS ENDPOINTS =====
@app.route('/api/transactions', methods=['GET'])
def get_transactions():
    data = read_data()
    return jsonify({
        'success': True,
        'data': data.get('transactions', []),
        'source': 'data.json'
    })

@app.route('/api/transactions', methods=['POST'])
def add_transaction():
    try:
        data = read_data()
        new_transaction = request.json
        
        if 'created_at' not in new_transaction:
            new_transaction['created_at'] = datetime.now().isoformat()
        new_transaction['updated_at'] = datetime.now().isoformat()
        
        data['transactions'].append(new_transaction)
        
        if write_data(data):
            return jsonify({
                'success': True,
                'data': new_transaction,
                'message': 'Transaction added to data.json'
            })
        else:
            return jsonify({'success': False, 'error': 'Failed to write data'}), 500
            
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

# ===== DOCUMENTS ENDPOINTS =====
@app.route('/api/documents', methods=['GET'])
def get_documents():
    data = read_data()
    return jsonify({
        'success': True,
        'data': data.get('documents', []),
        'source': 'data.json'
    })

@app.route('/api/documents', methods=['POST'])
def add_document():
    try:
        data = read_data()
        new_document = request.json
        
        if 'created_at' not in new_document:
            new_document['created_at'] = datetime.now().isoformat()
        new_document['updated_at'] = datetime.now().isoformat()
        
        data['documents'].append(new_document)
        
        if write_data(data):
            return jsonify({
                'success': True,
                'data': new_document,
                'message': 'Document added to data.json'
            })
        else:
            return jsonify({'success': False, 'error': 'Failed to write data'}), 500
            
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

# ===== SYNC ENDPOINT (Simple passthrough) =====
@app.route('/api/sync/localstorage', methods=['POST'])
def sync_localstorage():
    """Accept localStorage data and write directly to data.json"""
    try:
        localStorage_data = request.json
        
        if write_data(localStorage_data):
            return jsonify({
                'success': True,
                'message': 'Data synced to data.json successfully',
                'timestamp': datetime.now().isoformat()
            })
        else:
            return jsonify({'success': False, 'error': 'Failed to write data'}), 500
            
    except Exception as e:
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
        correlation_matrix = df[numeric_cols].corr().to_dict()

        return jsonify({'success': True, 'data': correlation_matrix})
    except Exception as e:
        print(f"Error in analytics_correlations: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500

if __name__ == '__main__':
    print("🚀 Starting Simplified Flask Backend")
    print(f"📄 Reading from: {DATA_FILE}")
    print("✅ No CSV files, no complex services, just simple JSON!")
    print("🔄 UI ↔ localStorage ↔ data.json ↔ Flask")
    print("🐼 Pandas analytics enabled!")
    app.run(debug=False, port=5000, host='localhost')
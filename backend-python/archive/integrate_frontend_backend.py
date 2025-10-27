#!/usr/bin/env python3
"""
Frontend-Backend Integration Manager
===================================

This script solves the mismatch between React UI data (data.json) and Flask backend data.

Issues:
- React UI reads from empty data.json (empty arrays)  
- Flask backend has property data in dataframe_data/
- No synchronization between them

Solutions:
1. Migrate data.json properties to Flask backend
2. Test API connection 
3. Verify data consistency
4. Guide frontend integration
"""

import json
import os
import sys
import pandas as pd
from datetime import datetime
import requests
import uuid

class FrontendBackendIntegrator:
    def __init__(self):
        self.backend_dir = os.path.dirname(os.path.abspath(__file__))
        self.frontend_dir = os.path.join(os.path.dirname(self.backend_dir), 'src')
        self.data_json_path = os.path.join(self.frontend_dir, 'data.json')
        self.flask_csv_path = os.path.join(self.backend_dir, 'dataframe_data', 'properties.csv')
        self.flask_api_url = 'http://localhost:5000/api/properties'
        
    def print_status(self):
        """Display current status of data sources"""
        print("🔍 FRONTEND-BACKEND DATA ANALYSIS")
        print("=" * 50)
        
        # Check data.json
        if os.path.exists(self.data_json_path):
            with open(self.data_json_path, 'r') as f:
                frontend_data = json.load(f)
            print(f"📱 Frontend data.json: {len(frontend_data.get('properties', []))} properties")
            if frontend_data.get('properties'):
                for i, prop in enumerate(frontend_data['properties'][:3]):
                    print(f"   {i+1}. {prop.get('name', 'Unnamed')} - {prop.get('address', 'No address')}")
                if len(frontend_data['properties']) > 3:
                    print(f"   ... and {len(frontend_data['properties']) - 3} more")
        else:
            print("📱 Frontend data.json: NOT FOUND")
            
        # Check Flask CSV
        if os.path.exists(self.flask_csv_path):
            df = pd.read_csv(self.flask_csv_path)
            print(f"🏠 Flask backend CSV: {len(df)} properties")
            if len(df) > 0:
                for i, row in df.head(3).iterrows():
                    print(f"   {i+1}. {row.get('name', 'Unnamed')} - {row.get('address', 'No address')}")
                if len(df) > 3:
                    print(f"   ... and {len(df) - 3} more")
        else:
            print("🏠 Flask backend CSV: NOT FOUND")
            
        # Test API connection
        try:
            response = requests.get(self.flask_api_url, timeout=5)
            if response.status_code == 200:
                api_data = response.json()
                api_properties = api_data.get('data', [])
                print(f"🌐 Flask API live: {len(api_properties)} properties accessible")
            else:
                print(f"🌐 Flask API: Error {response.status_code}")
        except Exception as e:
            print(f"🌐 Flask API: OFFLINE ({str(e)[:50]}...)")
            
        print()

    def migrate_data_json_to_flask(self):
        """Migrate properties from data.json to Flask backend"""
        print("🚀 MIGRATING DATA.JSON TO FLASK BACKEND")
        print("=" * 50)
        
        if not os.path.exists(self.data_json_path):
            print("❌ data.json not found - nothing to migrate")
            return
            
        with open(self.data_json_path, 'r') as f:
            frontend_data = json.load(f)
            
        properties = frontend_data.get('properties', [])
        if not properties:
            print("📝 data.json is empty - nothing to migrate")
            return
            
        print(f"📤 Found {len(properties)} properties to migrate...")
        
        migrated = 0
        errors = 0
        
        for prop in properties:
            try:
                # Convert frontend property to Flask schema
                flask_property = self.convert_to_flask_schema(prop)
                
                # Send to Flask API
                response = requests.post(self.flask_api_url, json=flask_property, timeout=10)
                if response.status_code in [200, 201]:
                    print(f"   ✅ Migrated: {prop.get('name', 'Unnamed')}")
                    migrated += 1
                else:
                    print(f"   ❌ Failed: {prop.get('name', 'Unnamed')} (Status: {response.status_code})")
                    errors += 1
                    
            except Exception as e:
                print(f"   ❌ Error: {prop.get('name', 'Unnamed')} ({str(e)})")
                errors += 1
                
        print(f"\n📊 Migration Summary: {migrated} success, {errors} errors")
        
    def convert_to_flask_schema(self, frontend_prop):
        """Convert frontend property format to Flask backend schema"""
        return {
            'name': frontend_prop.get('name', ''),
            'address': frontend_prop.get('address', ''),
            'type': frontend_prop.get('type', 'residential'), 
            'units': int(frontend_prop.get('units', 0)),
            'occupied': int(frontend_prop.get('occupied', 0)),
            'monthlyRevenue': float(frontend_prop.get('monthlyRevenue', 0)),
            'purchasePrice': float(frontend_prop.get('purchasePrice', 0))
        }
        
    def sync_flask_to_data_json(self):
        """Sync Flask backend data to data.json (for testing)"""
        print("🔄 SYNCING FLASK BACKEND TO DATA.JSON")
        print("=" * 50)
        
        try:
            response = requests.get(self.flask_api_url, timeout=10)
            if response.status_code != 200:
                print(f"❌ Flask API error: {response.status_code}")
                return
                
            api_data = response.json()
            properties = api_data.get('data', [])
            
            # Update data.json
            if os.path.exists(self.data_json_path):
                with open(self.data_json_path, 'r') as f:
                    data = json.load(f)
            else:
                data = {"properties": [], "tenants": [], "workOrders": []}
                
            data['properties'] = properties
            
            with open(self.data_json_path, 'w') as f:
                json.dump(data, f, indent=2)
                
            print(f"✅ Synced {len(properties)} properties to data.json")
            
        except Exception as e:
            print(f"❌ Sync error: {e}")
            
    def test_api_connection(self):
        """Test all API endpoints"""
        print("🧪 TESTING API CONNECTION")
        print("=" * 50)
        
        endpoints = [
            ('GET Properties', 'GET', '/api/properties'),
            ('Analytics', 'GET', '/api/analytics'),
        ]
        
        for name, method, endpoint in endpoints:
            try:
                url = f"http://localhost:5000{endpoint}"
                response = requests.get(url, timeout=5)
                if response.status_code == 200:
                    print(f"   ✅ {name}: Working ({len(str(response.text))} bytes)")
                else:
                    print(f"   ❌ {name}: Error {response.status_code}")
            except Exception as e:
                print(f"   ❌ {name}: {str(e)[:50]}...")
                
    def create_test_property(self):
        """Add a test property to verify integration"""
        print("🧪 CREATING TEST PROPERTY")
        print("=" * 50)
        
        test_property = {
            'name': 'Integration Test Property',
            'address': '123 Integration Ave',
            'type': 'residential',
            'units': 10,
            'occupied': 8,
            'monthlyRevenue': 8000.0,
            'purchasePrice': 500000.0
        }
        
        try:
            response = requests.post(self.flask_api_url, json=test_property, timeout=10)
            if response.status_code in [200, 201]:
                result = response.json()
                print("✅ Test property created successfully!")
                print(f"   ID: {result.get('id', 'Unknown')}")
                print(f"   Name: {result.get('name')}")
                print(f"   Address: {result.get('address')}")
                return result
            else:
                print(f"❌ Failed to create test property: {response.status_code}")
                print(f"   Response: {response.text}")
                
        except Exception as e:
            print(f"❌ Error creating test property: {e}")
            
        return None
        
    def generate_frontend_integration_guide(self):
        """Generate steps for React frontend integration"""
        print("📋 FRONTEND INTEGRATION GUIDE")
        print("=" * 50)
        print("""
To complete the integration:

1. 🔧 VERIFY API CONNECTION:
   Your React app is already configured to use Flask backend!
   API Service points to: http://localhost:5000
   
2. 🧪 TEST IN BROWSER:
   - Open React app: http://localhost:3000
   - Open DevTools → Network tab  
   - Check if API calls to localhost:5000 are happening
   
3. 🔍 DEBUG ISSUES:
   If you see empty data:
   - Check browser console for CORS errors
   - Verify Flask server is running: netstat -ano | findstr :5000
   - Test API directly: http://localhost:5000/api/properties
   
4. 🔄 FORCE REFRESH:
   - Clear browser localStorage: localStorage.clear()
   - Refresh React app
   - Data should load from Flask backend
   
5. 📊 VERIFY DATA FLOW:
   - Add property in React UI
   - Check Flask API: curl http://localhost:5000/api/properties
   - Property should appear in both places

Your integration setup is correct! The issue might be:
- Browser cache
- localStorage overriding API data
- Network connectivity between React and Flask
""")

    def run_full_integration(self):
        """Run complete integration process"""
        print("🚀 FRONTEND-BACKEND INTEGRATION MANAGER")
        print("=" * 60)
        print("Solving React UI ↔ Flask backend data mismatch...")
        print()
        
        # 1. Analyze current state
        self.print_status()
        
        # 2. Test API connection
        self.test_api_connection()
        print()
        
        # 3. Migrate data.json to Flask (if needed)
        self.migrate_data_json_to_flask()
        print()
        
        # 4. Create test property
        self.create_test_property()
        print()
        
        # 5. Show integration status
        self.print_status()
        
        # 6. Generate integration guide
        self.generate_frontend_integration_guide()

if __name__ == '__main__':
    integrator = FrontendBackendIntegrator()
    
    if len(sys.argv) > 1:
        command = sys.argv[1]
        if command == 'status':
            integrator.print_status()
        elif command == 'migrate':
            integrator.migrate_data_json_to_flask()
        elif command == 'sync':
            integrator.sync_flask_to_data_json()
        elif command == 'test':
            integrator.test_api_connection()
        elif command == 'guide':
            integrator.generate_frontend_integration_guide()
        else:
            print("Usage: python integrate_frontend_backend.py [status|migrate|sync|test|guide]")
    else:
        integrator.run_full_integration()
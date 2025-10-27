#!/usr/bin/env python3
"""
Debug LocalStorage ↔ Data.json ↔ Flask Sync Issue
================================================

This script diagnoses sync problems between:
1. React localStorage
2. data.json file 
3. Flask backend CSV
"""

import json
import pandas as pd
import requests
from pathlib import Path
from datetime import datetime

class SyncDebugger:
    def __init__(self):
        self.backend_dir = Path(__file__).parent / 'backend-python'
        self.frontend_dir = Path(__file__).parent / 'src'
        
        self.data_json_path = self.frontend_dir / 'data.json'
        self.properties_csv_path = self.backend_dir / 'dataframe_data' / 'properties.csv'
        self.flask_url = 'http://localhost:5000'
        
    def check_data_json(self):
        """Check data.json content"""
        print("📄 CHECKING DATA.JSON")
        print("=" * 50)
        
        if not self.data_json_path.exists():
            print("❌ data.json NOT FOUND!")
            return None
            
        try:
            with open(self.data_json_path, 'r') as f:
                data = json.load(f)
            
            properties = data.get('properties', [])
            print(f"✅ data.json exists with {len(properties)} properties")
            
            if properties:
                print("\n🏠 Properties in data.json:")
                for i, prop in enumerate(properties[:3], 1):  # Show first 3
                    print(f"  {i}. {prop.get('name', 'Unknown')} - {prop.get('address', 'No address')}")
                if len(properties) > 3:
                    print(f"  ... and {len(properties) - 3} more")
            
            return data
            
        except Exception as e:
            print(f"❌ Error reading data.json: {e}")
            return None
    
    def check_properties_csv(self):
        """Check properties.csv content"""
        print("\n📊 CHECKING PROPERTIES.CSV")
        print("=" * 50)
        
        if not self.properties_csv_path.exists():
            print("❌ properties.csv NOT FOUND!")
            return None
            
        try:
            df = pd.read_csv(self.properties_csv_path)
            print(f"✅ properties.csv exists with {len(df)} properties")
            
            if not df.empty:
                print(f"\n📋 CSV Columns: {list(df.columns)}")
                print("\n🏠 Properties in CSV:")
                for i, row in df.head(3).iterrows():
                    name = row.get('name', row.get('property_name', 'Unknown'))
                    address = row.get('address', row.get('property_address', 'No address'))
                    print(f"  {i+1}. {name} - {address}")
                if len(df) > 3:
                    print(f"  ... and {len(df) - 3} more")
            
            return df
            
        except Exception as e:
            print(f"❌ Error reading properties.csv: {e}")
            return None
    
    def check_flask_api(self):
        """Check Flask API response"""
        print("\n🌐 CHECKING FLASK API")
        print("=" * 50)
        
        try:
            response = requests.get(f'{self.flask_url}/api/properties', timeout=5)
            
            if response.status_code == 200:
                data = response.json()
                properties = data if isinstance(data, list) else data.get('data', [])
                print(f"✅ Flask API responds with {len(properties)} properties")
                
                if properties:
                    print("\n🏠 Properties from Flask:")
                    for i, prop in enumerate(properties[:3], 1):  # Show first 3
                        print(f"  {i}. {prop.get('name', 'Unknown')} - {prop.get('address', 'No address')}")
                    if len(properties) > 3:
                        print(f"  ... and {len(properties) - 3} more")
                
                return properties
            else:
                print(f"❌ Flask API error: HTTP {response.status_code}")
                print(f"Response: {response.text}")
                return None
                
        except requests.exceptions.ConnectionError:
            print("❌ Flask server is NOT RUNNING!")
            print("Start it with: python backend-python/app_frontend_compatible.py")
            return None
        except Exception as e:
            print(f"❌ Flask API error: {e}")
            return None
    
    def test_manual_sync(self):
        """Test manual sync functionality"""
        print("\n🔄 TESTING MANUAL SYNC")
        print("=" * 50)
        
        try:
            # Test JSON → CSV sync
            response = requests.post(f'{self.flask_url}/api/sync', 
                                   json={'direction': 'json-to-csv'}, 
                                   timeout=10)
            
            if response.status_code == 200:
                result = response.json()
                print(f"✅ JSON→CSV sync: {result.get('message', 'Success')}")
            else:
                print(f"❌ JSON→CSV sync failed: HTTP {response.status_code}")
            
            # Test CSV → JSON sync
            response = requests.post(f'{self.flask_url}/api/sync', 
                                   json={'direction': 'csv-to-json'}, 
                                   timeout=10)
            
            if response.status_code == 200:
                result = response.json()
                print(f"✅ CSV→JSON sync: {result.get('message', 'Success')}")
            else:
                print(f"❌ CSV→JSON sync failed: HTTP {response.status_code}")
                
        except Exception as e:
            print(f"❌ Sync test error: {e}")
    
    def compare_data_sources(self):
        """Compare data between all sources"""
        print("\n🔍 DATA COMPARISON")
        print("=" * 50)
        
        json_data = self.check_data_json()
        csv_data = self.check_properties_csv()
        api_data = self.check_flask_api()
        
        json_count = len(json_data.get('properties', [])) if json_data else 0
        csv_count = len(csv_data) if csv_data is not None else 0
        api_count = len(api_data) if api_data else 0
        
        print(f"\n📊 SUMMARY:")
        print(f"  📄 data.json: {json_count} properties")
        print(f"  📊 CSV file:  {csv_count} properties")
        print(f"  🌐 Flask API: {api_count} properties")
        
        if json_count == csv_count == api_count and json_count > 0:
            print("✅ All sources have the same count - SYNC OK!")
        elif json_count == 0 and csv_count == 0 and api_count == 0:
            print("⚠️ All sources are empty - this might be the issue!")
        else:
            print("❌ Data sources are OUT OF SYNC!")
            print("\n🔧 POSSIBLE ISSUES:")
            if json_count == 0:
                print("  - data.json is empty (localStorage might not be saving)")
            if csv_count == 0:
                print("  - properties.csv is empty (backend not receiving data)")
            if api_count == 0:
                print("  - Flask API returns empty (sync not working)")
        
        self.test_manual_sync()
    
    def run_full_diagnosis(self):
        """Run complete sync diagnosis"""
        print("🔍 LOCALSTORAGE ↔ DATA.JSON ↔ FLASK SYNC DIAGNOSIS")
        print("=" * 60)
        print(f"Timestamp: {datetime.now()}")
        print()
        
        self.compare_data_sources()
        
        print(f"\n💡 NEXT STEPS:")
        print("1. Check React DevTools → Application → Local Storage")
        print("2. Look at browser console for sync errors")
        print("3. Check Flask terminal for backend errors")
        print("4. Run manual sync test above")

if __name__ == '__main__':
    debugger = SyncDebugger()
    debugger.run_full_diagnosis()
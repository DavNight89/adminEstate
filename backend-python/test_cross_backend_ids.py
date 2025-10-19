#!/usr/bin/env python3
"""
Cross-Backend Property ID Test
Demonstrates property ID usage between Flask and FastAPI backends
"""

import requests
import json
import time
from typing import Optional

class CrossBackendTester:
    def __init__(self):
        self.flask_url = "http://localhost:5000"
        self.fastapi_url = "http://localhost:8000"
        
    def test_flask_connection(self) -> bool:
        """Test Flask backend connection"""
        try:
            response = requests.get(f"{self.flask_url}/api/properties", timeout=5)
            print(f"✅ Flask Backend (port 5000): {response.status_code}")
            return response.status_code == 200
        except Exception as e:
            print(f"❌ Flask Backend not available: {e}")
            return False
    
    def test_fastapi_connection(self) -> bool:
        """Test FastAPI backend connection"""
        try:
            response = requests.get(f"{self.fastapi_url}/api/properties", timeout=5)
            print(f"✅ FastAPI Backend (port 8000): {response.status_code}")
            return response.status_code == 200
        except Exception as e:
            print(f"❌ FastAPI Backend not available: {e}")
            return False
    
    def get_flask_properties(self) -> list:
        """Get properties from Flask backend"""
        try:
            response = requests.get(f"{self.flask_url}/api/properties")
            if response.status_code == 200:
                data = response.json()
                return data.get('data', []) if isinstance(data, dict) else data
            return []
        except Exception as e:
            print(f"❌ Error fetching Flask properties: {e}")
            return []
    
    def get_fastapi_properties(self) -> list:
        """Get properties from FastAPI backend"""
        try:
            response = requests.get(f"{self.fastapi_url}/api/properties")
            if response.status_code == 200:
                return response.json()
            return []
        except Exception as e:
            print(f"❌ Error fetching FastAPI properties: {e}")
            return []
    
    def test_property_id_cross_usage(self, property_id: str) -> dict:
        """Test using Flask property ID in FastAPI"""
        results = {
            'flask_found': False,
            'fastapi_found': False,
            'flask_property': None,
            'fastapi_property': None
        }
        
        # Test Flask
        try:
            flask_response = requests.get(f"{self.flask_url}/api/properties")
            if flask_response.status_code == 200:
                flask_data = flask_response.json()
                flask_properties = flask_data.get('data', []) if isinstance(flask_data, dict) else flask_data
                
                flask_property = next((p for p in flask_properties if p.get('id') == property_id), None)
                if flask_property:
                    results['flask_found'] = True
                    results['flask_property'] = flask_property
                    print(f"✅ Property found in Flask: {flask_property['name']}")
                else:
                    print(f"❌ Property ID not found in Flask")
        except Exception as e:
            print(f"❌ Flask test error: {e}")
        
        # Test FastAPI
        try:
            fastapi_response = requests.get(f"{self.fastapi_url}/api/properties/{property_id}")
            if fastapi_response.status_code == 200:
                results['fastapi_found'] = True
                results['fastapi_property'] = fastapi_response.json()
                print(f"✅ Property found in FastAPI: {results['fastapi_property']['name']}")
            elif fastapi_response.status_code == 404:
                print(f"❌ Property ID not found in FastAPI (404)")
            else:
                print(f"❌ FastAPI error: {fastapi_response.status_code}")
        except Exception as e:
            print(f"❌ FastAPI test error: {e}")
        
        return results
    
    def sync_property_to_fastapi(self, flask_property: dict) -> bool:
        """Sync a property from Flask to FastAPI"""
        try:
            # Prepare property data for FastAPI
            fastapi_property = {
                "name": flask_property.get('name'),
                "address": flask_property.get('address'),
                "type": flask_property.get('type'),
                "units": flask_property.get('units', 1),
                "purchase_price": flask_property.get('purchasePrice', 0),
                "monthly_revenue": flask_property.get('monthlyRevenue', 0)
            }
            
            response = requests.post(
                f"{self.fastapi_url}/api/properties",
                json=fastapi_property,
                headers={'Content-Type': 'application/json'}
            )
            
            if response.status_code == 201:
                print(f"✅ Property synced to FastAPI: {flask_property['name']}")
                return True
            else:
                print(f"❌ Sync failed: {response.status_code}")
                return False
                
        except Exception as e:
            print(f"❌ Sync error: {e}")
            return False
    
    def run_comprehensive_test(self):
        """Run comprehensive cross-backend testing"""
        print("🔄 Cross-Backend Property ID Test")
        print("=" * 50)
        
        # Test connections
        print("\n1. Testing Backend Connections:")
        flask_ok = self.test_flask_connection()
        fastapi_ok = self.test_fastapi_connection()
        
        if not flask_ok:
            print("\n❌ Flask backend is not running!")
            print("   Start with: python app_frontend_compatible.py")
            return
        
        if not fastapi_ok:
            print("\n⚠️ FastAPI backend is not running")
            print("   Start with: python main.py")
            print("   Continuing with Flask-only tests...")
        
        # Get Flask properties
        print("\n2. Getting Properties from Flask:")
        flask_properties = self.get_flask_properties()
        
        if not flask_properties:
            print("❌ No properties found in Flask backend")
            return
        
        print(f"✅ Found {len(flask_properties)} properties in Flask")
        
        # Test property ID cross-usage
        print("\n3. Testing Property ID Cross-Usage:")
        
        if len(flask_properties) > 0:
            test_property = flask_properties[0]
            test_id = test_property.get('id')
            test_name = test_property.get('name')
            
            print(f"Testing property: {test_name}")
            print(f"Property ID: {test_id}")
            
            results = self.test_property_id_cross_usage(test_id)
            
            # Analysis
            print("\n4. Cross-Backend Analysis:")
            if results['flask_found'] and results['fastapi_found']:
                print("✅ Property ID works in BOTH backends!")
                print("   ✅ Data is synchronized")
            elif results['flask_found'] and not results['fastapi_found']:
                print("⚠️ Property ID only works in Flask backend")
                print("   ❌ Backends have separate data stores")
                
                if fastapi_ok:
                    print("\n5. Attempting Data Synchronization:")
                    success = self.sync_property_to_fastapi(results['flask_property'])
                    if success:
                        print("✅ Property synced! Testing again...")
                        new_results = self.test_property_id_cross_usage(test_id)
                        if new_results['fastapi_found']:
                            print("🎉 Property ID now works in both backends!")
                        else:
                            print("❌ Sync didn't work as expected")
            else:
                print("❌ Property ID doesn't work in either backend")
        
        # Recommendations
        print("\n6. Recommendations:")
        if not fastapi_ok:
            print("📝 For full testing, start FastAPI backend:")
            print("   cd c:\\Users\\davio\\houzi-app\\backend-python")
            print("   python main.py")
        
        print("\n📝 Best Practices:")
        print("   1. Use Flask backend for property management")
        print("   2. Use property_id_manager.py for ID lookup")
        print("   3. Consider unified data source for production")
        
        print("\n📊 Current Status:")
        print(f"   Flask Properties: {len(flask_properties)}")
        if fastapi_ok:
            fastapi_properties = self.get_fastapi_properties()
            print(f"   FastAPI Properties: {len(fastapi_properties)}")
        else:
            print(f"   FastAPI Properties: Not available")

def main():
    """Main function"""
    tester = CrossBackendTester()
    tester.run_comprehensive_test()

if __name__ == "__main__":
    main()
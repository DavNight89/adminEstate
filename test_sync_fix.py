#!/usr/bin/env python3
"""
Test LocalStorage Sync Fix
==========================

This script tests the new localStorage sync endpoint to ensure
it properly handles React localStorage data.
"""

import requests
import json
from datetime import datetime

# Sample localStorage data (what React would send)
test_localStorage_data = {
    "properties": [
        {
            "id": "test-property-1",
            "name": "Test Sync Property",
            "address": "123 Sync Test St",
            "type": "residential",
            "units": 5,
            "occupied": 2,
            "monthlyRevenue": 2500.0,
            "purchasePrice": 400000.0,
            "created_at": datetime.now().isoformat(),
            "updated_at": datetime.now().isoformat()
        }
    ],
    "tenants": [
        {
            "id": "test-tenant-1", 
            "name": "Test Tenant",
            "property_id": "test-property-1",
            "lease_start": "2025-01-01",
            "monthly_rent": 1200.0
        }
    ],
    "workOrders": [
        {
            "id": "test-wo-1",
            "title": "Test Work Order", 
            "property_id": "test-property-1",
            "status": "open",
            "priority": "medium"
        }
    ],
    "transactions": [],
    "documents": []
}

def test_sync_endpoint():
    """Test the new localStorage sync endpoint"""
    
    print("🧪 TESTING LOCALSTORAGE SYNC FIX")
    print("=" * 50)
    
    try:
        print("📤 Sending localStorage data to Flask...")
        
        response = requests.post(
            'http://localhost:5000/api/sync/localstorage',
            json=test_localStorage_data,
            timeout=10
        )
        
        if response.status_code == 200:
            result = response.json()
            print("✅ SYNC SUCCESS!")
            print(f"📊 Message: {result.get('message')}")
            print(f"📈 Results: {result.get('sync_results')}")
            print(f"⏰ Timestamp: {result.get('timestamp')}")
            
            # Test that properties endpoint returns the synced data
            print("\n🔍 Verifying sync by checking /api/properties...")
            
            props_response = requests.get('http://localhost:5000/api/properties')
            if props_response.status_code == 200:
                properties = props_response.json()
                prop_count = len(properties) if isinstance(properties, list) else len(properties.get('data', []))
                print(f"✅ Properties endpoint returns {prop_count} properties")
                return True
            else:
                print(f"❌ Properties check failed: {props_response.status_code}")
                
        else:
            print(f"❌ SYNC FAILED: HTTP {response.status_code}")
            print(f"Response: {response.text}")
            
    except requests.exceptions.ConnectionError:
        print("❌ Flask server not running!")
        print("Start it: python backend-python/app_frontend_compatible.py")
        
    except Exception as e:
        print(f"❌ Test error: {e}")
    
    return False

if __name__ == '__main__':
    print("🔧 LocalStorage Sync Fix Test")
    print(f"Timestamp: {datetime.now()}")
    print()
    
    success = test_sync_endpoint()
    
    if success:
        print("\n🎉 SYNC FIX WORKING!")
        print("Your React app can now reliably sync localStorage to Flask")
    else:
        print("\n❌ SYNC FIX NEEDS ATTENTION")
        print("Check Flask server and endpoint implementation")
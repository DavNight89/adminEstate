#!/usr/bin/env python3
"""
CORS Debugging Test
==================

Quick test to check if Flask server is running and responding correctly.
"""

import urllib.request
import json
from urllib.error import URLError, HTTPError

def test_flask_endpoints():
    """Test Flask endpoints to debug CORS issues"""
    
    print("🔍 FLASK CORS DEBUG TEST")
    print("=" * 40)
    
    base_url = "http://localhost:5000"
    
    endpoints_to_test = [
        "/api/health",
        "/api/cors-test", 
        "/api/properties",
        "/api/analytics/correlations"
    ]
    
    for endpoint in endpoints_to_test:
        url = f"{base_url}{endpoint}"
        print(f"\n🌐 Testing: {endpoint}")
        
        try:
            with urllib.request.urlopen(url) as response:
                if response.status == 200:
                    try:
                        data = json.loads(response.read().decode())
                        print(f"✅ SUCCESS - Status: {response.status}")
                        print(f"📄 Response: {data.get('message', 'No message')}")
                    except json.JSONDecodeError:
                        print(f"✅ SUCCESS - Status: {response.status} (Non-JSON response)")
                else:
                    print(f"⚠️ UNEXPECTED STATUS - {response.status}")
                    
        except HTTPError as e:
            print(f"❌ HTTP ERROR - {e.code}: {e.reason}")
            
        except URLError as e:
            if "Connection refused" in str(e):
                print(f"❌ CONNECTION REFUSED - Flask server not running")
                break
            else:
                print(f"❌ URL ERROR - {e.reason}")
                
        except Exception as e:
            print(f"❌ UNEXPECTED ERROR - {e}")
    
    print(f"\n💡 CORS TROUBLESHOOTING STEPS:")
    print("1. Make sure Flask server is running: python backend-python/app_frontend_compatible.py")
    print("2. Check React app is on http://localhost:3000")
    print("3. Open browser DevTools → Network tab to see exact error")
    print("4. Try accessing http://localhost:5000/api/health directly in browser")
    print("5. Check if browser is blocking requests (try incognito mode)")

if __name__ == '__main__':
    test_flask_endpoints()
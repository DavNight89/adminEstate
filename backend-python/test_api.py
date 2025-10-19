import requests
import json

def test_flask_api():
    """Simple test to verify Flask API connection"""
    try:
        response = requests.get('http://localhost:5000/api/properties', timeout=5)
        if response.status_code == 200:
            data = response.json()
            properties = data.get('data', [])
            print(f"✅ Flask API Working: {len(properties)} properties found")
            
            # Show first few properties
            for i, prop in enumerate(properties[:3]):
                print(f"   {i+1}. {prop.get('name')} - {prop.get('address')}")
            
            return True
        else:
            print(f"❌ Flask API Error: {response.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ Flask API Offline: {str(e)[:50]}...")
        return False

if __name__ == '__main__':
    test_flask_api()
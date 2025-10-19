#!/usr/bin/env python3
"""
Interactive API Demo Script
Demonstrates all the interactive features of your Backend API
"""

import requests
import json
import time
from datetime import datetime

# Configuration
FASTAPI_URL = "http://localhost:8000"
FLASK_URL = "http://localhost:5000"

class APIDemo:
    def __init__(self):
        self.session = requests.Session()
        self.demo_property_id = None
        
    def print_section(self, title):
        """Print a section header"""
        print(f"\n{'='*60}")
        print(f"🚀 {title}")
        print(f"{'='*60}")
    
    def print_response(self, response, title="Response"):
        """Pretty print API response"""
        print(f"\n📊 {title}:")
        print(f"Status: {response.status_code}")
        try:
            data = response.json()
            print(json.dumps(data, indent=2))
        except:
            print(response.text)
    
    def test_health_check(self):
        """Test basic connectivity"""
        self.print_section("Health Check")
        
        try:
            # Test FastAPI
            response = self.session.get(f"{FASTAPI_URL}/health", timeout=5)
            print(f"✅ FastAPI Health: {response.status_code} - {response.text}")
        except Exception as e:
            print(f"❌ FastAPI not available: {e}")
        
        try:
            # Test Flask
            response = self.session.get(f"{FLASK_URL}/api/properties", timeout=5)
            print(f"✅ Flask API: {response.status_code}")
        except Exception as e:
            print(f"❌ Flask API not available: {e}")
    
    def test_properties_crud(self):
        """Test Property CRUD operations"""
        self.print_section("Property CRUD Operations")
        
        # Test property data
        new_property = {
            "name": f"Demo Property {datetime.now().strftime('%H:%M:%S')}",
            "address": "123 Demo Street",
            "type": "apartment",
            "units": 8,
            "monthlyRevenue": 6400,
            "purchasePrice": 640000
        }
        
        try:
            # CREATE - Add new property
            print("➕ Adding new property...")
            response = self.session.post(
                f"{FLASK_URL}/api/properties",
                json=new_property,
                timeout=10
            )
            self.print_response(response, "Add Property")
            
            if response.status_code == 200:
                result = response.json()
                if 'data' in result and 'id' in result['data']:
                    self.demo_property_id = result['data']['id']
                    print(f"✅ Property created with ID: {self.demo_property_id}")
            
            # READ - Get all properties
            print("\n📋 Getting all properties...")
            response = self.session.get(f"{FLASK_URL}/api/properties")
            self.print_response(response, "All Properties")
            
        except Exception as e:
            print(f"❌ Error in CRUD operations: {e}")
    
    def test_analytics_endpoints(self):
        """Test all analytics endpoints"""
        self.print_section("Pandas Analytics Demo")
        
        analytics_endpoints = [
            ("/api/analytics/dashboard", "📊 Dashboard Analytics"),
            ("/api/analytics/property-types", "🏢 Property Type Analysis"),
            ("/api/analytics/rankings", "🏆 Performance Rankings"),
            ("/api/analytics/portfolio", "📈 Portfolio Composition"),
            ("/api/analytics/correlations", "🔗 Correlation Analysis"),
            ("/api/data/stats", "📊 Data Statistics")
        ]
        
        for endpoint, title in analytics_endpoints:
            try:
                print(f"\n{title}")
                print("-" * 40)
                response = self.session.get(f"{FLASK_URL}{endpoint}")
                
                if response.status_code == 200:
                    data = response.json()
                    if 'data' in data:
                        # Print key metrics only
                        analytics_data = data['data']
                        if endpoint == "/api/analytics/dashboard":
                            print(f"Properties: {analytics_data.get('total_properties', 'N/A')}")
                            print(f"Portfolio Value: ${analytics_data.get('total_portfolio_value', 0):,.0f}")
                            print(f"Monthly Revenue: ${analytics_data.get('total_monthly_revenue', 0):,.0f}")
                            print(f"Avg Cap Rate: {analytics_data.get('avg_cap_rate', 0):.2f}%")
                        
                        elif endpoint == "/api/data/stats":
                            print(f"Total Properties: {analytics_data.get('total_properties', 'N/A')}")
                            print(f"Unique Names: {analytics_data.get('unique_names', 'N/A')}")
                            print(f"Potential Duplicates: {analytics_data.get('potential_duplicates', 'N/A')}")
                        
                        else:
                            # For other endpoints, show structure
                            if isinstance(analytics_data, dict):
                                for key, value in list(analytics_data.items())[:3]:  # Show first 3 items
                                    print(f"{key}: {type(value).__name__}")
                            
                        print("✅ Success")
                else:
                    print(f"❌ Error: {response.status_code}")
                    
            except Exception as e:
                print(f"❌ Error testing {endpoint}: {e}")
    
    def test_data_management(self):
        """Test data management features"""
        self.print_section("Data Management Features")
        
        try:
            # Check data stats
            print("📊 Checking data statistics...")
            response = self.session.get(f"{FLASK_URL}/api/data/stats")
            self.print_response(response, "Data Stats")
            
            # Note: Not actually cleaning duplicates in demo
            print("\n🧹 Duplicate cleaning available via POST /api/data/clean-duplicates")
            print("   (Skipped in demo to preserve data)")
            
        except Exception as e:
            print(f"❌ Error in data management: {e}")
    
    def test_fastapi_features(self):
        """Test FastAPI specific features"""
        self.print_section("FastAPI Advanced Features")
        
        try:
            # Test FastAPI endpoints
            fastapi_endpoints = [
                "/api/properties",
                "/api/tenants", 
                "/api/workorders",
                "/api/analytics/dashboard/quick-stats"
            ]
            
            for endpoint in fastapi_endpoints:
                try:
                    response = self.session.get(f"{FASTAPI_URL}{endpoint}", timeout=5)
                    print(f"✅ {endpoint}: {response.status_code}")
                except:
                    print(f"❌ {endpoint}: Not available")
            
            print(f"\n📚 FastAPI Documentation: {FASTAPI_URL}/docs")
            print(f"📖 ReDoc Documentation: {FASTAPI_URL}/redoc")
            
        except Exception as e:
            print(f"❌ Error testing FastAPI: {e}")
    
    def run_interactive_demo(self):
        """Run the complete interactive demo"""
        print("🚀 Backend API Interactive Features Demo")
        print("=" * 60)
        print("This demo will test all interactive features of your property management API")
        
        # Run all tests
        self.test_health_check()
        self.test_properties_crud()
        self.test_analytics_endpoints()
        self.test_data_management()
        self.test_fastapi_features()
        
        # Summary
        self.print_section("Demo Complete!")
        print("""
🎯 What you can do next:

1. 📚 Open Swagger UI: http://localhost:8000/docs
   - Interactive API testing
   - Try all endpoints
   - See request/response examples

2. 🧪 Test Flask Analytics: http://localhost:5000/api/analytics/dashboard
   - Pandas-powered analytics
   - Real-time calculations
   - JSON responses

3. 🛠️ Run cleanup tools:
   - python fix_duplicates.py
   - python test_frontend_compatibility.py

4. 🔗 Connect your React app:
   - Update API URLs to http://localhost:5000
   - Replace localStorage with API calls
   - Use the enhanced analytics data

5. 📊 Monitor your data:
   - GET /api/data/stats (check for duplicates)
   - POST /api/data/clean-duplicates (cleanup)
   - GET /api/analytics/dashboard (overview)
        """)

def main():
    """Main function to run the demo"""
    demo = APIDemo()
    
    print("Starting interactive API demo...")
    print("Make sure your servers are running:")
    print("  FastAPI: python main.py (port 8000)")
    print("  Flask:   python app_frontend_compatible.py (port 5000)")
    print()
    
    # Ask user if ready
    input("Press Enter when servers are ready...")
    
    # Run the demo
    demo.run_interactive_demo()

if __name__ == "__main__":
    main()
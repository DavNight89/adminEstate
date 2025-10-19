#!/usr/bin/env python3
"""
Property ID Management Utility
Helps you find, manage, and use property IDs for API operations
"""

import requests
import json
import sys
from typing import List, Dict, Optional

class PropertyIDManager:
    def __init__(self, base_url: str = "http://localhost:5000"):
        self.base_url = base_url
        self.session = requests.Session()
    
    def get_all_properties(self) -> List[Dict]:
        """Get all properties from the API"""
        try:
            response = self.session.get(f"{self.base_url}/api/properties")
            if response.status_code == 200:
                data = response.json()
                return data.get('data', []) if isinstance(data, dict) else data
            else:
                print(f"❌ Error fetching properties: {response.status_code}")
                return []
        except Exception as e:
            print(f"❌ Connection error: {e}")
            return []
    
    def list_property_ids(self) -> None:
        """List all property IDs with names"""
        properties = self.get_all_properties()
        
        if not properties:
            print("📭 No properties found")
            return
        
        print("🏠 Property ID Reference List")
        print("=" * 80)
        
        for i, prop in enumerate(properties, 1):
            property_id = prop.get('id', 'No ID')
            name = prop.get('name', 'Unnamed Property')
            address = prop.get('address', 'No Address')
            revenue = prop.get('monthlyRevenue', 0)
            
            print(f"{i}. {name}")
            print(f"   ID: {property_id}")
            print(f"   Address: {address}")
            print(f"   Revenue: ${revenue:,.2f}")
            print()
    
    def find_property_id(self, search_term: str) -> Optional[str]:
        """Find property ID by name or address"""
        properties = self.get_all_properties()
        
        for prop in properties:
            name = prop.get('name', '').lower()
            address = prop.get('address', '').lower()
            
            if (search_term.lower() in name or 
                search_term.lower() in address):
                return prop.get('id')
        
        return None
    
    def search_properties(self, search_term: str) -> List[Dict]:
        """Search properties by name or address"""
        properties = self.get_all_properties()
        results = []
        
        for prop in properties:
            name = prop.get('name', '').lower()
            address = prop.get('address', '').lower()
            
            if (search_term.lower() in name or 
                search_term.lower() in address):
                results.append(prop)
        
        return results
    
    def update_property(self, property_id: str, updates: Dict) -> bool:
        """Update a property by ID"""
        try:
            response = self.session.put(
                f"{self.base_url}/api/properties/{property_id}",
                json=updates,
                headers={'Content-Type': 'application/json'}
            )
            
            if response.status_code == 200:
                print(f"✅ Property {property_id} updated successfully")
                return True
            else:
                print(f"❌ Update failed: {response.status_code}")
                try:
                    error_data = response.json()
                    print(f"   Error: {error_data}")
                except:
                    print(f"   Response: {response.text}")
                return False
                
        except Exception as e:
            print(f"❌ Update error: {e}")
            return False
    
    def update_property_by_name(self, property_name: str, updates: Dict) -> bool:
        """Update property by name (finds ID automatically)"""
        property_id = self.find_property_id(property_name)
        
        if not property_id:
            print(f"❌ Property '{property_name}' not found")
            return False
        
        print(f"🔍 Found property '{property_name}' with ID: {property_id}")
        return self.update_property(property_id, updates)
    
    def interactive_search(self):
        """Interactive property search and management"""
        while True:
            print("\n🔍 Property ID Management")
            print("=" * 40)
            print("1. List all properties")
            print("2. Search properties")
            print("3. Find property ID")
            print("4. Update property")
            print("5. Exit")
            
            choice = input("\nChoose an option (1-5): ").strip()
            
            if choice == '1':
                self.list_property_ids()
            
            elif choice == '2':
                search_term = input("Enter search term (name/address): ").strip()
                results = self.search_properties(search_term)
                
                if results:
                    print(f"\n🏠 Found {len(results)} matching properties:")
                    for i, prop in enumerate(results, 1):
                        print(f"{i}. {prop['name']} (ID: {prop['id']})")
                else:
                    print("❌ No properties found")
            
            elif choice == '3':
                search_term = input("Enter property name/address: ").strip()
                property_id = self.find_property_id(search_term)
                
                if property_id:
                    print(f"✅ Property ID: {property_id}")
                else:
                    print("❌ Property not found")
            
            elif choice == '4':
                property_name = input("Enter property name: ").strip()
                
                print("\nWhat would you like to update?")
                print("1. Monthly Revenue")
                print("2. Occupied Units")
                print("3. Custom Update")
                
                update_choice = input("Choose (1-3): ").strip()
                
                updates = {}
                if update_choice == '1':
                    revenue = input("New monthly revenue: $").strip()
                    try:
                        updates['monthlyRevenue'] = float(revenue)
                    except ValueError:
                        print("❌ Invalid revenue amount")
                        continue
                
                elif update_choice == '2':
                    occupied = input("Number of occupied units: ").strip()
                    try:
                        updates['occupied'] = int(occupied)
                    except ValueError:
                        print("❌ Invalid number")
                        continue
                
                elif update_choice == '3':
                    print("Enter updates in JSON format:")
                    print("Example: {\"monthlyRevenue\": 5000, \"occupied\": 8}")
                    json_input = input("Updates: ").strip()
                    try:
                        updates = json.loads(json_input)
                    except json.JSONDecodeError:
                        print("❌ Invalid JSON format")
                        continue
                
                if updates:
                    self.update_property_by_name(property_name, updates)
            
            elif choice == '5':
                print("👋 Goodbye!")
                break
            
            else:
                print("❌ Invalid choice, please try again")

def main():
    """Main function"""
    if len(sys.argv) > 1:
        # Command line mode
        manager = PropertyIDManager()
        command = sys.argv[1].lower()
        
        if command == 'list':
            manager.list_property_ids()
        
        elif command == 'find' and len(sys.argv) > 2:
            search_term = ' '.join(sys.argv[2:])
            property_id = manager.find_property_id(search_term)
            if property_id:
                print(f"Property ID: {property_id}")
            else:
                print("Property not found")
        
        elif command == 'search' and len(sys.argv) > 2:
            search_term = ' '.join(sys.argv[2:])
            results = manager.search_properties(search_term)
            for prop in results:
                print(f"{prop['name']}: {prop['id']}")
        
        else:
            print("Usage:")
            print("  python property_id_manager.py list")
            print("  python property_id_manager.py find <property name>")
            print("  python property_id_manager.py search <search term>")
    
    else:
        # Interactive mode
        manager = PropertyIDManager()
        manager.interactive_search()

if __name__ == "__main__":
    main()
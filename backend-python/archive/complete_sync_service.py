#!/usr/bin/env python3
"""
Complete Multi-Entity Sync Service  
==================================

Syncs ALL entity types between data.json and CSV files:
- Properties ↔ properties.csv
- Tenants ↔ tenants.csv
- Work Orders ↔ workorders.csv  
- Transactions ↔ transactions.csv
- Documents ↔ documents.csv
"""

import json
import pandas as pd
import os
from datetime import datetime
from pathlib import Path
import hashlib

class CompleteDataSync:
    """Complete sync service for all entity types"""
    
    def __init__(self):
        self.backend_dir = Path(__file__).parent
        self.frontend_dir = self.backend_dir.parent / 'src'
        
        self.data_json_path = self.frontend_dir / 'data.json'
        self.dataframe_dir = self.backend_dir / 'dataframe_data'
        
        # CSV file paths for all entity types
        self.csv_files = {
            'properties': self.dataframe_dir / 'properties.csv',
            'tenants': self.dataframe_dir / 'tenants.csv', 
            'workorders': self.dataframe_dir / 'workorders.csv',
            'transactions': self.dataframe_dir / 'transactions.csv',
            'documents': self.dataframe_dir / 'documents.csv'
        }
        
        # Track file hashes for change detection
        self.last_hashes = {}
    
    def load_json_data(self):
        """Load all data from data.json"""
        try:
            with open(self.data_json_path, 'r') as f:
                data = json.load(f)
            return {
                'properties': data.get('properties', []),
                'tenants': data.get('tenants', []),
                'workorders': data.get('workOrders', []),  # Note: React uses camelCase
                'transactions': data.get('transactions', []),
                'documents': data.get('documents', [])
            }
        except Exception as e:
            print(f"❌ Error loading data.json: {e}")
            return {entity: [] for entity in self.csv_files.keys()}
    
    def load_csv_data(self, entity_type: str):
        """Load data from specific CSV file"""
        csv_path = self.csv_files.get(entity_type)
        if not csv_path or not csv_path.exists():
            return []
        
        try:
            df = pd.read_csv(csv_path)
            return df.to_dict('records')
        except Exception as e:
            print(f"❌ Error loading {entity_type}.csv: {e}")
            return []
    
    def save_to_csv(self, entity_type: str, data: list):
        """Save data to specific CSV file"""
        if not data:
            return True
            
        csv_path = self.csv_files.get(entity_type)
        if not csv_path:
            return False
        
        try:
            # Ensure directory exists
            csv_path.parent.mkdir(exist_ok=True)
            
            df = pd.DataFrame(data)
            df.to_csv(csv_path, index=False)
            print(f"✅ Saved {len(data)} {entity_type} to CSV")
            return True
        except Exception as e:
            print(f"❌ Error saving {entity_type}.csv: {e}")
            return False
    
    def save_to_json(self, all_data: dict):
        """Save all data to data.json"""
        try:
            # Convert workorders back to camelCase for React
            json_data = {
                'properties': all_data.get('properties', []),
                'tenants': all_data.get('tenants', []),
                'workOrders': all_data.get('workorders', []),  # React expects camelCase
                'transactions': all_data.get('transactions', []),
                'documents': all_data.get('documents', [])
            }
            
            with open(self.data_json_path, 'w') as f:
                json.dump(json_data, f, indent=2, default=str)
            
            total_items = sum(len(data) for data in json_data.values())
            print(f"✅ Saved {total_items} total items to data.json")
            return True
        except Exception as e:
            print(f"❌ Error saving data.json: {e}")
            return False
    
    def sync_json_to_csv(self):
        """Sync data.json → all CSV files"""
        print("🔄 Syncing data.json → CSV files...")
        
        json_data = self.load_json_data()
        success_count = 0
        
        for entity_type, data in json_data.items():
            if self.save_to_csv(entity_type, data):
                success_count += 1
        
        print(f"✅ Synced {success_count}/{len(self.csv_files)} entity types to CSV")
        return success_count == len(self.csv_files)
    
    def sync_csv_to_json(self):
        """Sync all CSV files → data.json"""
        print("🔄 Syncing CSV files → data.json...")
        
        all_data = {}
        
        for entity_type in self.csv_files.keys():
            csv_data = self.load_csv_data(entity_type)
            all_data[entity_type] = csv_data
            print(f"📊 Loaded {len(csv_data)} {entity_type} from CSV")
        
        return self.save_to_json(all_data)
    
    def sync_localStorage_to_backend(self, localStorage_data: dict):
        """Sync localStorage data to both CSV and JSON"""
        print("🔄 Syncing localStorage → Backend (CSV + JSON)...")
        
        # Convert camelCase to snake_case for CSV storage
        csv_data = {
            'properties': localStorage_data.get('properties', []),
            'tenants': localStorage_data.get('tenants', []),
            'workorders': localStorage_data.get('workOrders', []),  # Convert camelCase
            'transactions': localStorage_data.get('transactions', []),
            'documents': localStorage_data.get('documents', [])
        }
        
        # Save to CSV files
        csv_success = 0
        for entity_type, data in csv_data.items():
            if data:  # Only save if data exists
                if self.save_to_csv(entity_type, data):
                    csv_success += 1
        
        # Save to JSON (maintains React camelCase)
        json_success = self.save_to_json(localStorage_data)
        
        return {
            'csv_synced': csv_success,
            'json_synced': json_success,
            'total_entities': len([d for d in csv_data.values() if d])
        }
    
    def get_sync_status(self):
        """Get current sync status for all entity types"""
        json_data = self.load_json_data()
        
        status = {
            'timestamp': datetime.now().isoformat(),
            'entities': {}
        }
        
        for entity_type in self.csv_files.keys():
            csv_data = self.load_csv_data(entity_type)
            json_entity_data = json_data.get(entity_type, [])
            
            status['entities'][entity_type] = {
                'csv_count': len(csv_data),
                'json_count': len(json_entity_data),
                'in_sync': len(csv_data) == len(json_entity_data),
                'csv_exists': self.csv_files[entity_type].exists()
            }
        
        return status

# Factory function for easy import
def get_complete_sync_service():
    """Get instance of complete sync service"""
    return CompleteDataSync()

if __name__ == '__main__':
    sync = CompleteDataSync()
    
    print("🔍 COMPLETE SYNC SERVICE TEST")
    print("=" * 40)
    
    # Show current status
    status = sync.get_sync_status()
    print(f"\n📊 Current Status:")
    for entity, info in status['entities'].items():
        sync_icon = "✅" if info['in_sync'] else "❌"
        csv_icon = "📄" if info['csv_exists'] else "❌"
        print(f"  {sync_icon} {entity}: JSON={info['json_count']}, CSV={info['csv_count']} {csv_icon}")
    
    # Test sync
    print(f"\n🔄 Testing complete sync...")
    success = sync.sync_json_to_csv()
    print(f"Result: {'✅ Success' if success else '❌ Failed'}")
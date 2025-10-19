#!/usr/bin/env python3
"""
Continuous Data Sync System
============================

Keeps data.json and properties.csv synchronized in real-time.
Can be run as:
1. One-time sync
2. File watcher for automatic sync
3. API endpoint for triggered sync
"""

import json
import pandas as pd
import os
import time
from datetime import datetime
from pathlib import Path
import hashlib
import uuid

class ContinuousDataSync:
    def __init__(self):
        self.backend_dir = Path(__file__).parent
        self.frontend_dir = self.backend_dir.parent / 'src'
        
        self.data_json_path = self.frontend_dir / 'data.json'
        self.properties_csv_path = self.backend_dir / 'dataframe_data_compatible' / 'properties.csv'
        
        # Track file hashes to detect changes
        self.last_json_hash = None
        self.last_csv_hash = None
        
    def get_file_hash(self, file_path):
        """Calculate MD5 hash of file to detect changes"""
        if not file_path.exists():
            return None
        
        try:
            with open(file_path, 'rb') as f:
                return hashlib.md5(f.read()).hexdigest()
        except:
            return None
    
    def load_json_properties(self):
        """Load properties from data.json"""
        try:
            with open(self.data_json_path, 'r') as f:
                data = json.load(f)
            return data.get('properties', [])
        except:
            return []
    
    def load_csv_properties(self):
        """Load properties from CSV as list of dicts"""
        try:
            df = pd.read_csv(self.properties_csv_path)
            return df.to_dict('records')
        except:
            return []
    
    def save_to_json(self, properties):
        """Save properties to data.json while preserving other data"""
        try:
            # Load existing data to preserve tenants, workOrders, etc.
            if self.data_json_path.exists():
                with open(self.data_json_path, 'r') as f:
                    data = json.load(f)
            else:
                data = {"properties": [], "tenants": [], "workOrders": []}
            
            data['properties'] = properties
            
            with open(self.data_json_path, 'w') as f:
                json.dump(data, f, indent=2)
            
            print(f"✅ Synced {len(properties)} properties to data.json")
            return True
        except Exception as e:
            print(f"❌ Error saving to data.json: {e}")
            return False
    
    def save_to_csv(self, properties):
        """Save properties to CSV"""
        try:
            df = pd.DataFrame(properties)
            # Ensure directory exists
            self.properties_csv_path.parent.mkdir(parents=True, exist_ok=True)
            df.to_csv(self.properties_csv_path, index=False)
            print(f"✅ Synced {len(properties)} properties to CSV")
            return True
        except Exception as e:
            print(f"❌ Error saving to CSV: {e}")
            return False
    
    def standardize_properties(self, properties):
        """Ensure all properties have consistent schema"""
        standardized = []
        
        for prop in properties:
            # Ensure all required fields exist
            std_prop = {
                'id': str(prop.get('id', str(uuid.uuid4()))),
                'name': str(prop.get('name', '')).strip(),
                'address': str(prop.get('address', '')).strip(),
                'type': str(prop.get('type', 'residential')).lower(),
                'units': int(prop.get('units', 0)),
                'occupied': int(prop.get('occupied', 0)),
                'monthlyRevenue': float(prop.get('monthlyRevenue', 0)),
                'purchasePrice': float(prop.get('purchasePrice', 0)),
                'created_at': prop.get('created_at', datetime.now().isoformat()),
                'updated_at': datetime.now().isoformat()
            }
            
            standardized.append(std_prop)
        
        return standardized
    
    def sync_json_to_csv(self):
        """Sync data.json → properties.csv"""
        json_props = self.load_json_properties()
        if json_props:
            standardized = self.standardize_properties(json_props)
            return self.save_to_csv(standardized)
        return False
    
    def sync_csv_to_json(self):
        """Sync properties.csv → data.json"""
        csv_props = self.load_csv_properties()
        if csv_props:
            standardized = self.standardize_properties(csv_props)
            return self.save_to_json(standardized)
        return False
    
    def detect_changes_and_sync(self):
        """Detect which file changed and sync accordingly"""
        current_json_hash = self.get_file_hash(self.data_json_path)
        current_csv_hash = self.get_file_hash(self.properties_csv_path)
        
        json_changed = current_json_hash != self.last_json_hash
        csv_changed = current_csv_hash != self.last_csv_hash
        
        if json_changed and not csv_changed:
            print("📱 data.json changed, syncing to CSV...")
            self.sync_json_to_csv()
        elif csv_changed and not json_changed:
            print("📊 properties.csv changed, syncing to JSON...")
            self.sync_csv_to_json()
        elif json_changed and csv_changed:
            print("⚠️ Both files changed, manual resolution needed")
            return False
        
        # Update hashes
        self.last_json_hash = current_json_hash
        self.last_csv_hash = current_csv_hash
        
        return True
    
    def run_continuous_sync(self, interval_seconds=2):
        """Run continuous file monitoring and sync"""
        print(f"🔄 Starting continuous sync (checking every {interval_seconds}s)")
        print("Press Ctrl+C to stop")
        
        # Initialize hashes
        self.last_json_hash = self.get_file_hash(self.data_json_path)
        self.last_csv_hash = self.get_file_hash(self.properties_csv_path)
        
        try:
            while True:
                self.detect_changes_and_sync()
                time.sleep(interval_seconds)
        except KeyboardInterrupt:
            print("\n🛑 Continuous sync stopped")
    
    def run_one_time_sync(self, direction='csv-to-json'):
        """Run one-time synchronization"""
        print(f"🔄 Running one-time sync: {direction}")
        
        if direction == 'csv-to-json':
            return self.sync_csv_to_json()
        elif direction == 'json-to-csv':
            return self.sync_json_to_csv()
        else:
            print("❌ Invalid direction. Use 'csv-to-json' or 'json-to-csv'")
            return False

if __name__ == '__main__':
    import sys
    
    sync = ContinuousDataSync()
    
    if len(sys.argv) > 1:
        command = sys.argv[1].lower()
        
        if command == 'continuous':
            sync.run_continuous_sync()
        elif command == 'csv-to-json':
            sync.run_one_time_sync('csv-to-json')
        elif command == 'json-to-csv':
            sync.run_one_time_sync('json-to-csv')
        else:
            print("Usage:")
            print("  python continuous_sync.py continuous     # Run continuous monitoring")
            print("  python continuous_sync.py csv-to-json   # One-time CSV → JSON sync")
            print("  python continuous_sync.py json-to-csv   # One-time JSON → CSV sync")
    else:
        # Default: sync CSV to JSON once
        sync.run_one_time_sync('csv-to-json')
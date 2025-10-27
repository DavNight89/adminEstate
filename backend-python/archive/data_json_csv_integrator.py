#!/usr/bin/env python3
"""
Data.json ↔ Properties.csv Integration Manager
============================================

This script creates seamless integration between:
- React frontend data.json (JSON format)
- Flask backend properties.csv (Pandas DataFrame)

Features:
- Bidirectional synchronization
- Duplicate detection and removal
- Schema standardization
- Data validation and cleanup
- Backup creation before changes
"""

import json
import pandas as pd
import os
import sys
from datetime import datetime
from pathlib import Path
import shutil
import uuid

class DataJsonCsvIntegrator:
    def __init__(self):
        self.backend_dir = Path(__file__).parent
        self.frontend_dir = self.backend_dir.parent / 'src'
        
        # File paths
        self.data_json_path = self.frontend_dir / 'data.json'
        self.properties_csv_path = self.backend_dir / 'dataframe_data' / 'properties.csv'
        self.backup_dir = self.backend_dir / 'integration_backups'
        
        # Create backup directory
        self.backup_dir.mkdir(exist_ok=True)
        
        print(f"📂 Frontend data.json: {self.data_json_path}")
        print(f"📊 Backend CSV: {self.properties_csv_path}")
        print(f"💾 Backup directory: {self.backup_dir}")
    
    def create_backups(self):
        """Create timestamped backups of both files before integration"""
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        
        # Backup data.json
        if self.data_json_path.exists():
            backup_json = self.backup_dir / f"data_json_backup_{timestamp}.json"
            shutil.copy2(self.data_json_path, backup_json)
            print(f"💾 Backed up data.json to: {backup_json}")
        
        # Backup properties.csv
        if self.properties_csv_path.exists():
            backup_csv = self.backup_dir / f"properties_csv_backup_{timestamp}.csv"
            shutil.copy2(self.properties_csv_path, backup_csv)
            print(f"💾 Backed up properties.csv to: {backup_csv}")
            
    def load_data_json(self):
        """Load and parse data.json"""
        if not self.data_json_path.exists():
            print(f"⚠️ data.json not found, creating empty structure")
            return {"properties": [], "tenants": [], "workOrders": []}
            
        try:
            with open(self.data_json_path, 'r', encoding='utf-8') as f:
                data = json.load(f)
            print(f"📱 Loaded data.json: {len(data.get('properties', []))} properties")
            return data
        except Exception as e:
            print(f"❌ Error loading data.json: {e}")
            return {"properties": [], "tenants": [], "workOrders": []}
    
    def load_properties_csv(self):
        """Load and parse properties.csv"""
        if not self.properties_csv_path.exists():
            print(f"⚠️ properties.csv not found, creating empty DataFrame")
            return pd.DataFrame(columns=[
                'id', 'name', 'address', 'type', 'units', 'occupied',
                'monthlyRevenue', 'purchasePrice', 'created_at', 'updated_at'
            ])
            
        try:
            df = pd.read_csv(self.properties_csv_path)
            print(f"📊 Loaded properties.csv: {len(df)} properties")
            return df
        except Exception as e:
            print(f"❌ Error loading properties.csv: {e}")
            return pd.DataFrame()
    
    def standardize_property_schema(self, prop, source="unknown"):
        """Convert property to standardized schema"""
        standardized = {
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
        
        # Handle alternative field names
        if 'monthly_revenue' in prop:
            standardized['monthlyRevenue'] = float(prop['monthly_revenue'])
        if 'purchase_price' in prop:
            standardized['purchasePrice'] = float(prop['purchase_price'])
            
        return standardized
    
    def detect_duplicates(self, properties_list):
        """Detect duplicate properties based on name and address"""
        seen = set()
        duplicates = []
        unique_properties = []
        
        for prop in properties_list:
            # Create a signature for duplicate detection
            signature = (
                prop['name'].lower().strip(),
                prop['address'].lower().strip()
            )
            
            if signature in seen:
                duplicates.append(prop)
                print(f"🔍 Duplicate detected: {prop['name']} - {prop['address']}")
            else:
                seen.add(signature)
                unique_properties.append(prop)
        
        return unique_properties, duplicates
    
    def merge_properties(self, json_properties, csv_df):
        """Merge properties from both sources, eliminating duplicates"""
        print("\n🔄 MERGING DATA SOURCES")
        print("=" * 40)
        
        merged_properties = []
        
        # Add properties from data.json
        for prop in json_properties:
            standardized = self.standardize_property_schema(prop, "data.json")
            merged_properties.append(standardized)
        
        # Add properties from CSV
        for _, row in csv_df.iterrows():
            standardized = self.standardize_property_schema(row.to_dict(), "properties.csv")
            merged_properties.append(standardized)
        
        print(f"📊 Total before deduplication: {len(merged_properties)}")
        
        # Remove duplicates
        unique_properties, duplicates = self.detect_duplicates(merged_properties)
        
        print(f"✅ Unique properties: {len(unique_properties)}")
        print(f"🗑️ Duplicates removed: {len(duplicates)}")
        
        return unique_properties, duplicates
    
    def save_to_data_json(self, properties, additional_data):
        """Save integrated data back to data.json"""
        data = {
            "properties": properties,
            "tenants": additional_data.get("tenants", []),
            "workOrders": additional_data.get("workOrders", [])
        }
        
        try:
            with open(self.data_json_path, 'w', encoding='utf-8') as f:
                json.dump(data, f, indent=2, ensure_ascii=False)
            print(f"✅ Saved {len(properties)} properties to data.json")
        except Exception as e:
            print(f"❌ Error saving data.json: {e}")
    
    def save_to_properties_csv(self, properties):
        """Save integrated data back to properties.csv"""
        try:
            df = pd.DataFrame(properties)
            # Ensure directory exists
            self.properties_csv_path.parent.mkdir(parents=True, exist_ok=True)
            df.to_csv(self.properties_csv_path, index=False)
            print(f"✅ Saved {len(properties)} properties to properties.csv")
        except Exception as e:
            print(f"❌ Error saving properties.csv: {e}")
    
    def generate_integration_report(self, unique_properties, duplicates):
        """Generate detailed integration report"""
        report = {
            'timestamp': datetime.now().isoformat(),
            'total_unique_properties': len(unique_properties),
            'duplicates_found': len(duplicates),
            'properties_by_type': {},
            'revenue_analysis': {
                'total_monthly_revenue': 0,
                'total_purchase_price': 0,
                'properties_with_revenue': 0
            }
        }
        
        # Analyze by property type
        for prop in unique_properties:
            prop_type = prop['type']
            if prop_type not in report['properties_by_type']:
                report['properties_by_type'][prop_type] = 0
            report['properties_by_type'][prop_type] += 1
            
            # Revenue analysis
            report['revenue_analysis']['total_monthly_revenue'] += prop['monthlyRevenue']
            report['revenue_analysis']['total_purchase_price'] += prop['purchasePrice']
            if prop['monthlyRevenue'] > 0:
                report['revenue_analysis']['properties_with_revenue'] += 1
        
        # Save report
        report_path = self.backup_dir / f"integration_report_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
        with open(report_path, 'w') as f:
            json.dump(report, f, indent=2)
        
        return report, report_path
    
    def run_full_integration(self):
        """Execute complete data integration process"""
        print("🚀 DATA.JSON ↔ PROPERTIES.CSV INTEGRATION")
        print("=" * 50)
        
        # 1. Create backups
        print("\n1️⃣ Creating backups...")
        self.create_backups()
        
        # 2. Load both data sources
        print("\n2️⃣ Loading data sources...")
        json_data = self.load_data_json()
        csv_df = self.load_properties_csv()
        
        # 3. Merge and deduplicate
        print("\n3️⃣ Merging and deduplicating...")
        unique_properties, duplicates = self.merge_properties(
            json_data.get('properties', []), 
            csv_df
        )
        
        # 4. Save integrated data to both formats
        print("\n4️⃣ Saving integrated data...")
        self.save_to_data_json(unique_properties, json_data)
        self.save_to_properties_csv(unique_properties)
        
        # 5. Generate integration report
        print("\n5️⃣ Generating integration report...")
        report, report_path = self.generate_integration_report(unique_properties, duplicates)
        
        # 6. Display summary
        print("\n📊 INTEGRATION SUMMARY")
        print("=" * 30)
        print(f"✅ Total unique properties: {report['total_unique_properties']}")
        print(f"🗑️ Duplicates removed: {report['duplicates_found']}")
        print(f"💰 Total monthly revenue: ${report['revenue_analysis']['total_monthly_revenue']:,.2f}")
        print(f"🏠 Total purchase value: ${report['revenue_analysis']['total_purchase_price']:,.2f}")
        print(f"📈 Properties with revenue: {report['revenue_analysis']['properties_with_revenue']}")
        
        print(f"\n📋 Property breakdown by type:")
        for prop_type, count in report['properties_by_type'].items():
            print(f"   {prop_type.capitalize()}: {count}")
        
        print(f"\n📄 Full report saved to: {report_path}")
        
        return unique_properties, report
    
    def sync_json_to_csv(self):
        """One-way sync: data.json → properties.csv"""
        print("🔄 Syncing data.json → properties.csv")
        json_data = self.load_data_json()
        properties = [self.standardize_property_schema(p, "data.json") 
                     for p in json_data.get('properties', [])]
        unique_properties, _ = self.detect_duplicates(properties)
        self.save_to_properties_csv(unique_properties)
        return unique_properties
    
    def sync_csv_to_json(self):
        """One-way sync: properties.csv → data.json"""
        print("🔄 Syncing properties.csv → data.json")
        csv_df = self.load_properties_csv()
        json_data = self.load_data_json()
        
        properties = [self.standardize_property_schema(row.to_dict(), "properties.csv") 
                     for _, row in csv_df.iterrows()]
        unique_properties, _ = self.detect_duplicates(properties)
        
        self.save_to_data_json(unique_properties, json_data)
        return unique_properties

if __name__ == '__main__':
    integrator = DataJsonCsvIntegrator()
    
    if len(sys.argv) > 1:
        command = sys.argv[1].lower()
        if command == 'json-to-csv':
            integrator.sync_json_to_csv()
        elif command == 'csv-to-json':
            integrator.sync_csv_to_json()
        elif command == 'merge':
            integrator.run_full_integration()
        else:
            print("Usage: python data_json_csv_integrator.py [json-to-csv|csv-to-json|merge]")
    else:
        # Run full integration by default
        integrator.run_full_integration()
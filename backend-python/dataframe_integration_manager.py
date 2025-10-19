#!/usr/bin/env python3
"""
DataFrame Integration Manager
=============================

Intelligent integration system for merging multiple DataFrame storage locations
with duplicate elimination, schema standardization, and data quality assurance.

Features:
- Merge dataframe_data/ (legacy) and dataframe_data_compatible/ (current)
- Intelligent duplicate detection across both sources
- Schema standardization to frontend-compatible format
- Data quality validation and reporting
- Backup creation before integration
- Comprehensive integration reporting

Usage:
    python dataframe_integration_manager.py
"""

import pandas as pd
import os
import json
import uuid
from datetime import datetime
from pathlib import Path
import shutil


class DataFrameIntegrationManager:
    """Manages integration of multiple DataFrame storage locations"""
    
    def __init__(self):
        self.base_path = Path(__file__).parent
        self.legacy_path = self.base_path / "dataframe_data"
        self.compatible_path = self.base_path / "dataframe_data_compatible"
        self.backup_path = self.base_path / "dataframe_backups"
        self.integration_log = []
        
        # Frontend-compatible schema (target schema)
        self.target_schema = [
            'id', 'name', 'address', 'type', 'units', 'occupied', 
            'monthlyRevenue', 'purchasePrice', 'created_at', 'updated_at'
        ]
        
        # Schema mapping from legacy to compatible
        self.schema_mapping = {
            'id': 'id',
            'name': 'name', 
            'address': 'address',
            'type': 'type',
            'units': 'units',
            'occupied': 'occupied',
            'monthlyRevenue': 'monthlyRevenue',
            'purchasePrice': 'purchasePrice',
            'value': 'purchasePrice',  # Legacy field maps to purchasePrice
            'created_at': 'created_at',
            'updated_at': 'updated_at'
        }
        
    def log_action(self, action, details=""):
        """Log integration actions with timestamp"""
        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        log_entry = f"[{timestamp}] {action}"
        if details:
            log_entry += f": {details}"
        self.integration_log.append(log_entry)
        print(log_entry)
        
    def create_backup(self):
        """Create backup of both DataFrame locations before integration"""
        self.log_action("BACKUP", "Creating backup of existing data")
        
        # Create backup directory with timestamp
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        backup_dir = self.backup_path / f"integration_backup_{timestamp}"
        backup_dir.mkdir(parents=True, exist_ok=True)
        
        # Backup legacy data
        if self.legacy_path.exists():
            legacy_backup = backup_dir / "dataframe_data_legacy"
            shutil.copytree(self.legacy_path, legacy_backup)
            self.log_action("BACKUP", f"Legacy data backed up to {legacy_backup}")
            
        # Backup compatible data  
        if self.compatible_path.exists():
            compatible_backup = backup_dir / "dataframe_data_compatible"
            shutil.copytree(self.compatible_path, compatible_backup)
            self.log_action("BACKUP", f"Compatible data backed up to {compatible_backup}")
            
        return backup_dir
        
    def load_legacy_properties(self):
        """Load properties from legacy DataFrame storage"""
        legacy_file = self.legacy_path / "properties.csv"
        if not legacy_file.exists():
            self.log_action("LOAD", "No legacy properties file found")
            return pd.DataFrame(columns=self.target_schema)
            
        try:
            df = pd.read_csv(legacy_file)
            self.log_action("LOAD", f"Loaded {len(df)} properties from legacy storage")
            return df
        except Exception as e:
            self.log_action("ERROR", f"Failed to load legacy properties: {str(e)}")
            return pd.DataFrame(columns=self.target_schema)
            
    def load_compatible_properties(self):
        """Load properties from frontend-compatible DataFrame storage"""
        compatible_file = self.compatible_path / "properties.csv"
        if not compatible_file.exists():
            self.log_action("LOAD", "No compatible properties file found")
            return pd.DataFrame(columns=self.target_schema)
            
        try:
            df = pd.read_csv(compatible_file)
            self.log_action("LOAD", f"Loaded {len(df)} properties from compatible storage")
            return df
        except Exception as e:
            self.log_action("ERROR", f"Failed to load compatible properties: {str(e)}")
            return pd.DataFrame(columns=self.target_schema)
            
    def normalize_schema(self, df, source_name):
        """Normalize DataFrame to target frontend-compatible schema"""
        self.log_action("NORMALIZE", f"Normalizing schema for {source_name}")
        
        # Create new DataFrame with target schema
        normalized = pd.DataFrame(columns=self.target_schema)
        
        for target_col in self.target_schema:
            if target_col in df.columns:
                # Direct mapping
                normalized[target_col] = df[target_col]
            elif target_col == 'purchasePrice':
                # Handle legacy 'value' field or missing purchasePrice
                if 'value' in df.columns and df['value'].notna().any():
                    normalized[target_col] = df['value']
                elif 'purchasePrice' in df.columns:
                    normalized[target_col] = df['purchasePrice']
                else:
                    normalized[target_col] = 0.0
            elif target_col == 'monthlyRevenue':
                # Handle missing monthlyRevenue
                if 'monthlyRevenue' in df.columns:
                    normalized[target_col] = df['monthlyRevenue']
                else:
                    normalized[target_col] = 0.0
            else:
                # Set default values for missing columns
                if target_col in ['units', 'occupied']:
                    normalized[target_col] = df.get(target_col, 0)
                elif target_col in ['created_at', 'updated_at']:
                    normalized[target_col] = df.get(target_col, datetime.now().isoformat())
                else:
                    normalized[target_col] = df.get(target_col, "")
                    
        # Ensure data types
        normalized['units'] = pd.to_numeric(normalized['units'], errors='coerce').fillna(0).astype(int)
        normalized['occupied'] = pd.to_numeric(normalized['occupied'], errors='coerce').fillna(0).astype(int)
        normalized['monthlyRevenue'] = pd.to_numeric(normalized['monthlyRevenue'], errors='coerce').fillna(0.0)
        normalized['purchasePrice'] = pd.to_numeric(normalized['purchasePrice'], errors='coerce').fillna(0.0)
        
        self.log_action("NORMALIZE", f"Normalized {len(normalized)} records from {source_name}")
        return normalized
        
    def detect_duplicates_across_sources(self, legacy_df, compatible_df):
        """Detect duplicates across both DataFrame sources"""
        self.log_action("DUPLICATE_DETECTION", "Analyzing duplicates across sources")
        
        # Normalize both DataFrames first
        legacy_normalized = self.normalize_schema(legacy_df, "legacy")
        compatible_normalized = self.normalize_schema(compatible_df, "compatible")
        
        # Add source column for tracking
        legacy_normalized['source'] = 'legacy'
        compatible_normalized['source'] = 'compatible'
        
        # Combine for duplicate analysis
        combined = pd.concat([legacy_normalized, compatible_normalized], ignore_index=True)
        
        # Define duplicate criteria (name + address combination)
        duplicate_groups = combined.groupby(['name', 'address'])
        
        duplicates = []
        unique_records = []
        
        for (name, address), group in duplicate_groups:
            if len(group) > 1:
                # Handle duplicates - prefer compatible source, then most recent
                group_sorted = group.sort_values(['source', 'updated_at'], 
                                               ascending=[True, False])  # compatible first, then newest
                
                # Keep the best record
                best_record = group_sorted.iloc[0].copy()
                best_record['source'] = 'integrated'
                unique_records.append(best_record)
                
                # Log duplicate info
                duplicate_info = {
                    'name': name,
                    'address': address,
                    'count': len(group),
                    'sources': group['source'].tolist(),
                    'kept_source': group_sorted.iloc[0]['source'],
                    'kept_id': group_sorted.iloc[0]['id']
                }
                duplicates.append(duplicate_info)
                
                self.log_action("DUPLICATE", f"Found {len(group)} duplicates for '{name}' at '{address}', kept {group_sorted.iloc[0]['source']} version")
            else:
                # No duplicates, keep the record
                record = group.iloc[0].copy()
                record['source'] = 'integrated'
                unique_records.append(record)
                
        # Create integrated DataFrame
        integrated_df = pd.DataFrame(unique_records)
        integrated_df = integrated_df.drop('source', axis=1)  # Remove source column
        
        self.log_action("DUPLICATE_DETECTION", f"Processed {len(combined)} total records")
        self.log_action("DUPLICATE_DETECTION", f"Found {len(duplicates)} duplicate groups")
        self.log_action("DUPLICATE_DETECTION", f"Final integrated dataset: {len(integrated_df)} unique records")
        
        return integrated_df, duplicates
        
    def validate_integrated_data(self, integrated_df):
        """Validate the integrated DataFrame for data quality"""
        self.log_action("VALIDATION", "Validating integrated data quality")
        
        issues = []
        
        # Check required fields
        required_fields = ['id', 'name', 'address']
        for field in required_fields:
            missing = integrated_df[field].isna().sum()
            if missing > 0:
                issues.append(f"Missing {field}: {missing} records")
                
        # Check data consistency
        negative_units = (integrated_df['units'] < 0).sum()
        if negative_units > 0:
            issues.append(f"Negative units: {negative_units} records")
            
        negative_occupied = (integrated_df['occupied'] < 0).sum()
        if negative_occupied > 0:
            issues.append(f"Negative occupied: {negative_occupied} records")
            
        over_occupied = (integrated_df['occupied'] > integrated_df['units']).sum()
        if over_occupied > 0:
            issues.append(f"Over-occupied properties: {over_occupied} records")
            
        # Log validation results
        if issues:
            for issue in issues:
                self.log_action("VALIDATION_ISSUE", issue)
        else:
            self.log_action("VALIDATION", "All data quality checks passed")
            
        return issues
        
    def save_integrated_data(self, integrated_df):
        """Save the integrated DataFrame to the compatible storage location"""
        self.log_action("SAVE", "Saving integrated data")
        
        # Ensure compatible directory exists
        self.compatible_path.mkdir(exist_ok=True)
        
        # Save integrated properties
        output_file = self.compatible_path / "properties.csv"
        integrated_df.to_csv(output_file, index=False)
        
        self.log_action("SAVE", f"Saved {len(integrated_df)} integrated properties to {output_file}")
        
        return output_file
        
    def generate_integration_report(self, legacy_count, compatible_count, 
                                  integrated_count, duplicates, issues, backup_dir):
        """Generate comprehensive integration report"""
        
        report = {
            "integration_summary": {
                "timestamp": datetime.now().isoformat(),
                "legacy_records": legacy_count,
                "compatible_records": compatible_count, 
                "total_input_records": legacy_count + compatible_count,
                "final_integrated_records": integrated_count,
                "duplicates_removed": (legacy_count + compatible_count) - integrated_count,
                "duplicate_groups": len(duplicates)
            },
            "data_sources": {
                "legacy_path": str(self.legacy_path),
                "compatible_path": str(self.compatible_path),
                "backup_location": str(backup_dir)
            },
            "duplicate_analysis": duplicates,
            "data_quality_issues": issues,
            "integration_log": self.integration_log,
            "schema_info": {
                "target_schema": self.target_schema,
                "schema_mapping": self.schema_mapping
            }
        }
        
        # Save report
        report_file = self.base_path / f"integration_report_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
        with open(report_file, 'w') as f:
            json.dump(report, f, indent=2)
            
        self.log_action("REPORT", f"Integration report saved to {report_file}")
        
        return report, report_file
        
    def run_integration(self):
        """Execute the complete DataFrame integration process"""
        print("=" * 80)
        print("DataFrame Integration Manager")
        print("=" * 80)
        
        # Step 1: Create backup
        backup_dir = self.create_backup()
        
        # Step 2: Load data from both sources
        legacy_df = self.load_legacy_properties()
        compatible_df = self.load_compatible_properties()
        
        legacy_count = len(legacy_df)
        compatible_count = len(compatible_df)
        
        if legacy_count == 0 and compatible_count == 0:
            self.log_action("ERROR", "No data found in either source location")
            return None
            
        # Step 3: Integrate and deduplicate
        integrated_df, duplicates = self.detect_duplicates_across_sources(legacy_df, compatible_df)
        
        # Step 4: Validate integrated data
        issues = self.validate_integrated_data(integrated_df)
        
        # Step 5: Save integrated data
        output_file = self.save_integrated_data(integrated_df)
        
        # Step 6: Generate report
        report, report_file = self.generate_integration_report(
            legacy_count, compatible_count, len(integrated_df), 
            duplicates, issues, backup_dir
        )
        
        # Summary
        print("\n" + "=" * 80)
        print("INTEGRATION COMPLETE")
        print("=" * 80)
        print(f"📊 Input Records: {legacy_count} (legacy) + {compatible_count} (compatible) = {legacy_count + compatible_count}")
        print(f"🎯 Final Records: {len(integrated_df)}")
        print(f"🔄 Duplicates Removed: {(legacy_count + compatible_count) - len(integrated_df)}")
        print(f"📁 Output File: {output_file}")
        print(f"📋 Report File: {report_file}")
        print(f"💾 Backup Location: {backup_dir}")
        
        if issues:
            print(f"⚠️  Data Quality Issues: {len(issues)}")
            for issue in issues[:3]:  # Show first 3 issues
                print(f"   - {issue}")
        else:
            print("✅ Data Quality: All checks passed")
            
        return {
            'integrated_df': integrated_df,
            'output_file': output_file,
            'report_file': report_file,
            'backup_dir': backup_dir,
            'report': report
        }


def main():
    """Main function to run DataFrame integration"""
    try:
        manager = DataFrameIntegrationManager()
        result = manager.run_integration()
        
        if result:
            print("\n🎉 DataFrame integration completed successfully!")
            print(f"   Your unified data is now in: {result['output_file']}")
            print(f"   Full report available at: {result['report_file']}")
            return True
        else:
            print("\n❌ Integration failed - no data found to integrate")
            return False
            
    except Exception as e:
        print(f"\n💥 Integration failed with error: {str(e)}")
        import traceback
        traceback.print_exc()
        return False


if __name__ == "__main__":
    main()
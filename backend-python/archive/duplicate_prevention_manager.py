#!/usr/bin/env python3
"""
Duplicate Prevention and Analysis Utility
Comprehensive solution to prevent and analyze duplicate entries in properties.csv
"""

import pandas as pd
from pathlib import Path
from typing import Dict, List, Set
import logging
from datetime import datetime

class DuplicatePreventionManager:
    """Manages duplicate prevention and analysis for the property DataFrame"""
    
    def __init__(self, csv_path: str = "dataframe_data/properties.csv"):
        self.csv_path = Path(csv_path)
        self.setup_logging()
        
    def setup_logging(self):
        """Setup logging for duplicate tracking"""
        logging.basicConfig(
            level=logging.INFO,
            format='%(asctime)s - %(levelname)s - %(message)s',
            handlers=[
                logging.FileHandler('duplicate_analysis.log'),
                logging.StreamHandler()
            ]
        )
        self.logger = logging.getLogger(__name__)
    
    def analyze_duplicates(self) -> Dict:
        """Comprehensive duplicate analysis"""
        if not self.csv_path.exists():
            return {"error": "CSV file not found"}
        
        df = pd.read_csv(self.csv_path)
        
        analysis = {
            'total_rows': len(df),
            'unique_names': df['name'].nunique(),
            'unique_addresses': df['address'].nunique(),
            'duplicate_analysis': {}
        }
        
        # Find duplicates by different criteria
        name_duplicates = df[df.duplicated(['name'], keep=False)]
        address_duplicates = df[df.duplicated(['address'], keep=False)]
        name_address_duplicates = df[df.duplicated(['name', 'address'], keep=False)]
        
        analysis['duplicate_analysis'] = {
            'by_name': {
                'count': len(name_duplicates),
                'groups': self._group_duplicates(name_duplicates, 'name')
            },
            'by_address': {
                'count': len(address_duplicates),
                'groups': self._group_duplicates(address_duplicates, 'address')
            },
            'by_name_address': {
                'count': len(name_address_duplicates),
                'groups': self._group_duplicates(name_address_duplicates, ['name', 'address'])
            }
        }
        
        return analysis
    
    def _group_duplicates(self, duplicates_df: pd.DataFrame, group_by) -> List[Dict]:
        """Group duplicate entries for analysis"""
        if duplicates_df.empty:
            return []
        
        groups = []
        for name, group in duplicates_df.groupby(group_by):
            group_info = {
                'identifier': name if isinstance(name, str) else f"{name[0]} | {name[1]}",
                'count': len(group),
                'entries': []
            }
            
            for _, row in group.iterrows():
                entry = {
                    'id': row['id'][:8] + '...',
                    'created_at': row['created_at'],
                    'monthlyRevenue': row['monthlyRevenue']
                }
                group_info['entries'].append(entry)
            
            groups.append(group_info)
        
        return groups
    
    def find_duplicate_sources(self) -> Dict:
        """Identify common sources of duplicates"""
        if not self.csv_path.exists():
            return {"error": "CSV file not found"}
        
        df = pd.read_csv(self.csv_path)
        
        sources = {
            'test_script_properties': [],
            'timestamp_patterns': {},
            'creation_frequency': {}
        }
        
        # Identify test/demo properties
        test_keywords = ['test', 'demo', 'sample', 'compatible', 'frontend']
        for keyword in test_keywords:
            matches = df[df['name'].str.contains(keyword, case=False, na=False)]
            if not matches.empty:
                sources['test_script_properties'].extend([
                    {
                        'name': row['name'],
                        'id': row['id'][:8] + '...',
                        'created_at': row['created_at']
                    }
                    for _, row in matches.iterrows()
                ])
        
        # Analyze creation timestamps
        df['created_date'] = pd.to_datetime(df['created_at']).dt.date
        creation_counts = df['created_date'].value_counts()
        
        for date, count in creation_counts.items():
            if count > 2:  # More than 2 properties created on same day
                sources['creation_frequency'][str(date)] = {
                    'count': int(count),
                    'properties': df[df['created_date'] == date]['name'].tolist()
                }
        
        return sources
    
    def clean_duplicates_safe(self, strategy: str = 'keep_latest') -> Dict:
        """Safely clean duplicates with backup"""
        if not self.csv_path.exists():
            return {"error": "CSV file not found"}
        
        # Create backup
        backup_path = self.csv_path.parent / f"properties_backup_{datetime.now().strftime('%Y%m%d_%H%M%S')}.csv"
        df = pd.read_csv(self.csv_path)
        df.to_csv(backup_path, index=False)
        self.logger.info(f"Backup created: {backup_path}")
        
        original_count = len(df)
        
        if strategy == 'keep_latest':
            # Keep the entry with the latest created_at timestamp
            df['created_at_dt'] = pd.to_datetime(df['created_at'])
            df_clean = df.sort_values('created_at_dt').drop_duplicates(['name', 'address'], keep='last')
            df_clean = df_clean.drop('created_at_dt', axis=1)
        
        elif strategy == 'keep_with_data':
            # Keep entries that have more complete data (revenue, price, etc.)
            df['data_completeness'] = (
                df['monthlyRevenue'].fillna(0) + 
                df['purchasePrice'].fillna(0) + 
                df['occupied'].fillna(0)
            )
            df_clean = df.sort_values('data_completeness', ascending=False).drop_duplicates(['name', 'address'], keep='first')
            df_clean = df_clean.drop('data_completeness', axis=1)
        
        else:
            # Default: keep first occurrence
            df_clean = df.drop_duplicates(['name', 'address'], keep='first')
        
        # Save cleaned data
        df_clean.to_csv(self.csv_path, index=False)
        
        cleaned_count = len(df_clean)
        removed_count = original_count - cleaned_count
        
        result = {
            'original_count': original_count,
            'cleaned_count': cleaned_count,
            'removed_count': removed_count,
            'backup_path': str(backup_path),
            'strategy_used': strategy
        }
        
        self.logger.info(f"Cleaned duplicates: {removed_count} removed, {cleaned_count} remaining")
        return result
    
    def generate_prevention_report(self) -> str:
        """Generate a comprehensive prevention report"""
        analysis = self.analyze_duplicates()
        sources = self.find_duplicate_sources()
        
        report = f"""
🔍 DUPLICATE PREVENTION ANALYSIS REPORT
Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}
{'='*60}

📊 OVERALL STATISTICS:
- Total Properties: {analysis.get('total_rows', 0)}
- Unique Names: {analysis.get('unique_names', 0)}
- Unique Addresses: {analysis.get('unique_addresses', 0)}

🚨 DUPLICATE DETECTION:
- Name Duplicates: {analysis['duplicate_analysis']['by_name']['count']}
- Address Duplicates: {analysis['duplicate_analysis']['by_address']['count']} 
- Name+Address Duplicates: {analysis['duplicate_analysis']['by_name_address']['count']}

🧪 SUSPECTED TEST DATA:
"""
        
        for prop in sources.get('test_script_properties', []):
            report += f"- {prop['name']} (ID: {prop['id']}, Created: {prop['created_at']})\n"
        
        report += f"""
📅 HIGH-FREQUENCY CREATION DATES:
"""
        
        for date, info in sources.get('creation_frequency', {}).items():
            report += f"- {date}: {info['count']} properties created\n"
        
        report += f"""
🛡️ PREVENTION RECOMMENDATIONS:
1. Use duplicate prevention in add_property() method
2. Disable auto-execution in test scripts
3. Implement singleton pattern for DataFrame service
4. Add pre-save duplicate checks
5. Use property fingerprinting (name + address)

🧹 CLEANUP STRATEGIES:
- keep_latest: Keep most recently created
- keep_with_data: Keep entries with most complete data
- manual: Review and decide case-by-case
"""
        
        return report
    
    def setup_monitoring(self):
        """Setup monitoring to prevent future duplicates"""
        monitor_script = f"""
# Add this to your DataFrame service initialization:

def _check_for_duplicates_on_load(self):
    if not self.df_properties.empty:
        duplicates = self.df_properties.duplicated(['name', 'address']).sum()
        if duplicates > 0:
            self.logger.warning(f"{{duplicates}} duplicates detected on load!")
            return duplicates
    return 0

# Add this to your add_property method:
def _prevent_duplicate_before_add(self, property_data):
    existing = self.df_properties[
        (self.df_properties['name'] == property_data['name']) & 
        (self.df_properties['address'] == property_data['address'])
    ]
    return not existing.empty
"""
        
        with open('duplicate_prevention_code.py', 'w') as f:
            f.write(monitor_script)
        
        self.logger.info("Monitoring code generated in duplicate_prevention_code.py")

def main():
    """Main function for interactive duplicate management"""
    manager = DuplicatePreventionManager()
    
    print("🔍 Duplicate Prevention Manager")
    print("=" * 50)
    
    while True:
        print("\nOptions:")
        print("1. Analyze duplicates")
        print("2. Find duplicate sources")
        print("3. Clean duplicates (with backup)")
        print("4. Generate prevention report")
        print("5. Setup monitoring")
        print("6. Exit")
        
        choice = input("\nChoose an option (1-6): ").strip()
        
        if choice == '1':
            analysis = manager.analyze_duplicates()
            print("\n📊 Duplicate Analysis:")
            print(f"Total Properties: {analysis.get('total_rows', 0)}")
            print(f"Name+Address Duplicates: {analysis['duplicate_analysis']['by_name_address']['count']}")
        
        elif choice == '2':
            sources = manager.find_duplicate_sources()
            print("\n🧪 Duplicate Sources:")
            if sources.get('test_script_properties'):
                print("Test Script Properties Found:")
                for prop in sources['test_script_properties']:
                    print(f"  - {prop['name']}")
        
        elif choice == '3':
            strategy = input("Strategy (keep_latest/keep_with_data/first): ").strip() or 'keep_latest'
            result = manager.clean_duplicates_safe(strategy)
            print(f"\n🧹 Cleanup Complete:")
            print(f"Removed: {result['removed_count']} duplicates")
            print(f"Remaining: {result['cleaned_count']} properties")
            print(f"Backup: {result['backup_path']}")
        
        elif choice == '4':
            report = manager.generate_prevention_report()
            print(report)
            
            # Save report
            with open('duplicate_prevention_report.txt', 'w') as f:
                f.write(report)
            print("\n📄 Report saved to duplicate_prevention_report.txt")
        
        elif choice == '5':
            manager.setup_monitoring()
            print("✅ Monitoring code generated")
        
        elif choice == '6':
            print("👋 Goodbye!")
            break
        
        else:
            print("❌ Invalid choice, please try again")

if __name__ == "__main__":
    main()
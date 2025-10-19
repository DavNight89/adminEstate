#!/usr/bin/env python3
"""
Duplicate Detection and Cleanup Script
Fixes the multi-layered storage duplicate issue
"""

from test_frontend_compatibility import FrontendCompatibleDataFrameService
import pandas as pd

def analyze_and_fix_duplicates():
    """Analyze DataFrame for duplicates and fix them"""
    
    print("🔍 Analyzing DataFrame for duplicates...")
    
    # Initialize service
    df_service = FrontendCompatibleDataFrameService()
    
    # Get current stats
    stats = df_service.get_data_stats()
    
    print(f"📊 Current Data Statistics:")
    print(f"   Total properties: {stats['total_properties']}")
    print(f"   Unique names: {stats['unique_names']}")
    print(f"   Unique addresses: {stats['unique_addresses']}")
    print(f"   Potential duplicates: {stats['potential_duplicates']}")
    
    if stats['potential_duplicates'] > 0:
        print(f"\n⚠️  Found {stats['potential_duplicates']} potential duplicates!")
        
        # Show duplicate details
        df = df_service.df_properties
        if not df.empty:
            duplicates = df[df.duplicated(['name', 'address'], keep=False)].sort_values(['name', 'address'])
            
            if not duplicates.empty:
                print(f"\n📋 Duplicate entries found:")
                for name in duplicates['name'].unique():
                    name_dups = duplicates[duplicates['name'] == name]
                    print(f"\n  🏠 '{name}' appears {len(name_dups)} times:")
                    for _, row in name_dups.iterrows():
                        print(f"     - ID: {row['id'][:8]}... | Revenue: ${row['monthlyRevenue']} | Created: {row['created_at']}")
        
        # Ask to fix
        response = input("\n🧹 Remove duplicates? (y/n): ").lower().strip()
        
        if response == 'y':
            removed = df_service.remove_duplicates()
            print(f"\n✅ Successfully removed {removed} duplicate entries!")
            
            # Show new stats
            new_stats = df_service.get_data_stats()
            print(f"\n📊 Updated Statistics:")
            print(f"   Total properties: {new_stats['total_properties']}")
            print(f"   Unique names: {new_stats['unique_names']}")
            print(f"   Potential duplicates: {new_stats['potential_duplicates']}")
        else:
            print("\n⏭️  Skipped duplicate removal")
    else:
        print("\n✅ No duplicates detected!")
    
    return stats

def show_data_preview():
    """Show a preview of current data"""
    df_service = FrontendCompatibleDataFrameService()
    
    if df_service.df_properties.empty:
        print("📭 No properties found in DataFrame")
        return
    
    df = df_service.df_properties
    
    print(f"\n📋 Data Preview ({len(df)} properties):")
    print("=" * 80)
    
    for _, row in df.head(10).iterrows():
        print(f"🏠 {row['name']}")
        print(f"   📍 {row['address']}")
        print(f"   💰 Revenue: ${row['monthlyRevenue']:,.2f} | Value: ${row['purchasePrice']:,.2f}")
        print(f"   🏢 {row['units']} units | {row['occupied']} occupied")
        print(f"   📅 Created: {row['created_at']}")
        print()
    
    if len(df) > 10:
        print(f"... and {len(df) - 10} more properties")

if __name__ == "__main__":
    print("🔧 DataFrame Duplicate Analysis & Cleanup Tool")
    print("=" * 50)
    
    try:
        # Analyze duplicates
        stats = analyze_and_fix_duplicates()
        
        # Show data preview
        show_preview = input("\n📋 Show data preview? (y/n): ").lower().strip()
        if show_preview == 'y':
            show_data_preview()
        
        print("\n✅ Analysis complete!")
        
    except Exception as e:
        print(f"\n❌ Error: {e}")
        import traceback
        traceback.print_exc()
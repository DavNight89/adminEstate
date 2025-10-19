"""
DataFrame Debug Script
Simple script to check what's in the DataFrame service
"""
import sys
import os
import pandas as pd

# Add the backend-python directory to the path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

print("🔍 DataFrame Service Debug")
print("=" * 40)

# Check if data directory exists
data_dir = "dataframe_data"
if os.path.exists(data_dir):
    print(f"✅ Data directory exists: {data_dir}")
    
    # List all files
    files = os.listdir(data_dir)
    print(f"📁 Files found: {files}")
    
    # Read properties CSV directly
    if "properties.csv" in files:
        print("\n📊 Properties Data:")
        df = pd.read_csv(f"{data_dir}/properties.csv")
        print(f"Rows: {len(df)}")
        print(f"Columns: {list(df.columns)}")
        print("\nData:")
        print(df.to_string(index=False))
        
        print("\n📈 Quick Analytics:")
        print(f"Total Units: {df['units'].sum()}")
        print(f"Total Value: ${df['value'].sum():,.2f}")
        print(f"Property Types: {df['type'].value_counts().to_dict()}")
    
    # Check other files
    for file in files:
        if file.endswith('.csv') and file != 'properties.csv':
            df = pd.read_csv(f"{data_dir}/{file}")
            print(f"\n📋 {file}: {len(df)} records")
            
else:
    print(f"❌ Data directory not found: {data_dir}")

print("\n" + "=" * 40)
print("🎯 Debug complete!")
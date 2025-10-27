#!/usr/bin/env python3
"""
Simple Sync Checker (No External Dependencies)
============================================

Quick check of your data sources without needing requests module.
"""

import json
import os
from pathlib import Path
from datetime import datetime

def check_data_sources():
    """Check data.json and properties.csv without Flask API calls"""
    
    print("🔍 SIMPLE SYNC CHECK")
    print("=" * 40)
    print(f"Timestamp: {datetime.now()}")
    print()
    
    # Check data.json
    data_json_path = Path(__file__).parent / 'src' / 'data.json'
    print("📄 Checking data.json:")
    
    if data_json_path.exists():
        try:
            with open(data_json_path, 'r') as f:
                data = json.load(f)
            properties = data.get('properties', [])
            print(f"✅ Found {len(properties)} properties in data.json")
            
            if properties:
                for i, prop in enumerate(properties[:2], 1):
                    name = prop.get('name', 'Unknown')
                    revenue = prop.get('monthlyRevenue', 0)
                    print(f"  {i}. {name} - ${revenue:,.2f}/month")
        except Exception as e:
            print(f"❌ Error reading data.json: {e}")
    else:
        print("❌ data.json not found!")
    
    print()
    
    # Check properties.csv
    csv_path = Path(__file__).parent / 'backend-python' / 'dataframe_data' / 'properties.csv'
    print("📊 Checking properties.csv:")
    
    if csv_path.exists():
        try:
            # Simple CSV check without pandas
            with open(csv_path, 'r') as f:
                lines = f.readlines()
            print(f"✅ Found properties.csv with {len(lines)-1} rows (excluding header)")
            
            if len(lines) > 1:
                print("📋 CSV structure looks good")
        except Exception as e:
            print(f"❌ Error reading CSV: {e}")
    else:
        print("❌ properties.csv not found!")
    
    print()
    
    # Check Flask server (basic port check)
    print("🌐 Flask server status:")
    try:
        import socket
        sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        result = sock.connect_ex(('127.0.0.1', 5000))
        sock.close()
        
        if result == 0:
            print("✅ Port 5000 is open (Flask likely running)")
        else:
            print("❌ Port 5000 is closed (Flask not running)")
            print("   Start Flask: python backend-python/app_frontend_compatible.py")
    except Exception as e:
        print(f"⚠️ Could not check Flask status: {e}")
    
    print()
    
    # Summary
    print("💡 QUICK ACTIONS:")
    print("1. Make sure Flask is running on port 5000")
    print("2. Open React app at http://localhost:3000")
    print("3. Add a property to test the sync")
    print("4. Check browser console for sync messages")

if __name__ == '__main__':
    check_data_sources()
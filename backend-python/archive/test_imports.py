"""
Simple Flask test to identify the import issue
"""
print("Testing imports...")

try:
    from flask import Flask, jsonify, request
    print("✅ Flask imported successfully")
except ImportError as e:
    print(f"❌ Flask import failed: {e}")

try:
    from flask_cors import CORS
    print("✅ Flask-CORS imported successfully")
except ImportError as e:
    print(f"❌ Flask-CORS import failed: {e}")

try:
    import pandas
    print("✅ Pandas imported successfully")
except ImportError as e:
    print(f"❌ Pandas import failed: {e}")

try:
    from complete_dataframe_service import get_complete_df_service
    print("✅ Complete DataFrame service imported successfully")
except ImportError as e:
    print(f"❌ Complete DataFrame service import failed: {e}")

try:
    from complete_sync_service import get_complete_sync_service
    print("✅ Complete sync service imported successfully")
except ImportError as e:
    print(f"❌ Complete sync service import failed: {e}")

try:
    from services.pandas_analytics_service import get_pandas_analytics
    print("✅ Pandas analytics service imported successfully")
except ImportError as e:
    print(f"❌ Pandas analytics service import failed: {e}")

print("Import test complete!")
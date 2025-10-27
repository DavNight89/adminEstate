"""
Debug version of app_frontend_compatible.py to find the startup issue
"""
print("🔍 Debug: Starting Flask app initialization...")

try:
    print("1️⃣ Importing Flask modules...")
    from flask import Flask, jsonify, request
    from flask_cors import CORS
    import sys
    from pathlib import Path
    from datetime import datetime
    print("✅ Flask modules imported")

    print("2️⃣ Setting up paths...")
    backend_dir = Path(__file__).parent
    sys.path.append(str(backend_dir))
    print("✅ Paths configured")

    print("3️⃣ Importing custom services...")
    from complete_dataframe_service import get_complete_df_service
    print("✅ DataFrame service imported")
    
    from complete_sync_service import get_complete_sync_service
    print("✅ Sync service imported")
    
    from services.pandas_analytics_service import get_pandas_analytics
    print("✅ Analytics service imported")

    print("4️⃣ Creating Flask app...")
    app = Flask(__name__)
    print("✅ Flask app created")

    print("5️⃣ Configuring CORS...")
    CORS(app, 
         origins=['http://localhost:3000', 'http://127.0.0.1:3000', 'http://localhost:3001'],
         methods=['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
         allow_headers=['Content-Type', 'Authorization', 'Access-Control-Allow-Credentials', 'Accept', 'Origin', 'X-Requested-With'],
         supports_credentials=True)
    print("✅ CORS configured")

    print("6️⃣ Initializing services...")
    df_service = get_complete_df_service()
    print("✅ DataFrame service initialized")
    
    pandas_analytics = get_pandas_analytics(df_service)
    print("✅ Analytics service initialized")
    
    sync_service = get_complete_sync_service()
    print("✅ Sync service initialized")

    print("7️⃣ Adding a test route...")
    @app.route('/api/test')
    def test():
        return jsonify({'status': 'working', 'message': 'Debug Flask app is running!'})

    print("8️⃣ Starting Flask server...")
    print("🚀 All initialization complete - starting server on port 5002...")
    app.run(debug=True, use_reloader=False, port=5002, host='localhost')

except Exception as e:
    print(f"❌ ERROR at step: {e}")
    import traceback
    traceback.print_exc()
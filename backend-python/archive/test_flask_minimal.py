"""
Minimal Flask test to identify startup issues
"""
print("🚀 Starting minimal Flask test...")

try:
    from flask import Flask, jsonify
    from flask_cors import CORS
    
    app = Flask(__name__)
    CORS(app)
    
    @app.route('/test')
    def test():
        return jsonify({'message': 'Flask is working!'})
    
    print("✅ Flask app created successfully")
    print("✅ CORS configured successfully")
    print("✅ Test route added successfully")
    
    # Try to run the server
    print("🔄 Starting Flask server...")
    app.run(debug=False, port=5001, host='localhost')
    
except Exception as e:
    print(f"❌ Flask startup error: {e}")
    import traceback
    traceback.print_exc()
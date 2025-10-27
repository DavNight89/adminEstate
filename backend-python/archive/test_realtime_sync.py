"""
Real-Time DataFrame Sync Demo
Shows how pandas DataFrame changes automatically sync with frontend
"""
import sys
import os
import asyncio
import time

# Add the backend-python directory to the path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from services.dataframe_sync_service import DataFrameSyncService, FrontendSimulator

async def demo_real_time_sync():
    """Demonstrate real-time DataFrame ↔ Frontend sync"""
    
    print("🔄 REAL-TIME DATAFRAME SYNC DEMO")
    print("=" * 50)
    
    # Initialize sync service
    sync_service = DataFrameSyncService()
    
    # Initialize frontend simulator
    frontend = FrontendSimulator(sync_service)
    
    print("\n📱 Frontend is now listening for changes...")
    time.sleep(1)
    
    # ===== DEMO 1: CREATE OPERATIONS =====
    print("\n1️⃣ CREATING PROPERTIES...")
    print("-" * 30)
    
    property1_id = sync_service.add_property({
        'name': 'Sync Demo Apartments',
        'address': '123 Real-Time St',
        'type': 'residential',
        'units': 20,
        'value': 750000
    })
    time.sleep(0.5)
    
    property2_id = sync_service.add_property({
        'name': 'Live Update Complex',
        'address': '456 Sync Ave',
        'type': 'commercial',
        'units': 15,
        'value': 900000
    })
    time.sleep(0.5)
    
    # ===== DEMO 2: UPDATE OPERATIONS =====
    print("\n2️⃣ UPDATING PROPERTIES...")
    print("-" * 30)
    
    sync_service.update_property(property1_id, {
        'occupied': 18,
        'value': 800000
    })
    time.sleep(0.5)
    
    sync_service.update_property(property2_id, {
        'occupied': 12,
        'units': 16  # Added a unit
    })
    time.sleep(0.5)
    
    # ===== DEMO 3: BULK OPERATIONS =====
    print("\n3️⃣ BULK OPERATIONS...")
    print("-" * 30)
    
    # Bulk update all residential properties
    sync_service.bulk_update_properties(
        condition="type == 'residential'",
        updates={'occupied': 19}  # High occupancy for residential
    )
    time.sleep(0.5)
    
    # ===== DEMO 4: PANDAS CALCULATIONS =====
    print("\n4️⃣ PANDAS CALCULATIONS...")
    print("-" * 30)
    
    # Recalculate metrics (this will trigger frontend update)
    sync_service.recalculate_metrics()
    time.sleep(0.5)
    
    # ===== DEMO 5: ADVANCED PANDAS OPERATIONS =====
    print("\n5️⃣ ADVANCED PANDAS OPERATIONS...")
    print("-" * 40)
    
    # Access the DataFrame directly for complex operations
    df = sync_service.df_properties
    
    # Complex pandas operation: Calculate portfolio metrics
    if not df.empty:
        print("📊 Performing complex pandas analysis...")
        
        # Calculate new metrics
        df['roi_estimate'] = (df['occupied'] * 1500 * 12) / df['value'] * 100
        df['efficiency_score'] = df['occupied'] / df['units'] * 100
        
        # Find high-performing properties
        high_performers = df[df['efficiency_score'] > 90]
        
        print(f"   Found {len(high_performers)} high-performing properties")
        
        # Update the properties with new calculated fields
        for idx, row in high_performers.iterrows():
            sync_service.update_property(row['id'], {
                'roi_estimate': row['roi_estimate'],
                'efficiency_score': row['efficiency_score']
            })
            time.sleep(0.2)
    
    # ===== DEMO 6: DELETE OPERATION =====
    print("\n6️⃣ DELETE OPERATION...")
    print("-" * 30)
    
    # Delete one property
    sync_service.delete_property(property2_id)
    time.sleep(0.5)
    
    # ===== DEMO 7: SHOW FINAL STATE =====
    print("\n7️⃣ FINAL STATE...")
    print("-" * 25)
    
    # Get final analytics
    analytics = sync_service.get_analytics_for_frontend()
    print("📊 Final Analytics:")
    for key, value in analytics.items():
        if isinstance(value, (int, float)) and 'value' in key:
            print(f"   {key}: ${value:,.0f}")
        elif isinstance(value, float):
            print(f"   {key}: {value:.1f}")
        else:
            print(f"   {key}: {value}")
    
    # Show change history
    print("\n📜 Recent Changes:")
    history = sync_service.get_change_history(limit=5)
    for change in history[-5:]:
        print(f"   {change['timestamp'][:19]} - {change['type']} on {change['table']}")
    
    print("\n" + "=" * 50)
    print("🎉 REAL-TIME SYNC DEMO COMPLETE!")
    print("Key Benefits:")
    print("✅ Automatic frontend updates")
    print("✅ Change history tracking")
    print("✅ Pandas operations sync instantly")
    print("✅ No manual refresh needed")

def demo_sync_api_endpoints():
    """Show how this would work with API endpoints"""
    
    print("\n🌐 API INTEGRATION EXAMPLE")
    print("=" * 40)
    
    print("""
    # FastAPI endpoint that uses sync service
    @router.put("/properties/{property_id}")
    async def update_property(property_id: str, updates: dict):
        # This automatically notifies frontend!
        sync_service.update_property(property_id, updates)
        return {"message": "Property updated", "synced": True}
    
    # Pandas operation endpoint
    @router.post("/analytics/recalculate")
    async def recalculate_analytics():
        # Complex pandas operations with auto-sync
        sync_service.recalculate_metrics()
        return sync_service.get_analytics_for_frontend()
    
    # WebSocket for real-time updates
    @app.websocket("/ws")
    async def websocket_endpoint(websocket: WebSocket):
        await websocket.accept()
        
        def send_update(change):
            asyncio.create_task(
                websocket.send_json(change)
            )
        
        sync_service.add_change_listener(send_update)
    """)

if __name__ == "__main__":
    asyncio.run(demo_real_time_sync())
    demo_sync_api_endpoints()
"""
DataFrame Service Test
Test the DataFrame-based data storage system
"""
import asyncio
import sys
import os

# Add the backend-python directory to the path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from services.dataframe_service import df_service
from models.schemas import PropertyCreate

async def test_dataframe_service():
    """Test the DataFrame service functionality"""
    print("🧪 Testing DataFrame Service")
    print("=" * 50)
    
    # Test 1: Create some properties
    print("\n1️⃣ Creating test properties...")
    
    properties_to_create = [
        PropertyCreate(
            name="Sunset Apartments",
            address="123 Sunset Blvd",
            type="residential",
            units=24,
            value=850000.0
        ),
        PropertyCreate(
            name="Downtown Office Complex",
            address="456 Main Street",
            type="commercial",
            units=12,
            value=1200000.0
        ),
        PropertyCreate(
            name="Riverside Condos",
            address="789 River Road",
            type="mixed",
            units=18,
            value=950000.0
        )
    ]
    
    created_properties = []
    for prop_data in properties_to_create:
        property_obj = await df_service.create_property(prop_data)
        created_properties.append(property_obj)
        print(f"✅ Created: {property_obj.name} (ID: {property_obj.id})")
    
    # Test 2: Retrieve properties
    print("\n2️⃣ Retrieving all properties...")
    all_properties = await df_service.get_properties()
    print(f"📋 Found {len(all_properties)} properties:")
    for prop in all_properties:
        print(f"  - {prop.name}: {prop.units} units, ${prop.value:,.2f}")
    
    # Test 3: Search properties
    print("\n3️⃣ Searching properties...")
    search_results = await df_service.get_properties(search="apartment")
    print(f"🔍 Search for 'apartment' found {len(search_results)} results:")
    for prop in search_results:
        print(f"  - {prop.name}")
    
    # Test 4: Get specific property
    print("\n4️⃣ Getting specific property...")
    if created_properties:
        first_property = created_properties[0]
        retrieved_prop = await df_service.get_property(first_property.id)
        if retrieved_prop:
            print(f"🎯 Retrieved: {retrieved_prop.name}")
        else:
            print("❌ Property not found")
    
    # Test 5: Analytics
    print("\n5️⃣ Property Analytics...")
    analytics = df_service.get_property_analytics()
    print("📊 Analytics Results:")
    for key, value in analytics.items():
        if key != "revenue_by_property":  # Skip detailed list for cleaner output
            print(f"  {key}: {value}")
    
    # Test 6: Occupancy trends
    print("\n6️⃣ Occupancy Trends...")
    trends = df_service.get_occupancy_trends()
    print("📈 Occupancy Trends:")
    for key, value in trends.items():
        if key != "properties_by_occupancy":  # Skip detailed list
            print(f"  {key}: {value}")
    
    # Test 7: Data summary
    print("\n7️⃣ Data Summary...")
    summary = df_service.get_data_summary()
    print("📋 Data Summary:")
    for table_name, table_info in summary.items():
        print(f"  {table_name}: {table_info['count']} records")
    
    # Test 8: Export to Excel
    print("\n8️⃣ Exporting to Excel...")
    success = df_service.export_to_excel("test_export.xlsx")
    if success:
        print("✅ Data exported successfully")
    else:
        print("❌ Export failed")
    
    print("\n" + "=" * 50)
    print("🎉 DataFrame Service test completed!")
    print(f"📁 Data saved in: {df_service.data_dir}")
    print("📊 Check the CSV files and Excel export")

if __name__ == "__main__":
    asyncio.run(test_dataframe_service())
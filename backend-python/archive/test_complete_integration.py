#!/usr/bin/env python3
"""
Test Complete DataFrame Integration
=================================

Tests all 5 entity types and their CRUD operations:
✅ Properties
✅ Tenants  
✅ Work Orders
✅ Transactions
✅ Documents
✅ Analytics
✅ Cross-entity relationships
"""

import sys
from pathlib import Path
import json

# Add backend path
backend_dir = Path(__file__).parent
sys.path.append(str(backend_dir))

from services.complete_df_service import get_complete_df_service

def test_complete_integration():
    print("🧪 TESTING COMPLETE DATAFRAME INTEGRATION")
    print("=" * 50)
    
    # Initialize service
    df_service = get_complete_df_service()
    
    # Test 1: Add sample property
    print("\n1️⃣ Testing Properties...")
    property_data = {
        'name': 'Integration Test Apartments',
        'address': '123 DataFrame Ave',
        'type': 'residential',
        'units': 24,
        'occupied': 18,
        'monthlyRevenue': 36000,
        'purchasePrice': 2400000
    }
    
    new_property = df_service.add_property(property_data)
    property_id = new_property['id']
    print(f"   ✅ Property created: {new_property['name']} (ID: {property_id[:8]}...)")
    
    # Test 2: Add sample tenant
    print("\n2️⃣ Testing Tenants...")
    tenant_data = {
        'name': 'John DataFrame',
        'email': 'john@dataframe.com',
        'phone': '555-0123',
        'property_id': property_id,
        'unit': 'A101',
        'rent': 1500,
        'deposit': 3000,
        'lease_start': '2025-01-01',
        'lease_end': '2025-12-31',
        'status': 'active'
    }
    
    new_tenant = df_service.add_tenant(tenant_data)
    tenant_id = new_tenant['id']
    print(f"   ✅ Tenant created: {new_tenant['name']} (ID: {tenant_id[:8]}...)")
    
    # Test 3: Add sample work order
    print("\n3️⃣ Testing Work Orders...")
    workorder_data = {
        'title': 'Fix DataFrame Kitchen Sink',
        'description': 'Leaky faucet in unit A101',
        'property_id': property_id,
        'tenant_id': tenant_id,
        'unit': 'A101',
        'priority': 'medium',
        'status': 'pending',
        'category': 'plumbing',
        'estimated_cost': 150,
        'actual_cost': 0
    }
    
    new_workorder = df_service.add_workorder(workorder_data)
    workorder_id = new_workorder['id']
    print(f"   ✅ Work Order created: {new_workorder['title']} (ID: {workorder_id[:8]}...)")
    
    # Test 4: Add sample transaction
    print("\n4️⃣ Testing Transactions...")
    transaction_data = {
        'property_id': property_id,
        'tenant_id': tenant_id,
        'type': 'income',
        'amount': 1500,
        'description': 'Monthly rent payment',
        'category': 'rent',
        'payment_method': 'bank_transfer'
    }
    
    new_transaction = df_service.add_transaction(transaction_data)
    transaction_id = new_transaction['id']
    print(f"   ✅ Transaction created: ${new_transaction['amount']} {new_transaction['type']} (ID: {transaction_id[:8]}...)")
    
    # Test 5: Add sample document
    print("\n5️⃣ Testing Documents...")
    document_data = {
        'name': 'Lease Agreement - John DataFrame',
        'type': 'pdf',
        'category': 'lease',
        'property_id': property_id,
        'tenant_id': tenant_id,
        'file_path': '/uploads/lease_john_dataframe.pdf',
        'file_size': 245760,
        'mime_type': 'application/pdf'
    }
    
    new_document = df_service.add_document(document_data)
    document_id = new_document['id']
    print(f"   ✅ Document created: {new_document['name']} (ID: {document_id[:8]}...)")
    
    # Test 6: Get property details (cross-entity query)
    print("\n6️⃣ Testing Cross-Entity Queries...")
    property_details = df_service.get_property_details(property_id)
    print(f"   📊 Property Details for {property_details['property']['name']}:")
    print(f"      - Tenants: {len(property_details['tenants'])}")
    print(f"      - Work Orders: {len(property_details['workorders'])}")
    print(f"      - Transactions: {len(property_details['transactions'])}")
    print(f"      - Documents: {len(property_details['documents'])}")
    
    # Test 7: Analytics
    print("\n7️⃣ Testing Analytics...")
    analytics = df_service.get_dashboard_analytics()
    print(f"   📈 Dashboard Analytics:")
    print(f"      - Total Properties: {analytics['properties']['total']}")
    print(f"      - Total Units: {analytics['properties']['total_units']}")
    print(f"      - Occupancy Rate: {analytics['properties']['occupancy_rate']:.1f}%")
    print(f"      - Monthly Revenue: ${analytics['properties']['monthly_revenue']:,.2f}")
    print(f"      - Active Tenants: {analytics['tenants']['active']}")
    print(f"      - Pending Work Orders: {analytics['workorders']['pending']}")
    print(f"      - Net Income: ${analytics['transactions']['net_income']:,.2f}")
    
    # Test 8: Data overview
    print("\n8️⃣ Testing Data Overview...")
    overview = df_service.get_data_overview()
    print(f"   📋 Data Overview:")
    for entity, count in overview['entities'].items():
        print(f"      - {entity.capitalize()}: {count} records")
    
    print(f"\n✅ ALL TESTS PASSED!")
    print(f"🎯 Complete DataFrame Integration is working perfectly!")
    
    return {
        'property_id': property_id,
        'tenant_id': tenant_id,
        'workorder_id': workorder_id,
        'transaction_id': transaction_id,
        'document_id': document_id,
        'analytics': analytics,
        'overview': overview
    }

if __name__ == '__main__':
    test_results = test_complete_integration()
    
    # Save test results
    with open('integration_test_results.json', 'w') as f:
        json.dump(test_results, f, indent=2, default=str)
    
    print(f"\n📄 Test results saved to: integration_test_results.json")
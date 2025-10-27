"""
Frontend-Compatible DataFrame Service
Uses the SAME field names as your existing frontend to avoid conflicts
"""
import pandas as pd
import uuid
from datetime import datetime
from pathlib import Path
from typing import Dict, List

class FrontendCompatibleDataFrameService:
    """
    DataFrame service that uses the EXACT same schema as your existing frontend
    Field names: monthlyRevenue, purchasePrice (NOT value)
    """
    
    def __init__(self, data_dir: str = "dataframe_data"):
        self.data_dir = Path(data_dir)
        self.data_dir.mkdir(exist_ok=True)
        
        # Use EXACT frontend schema
        self.df_properties = pd.DataFrame()
        self._load_data()
        
        # 📊 Show initialization stats
        stats = self.get_data_stats()
        print(f"🔄 Frontend-Compatible DataFrame service initialized")
        print(f"   📋 Loaded: {stats['total_properties']} properties")
        if stats['potential_duplicates'] > 0:
            print(f"   ⚠️ Warning: {stats['potential_duplicates']} potential duplicates detected")
    
    def _load_data(self):
        """Load data with EXACT frontend schema"""
        try:
            if (self.data_dir / "properties.csv").exists():
                self.df_properties = pd.read_csv(self.data_dir / "properties.csv")
                print(f"✅ Loaded {len(self.df_properties)} properties")
            else:
                # Use EXACT frontend column names
                self.df_properties = pd.DataFrame(columns=[
                    'id', 'name', 'address', 'type', 'units', 'occupied', 
                    'monthlyRevenue', 'purchasePrice', 'created_at', 'updated_at'
                ])
        except Exception as e:
            print(f"⚠️ Error loading data: {e}")
    
    def _save_data(self):
        """Save data to CSV"""
        try:
            self.df_properties.to_csv(self.data_dir / "properties.csv", index=False)
        except Exception as e:
            print(f"❌ Error saving data: {e}")
    
    def add_property(self, property_data: Dict):
        """Add property with EXACT frontend schema - PREVENTS DUPLICATES"""
        
        # 🛡️ DUPLICATE PREVENTION: Check if property already exists
        existing = self.df_properties[
            (self.df_properties['name'] == property_data['name']) & 
            (self.df_properties['address'] == property_data['address'])
        ]
        
        if not existing.empty:
            print(f"⚠️ Property '{property_data['name']}' already exists - skipping duplicate")
            return existing.iloc[0].to_dict()
        
        property_id = str(uuid.uuid4())
        now = datetime.now().isoformat()
        
        new_row = {
            'id': property_id,
            'name': property_data['name'],
            'address': property_data['address'],
            'type': property_data['type'],
            'units': property_data['units'],
            'occupied': property_data.get('occupied', 0),
            'monthlyRevenue': property_data.get('monthlyRevenue', 0.0),  # ✅ Frontend field
            'purchasePrice': property_data.get('purchasePrice', 0.0),   # ✅ Frontend field
            'created_at': now,
            'updated_at': now
        }
        
        # Add to DataFrame
        self.df_properties = pd.concat([
            self.df_properties,
            pd.DataFrame([new_row])
        ], ignore_index=True)
        
        self._save_data()
        print(f"✅ Added NEW property: {property_data['name']}")
        return new_row
    
    def get_properties_for_frontend(self) -> List[Dict]:
        """Get properties in EXACT frontend format - no conversion needed!"""
        if self.df_properties.empty:
            return []
        
        return self.df_properties.to_dict('records')
    
    def remove_duplicates(self):
        """Remove duplicate entries based on name and address"""
        original_count = len(self.df_properties)
        
        if original_count == 0:
            return
        
        # Remove duplicates based on name + address combination
        self.df_properties = self.df_properties.drop_duplicates(
            subset=['name', 'address'], 
            keep='last'  # Keep the most recent entry
        ).reset_index(drop=True)
        
        new_count = len(self.df_properties)
        duplicates_removed = original_count - new_count
        
        if duplicates_removed > 0:
            print(f"🧹 Removed {duplicates_removed} duplicate entries")
            self._save_data()
        else:
            print("✅ No duplicates found")
        
        return duplicates_removed
    
    def get_data_stats(self):
        """Get statistics about current data"""
        return {
            'total_properties': len(self.df_properties),
            'unique_names': self.df_properties['name'].nunique() if not self.df_properties.empty else 0,
            'unique_addresses': self.df_properties['address'].nunique() if not self.df_properties.empty else 0,
            'potential_duplicates': len(self.df_properties) - self.df_properties['name'].nunique() if not self.df_properties.empty else 0
        }
    
    def update_property(self, property_id: str, updates: Dict):
        """Update property with frontend-compatible fields"""
        mask = self.df_properties['id'] == property_id
        if not mask.any():
            raise ValueError(f"Property {property_id} not found")
        
        # Apply updates directly - no field conversion needed
        for column, value in updates.items():
            if column in self.df_properties.columns:
                self.df_properties.loc[mask, column] = value
        
        # Update timestamp
        self.df_properties.loc[mask, 'updated_at'] = datetime.now().isoformat()
        self._save_data()
        
        print(f"✅ Updated property: {property_id}")
    
    def get_analytics(self) -> Dict:
        """Get analytics using frontend field names"""
        if self.df_properties.empty:
            return {"message": "No data available"}
        
        return {
            "total_properties": len(self.df_properties),
            "total_units": int(self.df_properties['units'].sum()),
            "total_occupied": int(self.df_properties['occupied'].sum()),
            "total_monthly_revenue": float(self.df_properties['monthlyRevenue'].sum()),  # ✅ Frontend field
            "total_purchase_price": float(self.df_properties['purchasePrice'].sum()),    # ✅ Frontend field
            "avg_purchase_price": float(self.df_properties['purchasePrice'].mean()),     # ✅ Frontend field
            "occupancy_rate": float((self.df_properties['occupied'].sum() / self.df_properties['units'].sum() * 100)) if self.df_properties['units'].sum() > 0 else 0,
            "property_types": self.df_properties['type'].value_counts().to_dict()
        }

# Test the compatible service
def test_frontend_compatibility():
    """Test that DataFrame service works with your existing frontend data"""
    service = FrontendCompatibleDataFrameService()
    
    # Add property using EXACT frontend schema
    property_data = {
        'name': 'Frontend Compatible Property',
        'address': '123 Compatible St',
        'type': 'residential',
        'units': 20,
        'monthlyRevenue': 15000.0,  # ✅ Frontend field name
        'purchasePrice': 800000.0   # ✅ Frontend field name
    }
    
    result = service.add_property(property_data)
    print("✅ Property added with frontend schema:")
    print(f"   monthlyRevenue: ${result['monthlyRevenue']:,.2f}")
    print(f"   purchasePrice: ${result['purchasePrice']:,.2f}")
    
    # Get analytics with frontend fields
    analytics = service.get_analytics()
    print("\n📊 Analytics with frontend fields:")
    print(f"   total_monthly_revenue: ${analytics['total_monthly_revenue']:,.2f}")
    print(f"   total_purchase_price: ${analytics['total_purchase_price']:,.2f}")
    
    return service

if __name__ == "__main__":
    print("🧪 Frontend Compatibility Test Available")
    print("Run test_frontend_compatibility() manually to avoid duplicates")
    # test_frontend_compatibility()  # Commented out to prevent auto-execution
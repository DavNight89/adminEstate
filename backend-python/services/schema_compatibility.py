"""""
Schema Compatibility Service
Handles the mismatch between backend schema (value) and frontend schema (monthlyRevenue, purchasePrice)
"""
import pandas as pd
from datetime import datetime
import uuid
from pathlib import Path

def backend_to_frontend_property(backend_prop):
    """Convert backend Property schema to frontend-compatible format"""
    if hasattr(backend_prop, 'value'):
        # Backend uses 'value', frontend expects 'purchasePrice'
        return {
            'id': backend_prop.id,
            'name': backend_prop.name,
            'address': backend_prop.address,
            'type': backend_prop.type,
            'units': backend_prop.units,
            'occupied': backend_prop.occupied,
            'monthlyRevenue': 0.0,  # Calculated separately from tenants
            'purchasePrice': backend_prop.value,  # Map value → purchasePrice
            'created_at': backend_prop.created_at,
            'updated_at': backend_prop.updated_at
        }
    else:
        # Already in frontend format
        return backend_prop

def frontend_to_backend_property(frontend_prop):
    """Convert frontend property format to backend schema"""
    return {
        'name': frontend_prop['name'],
        'address': frontend_prop['address'],
        'type': frontend_prop['type'],
        'units': frontend_prop['units'],
        'occupied': frontend_prop.get('occupied', 0),
        'value': frontend_prop.get('purchasePrice', 0.0)  # Map purchasePrice → value
    }

class CompatibleDataFrameService:
    """
    DataFrame service that maintains compatibility with existing frontend
    """
    
    def __init__(self, data_dir: str = "dataframe_data"):
        self.data_dir = Path(data_dir)
        self.data_dir.mkdir(exist_ok=True)
        
        # Use frontend-compatible column names
        self.df_properties = pd.DataFrame()
        self._load_data()
        
        print("🔄 Compatible DataFrame service initialized")
    
    def _load_data(self):
        """Load data with frontend-compatible schema"""
        try:
            if (self.data_dir / "properties.csv").exists():
                self.df_properties = pd.read_csv(self.data_dir / "properties.csv")
                print(f"✅ Loaded {len(self.df_properties)} properties")
            else:
                # Use frontend-compatible columns
                self.df_properties = pd.DataFrame(columns=[
                    'id', 'name', 'address', 'type', 'units', 'occupied', 
                    'monthlyRevenue', 'purchasePrice', 'created_at', 'updated_at'
                ])
        except Exception as e:
            print(f"⚠️ Error loading data: {e}")
    
    def add_property_frontend_compatible(self, property_data):
        """Add property using frontend schema (monthlyRevenue, purchasePrice)"""
        property_id = str(uuid.uuid4())
        now = datetime.now().isoformat()
        
        new_row = {
            'id': property_id,
            'name': property_data['name'],
            'address': property_data['address'],
            'type': property_data['type'],
            'units': property_data['units'],
            'occupied': property_data.get('occupied', 0),
            'monthlyRevenue': property_data.get('monthlyRevenue', 0.0),
            'purchasePrice': property_data.get('purchasePrice', 0.0),
            'created_at': now,
            'updated_at': now
        }
        
        # Add to DataFrame
        self.df_properties = pd.concat([
            self.df_properties,
            pd.DataFrame([new_row])
        ], ignore_index=True)
        
        self._save_data()
        return new_row
    
    def get_properties_frontend_format(self):
        """Get properties in the exact format your frontend expects"""
        if self.df_properties.empty:
            return []
        
        return self.df_properties.to_dict('records')

# Global compatible service
compatible_df_service = CompatibleDataFrameService()
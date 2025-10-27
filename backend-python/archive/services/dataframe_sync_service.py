"""
Real-Time DataFrame Sync Service
Syncs pandas DataFrame changes with frontend in real-time
"""
import pandas as pd
import asyncio
import json
from typing import Dict, List, Callable, Any
from datetime import datetime
import uuid
from pathlib import Path

class DataFrameSyncService:
    """
    Service that syncs DataFrame changes with frontend
    Features:
    - Real-time change notifications
    - Automatic frontend updates
    - Change history tracking
    - Rollback capabilities
    """
    
    def __init__(self, data_dir: str = "dataframe_data"):
        self.data_dir = Path(data_dir)
        self.data_dir.mkdir(exist_ok=True)
        
        # Initialize DataFrames
        self.df_properties = pd.DataFrame()
        self.df_tenants = pd.DataFrame()
        self.df_workorders = pd.DataFrame()
        
        # Change tracking
        self.change_listeners = []
        self.change_history = []
        
        # Load existing data
        self._load_data()
        
        print("🔄 DataFrame Sync Service initialized")
    
    def _load_data(self):
        """Load data from CSV files"""
        try:
            if (self.data_dir / "properties.csv").exists():
                self.df_properties = pd.read_csv(self.data_dir / "properties.csv")
                print(f"✅ Loaded {len(self.df_properties)} properties")
            else:
                self.df_properties = pd.DataFrame(columns=[
                    'id', 'name', 'address', 'type', 'units', 'occupied', 
                    'value', 'created_at', 'updated_at'
                ])
        except Exception as e:
            print(f"⚠️ Error loading data: {e}")
    
    def add_change_listener(self, callback: Callable):
        """Add a callback function that gets called when data changes"""
        self.change_listeners.append(callback)
    
    def _notify_change(self, change_type: str, table: str, data: Dict, old_data: Dict = None):
        """Notify all listeners about data changes"""
        change = {
            'id': str(uuid.uuid4()),
            'timestamp': datetime.now().isoformat(),
            'type': change_type,  # 'create', 'update', 'delete'
            'table': table,
            'data': data,
            'old_data': old_data
        }
        
        # Add to history
        self.change_history.append(change)
        
        # Notify all listeners
        for listener in self.change_listeners:
            try:
                listener(change)
            except Exception as e:
                print(f"❌ Error in change listener: {e}")
        
        # Auto-save
        self._save_data()
    
    def _save_data(self):
        """Save DataFrames to CSV"""
        try:
            self.df_properties.to_csv(self.data_dir / "properties.csv", index=False)
        except Exception as e:
            print(f"❌ Error saving data: {e}")
    
    # ===== PANDAS OPERATIONS WITH FRONTEND SYNC =====
    
    def add_property(self, property_data: Dict) -> str:
        """Add property with automatic frontend notification"""
        property_id = str(uuid.uuid4())
        now = datetime.now().isoformat()
        
        new_row = {
            'id': property_id,
            'name': property_data['name'],
            'address': property_data['address'],
            'type': property_data['type'],
            'units': property_data['units'],
            'occupied': property_data.get('occupied', 0),
            'value': property_data.get('value', 0.0),
            'created_at': now,
            'updated_at': now
        }
        
        # Add to DataFrame
        self.df_properties = pd.concat([
            self.df_properties,
            pd.DataFrame([new_row])
        ], ignore_index=True)
        
        # Notify frontend
        self._notify_change('create', 'properties', new_row)
        
        print(f"✅ Added property: {property_data['name']}")
        return property_id
    
    def update_property(self, property_id: str, updates: Dict):
        """Update property with automatic frontend notification"""
        # Find the property
        mask = self.df_properties['id'] == property_id
        if not mask.any():
            raise ValueError(f"Property {property_id} not found")
        
        # Get old data
        old_row = self.df_properties[mask].iloc[0].to_dict()
        
        # Apply updates
        for column, value in updates.items():
            if column in self.df_properties.columns:
                self.df_properties.loc[mask, column] = value
        
        # Update timestamp
        self.df_properties.loc[mask, 'updated_at'] = datetime.now().isoformat()
        
        # Get new data
        new_row = self.df_properties[mask].iloc[0].to_dict()
        
        # Notify frontend
        self._notify_change('update', 'properties', new_row, old_row)
        
        print(f"✅ Updated property: {property_id}")
    
    def delete_property(self, property_id: str):
        """Delete property with automatic frontend notification"""
        # Find the property
        mask = self.df_properties['id'] == property_id
        if not mask.any():
            raise ValueError(f"Property {property_id} not found")
        
        # Get data before deletion
        deleted_row = self.df_properties[mask].iloc[0].to_dict()
        
        # Remove from DataFrame
        self.df_properties = self.df_properties[~mask].reset_index(drop=True)
        
        # Notify frontend
        self._notify_change('delete', 'properties', deleted_row)
        
        print(f"✅ Deleted property: {property_id}")
    
    # ===== PANDAS BULK OPERATIONS WITH SYNC =====
    
    def bulk_update_properties(self, condition: str, updates: Dict):
        """Bulk update properties matching condition"""
        # Apply condition using pandas query
        mask = self.df_properties.query(condition).index
        
        if len(mask) == 0:
            print(f"⚠️ No properties match condition: {condition}")
            return
        
        # Store old data
        old_data = self.df_properties.loc[mask].to_dict('records')
        
        # Apply updates
        for column, value in updates.items():
            if column in self.df_properties.columns:
                self.df_properties.loc[mask, column] = value
        
        # Update timestamp
        self.df_properties.loc[mask, 'updated_at'] = datetime.now().isoformat()
        
        # Get new data
        new_data = self.df_properties.loc[mask].to_dict('records')
        
        # Notify frontend for each changed row
        for old_row, new_row in zip(old_data, new_data):
            self._notify_change('update', 'properties', new_row, old_row)
        
        print(f"✅ Bulk updated {len(mask)} properties")
    
    def recalculate_metrics(self):
        """Recalculate derived metrics and sync with frontend"""
        if self.df_properties.empty:
            return
        
        # Calculate new metrics
        self.df_properties['occupancy_rate'] = (
            self.df_properties['occupied'] / self.df_properties['units'] * 100
        ).fillna(0)
        
        self.df_properties['value_per_unit'] = (
            self.df_properties['value'] / self.df_properties['units']
        ).fillna(0)
        
        # Notify about recalculation
        self._notify_change('recalculate', 'properties', {
            'message': 'Metrics recalculated',
            'affected_rows': len(self.df_properties)
        })
        
        print("✅ Metrics recalculated")
    
    # ===== FRONTEND DATA METHODS =====
    
    def get_properties_for_frontend(self) -> List[Dict]:
        """Get properties in frontend-compatible format"""
        if self.df_properties.empty:
            return []
        
        return self.df_properties.to_dict('records')
    
    def get_analytics_for_frontend(self) -> Dict:
        """Get analytics data for frontend"""
        if self.df_properties.empty:
            return {"message": "No data available"}
        
        return {
            "total_properties": len(self.df_properties),
            "total_units": int(self.df_properties['units'].sum()),
            "total_value": float(self.df_properties['value'].sum()),
            "avg_occupancy": float(self.df_properties.get('occupancy_rate', pd.Series([0])).mean()),
            "property_types": self.df_properties['type'].value_counts().to_dict(),
            "last_updated": datetime.now().isoformat()
        }
    
    def get_change_history(self, limit: int = 50) -> List[Dict]:
        """Get recent change history for frontend"""
        return self.change_history[-limit:]


# ===== DEMO: FRONTEND SIMULATION =====

class FrontendSimulator:
    """Simulates frontend receiving real-time updates"""
    
    def __init__(self, sync_service: DataFrameSyncService):
        self.sync_service = sync_service
        self.sync_service.add_change_listener(self.on_data_change)
        
    def on_data_change(self, change: Dict):
        """Handle data changes from DataFrame service"""
        print(f"\n🔔 FRONTEND NOTIFICATION:")
        print(f"   Type: {change['type']}")
        print(f"   Table: {change['table']}")
        print(f"   Time: {change['timestamp']}")
        
        if change['type'] == 'create':
            print(f"   ➕ New {change['table'][:-1]}: {change['data']['name']}")
        elif change['type'] == 'update':
            print(f"   ✏️ Updated {change['table'][:-1]}: {change['data']['name']}")
        elif change['type'] == 'delete':
            print(f"   🗑️ Deleted {change['table'][:-1]}: {change['data']['name']}")
        elif change['type'] == 'recalculate':
            print(f"   📊 {change['data']['message']}")
        
        # Simulate frontend update
        self.update_frontend_display()
    
    def update_frontend_display(self):
        """Simulate updating frontend display"""
        properties = self.sync_service.get_properties_for_frontend()
        analytics = self.sync_service.get_analytics_for_frontend()
        
        print(f"   📱 Frontend updated: {len(properties)} properties, ${analytics.get('total_value', 0):,.0f} total value")


# Create global sync service
sync_service = DataFrameSyncService()
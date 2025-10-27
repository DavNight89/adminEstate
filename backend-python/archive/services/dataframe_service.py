"""
DataFrame Service
Alternative data storage using pandas DataFrames
This is a separate implementation that can be integrated later
"""
import pandas as pd
import uuid
from datetime import datetime, date
from typing import List, Optional, Dict, Any
import os
import json 
from pathlib import Path

from models.schemas import (
    Property, PropertyCreate, PropertyUpdate,
    Tenant, TenantCreate, TenantUpdate, TenantStatus,
    WorkOrder, WorkOrderCreate, WorkOrderUpdate, WorkOrderStatus, WorkOrderPriority,
    Transaction, TransactionCreate, TransactionUpdate, TransactionType,
    Document, DocumentCreate
)

class DataFrameService:
    """
    DataFrame-based data service using pandas
    Features:
    - Persistent storage to CSV/JSON files
    - Fast querying and filtering
    - Data analysis capabilities
    - Easy data manipulation
    """

    def __init__(self, data_dir: str = "dataframe_data"):
        """Initialize DataFrame service with persistent storage"""
        self.data_dir = Path(data_dir)
        self.data_dir.mkdir(exist_ok=True)
        
        # Initialize empty DataFrames
        self.df_properties = pd.DataFrame()
        self.df_tenants = pd.DataFrame()
        self.df_workorders = pd.DataFrame()
        self.df_transactions = pd.DataFrame()
        self.df_documents = pd.DataFrame()
        
        # Load existing data
        self._load_data()
        
        print(f"📊 DataFrame service initialized")
        print(f"📁 Data directory: {self.data_dir}")
        self._print_stats()

    def _load_data(self):
        """Load data from CSV files if they exist"""
        try:
            # Load properties
            if (self.data_dir / "properties.csv").exists():
                self.df_properties = pd.read_csv(self.data_dir / "properties.csv")
                print(f"✅ Loaded {len(self.df_properties)} properties")
            else:
                self.df_properties = pd.DataFrame(columns=[
                    'id', 'name', 'address', 'type', 'units', 'occupied', 
                    'monthlyRevenue', 'purchasePrice', 'created_at', 'updated_at'
                ])

            # Load tenants
            if (self.data_dir / "tenants.csv").exists():
                self.df_tenants = pd.read_csv(self.data_dir / "tenants.csv")
                print(f"✅ Loaded {len(self.df_tenants)} tenants")
            else:
                self.df_tenants = pd.DataFrame(columns=[
                    'id', 'name', 'email', 'phone', 'property_id', 'unit', 
                    'rent', 'deposit', 'lease_start', 'lease_end', 'status', 'created_at'
                ])

            # Load work orders
            if (self.data_dir / "workorders.csv").exists():
                self.df_workorders = pd.read_csv(self.data_dir / "workorders.csv")
                print(f"✅ Loaded {len(self.df_workorders)} work orders")
            else:
                self.df_workorders = pd.DataFrame(columns=[
                    'id', 'title', 'description', 'property_id', 'tenant_id', 'unit',
                    'priority', 'status', 'category', 'estimated_cost', 'actual_cost',
                    'created_at', 'updated_at', 'completed_at'
                ])

            # Load transactions
            if (self.data_dir / "transactions.csv").exists():
                self.df_transactions = pd.read_csv(self.data_dir / "transactions.csv")
                print(f"✅ Loaded {len(self.df_transactions)} transactions")
            else:
                self.df_transactions = pd.DataFrame(columns=[
                    'id', 'property_id', 'tenant_id', 'type', 'amount', 'description',
                    'date', 'category', 'payment_method', 'created_at'
                ])

            # Load documents
            if (self.data_dir / "documents.csv").exists():
                self.df_documents = pd.read_csv(self.data_dir / "documents.csv")
                print(f"✅ Loaded {len(self.df_documents)} documents")
            else:
                self.df_documents = pd.DataFrame(columns=[
                    'id', 'name', 'type', 'property_id', 'tenant_id', 'file_path',
                    'file_size', 'uploaded_at', 'tags'
                ])

        except Exception as e:
            print(f"⚠️ Error loading data: {e}")

    def _save_data(self):
        """Save all DataFrames to CSV files"""
        try:
            self.df_properties.to_csv(self.data_dir / "properties.csv", index=False)
            self.df_tenants.to_csv(self.data_dir / "tenants.csv", index=False)
            self.df_workorders.to_csv(self.data_dir / "workorders.csv", index=False)
            self.df_transactions.to_csv(self.data_dir / "transactions.csv", index=False)
            self.df_documents.to_csv(self.data_dir / "documents.csv", index=False)
            print("💾 Data saved to CSV files")
        except Exception as e:
            print(f"❌ Error saving data: {e}")

    def _print_stats(self):
        """Print current data statistics"""
        print(f"📊 Current data:")
        print(f"  Properties: {len(self.df_properties)}")
        print(f"  Tenants: {len(self.df_tenants)}")
        print(f"  Work Orders: {len(self.df_workorders)}")
        print(f"  Transactions: {len(self.df_transactions)}")
        print(f"  Documents: {len(self.df_documents)}")

    # ===== PROPERTIES =====
    async def get_properties(
        self,
        skip: int = 0,
        limit: int = 100,
        search: Optional[str] = None
    ) -> List[Property]:
        """Get properties with DataFrame filtering"""
        df = self.df_properties.copy()
        
        # Apply search filter
        if search:
            mask = (
                df['name'].str.contains(search, case=False, na=False) |
                df['address'].str.contains(search, case=False, na=False) |
                df['type'].str.contains(search, case=False, na=False)
            )
            df = df[mask]
        
        # Apply pagination
        df = df.iloc[skip:skip + limit]
        
        # Convert to Property objects
        properties = []
        for _, row in df.iterrows():
            properties.append(Property(
                id=row['id'],
                name=row['name'],
                address=row['address'],
                type=row['type'],
                units=int(row['units']) if pd.notna(row['units']) else 0,
                occupied=int(row['occupied']) if pd.notna(row['occupied']) else 0,
                monthly_revenue=float(row['monthly_revenue']) if pd.notna(row['monthly_revenue']) else 0.0,
                purchase_price=float(row['purchase_price']) if pd.notna(row['purchase_price']) else 0.0,
                created_at=row['created_at'],
                updated_at=row['updated_at']
            ))
        
        return properties

    async def create_property(self, property_data: PropertyCreate) -> Property:
        """Create new property using DataFrame"""
        property_id = str(uuid.uuid4())
        now = datetime.now().isoformat()
        
        # Create new row
        new_row = {
            'id': property_id,
            'name': property_data.name,
            'address': property_data.address,
            'type': property_data.type,
            'units': property_data.units,
            'occupied': 0,
            'monthlyRevenue': 0.0,  # Calculated from tenants
            'purchasePrice': getattr(property_data, 'value', 0.0) or 0.0,  # Handle both value and purchase_price
            'created_at': now,
            'updated_at': now
        }
        
        # Add to DataFrame
        self.df_properties = pd.concat([
            self.df_properties, 
            pd.DataFrame([new_row])
        ], ignore_index=True)
        
        # Save data
        self._save_data()
        
        # Return Property object
        return Property(
            id=property_id,
            name=property_data.name,
            address=property_data.address,
            type=property_data.type,
            units=property_data.units,
            occupied=0,
            monthly_revenue=0.0,
            purchase_price=getattr(property_data, 'value', 0.0) or 0.0,
            created_at=now,
            updated_at=now
        )

    async def get_property(self, property_id: str) -> Optional[Property]:
        """Get single property by ID"""
        mask = self.df_properties['id'] == property_id
        matches = self.df_properties[mask]
        
        if matches.empty:
            return None
        
        row = matches.iloc[0]
        return Property(
            id=row['id'],
            name=row['name'],
            address=row['address'],
            type=row['type'],
            units=int(row['units']) if pd.notna(row['units']) else 0,
            occupied=int(row['occupied']) if pd.notna(row['occupied']) else 0,
            monthly_revenue=float(row['monthlyRevenue']) if pd.notna(row['monthlyRevenue']) else 0.0,
            purchase_price=float(row['purchasePrice']) if pd.notna(row['purchasePrice']) else 0.0,
            created_at=row['created_at'],
            updated_at=row['updated_at']
        )

    # ===== ANALYTICS METHODS (DataFrame Advantage) =====
    def get_property_analytics(self) -> Dict[str, Any]:
        """Get property analytics using pandas"""
        if self.df_properties.empty:
            return {"message": "No properties data available"}
        
        analytics = {
            "total_properties": len(self.df_properties),
            "total_units": self.df_properties['units'].sum(),
            "total_occupied": self.df_properties['occupied'].sum(),
            "occupancy_rate": (self.df_properties['occupied'].sum() / self.df_properties['units'].sum() * 100) if self.df_properties['units'].sum() > 0 else 0,
            "total_revenue": self.df_properties['monthly_revenue'].sum(),
            "avg_revenue_per_property": self.df_properties['monthly_revenue'].mean(),
            "property_types": self.df_properties['type'].value_counts().to_dict(),
            "revenue_by_property": self.df_properties[['name', 'monthly_revenue']].to_dict('records')
        }
        
        return analytics

    def get_occupancy_trends(self) -> Dict[str, Any]:
        """Get occupancy trends"""
        if self.df_properties.empty:
            return {"message": "No data available"}
        
        # Calculate occupancy rates
        self.df_properties['occupancy_rate'] = (
            self.df_properties['occupied'] / self.df_properties['units'] * 100
        ).fillna(0)
        
        return {
            "avg_occupancy": self.df_properties['occupancy_rate'].mean(),
            "min_occupancy": self.df_properties['occupancy_rate'].min(),
            "max_occupancy": self.df_properties['occupancy_rate'].max(),
            "properties_by_occupancy": self.df_properties[['name', 'occupancy_rate']].to_dict('records')
        }

    def export_to_excel(self, filename: str = "property_data.xlsx"):
        """Export all data to Excel file"""
        try:
            with pd.ExcelWriter(self.data_dir / filename) as writer:
                self.df_properties.to_excel(writer, sheet_name='Properties', index=False)
                self.df_tenants.to_excel(writer, sheet_name='Tenants', index=False)
                self.df_workorders.to_excel(writer, sheet_name='WorkOrders', index=False)
                self.df_transactions.to_excel(writer, sheet_name='Transactions', index=False)
                self.df_documents.to_excel(writer, sheet_name='Documents', index=False)
            
            print(f"📊 Data exported to {filename}")
            return True
        except Exception as e:
            print(f"❌ Export failed: {e}")
            return False

    def get_data_summary(self) -> Dict[str, Any]:
        """Get comprehensive data summary"""
        return {
            "properties": {
                "count": len(self.df_properties),
                "columns": list(self.df_properties.columns),
                "sample": self.df_properties.head(3).to_dict('records') if not self.df_properties.empty else []
            },
            "tenants": {
                "count": len(self.df_tenants),
                "columns": list(self.df_tenants.columns),
            },
            "workorders": {
                "count": len(self.df_workorders),
                "columns": list(self.df_workorders.columns),
            },
            "transactions": {
                "count": len(self.df_transactions),
                "columns": list(self.df_transactions.columns),
            },
            "documents": {
                "count": len(self.df_documents),
                "columns": list(self.df_documents.columns),
            }
        }


# Create global instance (separate from main database service)
df_service = DataFrameService()
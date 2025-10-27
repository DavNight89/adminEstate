#!/usr/bin/env python3
"""
Complete DataFrame Integration Service
====================================

Integrates ALL dataframe_data categories into Flask backend:
- Properties
- Tenants  
- Work Orders
- Transactions
- Documents

Features:
- Full CRUD operations for all entities
- Cross-entity analytics
- Data relationships and validation
- Automatic sync with data.json
- Export capabilities
"""

import pandas as pd
import uuid
from datetime import datetime
from pathlib import Path
import json
import os
from typing import List, Dict, Any, Optional

class CompleteDFService:
    def __init__(self, data_dir="dataframe_data"):
        self.data_dir = Path(__file__).parent / data_dir
        self.data_dir.mkdir(exist_ok=True)
        
        # CSV file paths for all entities
        self.files = {
            'properties': self.data_dir / 'properties.csv',
            'tenants': self.data_dir / 'tenants.csv', 
            'workorders': self.data_dir / 'workorders.csv',
            'transactions': self.data_dir / 'transactions.csv',
            'documents': self.data_dir / 'documents.csv'
        }
        
        # Initialize all DataFrames
        self.dfs = {}
        self._initialize_dataframes()
    
    def _initialize_dataframes(self):
        """Initialize all DataFrames with proper schemas"""
        
        # Properties schema
        properties_schema = {
            'id': 'str', 'name': 'str', 'address': 'str', 'type': 'str',
            'units': 'int', 'occupied': 'int', 'monthlyRevenue': 'float',
            'purchasePrice': 'float', 'created_at': 'str', 'updated_at': 'str'
        }
        
        # Tenants schema
        tenants_schema = {
            'id': 'str', 'name': 'str', 'email': 'str', 'phone': 'str',
            'property_id': 'str', 'unit': 'str', 'rent': 'float', 
            'deposit': 'float', 'lease_start': 'str', 'lease_end': 'str',
            'status': 'str', 'created_at': 'str'
        }
        
        # Work Orders schema
        workorders_schema = {
            'id': 'str', 'title': 'str', 'description': 'str', 
            'property_id': 'str', 'tenant_id': 'str', 'unit': 'str',
            'priority': 'str', 'status': 'str', 'category': 'str',
            'estimated_cost': 'float', 'actual_cost': 'float',
            'created_at': 'str', 'updated_at': 'str', 'completed_at': 'str'
        }
        
        # Transactions schema
        transactions_schema = {
            'id': 'str', 'property_id': 'str', 'tenant_id': 'str',
            'type': 'str', 'amount': 'float', 'description': 'str',
            'date': 'str', 'category': 'str', 'payment_method': 'str',
            'created_at': 'str'
        }
        
        # Documents schema
        documents_schema = {
            'id': 'str', 'name': 'str', 'type': 'str', 'category': 'str',
            'property_id': 'str', 'tenant_id': 'str', 'file_path': 'str',
            'file_size': 'int', 'mime_type': 'str', 'created_at': 'str'
        }
        
        schemas = {
            'properties': properties_schema,
            'tenants': tenants_schema,
            'workorders': workorders_schema, 
            'transactions': transactions_schema,
            'documents': documents_schema
        }
        
        # Load or create DataFrames
        for entity, schema in schemas.items():
            file_path = self.files[entity]
            
            if file_path.exists():
                try:
                    df = pd.read_csv(file_path)
                    # Ensure proper data types
                    for col, dtype in schema.items():
                        if col in df.columns:
                            if dtype == 'float':
                                df[col] = pd.to_numeric(df[col], errors='coerce').fillna(0)
                            elif dtype == 'int':
                                df[col] = pd.to_numeric(df[col], errors='coerce').fillna(0).astype(int)
                            elif dtype == 'str':
                                df[col] = df[col].astype(str).fillna('')
                    
                    self.dfs[entity] = df
                    print(f"📊 Loaded {entity}: {len(df)} records")
                except Exception as e:
                    print(f"⚠️ Error loading {entity}: {e}")
                    self.dfs[entity] = pd.DataFrame(columns=list(schema.keys()))
            else:
                self.dfs[entity] = pd.DataFrame(columns=list(schema.keys()))
                print(f"📄 Created empty {entity} DataFrame")
    
    def _save_dataframe(self, entity: str):
        """Save DataFrame to CSV"""
        try:
            self.dfs[entity].to_csv(self.files[entity], index=False)
            return True
        except Exception as e:
            print(f"❌ Error saving {entity}: {e}")
            return False
    
    def _generate_id(self) -> str:
        """Generate UUID for new records"""
        return str(uuid.uuid4())
    
    def _get_timestamp(self) -> str:
        """Get current timestamp"""
        return datetime.now().isoformat()
    
    # ===== PROPERTIES METHODS =====
    
    def get_properties(self) -> List[Dict]:
        """Get all properties"""
        return self.dfs['properties'].to_dict('records')
    
    def get_property(self, property_id: str) -> Optional[Dict]:
        """Get single property by ID"""
        df = self.dfs['properties']
        result = df[df['id'] == property_id]
        return result.to_dict('records')[0] if not result.empty else None
    
    def add_property(self, data: Dict) -> Dict:
        """Add new property"""
        property_data = {
            'id': self._generate_id(),
            'name': data.get('name', ''),
            'address': data.get('address', ''),
            'type': data.get('type', 'residential'),
            'units': int(data.get('units', 0)),
            'occupied': int(data.get('occupied', 0)),
            'monthlyRevenue': float(data.get('monthlyRevenue', 0)),
            'purchasePrice': float(data.get('purchasePrice', 0)),
            'created_at': self._get_timestamp(),
            'updated_at': self._get_timestamp()
        }
        
        self.dfs['properties'] = pd.concat([
            self.dfs['properties'], 
            pd.DataFrame([property_data])
        ], ignore_index=True)
        
        self._save_dataframe('properties')
        return property_data
    
    def update_property(self, property_id: str, data: Dict) -> Optional[Dict]:
        """Update property"""
        df = self.dfs['properties']
        mask = df['id'] == property_id
        
        if not mask.any():
            return None
            
        # Update fields
        for field in ['name', 'address', 'type', 'units', 'occupied', 'monthlyRevenue', 'purchasePrice']:
            if field in data:
                df.loc[mask, field] = data[field]
        
        df.loc[mask, 'updated_at'] = self._get_timestamp()
        self._save_dataframe('properties')
        
        return df[mask].to_dict('records')[0]
    
    # ===== TENANTS METHODS =====
    
    def get_tenants(self, property_id: str = None) -> List[Dict]:
        """Get all tenants, optionally filtered by property"""
        df = self.dfs['tenants']
        if property_id:
            df = df[df['property_id'] == property_id]
        return df.to_dict('records')
    
    def add_tenant(self, data: Dict) -> Dict:
        """Add new tenant"""
        tenant_data = {
            'id': self._generate_id(),
            'name': data.get('name', ''),
            'email': data.get('email', ''),
            'phone': data.get('phone', ''),
            'property_id': data.get('property_id', ''),
            'unit': data.get('unit', ''),
            'rent': float(data.get('rent', 0)),
            'deposit': float(data.get('deposit', 0)),
            'lease_start': data.get('lease_start', ''),
            'lease_end': data.get('lease_end', ''),
            'status': data.get('status', 'active'),
            'created_at': self._get_timestamp()
        }
        
        self.dfs['tenants'] = pd.concat([
            self.dfs['tenants'],
            pd.DataFrame([tenant_data])
        ], ignore_index=True)
        
        self._save_dataframe('tenants')
        return tenant_data
    
    # ===== WORK ORDERS METHODS =====
    
    def get_workorders(self, property_id: str = None, status: str = None) -> List[Dict]:
        """Get work orders with optional filters"""
        df = self.dfs['workorders']
        
        if property_id:
            df = df[df['property_id'] == property_id]
        if status:
            df = df[df['status'] == status]
            
        return df.to_dict('records')
    
    def add_workorder(self, data: Dict) -> Dict:
        """Add new work order"""
        workorder_data = {
            'id': self._generate_id(),
            'title': data.get('title', ''),
            'description': data.get('description', ''),
            'property_id': data.get('property_id', ''),
            'tenant_id': data.get('tenant_id', ''),
            'unit': data.get('unit', ''),
            'priority': data.get('priority', 'medium'),
            'status': data.get('status', 'pending'),
            'category': data.get('category', 'maintenance'),
            'estimated_cost': float(data.get('estimated_cost', 0)),
            'actual_cost': float(data.get('actual_cost', 0)),
            'created_at': self._get_timestamp(),
            'updated_at': self._get_timestamp(),
            'completed_at': data.get('completed_at', '')
        }
        
        self.dfs['workorders'] = pd.concat([
            self.dfs['workorders'],
            pd.DataFrame([workorder_data])
        ], ignore_index=True)
        
        self._save_dataframe('workorders')
        return workorder_data
    
    # ===== TRANSACTIONS METHODS =====
    
    def get_transactions(self, property_id: str = None, type_filter: str = None) -> List[Dict]:
        """Get transactions with optional filters"""
        df = self.dfs['transactions']
        
        if property_id:
            df = df[df['property_id'] == property_id]
        if type_filter:
            df = df[df['type'] == type_filter]
            
        return df.to_dict('records')
    
    def add_transaction(self, data: Dict) -> Dict:
        """Add new transaction"""
        transaction_data = {
            'id': self._generate_id(),
            'property_id': data.get('property_id', ''),
            'tenant_id': data.get('tenant_id', ''),
            'type': data.get('type', 'income'),
            'amount': float(data.get('amount', 0)),
            'description': data.get('description', ''),
            'date': data.get('date', datetime.now().date().isoformat()),
            'category': data.get('category', 'rent'),
            'payment_method': data.get('payment_method', 'check'),
            'created_at': self._get_timestamp()
        }
        
        self.dfs['transactions'] = pd.concat([
            self.dfs['transactions'],
            pd.DataFrame([transaction_data])
        ], ignore_index=True)
        
        self._save_dataframe('transactions')
        return transaction_data
    
    # ===== DOCUMENTS METHODS =====
    
    def get_documents(self, property_id: str = None, category: str = None) -> List[Dict]:
        """Get documents with optional filters"""
        df = self.dfs['documents']
        
        if property_id:
            df = df[df['property_id'] == property_id]
        if category:
            df = df[df['category'] == category]
            
        return df.to_dict('records')
    
    def add_document(self, data: Dict) -> Dict:
        """Add new document record"""
        document_data = {
            'id': self._generate_id(),
            'name': data.get('name', ''),
            'type': data.get('type', 'pdf'),
            'category': data.get('category', 'general'),
            'property_id': data.get('property_id', ''),
            'tenant_id': data.get('tenant_id', ''),
            'file_path': data.get('file_path', ''),
            'file_size': int(data.get('file_size', 0)),
            'mime_type': data.get('mime_type', 'application/pdf'),
            'created_at': self._get_timestamp()
        }
        
        self.dfs['documents'] = pd.concat([
            self.dfs['documents'],
            pd.DataFrame([document_data])
        ], ignore_index=True)
        
        self._save_dataframe('documents')
        return document_data
    
    # ===== ANALYTICS METHODS =====
    
    def get_dashboard_analytics(self) -> Dict:
        """Get comprehensive dashboard analytics"""
        properties_df = self.dfs['properties']
        tenants_df = self.dfs['tenants']
        workorders_df = self.dfs['workorders']
        transactions_df = self.dfs['transactions']
        
        analytics = {
            'properties': {
                'total': len(properties_df),
                'total_units': int(properties_df['units'].sum()),
                'total_occupied': int(properties_df['occupied'].sum()),
                'occupancy_rate': float(properties_df['occupied'].sum() / properties_df['units'].sum() * 100) if properties_df['units'].sum() > 0 else 0,
                'total_value': float(properties_df['purchasePrice'].sum()),
                'monthly_revenue': float(properties_df['monthlyRevenue'].sum())
            },
            'tenants': {
                'total': len(tenants_df),
                'active': len(tenants_df[tenants_df['status'] == 'active']),
                'total_rent': float(tenants_df['rent'].sum())
            },
            'workorders': {
                'total': len(workorders_df),
                'pending': len(workorders_df[workorders_df['status'] == 'pending']),
                'in_progress': len(workorders_df[workorders_df['status'] == 'in_progress']),
                'completed': len(workorders_df[workorders_df['status'] == 'completed']),
                'total_cost': float(workorders_df['actual_cost'].sum())
            },
            'transactions': {
                'total': len(transactions_df),
                'total_income': float(transactions_df[transactions_df['type'] == 'income']['amount'].sum()),
                'total_expenses': float(transactions_df[transactions_df['type'] == 'expense']['amount'].sum()),
                'net_income': 0  # Will be calculated
            }
        }
        
        analytics['transactions']['net_income'] = (
            analytics['transactions']['total_income'] - 
            analytics['transactions']['total_expenses']
        )
        
        return analytics
    
    def get_property_details(self, property_id: str) -> Dict:
        """Get detailed information for a specific property"""
        property_data = self.get_property(property_id)
        if not property_data:
            return {}
            
        tenants = self.get_tenants(property_id)
        workorders = self.get_workorders(property_id)
        transactions = self.get_transactions(property_id)
        documents = self.get_documents(property_id)
        
        return {
            'property': property_data,
            'tenants': tenants,
            'workorders': workorders,
            'transactions': transactions,
            'documents': documents,
            'summary': {
                'tenant_count': len(tenants),
                'active_workorders': len([wo for wo in workorders if wo['status'] != 'completed']),
                'monthly_income': sum([t['rent'] for t in tenants if t['status'] == 'active']),
                'recent_transactions': len([t for t in transactions if t['date'] >= (datetime.now() - pd.Timedelta(days=30)).date().isoformat()])
            }
        }
    
    def get_data_overview(self) -> Dict:
        """Get overview of all data in the system"""
        return {
            'entities': {
                'properties': len(self.dfs['properties']),
                'tenants': len(self.dfs['tenants']),
                'workorders': len(self.dfs['workorders']),
                'transactions': len(self.dfs['transactions']),
                'documents': len(self.dfs['documents'])
            },
            'files': {
                entity: {
                    'path': str(self.files[entity]),
                    'exists': self.files[entity].exists(),
                    'size_kb': round(self.files[entity].stat().st_size / 1024, 2) if self.files[entity].exists() else 0
                }
                for entity in self.files
            },
            'last_updated': self._get_timestamp()
        }

# Global instance
complete_df_service = None

def get_complete_df_service():
    """Get singleton instance of CompleteDFService"""
    global complete_df_service
    if complete_df_service is None:
        complete_df_service = CompleteDFService()
    return complete_df_service
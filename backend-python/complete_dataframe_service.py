#!/usr/bin/env python3
"""
Complete Multi-Entity DataFrame Service
=====================================

This service handles ALL 5 entity types with full sync capabilities:
- Properties
- Tenants  
- Work Orders
- Transactions
- Documents
"""

import pandas as pd
import uuid
import json
from datetime import datetime
from pathlib import Path
from typing import Dict, List, Optional

class CompleteDfService:
    """Complete DataFrame service for all entity types"""
    
    def __init__(self, data_dir: str = "dataframe_data"):
        self.data_dir = Path(data_dir)
        self.data_dir.mkdir(exist_ok=True)
        
        # Initialize all DataFrames
        self.df_properties = pd.DataFrame()
        self.df_tenants = pd.DataFrame()
        self.df_workorders = pd.DataFrame()
        self.df_transactions = pd.DataFrame()
        self.df_documents = pd.DataFrame()
        
        # CSV file paths
        self.properties_csv = self.data_dir / 'properties.csv'
        self.tenants_csv = self.data_dir / 'tenants.csv'
        self.workorders_csv = self.data_dir / 'workorders.csv'
        self.transactions_csv = self.data_dir / 'transactions.csv'
        self.documents_csv = self.data_dir / 'documents.csv'
        
        self._load_all_data()
        self._show_initialization_stats()
    
    def _load_all_data(self):
        """Load all entity types from CSV files"""
        
        # Properties
        if self.properties_csv.exists():
            self.df_properties = pd.read_csv(self.properties_csv)
        
        # Tenants
        if self.tenants_csv.exists():
            self.df_tenants = pd.read_csv(self.tenants_csv)
        else:
            self._create_tenants_csv()
        
        # Work Orders
        if self.workorders_csv.exists():
            self.df_workorders = pd.read_csv(self.workorders_csv)
        else:
            self._create_workorders_csv()
        
        # Transactions
        if self.transactions_csv.exists():
            self.df_transactions = pd.read_csv(self.transactions_csv)
        else:
            self._create_transactions_csv()
        
        # Documents
        if self.documents_csv.exists():
            self.df_documents = pd.read_csv(self.documents_csv)
        else:
            self._create_documents_csv()
    
    def _create_tenants_csv(self):
        """Create empty tenants CSV with proper schema"""
        columns = [
            'id', 'name', 'email', 'phone', 'property_id', 
            'lease_start', 'lease_end', 'monthly_rent', 'deposit',
            'created_at', 'updated_at'
        ]
        self.df_tenants = pd.DataFrame(columns=columns)
        self.df_tenants.to_csv(self.tenants_csv, index=False)
        print(f"✅ Created tenants.csv with schema: {columns}")
    
    def _create_workorders_csv(self):
        """Create empty work orders CSV with proper schema"""
        columns = [
            'id', 'title', 'description', 'property_id', 'tenant_id',
            'status', 'priority', 'category', 'cost', 'vendor',
            'created_at', 'updated_at', 'completed_at'
        ]
        self.df_workorders = pd.DataFrame(columns=columns)
        self.df_workorders.to_csv(self.workorders_csv, index=False)
        print(f"✅ Created workorders.csv with schema: {columns}")
    
    def _create_transactions_csv(self):
        """Create empty transactions CSV with proper schema"""
        columns = [
            'id', 'property_id', 'tenant_id', 'type', 'category',
            'amount', 'description', 'date', 'payment_method',
            'created_at', 'updated_at'
        ]
        self.df_transactions = pd.DataFrame(columns=columns)
        self.df_transactions.to_csv(self.transactions_csv, index=False)
        print(f"✅ Created transactions.csv with schema: {columns}")
    
    def _create_documents_csv(self):
        """Create empty documents CSV with proper schema"""
        columns = [
            'id', 'name', 'type', 'category', 'property_id', 'tenant_id',
            'file_path', 'file_size', 'mime_type', 'thumbnail_path',
            'created_at', 'updated_at'
        ]
        self.df_documents = pd.DataFrame(columns=columns)
        self.df_documents.to_csv(self.documents_csv, index=False)
        print(f"✅ Created documents.csv with schema: {columns}")
    
    # ===== TENANTS METHODS =====
    
    def add_tenant(self, tenant_data: Dict) -> Dict:
        """Add new tenant to DataFrame and CSV"""
        tenant_data = tenant_data.copy()
        
        if 'id' not in tenant_data:
            tenant_data['id'] = str(uuid.uuid4())
        
        tenant_data['created_at'] = datetime.now().isoformat()
        tenant_data['updated_at'] = datetime.now().isoformat()
        
        # Add to DataFrame
        new_row = pd.DataFrame([tenant_data])
        self.df_tenants = pd.concat([self.df_tenants, new_row], ignore_index=True)
        
        # Save to CSV
        self.df_tenants.to_csv(self.tenants_csv, index=False)
        
        return tenant_data
    
    def get_tenants_for_frontend(self) -> List[Dict]:
        """Get tenants in frontend-compatible format"""
        if self.df_tenants.empty:
            return []
        return self.df_tenants.to_dict('records')
    
    # ===== WORK ORDERS METHODS =====
    
    def add_workorder(self, workorder_data: Dict) -> Dict:
        """Add new work order to DataFrame and CSV"""
        workorder_data = workorder_data.copy()
        
        if 'id' not in workorder_data:
            workorder_data['id'] = str(uuid.uuid4())
        
        workorder_data['created_at'] = datetime.now().isoformat()
        workorder_data['updated_at'] = datetime.now().isoformat()
        
        # Add to DataFrame
        new_row = pd.DataFrame([workorder_data])
        self.df_workorders = pd.concat([self.df_workorders, new_row], ignore_index=True)
        
        # Save to CSV
        self.df_workorders.to_csv(self.workorders_csv, index=False)
        
        return workorder_data
    
    def get_workorders_for_frontend(self) -> List[Dict]:
        """Get work orders in frontend-compatible format"""
        if self.df_workorders.empty:
            return []
        return self.df_workorders.to_dict('records')
    
    # ===== TRANSACTIONS METHODS =====
    
    def add_transaction(self, transaction_data: Dict) -> Dict:
        """Add new transaction to DataFrame and CSV"""
        transaction_data = transaction_data.copy()
        
        if 'id' not in transaction_data:
            transaction_data['id'] = str(uuid.uuid4())
        
        transaction_data['created_at'] = datetime.now().isoformat()
        transaction_data['updated_at'] = datetime.now().isoformat()
        
        # Add to DataFrame
        new_row = pd.DataFrame([transaction_data])
        self.df_transactions = pd.concat([self.df_transactions, new_row], ignore_index=True)
        
        # Save to CSV
        self.df_transactions.to_csv(self.transactions_csv, index=False)
        
        return transaction_data
    
    def get_transactions_for_frontend(self) -> List[Dict]:
        """Get transactions in frontend-compatible format"""
        if self.df_transactions.empty:
            return []
        return self.df_transactions.to_dict('records')
    
    # ===== DOCUMENTS METHODS =====
    
    def add_document(self, document_data: Dict) -> Dict:
        """Add new document record to DataFrame and CSV"""
        document_data = document_data.copy()
        
        if 'id' not in document_data:
            document_data['id'] = str(uuid.uuid4())
        
        document_data['created_at'] = datetime.now().isoformat()
        document_data['updated_at'] = datetime.now().isoformat()
        
        # Add to DataFrame
        new_row = pd.DataFrame([document_data])
        self.df_documents = pd.concat([self.df_documents, new_row], ignore_index=True)
        
        # Save to CSV
        self.df_documents.to_csv(self.documents_csv, index=False)
        
        return document_data
    
    def get_documents_for_frontend(self) -> List[Dict]:
        """Get documents in frontend-compatible format"""
        if self.df_documents.empty:
            return []
        return self.df_documents.to_dict('records')
    
    # ===== PROPERTIES (EXISTING COMPATIBILITY) =====
    
    def get_properties_for_frontend(self) -> List[Dict]:
        """Get properties (maintain existing compatibility)"""
        if self.df_properties.empty:
            return []
        return self.df_properties.to_dict('records')
    
    def add_property(self, property_data: Dict) -> Dict:
        """Add property (maintain existing compatibility)"""
        property_data = property_data.copy()
        
        if 'id' not in property_data:
            property_data['id'] = str(uuid.uuid4())
        
        property_data['created_at'] = datetime.now().isoformat()
        property_data['updated_at'] = datetime.now().isoformat()
        
        # Add to DataFrame
        new_row = pd.DataFrame([property_data])
        self.df_properties = pd.concat([self.df_properties, new_row], ignore_index=True)
        
        # Save to CSV
        self.df_properties.to_csv(self.properties_csv, index=False)
        
        return property_data
    
    def _show_initialization_stats(self):
        """Show stats for all entity types"""
        print(f"📊 Complete DataFrame Service Initialized:")
        print(f"   🏠 Properties: {len(self.df_properties)}")
        print(f"   👥 Tenants: {len(self.df_tenants)}")
        print(f"   🔧 Work Orders: {len(self.df_workorders)}")
        print(f"   💰 Transactions: {len(self.df_transactions)}")
        print(f"   📄 Documents: {len(self.df_documents)}")

# Factory function for easy import
def get_complete_df_service():
    """Get instance of complete DataFrame service"""
    return CompleteDfService()

if __name__ == '__main__':
    service = CompleteDfService()
    print("✅ Complete DataFrame Service ready for all entity types!")
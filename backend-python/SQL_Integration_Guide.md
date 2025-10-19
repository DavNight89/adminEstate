# SQL Database Integration Guide

## 🗄️ SQL Database Integration Options

Your property management system can be enhanced with SQL databases in several ways. Here's a comprehensive guide from simple to advanced approaches.

## 1. 🚀 Quick Start: SQLite Integration

### Why SQLite First?
- **No setup required** - file-based database
- **Perfect for development** and small deployments
- **Easy migration path** to PostgreSQL/MySQL later
- **Built into Python** - no additional installations

### Implementation Steps

#### Step 1: Install Dependencies
```bash
pip install sqlalchemy pandas
```

#### Step 2: Database Schema Design
```sql
-- properties table
CREATE TABLE properties (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(100),
    address TEXT,
    purchase_price DECIMAL(12,2),
    monthly_revenue DECIMAL(10,2),
    units INTEGER DEFAULT 1,
    occupied INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- tenants table
CREATE TABLE tenants (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(20),
    property_id INTEGER,
    unit_number VARCHAR(10),
    rent_amount DECIMAL(10,2),
    lease_start DATE,
    lease_end DATE,
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (property_id) REFERENCES properties(id)
);

-- work_orders table
CREATE TABLE work_orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    property_id INTEGER,
    tenant_id INTEGER,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    priority VARCHAR(20) DEFAULT 'medium',
    status VARCHAR(20) DEFAULT 'open',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP,
    FOREIGN KEY (property_id) REFERENCES properties(id),
    FOREIGN KEY (tenant_id) REFERENCES tenants(id)
);

-- financial_transactions table
CREATE TABLE financial_transactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    property_id INTEGER,
    tenant_id INTEGER,
    type VARCHAR(50), -- 'rent', 'expense', 'maintenance', etc.
    amount DECIMAL(10,2),
    description TEXT,
    transaction_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (property_id) REFERENCES properties(id),
    FOREIGN KEY (tenant_id) REFERENCES tenants(id)
);
```

#### Step 3: SQLAlchemy Models
```python
# models/property_models.py
from sqlalchemy import create_engine, Column, Integer, String, Decimal, DateTime, ForeignKey, Text, Date
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship
from datetime import datetime

Base = declarative_base()

class Property(Base):
    __tablename__ = 'properties'
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(255), nullable=False)
    type = Column(String(100))
    address = Column(Text)
    purchase_price = Column(Decimal(12,2))
    monthly_revenue = Column(Decimal(10,2))
    units = Column(Integer, default=1)
    occupied = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    tenants = relationship("Tenant", back_populates="property")
    work_orders = relationship("WorkOrder", back_populates="property")
    transactions = relationship("FinancialTransaction", back_populates="property")

class Tenant(Base):
    __tablename__ = 'tenants'
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(255), nullable=False)
    email = Column(String(255))
    phone = Column(String(20))
    property_id = Column(Integer, ForeignKey('properties.id'))
    unit_number = Column(String(10))
    rent_amount = Column(Decimal(10,2))
    lease_start = Column(Date)
    lease_end = Column(Date)
    status = Column(String(20), default='active')
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    property = relationship("Property", back_populates="tenants")
    work_orders = relationship("WorkOrder", back_populates="tenant")
    transactions = relationship("FinancialTransaction", back_populates="tenant")

class WorkOrder(Base):
    __tablename__ = 'work_orders'
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    property_id = Column(Integer, ForeignKey('properties.id'))
    tenant_id = Column(Integer, ForeignKey('tenants.id'), nullable=True)
    title = Column(String(255), nullable=False)
    description = Column(Text)
    priority = Column(String(20), default='medium')
    status = Column(String(20), default='open')
    created_at = Column(DateTime, default=datetime.utcnow)
    completed_at = Column(DateTime)
    
    # Relationships
    property = relationship("Property", back_populates="work_orders")
    tenant = relationship("Tenant", back_populates="work_orders")

class FinancialTransaction(Base):
    __tablename__ = 'financial_transactions'
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    property_id = Column(Integer, ForeignKey('properties.id'))
    tenant_id = Column(Integer, ForeignKey('tenants.id'), nullable=True)
    type = Column(String(50))  # 'rent', 'expense', 'maintenance'
    amount = Column(Decimal(10,2))
    description = Column(Text)
    transaction_date = Column(Date)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    property = relationship("Property", back_populates="transactions")
    tenant = relationship("Tenant", back_populates="transactions")
```

#### Step 4: Database Service
```python
# services/sql_database_service.py
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
from models.property_models import Base, Property, Tenant, WorkOrder, FinancialTransaction
import pandas as pd
from typing import List, Dict, Any, Optional

class SQLDatabaseService:
    def __init__(self, database_url: str = "sqlite:///property_management.db"):
        self.engine = create_engine(database_url)
        self.SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=self.engine)
        
        # Create tables
        Base.metadata.create_all(bind=self.engine)
    
    def get_session(self):
        """Get database session"""
        return self.SessionLocal()
    
    # Property operations
    def add_property(self, property_data: Dict[str, Any]) -> Property:
        """Add new property"""
        session = self.get_session()
        try:
            property_obj = Property(**property_data)
            session.add(property_obj)
            session.commit()
            session.refresh(property_obj)
            return property_obj
        finally:
            session.close()
    
    def get_properties(self) -> List[Dict[str, Any]]:
        """Get all properties"""
        session = self.get_session()
        try:
            properties = session.query(Property).all()
            return [self._property_to_dict(prop) for prop in properties]
        finally:
            session.close()
    
    def get_properties_dataframe(self) -> pd.DataFrame:
        """Get properties as pandas DataFrame for analytics"""
        query = """
        SELECT 
            id, name, type, address, purchase_price, monthly_revenue,
            units, occupied, created_at, updated_at,
            CASE 
                WHEN units > 0 THEN (occupied * 100.0 / units)
                ELSE 0 
            END as occupancy_rate,
            CASE 
                WHEN purchase_price > 0 THEN (monthly_revenue * 12 * 100.0 / purchase_price)
                ELSE 0 
            END as cap_rate
        FROM properties
        """
        return pd.read_sql_query(query, self.engine)
    
    def update_property(self, property_id: int, updates: Dict[str, Any]) -> Optional[Property]:
        """Update property"""
        session = self.get_session()
        try:
            property_obj = session.query(Property).filter(Property.id == property_id).first()
            if property_obj:
                for key, value in updates.items():
                    setattr(property_obj, key, value)
                session.commit()
                session.refresh(property_obj)
                return property_obj
            return None
        finally:
            session.close()
    
    def delete_property(self, property_id: int) -> bool:
        """Delete property"""
        session = self.get_session()
        try:
            property_obj = session.query(Property).filter(Property.id == property_id).first()
            if property_obj:
                session.delete(property_obj)
                session.commit()
                return True
            return False
        finally:
            session.close()
    
    # Advanced analytics queries
    def get_financial_summary(self) -> pd.DataFrame:
        """Get comprehensive financial analytics"""
        query = """
        SELECT 
            p.id,
            p.name,
            p.type,
            p.purchase_price,
            p.monthly_revenue,
            p.units,
            p.occupied,
            COUNT(t.id) as tenant_count,
            SUM(CASE WHEN ft.type = 'rent' THEN ft.amount ELSE 0 END) as total_rent_collected,
            SUM(CASE WHEN ft.type = 'expense' THEN ft.amount ELSE 0 END) as total_expenses,
            AVG(t.rent_amount) as avg_rent_per_unit
        FROM properties p
        LEFT JOIN tenants t ON p.id = t.property_id AND t.status = 'active'
        LEFT JOIN financial_transactions ft ON p.id = ft.property_id
        GROUP BY p.id, p.name, p.type, p.purchase_price, p.monthly_revenue, p.units, p.occupied
        """
        return pd.read_sql_query(query, self.engine)
    
    def get_maintenance_analytics(self) -> pd.DataFrame:
        """Get work order analytics"""
        query = """
        SELECT 
            p.name as property_name,
            COUNT(wo.id) as total_work_orders,
            SUM(CASE WHEN wo.status = 'open' THEN 1 ELSE 0 END) as open_orders,
            SUM(CASE WHEN wo.status = 'completed' THEN 1 ELSE 0 END) as completed_orders,
            AVG(CASE 
                WHEN wo.completed_at IS NOT NULL AND wo.created_at IS NOT NULL 
                THEN julianday(wo.completed_at) - julianday(wo.created_at)
                ELSE NULL 
            END) as avg_completion_days
        FROM properties p
        LEFT JOIN work_orders wo ON p.id = wo.property_id
        GROUP BY p.id, p.name
        """
        return pd.read_sql_query(query, self.engine)
    
    # Migration from existing CSV/DataFrame data
    def migrate_from_csv(self, csv_file_path: str, table_type: str):
        """Migrate data from CSV files to SQL database"""
        df = pd.read_csv(csv_file_path)
        
        if table_type == 'properties':
            df.to_sql('properties', self.engine, if_exists='append', index=False)
        elif table_type == 'tenants':
            df.to_sql('tenants', self.engine, if_exists='append', index=False)
        # Add more table types as needed
    
    def _property_to_dict(self, property_obj: Property) -> Dict[str, Any]:
        """Convert Property object to dictionary"""
        return {
            'id': property_obj.id,
            'name': property_obj.name,
            'type': property_obj.type,
            'address': property_obj.address,
            'purchasePrice': float(property_obj.purchase_price) if property_obj.purchase_price else 0,
            'monthlyRevenue': float(property_obj.monthly_revenue) if property_obj.monthly_revenue else 0,
            'units': property_obj.units,
            'occupied': property_obj.occupied,
            'occupancy': (property_obj.occupied / property_obj.units * 100) if property_obj.units > 0 else 0,
            'created_at': property_obj.created_at.isoformat() if property_obj.created_at else None,
            'updated_at': property_obj.updated_at.isoformat() if property_obj.updated_at else None
        }
```

## 2. 🐘 Production Setup: PostgreSQL

### Why PostgreSQL?
- **Production-ready** with excellent performance
- **Advanced analytics** with window functions, JSON support
- **Scalable** for large datasets
- **Reliable** with ACID compliance

### Setup Steps
```bash
# Install PostgreSQL dependencies
pip install psycopg2-binary sqlalchemy pandas

# Connection string
DATABASE_URL = "postgresql://username:password@localhost:5432/property_management"
```

### Enhanced Analytics with PostgreSQL
```python
# Advanced PostgreSQL analytics
def get_advanced_analytics(self) -> Dict[str, pd.DataFrame]:
    """Get comprehensive analytics using PostgreSQL features"""
    
    # Time-series revenue analysis
    revenue_query = """
    WITH monthly_revenue AS (
        SELECT 
            DATE_TRUNC('month', transaction_date) as month,
            SUM(amount) as total_revenue,
            COUNT(DISTINCT property_id) as active_properties
        FROM financial_transactions 
        WHERE type = 'rent'
        GROUP BY DATE_TRUNC('month', transaction_date)
        ORDER BY month
    )
    SELECT 
        month,
        total_revenue,
        active_properties,
        LAG(total_revenue) OVER (ORDER BY month) as prev_month_revenue,
        (total_revenue - LAG(total_revenue) OVER (ORDER BY month)) / 
            LAG(total_revenue) OVER (ORDER BY month) * 100 as growth_rate
    FROM monthly_revenue
    """
    
    # Property performance ranking
    ranking_query = """
    SELECT 
        p.name,
        p.type,
        p.monthly_revenue,
        p.purchase_price,
        (p.monthly_revenue * 12 / p.purchase_price * 100) as cap_rate,
        RANK() OVER (ORDER BY (p.monthly_revenue * 12 / p.purchase_price) DESC) as performance_rank,
        PERCENT_RANK() OVER (ORDER BY p.monthly_revenue DESC) as revenue_percentile
    FROM properties p
    WHERE p.purchase_price > 0
    ORDER BY cap_rate DESC
    """
    
    return {
        'revenue_trends': pd.read_sql_query(revenue_query, self.engine),
        'property_rankings': pd.read_sql_query(ranking_query, self.engine)
    }
```

## 3. 🔄 Migration Strategy

### Gradual Migration Approach
```python
# services/hybrid_service.py
class HybridDataService:
    """Combines SQL database with existing DataFrame service"""
    
    def __init__(self):
        self.sql_service = SQLDatabaseService()
        self.df_service = FrontendCompatibleDataFrameService()  # Your existing service
        self.use_sql = False  # Feature flag
    
    def get_properties(self):
        """Get properties from SQL or DataFrame based on feature flag"""
        if self.use_sql:
            return self.sql_service.get_properties()
        else:
            return self.df_service.get_properties_for_frontend()
    
    def enable_sql_mode(self):
        """Switch to SQL database"""
        # Migrate existing data
        self.migrate_existing_data()
        self.use_sql = True
    
    def migrate_existing_data(self):
        """Migrate from CSV/DataFrame to SQL"""
        properties = self.df_service.get_properties_for_frontend()
        for prop in properties:
            self.sql_service.add_property(prop)
```

## 4. 🚀 Integration with Your Existing Flask App

### Updated Flask Routes
```python
# Update your app_frontend_compatible.py
from services.sql_database_service import SQLDatabaseService

# Initialize SQL service
sql_service = SQLDatabaseService()

@app.route('/api/properties', methods=['GET'])
def get_properties():
    try:
        properties = sql_service.get_properties()
        return jsonify(properties)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/analytics/sql-dashboard', methods=['GET'])
def get_sql_analytics():
    """Enhanced analytics using SQL database"""
    try:
        # Get basic metrics
        properties_df = sql_service.get_properties_dataframe()
        financial_df = sql_service.get_financial_summary()
        maintenance_df = sql_service.get_maintenance_analytics()
        
        analytics = {
            'total_properties': len(properties_df),
            'total_portfolio_value': properties_df['purchase_price'].sum(),
            'total_monthly_revenue': properties_df['monthly_revenue'].sum(),
            'avg_cap_rate': properties_df['cap_rate'].mean(),
            'avg_occupancy_rate': properties_df['occupancy_rate'].mean(),
            'financial_summary': financial_df.to_dict('records'),
            'maintenance_metrics': maintenance_df.to_dict('records')
        }
        
        return jsonify({'success': True, 'data': analytics})
    except Exception as e:
        return jsonify({'error': str(e)}), 500
```

## 5. 📊 Benefits of SQL Integration

### Performance Benefits
- **Faster queries** for large datasets
- **Indexed searches** for quick property lookups
- **Complex joins** for comprehensive analytics
- **Concurrent access** for multiple users

### Advanced Analytics
- **Time-series analysis** with date functions
- **Window functions** for rankings and trends
- **Aggregations** across related tables
- **JSON support** for flexible data structures

### Scalability
- **Handle thousands** of properties
- **Multi-tenant** architecture support
- **Backup and recovery** built-in
- **Production deployment** ready

## 6. 🛠️ Next Steps

1. **Start with SQLite** for development
2. **Test the migration** with your existing data
3. **Add SQL analytics endpoints** alongside Pandas
4. **Gradually migrate** features to SQL
5. **Upgrade to PostgreSQL** for production

Would you like me to create any of these SQL integration files for your project?
"""
Production-Ready Pandas Analytics Service
Integrates pandas_analytics_demo.py into the production system
"""
import pandas as pd
import numpy as np
from datetime import datetime, timedelta
from typing import Dict, Any, List, Optional
import sys
from pathlib import Path

# Import your existing DataFrame service
from test_frontend_compatibility import FrontendCompatibleDataFrameService

class PandasAnalyticsService:
    """
    Production analytics service using Pandas
    Replaces JavaScript analytics with powerful Python data science
    """
    
    def __init__(self, dataframe_service: FrontendCompatibleDataFrameService):
        self.df_service = dataframe_service
    
    def get_properties_dataframe(self) -> pd.DataFrame:
        """Get properties as pandas DataFrame for analysis"""
        properties = self.df_service.get_properties_for_frontend()
        
        if not properties:
            return pd.DataFrame()
        
        df = pd.DataFrame(properties)
        
        # Ensure data types
        df['monthlyRevenue'] = pd.to_numeric(df['monthlyRevenue'], errors='coerce').fillna(0)
        df['purchasePrice'] = pd.to_numeric(df['purchasePrice'], errors='coerce').fillna(0)
        df['units'] = pd.to_numeric(df['units'], errors='coerce').fillna(0)
        df['occupied'] = pd.to_numeric(df['occupied'], errors='coerce').fillna(0)
        
        # Parse dates
        df['created_at'] = pd.to_datetime(df['created_at'], errors='coerce')
        df['updated_at'] = pd.to_datetime(df['updated_at'], errors='coerce')
        
        return df
    
    def calculate_advanced_metrics(self, df: pd.DataFrame) -> pd.DataFrame:
        """Calculate advanced metrics using pandas (from demo)"""
        if df.empty:
            return df
        
        # Calculated metrics from demo
        df = df.copy()
        df['occupancy_rate'] = (df['occupied'] / df['units'] * 100).fillna(0)
        df['price_per_unit'] = (df['purchasePrice'] / df['units']).fillna(0)
        df['revenue_per_unit'] = (df['monthlyRevenue'] / df['units']).fillna(0)
        
        # Performance metrics
        df['annual_revenue'] = df['monthlyRevenue'] * 12
        df['cap_rate_estimate'] = np.where(
            df['purchasePrice'] > 0,
            (df['annual_revenue'] / df['purchasePrice'] * 100),
            0
        )
        
        # Size categories
        df['size_category'] = pd.cut(
            df['units'], 
            bins=[0, 10, 20, 50, 100], 
            labels=['Small', 'Medium', 'Large', 'XLarge']
        )
        
        return df
    
    def get_dashboard_analytics(self) -> Dict[str, Any]:
        """Get dashboard analytics using pandas (replaces JavaScript version)"""
        df = self.get_properties_dataframe()
        
        if df.empty:
            return {
                "total_properties": 0,
                "total_units": 0,
                "occupied_units": 0,
                "occupancy_rate": 0,
                "total_monthly_revenue": 0,
                "total_portfolio_value": 0,
                "message": "No data available"
            }
        
        # Calculate enhanced metrics
        df = self.calculate_advanced_metrics(df)
        
        # Basic statistics (replacing JavaScript calculations)
        analytics = {
            "total_properties": len(df),
            "total_units": int(df['units'].sum()),
            "occupied_units": int(df['occupied'].sum()),
            "vacant_units": int(df['units'].sum() - df['occupied'].sum()),
            "occupancy_rate": float(df['occupancy_rate'].mean()),
            "total_monthly_revenue": float(df['monthlyRevenue'].sum()),
            "total_portfolio_value": float(df['purchasePrice'].sum()),
            "avg_property_value": float(df['purchasePrice'].mean()),
            "avg_revenue_per_property": float(df['monthlyRevenue'].mean()),
            "avg_cap_rate": float(df['cap_rate_estimate'].mean()),
        }
        
        return analytics
    
    def get_property_type_analysis(self) -> Dict[str, Any]:
        """Property type analysis using pandas groupby"""
        df = self.get_properties_dataframe()
        
        if df.empty:
            return {}
        
        df = self.calculate_advanced_metrics(df)
        
        # Group by property type (pandas power!)
        type_stats = df.groupby('type').agg({
            'purchasePrice': ['count', 'sum', 'mean'],
            'monthlyRevenue': ['sum', 'mean'],
            'units': ['sum', 'mean'],
            'occupied': ['sum'],
            'occupancy_rate': 'mean',
            'cap_rate_estimate': 'mean'
        }).round(2)
        
        # Convert to dictionary format for API
        result = {}
        for prop_type in type_stats.index:
            result[prop_type] = {
                'property_count': int(type_stats.loc[prop_type, ('purchasePrice', 'count')]),
                'total_value': float(type_stats.loc[prop_type, ('purchasePrice', 'sum')]),
                'avg_value': float(type_stats.loc[prop_type, ('purchasePrice', 'mean')]),
                'total_revenue': float(type_stats.loc[prop_type, ('monthlyRevenue', 'sum')]),
                'avg_revenue': float(type_stats.loc[prop_type, ('monthlyRevenue', 'mean')]),
                'total_units': int(type_stats.loc[prop_type, ('units', 'sum')]),
                'avg_occupancy_rate': float(type_stats.loc[prop_type, ('occupancy_rate', 'mean')]),
                'avg_cap_rate': float(type_stats.loc[prop_type, ('cap_rate_estimate', 'mean')])
            }
        
        return result
    
    def get_performance_rankings(self) -> Dict[str, List[Dict]]:
        """Get property performance rankings using pandas"""
        df = self.get_properties_dataframe()
        
        if df.empty:
            return {}
        
        df = self.calculate_advanced_metrics(df)
        
        # Top performers by different metrics
        rankings = {
            'top_by_value': df.nlargest(5, 'purchasePrice')[
                ['name', 'type', 'purchasePrice', 'units']
            ].to_dict('records'),
            
            'top_by_revenue': df.nlargest(5, 'monthlyRevenue')[
                ['name', 'type', 'monthlyRevenue', 'occupancy_rate']
            ].to_dict('records'),
            
            'top_by_cap_rate': df.nlargest(5, 'cap_rate_estimate')[
                ['name', 'type', 'cap_rate_estimate', 'monthlyRevenue']
            ].to_dict('records'),
            
            'largest_properties': df.nlargest(5, 'units')[
                ['name', 'type', 'units', 'occupied']
            ].to_dict('records')
        }
        
        return rankings
    
    def get_portfolio_composition(self) -> Dict[str, Any]:
        """Portfolio composition analysis using pandas"""
        df = self.get_properties_dataframe()
        
        if df.empty:
            return {}
        
        df = self.calculate_advanced_metrics(df)
        
        # Portfolio composition by value and type
        total_value = df['purchasePrice'].sum()
        
        composition = {
            'by_value': (df.groupby('type')['purchasePrice'].sum() / total_value * 100).to_dict(),
            'by_count': df['type'].value_counts(normalize=True).mul(100).to_dict(),
            'by_size_category': df['size_category'].value_counts().to_dict(),
            'value_quartiles': {
                '25th_percentile': float(df['purchasePrice'].quantile(0.25)),
                '50th_percentile': float(df['purchasePrice'].quantile(0.50)),
                '75th_percentile': float(df['purchasePrice'].quantile(0.75)),
                '90th_percentile': float(df['purchasePrice'].quantile(0.90))
            }
        }
        
        return composition
    
    def get_correlation_analysis(self) -> Dict[str, Any]:
        """Correlation analysis between property metrics"""
        df = self.get_properties_dataframe()
        
        if df.empty:
            return {}
        
        df = self.calculate_advanced_metrics(df)
        
        # Correlation matrix for numeric columns
        numeric_cols = ['units', 'occupied', 'monthlyRevenue', 'purchasePrice', 
                       'occupancy_rate', 'price_per_unit', 'cap_rate_estimate']
        
        correlation_matrix = df[numeric_cols].corr()
        
        return {
            'correlation_matrix': correlation_matrix.to_dict(),
            'strong_correlations': self._find_strong_correlations(correlation_matrix)
        }
    
    def _find_strong_correlations(self, corr_matrix: pd.DataFrame, threshold: float = 0.7) -> List[Dict]:
        """Find strong correlations (above threshold)"""
        strong_corr = []
        
        for i in range(len(corr_matrix.columns)):
            for j in range(i+1, len(corr_matrix.columns)):
                corr_value = corr_matrix.iloc[i, j]
                if abs(corr_value) > threshold:
                    strong_corr.append({
                        'variable1': corr_matrix.columns[i],
                        'variable2': corr_matrix.columns[j],
                        'correlation': round(corr_value, 3),
                        'strength': 'strong positive' if corr_value > 0 else 'strong negative'
                    })
        
        return strong_corr

# Create global instance
pandas_analytics = None

def get_pandas_analytics(df_service=None) -> PandasAnalyticsService:
    """Get or create pandas analytics service instance with shared DataFrame service"""
    global pandas_analytics
    
    if pandas_analytics is None:
        if df_service is None:
            # Fallback: create new instance (should be avoided)
            from test_frontend_compatibility import FrontendCompatibleDataFrameService
            df_service = FrontendCompatibleDataFrameService()
            print("⚠️ WARNING: Created separate DataFrame instance - potential duplicates!")
        
        pandas_analytics = PandasAnalyticsService(df_service)
        print("✅ Pandas Analytics initialized with shared DataFrame service")
    
    return pandas_analytics
"""
Advanced Pandas Analytics for Property Management
Demonstrates powerful pandas features for real estate data analysis
"""
import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import sys
import os

# Add the backend-python directory to the path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

def load_property_data():
    """Load the property data from CSV"""
    try:
        df = pd.read_csv("dataframe_data/properties.csv")
        df['created_at'] = pd.to_datetime(df['created_at'])
        df['updated_at'] = pd.to_datetime(df['updated_at'])
        return df
    except FileNotFoundError:
        print("❌ No data found. Run test_dataframe.py first!")
        return pd.DataFrame()

def property_analytics_showcase(df):
    """Showcase pandas analytics features with property data"""
    
    print("🏢 PROPERTY ANALYTICS SHOWCASE")
    print("=" * 50)
    
    if df.empty:
        print("No data available")
        return
    
    # 1. BASIC STATISTICS
    print("\n📊 1. BASIC STATISTICS")
    print("-" * 30)
    print("Descriptive Statistics:")
    print(df[['units', 'occupied', 'value']].describe())
    
    # 2. AGGREGATION BY PROPERTY TYPE
    print("\n🏘️ 2. AGGREGATION BY PROPERTY TYPE")
    print("-" * 40)
    type_stats = df.groupby('type').agg({
        'units': ['count', 'sum', 'mean'],
        'value': ['sum', 'mean', 'min', 'max'],
        'occupied': ['sum', 'mean']
    }).round(2)
    print(type_stats)
    
    # 3. CALCULATED METRICS
    print("\n📈 3. CALCULATED METRICS")
    print("-" * 30)
    df['occupancy_rate'] = (df['occupied'] / df['units'] * 100).fillna(0)
    df['value_per_unit'] = (df['value'] / df['units']).fillna(0)
    df['avg_unit_value'] = df['value'] / df['units']
    
    print("New Calculated Columns:")
    print(df[['name', 'occupancy_rate', 'value_per_unit']].to_string(index=False))
    
    # 4. RANKING & SORTING
    print("\n🏆 4. PROPERTY RANKINGS")
    print("-" * 30)
    print("Top Properties by Value:")
    top_by_value = df.nlargest(3, 'value')[['name', 'type', 'value', 'units']]
    print(top_by_value.to_string(index=False))
    
    print("\nTop Properties by Units:")
    top_by_units = df.nlargest(3, 'units')[['name', 'type', 'units', 'value']]
    print(top_by_units.to_string(index=False))
    
    # 5. FILTERING & CONDITIONAL ANALYSIS
    print("\n🔍 5. FILTERING & CONDITIONAL ANALYSIS")
    print("-" * 45)
    
    # High-value properties
    high_value = df[df['value'] > df['value'].median()]
    print(f"Properties above median value (${df['value'].median():,.0f}):")
    print(f"  Count: {len(high_value)}")
    print(f"  Total Value: ${high_value['value'].sum():,.0f}")
    
    # Large properties
    large_properties = df[df['units'] > 15]
    print(f"\nLarge Properties (>15 units): {len(large_properties)}")
    if not large_properties.empty:
        print(large_properties[['name', 'units', 'type']].to_string(index=False))
    
    # 6. CROSS-TABULATION
    print("\n📋 6. CROSS-TABULATION ANALYSIS")
    print("-" * 35)
    
    # Create size categories
    df['size_category'] = pd.cut(df['units'], 
                                bins=[0, 10, 20, 50, 100], 
                                labels=['Small', 'Medium', 'Large', 'XLarge'])
    
    # Cross-tab of type vs size
    crosstab = pd.crosstab(df['type'], df['size_category'], margins=True)
    print("Property Type vs Size Category:")
    print(crosstab)
    
    # 7. PERCENTILES & QUARTILES
    print("\n📊 7. PERCENTILES & QUARTILES")
    print("-" * 35)
    print("Value Quartiles:")
    print(f"25th percentile: ${df['value'].quantile(0.25):,.0f}")
    print(f"50th percentile (median): ${df['value'].quantile(0.50):,.0f}")
    print(f"75th percentile: ${df['value'].quantile(0.75):,.0f}")
    print(f"90th percentile: ${df['value'].quantile(0.90):,.0f}")
    
    # 8. CORRELATION ANALYSIS
    print("\n🔗 8. CORRELATION ANALYSIS")
    print("-" * 30)
    numeric_cols = ['units', 'occupied', 'value', 'occupancy_rate', 'value_per_unit']
    correlation_matrix = df[numeric_cols].corr()
    print("Correlation Matrix:")
    print(correlation_matrix.round(3))
    
    # 9. TIME-BASED ANALYSIS
    print("\n⏰ 9. TIME-BASED ANALYSIS")
    print("-" * 30)
    df['creation_month'] = df['created_at'].dt.to_period('M')
    monthly_stats = df.groupby('creation_month').agg({
        'name': 'count',
        'value': 'sum',
        'units': 'sum'
    }).rename(columns={'name': 'properties_added'})
    print("Properties Added by Month:")
    print(monthly_stats)
    
    # 10. ADVANCED FILTERING WITH QUERY
    print("\n🎯 10. ADVANCED QUERYING")
    print("-" * 30)
    
    # Complex query
    high_value_large = df.query('value > 800000 and units > 15')
    print("High-Value Large Properties (>$800K and >15 units):")
    if not high_value_large.empty:
        print(high_value_large[['name', 'value', 'units', 'type']].to_string(index=False))
    else:
        print("No properties match criteria")
    
    # 11. PORTFOLIO ANALYSIS
    print("\n💼 11. PORTFOLIO ANALYSIS")
    print("-" * 30)
    total_portfolio_value = df['value'].sum()
    total_units = df['units'].sum()
    
    # Portfolio composition
    type_composition = df.groupby('type')['value'].sum() / total_portfolio_value * 100
    print("Portfolio Composition by Value:")
    for prop_type, percentage in type_composition.items():
        print(f"  {prop_type}: {percentage:.1f}%")
    
    print(f"\nPortfolio Summary:")
    print(f"  Total Properties: {len(df)}")
    print(f"  Total Value: ${total_portfolio_value:,.0f}")
    print(f"  Total Units: {total_units}")
    print(f"  Average Property Value: ${df['value'].mean():,.0f}")
    print(f"  Average Units per Property: {df['units'].mean():.1f}")
    
    # 12. PERFORMANCE METRICS
    print("\n⚡ 12. PERFORMANCE METRICS")
    print("-" * 30)
    
    # Calculate various performance metrics
    df['revenue_potential'] = df['units'] * 1500  # Assume $1500/unit/month
    df['cap_rate_estimate'] = (df['revenue_potential'] * 12) / df['value'] * 100
    
    performance_summary = df.groupby('type').agg({
        'cap_rate_estimate': 'mean',
        'value_per_unit': 'mean',
        'occupancy_rate': 'mean'
    }).round(2)
    
    print("Performance by Property Type:")
    print(performance_summary)
    
    return df

def create_sample_analytics_report(df):
    """Create a comprehensive analytics report"""
    print("\n📈 COMPREHENSIVE ANALYTICS REPORT")
    print("=" * 50)
    
    # Market analysis
    market_analysis = {
        'total_properties': len(df),
        'total_value': df['value'].sum(),
        'avg_property_value': df['value'].mean(),
        'median_property_value': df['value'].median(),
        'total_units': df['units'].sum(),
        'avg_units_per_property': df['units'].mean(),
        'property_types': df['type'].value_counts().to_dict(),
        'value_by_type': df.groupby('type')['value'].sum().to_dict(),
        'largest_property': df.loc[df['value'].idxmax(), 'name'],
        'most_units': df.loc[df['units'].idxmax(), 'name']
    }
    
    print("🏢 Market Analysis:")
    for key, value in market_analysis.items():
        if isinstance(value, (int, float)) and key.endswith('value'):
            print(f"  {key}: ${value:,.0f}")
        elif isinstance(value, float):
            print(f"  {key}: {value:.1f}")
        else:
            print(f"  {key}: {value}")
    
    return market_analysis

if __name__ == "__main__":
    print("🐼 PANDAS ANALYTICS SHOWCASE")
    print("Loading property data...")
    
    df = load_property_data()
    
    if not df.empty:
        # Run analytics showcase
        df_analyzed = property_analytics_showcase(df)
        
        # Generate comprehensive report
        report = create_sample_analytics_report(df_analyzed)
        
        print("\n🎯 ANALYTICS COMPLETE!")
        print("Your DataFrame now has additional calculated columns:")
        print("- occupancy_rate")
        print("- value_per_unit") 
        print("- size_category")
        print("- revenue_potential")
        print("- cap_rate_estimate")
        
    else:
        print("Run 'python test_dataframe.py' first to create sample data!")
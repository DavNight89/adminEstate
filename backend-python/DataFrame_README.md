# DataFrame Service

A separate pandas-based data storage system for your property management app. This is designed as a learning exercise and can be integrated later.

## 🚀 Features

### Data Storage
- **Persistent Storage**: Data saved to CSV files
- **Fast Querying**: Pandas DataFrame operations
- **Data Analytics**: Built-in analytics functions
- **Export Capabilities**: Export to Excel, CSV

### Advantages over In-Memory Lists
- ✅ **Persistent**: Data survives server restarts
- ✅ **Fast Filtering**: Pandas optimized operations
- ✅ **Analytics Ready**: Built-in data analysis
- ✅ **Export Options**: Excel, CSV export
- ✅ **Scalable**: Handles larger datasets

## 📁 Files Structure

```
backend-python/
├── services/
│   ├── dataframe_service.py     # Main DataFrame service
│   └── database.py              # Original in-memory service
├── api/
│   ├── dataframe_api.py         # DataFrame API endpoints
│   └── properties.py            # Original API endpoints
├── test_dataframe.py            # Test script
└── dataframe_data/              # Data storage directory (created automatically)
    ├── properties.csv
    ├── tenants.csv
    ├── workorders.csv
    ├── transactions.csv
    └── documents.csv
```

## 🧪 Testing the DataFrame Service

1. **Install dependencies** (pandas is already in requirements.txt):
   ```bash
   cd backend-python
   pip install -r requirements.txt
   ```

2. **Run the test script**:
   ```bash
   python test_dataframe.py
   ```

3. **Check the results**:
   - CSV files created in `dataframe_data/` folder
   - Excel export created
   - Console output showing analytics

## 🌐 API Endpoints (Separate from Main App)

The DataFrame service has its own API endpoints under `/dataframe`:

```
GET  /dataframe/properties          # Get all properties
POST /dataframe/properties          # Create property  
GET  /dataframe/properties/{id}     # Get specific property
GET  /dataframe/analytics           # Property analytics
GET  /dataframe/occupancy-trends    # Occupancy analysis
GET  /dataframe/data-summary        # Data overview
POST /dataframe/export-excel        # Export to Excel
GET  /dataframe/health              # Service health check
```

## 📊 Analytics Features

The DataFrame service includes advanced analytics:

```python
# Property Analytics
{
    "total_properties": 3,
    "total_units": 54,
    "total_occupied": 0,
    "occupancy_rate": 0,
    "total_revenue": 0,
    "avg_revenue_per_property": 0,
    "property_types": {"apartment": 1, "office": 1, "condo": 1}
}

# Occupancy Trends
{
    "avg_occupancy": 0,
    "min_occupancy": 0,
    "max_occupancy": 0
}
```

## 🔧 Integration Options

### Option 1: Replace Current Service
Replace the in-memory database service with DataFrame service:

```python
# In main.py, change from:
from services.database import db_service

# To:
from services.dataframe_service import df_service as db_service
```

### Option 2: Dual Service
Run both services side by side for comparison.

### Option 3: Gradual Migration
Use DataFrame service for new features, keep original for existing functionality.

## 💡 Learning Benefits

1. **Pandas Skills**: Learn DataFrame operations
2. **Data Persistence**: Understand file-based storage
3. **Analytics**: Practice data analysis
4. **API Design**: Compare different service implementations
5. **Architecture**: Understand service abstraction

## 🎯 Next Steps

1. **Run the test**: `python test_dataframe.py`
2. **Explore the CSV files**: Check `dataframe_data/` folder
3. **Try the analytics**: See what insights you can get
4. **Add more features**: Extend with your own analytics
5. **Consider integration**: Decide if you want to use this instead

## 🚦 Current Status

- ✅ **Separate Implementation**: Independent of main app
- ✅ **Basic CRUD**: Properties create/read operations
- ✅ **Analytics**: Property analysis functions
- ✅ **Persistence**: CSV file storage
- ✅ **Export**: Excel export functionality
- 🔄 **Integration**: Ready for integration when desired

This DataFrame service gives you a taste of pandas data manipulation and could serve as a more robust backend storage solution!
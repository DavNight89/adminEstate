# 🚀 Interactive Backend API Guide for Property Management System

## 🌟 Overview

Your property management system has **three powerful backend options** with interactive features:

1. **FastAPI Backend** - Full-featured with Swagger UI (Demo)
2. **Flask DataFrame Backend (line 263)** - Pandas-powered analytics
3. **Interactive Testing Tools** - Custom scripts and utilities

---

## 1. 🎯 FastAPI Interactive Documentation (demo)

### Start the FastAPI Server
```bash
cd c:\Users\davio\houzi-app\backend-python
python main.py
```

### Access Interactive Features
- **📚 Swagger UI**: http://localhost:8000/docs
- **📖 ReDoc**: http://localhost:8000/redoc
- **🔧 API Base**: http://localhost:8000

### Key Interactive Features:

#### 🏠 Property Management
```bash
# Get all properties
GET /api/properties

# Add new property
POST /api/properties
{
  "name": "New Property",
  "address": "123 Test St",
  "type": "apartment",
  "units": 10,
  "purchase_price": 500000,
  "monthly_revenue": 8000
}

# Update property
PUT /api/properties/{property_id}

# Delete property
DELETE /api/properties/{property_id}

# 🔍 HOW TO GET PROPERTY ID:
# Method 1: Get all properties first
GET /api/properties
# Look for the "id" field in the response

# Method 2: Property ID is returned when you create one
POST /api/properties → Returns new property with ID

# Method 3: Search by name/address to find specific ID
```

#### 👥 Tenant Management
```bash
# Get all tenants
GET /api/tenants

# Add tenant
POST /api/tenants
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "555-0123",
  "property_id": "property-id-here",
  "unit": "101",
  "rent": 1200,
  "lease_start": "2025-01-01",
  "lease_end": "2025-12-31"
}
```

#### 🔧 Work Orders
```bash
# Get work orders
GET /api/workorders

# Create work order
POST /api/workorders
{
  "title": "Fix Kitchen Sink",
  "description": "Sink is leaking",
  "property_id": "property-id",
  "priority": "high",
  "estimated_cost": 150
}
```

#### 📊 Advanced Analytics
```bash
# Dashboard stats
GET /api/analytics/dashboard/quick-stats

# Financial trends
GET /api/analytics/financial/trends

# Property performance
GET /api/analytics/properties/occupancy-report

# Rent forecasting
GET /api/analytics/predictions/rent-forecast
```

---

## 1.5. 🔍 How to Get Property IDs

### Problem: Need Property ID for Updates/Deletes
The `PUT /api/properties/{property_id}` and `DELETE /api/properties/{property_id}` endpoints require a property ID, but how do you get it?

### Solution Methods:

#### Method 1: List All Properties (Most Common)
```bash
# Get all properties with their IDs
GET /api/properties

# Example Response:
{
  "success": true,
  "data": [
    {
      "id": "ac446fa8-7b2e-4c8a-9f1e-1234567890ab",  ← This is the Property ID
      "name": "Sunset Apartments",
      "address": "123 Main St",
      "monthlyRevenue": 5000,
      "purchasePrice": 800000
    },
    {
      "id": "b1234567-89ab-cdef-0123-456789abcdef",  ← Another Property ID
      "name": "Casa Zai",
      "address": "222 17th St. N Gusta, Mi"
    }
  ]
}
```

#### Method 2: Property ID Returned on Creation
```bash
# When you create a property, the ID is returned
POST /api/properties
{
  "name": "New Property",
  "address": "123 Test St"
}

# Response includes the new ID:
{
  "success": true,
  "data": {
    "id": "c9876543-21ba-fedc-0987-654321fedcba",  ← Save this ID!
    "name": "New Property",
    "address": "123 Test St",
    "created_at": "2025-10-17T12:00:00"
  }
}
```

### PowerShell Examples:

#### Get Property IDs with PowerShell
```powershell
# Get all properties and show ID + name
$properties = Invoke-RestMethod -Uri "http://localhost:5000/api/properties"
$properties.data | ForEach-Object { 
    Write-Host "ID: $($_.id)" 
    Write-Host "Name: $($_.name)"
    Write-Host "---"
}

# Find specific property by name
$properties.data | Where-Object { $_.name -like "*Sunset*" } | Select-Object id, name

# Store ID for later use
$sunsetId = ($properties.data | Where-Object { $_.name -eq "Sunset Apartments" }).id
Write-Host "Sunset Apartments ID: $sunsetId"
```

#### Update Property Using ID
```powershell
# First, get the property ID
$properties = Invoke-RestMethod -Uri "http://localhost:5000/api/properties"
$propertyId = ($properties.data | Where-Object { $_.name -eq "Sunset Apartments" }).id

# Then update using that ID
$updates = @{
    monthlyRevenue = 5500
    occupied = 8
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:5000/api/properties/$propertyId" `
  -Method Put `
  -ContentType "application/json" `
  -Body $updates
```

### Browser/Swagger UI Method:

#### Using FastAPI Swagger UI
1. **Open**: http://localhost:8000/docs
2. **Find**: `GET /api/properties` endpoint
3. **Click**: "Try it out"
4. **Execute**: Click "Execute" button
5. **Copy ID**: From the response, copy the `"id"` field
6. **Use ID**: Paste into `PUT /api/properties/{property_id}` endpoint

### JavaScript/Frontend Method:
```javascript
// Get properties and extract IDs
const fetchPropertyId = async (propertyName) => {
  const response = await fetch('http://localhost:5000/api/properties');
  const data = await response.json();
  
  const property = data.data.find(p => p.name === propertyName);
  return property ? property.id : null;
};

// Update property by name
const updatePropertyByName = async (propertyName, updates) => {
  const propertyId = await fetchPropertyId(propertyName);
  
  if (propertyId) {
    const response = await fetch(`http://localhost:5000/api/properties/${propertyId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });
    return response.json();
  }
};

// Usage
updatePropertyByName("Sunset Apartments", { monthlyRevenue: 5500 });
```

### Quick ID Lookup Script:
```bash
# Create a quick lookup script
cd c:\Users\davio\houzi-app\backend-python

# PowerShell one-liner to find property ID
powershell -Command "
$props = Invoke-RestMethod 'http://localhost:5000/api/properties';
$props.data | Format-Table id, name -AutoSize
"
```

### Pro Tips for Managing Property IDs:

1. **📋 Always List First**: Run `GET /api/properties` to see all IDs
2. **💾 Save IDs When Creating**: Store the returned ID when adding properties  
3. **🔍 Search by Name**: Use property name to find the right ID
4. **📝 Keep a Reference**: Maintain a list of property names → IDs
5. **🔄 Use Variables**: Store frequently used IDs in variables

----------

## 2. 🐼 Flask DataFrame Backend (Pandas-Powered)

### Start the DataFrame Server
```bash
cd c:\Users\davio\houzi-app\backend-python
python app_frontend_compatible.py
```

### Access Points
- **🔧 API Base**: http://localhost:5000
- **📊 Properties**: http://localhost:5000/api/properties
- **📈 Analytics**: http://localhost:5000/api/analytics/dashboard

### Pandas Analytics Endpoints

#### 📊 Dashboard Analytics
```bash
# Comprehensive dashboard data
GET http://localhost:5000/api/analytics/dashboard

Response:
{
  "success": true,
  "data": {
    "total_properties": 4,
    "total_portfolio_value": 3800000,
    "total_monthly_revenue": 20000,
    "avg_cap_rate": 6.32,
    "occupancy_rate": 2.5
  }
}
```

#### 🏢 Property Type Analysis
```bash
# Analysis by property type
GET http://localhost:5000/api/analytics/property-types

Response:
{
  "success": true,
  "data": {
    "apartment": {
      "property_count": 2,
      "total_value": 1800000,
      "avg_cap_rate": 5.2
    }
  }
}
```

#### 🏆 Performance Rankings
```bash
# Top performing properties
GET http://localhost:5000/api/analytics/rankings

Response:
{
  "data": {
    "top_by_value": [...],
    "top_by_revenue": [...],
    "top_by_cap_rate": [...]
  }
}
```

#### 📈 Portfolio Composition
```bash
# Portfolio breakdown
GET http://localhost:5000/api/analytics/portfolio

Response:
{
  "data": {
    "by_value": {"apartment": 45.2, "house": 54.8},
    "by_count": {"apartment": 50.0, "house": 50.0}
  }
}
```

#### 🔗 Correlation Analysis
```bash
# Property metrics correlations
GET http://localhost:5000/api/analytics/correlations

Response:
{
  "data": {
    "correlation_matrix": {...},
    "strong_correlations": [...]
  }
}
```

#### 🧹 Data Management
```bash
# Check for duplicates
GET http://localhost:5000/api/data/stats

# Clean duplicates
POST http://localhost:5000/api/data/clean-duplicates
```

---

## 3. 🛠️ Interactive Testing Tools

### Duplicate Detection & Cleanup
```bash
cd c:\Users\davio\houzi-app\backend-python
python fix_duplicates.py
```

**Features:**
- ✅ Detects duplicate properties
- 🧹 Interactive cleanup
- 📊 Data statistics
- 📋 Data preview

### Frontend Compatibility Test
```bash
python test_frontend_compatibility.py
```

**Features:**
- ✅ Tests DataFrame service
- 📊 Sample data creation
- 🔄 CRUD operations
- 📈 Analytics testing

---

## 4. 🌐 Browser-Based Testing

### Using Swagger UI (Recommended)

1. **Start FastAPI**: `python main.py`
2. **Open**: http://localhost:8000/docs
3. **Interactive Features**:
   - 🎯 **Try It Out** buttons for each endpoint
   - 📝 **Request/Response** examples
   - 🔧 **Parameter** input forms
   - 📊 **Response** formatting

### Example Workflow in Swagger:

1. **📊 Check System Health**
   ```
   GET /health → "OK"
   ```

2. **🏠 Get Properties**
   ```
   GET /api/properties → Property list
   ```

3. **➕ Add Property**
   ```
   POST /api/properties
   Fill in the form with property details
   ```

4. **📈 View Analytics**
   ```
   GET /api/analytics/dashboard/quick-stats
   ```

---

## 5. 💻 Command Line Testing

### Using curl (Windows PowerShell)
```powershell
# Test health
curl http://localhost:8000/health

# Get properties (FastAPI)
curl http://localhost:8000/api/properties

# Get properties (Flask DataFrame)
curl http://localhost:5000/api/properties

# Get analytics
curl http://localhost:5000/api/analytics/dashboard

# Add property
curl -X POST http://localhost:5000/api/properties `
  -H "Content-Type: application/json" `
  -d '{
    "name": "Test Property",
    "address": "123 Test St",
    "type": "apartment",
    "units": 5,
    "monthlyRevenue": 3000,
    "purchasePrice": 400000
  }'
```

### Using Invoke-RestMethod (PowerShell)
```powershell
# Get properties
$properties = Invoke-RestMethod -Uri "http://localhost:5000/api/properties"
$properties

# Get analytics
$analytics = Invoke-RestMethod -Uri "http://localhost:5000/api/analytics/dashboard"
$analytics.data

# Add property
$newProperty = @{
    name = "PowerShell Property"
    address = "456 PS Ave"
    type = "house"
    units = 1
    monthlyRevenue = 2500
    purchasePrice = 350000
}

Invoke-RestMethod -Uri "http://localhost:5000/api/properties" `
  -Method Post `
  -ContentType "application/json" `
  -Body ($newProperty | ConvertTo-Json)
```

---

## 6. 🔌 Frontend Integration

### React Component Example
```javascript
// Example: Using the analytics endpoints in React
const AnalyticsComponent = () => {
  const [analytics, setAnalytics] = useState({});

  useEffect(() => {
    // Fetch Pandas analytics
    fetch('http://localhost:5000/api/analytics/dashboard')
      .then(res => res.json())
      .then(data => setAnalytics(data.data));
  }, []);

  return (
    <div>
      <h2>Portfolio Analytics</h2>
      <p>Total Properties: {analytics.total_properties}</p>
      <p>Portfolio Value: ${analytics.total_portfolio_value?.toLocaleString()}</p>
      <p>Monthly Revenue: ${analytics.total_monthly_revenue?.toLocaleString()}</p>
      <p>Average Cap Rate: {analytics.avg_cap_rate?.toFixed(2)}%</p>
    </div>
  );
};
```

### Connecting Your Existing App
```javascript
// Update your existing Properties component
const Properties = () => {
  const [properties, setProperties] = useState([]);

  useEffect(() => {
    // Switch from localStorage to backend API
    fetch('http://localhost:5000/api/properties')
      .then(res => res.json())
      .then(data => setProperties(data.data || data));
  }, []);

  // Rest of your component...
};
```

---

## 7. 🧪 Testing Scenarios

### Scenario 1: Complete Property Lifecycle
```bash
# 1. Add property
POST /api/properties → Create new property

# 2. Add tenant
POST /api/tenants → Add tenant to property

# 3. Create work order
POST /api/workorders → Report maintenance issue

# 4. Record transaction
POST /api/transactions → Log rent payment

# 5. View analytics
GET /api/analytics/dashboard → See updated metrics
```

### Scenario 2: Data Analysis Workflow
```bash
# 1. Get raw data
GET /api/properties → Raw property list

# 2. Get analytics
GET /api/analytics/dashboard → Processed metrics

# 3. Get rankings
GET /api/analytics/rankings → Performance rankings

# 4. Get correlations
GET /api/analytics/correlations → Data relationships

# 5. Export report
GET /api/analytics/reports/export → Download Excel/PDF
```

---

## 8. 🔧 Advanced Features

### Document Processing (FastAPI)
```bash
# Upload and process documents
POST /api/documents/upload
- Upload PDF lease agreements
- Automatic text extraction
- Key information parsing
```

### Predictive Analytics (FastAPI)
```bash
# Rent forecasting
GET /api/analytics/predictions/rent-forecast

# Maintenance cost prediction
GET /api/analytics/predictions/maintenance-costs
```

### Real-time Notifications
```bash
# Generate smart notifications
GET /api/analytics/notifications/generate
```

---

## 9. 🚀 Quick Start Commands

### Option A: Full FastAPI Experience
```bash
cd c:\Users\davio\houzi-app\backend-python
python main.py
# Open: http://localhost:8000/docs
```

### Option B: DataFrame Analytics Focus
```bash
cd c:\Users\davio\houzi-app\backend-python
python app_frontend_compatible.py
# Test: http://localhost:5000/api/analytics/dashboard
```

### Option C: Data Cleanup & Testing
```bash
cd c:\Users\davio\houzi-app\backend-python
python fix_duplicates.py
python test_frontend_compatibility.py
```

---

## � Property ID Quick Reference

### Most Common Use Cases:

#### 1. Quick ID Lookup (PowerShell)
```powershell
# List all properties with IDs
$props = Invoke-RestMethod "http://localhost:5000/api/properties"
$props.data | Select-Object id, name | Format-Table

# Find specific property ID
$sunsetId = ($props.data | Where-Object name -eq "Sunset Apartments").id
```

#### 2. Interactive ID Manager
```bash
# Run the property ID management tool
cd c:\Users\davio\houzi-app\backend-python
python property_id_manager.py
```

#### 3. Command Line ID Finder
```bash
# List all properties
python property_id_manager.py list

# Find specific property
python property_id_manager.py find "Sunset Apartments"

# Search properties
python property_id_manager.py search "apartment"
```

### Real-World Update Examples:

#### Update Monthly Revenue
```powershell
# Method 1: If you know the ID
$propertyId = "ac446fa8-7b2e-4c8a-9f1e-1234567890ab"
$updates = @{ monthlyRevenue = 5500 } | ConvertTo-Json
Invoke-RestMethod -Uri "http://localhost:5000/api/properties/$propertyId" -Method Put -ContentType "application/json" -Body $updates

# Method 2: Find ID first
$props = Invoke-RestMethod "http://localhost:5000/api/properties"
$id = ($props.data | Where-Object name -eq "Sunset Apartments").id
$updates = @{ monthlyRevenue = 5500 } | ConvertTo-Json  
Invoke-RestMethod -Uri "http://localhost:5000/api/properties/$id" -Method Put -ContentType "application/json" -Body $updates
```

#### Update Multiple Fields
```powershell
$props = Invoke-RestMethod "http://localhost:5000/api/properties"
$id = ($props.data | Where-Object name -like "*Casa*").id

$updates = @{
    monthlyRevenue = 6000
    occupied = 15
    units = 20
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:5000/api/properties/$id" -Method Put -ContentType "application/json" -Body $updates
```

---

## �🎯 Pro Tips

1. **🔄 Use Both Backends**: FastAPI for full features, Flask for analytics
2. **📊 Start with Swagger**: Best way to explore API capabilities
3. **🧹 Clean Data First**: Run `fix_duplicates.py` before analytics
4. **📈 Monitor Performance**: Check `/api/data/stats` regularly
5. **🔗 Integrate Gradually**: Connect one component at a time
6. **🆔 Always Get ID First**: Run `GET /api/properties` before PUT/DELETE operations
7. **💾 Use the ID Manager**: `python property_id_manager.py` for easy ID management

---

## 🆘 Troubleshooting

### Port Conflicts
```bash
# If port 5000 is busy
netstat -ano | findstr :5000
# Kill process or change port in app
```

### CORS Issues
```bash
# Frontend can't connect
# Check CORS settings in Flask/FastAPI
# Ensure frontend runs on http://localhost:3000
```

### Data Issues
```bash
# Clean duplicates
python fix_duplicates.py

# Reset data
# Delete dataframe_data_compatible/ folder
# Restart server to recreate clean data
```

---

## 🔄 Cross-Backend Property ID Usage

### **Can Flask Property IDs be used in FastAPI Swagger UI?**

**Short Answer**: Currently **NO** - but here's how to make it work!

#### **The Current Setup:**

1. **🐼 Flask Backend** (`localhost:5000`):
   - Uses **DataFrame/CSV** storage 
   - Property IDs like: `0505734f-1f56-4d3b-8e53-6fc8895fd355`

2. **🚀 FastAPI Backend** (`localhost:8000`):
   - Uses **in-memory** storage (separate from Flask)
   - Swagger UI at: `/docs#/Properties`

**Problem**: They have **separate data stores!**

---

### **Testing Property ID Cross-Usage**

#### **Demo: Why IDs Don't Work Cross-Backend**

1. **Get Flask Property ID**:
   ```bash
   python property_id_manager.py find "Casa Zai"
   # Result: 0505734f-1f56-4d3b-8e53-6fc8895fd355
   ```

2. **Try Using in FastAPI Swagger**:
   - Open: http://localhost:8000/docs#/Properties
   - Use: GET /api/properties/{property_id}
   - Enter: `0505734f-1f56-4d3b-8e53-6fc8895fd355`
   - **Result**: `404 Not Found` ❌

**Why?** FastAPI and Flask have **different databases!**

---

### **Solutions: Making Property IDs Work Cross-Backend**

#### **Solution 1: Unified Data Source (Best)**

Modify FastAPI to use the DataFrame service:

```python
# Update services/database.py
from test_frontend_compatibility import FrontendCompatibleDataFrameService

class DatabaseService:
    def __init__(self):
        # Use SAME DataFrame service as Flask
        self.df_service = FrontendCompatibleDataFrameService()
        print("🔗 FastAPI now using DataFrame storage")
    
    async def get_property(self, property_id: str):
        properties = self.df_service.get_properties_for_frontend()
        return next((p for p in properties if p['id'] == property_id), None)
```

#### **Solution 2: Data Synchronization Script**

```python
# sync_backends.py
import requests

def sync_flask_to_fastapi():
    """Copy properties from Flask to FastAPI"""
    # Get from Flask
    flask_props = requests.get("http://localhost:5000/api/properties").json()
    
    # Add to FastAPI
    for prop in flask_props.get('data', []):
        try:
            response = requests.post("http://localhost:8000/api/properties", json=prop)
            print(f"✅ Synced: {prop['name']}")
        except Exception as e:
            print(f"❌ Failed: {prop['name']} - {e}")

# Usage
sync_flask_to_fastapi()
```

#### **Solution 3: Use Flask for Everything**

**Simplest approach**: Use only the Flask backend for now!

```javascript
// In your React app, use only Flask endpoints
const API_BASE = "http://localhost:5000";

// All operations use Flask
fetch(`${API_BASE}/api/properties`)
fetch(`${API_BASE}/api/analytics/dashboard`)
```

---

### **Working Example: Unified Property Management**

Here's a complete workflow that works:

#### **Step 1: Use Flask for Property Operations**
```powershell
# Get property ID
$props = Invoke-RestMethod "http://localhost:5000/api/properties"
$casaId = ($props.data | Where-Object name -eq "Casa Zai").id

# Update using Flask API
$updates = @{ monthlyRevenue = 7000 } | ConvertTo-Json
Invoke-RestMethod -Uri "http://localhost:5000/api/properties/$casaId" -Method Put -ContentType "application/json" -Body $updates
```

#### **Step 2: Verify with Analytics**
```powershell
# Check updated analytics
Invoke-RestMethod "http://localhost:5000/api/analytics/dashboard"
```

#### **Step 3: (Optional) FastAPI for Advanced Features**
```bash
# Use FastAPI for document processing, ML features
curl -X POST "http://localhost:8000/api/documents/upload" -F "file=@lease.pdf"
```

---

### **Recommendation: Choose Your Primary Backend**

#### **For Property Management Focus**: Use Flask Backend
- ✅ **Pandas analytics** ready
- ✅ **DataFrame storage** reliable  
- ✅ **Property ID management** tools included
- ✅ **Frontend compatible** schema

#### **For Advanced Features**: Add FastAPI Later
- 🔄 **Document processing**
- 🤖 **Machine learning**
- 📊 **Advanced reporting**
- 🔍 **Full-text search**

---

### **Quick Test: Property ID Workflow**

```bash
# 1. Start Flask backend
cd c:\Users\davio\houzi-app\backend-python
python app_frontend_compatible.py

# 2. Get property IDs
python property_id_manager.py list

# 3. Test specific property
python property_id_manager.py find "Casa Zai"

# 4. Use ID for updates via Flask API
# (Use PowerShell examples above)

# 5. Verify in analytics
curl http://localhost:5000/api/analytics/dashboard
```

**Result**: ✅ Complete property management workflow using consistent IDs!

Your property management system now has powerful interactive features ready to use! 🚀

🤔 Should You Integrate FastAPI?
Option 1: Keep Flask as Main (Recommended)
Pros:

✅ Already working perfectly
✅ Pandas analytics integrated
✅ DataFrame storage reliable
✅ Frontend compatibility tested
Use FastAPI for:

🔬 Testing API concepts
📚 Learning API documentation
🚀 Future advanced features
Option 2: Migrate to FastAPI (Future)
When to consider:

Need advanced document processing
Want machine learning features
Require high-performance async operations
Need complex API documentation
Option 3: Hybrid Approach
Keep Flask for core property management
Add FastAPI for specialized features
Use API gateway to coordinate
🛠️ Current Best Practice:
For Daily Property Management:

# Use Flask backend (your main app)
cd c:\Users\davio\houzi-app\backend-python
python app_frontend_compatible.py

# Property operations
python property_id_manager.py list
python property_id_manager.py find "Casa Zai"

# Analytics
curl http://localhost:5000/api/analytics/dashboard
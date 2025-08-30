import React, { useState, useEffect } from 'react';
import { 
  Home, Users, DollarSign, Wrench, FileText, BarChart3, 
  MessageSquare, Calendar, Settings, Plus, Search, Filter,
  Bell, Upload, Download, Edit, Eye, CheckCircle,
  AlertTriangle, Clock, Mail, MapPin, Key,
  Camera, TrendingUp, TrendingDown, Menu, X,
  ChevronRight, HelpCircle, Lightbulb, Zap
} from 'lucide-react';
import Modal from './components/Modal';
import { OccupancyMetrics, OccupancyDonutChart, OccupancyTrendChart, OccupancyByPropertyChart } from './components/OccupancyCharts';




const UserFriendlyPropertyApp = () => {

  
  const [properties, setProperties] = useState([]);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [tenants, setTenants] = useState([]);
  const [workOrders, setWorkOrders] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showTips, setShowTips] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const [formData, setFormData] = useState({});

const [dateRange, setDateRange] = useState('month');

const [transactionFilter, setTransactionFilter] = useState('all');

const handleInputChange = (field, value) => {
  let processedValue = value;
  
  // Parse numeric fields immediately
  if (['units', 'occupied'].includes(field)) {
    processedValue = parseInt(value) || 0;
  } else if (['monthlyRevenue', 'purchasePrice', 'rent', 'amount'].includes(field)) {
    processedValue = parseFloat(value) || 0;
  }
  
  setFormData(prev => ({ ...prev, [field]: processedValue }));
};

// Add this useEffect after your state declarations (around line 80):

useEffect(() => {
  // Initialize data from localStorage or default data
  const savedProperties = localStorage.getItem('properties');
  const savedTenants = localStorage.getItem('tenants');
  const savedWorkOrders = localStorage.getItem('workOrders');
  const savedTransactions = localStorage.getItem('transactions');

  setProperties(savedProperties ? JSON.parse(savedProperties) : []);
  setTenants(savedTenants ? JSON.parse(savedTenants) : []);
  setWorkOrders(savedWorkOrders ? JSON.parse(savedWorkOrders) : []);
  setTransactions(savedTransactions ? JSON.parse(savedTransactions) : []);
}, []);


// Save to localStorage whenever data changes
useEffect(() => {
    localStorage.setItem('properties', JSON.stringify(properties));
}, [properties]);

useEffect(() => {
    localStorage.setItem('tenants', JSON.stringify(tenants));
}, [tenants]);

useEffect(() => {
    localStorage.setItem('workOrders', JSON.stringify(workOrders));
}, [workOrders]);

useEffect(() => {
    localStorage.setItem('transactions', JSON.stringify(transactions));
}, [transactions]);

// Add this useEffect after line 74 (after formData state):

useEffect(() => {
  // Pre-populate form data when modal opens in edit mode
  if (modalType === 'editProperty' && selectedItem) {
    setFormData({
      name: selectedItem.name,
      address: selectedItem.address,
      type: selectedItem.type,
      units: selectedItem.units,
      purchasePrice: selectedItem.purchasePrice || ''
    });
  } else if (modalType === 'editTransaction' && selectedItem) {
    setFormData({
      type: selectedItem.type,
      description: selectedItem.description,
      amount: Math.abs(selectedItem.amount),
      property: selectedItem.property || '',
      tenant: selectedItem.tenant || '',
      category: selectedItem.category || '',
      date: selectedItem.date
    });
  } else if (!selectedItem) {
    setFormData({});
  }
}, [modalType, selectedItem]);

  
// Replace the problematic useEffect (around line 202) with:
useEffect(() => {
  // Only sync when tenants change, not when properties change (to avoid loop)
    const updatedProperties = properties.map(property => {
      const propertyTenants = tenants.filter(t => t.property === property.name && t.status === 'Current');
      const monthlyRevenue = propertyTenants.reduce((sum, t) => sum + (t.rent || 0), 0);
      
      if (property.monthlyRevenue !== monthlyRevenue) {
        return { ...property, monthlyRevenue };
      }
      return property;
    });
    
    // Only update if there are actual changes<<<<<<<<<<<<<<<<<
    const hasChanges = updatedProperties.some((prop, index) => 
      prop.monthlyRevenue !== properties[index].monthlyRevenue
    );
    
    if (hasChanges) {
      setProperties(updatedProperties);
    }
},);
 // ← Only depend on tenants, not properties


const openModal = (type, item = null) => {
  setModalType(type);
  setSelectedItem(item);


  setShowModal(true);
};
  

// Update your addTenant function (around line 155):
const addTenant = (newTenant) => {
  const selectedProperty = properties.find(p => p.id === newTenant.property);
  
  const newTenantData = { 
    ...newTenant, 
    id: Date.now(),
    avatar: newTenant.name.split(' ').map(n => n[0]).join(''),
    status: 'Current',
    balance: 0,
    unit: newTenant.unit,
    property: selectedProperty?.name || 'Unknown Property',
    rent: parseFloat(newTenant.rent) || 0
  };
  
  const updatedTenants = [...tenants, newTenantData];
  setTenants(prev => [...prev, newTenantData]);

  localStorage.setItem('tenants', JSON.stringify(updatedTenants));
  console.log('Tenant saved to localStorage:', newTenantData);

  // Update property with new tenant and recalculate monthly revenue
  if (newTenant.property) {
    const updatedProperties = properties.map(property => {
      if (property.id === newTenant.property) {
        return {
          ...property, 
          occupied: property.occupied + 1 
        };
      }
      return property;
    });
    
    setProperties(updatedProperties);
    localStorage.setItem('properties', JSON.stringify(updatedProperties));
  }
};

const addTransaction = (newTransaction) => {
  const transaction = {
    ...newTransaction,
    id: Date.now(),
    date: newTransaction.date || new Date().toISOString().split('T')[0],
    status: 'completed'
  };

  const updatedTransactions = [...transactions, transaction];
  setTransactions(updatedTransactions);
  
  // Immediately save to localStorage
  localStorage.setItem('transactions', JSON.stringify(updatedTransactions));
  console.log('Transaction saved to localStorage:', transaction);

  // If it's income, update the related property's revenue
  if (transaction.type === 'income' && transaction.property) {
    setProperties(prev => prev.map(property => {
      if (property.name === transaction.property) {
        return {
          ...property,
        };
      }
      return property;
    }));
  }
};

const updateTransaction = (updatedTransaction) => {
  setTransactions(prev => prev.map(transaction => 
    transaction.id === selectedItem.id 
      ? { ...transaction, ...updatedTransaction }
      : transaction
  ));
};

const deleteTransaction = (transactionId) => {
  setTransactions(prev => prev.filter(transaction => transaction.id !== transactionId));
};

// Add these functions if they're missing:

const addWorkOrder = (newWorkOrder) => {
  const selectedProperty = properties.find(p => p.id === newWorkOrder.property);
  
  const workOrder = {
    ...newWorkOrder,
    id: Date.now(),
    status: 'Open',
    dateSubmitted: new Date().toISOString().split('T')[0],
    property: selectedProperty?.name || 'Unknown Property', 
    tenant: tenants.find(t => t.unit === newWorkOrder.unit && t.property === selectedProperty?.name)?.name || 'Unknown'
  };
  
  const updatedWorkOrders = [...workOrders, workOrder];
  setWorkOrders(updatedWorkOrders);
  
  // Immediately save to localStorage
  localStorage.setItem('workOrders', JSON.stringify(updatedWorkOrders));
  console.log('Work order saved to localStorage:', workOrder);
};

const updateProperty = (updatedProperty) => {
  const processedProperty = {
    ...updatedProperty,
    units: parseInt(updatedProperty.units) || selectedItem.units,
    occupied: parseInt(updatedProperty.occupied) || selectedItem.occupied,
    monthlyRevenue: parseFloat(updatedProperty.monthlyRevenue) || selectedItem.monthlyRevenue,
    purchasePrice: parseFloat(updatedProperty.purchasePrice) || selectedItem.purchasePrice
  };
  
  setProperties(prev => prev.map(property => 
    property.id === selectedItem.id 
      ? { ...property, ...processedProperty }  // ← Use processedProperty, not updatedProperty
      : property
  ));
  console.log('Property updated:', processedProperty);
};

const addProperty = (newProperty) => {
  const property = {
    ...newProperty,
    id: Date.now(),
    occupied: 0,
    units: parseInt(newProperty.units) || 0,
    monthlyRevenue: 0, 
    purchasePrice: parseFloat(newProperty.purchasePrice) || 0    // ← Also fix this
  };
  
  const updatedProperties = [...properties, property];
  setProperties(prev => [...prev, property]);

  localStorage.setItem('properties', JSON.stringify(updatedProperties));
  console.log('Property saved to localStorage:', property);
};

// Add this after getFinancialStats function (around line 230):

const getComprehensiveFinancialStats = () => {
  // Calculate income from transactions (actual payments received)
  const transactionIncome = transactions
    .filter(t => t.type === 'income' && t.amount > 0)
    .reduce((sum, t) => sum + t.amount, 0);

  // Calculate potential income from tenant rents
  const potentialMonthlyIncome = tenants
    .filter(t => t.status === 'Current')
    .reduce((sum, t) => sum + (parseFloat(t.rent) || 0), 0);

  // Use the potential income as primary source
  const actualMonthlyIncome = potentialMonthlyIncome;

  const monthlyExpenses = transactions
    .filter(t => t.type === 'expense' && t.amount < 0)
    .reduce((sum, t) => sum + Math.abs(parseFloat(t.amount)), 0);

  const outstandingBalance = tenants
    .filter(t => t.balance < 0)
    .reduce((sum, t) => sum + Math.abs(parseFloat(t.balance)), 0);

  const netIncome = actualMonthlyIncome - monthlyExpenses;
  
  return {
    monthlyIncome: actualMonthlyIncome,
    transactionIncome,
    potentialMonthlyIncome,
    monthlyExpenses,
    outstandingBalance,
    netIncome,
    overdueCount: tenants.filter(t => t.balance < 0).length
  };
};


// Add this function after getComprehensiveFinancialStats (around line 340):
const getExpenseCategories = () => {
  const expenseCategories = [
    { id: 1, category: 'Maintenance', budget: 10000 },
    { id: 2, category: 'Utilities', budget: 4000 },
    { id: 3, category: 'Insurance', budget: 2000 }
  ];

  return expenseCategories.map(cat => {
    const amount = transactions
      .filter(t => t.type === 'expense' && t.category === cat.category.toLowerCase())
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);
    
    return {
      ...cat,
      amount,
      percentage: (amount / cat.budget) * 100
    };
  });
};

// Add this function after getExpenseCategories:
const getDynamicNotifications = () => {
  const notifications = [];
  
  // Add overdue payment notifications
  tenants.filter(t => t.balance < 0).forEach(tenant => {
    notifications.push({
      id: `overdue-${tenant.id}`,
      message: `Rent due from ${tenant.name}`,
      type: "warning",
      time: "overdue"
    });
  });
  
  // Add urgent work order notifications
  workOrders.filter(wo => wo.status === 'Open' && wo.priority === 'High').forEach(order => {
    notifications.push({
      id: `urgent-${order.id}`,
      message: `Urgent work order: ${order.issue}`,
      type: "alert",
      time: order.dateSubmitted
    });
  });
  
  // Add completed work order notifications
  workOrders.filter(wo => wo.status === 'Completed').slice(0, 2).forEach(order => {
    notifications.push({
      id: `completed-${order.id}`,
      message: `Work order completed for ${order.unit}`,
      type: "success",
      time: "1 day ago"
    });
  });
  
  return notifications.slice(0, 5); // Limit to 5 notifications
};

// Update filteredTransactions to actually use dateRange:
const filteredTransactions = () => {
  const now = new Date();
  const filterDate = new Date();
  
  // Calculate date threshold based on dateRange
  switch(dateRange) {
    case 'week':
      filterDate.setDate(now.getDate() - 7);
      break;
    case 'month':
      filterDate.setMonth(now.getMonth() - 1);
      break;
    case 'quarter':
      filterDate.setMonth(now.getMonth() - 3);
      break;
    case 'year':
      filterDate.setFullYear(now.getFullYear() - 1);
      break;
    default:
      filterDate.setMonth(now.getMonth() - 1);
  }
  
  return transactions.filter(transaction => {
    // Filter by type
    const typeMatch = transactionFilter === 'all' || transaction.type === transactionFilter;
    
    // Filter by date
    const transactionDate = new Date(transaction.date);
    const dateMatch = transactionDate >= filterDate;
    
    return typeMatch && dateMatch;
  });
};
  

  const closeModal = () => {
    setShowModal(false);
    setSelectedItem(null);
    setModalType('');
  };

// In your main app's handleSubmit function:
const handleSubmit = (e) => {
  e.preventDefault();

   console.log('Form submitted:', { modalType, formData });
    console.log('=== FORM SUBMISSION ===');
  console.log('Modal Type:', modalType);
  console.log('Form Data:', formData);
  console.log('Current Data Counts:', {
    properties: properties.length,
    tenants: tenants.length,
    workOrders: workOrders.length,
    transactions: transactions.length
  });

  if (modalType === 'addTenant') {
    console.log('Adding tenant:', formData);
    const tenantData = {
      ...formData,
      rent: parseFloat(formData.rent) || 0
    };
    addTenant(tenantData);
  } else if (modalType === 'addProperty') {
    console.log('Adding property:', formData);
    const propertyData = {
      ...formData,
      units: parseInt(formData.units) || 0,
      monthlyRevenue: parseFloat(formData.monthlyRevenue) || 0,
      purchasePrice: parseFloat(formData.purchasePrice) || 0
    };
    addProperty(propertyData);
  } else if (modalType === 'addWorkOrder') {
    console.log('=== ADDING WORK ORDER ===');
    console.log('Adding work order:', formData);
    addWorkOrder(formData);
  } else if (modalType === 'updateProperty') {
    console.log('=== UPDATING PROPERTY ===');
    console.log('Adding property:', formData);
    const propertyData = {
      ...formData,
      units: parseInt(formData.units) || selectedItem.units,
      occupied: parseInt(formData.occupied) || selectedItem.occupied,
      monthlyRevenue: parseFloat(formData.monthlyRevenue) || selectedItem.monthlyRevenue,
      purchasePrice: parseFloat(formData.purchasePrice) || selectedItem.purchasePrice
    };
    console.log('Processed update data:', propertyData);
    updateProperty(propertyData);
  } else if (modalType === 'addTransaction') {
    console.log('Adding transaction:', formData);
    const transactionData = {
      ...formData,
      amount: formData.type === 'expense' ? -Math.abs(parseFloat(formData.amount)) : Math.abs(parseFloat(formData.amount))
    };
    addTransaction(transactionData);
  } else if (modalType === 'editTransaction') {
    console.log('=== EDITING TRANSACTION ===');
    const transactionData = {
      ...formData,
      amount: formData.type === 'expense' ? -Math.abs(parseFloat(formData.amount)) : Math.abs(parseFloat(formData.amount))
    };
    console.log('Processed edit data:', transactionData);
    updateTransaction(transactionData);
  }
  
  closeModal();
  setFormData({});
  console.log('=== FORM SUBMISSION COMPLETE ===');
}; 

  // Quick Stats for better overview
  const getQuickStats = () => {

    const totalUnits = properties.reduce((acc, prop) => acc + prop.units || 0, 0);
    const occupiedUnits = properties.reduce((acc, prop) => acc + (prop.occupied || 0), 0);
    const financialStats = getComprehensiveFinancialStats(); 
    const occupancyRate = totalUnits > 0 ? Math.round((occupiedUnits / totalUnits) * 100) : 0;
    const urgentWorkOrders = workOrders.filter(wo => wo.priority === 'High').length;
    const overduePayments = tenants.filter(t => t.balance < 0).length;

    return {
      totalUnits,
      occupiedUnits,
      totalRevenue: financialStats.monthlyIncome,
      occupancyRate,
      urgentWorkOrders,
      overduePayments
    };
  };
  
  // Welcome Dashboard Component with better UX
  const Dashboard = () => {

    const stats = getQuickStats();
  const financialStats = getComprehensiveFinancialStats();
  const dynamicNotifications = getDynamicNotifications();

const statusCheck = tenants.map(t => ({ name: t.name, status: t.status, rent: t.rent }));
console.log('Tenant Status Check:', statusCheck);
const rentCheck = tenants.map(t => ({ 
  name: t.name, 
  rent: t.rent, 
  rentType: typeof t.rent 
}));
console.log('Rent Check:', rentCheck);
    return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 text-white">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold mb-2">Welcome! 👋
              <button 
  onClick={() => {
    console.log('=== LOCALSTORAGE DEBUG ===');
    console.log('Properties in storage:', localStorage.getItem('properties'));
    console.log('Tenants in storage:', localStorage.getItem('tenants'));
    console.log('Work orders in storage:', localStorage.getItem('workOrders'));
    console.log('Transactions in storage:', localStorage.getItem('transactions'));
    
    // Try to manually set and get
    localStorage.setItem('test', 'working');
    console.log('Test value:', localStorage.getItem('test'));
    
    // Check if localStorage is available
    console.log('localStorage available:', typeof(Storage) !== "undefined");
  }}
  className="bg-red-600 text-white p-2 rounded mb-4"
>
  Debug localStorage
</button>   
            </h2>
            <p className="text-blue-100">
              {properties.length === 0
                ? "Start by adding your first property to get started"
                : "Here's what's happening with your properties today"
              }  
            </p>
          </div>

          <button
            onClick={() => setShowTips(!showTips)}
            className="bg-white/20 hover:bg-white/30 p-3 rounded-lg transition-colors"
          >
            <Lightbulb className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Quick Tips Panel */}
      {showTips && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <div className="flex items-start">
            <Lightbulb className="w-5 h-5 text-amber-600 mt-0.5 mr-3" />
            <div>
              <h3 className="font-semibold text-amber-800 mb-1">💡 Pro Tips</h3>
              <ul className="text-sm text-amber-700 space-y-1">
                <li>• Use the search bar to quickly find tenants, properties, or work orders</li>
                <li>• Click on metric cards to see detailed breakdowns</li>
                <li>• Set up automated rent reminders in the Communication section</li>
              </ul>
            </div>
            <button 
              onClick={() => setShowTips(false)}
              className="ml-auto text-amber-600 hover:text-amber-800"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Getting Started Section - Show when no data */}
      {properties.length === 0 && (
        <div className="bg-white border-2 border-dashed border-gray-300 rounded-xl p-8 text-center">
          <div className="max-w-md mx-auto">
            <Home className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Get Started with PropertyPro</h3>
            <p className="text-gray-600 mb-6">Add your first property to begin managing your real estate portfolio</p>
            <div className="space-y-3">
              <button 
                onClick={() => openModal('addProperty')}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 flex items-center justify-center transition-colors"
              >
                <Plus className="w-5 h-5 mr-2" />
                Add Your First Property
              </button>
              <button 
                onClick={() => setShowTips(true)}
                className="w-full bg-gray-100 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-200 flex items-center justify-center transition-colors"
              >
                <HelpCircle className="w-5 h-5 mr-2" />
                Show Getting Started Tips
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Show metrics only when there's data */}
      {properties.length > 0 && (
        <>
          {/* Enhanced Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow cursor-pointer">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Home className="w-6 h-6 text-blue-600" />
                </div>
                <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded-full">
                  Active portfolio
                </span>
              </div>
              <h3 className="text-sm font-medium text-gray-600 mb-1">Total Properties</h3>
              <p className="text-2xl font-bold text-gray-900 mb-2">{properties.length}</p>
              <div className="flex items-center text-sm text-green-600">
                <TrendingUp className="w-4 h-4 mr-1" />
                Growing portfolio
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow cursor-pointer">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Key className="w-6 h-6 text-green-600" />
                </div>
                <span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded-full">
                  {stats.occupancyRate || 0}% filled
                </span>
              </div>
              <h3 className="text-sm font-medium text-gray-600 mb-1">Total Units</h3>
              <p className="text-2xl font-bold text-gray-900 mb-2">{stats.totalUnits || 0}</p>
              <div className="text-sm text-gray-600">
                {stats.occupiedUnits || 0} occupied • {(stats.totalUnits || 0) - (stats.occupiedUnits || 0)} vacant
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow cursor-pointer">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <DollarSign className="w-6 h-6 text-yellow-600" />
                </div>
                <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded-full">
                  {financialStats.netIncome > 0 ? '+' : ''}{financialStats.monthlyIncome > 0 ? ((financialStats.netIncome / financialStats.monthlyIncome) * 100).toFixed(1) : 0}% margin
                </span>
              </div>
              <h3 className="text-sm font-medium text-gray-600 mb-1">Monthly Revenue</h3>
              <p className="text-2xl font-bold text-gray-900 mb-2">
                ${financialStats.monthlyIncome.toLocaleString()}
              </p>
              <div className="flex items-center text-sm text-green-600">
                <TrendingUp className="w-4 h-4 mr-1" />
                ${financialStats.netIncome.toLocaleString()} net income
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow cursor-pointer">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Users className="w-6 h-6 text-purple-600" />
                </div>
                <span className="text-xs text-purple-600 bg-purple-100 px-2 py-1 rounded-full">
                  {stats.occupancyRate || 0}%
                </span>
              </div>
              <h3 className="text-sm font-medium text-gray-600 mb-1">Occupancy Rate</h3>
              <p className="text-2xl font-bold text-gray-900 mb-2">{stats.occupancyRate || 0}%</p>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${stats.occupancyRate || 0}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Action Center and Recent Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <Zap className="w-5 h-5 mr-2 text-blue-600" />
                Quick Actions
              </h3>
              <div className="space-y-3">
                <button 
                  onClick={() => openModal('addTenant')}
                  className="w-full p-4 bg-gradient-to-r from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 rounded-lg flex items-center transition-all group"
                >
                  <div className="p-2 bg-blue-600 rounded-lg mr-3 group-hover:scale-110 transition-transform">
                    <Users className="w-4 h-4 text-white" />
                  </div>
                  <div className="text-left">
                    <div className="font-medium text-gray-900">Add New Tenant</div>
                    <div className="text-sm text-gray-600">Register a new tenant</div>
                  </div>
                  <ChevronRight className="w-4 h-4 ml-auto text-gray-400" />
                </button>

                <button 
                  onClick={() => openModal('addWorkOrder')}
                  className="w-full p-4 bg-gradient-to-r from-green-50 to-green-100 hover:from-green-100 hover:to-green-200 rounded-lg flex items-center transition-all group"
                >
                  <div className="p-2 bg-green-600 rounded-lg mr-3 group-hover:scale-110 transition-transform">
                    <Wrench className="w-4 h-4 text-white" />
                  </div>
                  <div className="text-left">
                    <div className="font-medium text-gray-900">Create Work Order</div>
                    <div className="text-sm text-gray-600">Schedule maintenance</div>
                  </div>
                  <ChevronRight className="w-4 h-4 ml-auto text-gray-400" />
                </button>

                <button 
                  onClick={() => setActiveTab('financial')}
                  className="w-full p-4 bg-gradient-to-r from-yellow-50 to-yellow-100 hover:from-yellow-100 hover:to-yellow-200 rounded-lg flex items-center transition-all group"
                >
                  <div className="p-2 bg-yellow-600 rounded-lg mr-3 group-hover:scale-110 transition-transform">
                    <DollarSign className="w-4 h-4 text-white" />
                  </div>
                  <div className="text-left">
                    <div className="font-medium text-gray-900">Record Payment</div>
                    <div className="text-sm text-gray-600">Process transactions</div>
                  </div>
                  <ChevronRight className="w-4 h-4 ml-auto text-gray-400" />
                </button>
              </div>
            </div>

            {/* Alerts & Notifications */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <Bell className="w-5 h-5 mr-2 text-orange-600" />
                Alerts & Notifications
              </h3>
              <div className="space-y-3">
                {stats.urgentWorkOrders > 0 && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-center">
                      <AlertTriangle className="w-4 h-4 text-red-600 mr-2" />
                      <span className="text-sm font-medium text-red-800">
                        {stats.urgentWorkOrders} urgent work orders
                      </span>
                    </div>
                  </div>
                )}
                
                {stats.overduePayments > 0 && (
                  <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 text-yellow-600 mr-2" />
                      <span className="text-sm font-medium text-yellow-800">
                        {stats.overduePayments} overdue payments
                      </span>
                    </div>
                  </div>
                )}

                {dynamicNotifications.length > 0 ? (
                  dynamicNotifications.map(notification => (
                    <div key={notification.id} className={`p-3 border rounded-lg ${
                      notification.type === 'warning' ? 'bg-yellow-50 border-yellow-200' :
                      notification.type === 'alert' ? 'bg-red-50 border-red-200' :
                      'bg-blue-50 border-blue-200'
                    }`}>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center">
                          <div className={`w-2 h-2 rounded-full mr-2 mt-1 ${
                            notification.type === 'warning' ? 'bg-yellow-600' :
                            notification.type === 'alert' ? 'bg-red-600' :
                            'bg-blue-600'
                          }`}></div>
                          <div>
                            <p className={`text-sm font-medium ${
                              notification.type === 'warning' ? 'text-yellow-800' :
                              notification.type === 'alert' ? 'text-red-800' :
                              'text-blue-800'
                            }`}>{notification.message}</p>
                            <p className={`text-xs ${
                              notification.type === 'warning' ? 'text-yellow-600' :
                              notification.type === 'alert' ? 'text-red-600' :
                              'text-blue-600'
                            }`}>{notification.time}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center">
                      <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                      <span className="text-sm font-medium text-green-800">
                        All caught up! No urgent notifications.
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Recent Work Orders */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center justify-between">
                <span className="flex items-center">
                  <Wrench className="w-5 h-5 mr-2 text-gray-600" />
                  Recent Work Orders
                </span>
                <button 
                  onClick={() => setActiveTab('workorders')}
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  View all
                </button>
              </h3>
              <div className="space-y-3">
                {workOrders.length > 0 ? (
                  workOrders.slice(0, 3).map(order => (
                    <div 
                      key={order.id} 
                      className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-gray-900 text-sm">{order.issue}</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          order.priority === 'High' ? 'bg-red-100 text-red-800' :
                          order.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {order.priority}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600">{order.unit} • {order.tenant}</p>
                      <p className="text-xs text-gray-500 mt-1">{order.dateSubmitted}</p>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4">
                    <Wrench className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">No work orders yet</p>
                    <button 
                      onClick={() => openModal('addWorkOrder')}
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium mt-1"
                    >
                      Create your first work order
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};


  // Enhanced Properties Component
  const Properties = () => {

    return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Properties</h2>
          <p className="text-gray-600">Manage your property portfolio</p>
        </div>
        <button 
          onClick={() => openModal('addProperty')}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 flex items-center transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Property
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {properties.map(property => (
          <div key={property.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-shadow">
            <div className="h-48 bg-gradient-to-r from-blue-500 to-purple-600 relative">
              <div className="absolute top-4 right-4">
                <span className="bg-white/90 text-gray-800 px-2 py-1 rounded text-xs font-medium">
                  {property.type}
                </span>
              </div>
              <div className="absolute bottom-4 left-4 text-white">
                <h3 className="text-xl font-bold">{property.name}</h3>
              </div>
            </div>
            <div className="p-6">
              <p className="text-gray-600 mb-4 flex items-center text-sm">
                <MapPin className="w-4 h-4 mr-2 flex-shrink-0" />
                {property.address}
              </p>
              
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <p className="text-2xl font-bold text-gray-900">{property.units}</p>
                  <p className="text-xs text-gray-600">Total Units</p>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <p className="text-2xl font-bold text-green-600">{property.occupied}</p>
                  <p className="text-xs text-gray-600">Occupied</p>
                </div>
              </div>

              <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-600">Monthly Revenue</span>
                  <span className="text-lg font-bold text-gray-900">
                    ${property.monthlyRevenue.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Occupancy Rate</span>
                  <span className="text-sm font-medium text-green-600">
                    {Math.round((property.occupied / property.units) * 100)}%
                  </span>
                </div>
              </div>

              <div className="flex space-x-2">
                <button 
                 onClick={() => openModal('viewProperty', property)}
                 className="flex-1 bg-blue-600 text-white py-2 px-3 rounded-lg hover:bg-blue-700 flex items-center justify-center text-sm transition-colors"
                >
                  <Eye className="w-4 h-4 mr-2" />
                  View Details
                </button>
                <button 
                 onClick={() => openModal('updateProperty', property)}
                 className="flex-1 bg-gray-100 text-gray-700 py-2 px-3 rounded-lg hover:bg-gray-200 flex items-center justify-center text-sm transition-colors"
                 >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                 </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

  // Enhanced Tenants Component with better UX
  const Tenants = () => (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Tenants</h2>
          <p className="text-gray-600">Manage tenant information and communications</p>
        </div>
        <div className="flex space-x-2">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search tenants..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-48"
            />
          </div>
          <button className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 flex items-center transition-colors">
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </button>
          <button 
            onClick={() => openModal('addTenant')}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Tenant
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tenant</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Unit</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Property</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rent</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Lease End</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Balance</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {tenants
                .filter(tenant => 
                  searchQuery === '' || 
                  tenant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  tenant.unit.toLowerCase().includes(searchQuery.toLowerCase())
                )
                .map(tenant => (
                <tr key={tenant.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white font-medium text-sm">
                          {tenant.avatar}
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{tenant.name}</div>
                        <div className="text-sm text-gray-500 flex items-center">
                          <Mail className="w-3 h-3 mr-1" />
                          {tenant.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-sm font-medium">
                      {tenant.unit}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{tenant.property}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    ${tenant.rent.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{tenant.leaseEnd}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      tenant.balance < 0 ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                    }`}>
                      {tenant.balance < 0 ? `$${Math.abs(tenant.balance)} overdue` : 'Paid'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button className="text-blue-600 hover:text-blue-900 transition-colors">View</button>
                      <button className="text-gray-600 hover:text-gray-900 transition-colors">Edit</button>
                      <button className="text-green-600 hover:text-green-900 transition-colors">Message</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  // Work Orders Component (keeping original but with visual improvements)
  const WorkOrders = () => (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Work Orders</h2>
          <p className="text-gray-600">Track and manage maintenance requests</p>
        </div>
        <button 
          onClick={() => openModal('addWorkOrder')}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 flex items-center transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Work Order
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {workOrders.map(order => (
          <div key={order.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <h3 className="font-semibold text-lg text-gray-900 mb-1">{order.issue}</h3>
                <p className="text-gray-600 text-sm">{order.unit} • {order.tenant}</p>
                <p className="text-gray-500 text-xs">{order.property}</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                order.priority === 'High' ? 'bg-red-100 text-red-800' :
                order.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                'bg-green-100 text-green-800'
              }`}>
                {order.priority}
              </span>
            </div>

            <div className="space-y-3 mb-6">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Status:</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  order.status === 'Open' ? 'bg-red-100 text-red-800' :
                  order.status === 'In Progress' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-green-100 text-green-800'
                }`}>
                  {order.status}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Submitted:</span>
                <span className="text-sm text-gray-900">{order.dateSubmitted}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Assigned to:</span>
                <span className="text-sm text-gray-900">{order.assignedTo || 'Unassigned'}</span>
              </div>
              {order.estimatedCost > 0 && (
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Est. Cost:</span>
                  <span className="text-sm font-medium text-gray-900">${order.estimatedCost}</span>
                </div>
              )}
            </div>

            <div className="flex space-x-2">
              <button className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm">
                Update
              </button>
              <button className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-lg hover:bg-gray-200 transition-colors text-sm">
                Assign
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // Enhanced Financial Component
  // Replace your existing Financial component (around line 800) with this enhanced version:

const Financial = () => {
  const financialStats = getComprehensiveFinancialStats();
  const dynamicExpenses = getExpenseCategories();
  
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Financial Management</h2>
          <p className="text-gray-600">Track income, expenses, and payments</p>
        </div>
        <div className="flex space-x-2">
        <button 
  onClick={() => openModal('addTransaction')}
  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center transition-colors"
>
  <Plus className="w-4 h-4 mr-2" />
  Record Payment
</button>

          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center transition-colors">
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </button>
        </div>
      </div>


      {/* Interactive Financial Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-6 rounded-xl cursor-pointer hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Monthly Income</h3>
            <TrendingUp className="w-6 h-6" />
          </div>
          <p className="text-3xl font-bold mb-2">${financialStats.monthlyIncome.toLocaleString()}</p>
          <p className="text-green-100 text-sm">
            {financialStats.netIncome > 0 ? '+' : ''}
            ${Math.abs(financialStats.netIncome).toLocaleString()} net income
          </p>
        </div>
        
        <div className="bg-gradient-to-r from-red-500 to-red-600 text-white p-6 rounded-xl cursor-pointer hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Outstanding Balance</h3>
            <AlertTriangle className="w-6 h-6" />
          </div>
          <p className="text-3xl font-bold mb-2">${financialStats.outstandingBalance.toLocaleString()}</p>
          <p className="text-red-100 text-sm">{financialStats.overdueCount} tenants overdue</p>
        </div>
        
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-6 rounded-xl cursor-pointer hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Monthly Expenses</h3>
            <TrendingDown className="w-6 h-6" />
          </div>
          <p className="text-3xl font-bold mb-2">${financialStats.monthlyExpenses.toLocaleString()}</p>
          <p className="text-orange-100 text-sm">This month</p>
        </div>

        <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-6 rounded-xl cursor-pointer hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Profit Margin</h3>
            <BarChart3 className="w-6 h-6" />
          </div>
          <p className="text-3xl font-bold mb-2">
            {financialStats.monthlyIncome > 0 ? Math.round((financialStats.netIncome / financialStats.monthlyIncome) * 100) : 0}%
          </p>
          <p className="text-purple-100 text-sm">
            {financialStats.netIncome > 0 ? 'Profitable' : 'Loss'}
          </p>
        </div>
      </div>

      {/* Expense Categories */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold">Expense Categories</h3>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {dynamicExpenses.map(expense => (
              <div key={expense.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="flex-1">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-medium text-gray-900">{expense.category}</h4>
                    <span className="text-sm text-gray-600">
                      ${expense.amount.toLocaleString()} / ${expense.budget.toLocaleString()}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-300 ${
                        expense.percentage > 90 ? 'bg-red-500' : 
                        expense.percentage > 75 ? 'bg-yellow-500' : 'bg-green-500'
                      }`}
                      style={{ width: `${expense.percentage}%` }}
                    ></div>
                  </div>
                </div>
                <div className="ml-4 text-right">
                  <span className={`text-sm font-medium ${
                    expense.percentage > 90 ? 'text-red-600' : 
                    expense.percentage > 75 ? 'text-yellow-600' : 'text-green-600'
                  }`}>
                    {expense.percentage.toFixed(1)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Interactive Transactions Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h3 className="text-lg font-semibold">Recent Transactions</h3>
            <div className="flex space-x-2">
              <select 
                value={transactionFilter}
                onChange={(e) => setTransactionFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Transactions</option>
                <option value="income">Income Only</option>
                <option value="expense">Expenses Only</option>
              </select>
              <select 
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="week">This Week</option>
                <option value="month">This Month</option>
                <option value="quarter">This Quarter</option>
                <option value="year">This Year</option>
              </select>
            </div>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            
<tbody className="divide-y divide-gray-200">
  {filteredTransactions().slice(0, 10).map(transaction => (
    <tr key={transaction.id} className="hover:bg-gray-50 transition-colors">
      <td className="px-6 py-4 text-sm text-gray-900">{transaction.date}</td>
      <td className="px-6 py-4 text-sm text-gray-900">{transaction.description}</td>
      <td className="px-6 py-4">
        <span className={`px-2 py-1 rounded text-xs font-medium ${
          transaction.type === 'income' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {transaction.type === 'income' ? 'Income' : 'Expense'}
        </span>
      </td>
      <td className={`px-6 py-4 text-sm font-medium ${
        transaction.amount > 0 ? 'text-green-600' : 'text-red-600'
      }`}>
        {transaction.amount > 0 ? '+' : ''}${Math.abs(transaction.amount).toLocaleString()}
      </td>
      <td className="px-6 py-4">
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          transaction.status === 'completed' ? 'bg-green-100 text-green-800' :
          transaction.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
          'bg-red-100 text-red-800'
        }`}>
          {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
        </span>
      </td>
      <td className="px-6 py-4 text-sm">
        <div className="flex space-x-2">
          <button 
            onClick={() => openModal('editTransaction', transaction)}
            className="text-blue-600 hover:text-blue-900 transition-colors"
          >
            Edit
          </button>
          <button 
            onClick={() => {
              console.log('View receipt for:', transaction);
            }}
            className="text-green-600 hover:text-green-900 transition-colors"
          >
            Receipt
          </button>
          <button 
            onClick={() => {
              if (window.confirm('Are you sure you want to delete this transaction?')) {
                deleteTransaction(transaction.id);
              }
            }}
            className="text-red-600 hover:text-red-900 transition-colors"
          >
            Delete
          </button>
        </div>
      </td>
    </tr>
  ))}
</tbody>
          </table>
        </div>
        {filteredTransactions().length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-500">No transactions found for the selected filter.</p>
          </div>
        )}
      </div>
    </div>
  );
};

const Analytics = ({ properties, tenants }) => {
  return(
  <div className="space-y-6">
    <div>
      <h2 className="text-2xl font-bold text-gray-900">Occupancy Analytics</h2>
      <p className="text-gray-600">Detailed insights into your property occupancy</p>
    </div>
    
    <OccupancyMetrics properties={properties} tenants={tenants} />
    
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-semibold mb-4">Occupancy Distribution</h3>
        <OccupancyDonutChart properties={properties} />
      </div>
      
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-semibold mb-4">Occupancy Trends</h3>
        <OccupancyTrendChart properties={properties} />
      </div>
    </div>
    
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <h3 className="text-lg font-semibold mb-4">Occupancy by Property</h3>
      <OccupancyByPropertyChart properties={properties} />
    </div>
  </div>
  );
};



  // Enhanced Communication Component
  const Communication = () => (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Communication Center</h2>
          <p className="text-gray-600">Stay connected with your tenants</p>
        </div>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center transition-colors">
          <Plus className="w-4 h-4 mr-2" />
          New Message
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Message List */}
        <div className="lg:col-span-1 bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-4 border-b border-gray-200">
            <h3 className="font-semibold">Recent Messages</h3>
          </div>
          <div className="space-y-0">
            <div className="p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-medium text-sm">
                  JS
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">John Smith</p>
                  <p className="text-sm text-gray-500 truncate">Thank you for fixing the...</p>
                  <p className="text-xs text-gray-400">2 hours ago</p>
                </div>
                <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
              </div>
            </div>
            <div className="p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center text-white font-medium text-sm">
                  SJ
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">Sarah Johnson</p>
                  <p className="text-sm text-gray-500 truncate">When can someone look at...</p>
                  <p className="text-xs text-gray-400">1 day ago</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Message Thread */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col">
          <div className="p-4 border-b border-gray-200">
            <h3 className="font-semibold">John Smith - Unit A101</h3>
            <p className="text-sm text-gray-600">Sunset Apartments</p>
          </div>
          
          <div className="flex-1 p-4 space-y-4 max-h-96 overflow-y-auto">
            <div className="flex justify-end">
              <div className="bg-blue-600 text-white p-3 rounded-lg max-w-xs">
                <p className="text-sm">Hi John, we've scheduled the plumber for tomorrow morning. Thanks for your patience!</p>
                <p className="text-xs opacity-75 mt-1">2:30 PM</p>
              </div>
            </div>
            <div className="flex justify-start">
              <div className="bg-gray-200 text-gray-900 p-3 rounded-lg max-w-xs">
                <p className="text-sm">Thank you for fixing the faucet so quickly! Everything is working perfectly now.</p>
                <p className="text-xs opacity-75 mt-1">4:15 PM</p>
              </div>
            </div>
          </div>

          <div className="p-4 border-t border-gray-200">
            <div className="flex space-x-2">
              <input
                type="text"
                placeholder="Type your message..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              />
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                Send
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Bulk Communication */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-semibold mb-4">Bulk Communication Templates</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-center transition-colors group">
            <Bell className="w-6 h-6 mx-auto mb-2 text-blue-600 group-hover:scale-110 transition-transform" />
            <p className="text-sm font-medium">Rent Reminder</p>
            <p className="text-xs text-gray-500 mt-1">Send payment reminders</p>
          </button>
          <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-center transition-colors group">
            <Calendar className="w-6 h-6 mx-auto mb-2 text-green-600 group-hover:scale-110 transition-transform" />
            <p className="text-sm font-medium">Lease Renewal</p>
            <p className="text-xs text-gray-500 mt-1">Renewal notifications</p>
          </button>
          <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-center transition-colors group">
            <AlertTriangle className="w-6 h-6 mx-auto mb-2 text-yellow-600 group-hover:scale-110 transition-transform" />
            <p className="text-sm font-medium">Emergency Alert</p>
            <p className="text-xs text-gray-500 mt-1">Urgent notifications</p>
          </button>
          <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-center transition-colors group">
            <MessageSquare className="w-6 h-6 mx-auto mb-2 text-purple-600 group-hover:scale-110 transition-transform" />
            <p className="text-sm font-medium">General Notice</p>
            <p className="text-xs text-gray-500 mt-1">Community updates</p>
          </button>
        </div>
      </div>
    </div>
  );

  // Enhanced Documents Component
  const Documents = () => (

    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div> 
          <h2 className="text-2xl font-bold text-gray-900">Document Management</h2>
          <p className="text-gray-600">Organize and manage all your property documents</p>
        </div>
        <div className="flex space-x-2">
          <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center transition-colors">
            <Upload className="w-4 h-4 mr-2" />
            Upload Files
          </button>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center transition-colors">
            <Plus className="w-4 h-4 mr-2" />
            New Document
          </button>
        </div>
      </div>

      {/* Document Categories with better visual design */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 text-center hover:shadow-md transition-shadow cursor-pointer">
          <div className="p-3 bg-blue-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <FileText className="w-8 h-8 text-blue-600" />
          </div>
          <h3 className="font-semibold mb-2">Leases</h3>
          <p className="text-2xl font-bold text-blue-600 mb-1">24</p>
          <p className="text-sm text-gray-600">Active contracts</p>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 text-center hover:shadow-md transition-shadow cursor-pointer">
          <div className="p-3 bg-green-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <Camera className="w-8 h-8 text-green-600" />
          </div>
          <h3 className="font-semibold mb-2">Inspections</h3>
          <p className="text-2xl font-bold text-green-600 mb-1">156</p>
          <p className="text-sm text-gray-600">Reports & photos</p>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 text-center hover:shadow-md transition-shadow cursor-pointer">
          <div className="p-3 bg-yellow-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <DollarSign className="w-8 h-8 text-yellow-600" />
          </div>
          <h3 className="font-semibold mb-2">Financial</h3>
          <p className="text-2xl font-bold text-yellow-600 mb-1">89</p>
          <p className="text-sm text-gray-600">Invoices & receipts</p>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 text-center hover:shadow-md transition-shadow cursor-pointer">
          <div className="p-3 bg-purple-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <Settings className="w-8 h-8 text-purple-600" />
          </div>
          <h3 className="font-semibold mb-2">Legal</h3>
          <p className="text-2xl font-bold text-purple-600 mb-1">12</p>
          <p className="text-sm text-gray-600">Legal documents</p>
        </div>
      </div>

      {/* Recent Documents */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Recent Documents</h3>
            <div className="flex space-x-2">
              <button className="text-gray-600 hover:text-gray-800 p-2 rounded-lg hover:bg-gray-100 transition-colors">
                <Search className="w-4 h-4" />
              </button>
              <button className="text-gray-600 hover:text-gray-800 p-2 rounded-lg hover:bg-gray-100 transition-colors">
                <Filter className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Document</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Property</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              <tr className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 text-sm text-gray-900 flex items-center">
                  <div className="p-2 bg-blue-100 rounded-lg mr-3">
                    <FileText className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <div className="font-medium">Lease Agreement - John Smith</div>
                    <div className="text-xs text-gray-500">2.3 MB • PDF</div>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">Lease</span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">Sunset Apartments</td>
                <td className="px-6 py-4 text-sm text-gray-900">2025-07-15</td>
                <td className="px-6 py-4 text-sm space-x-2">
                  <button className="text-blue-600 hover:text-blue-900 transition-colors">View</button>
                  <button className="text-green-600 hover:text-green-900 transition-colors">Download</button>
                  <button className="text-gray-600 hover:text-gray-900 transition-colors">Edit</button>
                </td>
              </tr>
              <tr className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 text-sm text-gray-900 flex items-center">
                  <div className="p-2 bg-green-100 rounded-lg mr-3">
                    <Camera className="w-4 h-4 text-green-600" />
                  </div>
                  <div>
                    <div className="font-medium">Unit Inspection - A101</div>
                    <div className="text-xs text-gray-500">5.1 MB • ZIP</div>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">
                  <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">Inspection</span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">Sunset Apartments</td>
                <td className="px-6 py-4 text-sm text-gray-900">2025-07-10</td>
                <td className="px-6 py-4 text-sm space-x-2">
                  <button className="text-blue-600 hover:text-blue-900 transition-colors">View</button>
                  <button className="text-green-600 hover:text-green-900 transition-colors">Download</button>
                  <button className="text-gray-600 hover:text-gray-900 transition-colors">Edit</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>);

  // Enhanced Reports Component
  const Reports = () => (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Reports & Analytics</h2>
          <p className="text-gray-600">Insights and analytics for your property portfolio</p>
        </div>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center transition-colors">
          <Download className="w-4 h-4 mr-2" />
          Export All Reports
        </button>
      </div>
      
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow cursor-pointer">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <BarChart3 className="w-6 h-6 text-blue-600" />
            </div>
            <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded-full">
              +2% this month
            </span>
          </div>
          <h3 className="text-lg font-semibold mb-2">Occupancy Report</h3>
          <p className="text-3xl font-bold text-blue-600 mb-2">89%</p>
          <p className="text-sm text-gray-600 mb-4">Average occupancy rate</p>
          <button className="w-full bg-blue-50 text-blue-600 py-2 rounded-lg hover:bg-blue-100 transition-colors">
            View Details
          </button>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow cursor-pointer">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-green-100 rounded-lg">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
            <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded-full">
              Strong growth
            </span>
          </div>
          <h3 className="text-lg font-semibold mb-2">Revenue Analysis</h3>
          <p className="text-3xl font-bold text-green-600 mb-2">+12.5%</p>
          <p className="text-sm text-gray-600 mb-4">Growth this quarter</p>
          <button className="w-full bg-green-50 text-green-600 py-2 rounded-lg hover:bg-green-100 transition-colors">
            View Details
          </button>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow cursor-pointer">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-orange-100 rounded-lg">
              <Wrench className="w-6 h-6 text-orange-600" />
            </div>
            <span className="text-xs text-orange-600 bg-orange-100 px-2 py-1 rounded-full">
              Under budget
            </span>
          </div>
          <h3 className="text-lg font-semibold mb-2">Maintenance Costs</h3>
          <p className="text-3xl font-bold text-orange-600 mb-2">$8,250</p>
          <p className="text-sm text-gray-600 mb-4">This month</p>
          <button className="w-full bg-orange-50 text-orange-600 py-2 rounded-lg hover:bg-orange-100 transition-colors">
            View Details
         </button>
        </div>
      </div>

      {/* Chart Placeholder with better design */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold mb-4">Revenue Trend</h3>
        <div className="h-64 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg flex items-center justify-center">
          <div className="text-center">
            <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-500">Interactive Chart Would Display Here</p>
            <p className="text-sm text-gray-400">Revenue trends and analytics</p>
          </div>
        </div>
      </div>
    </div>
  );

        
  // Navigation tabs with better organization
const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: Home, description: 'Overview & quick actions' },
    { id: 'properties', label: 'Properties', icon: Home, description: 'Manage your portfolio' },
    { id: 'tenants', label: 'Tenants', icon: Users, description: 'Tenant information' },
    { id: 'workorders', label: 'Work Orders', icon: Wrench, description: 'Maintenance requests' },
    { id: 'financial', label: 'Financial', icon: DollarSign, description: 'Income & expenses' },
    { id: 'analytics', label: 'Analytics', icon: BarChart3, description: 'Occupancy insights' },
    { id: 'communication', label: 'Messages', icon: MessageSquare, description: 'Tenant communication' },
    { id: 'documents', label: 'Documents', icon: FileText, description: 'File management' },
    { id: 'reports', label: 'Reports', icon: BarChart3, description: 'Analytics & insights' }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Enhanced Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
              >
                <Menu className="w-5 h-5" />
              </button>
              <div className="flex items-center ml-2 lg:ml-0">
                <div className="p-2 bg-blue-600 rounded-lg mr-3">
                  <Home className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">PropertyPro</h1>
                  <p className="text-xs text-gray-5020 hidden sm:block">Property Management</p>
                </div>
              </div>
            </div>
            
            {/* Search Bar */}
            <div className="hidden md:flex flex-1 max-w-md mx-6">
              <div className="relative w-full">
                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search properties, tenants, or work orders..."
                  className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 transition-colors"
                />
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <button className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
                <Bell className="w-5 h-5" />
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
              </button>
              <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
                <HelpCircle className="w-5 h-5" />
              </button>
              <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
                <Settings className="w-5 h-5" />
              </button>
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white font-medium text-sm cursor-pointer">
                PM
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex">
          {/* Enhanced Sidebar */}
          <nav className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 fixed lg:relative z-30 lg:z-auto w-64 bg-white rounded-xl shadow-sm border border-gray-100 p-4 mr-6 h-fit transition-transform duration-300 ease-in-out`}>
            <div className="space-y-1">
              {tabs.map(tab => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 group ${
                      activeTab === tab.id
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                    }`}
                  >
                    <Icon className={`w-5 h-5 mr-3 transition-transform group-hover:scale-110 ${
                      activeTab === tab.id ? 'text-white' : 'text-gray-400'
                    }`} />
                    <div className="text-left">
                      <div className="font-medium">{tab.label}</div>
                      <div className={`text-xs ${
                        activeTab === tab.id ? 'text-blue-100' : 'text-gray-500'
                      }`}>
                        {tab.description}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
            
            {/* Help Section */}
            <div className="mt-8 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">Need Help?</h4>
              <p className="text-sm text-gray-600 mb-3">Check our documentation or contact support</p>
              <button className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm">
                Get Support
              </button>
            </div>
          </nav>

          {/* Overlay for mobile */}
          {sidebarOpen && (
            <div 
              className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-20"
              onClick={() => setSidebarOpen(false)}
            ></div>
          )}

          {/* Main Content */}
          <main className="flex-1 min-w-0">
            {activeTab === 'dashboard' && <Dashboard />}
            {activeTab === 'properties' && <Properties />}
            {activeTab === 'tenants' && <Tenants />}
            {activeTab === 'workorders' && <WorkOrders />}
            {activeTab === 'financial' && <Financial />}
            {activeTab === 'analytics' && <Analytics />}
            {activeTab === 'communication' && <Communication />}
            {activeTab === 'documents' && <Documents />}
            {activeTab === 'reports' && <Reports />}
          </main>
      </div>
    </div>
  {/* Modal */}
      {showModal && (
  <Modal 
    showModal={showModal}
    modalType={modalType}
    closeModal={closeModal}
    handleSubmit={handleSubmit}
    formData={formData}
    handleInputChange={handleInputChange}
    selectedItem={selectedItem}
    properties={properties}
    tenants={tenants}
    setActiveTab={setActiveTab}
        />
      )}
    </div>
  );
};

export default UserFriendlyPropertyApp;
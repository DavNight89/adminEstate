import React, { useState, useEffect} from 'react';
import { 
  Home, Users, DollarSign, Wrench, FileText, BarChart3, 
  MessageSquare, Calendar, Settings, Plus, Search, Filter,
  Bell, Upload, Download, Edit, Eye, CheckCircle,
  AlertTriangle, Clock, Mail, MapPin, Key,
  Camera, TrendingUp, TrendingDown, Menu, X,
  ChevronRight, HelpCircle, Lightbulb, Zap, Building
} from 'lucide-react';
import Modal from './components/Modal';
import { OccupancyMetrics, OccupancyDonutChart, OccupancyTrendChart, OccupancyByPropertyChart } from './components/OccupancyCharts';
import { extractTextFromFile, generateThumbnail } from './utils/fileProcessing';
import './components/DocumentUpload.css';
import DocumentUpload from './components/DocumentUpload';

// Add this at the top of your component:
const saveToIndexedDB = async (storeName, data) => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('PropertyProDB', 1);
    
    request.onerror = () => reject(request.error);
    
    request.onsuccess = () => {
      const db = request.result;
      const transaction = db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      
      store.clear(); // Clear existing data
      store.add({ id: 1, data: data });
      
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    };

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      
      const storeNames = ['properties', 'tenants', 'workOrders', 'transactions'];
    
      storeNames.forEach(name => {  
      if (!db.objectStoreNames.contains(name)) {
        db.createObjectStore(name, { keyPath: 'id' });
      }
    });

    if (!db.objectStoreNames.contains(storeName)) {
        db.createObjectStore(storeName, { keyPath: 'id' });
      }
    };
  });
};

const loadFromIndexedDB = async (storeName) => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('PropertyProDB', 1);

    request.onerror = () => reject(request.error);
    
    request.onsuccess = () => {
      const db = request.result;

      if (!db.objectStoreNames.contains(storeName)) {
        resolve([]); // Return empty array if store doesn't exist
        return;
      }
      
      const transaction = db.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const getRequest = store.get(1);
      
      getRequest.onsuccess = () => {
        resolve(getRequest.result?.data || []);
      };
      
      getRequest.onerror = () => reject(getRequest.error);
    };

    request.onupgradeneeded = (event) => {  // ← Add event parameter
      const db = event.target.result;      // ← Fix: use event.target.result
      
      // Create object stores for each data type
      const storeNames = ['properties', 'tenants', 'workOrders', 'transactions'];
      
      storeNames.forEach(name => {
        if (!db.objectStoreNames.contains(name)) {
          db.createObjectStore(name, { keyPath: 'id' });
        }
      });
    };
  });
};

const safeLocalStorage = {
  //Safely saves to localStorage with error handling
  setItem: (key, value) => {
    try {
      localStorage.setItem(key, value);
      console.log(`✅ Saved ${key} to localStorage`);
      return true;
    } catch (error) {
      console.error(`❌ Failed to save ${key}:`, error);
      return false;
    }
  },
  //Safely retrieves from localStorage with error handling
  getItem: (key) => {
    try {
      return localStorage.getItem(key);
    } catch (error) {
      console.error(`❌ Failed to get ${key}:`, error);
      return null;
    }
  }
};



const UserFriendlyPropertyApp = () => {

  
  const [properties, setProperties] = useState([]);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [tenants, setTenants] = useState([]);
  const [workOrders, setWorkOrders] = useState([]);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [workOrderViewMode, setWorkOrderViewMode] = useState(() => {
  return localStorage.getItem('workOrderViewMode') || 'cards';
});
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showTips, setShowTips] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const [formData, setFormData] = useState({});
  const [documents, setDocuments] = useState([]);
 const [dateRange, setDateRange] = useState('month');
 const [transactionFilter, setTransactionFilter] = useState('all');
 const [tenantSearchQuery, setTenantSearchQuery] = useState('');

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

// Replace your initial useEffect with this enhanced version:
useEffect(() => {
  const loadInitialData = async () => {
    try {
      // Try localStorage first
      const savedProperties = safeLocalStorage.getItem('properties');
      const savedTenants = safeLocalStorage.getItem('tenants');
      const savedWorkOrders = safeLocalStorage.getItem('workOrders');
      const savedTransactions = safeLocalStorage.getItem('transactions');

      if (savedProperties) {
        setProperties(JSON.parse(savedProperties));
      } else {
        // Fallback to IndexedDB
        const indexedProperties = await loadFromIndexedDB('properties');
        setProperties(indexedProperties);
      }

      if (savedTenants) {
        setTenants(JSON.parse(savedTenants));
      } else {
        const indexedTenants = await loadFromIndexedDB('tenants');
        setTenants(indexedTenants);
      }  
      if (savedWorkOrders) {
        setWorkOrders(JSON.parse(savedWorkOrders));
      } else {
        const indexedWorkOrders = await loadFromIndexedDB('workOrders');
        setWorkOrders(indexedWorkOrders);
      }

      if (savedTransactions) {
        setTransactions(JSON.parse(savedTransactions));
      } else {
        const indexedTransactions = await loadFromIndexedDB('transactions');
        setTransactions(indexedTransactions);
      }

      console.log('✅ Initial data loaded successfully');
    } catch (error) {
      console.error('❌ Failed to load initial data:', error);
    }
  };

  loadInitialData();
}, []);
useEffect(() => {
  // Pre-populate form data when modal opens in edit mode
  if (modalType == 'updateProperty' && selectedItem) {
    setFormData({
      name: selectedItem.name,
      address: selectedItem.address,
      type: selectedItem.type,
      units: selectedItem.units,
      purchasePrice: selectedItem.purchasePrice || ''
    });
  } else if (modalType == 'editTransaction' && selectedItem) {
    setFormData({
      type: selectedItem.type,
      description: selectedItem.description,
      amount: Math.abs(selectedItem.amount),
      property: selectedItem.property || '',
      unit: selectedItem.unit || '',
      tenant: selectedItem.tenant || '',
      category: selectedItem.category || '',
      date: selectedItem.date
    });
} else if (modalType == 'editWorkOrder' && selectedItem) {
    // Add this new section for work order editing
    setFormData({
      property: selectedItem.property || '',
      tenant: selectedItem.tenant || '', 
      unit: selectedItem.unit || '',
      issue: selectedItem.issue || '',
      priority: selectedItem.priority || '',
      assignedTo: selectedItem.assignedTo || '',
      estimatedCost: selectedItem.estimatedCost || '',
      description: selectedItem.description || ''
    });
  } else if (!selectedItem || modalType.startsWith('add')) {
    setFormData({});

    } else if (modalType == 'editTenant' && selectedItem) {  // ← Add this
    setFormData({
      name: selectedItem.name,
      email: selectedItem.email,
      phone: selectedItem.phone,
      property: selectedItem.propertyId || '',
      unit: selectedItem.unit,
      rent: selectedItem.rent,
      leaseEnd: selectedItem.leaseEnd,
      status: selectedItem.status,
      balance: selectedItem.balance || 0
    });
  } else if (!selectedItem || modalType.startsWith('add')) {
    setFormData({});
  }
}, [modalType, selectedItem]);

  
// Replace the problematic useEffect (around line 202) with:
useEffect(() => {
  // Only sync when tenants change, not when properties change (to avoid loop)
  if (tenants.length >= 0 && properties.length > 0) {
   const updatedProperties = properties.map(property => {
      const propertyTenants = tenants.filter(t => t.property == property.name && t.status == 'Current');
      const monthlyRevenue = propertyTenants.reduce((sum, t) => sum + (parseFloat(t.rent) || 0), 0);
      const occupiedCount = propertyTenants.length;

      if (property.monthlyRevenue !== monthlyRevenue || property.occupied !== occupiedCount) {
        return { 
          ...property, 
          monthlyRevenue,
          occupied: occupiedCount  // ← Add this line
        };
      }
      return property;
    });
    
    // Only update if there are actual changes<<<<<<<<<<<<<<<<<
const hasChanges = updatedProperties.some((prop, index) => 
      prop.monthlyRevenue !== properties[index]?.monthlyRevenue ||
      prop.occupied !== properties[index]?.occupied  // ← Add this check
    );
    
    if (hasChanges) {
      setProperties(updatedProperties);
      localStorage.setItem('properties', JSON.stringify(updatedProperties));
      console.log('Properties updated with tenant sync:', updatedProperties);
    }
  }
}, [tenants]);
 


const openModal = (type, item = null) => {
  setModalType(type);
  setSelectedItem(item);
  setFormData({}); // Clear form data first
  setShowModal(true);
};

const updateWorkOrder = (updatedWorkOrder) => {
  setWorkOrders(prev => {
    const updatedWorkOrders = prev.map(workOrder => 
      workOrder.id === selectedItem.id 
        ? { ...workOrder, ...updatedWorkOrder }
        : workOrder
    );
    
    if (!safeLocalStorage.setItem('workOrders', JSON.stringify(updatedWorkOrders))) {
      saveToIndexedDB('workOrders', updatedWorkOrders)
        .then(() => console.log('✅ Work order updated in IndexedDB'))
        .catch(err => console.error('❌ Failed to update work order:', err));
    }
    
    console.log('Work order updated:', updatedWorkOrder);
    return updatedWorkOrders;
  });
};


// Update your addTenant function (around line 155):
const addTenant = (newTenant) => {
  const selectedProperty = properties.find(p => p.id == newTenant.property);
  
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
  
  setTenants(prev => {
    const updatedTenants = [...prev, newTenantData];

     if (!safeLocalStorage.setItem('tenants', JSON.stringify(updatedTenants))) {
      saveToIndexedDB('tenants', updatedTenants)
        .then(() => console.log('✅ Tenant saved to IndexedDB as fallback'))
        .catch(err => console.error('❌ Both localStorage and IndexedDB failed:', err));
    }
    
    console.log('Tenant saved:', newTenantData);
    return updatedTenants;
  });

  // Update property with new tenant and recalculate monthly revenue
  if (newTenant.property && selectedProperty) {
    setProperties(prev => {
    const updatedProperties = properties.map(property => {
      if (property.id == newTenant.property) {
        return {
          ...property, 
          occupied: (property.occupied || 0) + 1 
        };
      }
      return property;
    });
      
      // Save updated properties
      if (!safeLocalStorage.setItem('properties', JSON.stringify(updatedProperties))) {
        saveToIndexedDB('properties', updatedProperties)
          .then(() => console.log('✅ Property occupancy saved to IndexedDB'))
          .catch(err => console.error('❌ Failed to save property occupancy:', err));
      }
      
      return updatedProperties;
    });
  }
};

const editTenant = (updatedTenant) => {
  const processedTenant = {
    ...selectedItem,
    ...updatedTenant,
    id: selectedItem.id,
    rent: parseFloat(updatedTenant.rent) || selectedItem.rent,
    balance: parseFloat(updatedTenant.balance) || 0,
    avatar: updatedTenant.name ? updatedTenant.name.split(' ').map(n => n[0]).join('') : selectedItem.avatar
  };

  setTenants(prev => {
    const updated = prev.map(tenant => 
      tenant.id === selectedItem.id ? processedTenant : tenant
    );
    
    // Save to localStorage
    try {
      localStorage.setItem('tenants', JSON.stringify(updated));
      console.log('✅ Tenant updated:', processedTenant);
    } catch (error) {
      console.error('❌ Failed to save tenant:', error);
    }
    
    return updated;
  });
};

const updateTenant = (updatedTenant) => {
  setTenants(prev => {
    const updatedTenants = prev.map(tenant => 
      tenant.id === selectedItem.id 
        ? { ...tenant, ...updatedTenant }
        : tenant
    );
    
    // Save to localStorage
    if (!safeLocalStorage.setItem('tenants', JSON.stringify(updatedTenants))) {
      saveToIndexedDB('tenants', updatedTenants)
        .then(() => console.log('✅ Tenant updated in IndexedDB'))
        .catch(err => console.error('❌ Failed to update tenant:', err));
    }
    
    console.log('Tenant updated:', updatedTenant);
    return updatedTenants;
  });
};
  

const addTransaction = (newTransaction) => {
  const transaction = {
    ...newTransaction,
    id: Date.now(),
    date: newTransaction.date || new Date().toISOString().split('T')[0],
    status: 'completed',
    unit: newTransaction.unit || '', 
    tenant: newTransaction.tenant || '' 
  };


  const updatedTransactions = [...transactions, transaction];
  setTransactions(updatedTransactions);
  
  // Immediately save to localStorage
  localStorage.setItem('transactions', JSON.stringify(updatedTransactions));
  console.log('Transaction saved to localStorage:', transaction);

  // If it's income, update the related property's revenue
  if (transaction.type == 'income' && transaction.property) {
    setProperties(prev => prev.map(property => {
      if (property.name == transaction.property) {
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
    transaction.id == selectedItem.id 
      ? { ...transaction, ...updatedTransaction }
      : transaction
  ));
};

const deleteTransaction = (transactionId) => {
  setTransactions(prev => prev.filter(transaction => transaction.id !== transactionId));
};

// Add these functions if they're missing:

const addWorkOrder = (newWorkOrder) => {
  const selectedProperty = properties.find(p => p.id == newWorkOrder.property);
  
  const workOrder = {
    ...newWorkOrder,
    id: Date.now(),
    status: 'Open',
    dateSubmitted: new Date().toISOString().split('T')[0],
    property: selectedProperty?.name || 'Unknown Property', 
    tenant: tenants.find(t => t.unit == newWorkOrder.unit && t.property == selectedProperty?.name)?.name || 'Unknown'
  };
  
  const updatedWorkOrders = [...workOrders, workOrder];
  setWorkOrders(updatedWorkOrders);
  
  // Immediately save to localStorage
  localStorage.setItem('workOrders', JSON.stringify(updatedWorkOrders));
  console.log('Work order saved to localStorage:', workOrder);
};
   

const updateProperty = (updatedProperty) => {
  const processedProperty = {
    ...selectedItem,
    ...updatedProperty,
    id: selectedItem.id,
    units: parseInt(updatedProperty.units) || selectedItem.units,
    occupied: parseInt(updatedProperty.occupied) || selectedItem.occupied,
    monthlyRevenue: parseFloat(updatedProperty.monthlyRevenue) || selectedItem.monthlyRevenue,
    purchasePrice: parseFloat(updatedProperty.purchasePrice) || selectedItem.purchasePrice
  };
  
  setProperties(prev => {
    const updated = prev.map(property => 
      property.id === selectedItem.id ? processedProperty : property
    );
    try {
      localStorage.setItem('properties', JSON.stringify(updated));
      console.log('✅ Property updated:', processedProperty);
    } catch (error) {
      console.error('❌ Failed to save property:', error);
    }
    return updated;
  });
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
  

setProperties(prev => {
    const updatedProperties = [...prev, property];

     if (!safeLocalStorage.setItem('properties', JSON.stringify(updatedProperties))) {
      saveToIndexedDB('properties', updatedProperties)
        .then(() => console.log('✅ Saved to IndexedDB as fallback'))
        .catch(err => console.error('❌ Both localStorage and IndexedDB failed:', err));
    }
    
    console.log('Property saved:', property);   
    return updatedProperties;
  });
};

// Add this after getFinancialStats function (around line 230):

const getComprehensiveFinancialStats = () => {
  // Calculate income from transactions (actual payments received)
  const transactionIncome = transactions
    .filter(t => t.type == 'income' && t.amount > 0)
    .reduce((sum, t) => sum + t.amount, 0);

  // Calculate potential income from tenant rents
  const potentialMonthlyIncome = tenants
    .filter(t => t.status == 'Current')
    .reduce((sum, t) => sum + (parseFloat(t.rent) || 0), 0);

  // Use the potential income as primary source
  const actualMonthlyIncome = potentialMonthlyIncome;

  const monthlyExpenses = transactions
    .filter(t => t.type == 'expense' && t.amount < 0)
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
      .filter(t => t.type == 'expense' && t.category == cat.category.toLowerCase())
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
  workOrders.filter(wo => wo.status == 'Open' && wo.priority == 'High').forEach(order => {
    notifications.push({
      id: `urgent-${order.id}`,
      message: `Urgent work order: ${order.issue}`,
      type: "alert",
      time: order.dateSubmitted
    });
  });
  
  // Add completed work order notifications
  workOrders.filter(wo => wo.status == 'Completed').slice(0, 2).forEach(order => {
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
    const typeMatch = transactionFilter == 'all' || transaction.type == transactionFilter;
    
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
    console.log('handleSubmit called with modalType:', modalType);
  console.log('Form data:', formData);

  if (modalType == 'addTenant') {
    if (!formData.name || !formData.email || !formData.property || !formData.unit || !formData.rent) {
      alert('Please fill in all required fields for the tenant.');
      return;
    }
    const updatedTenantData = {
      ...formData,
      rent: parseFloat(formData.rent) || 0
    };
    addTenant(updatedTenantData);

  } else if (modalType == 'addProperty') {
    if (!formData.name || !formData.address || !formData.type || !formData.units) {
      alert('Please fill in all required fields for the property.');
      return;
    }
    const propertyData = {
      ...formData,
      units: parseInt(formData.units) || 0,
      monthlyRevenue: parseFloat(formData.monthlyRevenue) || 0,
      purchasePrice: parseFloat(formData.purchasePrice) || 0
    };
    addProperty(propertyData);

  } else if (modalType == 'editTenant') {
  if (!formData.name || !formData.email || !formData.property || !formData.unit || !formData.rent) {
    alert('Please fill in all required fields for the tenant.');
    return;
  }
  const updatedTenantData = {
    ...formData,
    rent: parseFloat(formData.rent) || 0
  };
  updateTenant(updatedTenantData); // ← This uses updateTenant
  
} else if (modalType == 'editWorkOrder') {
  if (!formData.property || !formData.unit || !formData.issue || !formData.priority) {
    alert('Please fill in all required fields for the work order.');
    return;
  }
  const workOrderData = {
    ...formData, // ← Include ALL form data, not just property
    estimatedCost: parseFloat(formData.estimatedCost) || 0 // ← Convert cost to number
  };
  updateWorkOrder(workOrderData);

  } else if (modalType == 'updateProperty') {
    const propertyData = {
      units: parseInt(formData.units) || selectedItem.units,
      occupied: parseInt(formData.occupied) || selectedItem.occupied,
      monthlyRevenue: parseFloat(formData.monthlyRevenue) || selectedItem.monthlyRevenue,
      purchasePrice: parseFloat(formData.purchasePrice) || selectedItem.purchasePrice
    };

    updateProperty(propertyData);
  
  } else if (modalType == 'addTransaction') {
    if (!formData.type || !formData.description || !formData.amount) {
      alert('Please fill in all required fields for the transaction.');
      return;
    }
    const transactionData = {
      ...formData,
      amount: formData.type == 'expense' ? -Math.abs(parseFloat(formData.amount)) : Math.abs(parseFloat(formData.amount))
    };
    addTransaction(transactionData);
  } else if (modalType == 'editTransaction') {
    const transactionData = {
      ...formData,
      amount: formData.type == 'expense' ? -Math.abs(parseFloat(formData.amount)) : Math.abs(parseFloat(formData.amount))
    };
    updateTransaction(transactionData);
  }
  
  closeModal();
  setFormData({});
};

  // Quick Stats for better overview
  const getQuickStats = () => {

    const totalUnits = properties.reduce((acc, prop) => acc + prop.units || 0, 0);
    const occupiedUnits = properties.reduce((acc, prop) => acc + (prop.occupied || 0), 0);
    const financialStats = getComprehensiveFinancialStats(); 
    const occupancyRate = totalUnits > 0 ? Math.round((occupiedUnits / totalUnits) * 100) : 0;
    const urgentWorkOrders = workOrders.filter(wo => wo.priority == 'High').length;
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

  // Add smart search functionality that switches tabs based on results
const handleSmartSearch = (searchValue) => {
  setTenantSearchQuery(searchValue);
  
  if (searchValue.trim() === '') {
    return; // Don't switch if search is empty
  }

  // Search across all data types
  const tenantMatches = tenants.filter(tenant => 
    tenant.name.toLowerCase().includes(searchValue.toLowerCase()) ||
    tenant.email.toLowerCase().includes(searchValue.toLowerCase()) ||
    tenant.unit.toLowerCase().includes(searchValue.toLowerCase()) ||
    tenant.property.toLowerCase().includes(searchValue.toLowerCase())
  );

  const propertyMatches = properties.filter(property => 
    property.name.toLowerCase().includes(searchValue.toLowerCase()) ||
    property.address.toLowerCase().includes(searchValue.toLowerCase()) ||
    property.type.toLowerCase().includes(searchValue.toLowerCase())
  );

  const workOrderMatches = workOrders.filter(order => 
    order.issue.toLowerCase().includes(searchValue.toLowerCase()) ||
    order.property.toLowerCase().includes(searchValue.toLowerCase()) ||
    order.tenant.toLowerCase().includes(searchValue.toLowerCase()) ||
    order.unit.toLowerCase().includes(searchValue.toLowerCase()) ||
    (order.assignedTo && order.assignedTo.toLowerCase().includes(searchValue.toLowerCase()))
  );

  // Determine which tab has the most matches
  const matchCounts = [
    { tab: 'tenants', count: tenantMatches.length },
    { tab: 'properties', count: propertyMatches.length },
    { tab: 'workorders', count: workOrderMatches.length }
  ];

  // Sort by count (highest first)
  matchCounts.sort((a, b) => b.count - a.count);

  // Auto-switch to the tab with the most results (if any results found)
  if (matchCounts[0].count > 0) {
    setActiveTab(matchCounts[0].tab);
  }
};

  
  // Welcome Dashboard Component with better UX
  const Dashboard = () => {

  const stats = getQuickStats();
  const financialStats = getComprehensiveFinancialStats();
  const dynamicNotifications = getDynamicNotifications();

    return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 text-white">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold mb-2">Welcome! 👋 
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
      {properties.length == 0 && (
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">  
<div 
  onClick={() => openModal('viewPropertiesOverview')}
  className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow cursor-pointer"
>
  <div className="flex items-center justify-between mb-4">
    <div className="p-2 bg-blue-100 rounded-lg">
      <Building className="w-6 h-6 text-blue-600" />
    </div>
    <span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded-full">
      Click to view details
    </span>
  </div>
  <h3 className="text-sm font-medium text-gray-600 mb-1">Total Properties</h3>

  <p className="text-2xl font-bold text-gray-900 mb-2">{properties.length}</p>
  <div className="flex items-center text-sm text-green-600">
    <TrendingUp className="w-4 h-4 mr-1" />
    {(() => {
      const totalUnits = properties.reduce((sum, p) => sum + p.units, 0);
      const occupiedUnits = properties.reduce((sum, p) => sum + p.occupied, 0);
      const occupancyRate = totalUnits > 0 ? (occupiedUnits / totalUnits) * 100 : 0;
      return `${occupancyRate.toFixed(1)}% occupancy rate`;
    })()}
  </div>
</div>

            <div 
                onClick={() => openModal('viewTotalUnits')}
                className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow cursor-pointer">
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

            <div 
            onClick={() => openModal('viewMonthlyRevenue')}
            className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow cursor-pointer">
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

            <div 
            onClick={() => openModal('viewOccupancyRate')}
            className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow cursor-pointer"
              >
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Users className="w-6 h-6 text-purple-600" />
                </div>
                <span className="text-xs text-purple-600 bg-purple-100 px-2 py-1 rounded-full">
                  {stats.occupancyRate || 0}%
                </span>
              </div>
              <h3 className="text-sm font-medium text-gray-600 mb-1">
                View Occupancy Rate
              </h3>
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
                      notification.type == 'warning' ? 'bg-yellow-50 border-yellow-200' :
                      notification.type == 'alert' ? 'bg-red-50 border-red-200' :
                      'bg-blue-50 border-blue-200'
                    }`}>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center">
                          <div className={`w-2 h-2 rounded-full mr-2 mt-1 ${
                            notification.type == 'warning' ? 'bg-yellow-600' :
                            notification.type == 'alert' ? 'bg-red-600' :
                            'bg-blue-600'
                          }`}></div>
                          <div>
                            <p className={`text-sm font-medium ${
                              notification.type == 'warning' ? 'text-yellow-800' :
                              notification.type == 'alert' ? 'text-red-800' :
                              'text-blue-800'
                            }`}>{notification.message}</p>
                            <p className={`text-xs ${
                              notification.type == 'warning' ? 'text-yellow-600' :
                              notification.type == 'alert' ? 'text-red-600' :
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
                 <div key={order.id}
                 onClick={() => openModal('viewWorkOrder', order)}
                 className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-gray-900 text-sm">{order.issue}</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          order.priority == 'High' ? 'bg-red-100 text-red-800' :
                          order.priority == 'Medium' ? 'bg-yellow-100 text-yellow-800' :
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

      {/* Show search indicator */}
      {searchQuery && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-blue-800">
              Searching properties for: "<strong>{searchQuery}</strong>"
            </span>
            <button 
              onClick={() => setTenantSearchQuery('')}
              className="text-blue-600 hover:text-blue-800"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {properties
          .filter(property => 
            searchQuery === '' || 
            property.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            property.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
            property.type.toLowerCase().includes(searchQuery.toLowerCase())
          )
          .map(property => (
            <div key={property.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-shadow">
              {/* ... rest of your existing property card code ... */}
            </div>
          ))}
      </div>

      {/* No results message */}
      {searchQuery && properties.filter(property => 
        property.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        property.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
        property.type.toLowerCase().includes(searchQuery.toLowerCase())
      ).length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-500">No properties found matching "{searchQuery}"</p>
        </div>
      )}

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
  const Tenants = ({searchQuery = ''}) => (

    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Tenants</h2>
          <p className="text-gray-600">Manage tenant information and communications</p>
        </div>
  <div className="relative w-full">   
  </div>
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
          {/* Show active search indicator */}
          {searchQuery && (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-blue-800">
            Searching for: "<strong>{searchQuery}</strong>"
          </span>
          <button 
            onClick={() => setTenantSearchQuery('')}
            className="text-blue-600 hover:text-blue-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    )}

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
                tenant.unit.toLowerCase().includes(searchQuery.toLowerCase()) ||
                tenant.property.toLowerCase().includes(searchQuery.toLowerCase()) ||
                tenant.email.toLowerCase().includes(searchQuery.toLowerCase())
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
                      <button
                        onClick={() => openModal('viewTenant', tenant)}
                        className="text-blue-600 hover:text-blue-900 transition-colors"
                        >
                        View
                      </button>
                       <button 
                       onClick={() => openModal('editTenant', tenant)}
                       className="text-gray-600 hover:text-gray-900 transition-colors"
                       >
                       Edit
                      </button>
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
  const filteredWorkOrders = workOrders.filter(order => {
    const statusMatch = filterStatus === 'all' || order.status === filterStatus;
    const priorityMatch = filterPriority === 'all' || order.priority === filterPriority;
    return statusMatch && priorityMatch;
  });

    const [viewMode, setViewMode] = useState(() => {
    return localStorage.getItem('workOrderViewMode') || 'cards';
  });
const WorkOrders = ({ searchQuery = '' }) => {
  // Filter work orders based on both existing filters AND global search
  const filteredWorkOrders = workOrders.filter(order => {
    const statusMatch = filterStatus === 'all' || order.status === filterStatus;
    const priorityMatch = filterPriority === 'all' || order.priority === filterPriority;
    const searchMatch = searchQuery === '' || 
      order.issue.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.property.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.tenant.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.unit.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (order.assignedTo && order.assignedTo.toLowerCase().includes(searchQuery.toLowerCase()));
    
    return statusMatch && priorityMatch && searchMatch;
  });


  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Work Orders</h2>
          <p className="text-gray-600">Track and manage maintenance requests</p>
        </div>
        
        {/* View Toggle and Filters */}
        <div className="flex items-center space-x-4">
          {/* Filters */}
          <select 
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          >
            <option value="all">All Status</option>
            <option value="Open">Open</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
          </select>
          
          <select 
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          >
            <option value="all">All Priority</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>

          {/* View Mode Toggle */}
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('cards')}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'cards'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Cards
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'table'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Table
            </button>
          </div>

          <button 
            onClick={() => openModal('addWorkOrder')}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 flex items-center transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Work Order
          </button>
        </div>
      </div>

            {/* Show search indicator */}
      {searchQuery && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-blue-800">
              Searching work orders for: "<strong>{searchQuery}</strong>"
            </span>
            <button 
              onClick={() => setTenantSearchQuery('')}
              className="text-blue-600 hover:text-blue-800"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}


      {/* Cards View */}
      {viewMode === 'cards' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredWorkOrders.map(order => (
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
                <button
                  onClick={() => openModal('editWorkOrder', order)}
                  className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm"
                >
                  Update
                </button>
                <button className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-lg hover:bg-gray-200 transition-colors text-sm">
                  Assign
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Table View */}
      {viewMode === 'table' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Work Order
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Property/Unit
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tenant
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Priority
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date Submitted
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Assigned To
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Est. Cost
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredWorkOrders.map(order => (
                  <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{order.issue}</div>
                        <div className="text-sm text-gray-500">#{order.id}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm text-gray-900">{order.property}</div>
                        <div className="text-sm text-gray-500">Unit {order.unit}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {order.tenant}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        order.priority === 'High' ? 'bg-red-100 text-red-800' :
                        order.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {order.priority}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        order.status === 'Open' ? 'bg-red-100 text-red-800' :
                        order.status === 'In Progress' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {order.dateSubmitted}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {order.assignedTo || (
                        <span className="text-gray-400 italic">Unassigned</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {order.estimatedCost > 0 ? `$${order.estimatedCost.toLocaleString()}` : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => openModal('viewWorkOrder', order)}
                          className="text-blue-600 hover:text-blue-900 transition-colors"
                        >
                          View
                        </button>
    <button
      onClick={() => openModal('editWorkOrder', order)}
      className="text-green-600 hover:text-green-900 transition-colors"
    >
      Update
    </button>
    <button className="text-gray-600 hover:text-gray-900 transition-colors">
      Assign
    </button>
  </div>
</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {filteredWorkOrders.length === 0 && (
            <div className="text-center py-8">
              <Wrench className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg mb-2">No work orders found</p>
              <p className="text-gray-400 text-sm mb-4">
                {filterStatus !== 'all' || filterPriority !== 'all'
                  ? 'Try adjusting your filters or create a new work order.'
                  : 'Create your first work order to get started.'
                }
              </p>
              <button 
                onClick={() => openModal('addWorkOrder')}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-4 h-4 mr-2 inline" />
                Create Work Order
              </button>
            </div>
          )}
        </div>
      )}

      {/* Work Order Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900">{workOrders.length}</p>
            <p className="text-sm text-gray-600">Total Orders</p>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
          <div className="text-center">
            <p className="text-2xl font-bold text-red-600">
              {workOrders.filter(wo => wo.status === 'Open').length}
            </p>
            <p className="text-sm text-gray-600">Open</p>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
          <div className="text-center">
            <p className="text-2xl font-bold text-yellow-600">
              {workOrders.filter(wo => wo.status === 'In Progress').length}
            </p>
            <p className="text-sm text-gray-600">In Progress</p>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
          <div className="text-center">
            <p className="text-2xl font-bold text-green-600">
              {workOrders.filter(wo => wo.status === 'Completed').length}
            </p>
            <p className="text-sm text-gray-600">Completed</p>
          </div>
        </div>
      </div>
    </div>
  );
};
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
  Record Transaction
</button>

          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center transition-colors">
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </button>
        </div>
      </div>


      {/* Interactive Financial Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div 
        onClick={() => openModal('viewMonthlyRevenue')}
        className="bg-gradient-to-r from-green-500 to-green-600 text-white p-6 rounded-xl cursor-pointer hover:shadow-lg transition-shadow">
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
    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Property/Unit</th> {/* ← Add this column */}
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
          transaction.type == 'income' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {transaction.type == 'income' ? 'Income' : 'Expense'}
        </span>
      </td>
       <td className="px-6 py-4 text-sm text-gray-900">
        <div>
          <div className="font-medium">{transaction.property || 'General'}</div>
          {transaction.unit && (
            <div className="text-xs text-gray-500">Unit {transaction.unit}</div>
          )}
          {transaction.tenant && (
            <div className="text-xs text-gray-400">{transaction.tenant}</div>
          )}
        </div>
      </td>
      <td className={`px-6 py-4 text-sm font-medium ${
        transaction.amount > 0 ? 'text-green-600' : 'text-red-600'
      }`}>
        {transaction.amount > 0 ? '+' : ''}${Math.abs(transaction.amount).toLocaleString()}
      </td>
      <td className="px-6 py-4">
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          transaction.status == 'completed' ? 'bg-green-100 text-green-800' :
          transaction.status == 'pending' ? 'bg-yellow-100 text-yellow-800' :
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
        {filteredTransactions().length == 0 && (
          <div className="text-center py-8">
            <p className="text-gray-500">No transactions found for the selected filter.</p>
          </div>
        )}
      </div>
    </div>
  );
};

const Analytics = ({ properties, tenants }) => {
   const [analyticsData, setAnalyticsData] = useState({});
   const [lastUpdated, setLastUpdated] = useState(new Date());
    useEffect(() => {
    const calculateAnalytics = () => {
      const totalUnits = properties.reduce((acc, prop) => acc + (prop.units || 0), 0);
      const occupiedUnits = properties.reduce((acc, prop) => acc + (prop.occupied || 0), 0);
      const vacantUnits = totalUnits - occupiedUnits;
      const occupancyRate = totalUnits > 0 ? Math.round((occupiedUnits / totalUnits) * 100) : 0;
      
      // Calculate revenue metrics
      const totalRevenue = properties.reduce((acc, prop) => acc + (prop.monthlyRevenue || 0), 0);
      const averageRent = tenants.length > 0 ? 
        tenants.reduce((acc, tenant) => acc + (tenant.rent || 0), 0) / tenants.length : 0;
      
      // Property performance metrics
      const propertyMetrics = properties.map(property => {
        const propertyTenants = tenants.filter(t => t.property === property.name && t.status === 'Current');
        const propertyOccupancyRate = property.units > 0 ? (property.occupied / property.units) * 100 : 0;
        
        return {
          ...property,
          occupancyRate: propertyOccupancyRate,
          tenantCount: propertyTenants.length,
          revenuePerUnit: property.units > 0 ? property.monthlyRevenue / property.units : 0
        };
      });

      setAnalyticsData({
        totalUnits,
        occupiedUnits,
        vacantUnits,
        occupancyRate,
        totalRevenue,
        averageRent,
        propertyMetrics
      });
    };

      calculateAnalytics();
      setLastUpdated(new Date());
  }, [properties, tenants]);
 
  return (
    <div className="space-y-6">
      <div>
        <h1>
          <button
            onClick={() => {
              // Force re-calculation
              setLastUpdated(new Date());
              // You could also trigger a recalculation function here
            }}
  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center transition-colors"
>
  <TrendingUp className="w-4 h-4 mr-2" />
  Refresh Data
</button>
</h1>
<div className="text-right">
          <p className="text-sm text-gray-500">Last updated</p>
          <p className="text-sm font-medium text-gray-900">
            {lastUpdated.toLocaleTimeString()}
          </p>
        </div>

        <h2 className="text-2xl font-bold text-gray-900">Occupancy Analytics</h2>
        <p className="text-gray-600">Detailed insights into your property occupancy</p>
      </div>
      
      {/* Real-time metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-sm font-medium text-gray-600 mb-1">Total Units</h3>
          <p className="text-3xl font-bold text-gray-900">{analyticsData.totalUnits || 0}</p>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-sm font-medium text-gray-600 mb-1">Occupied Units</h3>
          <p className="text-3xl font-bold text-green-600">{analyticsData.occupiedUnits || 0}</p>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-sm font-medium text-gray-600 mb-1">Vacant Units</h3>
          <p className="text-3xl font-bold text-orange-600">{analyticsData.vacantUnits || 0}</p>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-sm font-medium text-gray-600 mb-1">Occupancy Rate</h3>
          <p className="text-3xl font-bold text-blue-600">{analyticsData.occupancyRate || 0}%</p>
        </div>
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
        <h3 className="text-lg font-semibold mb-4">Property Performance</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Property</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Units</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Occupied</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Occupancy Rate</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Monthly Revenue</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Revenue/Unit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {analyticsData.propertyMetrics?.map(property => (
                <tr key={property.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{property.name}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{property.units}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{property.occupied}</td>
                  <td className="px-6 py-4 text-sm">
                    <div className="flex items-center">
                      <span className="text-gray-900 mr-2">{property.occupancyRate?.toFixed(1)}%</span>
                      <div className="w-16 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${property.occupancyRate}%` }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">
                    ${property.monthlyRevenue?.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    ${property.revenuePerUnit?.toFixed(0)}
                  </td>
                </tr>
              )) || (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                    No properties to analyze
                  </td>
                </tr>
              )}
            </tbody>
          </table>
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


// Replace your existing Documents component with this complete version:
const Documents = () => {
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('general');
  const [selectedProperty, setSelectedProperty] = useState(null);

  // Calculate lease statistics
  const activeLeases = tenants.filter(tenant => tenant.status === 'Current').length;
  const totalLeases = tenants.length;
  const expiredLeases = tenants.filter(tenant => {
    if (!tenant.leaseEnd) return false;
    return new Date(tenant.leaseEnd) < new Date();
  }).length;
  const expiringInNext30Days = tenants.filter(tenant => {
    if (!tenant.leaseEnd) return false;
    const leaseEnd = new Date(tenant.leaseEnd);
    const today = new Date();
    const thirtyDaysFromNow = new Date(today.getTime() + (30 * 24 * 60 * 60 * 1000));
    return leaseEnd >= today && leaseEnd <= thirtyDaysFromNow;
  }).length;

  // Handle document upload
  const handleDocumentUpload = (uploadedFiles) => {
    console.log('Documents uploaded:', uploadedFiles);
    
    // Process each uploaded file
    uploadedFiles.forEach(fileData => {
      if (fileData.status === 'processed') {
        const newDocument = {
          id: Date.now() + Math.random(),
          name: fileData.name,
          type: fileData.type,
          size: fileData.size,
          category: selectedCategory,
          propertyId: selectedProperty?.id || null,
          propertyName: selectedProperty?.name || 'General',
          uploadDate: new Date().toISOString(),
          url: fileData.data, // Base64 data URL
          fileType: fileData.type.startsWith('image/') ? 'image' : 'document'
        };

        // Add to documents state
        setDocuments(prev => {
          const updatedDocs = [...prev, newDocument];
          // Save to localStorage
          try {
            localStorage.setItem('documents', JSON.stringify(updatedDocs));
            console.log('✅ Document saved:', newDocument);
          } catch (error) {
            console.error('❌ Failed to save document:', error);
          }
          return updatedDocs;
        });
      }
    });

    // Close modal after upload
    setShowUploadModal(false);
    
    // Show success message
    alert('Documents uploaded successfully!');
  };

  // Delete document function
  const deleteDocument = (documentId) => {
    if (window.confirm('Are you sure you want to delete this document?')) {
      setDocuments(prev => {
        const updatedDocs = prev.filter(doc => doc.id !== documentId);
        try {
          localStorage.setItem('documents', JSON.stringify(updatedDocs));
          console.log('✅ Document deleted');
        } catch (error) {
          console.error('❌ Failed to delete document:', error);
        }
        return updatedDocs;
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div> 
          <h2 className="text-2xl font-bold text-gray-900">Document Management</h2>
          <p className="text-gray-600">Organize and manage all your property documents</p>
        </div>
        <div className="flex space-x-2">
          <button 
            onClick={() => setShowUploadModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center transition-colors"
          >
            <Upload className="w-4 h-4 mr-2" />
            Upload Document
          </button>
        </div>
      </div>

      {/* Document Categories with Real Data */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Leases Card */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
            <span className="text-sm text-gray-500">{totalLeases} total</span>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Leases</h3>
          
          <div className="space-y-3 mb-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Active Contracts:</span>
              <span className="text-sm font-semibold text-green-600">{activeLeases}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Expired Leases:</span>
              <span className="text-sm font-semibold text-red-600">{expiredLeases}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Expiring (30 days):</span>
              <span className="text-sm font-semibold text-orange-600">{expiringInNext30Days}</span>
            </div>
          </div>

          <div className="mb-4">
            <div className="flex justify-between text-xs text-gray-600 mb-1">
              <span>Occupancy Rate</span>
              <span>{totalLeases > 0 ? Math.round((activeLeases / properties.reduce((acc, prop) => acc + prop.units, 0)) * 100) : 0}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full"
                style={{ 
                  width: `${totalLeases > 0 ? (activeLeases / properties.reduce((acc, prop) => acc + prop.units, 0)) * 100 : 0}%` 
                }}
              />
            </div>
          </div>

          <button className="w-full text-blue-600 hover:text-blue-800 font-medium text-sm transition-colors">
            View All Leases →
          </button>
        </div>

        {/* Insurance Card */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-green-100 rounded-lg">
              <FileText className="w-6 h-6 text-green-600" />
            </div>
            <span className="text-sm text-gray-500">{properties.length} policies</span>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Insurance</h3>
          <p className="text-sm text-gray-600 mb-4">Property insurance documents and coverage details</p>
          <button className="w-full text-green-600 hover:text-green-800 font-medium text-sm transition-colors">
            View Policies →
          </button>
        </div>

        {/* Maintenance Card */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-yellow-100 rounded-lg">
              <Wrench className="w-6 h-6 text-yellow-600" />
            </div>
            <span className="text-sm text-gray-500">{workOrders.length} records</span>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Maintenance</h3>
          <p className="text-sm text-gray-600 mb-4">Work orders, receipts, and maintenance records</p>
          <button 
            onClick={() => setActiveTab('workorders')}
            className="w-full text-yellow-600 hover:text-yellow-800 font-medium text-sm transition-colors"
          >
            View Records →
          </button>
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Size</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {/* Show uploaded documents */}
              {documents.map(doc => (
                <tr key={doc.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 mr-3">
                        {doc.fileType === 'image' ? (
                          <div className="w-8 h-8 bg-green-100 rounded flex items-center justify-center">
                            <span className="text-green-600 text-xs">🖼️</span>
                          </div>
                        ) : (
                          <div className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center">
                            <FileText className="w-4 h-4 text-blue-600" />
                          </div>
                        )}
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">{doc.name}</div>
                        <div className="text-xs text-gray-500">{doc.category}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      doc.fileType === 'image' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                    }`}>
                      {doc.fileType === 'image' ? 'Image' : 'Document'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">{doc.propertyName}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {new Date(doc.uploadDate).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {(doc.size / 1024 / 1024).toFixed(2)} MB
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => window.open(doc.url, '_blank')}
                        className="text-blue-600 hover:text-blue-900 transition-colors"
                      >
                        View
                      </button>
                      <button 
                        onClick={() => {
                          const link = document.createElement('a');
                          link.href = doc.url;
                          link.download = doc.name;
                          link.click();
                        }}
                        className="text-green-600 hover:text-green-900 transition-colors"
                      >
                        Download
                      </button>
                      <button 
                        onClick={() => deleteDocument(doc.id)}
                        className="text-red-600 hover:text-red-900 transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {/* Show lease documents from actual tenant data */}
              {tenants.slice(0, 5).map(tenant => (
                <tr key={`lease-${tenant.id}`} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 mr-3">
                        <div className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center">
                          <FileText className="w-4 h-4 text-blue-600" />
                        </div>
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">{tenant.name} - Lease Agreement</div>
                        <div className="text-xs text-gray-500">lease</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                      Lease
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">{tenant.property}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{tenant.leaseEnd || 'N/A'}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">-</td>
                  <td className="px-6 py-4 text-sm">
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => openModal('viewTenant', tenant)}
                        className="text-blue-600 hover:text-blue-900 transition-colors"
                      >
                        View
                      </button>
                      <button className="text-gray-600 hover:text-gray-900 transition-colors">
                        Download
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              
              {tenants.length === 0 && documents.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-gray-500">
                    No documents yet. Upload your first document to get started!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Lease Expiration Alerts */}
      {expiringInNext30Days > 0 && (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertTriangle className="w-5 h-5 text-orange-600 mr-3" />
            <div>
              <h4 className="text-sm font-medium text-orange-800">
                {expiringInNext30Days} lease{expiringInNext30Days > 1 ? 's' : ''} expiring in the next 30 days
              </h4>
              <p className="text-sm text-orange-700">
                Review and renew leases to maintain occupancy rates.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Upload Documents</h3>
                <button 
                  onClick={() => setShowUploadModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            
            <div className="p-6">
              {/* Category and Property Selection */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category
                  </label>
                  <select 
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="general">General</option>
                    <option value="leases">Leases</option>
                    <option value="insurance">Insurance</option>
                    <option value="maintenance">Maintenance</option>
                    <option value="financial">Financial</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Property (Optional)
                  </label>
                  <select 
                    value={selectedProperty?.id || ''}
                    onChange={(e) => setSelectedProperty(properties.find(p => p.id == e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Property</option>
                    {properties.map(property => (
                      <option key={property.id} value={property.id}>
                        {property.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <DocumentUpload 
                onFilesChange={handleDocumentUpload}
                maxFiles={10}
                maxFileSize={10 * 1024 * 1024} // 10MB
                acceptedTypes={['.pdf', '.doc', '.docx', '.txt', '.jpg', '.jpeg', '.png', '.gif', '.webp']}
                enablePreview={true}
                category={selectedCategory}
                propertyId={selectedProperty?.id}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
    

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
          </div>
          <h3 className="text-lg font-semibold mb-2">Occupancy Report</h3>
          <p className="text-sm text-gray-600 mb-4">Average occupancy rate</p>
          <button 
          onClick={() => setActiveTab('analytics')}
          className="w-full bg-blue-50 text-blue-600 py-2 rounded-lg hover:bg-blue-100 transition-colors"
          >
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
  )

        
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
  placeholder={`Search ${activeTab === 'tenants' ? 'tenants' : activeTab === 'properties' ? 'properties' : activeTab === 'workorders' ? 'work orders' : 'everything'}...`}
  value={tenantSearchQuery}
  onChange={(e) => handleSmartSearch(e.target.value)}
  className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 transition-colors"
/>
    {tenantSearchQuery && (
     <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-80 overflow-y-auto">
  {/* Tenant Results */}
    {(() => {
      const tenantMatches = tenants.filter(tenant => 
        tenant.name.toLowerCase().includes(tenantSearchQuery.toLowerCase()) ||
        tenant.email.toLowerCase().includes(tenantSearchQuery.toLowerCase()) ||
        tenant.unit.toLowerCase().includes(tenantSearchQuery.toLowerCase()) ||
        tenant.property.toLowerCase().includes(tenantSearchQuery.toLowerCase())
      );
      
      if (tenantMatches.length > 0) {
        return (
          <div className="p-2">
            <div className="text-xs font-medium text-gray-500 px-2 py-1">TENANTS ({tenantMatches.length})</div>
            {tenantMatches.slice(0, 3).map(tenant => (
              <button
                key={tenant.id}
                onClick={() => {
                  setActiveTab('tenants');
                  setTenantSearchQuery('');
                  openModal('viewTenant', tenant);
                }}
                className="w-full px-2 py-2 text-left hover:bg-gray-50 rounded flex items-center"
              >
                <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs mr-2">
                  {tenant.avatar}
                </div>
                <div>
                  <div className="text-sm font-medium">{tenant.name}</div>
                  <div className="text-xs text-gray-500">{tenant.unit} • {tenant.property}</div>
                </div>
              </button>
            ))}
            {tenantMatches.length > 3 && (
              <button
                onClick={() => setActiveTab('tenants')}
                className="w-full px-2 py-1 text-xs text-blue-600 hover:bg-blue-50 rounded"
              >
                View all {tenantMatches.length} tenant results →
              </button>
            )}
          </div>
        );
      }
    })()}

    {/* Property Results */}
    {(() => {
      const propertyMatches = properties.filter(property => 
        property.name.toLowerCase().includes(tenantSearchQuery.toLowerCase()) ||
        property.address.toLowerCase().includes(tenantSearchQuery.toLowerCase()) ||
        property.type.toLowerCase().includes(tenantSearchQuery.toLowerCase())
      );
      
      if (propertyMatches.length > 0) {
        return (
          <div className="p-2 border-t border-gray-100">
            <div className="text-xs font-medium text-gray-500 px-2 py-1">PROPERTIES ({propertyMatches.length})</div>
            {propertyMatches.slice(0, 3).map(property => (
              <button
                key={property.id}
                onClick={() => {
                  setActiveTab('properties');
                  setTenantSearchQuery('');
                  openModal('viewProperty', property);
                }}
                className="w-full px-2 py-2 text-left hover:bg-gray-50 rounded"
              >
                <div className="text-sm font-medium">{property.name}</div>
                <div className="text-xs text-gray-500">{property.address}</div>
              </button>
            ))}
            {propertyMatches.length > 3 && (
              <button
                onClick={() => setActiveTab('properties')}
                className="w-full px-2 py-1 text-xs text-blue-600 hover:bg-blue-50 rounded"
              >
                View all {propertyMatches.length} property results →
              </button>
            )}
          </div>
        );
      }
    })()}

    {/* Work Order Results */}
    {(() => {
      const workOrderMatches = workOrders.filter(order => 
        order.issue.toLowerCase().includes(tenantSearchQuery.toLowerCase()) ||
        order.property.toLowerCase().includes(tenantSearchQuery.toLowerCase()) ||
        order.tenant.toLowerCase().includes(tenantSearchQuery.toLowerCase()) ||
        order.unit.toLowerCase().includes(tenantSearchQuery.toLowerCase())
      );
      
      if (workOrderMatches.length > 0) {
        return (
          <div className="p-2 border-t border-gray-100">
            <div className="text-xs font-medium text-gray-500 px-2 py-1">WORK ORDERS ({workOrderMatches.length})</div>
            {workOrderMatches.slice(0, 3).map(order => (
              <button
                key={order.id}
                onClick={() => {
                  setActiveTab('workorders');
                  setTenantSearchQuery('');
                  openModal('viewWorkOrder', order);
                }}
                className="w-full px-2 py-2 text-left hover:bg-gray-50 rounded"
              >
                <div className="text-sm font-medium">{order.issue}</div>
                <div className="text-xs text-gray-500">{order.unit} • {order.tenant}</div>
              </button>
            ))}
            {workOrderMatches.length > 3 && (
              <button
                onClick={() => setActiveTab('workorders')}
                className="w-full px-2 py-1 text-xs text-blue-600 hover:bg-blue-50 rounded"
              >
                View all {workOrderMatches.length} work order results →
              </button>
            )}
          </div>
        );
      }
    })()}

    {/* No Results */}
    {(() => {
      const allMatches = [
        ...tenants.filter(t => t.name.toLowerCase().includes(tenantSearchQuery.toLowerCase())),
        ...properties.filter(p => p.name.toLowerCase().includes(tenantSearchQuery.toLowerCase())),
        ...workOrders.filter(w => w.issue.toLowerCase().includes(tenantSearchQuery.toLowerCase()))
      ];
      
      if (allMatches.length === 0) {
        return (
          <div className="p-4 text-center text-gray-500">
            <Search className="w-6 h-6 mx-auto mb-2 text-gray-300" />
            <div className="text-sm">No results found for "{tenantSearchQuery}"</div>
          </div>
        );
      }
    })()}
  </div>
    )}
      <button 
        onClick={() => setTenantSearchQuery('')}
        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
      >
        <X className="w-4 h-4" />
      </button>
    
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
                      activeTab == tab.id
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                    }`}
                  >
                    <Icon className={`w-5 h-5 mr-3 transition-transform group-hover:scale-110 ${
                      activeTab == tab.id ? 'text-white' : 'text-gray-400'
                    }`} />
                    <div className="text-left">
                      <div className="font-medium">{tab.label}</div>
                      <div className={`text-xs ${
                        activeTab == tab.id ? 'text-blue-100' : 'text-gray-500'
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
            {activeTab == 'dashboard' && <Dashboard />}
            {activeTab == 'properties' && <Properties searchQuery={tenantSearchQuery} />}
            {activeTab == 'tenants' && <Tenants searchQuery={tenantSearchQuery} />}
            {activeTab == 'workorders' && <WorkOrders searchQuery={tenantSearchQuery} />}
            {activeTab == 'financial' && <Financial />}
            {activeTab == 'analytics' && <Analytics properties={properties} tenants={tenants} />}
            {activeTab == 'communication' && <Communication />}
            {activeTab == 'documents' && <Documents />}
            {activeTab == 'reports' && <Reports />}
          </main>
      </div>
    </div>
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
    workOrders={workOrders}  // ← Add this
    openModal={openModal}    // ← Add this
  />
)}
    </div>
  );
}

export default UserFriendlyPropertyApp;
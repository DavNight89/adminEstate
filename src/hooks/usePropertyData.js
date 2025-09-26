import { useState, useEffect } from 'react';
import { safeLocalStorage, loadFromIndexedDB, saveToIndexedDB } from '../utils/storage';

export const usePropertyData = () => {
  // ===== DATA STATE =====
  const [properties, setProperties] = useState([]);
  const [tenants, setTenants] = useState([]);
  const [workOrders, setWorkOrders] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [documents, setDocuments] = useState([]);

  // ===== VIEW MODE STATE =====
  const [viewMode, setViewMode] = useState(() => {
    return localStorage.getItem('workOrderViewMode') || 'cards';
  });

  // ===== LOAD INITIAL DATA =====
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        // Try localStorage first
        const savedProperties = safeLocalStorage.getItem('properties');
        const savedTenants = safeLocalStorage.getItem('tenants');
        const savedWorkOrders = safeLocalStorage.getItem('workOrders');
        const savedTransactions = safeLocalStorage.getItem('transactions');
        const savedDocuments = safeLocalStorage.getItem('documents');

        if (savedProperties) {
          setProperties(JSON.parse(savedProperties));
        } else {
          // Fallback to IndexedDB
          const indexedProperties = await loadFromIndexedDB('properties');
          if (indexedProperties) setProperties(indexedProperties);
        }

        if (savedTenants) {
          setTenants(JSON.parse(savedTenants));
        } else {
          const indexedTenants = await loadFromIndexedDB('tenants');
          if (indexedTenants) setTenants(indexedTenants);
        }

        if (savedWorkOrders) {
          setWorkOrders(JSON.parse(savedWorkOrders));
        } else {
          const indexedWorkOrders = await loadFromIndexedDB('workOrders');
          if (indexedWorkOrders) setWorkOrders(indexedWorkOrders);
        }

        if (savedTransactions) {
          setTransactions(JSON.parse(savedTransactions));
        } else {
          const indexedTransactions = await loadFromIndexedDB('transactions');
          if (indexedTransactions) setTransactions(indexedTransactions);
        }

        if (savedDocuments) {
          setDocuments(JSON.parse(savedDocuments));
        } else {
          const indexedDocuments = await loadFromIndexedDB('documents');
          if (indexedDocuments) setDocuments(indexedDocuments);
        }

        console.log('✅ Initial data loaded successfully');
      } catch (error) {
        console.error('❌ Failed to load initial data:', error);
      }
    };

    loadInitialData();
  }, []);

  // ===== SYNC PROPERTIES WITH TENANTS =====
  useEffect(() => {
    if (tenants.length >= 0 && properties.length > 0) {
      const updatedProperties = properties.map(property => {
        const propertyTenants = tenants.filter(t => t.property === property.name && t.status === 'Current');
        const monthlyRevenue = propertyTenants.reduce((sum, t) => sum + (parseFloat(t.rent) || 0), 0);
        const occupiedCount = propertyTenants.length;

        if (property.monthlyRevenue !== monthlyRevenue || property.occupied !== occupiedCount) {
          return { 
            ...property, 
            monthlyRevenue,
            occupied: occupiedCount
          };
        }
        return property;
      });
      
      // Only update if there are actual changes
      const hasChanges = updatedProperties.some((prop, index) => 
        prop.monthlyRevenue !== properties[index]?.monthlyRevenue ||
        prop.occupied !== properties[index]?.occupied
      );
      
      if (hasChanges) {
        setProperties(updatedProperties);
        safeLocalStorage.setItem('properties', JSON.stringify(updatedProperties));
        console.log('Properties updated with tenant sync:', updatedProperties);
      }
    }
  }, [tenants, properties]);

  // ===== CRUD FUNCTIONS =====
  const addProperty = (newProperty) => {
    const property = {
      ...newProperty,
      id: Date.now(),
      occupied: 0,
      units: parseInt(newProperty.units) || 0,
      monthlyRevenue: 0,
      purchasePrice: parseFloat(newProperty.purchasePrice) || 0
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

  const updateProperty = (updatedProperty, selectedItem) => {
    if (!selectedItem) {
      console.error('No selected item provided for property update');
      return;
    }

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
      
      safeLocalStorage.setItem('properties', JSON.stringify(updated));
      console.log('✅ Property updated:', processedProperty);
      return updated;
    });
  };

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

    // Update property occupancy
    if (newTenant.property && selectedProperty) {
      setProperties(prev => {
        const updatedProperties = prev.map(property => {
          if (property.id == newTenant.property) {
            return {
              ...property, 
              occupied: (property.occupied || 0) + 1 
            };
          }
          return property;
        });
        
        safeLocalStorage.setItem('properties', JSON.stringify(updatedProperties));
        return updatedProperties;
      });
    }
  };

  const updateTenant = (updatedTenant, selectedItem) => {
    if (!selectedItem) {
      console.error('No selected item provided for tenant update');
      return;
    }

    setTenants(prev => {
      const updatedTenants = prev.map(tenant => 
        tenant.id === selectedItem.id 
          ? { ...tenant, ...updatedTenant }
          : tenant
      );
      
      safeLocalStorage.setItem('tenants', JSON.stringify(updatedTenants));
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

    setTransactions(prev => {
      const updatedTransactions = [...prev, transaction];
      safeLocalStorage.setItem('transactions', JSON.stringify(updatedTransactions));
      console.log('Transaction saved:', transaction);
      return updatedTransactions;
    });
  };

  const updateTransaction = (updatedTransaction, selectedItem) => {
    if (!selectedItem) {
      console.error('No selected item provided for transaction update');
      return;
    }

    setTransactions(prev => {
      const updated = prev.map(transaction => 
        transaction.id === selectedItem.id 
          ? { ...transaction, ...updatedTransaction }
          : transaction
      );
      safeLocalStorage.setItem('transactions', JSON.stringify(updated));
      return updated;
    });
  };

  const deleteTransaction = (transactionId) => {
    setTransactions(prev => {
      const updated = prev.filter(transaction => transaction.id !== transactionId);
      safeLocalStorage.setItem('transactions', JSON.stringify(updated));
      return updated;
    });
  };

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
    
    setWorkOrders(prev => {
      const updatedWorkOrders = [...prev, workOrder];
      safeLocalStorage.setItem('workOrders', JSON.stringify(updatedWorkOrders));
      console.log('Work order saved:', workOrder);
      return updatedWorkOrders;
    });
  };

  const updateWorkOrder = (updatedWorkOrder, selectedItem) => {
    if (!selectedItem) {
      console.error('No selected item provided for work order update');
      return;
    }

    setWorkOrders(prev => {
      const updatedWorkOrders = prev.map(workOrder => 
        workOrder.id === selectedItem.id 
          ? { ...workOrder, ...updatedWorkOrder }
          : workOrder
      );
      
      safeLocalStorage.setItem('workOrders', JSON.stringify(updatedWorkOrders));
      console.log('Work order updated:', updatedWorkOrder);
      return updatedWorkOrders;
    });
  };

  // ===== FILTER FUNCTIONS (moved logic out) =====
  const getFilteredTransactions = (transactionFilter = 'all', dateRange = 'month') => {
    const now = new Date();
    const filterDate = new Date();
    
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
      const typeMatch = transactionFilter === 'all' || transaction.type === transactionFilter;
      const transactionDate = new Date(transaction.date);
      const dateMatch = transactionDate >= filterDate;
      return typeMatch && dateMatch;
    });
  };

  const getFilteredWorkOrders = (filterStatus = 'all', filterPriority = 'all') => {
    return workOrders.filter(order => {
      const statusMatch = filterStatus === 'all' || order.status === filterStatus;
      const priorityMatch = filterPriority === 'all' || order.priority === filterPriority;
      return statusMatch && priorityMatch;
    });
  };

  // ===== RETURN ONLY DATA FUNCTIONS =====
  return {
    // Data
    properties,
    tenants,
    workOrders,
    transactions,
    documents,
    viewMode,
    
    // Setters
    setProperties,
    setTenants,
    setWorkOrders,
    setTransactions,
    setDocuments,
    setViewMode,
    
    // CRUD functions
    addProperty,
    updateProperty,
    addTenant,
    updateTenant,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    addWorkOrder,
    updateWorkOrder,
    
    // Filter functions
    getFilteredTransactions,
    getFilteredWorkOrders
  };
};
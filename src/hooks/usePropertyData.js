import { useState, useEffect } from 'react';
import { safeLocalStorage, loadFromIndexedDB, saveToIndexedDB } from '../utils/storage';
import initialData from '../data.json';
// OFFLINE-ONLY: No apiService needed

export const usePropertyData = () => {
  // ===== DATA STATE =====
  const [properties, setProperties] = useState([]);
  const [tenants, setTenants] = useState([]);
  const [workOrders, setWorkOrders] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [applications, setApplications] = useState([]);
  const [screenings, setScreenings] = useState([]);

  // OFFLINE-ONLY: No online status tracking needed

  // ===== VIEW MODE STATE =====
  const [viewMode, setViewMode] = useState(() => {
    return localStorage.getItem('workOrderViewMode') || 'cards';
  });

  // ===== HELPER FUNCTIONS =====
  // OFFLINE-ONLY: No API helper functions needed

  // ===== DECOUPLED DATA LOADING - EACH ENTITY LOADS INDEPENDENTLY =====

  // Load Properties (OFFLINE-ONLY: localStorage only, no API)
  useEffect(() => {
    const loadProperties = async () => {
      try {
        const saved = safeLocalStorage.getItem('properties');
        if (saved) {
          const localData = JSON.parse(saved);
          setProperties(localData);
          console.log(`✅ Properties loaded from localStorage (${localData.length})`);
        } else {
          // No saved data - use initial/fallback data
          const fallback = initialData.properties || [];
          setProperties(fallback);
          safeLocalStorage.setItem('properties', JSON.stringify(fallback));
          console.log(`✅ Properties initialized from fallback data (${fallback.length})`);
        }
      } catch (error) {
        console.error('❌ Error loading properties:', error);
      }
    };
    loadProperties();
  }, []);

  // Load Tenants (OFFLINE-ONLY: localStorage only, no API)
  useEffect(() => {
    const loadTenants = async () => {
      try {
        const saved = safeLocalStorage.getItem('tenants');
        if (saved) {
          setTenants(JSON.parse(saved));
          console.log(`✅ Tenants loaded from localStorage`);
        } else {
          const fallback = initialData.tenants || [];
          setTenants(fallback);
          safeLocalStorage.setItem('tenants', JSON.stringify(fallback));
          console.log(`✅ Tenants initialized from fallback data`);
        }
      } catch (error) {
        console.error('❌ Error loading tenants:', error);
      }
    };
    loadTenants();
  }, []);

  // Load Work Orders (OFFLINE-ONLY: localStorage only, no API, no periodic sync)
  useEffect(() => {
    const loadWorkOrders = async () => {
      try {
        const saved = safeLocalStorage.getItem('workOrders');
        if (saved) {
          setWorkOrders(JSON.parse(saved));
          console.log(`✅ Work orders loaded from localStorage`);
        } else {
          const fallback = initialData.workOrders || [];
          setWorkOrders(fallback);
          safeLocalStorage.setItem('workOrders', JSON.stringify(fallback));
          console.log(`✅ Work orders initialized from fallback data`);
        }
      } catch (error) {
        console.error('❌ Error loading work orders:', error);
      }
    };

    loadWorkOrders();
  }, []);

  // Load Transactions (OFFLINE-ONLY: localStorage only, no API)
  useEffect(() => {
    const loadTransactions = async () => {
      try {
        const saved = safeLocalStorage.getItem('transactions');
        if (saved) {
          const localData = JSON.parse(saved);
          setTransactions(localData);
          console.log(`✅ Transactions loaded from localStorage (${localData.length})`);
        } else {
          // No saved data - use empty array as fallback
          const fallback = [];
          setTransactions(fallback);
          console.log(`✅ Transactions initialized from fallback data`);
        }
      } catch (error) {
        console.error('❌ Error loading transactions:', error);
      }
    };
    loadTransactions();
  }, []);

  // Load Applications (OFFLINE-ONLY: localStorage only, no API)
  useEffect(() => {
    const loadApplications = async () => {
      try {
        const saved = safeLocalStorage.getItem('applications');
        if (saved) {
          const localData = JSON.parse(saved);
          setApplications(localData);
          console.log(`✅ Applications loaded from localStorage (${localData.length})`);
        } else {
          // No saved data - use initial/fallback data
          const fallback = initialData.applications || [];
          setApplications(fallback);
          safeLocalStorage.setItem('applications', JSON.stringify(fallback));
          console.log(`✅ Applications initialized from fallback data (${fallback.length})`);
        }
      } catch (error) {
        console.error('❌ Error loading applications:', error);
      }
    };
    loadApplications();
  }, []);

  // Load Documents (local-only for now)
  useEffect(() => {
    const saved = safeLocalStorage.getItem('documents');
    if (saved) {
      setDocuments(JSON.parse(saved));
    } else {
      setDocuments([]);
    }
  }, []);

  // Load Screenings
  useEffect(() => {
    const saved = safeLocalStorage.getItem('screenings');
    if (saved) {
      setScreenings(JSON.parse(saved));
    } else {
      setScreenings([]);
    }
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
  const addProperty = async (newProperty) => {
    const property = {
      ...newProperty,
      id: Date.now(),
      occupied: 0,
      units: parseInt(newProperty.units) || 0,
      monthlyRevenue: 0,
      purchasePrice: parseFloat(newProperty.purchasePrice) || 0
    };

    // OFFLINE-ONLY: Save directly to localStorage, no API
    setProperties(prev => {
      const updatedProperties = [...prev, property];

      // Save to localStorage
      const savedToLocal = safeLocalStorage.setItem('properties', JSON.stringify(updatedProperties));

      if (!savedToLocal) {
        // Fallback to IndexedDB if localStorage fails
        console.log('📦 localStorage full, trying IndexedDB...');
        saveToIndexedDB('properties', updatedProperties)
          .then(() => console.log('✅ Saved to IndexedDB as fallback'))
          .catch(err => console.error('❌ Both localStorage and IndexedDB failed:', err));
      }

      console.log('✅ Property saved locally:', property);
      return updatedProperties;
    });
  };

  const updateProperty = async (updatedProperty, selectedItem) => {
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

    // OFFLINE-ONLY: Update localStorage directly, no API
    setProperties(prev => {
      const updated = prev.map(property =>
        property.id === selectedItem.id ? processedProperty : property
      );

      safeLocalStorage.setItem('properties', JSON.stringify(updated));
      console.log('✅ Property updated locally:', processedProperty);
      return updated;
    });
  };

  const addTenant = async (newTenant) => {
    const selectedProperty = properties.find(p => p.id == newTenant.property);
    const timestamp = new Date().toISOString();

    const newTenantData = {
      ...newTenant,
      id: Date.now(),
      avatar: newTenant.avatar || newTenant.name.split(' ').map(n => n[0]).join(''),
      status: newTenant.status || 'Current',
      balance: parseFloat(newTenant.balance) || 0,
      unit: newTenant.unit,
      // Preserve property name from CSV import, fallback to selectedProperty for manual entry
      property: newTenant.property || selectedProperty?.name || 'Unknown Property',
      rent: parseFloat(newTenant.rent) || 0,
      email: newTenant.email || '',
      phone: newTenant.phone || '',
      leaseStart: newTenant.leaseStart || '',
      leaseEnd: newTenant.leaseEnd || '',
      created_at: timestamp,
      updated_at: timestamp
    };

    // OFFLINE-ONLY: Save tenant to localStorage directly, no API
    setTenants(prev => {
      const updatedTenants = [...prev, newTenantData];

      // Save to localStorage
      const savedToLocal = safeLocalStorage.setItem('tenants', JSON.stringify(updatedTenants));

      if (!savedToLocal) {
        // Fallback to IndexedDB if localStorage fails
        console.log('📦 localStorage full, trying IndexedDB...');
        saveToIndexedDB('tenants', updatedTenants)
          .then(() => console.log('✅ Saved to IndexedDB as fallback'))
          .catch(err => console.error('❌ Both localStorage and IndexedDB failed:', err));
      }

      console.log('✅ Tenant saved locally:', newTenantData);
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

    const timestamp = new Date().toISOString();

    setTenants(prev => {
      const updatedTenants = prev.map(tenant =>
        tenant.id === selectedItem.id
          ? { ...tenant, ...updatedTenant, updated_at: timestamp }
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

  const addWorkOrder = async (newWorkOrder) => {
    const selectedProperty = properties.find(p => p.id == newWorkOrder.property);

    const workOrder = {
      ...newWorkOrder,
      id: Date.now(),
      status: 'Open',
      dateSubmitted: new Date().toISOString().split('T')[0],
      property: selectedProperty?.name || 'Unknown Property', 
      tenant: tenants.find(t => t.unit == newWorkOrder.unit && t.property == selectedProperty?.name)?.name || 'Unknown'
    };

    // OFFLINE-ONLY: Save work order to localStorage directly, no API
    setWorkOrders(prev => {
      const updatedWorkOrders = [...prev, workOrder];

      // Save to localStorage
      const savedToLocal = safeLocalStorage.setItem('workOrders', JSON.stringify(updatedWorkOrders));

      if (!savedToLocal) {
        // Fallback to IndexedDB if localStorage fails
        console.log('📦 localStorage full, trying IndexedDB...');
        saveToIndexedDB('workOrders', updatedWorkOrders)
          .then(() => console.log('✅ Saved to IndexedDB as fallback'))
          .catch(err => console.error('❌ Both localStorage and IndexedDB failed:', err));
      }

      console.log('✅ Work order saved locally:', workOrder);
      return updatedWorkOrders;
    });
  };

  const updateWorkOrder = async (updatedWorkOrder, selectedItem) => {
    if (!selectedItem) {
      console.error('No selected item provided for work order update');
      return;
    }

    const processedWorkOrder = { ...selectedItem, ...updatedWorkOrder };

    // OFFLINE-ONLY: Update work order in localStorage directly, no API
    setWorkOrders(prev => {
      const updatedWorkOrders = prev.map(workOrder =>
        workOrder.id === selectedItem.id ? processedWorkOrder : workOrder
      );
      safeLocalStorage.setItem('workOrders', JSON.stringify(updatedWorkOrders));
      console.log('✅ Work order updated locally:', processedWorkOrder);
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

  // ===== DOCUMENT FUNCTIONS =====
  const addDocument = async (fileData) => {
    const { file, category, property } = fileData;

    if (!file) {
      console.error('No file provided');
      return;
    }

    try {
      // OFFLINE-ONLY: Convert file to base64 for localStorage storage
      const base64Data = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      // Create document object with base64 data
      const newDocument = {
        id: Date.now().toString(),
        name: file.name,
        type: file.type,
        size: file.size,
        category: category || 'general',
        property: property || 'All Properties',
        dateAdded: new Date().toISOString(),
        uploadedBy: 'Current User',
        base64Data: base64Data  // Store base64 for offline viewing
      };

      // Update documents state
      const updatedDocuments = [...documents, newDocument];
      setDocuments(updatedDocuments);

      // Save to localStorage
      const savedToLocal = safeLocalStorage.setItem('documents', JSON.stringify(updatedDocuments));

      if (!savedToLocal) {
        // Fallback to IndexedDB if localStorage is full
        console.log('📦 localStorage full, trying IndexedDB...');
        await saveToIndexedDB('documents', updatedDocuments);
      }

      console.log('✅ Document saved locally:', file.name);

      return newDocument;
    } catch (error) {
      console.error('❌ Error saving document:', error);
      return null;
    }
  };

  const deleteDocument = (documentId) => {
    const updatedDocuments = documents.filter(doc => doc.id !== documentId);
    setDocuments(updatedDocuments);
    saveToIndexedDB('documents', updatedDocuments);
  };

  // ===== APPLICATION FUNCTIONS =====
  const addApplication = async (newApplication) => {
    const timestamp = new Date().toISOString();

    const application = {
      ...newApplication,
      id: Date.now(),
      status: newApplication.status || 'submitted',
      submittedDate: timestamp,
      lastUpdated: timestamp
    };

    // OFFLINE-ONLY: Save application to localStorage directly, no API
    setApplications(prev => {
      const updatedApplications = [...prev, application];

      // Save to localStorage
      const savedToLocal = safeLocalStorage.setItem('applications', JSON.stringify(updatedApplications));

      if (!savedToLocal) {
        // Fallback to IndexedDB if localStorage fails
        console.log('📦 localStorage full, trying IndexedDB...');
        saveToIndexedDB('applications', updatedApplications)
          .then(() => console.log('✅ Saved to IndexedDB as fallback'))
          .catch(err => console.error('❌ Both localStorage and IndexedDB failed:', err));
      }

      console.log('✅ Application saved locally:', application);
      return updatedApplications;
    });
  };

  const updateApplication = async (updatedApplication, selectedItem) => {
    if (!selectedItem) {
      console.error('No selected item provided for application update');
      return;
    }

    const timestamp = new Date().toISOString();

    const processedApplication = {
      ...selectedItem,
      ...updatedApplication,
      id: selectedItem.id,
      lastUpdated: timestamp
    };

    // OFFLINE-ONLY: Update application in localStorage directly, no API
    setApplications(prev => {
      const updated = prev.map(app =>
        app.id === selectedItem.id ? processedApplication : app
      );
      safeLocalStorage.setItem('applications', JSON.stringify(updated));
      console.log('✅ Application updated locally:', processedApplication);
      return updated;
    });
  };

  const deleteApplication = (applicationId) => {
    // OFFLINE-ONLY: Delete from localStorage directly, no API
    setApplications(prev => {
      const updated = prev.filter(app => app.id !== applicationId);
      safeLocalStorage.setItem('applications', JSON.stringify(updated));
      console.log('✅ Application deleted locally:', applicationId);
      return updated;
    });
  };

  // ===== SCREENING FUNCTIONS =====
  const addScreening = async (newScreening) => {
    const timestamp = new Date().toISOString();

    const screening = {
      ...newScreening,
      id: Date.now(),
      createdAt: timestamp,
      updatedAt: timestamp
    };

    // Save to local state
    setScreenings(prev => {
      const updatedScreenings = [...prev, screening];
      safeLocalStorage.setItem('screenings', JSON.stringify(updatedScreenings));
      console.log('Screening saved locally:', screening);
      return updatedScreenings;
    });

    return screening;
  };

  const updateScreening = async (screeningData, applicationId) => {
    const timestamp = new Date().toISOString();

    setScreenings(prev => {
      // Find existing screening or create new entry
      const existingIndex = prev.findIndex(s => s.applicationId === applicationId);
      let updated;

      if (existingIndex >= 0) {
        // Update existing
        updated = prev.map((s, i) =>
          i === existingIndex
            ? { ...s, ...screeningData, updatedAt: timestamp }
            : s
        );
      } else {
        // Add new
        updated = [...prev, { ...screeningData, applicationId, updatedAt: timestamp, createdAt: timestamp }];
      }

      safeLocalStorage.setItem('screenings', JSON.stringify(updated));
      console.log('Screening updated:', screeningData);
      return updated;
    });
  };

  const getScreeningByApplicationId = (applicationId) => {
    return screenings.find(s => s.applicationId === applicationId);
  };

  // ===== RETURN ONLY DATA FUNCTIONS =====
  return {
    // Data
    properties,
    tenants,
    workOrders,
    transactions,
    documents,
    applications,
    screenings,
    viewMode,

    // OFFLINE-ONLY: No API status needed

    // Setters
    setProperties,
    setTenants,
    setWorkOrders,
    setTransactions,
    setDocuments,
    setApplications,
    setScreenings,
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
    addDocument,
    deleteDocument,
    addApplication,
    updateApplication,
    deleteApplication,
    addScreening,
    updateScreening,
    getScreeningByApplicationId,

    // Filter functions
    getFilteredTransactions,
    getFilteredWorkOrders
  };
};

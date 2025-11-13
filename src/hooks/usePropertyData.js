import { useState, useEffect } from 'react';
import { safeLocalStorage, loadFromIndexedDB, saveToIndexedDB } from '../utils/storage';
import initialData from '../data.json';
import apiService from '../services/apiService';

export const usePropertyData = () => {
  // ===== DATA STATE =====
  const [properties, setProperties] = useState([]);
  const [tenants, setTenants] = useState([]);
  const [workOrders, setWorkOrders] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [applications, setApplications] = useState([]);
  const [screenings, setScreenings] = useState([]);

  // ===== API STATUS STATE =====
  const [isOnline, setIsOnline] = useState(true);

  // ===== VIEW MODE STATE =====
  const [viewMode, setViewMode] = useState(() => {
    return localStorage.getItem('workOrderViewMode') || 'cards';
  });

  // ===== HELPER FUNCTIONS =====
  const isApiError = (error) => {
    return error?.isNetworkError || 
           error?.message?.includes('fetch') || 
           error?.message?.includes('Network') ||
           error?.status === 0;
  };

  const handleApiError = (error, operation) => {
    const isNetworkIssue = isApiError(error);
    if (isNetworkIssue) {
      setIsOnline(false);
      console.log(`🔌 Backend offline for ${operation}, using local storage`);
    } else {
      console.log(`⚠️ API error for ${operation}:`, error.message);
    }
    return isNetworkIssue;
  };

  const syncLocalDataToBackend = async (properties, tenants, workOrders, transactions, applications) => {
    try {
      console.log('🔄 Starting BULK sync of localStorage to backend...');

      // Use new bulk sync endpoint instead of individual API calls
      const localStorageData = {
        properties: properties || [],
        tenants: tenants || [],
        workOrders: workOrders || [],
        transactions: transactions || [],
        documents: [], // Add documents when available
        applications: applications || []
      };

      console.log('📦 Sending bulk data:', {
        properties: localStorageData.properties.length,
        tenants: localStorageData.tenants.length,
        workOrders: localStorageData.workOrders.length,
        transactions: localStorageData.transactions.length,
        applications: localStorageData.applications.length
      });
      
      const response = await apiService.syncLocalStorageData(localStorageData);
      
      if (response.success) {
        console.log('✅ BULK SYNC SUCCESS:', response.message);
        console.log('📊 Sync Results:', response.sync_results);
        return true;
      } else {
        console.error('❌ BULK SYNC FAILED:', response.error);
        return false;
      }
      
    } catch (error) {
        console.error('❌ BULK SYNC ERROR:', error);
        
        // Fallback: Try individual property sync for critical data
        if (properties && properties.length > 0) {
          console.log('🔄 Fallback: Trying individual property sync...');
          let synced = 0;
          for (const property of properties) {
            try {
              await apiService.createProperty(property);
              synced++;
            } catch (e) {
              console.log(`⚠️ Failed to sync ${property.name}:`, e.message);
            }
          }
          if (synced > 0) {
            console.log(`✅ Fallback sync: ${synced}/${properties.length} properties synced`);
            setIsOnline(true);
            return true;
          }
        }
        
        console.log('❌ All sync methods failed - data remains safe locally');
        setIsOnline(false);
        return false;
      }
  };

  // ===== LOAD INITIAL DATA =====
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        console.log('🚀 Starting data load - prioritizing YOUR existing data...');
        
        // PRIORITIZE YOUR LOCAL DATA FIRST
        const savedProperties = safeLocalStorage.getItem('properties');
        const savedTenants = safeLocalStorage.getItem('tenants');
        const savedWorkOrders = safeLocalStorage.getItem('workOrders');
        const savedTransactions = safeLocalStorage.getItem('transactions');
        const savedDocuments = safeLocalStorage.getItem('documents');
        const savedApplications = safeLocalStorage.getItem('applications');
        const savedScreenings = safeLocalStorage.getItem('screenings');

        console.log('🔍 Found your existing data:', {
          properties: savedProperties ? JSON.parse(savedProperties).length : 0,
          tenants: savedTenants ? JSON.parse(savedTenants).length : 0,
          workOrders: savedWorkOrders ? JSON.parse(savedWorkOrders).length : 0,
          transactions: savedTransactions ? JSON.parse(savedTransactions).length : 0,
          documents: savedDocuments ? JSON.parse(savedDocuments).length : 0,
          applications: savedApplications ? JSON.parse(savedApplications).length : 0,
          screenings: savedScreenings ? JSON.parse(savedScreenings).length : 0
        });

        // If you have existing data, use it AND sync to backend
        if (savedProperties || savedTenants || savedWorkOrders) {
          console.log('✅ Loading YOUR existing data AND syncing to backend...');
          
          const localProperties = savedProperties ? JSON.parse(savedProperties) : [];
          const localTenants = savedTenants ? JSON.parse(savedTenants) : [];
          const localWorkOrders = savedWorkOrders ? JSON.parse(savedWorkOrders) : [];
          const localTransactions = savedTransactions ? JSON.parse(savedTransactions) : [];
          const localDocuments = savedDocuments ? JSON.parse(savedDocuments) : [];
          const localApplications = savedApplications ? JSON.parse(savedApplications) : [];
          const localScreenings = savedScreenings ? JSON.parse(savedScreenings) : [];

          // Set data immediately for display
          setProperties(localProperties);
          setTenants(localTenants);
          setWorkOrders(localWorkOrders);
          setTransactions(localTransactions);
          setDocuments(localDocuments);
          setApplications(localApplications);
          setScreenings(localScreenings);

          // Sync your existing data to backend in background
          console.log('🔄 Syncing your existing data to backend...');
          syncLocalDataToBackend(localProperties, localTenants, localWorkOrders, localTransactions, localApplications);
          
          return; // Your data loaded and syncing started
        }

        // Only try backend API if you have NO existing data
        console.log('📥 No existing data found, trying backend API...');
        try {
          const [apiProperties, apiTenants, apiWorkOrders, apiTransactions, apiApplications] = await Promise.all([
            apiService.getProperties().catch(() => null),
            apiService.getTenants().catch(() => null),
            apiService.getWorkOrders().catch(() => null),
            apiService.getTransactions().catch(() => null),
            apiService.getApplications().catch(() => null)
          ]);

          console.log('🌐 API Response:', {
            properties: apiProperties?.length || 0,
            tenants: apiTenants?.length || 0,
            workOrders: apiWorkOrders?.length || 0,
            transactions: apiTransactions?.length || 0,
            applications: apiApplications?.length || 0
          });

          // If API returns data, use it and sync to local storage
          if (apiProperties && apiProperties.length > 0) {
            setProperties(apiProperties);
            safeLocalStorage.setItem('properties', JSON.stringify(apiProperties));
          } else {
            throw new Error('No properties from API');
          }

          if (apiTenants && apiTenants.length > 0) {
            setTenants(apiTenants);
            safeLocalStorage.setItem('tenants', JSON.stringify(apiTenants));
          } else {
            setTenants([]);
            safeLocalStorage.setItem('tenants', JSON.stringify([]));
          }

          if (apiWorkOrders && apiWorkOrders.length > 0) {
            setWorkOrders(apiWorkOrders);
            safeLocalStorage.setItem('workOrders', JSON.stringify(apiWorkOrders));
          } else {
            setWorkOrders([]);
            safeLocalStorage.setItem('workOrders', JSON.stringify([]));
          }

          if (apiTransactions && apiTransactions.length > 0) {
            setTransactions(apiTransactions);
            safeLocalStorage.setItem('transactions', JSON.stringify(apiTransactions));
          } else {
            setTransactions([]);
            safeLocalStorage.setItem('transactions', JSON.stringify([]));
          }

          // Documents are local-only for now
          setDocuments([]);
          safeLocalStorage.setItem('documents', JSON.stringify([]));

          // Load applications from API
          if (apiApplications && apiApplications.length > 0) {
            setApplications(apiApplications);
            safeLocalStorage.setItem('applications', JSON.stringify(apiApplications));
          } else {
            setApplications([]);
            safeLocalStorage.setItem('applications', JSON.stringify([]));
          }

          console.log('✅ Data loaded from backend API successfully');
          return; // Success - exit early
          
        } catch (apiError) {
          console.log('⚠️ Backend API unavailable, falling back to fallback data loading:', apiError.message);
        }

        // Final fallback if no existing data AND no API data
        console.log('📂 Loading fallback data (IndexedDB → data.json)');
        
        // Try IndexedDB as fallback
        const indexedProperties = await loadFromIndexedDB('properties');
        if (indexedProperties && indexedProperties.length > 0) {
          setProperties(indexedProperties);
        } else {
          // Final fallback to initial data
          setProperties(initialData.properties || []);
          safeLocalStorage.setItem('properties', JSON.stringify(initialData.properties || []));
        }

        const indexedTenants = await loadFromIndexedDB('tenants');
        if (indexedTenants && indexedTenants.length > 0) {
          setTenants(indexedTenants);
        } else {
          setTenants(initialData.tenants || []);
          safeLocalStorage.setItem('tenants', JSON.stringify(initialData.tenants || []));
        }

        const indexedWorkOrders = await loadFromIndexedDB('workOrders');
        if (indexedWorkOrders && indexedWorkOrders.length > 0) {
          setWorkOrders(indexedWorkOrders);
        } else {
          setWorkOrders(initialData.workOrders || []);
          safeLocalStorage.setItem('workOrders', JSON.stringify(initialData.workOrders || []));
        }

        const indexedTransactions = await loadFromIndexedDB('transactions');
        if (indexedTransactions && indexedTransactions.length > 0) {
          setTransactions(indexedTransactions);
        } else {
          setTransactions([]);
          safeLocalStorage.setItem('transactions', JSON.stringify([]));
        }

        const indexedDocuments = await loadFromIndexedDB('documents');
        if (indexedDocuments && indexedDocuments.length > 0) {
          setDocuments(indexedDocuments);
        } else {
          setDocuments([]);
          safeLocalStorage.setItem('documents', JSON.stringify([]));
        }

        const indexedApplications = await loadFromIndexedDB('applications');
        if (indexedApplications && indexedApplications.length > 0) {
          setApplications(indexedApplications);
        } else {
          setApplications(initialData.applications || []);
          safeLocalStorage.setItem('applications', JSON.stringify(initialData.applications || []));
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
  const addProperty = async (newProperty) => {
    const property = {
      ...newProperty,
      id: Date.now(),
      occupied: 0,
      units: parseInt(newProperty.units) || 0,
      monthlyRevenue: 0,
      purchasePrice: parseFloat(newProperty.purchasePrice) || 0
    };

    try {
      // Try backend API first
      const apiResponse = await apiService.createProperty(property);
      console.log('✅ Property created on backend:', apiResponse);

      // Unwrap API response - backend returns { success, data, message }
      const apiProperty = apiResponse.data || apiResponse;
      const backendProperty = apiProperty.id ? apiProperty : { ...apiProperty, id: property.id };

      setProperties(prev => {
        const updatedProperties = [...prev, backendProperty];
        safeLocalStorage.setItem('properties', JSON.stringify(updatedProperties));
        console.log('Property synced with backend:', backendProperty);
        return updatedProperties;
      });

    } catch (error) {
      console.log('⚠️ Backend unavailable, saving locally:', error.message);
      
      // Fallback to local storage only
      setProperties(prev => {
        const updatedProperties = [...prev, property];

        if (!safeLocalStorage.setItem('properties', JSON.stringify(updatedProperties))) {
          saveToIndexedDB('properties', updatedProperties)
            .then(() => console.log('✅ Saved to IndexedDB as fallback'))
            .catch(err => console.error('❌ Both localStorage and IndexedDB failed:', err));
        }

        console.log('Property saved locally:', property);   
        return updatedProperties;
      });
    }
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

    try {
      // Try backend API first
      const apiProperty = await apiService.updateProperty(selectedItem.id, processedProperty);
      console.log('✅ Property updated on backend:', apiProperty);
      
      const backendProperty = apiProperty.id ? apiProperty : processedProperty;
      
      setProperties(prev => {
        const updated = prev.map(property => 
          property.id === selectedItem.id ? backendProperty : property
        );
        safeLocalStorage.setItem('properties', JSON.stringify(updated));
        console.log('✅ Property synced with backend:', backendProperty);
        return updated;
      });
      
    } catch (error) {
      console.log('⚠️ Backend unavailable, updating locally:', error.message);
      
      // Fallback to local update only
      setProperties(prev => {
        const updated = prev.map(property => 
          property.id === selectedItem.id ? processedProperty : property
        );

        safeLocalStorage.setItem('properties', JSON.stringify(updated));
        console.log('✅ Property updated locally:', processedProperty);
        return updated;
      });
    }
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

    try {
      // Try backend API first
      const apiResponse = await apiService.createTenant(newTenantData);
      console.log('✅ Tenant created on backend:', apiResponse);

      // Unwrap API response if it has a wrapper structure
      const apiTenant = apiResponse.data || apiResponse;
      const backendTenant = apiTenant.id ? apiTenant : { ...apiTenant, id: newTenantData.id };

      setTenants(prev => {
        const updatedTenants = [...prev, backendTenant];
        safeLocalStorage.setItem('tenants', JSON.stringify(updatedTenants));
        console.log('Tenant synced with backend:', backendTenant);
        return updatedTenants;
      });
      
    } catch (error) {
      console.log('⚠️ Backend unavailable, saving tenant locally:', error.message);
      
      // Fallback to local storage only
      setTenants(prev => {
        const updatedTenants = [...prev, newTenantData];

        if (!safeLocalStorage.setItem('tenants', JSON.stringify(updatedTenants))) {
          saveToIndexedDB('tenants', updatedTenants)
            .then(() => console.log('✅ Tenant saved to IndexedDB as fallback'))
            .catch(err => console.error('❌ Both localStorage and IndexedDB failed:', err));
        }

        console.log('Tenant saved locally:', newTenantData);
        return updatedTenants;
      });
    }

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

    try {
      // Try backend API first
      const apiWorkOrder = await apiService.createWorkOrder(workOrder);
      console.log('✅ Work order created on backend:', apiWorkOrder);
      
      const backendWorkOrder = apiWorkOrder.id ? apiWorkOrder : { ...apiWorkOrder, id: workOrder.id };
      
      setWorkOrders(prev => {
        const updatedWorkOrders = [...prev, backendWorkOrder];
        safeLocalStorage.setItem('workOrders', JSON.stringify(updatedWorkOrders));
        console.log('Work order synced with backend:', backendWorkOrder);
        return updatedWorkOrders;
      });
      
    } catch (error) {
      console.log('⚠️ Backend unavailable, saving work order locally:', error.message);
      
      // Fallback to local storage only
      setWorkOrders(prev => {
        const updatedWorkOrders = [...prev, workOrder];
        safeLocalStorage.setItem('workOrders', JSON.stringify(updatedWorkOrders));
        console.log('Work order saved locally:', workOrder);
        return updatedWorkOrders;
      });
    }
  };

  const updateWorkOrder = async (updatedWorkOrder, selectedItem) => {
    if (!selectedItem) {
      console.error('No selected item provided for work order update');
      return;
    }

    const processedWorkOrder = { ...selectedItem, ...updatedWorkOrder };

    try {
      // Try backend API first
      const apiWorkOrder = await apiService.updateWorkOrder(selectedItem.id, processedWorkOrder);
      console.log('✅ Work order updated on backend:', apiWorkOrder);
      
      const backendWorkOrder = apiWorkOrder.id ? apiWorkOrder : processedWorkOrder;
      
      setWorkOrders(prev => {
        const updatedWorkOrders = prev.map(workOrder => 
          workOrder.id === selectedItem.id ? backendWorkOrder : workOrder
        );
        safeLocalStorage.setItem('workOrders', JSON.stringify(updatedWorkOrders));
        console.log('Work order synced with backend:', backendWorkOrder);
        return updatedWorkOrders;
      });
      
    } catch (error) {
      console.log('⚠️ Backend unavailable, updating work order locally:', error.message);
      
      // Fallback to local update only
      setWorkOrders(prev => {
        const updatedWorkOrders = prev.map(workOrder => 
          workOrder.id === selectedItem.id ? processedWorkOrder : workOrder
        );
        safeLocalStorage.setItem('workOrders', JSON.stringify(updatedWorkOrders));
        console.log('Work order updated locally:', processedWorkOrder);
        return updatedWorkOrders;
      });
    }
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
      // Upload file to backend first
      const formData = new FormData();
      formData.append('file', file);

      const uploadResponse = await fetch('http://localhost:5000/api/upload/document', {
        method: 'POST',
        body: formData
      });

      if (!uploadResponse.ok) {
        throw new Error('Failed to upload file to server');
      }

      const uploadResult = await uploadResponse.json();

      if (!uploadResult.success) {
        throw new Error(uploadResult.error || 'Upload failed');
      }

      // Create document object with file path (NOT base64)
      const newDocument = {
        id: Date.now().toString(),
        name: uploadResult.data.originalName,
        type: uploadResult.data.type,
        size: file.size,
        category: category || 'general',
        property: property || 'All Properties',
        dateAdded: new Date().toISOString(),
        uploadedBy: 'Current User',
        filePath: uploadResult.data.path,  // ✅ Store path, not base64
        url: `http://localhost:5000${uploadResult.data.path}`  // ✅ Full URL for viewing
      };

      // Update documents state
      const updatedDocuments = [...documents, newDocument];
      setDocuments(updatedDocuments);

      // Save to local storage (without base64 bloat!)
      safeLocalStorage.setItem('documents', JSON.stringify(updatedDocuments));
      saveToIndexedDB('documents', updatedDocuments);

      console.log('✅ Document uploaded successfully:', uploadResult.data.originalName);

      return newDocument;
    } catch (error) {
      console.error('❌ Error uploading document:', error);
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

    try {
      // Try backend API first
      const apiApplication = await apiService.createApplication(application);
      console.log('✅ Application created on backend:', apiApplication);

      const backendApplication = apiApplication.id ? apiApplication : { ...apiApplication, id: application.id };

      setApplications(prev => {
        const updatedApplications = [...prev, backendApplication];
        safeLocalStorage.setItem('applications', JSON.stringify(updatedApplications));
        console.log('Application synced with backend:', backendApplication);
        return updatedApplications;
      });

    } catch (error) {
      console.log('⚠️ Backend unavailable, saving application locally:', error.message);

      // Fallback to local storage only
      setApplications(prev => {
        const updatedApplications = [...prev, application];

        if (!safeLocalStorage.setItem('applications', JSON.stringify(updatedApplications))) {
          saveToIndexedDB('applications', updatedApplications)
            .then(() => console.log('✅ Application saved to IndexedDB as fallback'))
            .catch(err => console.error('❌ Both localStorage and IndexedDB failed:', err));
        }

        console.log('Application saved locally:', application);
        return updatedApplications;
      });
    }
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

    try {
      // Try backend API first
      const apiApplication = await apiService.updateApplication(selectedItem.id, processedApplication);
      console.log('✅ Application updated on backend:', apiApplication);

      const backendApplication = apiApplication.id ? apiApplication : processedApplication;

      setApplications(prev => {
        const updated = prev.map(app =>
          app.id === selectedItem.id ? backendApplication : app
        );
        safeLocalStorage.setItem('applications', JSON.stringify(updated));
        console.log('✅ Application synced with backend:', backendApplication);
        return updated;
      });

    } catch (error) {
      console.log('⚠️ Backend unavailable, updating application locally:', error.message);

      // Fallback to local update only
      setApplications(prev => {
        const updated = prev.map(app =>
          app.id === selectedItem.id ? processedApplication : app
        );
        safeLocalStorage.setItem('applications', JSON.stringify(updated));
        console.log('✅ Application updated locally:', processedApplication);
        return updated;
      });
    }
  };

  const deleteApplication = async (applicationId) => {
    try {
      // Try backend API first
      await apiService.deleteApplication(applicationId);
      console.log('✅ Application deleted on backend');

      setApplications(prev => {
        const updated = prev.filter(app => app.id !== applicationId);
        safeLocalStorage.setItem('applications', JSON.stringify(updated));
        console.log('Application deleted:', applicationId);
        return updated;
      });

    } catch (error) {
      console.log('⚠️ Backend unavailable, deleting application locally:', error.message);

      // Fallback to local delete only
      setApplications(prev => {
        const updated = prev.filter(app => app.id !== applicationId);
        safeLocalStorage.setItem('applications', JSON.stringify(updated));
        console.log('Application deleted locally:', applicationId);
        return updated;
      });
    }
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

    // API Status
    isOnline,

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

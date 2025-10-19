// PATCH: Force Flask API Priority over localStorage
// This fixes the issue where React prioritizes empty localStorage over Flask API

import { useState, useEffect } from 'react';
import { safeLocalStorage, loadFromIndexedDB, saveToIndexedDB } from '../utils/storage';
import initialData from '../data.json';
import apiService from '../services/apiService';

// Add this at the top of usePropertyData.js to force Flask API priority
const FORCE_API_FIRST = true; // Set to true to always try Flask API first

// Replace the data loading logic around line 140+ with this:
const loadDataWithFlaskPriority = async () => {
  console.log('🔄 Loading data with Flask API priority...');
  
  // ALWAYS try Flask API first (regardless of localStorage)
  try {
    console.log('🌐 Attempting Flask API connection...');
    const [apiProperties, apiTenants, apiWorkOrders, apiTransactions] = await Promise.all([
      apiService.getProperties().catch(() => null),
      apiService.getTenants().catch(() => null), 
      apiService.getWorkOrders().catch(() => null),
      apiService.getTransactions().catch(() => null)
    ]);

    console.log('📊 Flask API Response:', {
      properties: apiProperties?.length || 0,
      tenants: apiTenants?.length || 0,
      workOrders: apiWorkOrders?.length || 0,
      transactions: apiTransactions?.length || 0
    });

    // If Flask API returns data, use it
    if (apiProperties && apiProperties.length > 0) {
      console.log('✅ Using Flask API data for properties');
      setProperties(apiProperties);
      safeLocalStorage.setItem('properties', JSON.stringify(apiProperties));
      setIsOnline(true);
      
      // Use Flask data for other entities if available
      setTenants(apiTenants || []);
      setWorkOrders(apiWorkOrders || []);
      setTransactions(apiTransactions || []);
      setDocuments([]);
      
      return; // Success - using Flask data
    }
    
    throw new Error('Flask API returned no properties');
    
  } catch (error) {
    console.log('⚠️ Flask API failed, falling back to localStorage:', error.message);
    setIsOnline(false);
    
    // Fallback to localStorage only if Flask fails
    const savedProperties = safeLocalStorage.getItem('properties');
    const savedTenants = safeLocalStorage.getItem('tenants');
    const savedWorkOrders = safeLocalStorage.getItem('workOrders');
    const savedTransactions = safeLocalStorage.getItem('transactions');
    const savedDocuments = safeLocalStorage.getItem('documents');

    if (savedProperties && savedProperties.length > 0) {
      console.log('📱 Using localStorage fallback data');
      setProperties(savedProperties);
      setTenants(savedTenants || []);
      setWorkOrders(savedWorkOrders || []);  
      setTransactions(savedTransactions || []);
      setDocuments(savedDocuments || []);
    } else {
      console.log('📄 Using initial data.json as final fallback');
      setProperties(initialData.properties || []);
      setTenants(initialData.tenants || []);
      setWorkOrders(initialData.workOrders || []);
      setTransactions([]);
      setDocuments([]);
    }
  }
};

// Instructions for implementing this fix:
// 1. Replace the loadData() function logic in usePropertyData.js with loadDataWithFlaskPriority()
// 2. Set FORCE_API_FIRST = true to prioritize Flask
// 3. Clear browser localStorage and refresh React app
// 4. React will now always try Flask API first
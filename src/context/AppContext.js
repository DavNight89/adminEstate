// src/context/AppContext.js
import React, { createContext, useContext, useReducer } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { mockProperties, mockTenants, mockTransactions, mockWorkOrders } from '../data/mockData';

const AppContext = createContext();

const initialState = {
  loading: false,
  error: null,
  notifications: []
};

function appReducer(state, action) {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'ADD_NOTIFICATION':
      return { 
        ...state, 
        notifications: [...state.notifications, action.payload] 
      };
    case 'REMOVE_NOTIFICATION':
      return {
        ...state,
        notifications: state.notifications.filter(n => n.id !== action.payload)
      };
    default:
      return state;
  }
}

export const AppProvider = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);
  const [properties, setProperties] = useLocalStorage('properties', mockProperties);
  const [tenants, setTenants] = useLocalStorage('tenants', mockTenants);
  const [transactions, setTransactions] = useLocalStorage('transactions', mockTransactions);
  const [workOrders, setWorkOrders] = useLocalStorage('workOrders', mockWorkOrders);
  const [documents, setDocuments] = useLocalStorage('documents', []);

  const addNotification = (message, type = 'info') => {
    const notification = {
      id: Date.now(),
      message,
      type,
      timestamp: new Date()
    };
    dispatch({ type: 'ADD_NOTIFICATION', payload: notification });
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
      dispatch({ type: 'REMOVE_NOTIFICATION', payload: notification.id });
    }, 5000);
  };

  const value = {
    // State
    ...state,
    properties,
    tenants,
    transactions,
    workOrders,
    documents,
    
    // Actions
    setProperties,
    setTenants,
    setTransactions,
    setWorkOrders,
    setDocuments,
    addNotification,
    dispatch
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
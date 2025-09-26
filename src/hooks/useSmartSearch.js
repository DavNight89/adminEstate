// src/hooks/useSmartSearch.js
import { useState } from 'react';

export const useSmartSearch = (tenants, properties, workOrders, setActiveTab) => {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSmartSearch = (searchValue) => {
    setSearchQuery(searchValue);
    
    if (searchValue.trim() === '') {
      return;
    }

    // Get all matches
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
      order.unit.toLowerCase().includes(searchValue.toLowerCase())
    );

    // Auto-switch to tab with most results
    const matchCounts = [
      { tab: 'tenants', count: tenantMatches.length },
      { tab: 'properties', count: propertyMatches.length },
      { tab: 'workorders', count: workOrderMatches.length }
    ];

    matchCounts.sort((a, b) => b.count - a.count);

    if (matchCounts[0].count > 0) {
      setActiveTab(matchCounts[0].tab);
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
  };

  return {
    searchQuery,
    handleSmartSearch,
    clearSearch
  };
};
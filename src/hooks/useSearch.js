// src/hooks/useSearch.js
import { useState, useMemo } from 'react';

export const useSearch = (data, searchFields) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredData = useMemo(() => {
    if (!searchQuery.trim()) return data;
    
    return data.filter(item =>
      searchFields.some(field => {
        const value = field.split('.').reduce((obj, key) => obj?.[key], item);
        return value?.toString().toLowerCase().includes(searchQuery.toLowerCase());
      })
    );
  }, [data, searchQuery, searchFields]);

  return {
    searchQuery,
    setSearchQuery,
    filteredData,
    clearSearch: () => setSearchQuery('')
  };
};
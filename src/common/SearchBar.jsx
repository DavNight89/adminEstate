// src/components/common/SearchBar.jsx
import React from 'react';
import { Search, X } from 'lucide-react';

export const SearchBar = ({ 
  searchQuery, 
  onSearchChange, 
  placeholder = "Search...",
  onClear 
}) => (
  <div className="relative">
    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
      <Search className="w-4 h-4 text-gray-400" />
    </div>
    <input
      type="text"
      value={searchQuery}
      onChange={(e) => onSearchChange(e.target.value)}
      placeholder={placeholder}
      className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
    />
    {searchQuery && (
      <button
        onClick={onClear}
        className="absolute inset-y-0 right-0 pr-3 flex items-center"
      >
        <X className="w-4 h-4 text-gray-400 hover:text-gray-600" />
      </button>
    )}
  </div>
);
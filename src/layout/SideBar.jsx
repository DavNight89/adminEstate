// src/components/layout/Sidebar.jsx
import React from 'react';
import { Menu, User } from 'lucide-react';
import { navigationItems } from '../config/navigation';

export const Sidebar = ({
  activeTab,
  setActiveTab,
  isCollapsed,
  setIsCollapsed,
  showDescriptions = false // ✅ Optional prop for tooltips
}) => (
  <div className={`h-screen bg-white shadow-sm border-r border-gray-200 transition-all duration-300 flex flex-col ${
    isCollapsed ? 'w-16' : 'w-64'
  }`}>
    {/* Header - Fixed */}
    <div className="p-4 flex-shrink-0">
      <div className="flex items-center justify-between">
        {!isCollapsed && (
          <h1 className="text-xl font-bold text-gray-900">Management</h1>
        )}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-1 rounded-lg hover:bg-gray-100"
        >
          <Menu className="w-5 h-5" />
        </button>
      </div>
    </div>

    {/* Navigation - Scrollable */}
    <nav className="flex-1 overflow-y-auto mt-8">
      {navigationItems.map(item => (
        <div key={item.id} className="relative group">
          <button
            onClick={() => !item.isDisabled && setActiveTab(item.id)}
            disabled={item.isDisabled}
            className={`w-full flex items-center px-4 py-3 text-left transition-colors ${
              item.isDisabled
                ? 'text-gray-400 cursor-not-allowed opacity-60'
                : activeTab === item.id
                ? 'bg-blue-50 text-blue-600 border-r-2 border-blue-600'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            }`}
          >
            <item.icon className="w-5 h-5 flex-shrink-0" />
            {!isCollapsed && (
              <span className="ml-3 text-sm font-medium flex-1">{item.label}</span>
            )}

            {/* Badge for new features */}
            {!isCollapsed && item.badge && (
              <span className={`ml-2 px-2 py-1 text-xs rounded-full ${
                item.isDisabled
                  ? 'bg-gray-100 text-gray-500'
                  : 'bg-green-100 text-green-800'
              }`}>
                {item.badge}
              </span>
            )}
          </button>

          {/* Tooltip for collapsed sidebar */}
          {isCollapsed && (
            <div className="absolute left-full top-0 ml-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity z-50 whitespace-nowrap">
              <div className="font-medium">{item.label}</div>
              {showDescriptions && (
                <div className="text-xs text-gray-300 mt-1">{item.description}</div>
              )}
            </div>
          )}
        </div>
      ))}
    </nav>

    {/* User Profile - Fixed at bottom */}
    {!isCollapsed && (
      <div className="flex-shrink-0 p-4 border-t border-gray-200 bg-white">
        <div className="flex items-center">
          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
            <User className="w-4 h-4 text-white" />
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium text-gray-900">Property Manager</p>
            <p className="text-xs text-gray-500">admin@adminestate.com</p>
          </div>
        </div>
      </div>
    )}
  </div>
);
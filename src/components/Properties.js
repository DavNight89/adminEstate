import React from 'react';
import { Plus, Search, X, MapPin, Eye, Edit } from 'lucide-react';

export const Properties = ({ 
  properties, 
  searchQuery, 
  setTenantSearchQuery, 
  openModal 
}) => {
    
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
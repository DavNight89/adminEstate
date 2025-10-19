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
          .map((property) => (
          <div key={property.id} className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="relative">
              <div className="h-32 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-t-xl flex items-center justify-center relative overflow-hidden">
                {/* Background pattern */}
                <div className="absolute inset-0 opacity-20">
                  <div className="absolute inset-0 bg-white opacity-10 transform -skew-y-12 scale-150"></div>
                </div>
                
                {/* Property type badge */}
                <div className="absolute top-3 right-3">
                  <span className="bg-white bg-opacity-20 text-white text-xs px-2 py-1 rounded-full capitalize">
                    {property.type}
                  </span>
                </div>
                
                <h3 className="text-xl font-bold text-white z-10">{property.name}</h3>
              </div>
            </div>
            <div className="p-6">
              <p className="text-gray-600 mb-4 flex items-center text-sm">
                <MapPin className="w-4 h-4 mr-2 flex-shrink-0" />
                {property.address}
              </p>
              
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <p className="text-2xl font-bold text-gray-900">{property.units || 0}</p>
                  <p className="text-xs text-gray-600">Total Units</p>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <p className="text-2xl font-bold text-green-600">{property.occupied || 0}</p>
                  <p className="text-xs text-gray-600">Occupied</p>
                </div>
              </div>

              <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-600">Monthly Revenue</span>
                  <span className="text-lg font-bold text-gray-900">
                    ${(property.monthlyRevenue || 0).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Occupancy Rate</span>
                  <span className="text-sm font-medium text-green-600">
                    {property.units > 0 ? Math.round(((property.occupied || 0) / property.units) * 100) : 0}%
                  </span>
                </div>
              </div>

              <div className="flex gap-2">
                <button 
                  onClick={() => openModal('viewProperty', property)}
                  className="flex-1 flex items-center justify-center px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Eye className="w-4 h-4 mr-2" />
                  View
                </button>
                <button 
                  onClick={() => openModal('editProperty', property)}
                  className="flex-1 flex items-center justify-center px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {properties.length === 0 && (
        <div className="text-center py-12 bg-gray-50 rounded-xl">
          <div className="max-w-sm mx-auto">
            <h3 className="text-lg font-medium text-gray-900 mb-2">No properties yet</h3>
            <p className="text-gray-500 mb-4">Get started by adding your first property to the portfolio.</p>
            <button 
              onClick={() => openModal('addProperty')}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 inline-flex items-center transition-colors"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Your First Property
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
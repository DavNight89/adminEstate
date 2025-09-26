import React from 'react';
import { Plus, X, Users, Mail } from 'lucide-react';

export const Tenants = ({ 
  tenants, 
  searchQuery, 
  setTenantSearchQuery, 
  openModal 
}) => {
    return (

    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Tenants</h2>
          <p className="text-gray-600">Manage tenant information and communications</p>
        </div>   
          <button 
            onClick={() => openModal('addTenant')}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Tenant
          </button>
        </div>
  
           {/* Show active search indicator */}
          {searchQuery && (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-blue-800">
            Searching for: "<strong>{searchQuery}</strong>"
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

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tenant</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Unit</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Property</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rent</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Lease End</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Balance</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {tenants
              .filter(tenant => 
                searchQuery === '' || 
                tenant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                tenant.unit.toLowerCase().includes(searchQuery.toLowerCase()) ||
                tenant.property.toLowerCase().includes(searchQuery.toLowerCase()) ||
                tenant.email.toLowerCase().includes(searchQuery.toLowerCase())
              )
                .map(tenant => (
                <tr key={tenant.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white font-medium text-sm">
                          {tenant.avatar}
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{tenant.name}</div>
                        <div className="text-sm text-gray-500 flex items-center">
                          <Mail className="w-3 h-3 mr-1" />
                          {tenant.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-sm font-medium">
                      {tenant.unit}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{tenant.property}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    ${tenant.rent.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{tenant.leaseEnd}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      tenant.balance < 0 ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                    }`}>
                      {tenant.balance < 0 ? `$${Math.abs(tenant.balance)} overdue` : 'Paid'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => openModal('viewTenant', tenant)}
                        className="text-blue-600 hover:text-blue-900 transition-colors"
                        >
                        View
                      </button>
                       <button 
                       onClick={() => openModal('editTenant', tenant)}
                       className="text-gray-600 hover:text-gray-900 transition-colors"
                       >
                       Edit
                      </button>
                      <button className="text-green-600 hover:text-green-900 transition-colors">Message</button>
                    </div>
                 </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

           {/* No results message */}
      {searchQuery && tenants.filter(tenant => 
        tenant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tenant.unit.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tenant.property.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tenant.email.toLowerCase().includes(searchQuery.toLowerCase())
      ).length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-500">No tenants found matching "{searchQuery}"</p>
        </div>
      )}
    
            {/* Empty state */}
      {tenants.length === 0 && !searchQuery && (
        <div className="text-center py-8">
          <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg mb-2">No tenants yet</p>
          <p className="text-gray-400 text-sm mb-4">Add your first tenant to get started</p>
          <button 
            onClick={() => openModal('addTenant')}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4 mr-2 inline" />
            Add Tenant
          </button>
        </div>
      )}
    </div>
  </div>
);
};
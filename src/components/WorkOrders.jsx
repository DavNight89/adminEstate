import React, { useState } from 'react';
import { Plus, X, Wrench, Filter } from 'lucide-react';

export const WorkOrders = ({ 
  workOrders, 
  searchQuery, 
  setTenantSearchQuery, 
  openModal,
  filterStatus,
  setFilterStatus,
  filterPriority,
  setFilterPriority 
}) => {
      const filteredWorkOrders = workOrders.filter(order => {
    const statusMatch = filterStatus === 'all' || order.status === filterStatus;
    const priorityMatch = filterPriority === 'all' || order.priority === filterPriority;
    const searchMatch = searchQuery === '' || 
      order.issue.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.property.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.tenant.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.unit.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (order.assignedTo && order.assignedTo.toLowerCase().includes(searchQuery.toLowerCase()));
    
    return statusMatch && priorityMatch && searchMatch;
  });
    const [viewMode, setViewMode] = useState(() => {
    return localStorage.getItem('workOrderViewMode') || 'cards';
    
});

  return (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Work Orders</h2>
              <p className="text-gray-600">Track and manage maintenance requests</p>
            </div>
            
            {/* View Toggle and Filters */}
            <div className="flex items-center space-x-4">
              {/* Filters */}
              <select 
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              >
                <option value="all">All Status</option>
                <option value="Open">Open</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
              </select>
              
              <select 
                value={filterPriority}
                onChange={(e) => setFilterPriority(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              >
                <option value="all">All Priority</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
    
              {/* View Mode Toggle */}
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('cards')}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    viewMode === 'cards'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Cards
                </button>
                <button
                  onClick={() => setViewMode('table')}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    viewMode === 'table'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Table
                </button>
              </div>
    
              <button 
                onClick={() => openModal('addWorkOrder')}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 flex items-center transition-colors"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Work Order
              </button>
            </div>
          </div>
    
                {/* Show search indicator */}
          {searchQuery && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-blue-800">
                  Searching work orders for: "<strong>{searchQuery}</strong>"
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
    
    
          {/* Cards View */}
          {viewMode === 'cards' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredWorkOrders.map(order => (
                <div key={order.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg text-gray-900 mb-1">{order.issue}</h3>
                      <p className="text-gray-600 text-sm">{order.unit} • {order.tenant}</p>
                      <p className="text-gray-500 text-xs">{order.property}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      order.priority === 'High' ? 'bg-red-100 text-red-800' :
                      order.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {order.priority}
                    </span>
                  </div>
    
                  <div className="space-y-3 mb-6">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Status:</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        order.status === 'Open' ? 'bg-red-100 text-red-800' :
                        order.status === 'In Progress' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {order.status}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Submitted:</span>
                      <span className="text-sm text-gray-900">{order.dateSubmitted}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Assigned to:</span>
                      <span className="text-sm text-gray-900">{order.assignedTo || 'Unassigned'}</span>
                    </div>
                    {order.estimatedCost > 0 && (
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Est. Cost:</span>
                        <span className="text-sm font-medium text-gray-900">${order.estimatedCost}</span>
                      </div>
                    )}
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => openModal('editWorkOrder', order)}
                      className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm"
                    >
                      Update
                    </button>
                    <button className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-lg hover:bg-gray-200 transition-colors text-sm">
                      Assign
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
    
          {/* Table View */}
          {viewMode === 'table' && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Work Order
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Property/Unit
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Tenant
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Priority
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date Submitted
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Assigned To
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Est. Cost
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredWorkOrders.map(order => (
                      <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{order.issue}</div>
                            <div className="text-sm text-gray-500">#{order.id}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm text-gray-900">{order.property}</div>
                            <div className="text-sm text-gray-500">Unit {order.unit}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {order.tenant}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            order.priority === 'High' ? 'bg-red-100 text-red-800' :
                            order.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-green-100 text-green-800'
                          }`}>
                            {order.priority}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            order.status === 'Open' ? 'bg-red-100 text-red-800' :
                            order.status === 'In Progress' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-green-100 text-green-800'
                          }`}>
                            {order.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {order.dateSubmitted}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {order.assignedTo || (
                            <span className="text-gray-400 italic">Unassigned</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {order.estimatedCost > 0 ? `$${order.estimatedCost.toLocaleString()}` : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => openModal('viewWorkOrder', order)}
                              className="text-blue-600 hover:text-blue-900 transition-colors"
                            >
                              View
                            </button>
        <button
          onClick={() => openModal('editWorkOrder', order)}
          className="text-green-600 hover:text-green-900 transition-colors"
        >
          Update
        </button>
        <button className="text-gray-600 hover:text-gray-900 transition-colors">
          Assign
        </button>
      </div>
    </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {filteredWorkOrders.length === 0 && (
                <div className="text-center py-8">
                  <Wrench className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 text-lg mb-2">No work orders found</p>
                  <p className="text-gray-400 text-sm mb-4">
                    {filterStatus !== 'all' || filterPriority !== 'all'
                      ? 'Try adjusting your filters or create a new work order.'
                      : 'Create your first work order to get started.'
                    }
                  </p>
                  <button 
                    onClick={() => openModal('addWorkOrder')}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Plus className="w-4 h-4 mr-2 inline" />
                    Create Work Order
                  </button>
                </div>
              )}
            </div>
          )}
    
          {/* Work Order Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900">{workOrders.length}</p>
                <p className="text-sm text-gray-600">Total Orders</p>
              </div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
              <div className="text-center">
                <p className="text-2xl font-bold text-red-600">
                  {workOrders.filter(wo => wo.status === 'Open').length}
                </p>
                <p className="text-sm text-gray-600">Open</p>
              </div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
              <div className="text-center">
                <p className="text-2xl font-bold text-yellow-600">
                  {workOrders.filter(wo => wo.status === 'In Progress').length}
                </p>
                <p className="text-sm text-gray-600">In Progress</p>
              </div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">
                  {workOrders.filter(wo => wo.status === 'Completed').length}
                </p>
                <p className="text-sm text-gray-600">Completed</p>
              </div>
            </div>
          </div>
        </div>
      );
    };
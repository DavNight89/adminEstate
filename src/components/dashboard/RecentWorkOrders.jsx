import React from 'react';
import { Wrench } from 'lucide-react';

export const RecentWorkOrders = ({ workOrders, openModal, setActiveTab }) => {
  const getPriorityStyle = (priority) => {
    switch (priority) {
      case 'High':
        return 'bg-red-100 text-red-800';
      case 'Medium':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-green-100 text-green-800';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <h3 className="text-lg font-semibold mb-4 flex items-center justify-between">
        <span className="flex items-center">
          <Wrench className="w-5 h-5 mr-2 text-gray-600" />
          Recent Work Orders
        </span>
        <button 
          onClick={() => setActiveTab('workorders')}
          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
        >
          View all
        </button>
      </h3>
      
      <div className="space-y-3">
        {workOrders.length > 0 ? (
          workOrders.slice(0, 3).map(order => (                    
            <div 
              key={order.id}
              onClick={() => openModal('viewWorkOrder', order)}
              className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-gray-900 text-sm">{order.issue}</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityStyle(order.priority)}`}>
                  {order.priority}
                </span>
              </div>
              <p className="text-xs text-gray-600">{order.unit} • {order.tenant}</p>
              <p className="text-xs text-gray-500 mt-1">{order.dateSubmitted}</p>
            </div>
          ))
        ) : (
          <div className="text-center py-4">
            <Wrench className="w-8 h-8 text-gray-300 mx-auto mb-2" />
            <p className="text-sm text-gray-500">No work orders yet</p>
            <button 
              onClick={() => openModal('addWorkOrder')}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium mt-1"
            >
              Create your first work order
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
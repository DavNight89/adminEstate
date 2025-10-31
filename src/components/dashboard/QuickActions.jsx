import React from 'react';
import { Zap, Users, Wrench, DollarSign, ChevronRight } from 'lucide-react';

export const QuickActions = ({ openModal, setActiveTab }) => {
  const actions = [
    {
      id: 'addTenant',
      title: 'Add New Tenant',
      description: 'Register a new tenant',
      icon: Users,
      iconBg: 'bg-blue-600',
      gradientFrom: 'from-blue-50',
      gradientTo: 'to-blue-100',
      hoverFrom: 'hover:from-blue-100',
      hoverTo: 'hover:to-blue-200',
      onClick: () => openModal('addTenant')
    },
    {
      id: 'addWorkOrder',
      title: 'Create Work Order',
      description: 'Schedule maintenance',
      icon: Wrench,
      iconBg: 'bg-green-600',
      gradientFrom: 'from-green-50',
      gradientTo: 'to-green-100',
      hoverFrom: 'hover:from-green-100',
      hoverTo: 'hover:to-green-200',
      onClick: () => openModal('addWorkOrder')
    },
    {
      id: 'recordPayment',
      title: 'Record Payment',
      description: 'Process transactions',
      icon: DollarSign,
      iconBg: 'bg-yellow-600',
      gradientFrom: 'from-yellow-50',
      gradientTo: 'to-yellow-100',
      hoverFrom: 'hover:from-yellow-100',
      hoverTo: 'hover:to-yellow-200',
      onClick: () => setActiveTab('financial')
    }
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <h3 className="text-lg font-semibold mb-4 flex items-center">
        <Zap className="w-5 h-5 mr-2 text-blue-600" />
        Quick Actions
      </h3>
      <div className="space-y-3">
        {actions.map(action => (
          <button
            key={action.id}
            onClick={action.onClick}
            className={`w-full p-4 bg-gradient-to-r ${action.gradientFrom} ${action.gradientTo} ${action.hoverFrom} ${action.hoverTo} rounded-lg flex items-center transition-all group`}
          >
            <div className={`p-2 ${action.iconBg} rounded-lg mr-3 group-hover:scale-110 transition-transform`}>
              <action.icon className="w-4 h-4 text-white" />
            </div>
            <div className="text-left">
              <div className="font-medium text-gray-900">{action.title}</div>
              <div className="text-sm text-gray-600">{action.description}</div>
            </div>
            <ChevronRight className="w-4 h-4 ml-auto text-gray-400" />
          </button>
        ))}
      </div>
    </div>
  );
};
import React from 'react';
import { 
  Home, Users, DollarSign, Building, Plus, TrendingUp, 
  Zap, ChevronRight, Bell, AlertTriangle, Clock, 
  CheckCircle, Wrench, X, Lightbulb, HelpCircle, Key
} from 'lucide-react';

export const Dashboard = ({ 
  properties, 
  tenants, 
  workOrders, 
  openModal, 
  setActiveTab, 
  getQuickStats, 
  getComprehensiveFinancialStats,
  getDynamicNotifications,
  showTips,
  setShowTips 
}) => {
  const stats = getQuickStats();
  const financialStats = getComprehensiveFinancialStats();
  const dynamicNotifications = getDynamicNotifications();


    return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 text-white">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold mb-2">Welcome! 👋 
            </h2>
            <p className="text-blue-100">
              {properties.length === 0
                ? "Start by adding your first property to get started"
                : "Here's what's happening with your properties today"
              }  
            </p>
          </div>

          <button
            onClick={() => setShowTips(!showTips)}
            className="bg-white/20 hover:bg-white/30 p-3 rounded-lg transition-colors"
          >
            <Lightbulb className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Quick Tips Panel */}
      {showTips && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <div className="flex items-start">
            <Lightbulb className="w-5 h-5 text-amber-600 mt-0.5 mr-3" />
            <div>
              <h3 className="font-semibold text-amber-800 mb-1">💡 Pro Tips</h3>
              <ul className="text-sm text-amber-700 space-y-1">
                <li>• Use the search bar to quickly find tenants, properties, or work orders</li>
                <li>• Click on metric cards to see detailed breakdowns</li>
                <li>• Set up automated rent reminders in the Communication section</li>
              </ul>
            </div>
            <button 
              onClick={() => setShowTips(false)}
              className="ml-auto text-amber-600 hover:text-amber-800"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Getting Started Section - Show when no data */}
      {properties.length == 0 && (
        <div className="bg-white border-2 border-dashed border-gray-300 rounded-xl p-8 text-center">
          <div className="max-w-md mx-auto">
            <Home className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Get Started with PropertyPro</h3>
            <p className="text-gray-600 mb-6">Add your first property to begin managing your real estate portfolio</p>
            <div className="space-y-3">
              <button 
                onClick={() => openModal('addProperty')}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 flex items-center justify-center transition-colors"
              >
                <Plus className="w-5 h-5 mr-2" />
                Add Your First Property
              </button>
              <button 
                onClick={() => setShowTips(true)}
                className="w-full bg-gray-100 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-200 flex items-center justify-center transition-colors"
              >
                <HelpCircle className="w-5 h-5 mr-2" />
                Show Getting Started Tips
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Show metrics only when there's data */}
      {properties.length > 0 && (
        <>
          {/* Enhanced Key Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">  
<div 
  onClick={() => openModal('viewPropertiesOverview')}
  className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow cursor-pointer"
>
  <div className="flex items-center justify-between mb-4">
    <div className="p-2 bg-blue-100 rounded-lg">
      <Building className="w-6 h-6 text-blue-600" />
    </div>
    <span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded-full">
      Click to view details
    </span>
  </div>
  <h3 className="text-sm font-medium text-gray-600 mb-1">Total Properties</h3>

  <p className="text-2xl font-bold text-gray-900 mb-2">{properties.length}</p>
  <div className="flex items-center text-sm text-green-600">
    <TrendingUp className="w-4 h-4 mr-1" />
    {(() => {
      const totalUnits = properties.reduce((sum, p) => sum + p.units, 0);
      const occupiedUnits = properties.reduce((sum, p) => sum + p.occupied, 0);
      const occupancyRate = totalUnits > 0 ? (occupiedUnits / totalUnits) * 100 : 0;
      return `${occupancyRate.toFixed(1)}% occupancy rate`;
    })()}
  </div>
</div>

            <div 
                onClick={() => openModal('viewTotalUnits')}
                className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow cursor-pointer">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Key className="w-6 h-6 text-green-600" />
                </div>
                <span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded-full">
                  {stats.occupancyRate || 0}% filled
                </span>
              </div>
              <h3 className="text-sm font-medium text-gray-600 mb-1">Total Units</h3>
              <p className="text-2xl font-bold text-gray-900 mb-2">{stats.totalUnits || 0}</p>
              <div className="text-sm text-gray-600">
                {stats.occupiedUnits || 0} occupied • {(stats.totalUnits || 0) - (stats.occupiedUnits || 0)} vacant
              </div>
            </div>

            <div 
            onClick={() => openModal('viewMonthlyRevenue')}
            className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow cursor-pointer">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <DollarSign className="w-6 h-6 text-yellow-600" />
                </div>
                <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded-full">
                  {financialStats.netIncome > 0 ? '+' : ''}{financialStats.monthlyIncome > 0 ? ((financialStats.netIncome / financialStats.monthlyIncome) * 100).toFixed(1) : 0}% margin
                </span>
              </div>
              <h3 className="text-sm font-medium text-gray-600 mb-1">Monthly Revenue</h3>
              <p className="text-2xl font-bold text-gray-900 mb-2">
                ${financialStats.monthlyIncome.toLocaleString()}
              </p>
              <div className="flex items-center text-sm text-green-600">
                <TrendingUp className="w-4 h-4 mr-1" />
                ${financialStats.netIncome.toLocaleString()} net income
              </div>
            </div>

            <div 
            onClick={() => openModal('viewOccupancyRate')}
            className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow cursor-pointer"
              >
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Users className="w-6 h-6 text-purple-600" />
                </div>
                <span className="text-xs text-purple-600 bg-purple-100 px-2 py-1 rounded-full">
                  {stats.occupancyRate || 0}%
                </span>
              </div>
              <h3 className="text-sm font-medium text-gray-600 mb-1">
                View Occupancy Rate
              </h3>
              <p className="text-2xl font-bold text-gray-900 mb-2">{stats.occupancyRate || 0}%</p>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${stats.occupancyRate || 0}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Action Center and Recent Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <Zap className="w-5 h-5 mr-2 text-blue-600" />
                Quick Actions
              </h3>
              <div className="space-y-3">
                <button 
                  onClick={() => openModal('addTenant')}
                  className="w-full p-4 bg-gradient-to-r from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 rounded-lg flex items-center transition-all group"
                >
                  <div className="p-2 bg-blue-600 rounded-lg mr-3 group-hover:scale-110 transition-transform">
                    <Users className="w-4 h-4 text-white" />
                  </div>
                  <div className="text-left">
                    <div className="font-medium text-gray-900">Add New Tenant</div>
                    <div className="text-sm text-gray-600">Register a new tenant</div>
                  </div>
                  <ChevronRight className="w-4 h-4 ml-auto text-gray-400" />
                </button>

                <button 
                  onClick={() => openModal('addWorkOrder')}
                  className="w-full p-4 bg-gradient-to-r from-green-50 to-green-100 hover:from-green-100 hover:to-green-200 rounded-lg flex items-center transition-all group"
                >
                  <div className="p-2 bg-green-600 rounded-lg mr-3 group-hover:scale-110 transition-transform">
                    <Wrench className="w-4 h-4 text-white" />
                  </div>
                  <div className="text-left">
                    <div className="font-medium text-gray-900">Create Work Order</div>
                    <div className="text-sm text-gray-600">Schedule maintenance</div>
                  </div>
                  <ChevronRight className="w-4 h-4 ml-auto text-gray-400" />
                </button>

                <button 
                  onClick={() => setActiveTab('financial')}
                  className="w-full p-4 bg-gradient-to-r from-yellow-50 to-yellow-100 hover:from-yellow-100 hover:to-yellow-200 rounded-lg flex items-center transition-all group"
                >
                  <div className="p-2 bg-yellow-600 rounded-lg mr-3 group-hover:scale-110 transition-transform">
                    <DollarSign className="w-4 h-4 text-white" />
                  </div>
                  <div className="text-left">
                    <div className="font-medium text-gray-900">Record Payment</div>
                    <div className="text-sm text-gray-600">Process transactions</div>
                  </div>
                  <ChevronRight className="w-4 h-4 ml-auto text-gray-400" />
                </button>
              </div>
            </div>

            {/* Alerts & Notifications */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <Bell className="w-5 h-5 mr-2 text-orange-600" />
                Alerts & Notifications
              </h3>
              <div className="space-y-3">
                {stats.urgentWorkOrders > 0 && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-center">
                      <AlertTriangle className="w-4 h-4 text-red-600 mr-2" />
                      <span className="text-sm font-medium text-red-800">
                        {stats.urgentWorkOrders} urgent work orders
                      </span>
                    </div>
                  </div>
                )}
                
                {stats.overduePayments > 0 && (
                  <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 text-yellow-600 mr-2" />
                      <span className="text-sm font-medium text-yellow-800">
                        {stats.overduePayments} overdue payments
                      </span>
                    </div>
                  </div>
                )}

                {dynamicNotifications.length > 0 ? (
                  dynamicNotifications.map(notification => (
                    <div key={notification.id} className={`p-3 border rounded-lg ${
                      notification.type == 'warning' ? 'bg-yellow-50 border-yellow-200' :
                      notification.type == 'alert' ? 'bg-red-50 border-red-200' :
                      'bg-blue-50 border-blue-200'
                    }`}>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center">
                          <div className={`w-2 h-2 rounded-full mr-2 mt-1 ${
                            notification.type == 'warning' ? 'bg-yellow-600' :
                            notification.type == 'alert' ? 'bg-red-600' :
                            'bg-blue-600'
                          }`}></div>
                          <div>
                            <p className={`text-sm font-medium ${
                              notification.type == 'warning' ? 'text-yellow-800' :
                              notification.type == 'alert' ? 'text-red-800' :
                              'text-blue-800'
                            }`}>{notification.message}</p>
                            <p className={`text-xs ${
                              notification.type == 'warning' ? 'text-yellow-600' :
                              notification.type == 'alert' ? 'text-red-600' :
                              'text-blue-600'
                            }`}>{notification.time}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center">
                      <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                      <span className="text-sm font-medium text-green-800">
                        All caught up! No urgent notifications.
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Recent Work Orders */}
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
                 <div key={order.id}
                 onClick={() => openModal('viewWorkOrder', order)}
                 className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-gray-900 text-sm">{order.issue}</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          order.priority == 'High' ? 'bg-red-100 text-red-800' :
                          order.priority == 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }`}>
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
          </div>
        </>
      )}
    </div>
  );
};
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Home,
  MessageSquare,
  Wrench,
  DollarSign,
  FileText,
  Bell,
  LogOut,
  Menu,
  X,
  AlertCircle,
  CheckCircle,
  Clock
} from 'lucide-react';

const TenantDashboard = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Mock data - will be replaced with API calls
  const dashboardData = {
    rentDue: {
      amount: 1500,
      dueDate: '2025-12-01',
      status: 'upcoming' // upcoming, overdue, paid
    },
    maintenanceRequests: [
      { id: 1, issue: 'AC not cooling', status: 'in_progress', date: '2025-11-03' },
      { id: 2, issue: 'Leaky faucet', status: 'completed', date: '2025-10-28' }
    ],
    unreadMessages: 3,
    upcomingInspections: [
      { id: 1, type: 'Annual Inspection', date: '2025-12-15' }
    ]
  };

  const handleLogout = () => {
    onLogout();
    navigate('/login');
  };

  const navigationItems = [
    { name: 'Dashboard', icon: Home, path: '/dashboard', current: true },
    { name: 'Messages', icon: MessageSquare, path: '/messages', badge: dashboardData.unreadMessages },
    { name: 'Maintenance', icon: Wrench, path: '/maintenance' },
    { name: 'Payments', icon: DollarSign, path: '/payments' },
    { name: 'Documents', icon: FileText, path: '/documents' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Sidebar Backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-white border-r border-gray-200 z-50 transform transition-transform duration-300 lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="h-full flex flex-col">
          {/* Logo */}
          <div className="h-16 flex items-center justify-between px-6 border-b border-gray-200">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Home className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-gray-900">AdminEstate</span>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-gray-500 hover:text-gray-700"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
            {navigationItems.map((item) => (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center justify-between px-4 py-3 rounded-lg transition-colors ${
                  item.current
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <item.icon className="w-5 h-5" />
                  <span className="font-medium">{item.name}</span>
                </div>
                {item.badge && (
                  <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                    {item.badge}
                  </span>
                )}
              </Link>
            ))}
          </nav>

          {/* User Section */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-medium">
                {user?.tenant?.name?.split(' ').map(n => n[0]).join('') || 'JS'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {user?.tenant?.name || 'John Smith'}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  Unit {user?.tenant?.unit || 'A101'}
                </p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="lg:ml-64">
        {/* Top Bar */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden text-gray-500 hover:text-gray-700"
            >
              <Menu className="w-6 h-6" />
            </button>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Dashboard</h1>
              <p className="text-sm text-gray-600">
                {user?.tenant?.property || 'Sunset Apartments'}
              </p>
            </div>
          </div>
          <button className="relative p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
            <Bell className="w-6 h-6" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
          </button>
        </header>

        {/* Dashboard Content */}
        <main className="p-6 space-y-6">
          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Rent Due Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-2">
                <DollarSign className="w-8 h-8 text-green-600" />
                <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full font-medium">
                  Due Soon
                </span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-1">
                ${dashboardData.rentDue.amount.toLocaleString()}
              </h3>
              <p className="text-sm text-gray-600">
                Due on {new Date(dashboardData.rentDue.dueDate).toLocaleDateString()}
              </p>
              <Link
                to="/payments"
                className="mt-4 block text-center w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
              >
                Pay Now
              </Link>
            </div>

            {/* Maintenance Requests Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-2">
                <Wrench className="w-8 h-8 text-blue-600" />
                {dashboardData.maintenanceRequests.filter(r => r.status === 'in_progress').length > 0 && (
                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full font-medium">
                    Active
                  </span>
                )}
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-1">
                {dashboardData.maintenanceRequests.filter(r => r.status === 'in_progress').length}
              </h3>
              <p className="text-sm text-gray-600">Open Requests</p>
              <Link
                to="/maintenance"
                className="mt-4 block text-center w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
              >
                View All
              </Link>
            </div>

            {/* Messages Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-2">
                <MessageSquare className="w-8 h-8 text-purple-600" />
                {dashboardData.unreadMessages > 0 && (
                  <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full font-medium">
                    {dashboardData.unreadMessages} New
                  </span>
                )}
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-1">
                {dashboardData.unreadMessages}
              </h3>
              <p className="text-sm text-gray-600">Unread Messages</p>
              <Link
                to="/messages"
                className="mt-4 block text-center w-full bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium"
              >
                View Messages
              </Link>
            </div>

            {/* Documents Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-2">
                <FileText className="w-8 h-8 text-orange-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-1">5</h3>
              <p className="text-sm text-gray-600">Documents</p>
              <Link
                to="/documents"
                className="mt-4 block text-center w-full bg-orange-600 text-white py-2 rounded-lg hover:bg-orange-700 transition-colors text-sm font-medium"
              >
                View Docs
              </Link>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Maintenance Requests */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Recent Maintenance</h2>
                <Link
                  to="/maintenance/new"
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  + New Request
                </Link>
              </div>
              <div className="p-6 space-y-4">
                {dashboardData.maintenanceRequests.map((request) => (
                  <div
                    key={request.id}
                    className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg"
                  >
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      request.status === 'completed' ? 'bg-green-100' :
                      request.status === 'in_progress' ? 'bg-blue-100' : 'bg-gray-100'
                    }`}>
                      {request.status === 'completed' ? (
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      ) : request.status === 'in_progress' ? (
                        <Clock className="w-5 h-5 text-blue-600" />
                      ) : (
                        <AlertCircle className="w-5 h-5 text-gray-600" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{request.issue}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(request.date).toLocaleDateString()}
                      </p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                      request.status === 'completed' ? 'bg-green-100 text-green-800' :
                      request.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {request.status.replace('_', ' ')}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Upcoming Events */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Upcoming Events</h2>
              </div>
              <div className="p-6 space-y-4">
                {/* Rent Due */}
                <div className="flex items-center space-x-4 p-4 bg-yellow-50 rounded-lg">
                  <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                    <DollarSign className="w-5 h-5 text-yellow-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">Rent Payment Due</p>
                    <p className="text-xs text-gray-500">
                      {new Date(dashboardData.rentDue.dueDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {/* Inspections */}
                {dashboardData.upcomingInspections.map((inspection) => (
                  <div
                    key={inspection.id}
                    className="flex items-center space-x-4 p-4 bg-blue-50 rounded-lg"
                  >
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <Home className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{inspection.type}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(inspection.date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl shadow-lg p-8 text-white">
            <h2 className="text-2xl font-bold mb-2">Need Help?</h2>
            <p className="mb-6 opacity-90">
              Submit a maintenance request or contact your property manager
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                to="/maintenance/new"
                className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
              >
                Submit Maintenance Request
              </Link>
              <Link
                to="/messages"
                className="bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-800 transition-colors"
              >
                Send Message
              </Link>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default TenantDashboard;

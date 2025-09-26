import React, { useState } from 'react';
import { Bell, HelpCircle, Settings, Menu, Home, Users, Building, Wrench, DollarSign, BarChart3, MessageSquare, FileText, PieChart } from 'lucide-react';

// ===== ESSENTIAL IMPORTS ONLY =====
import { SearchBar } from './common/SearchBar';
import Modal from './components/Modal';
import { Sidebar } from './layout/SideBar';
import { useLocalStorage } from './hooks/useLocalStorage';
import { usePropertyData } from './hooks/usePropertyData';

// ===== KEEP ALL YOUR COMPONENTS =====
import { Dashboard } from './components/Dashboard';
import { Financial } from './components/Financial';
import { Analytics } from './components/Analytics';
import { Communication } from './components/Communication';
import { Documents } from './components/Documents';
import { Properties } from './components/Properties';
import { Tenants } from './components/Tenants';
import { WorkOrders } from './components/WorkOrders';
import { Reports } from './components/Reports';

const UserFriendlyPropertyApp = () => {
  // ===== UI STATE =====
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showTips, setShowTips] = useLocalStorage('showTips', false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // ===== FILTER STATE (for Financial component) =====
  const [transactionFilter, setTransactionFilter] = useLocalStorage('transactionFilter', 'all');
  const [dateRange, setDateRange] = useLocalStorage('dateRange', 'month');

  // ===== MODAL STATE (simple) =====
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);
  const [formData, setFormData] = useState({});

  // ===== DATA (your essential hook) =====
  const {
    properties,
    tenants,
    workOrders,
    transactions,
    documents,
    addTenant,
    addProperty,
    addTransaction,
    updateTenant,
    updateWorkOrder,
    updateProperty,
    updateTransaction,
    deleteTransaction
  } = usePropertyData();

  // ===== NAVIGATION TABS (all your components) =====
  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'properties', label: 'Properties', icon: Building },
    { id: 'tenants', label: 'Tenants', icon: Users },
    { id: 'workorders', label: 'Work Orders', icon: Wrench },
    { id: 'financial', label: 'Financial', icon: DollarSign },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'communication', label: 'Messages', icon: MessageSquare },
    { id: 'documents', label: 'Documents', icon: FileText },
    { id: 'reports', label: 'Reports', icon: PieChart }
  ];

  // ===== SIMPLE FUNCTIONS =====
  const openModal = (type, item = null) => {
    setModalType(type);
    setSelectedItem(item);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedItem(null);
    setModalType('');
    setFormData({});
  };

  const handleSearchChange = (value) => {
    setSearchQuery(value);
  };

  const clearSearch = () => {
    setSearchQuery('');
  };

  // ===== ANALYTICS FUNCTIONS (for Financial component) =====
  const getComprehensiveFinancialStats = () => {
    const monthlyIncome = tenants.reduce((sum, tenant) => sum + (tenant.rent || 0), 0);
    const monthlyExpenses = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);
    
    const netIncome = monthlyIncome - monthlyExpenses;
    const outstandingBalance = tenants
      .filter(t => t.status === 'overdue')
      .reduce((sum, t) => sum + (t.outstandingBalance || 0), 0);
    
    const overdueCount = tenants.filter(t => t.status === 'overdue').length;

    return {
      monthlyIncome,
      monthlyExpenses,
      netIncome,
      outstandingBalance,
      overdueCount
    };
  };

  const getExpenseCategories = () => {
    const categories = {};
    transactions
      .filter(t => t.type === 'expense')
      .forEach(t => {
        const category = t.category || 'Other';
        if (!categories[category]) {
          categories[category] = { amount: 0, budget: 5000 };
        }
        categories[category].amount += Math.abs(t.amount);
      });

    return Object.entries(categories).map(([category, data]) => ({
      id: category,
      category,
      amount: data.amount,
      budget: data.budget,
      percentage: (data.amount / data.budget) * 100
    }));
  };
 
  const getDynamicNotifications = () => {
  const notifications = [];

  // Overdue rent notifications
  const overdueTenants = tenants.filter(t => t.status === 'overdue');
  if (overdueTenants.length > 0) {
    notifications.push({
      id: 'overdue-rent',
      type: 'warning',
      title: 'Overdue Rent Payments',
      message: `${overdueTenants.length} tenant(s) have overdue rent payments`,
      count: overdueTenants.length,
      action: 'View Tenants',
      actionTab: 'tenants'
    });
  }

  // Open work orders notifications
  const openWorkOrders = workOrders.filter(wo => wo.status === 'Open');
  if (openWorkOrders.length > 0) {
    notifications.push({
      id: 'open-work-orders',
      type: 'info',
      title: 'Open Work Orders',
      message: `${openWorkOrders.length} work order(s) need attention`,
      count: openWorkOrders.length,
      action: 'View Work Orders',
      actionTab: 'workorders'
    });
  }

   // High priority work orders
  const highPriorityOrders = workOrders.filter(wo => wo.priority === 'High' && wo.status === 'Open');
  if (highPriorityOrders.length > 0) {
    notifications.push({
      id: 'high-priority-orders',
      type: 'error',
      title: 'Urgent Work Orders',
      message: `${highPriorityOrders.length} high-priority work order(s) require immediate attention`,
      count: highPriorityOrders.length,
      action: 'View Urgent Orders',
      actionTab: 'workorders'
    });
  }

  // Lease expiring soon (within 30 days)
  const today = new Date();
  const thirtyDaysFromNow = new Date(today.getTime() + (30 * 24 * 60 * 60 * 1000));
  
  const expiringSoonLeases = tenants.filter(tenant => {
    if (!tenant.leaseEnd) return false;
    const leaseEndDate = new Date(tenant.leaseEnd);
    return leaseEndDate <= thirtyDaysFromNow && leaseEndDate >= today;
  });

  if (expiringSoonLeases.length > 0) {
    notifications.push({
      id: 'expiring-leases',
      type: 'warning',
      title: 'Leases Expiring Soon',
      message: `${expiringSoonLeases.length} lease(s) expire within 30 days`,
      count: expiringSoonLeases.length,
      action: 'View Tenants',
      actionTab: 'tenants'
    });
  }

    // Low occupancy properties (less than 80%)
  const lowOccupancyProperties = properties.filter(property => {
    if (!property.units || property.units === 0) return false;
    const occupancyRate = (property.occupied || 0) / property.units;
    return occupancyRate < 0.8;
  });

  if (lowOccupancyProperties.length > 0) {
    notifications.push({
      id: 'low-occupancy',
      type: 'info',
      title: 'Low Occupancy Alert',
      message: `${lowOccupancyProperties.length} propertie(s) have occupancy below 80%`,
      count: lowOccupancyProperties.length,
      action: 'View Properties',
      actionTab: 'properties'
    });
  }

  // Recent large expenses (over $1000 in last 30 days)
  const thirtyDaysAgo = new Date(today.getTime() - (30 * 24 * 60 * 60 * 1000));
  const largeRecentExpenses = transactions.filter(transaction => {
    if (transaction.type !== 'expense') return false;
    const transactionDate = new Date(transaction.date);
    return transactionDate >= thirtyDaysAgo && Math.abs(transaction.amount) > 1000;
  });

  if (largeRecentExpenses.length > 0) {
    const totalAmount = largeRecentExpenses.reduce((sum, t) => sum + Math.abs(t.amount), 0);
    notifications.push({
      id: 'large-expenses',
      type: 'warning',
      title: 'Large Recent Expenses',
      message: `$${totalAmount.toLocaleString()} in large expenses (>${1000}) in the last 30 days`,
      count: largeRecentExpenses.length,
      action: 'View Financial',
      actionTab: 'financial'
    });
  }

   return notifications;
};

  // ✅ FIX: Return the function itself, not the result
  const getFilteredTransactions = () => {
    return transactions.filter(t => {
      if (transactionFilter === 'income') return t.type === 'income';
      if (transactionFilter === 'expense') return t.type === 'expense';
      return true;
    });
  };

// In your main app (user_friendly_property_app.js)
const getQuickStats = () => {
  // ✅ Calculate real totals from properties data
  const totalUnits = properties.reduce((sum, p) => sum + (p.units || 0), 0);
  const occupiedUnits = properties.reduce((sum, p) => sum + (p.occupied || 0), 0);
  const vacantUnits = totalUnits - occupiedUnits;
  
  return {
    totalProperties: properties.length,
    totalTenants: tenants.length,
    totalUnits,        // ✅ Add this
    occupiedUnits,     // ✅ Add this  
    vacantUnits,       // ✅ Add this
    occupancyRate: totalUnits > 0 ? 
      ((occupiedUnits / totalUnits) * 100).toFixed(1) : 0,
    monthlyRevenue: tenants.reduce((sum, t) => sum + (t.rent || 0), 0),
    pendingWorkOrders: workOrders.filter(wo => wo.status === 'Open').length,
    urgentWorkOrders: workOrders.filter(wo => wo.priority === 'High' && wo.status === 'Open').length,
    overduePayments: tenants.filter(t => t.status === 'overdue').length
  };
};

  // ===== RENDER FUNCTION (all your components) =====
  const renderContent = () => {
    const commonProps = {
      properties,
      tenants,
      workOrders,
      transactions,
      documents,
      openModal,
      setActiveTab,
      searchQuery,
      showTips,
      setShowTips,
      getQuickStats,
      getComprehensiveFinancialStats,
      getExpenseCategories,
      getDynamicNotifications
    };

    switch (activeTab) {
      case 'dashboard':
        return <Dashboard {...commonProps} />;
      
      case 'financial':
        return (
          <Financial 
            {...commonProps}
            getComprehensiveFinancialStats={getComprehensiveFinancialStats}
            getExpenseCategories={getExpenseCategories}
            filteredTransactions={getFilteredTransactions} // ✅ Pass the function
            transactionFilter={transactionFilter}
            setTransactionFilter={setTransactionFilter}
            dateRange={dateRange}
            setDateRange={setDateRange}
            deleteTransaction={deleteTransaction}
          />
        );
      
      case 'properties':
        return <Properties {...commonProps} />;
      
      case 'tenants':
        return <Tenants {...commonProps} />;
        
      case 'workorders':
        return <WorkOrders {...commonProps} />;
      
      case 'analytics':
        return <Analytics {...commonProps} />;
      
      case 'communication':
        return <Communication {...commonProps} />;
        
      case 'documents':
        return <Documents {...commonProps} />;
        
      case 'reports':
        return <Reports {...commonProps} />;
      
      default:
        return <Dashboard {...commonProps} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            
            <div className="flex items-center">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden p-2 rounded-lg hover:bg-gray-100 mr-2"
              >
                <Menu className="w-5 h-5" />
              </button>
              <div className="p-2 bg-blue-600 rounded-lg mr-3">
                <Home className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-xl font-bold text-gray-900">PropertyPro</h1>
            </div>
            
            <div className="hidden md:flex flex-1 max-w-md mx-6">
              <SearchBar
                searchQuery={searchQuery}
                onSearchChange={handleSearchChange}
                onClear={clearSearch}
                placeholder="Search properties, tenants, work orders..."
              />
            </div>

            <div className="flex items-center space-x-3">
              <Bell className="w-5 h-5 text-gray-600" />
              <HelpCircle className="w-5 h-5 text-gray-600" />
              <Settings className="w-5 h-5 text-gray-600" />
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm">
                PM
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex">
          
          <Sidebar
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            isCollapsed={!sidebarOpen}
            setIsCollapsed={(collapsed) => setSidebarOpen(!collapsed)}
            tabs={tabs}
          />

          <main className="flex-1 min-w-0 lg:ml-6">
            {renderContent()}
          </main>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <Modal 
          showModal={showModal}
          modalType={modalType}
          closeModal={closeModal}
          formData={formData}
          setFormData={setFormData}
          selectedItem={selectedItem}
          properties={properties}
          tenants={tenants}
          addTransaction={addTransaction}
          updateTransaction={updateTransaction}
        />
      )}
    </div>
  );
};

export default UserFriendlyPropertyApp;
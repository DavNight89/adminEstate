import React, { useState, useMemo, useCallback } from 'react';
import { Bell, HelpCircle, Settings, Menu, Home, Users, Building, Wrench, DollarSign, BarChart3, MessageSquare, FileText, PieChart } from 'lucide-react';

// ===== ESSENTIAL IMPORTS ONLY =====
import { SearchBar } from './common/SearchBar';
import Modal from './components/Modal';
import { Sidebar } from './layout/SideBar';
import { useLocalStorage } from './hooks/useLocalStorage';
import { usePropertyData } from './hooks/usePropertyData';

// ===== KEEP ALL YOUR COMPONENTS =====
import { Dashboard } from './components/dashboard/Dashboard';
import { Financial } from './components/Financial';
import { Analytics } from './components/Analytics';
import { Communication } from './components/Communication';
import { Documents } from './components/Documents';
import { Properties } from './components/Properties';
import { Tenants } from './components/Tenants';
import { WorkOrders } from './components/WorkOrders';
import { Reports } from './components/Reports';

// ===== SOLUTION 1: MODAL TYPE CONSTANTS (Type Safety) =====
export const MODAL_TYPES = {
  ADD_TRANSACTION: 'addTransaction',
  EDIT_TRANSACTION: 'editTransaction',
  DELETE_TRANSACTION: 'deleteTransaction',
  ADD_TENANT: 'addTenant',
  EDIT_TENANT: 'editTenant',
  DELETE_TENANT: 'deleteTenant',
  ADD_PROPERTY: 'addProperty',
  EDIT_PROPERTY: 'editProperty',
  DELETE_PROPERTY: 'deleteProperty',
  ADD_WORK_ORDER: 'addWorkOrder',
  EDIT_WORK_ORDER: 'editWorkOrder',
  DELETE_WORK_ORDER: 'deleteWorkOrder',
  VIEW_WORK_ORDER: 'viewWorkOrder',
  VIEW_PROPERTY: 'viewProperty',
  VIEW_TENANT: 'viewTenant'
};

// ===== SOLUTION 2: EXTRACT MODAL LOGIC TO CUSTOM HOOK =====
const useModalManager = () => {
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);
  const [formData, setFormData] = useState({});

  const openModal = useCallback((type, item = null) => {
    setModalType(type);
    setSelectedItem(item);
    setShowModal(true);

    // Set initial form data based on modal type
    if (type === MODAL_TYPES.ADD_TRANSACTION) {
      setFormData({
        type: 'income',
        amount: '',
        description: '',
        date: new Date().toISOString().split('T')[0],
        category: '',
        property: '',
        tenant: ''
      });
    } else if (type === MODAL_TYPES.EDIT_TRANSACTION && item) {
      setFormData({
        type: item.type || 'income',
        amount: item.amount || '',
        description: item.description || '',
        date: item.date || new Date().toISOString().split('T')[0],
        category: item.category || '',
        property: item.property || '',
        tenant: item.tenant || ''
      });
    } else {
      setFormData({});
    }
  }, []);

  const closeModal = useCallback(() => {
    setShowModal(false);
    setSelectedItem(null);
    setModalType('');
    setFormData({});
  }, []);

  const handleInputChange = useCallback((field, value) => {
    if (typeof field === 'string') {
      setFormData(prev => ({ ...prev, [field]: value }));
    } else {
      const { name, value, type, checked } = field;
      setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    }
  }, []);

  return {
    showModal,
    modalType,
    selectedItem,
    formData,
    setFormData,
    openModal,
    closeModal,
    handleInputChange
  };
};

// ===== SOLUTION 3: EXTRACT ANALYTICS LOGIC =====
const useAnalytics = (properties, tenants, workOrders, transactions) => {
  // MEMOIZED: Only recalculates when data changes
  const quickStats = useMemo(() => {
    const totalUnits = properties.reduce((sum, p) => sum + (p.units || 0), 0);
    const occupiedUnits = properties.reduce((sum, p) => sum + (p.occupied || 0), 0);
    const vacantUnits = totalUnits - occupiedUnits;

    return {
      totalProperties: properties.length,
      totalTenants: tenants.length,
      totalUnits,
      occupiedUnits,
      vacantUnits,
      occupancyRate: totalUnits > 0 ? ((occupiedUnits / totalUnits) * 100).toFixed(1) : 0,
      monthlyRevenue: tenants.reduce((sum, t) => sum + (t.rent || 0), 0),
      pendingWorkOrders: workOrders.filter(wo => wo.status === 'Open').length,
      urgentWorkOrders: workOrders.filter(wo => wo.priority === 'High' && wo.status === 'Open').length,
      overduePayments: tenants.filter(t => t.status === 'overdue').length
    };
  }, [properties, tenants, workOrders]);

  // MEMOIZED: Financial stats
  const financialStats = useMemo(() => {
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
  }, [tenants, transactions]);

  // MEMOIZED: Expense categories
  const expenseCategories = useMemo(() => {
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
  }, [transactions]);

  // MEMOIZED: Dynamic notifications
  const notifications = useMemo(() => {
    const notifs = [];

    // Overdue rent notifications
    const overdueTenants = tenants.filter(t => t.status === 'overdue');
    if (overdueTenants.length > 0) {
      notifs.push({
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
      notifs.push({
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
      notifs.push({
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
      notifs.push({
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
      notifs.push({
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
      notifs.push({
        id: 'large-expenses',
        type: 'warning',
        title: 'Large Recent Expenses',
        message: `$${totalAmount.toLocaleString()} in large expenses (>$1000) in the last 30 days`,
        count: largeRecentExpenses.length,
        action: 'View Financial',
        actionTab: 'financial'
      });
    }

    return notifs;
  }, [properties, tenants, workOrders, transactions]);

  return {
    quickStats,
    financialStats,
    expenseCategories,
    notifications,
    // Return functions wrapped in useCallback
    getQuickStats: useCallback(() => quickStats, [quickStats]),
    getComprehensiveFinancialStats: useCallback(() => financialStats, [financialStats]),
    getExpenseCategories: useCallback(() => expenseCategories, [expenseCategories]),
    getDynamicNotifications: useCallback(() => notifications, [notifications])
  };
};

const PropertyAdmin = () => {
  // ===== UI STATE =====
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showTips, setShowTips] = useLocalStorage('showTips', false);
  const [searchQuery, setSearchQuery] = useState('');

  // ===== FILTER STATE (for Financial component) =====
  const [transactionFilter, setTransactionFilter] = useLocalStorage('transactionFilter', 'all');
  const [dateRange, setDateRange] = useLocalStorage('dateRange', 'month');

  // ===== FILTER STATE (for WorkOrders component) =====
  const [filterStatus, setFilterStatus] = useLocalStorage('filterStatus', 'all');
  const [filterPriority, setFilterPriority] = useLocalStorage('filterPriority', 'all');

  // ===== SOLUTION 4: USE EXTRACTED MODAL HOOK =====
  const modalManager = useModalManager();

  // ===== DATA (your essential hook) =====
  const {
    properties,
    tenants,
    workOrders,
    transactions,
    documents,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    addTenant,
    updateTenant,
    deleteTenant,
    addProperty,
    updateProperty,
    deleteProperty,
    addWorkOrder,
    updateWorkOrder,
    deleteWorkOrder,
  } = usePropertyData();

  // ===== SOLUTION 5: USE MEMOIZED ANALYTICS =====
  const analytics = useAnalytics(properties, tenants, workOrders, transactions);

  // ===== NAVIGATION TABS =====
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

  // ===== FORM SUBMISSION HANDLER =====
  const handleSubmit = useCallback((e) => {
    e.preventDefault();

    switch (modalManager.modalType) {
      case MODAL_TYPES.ADD_TRANSACTION:
        addTransaction(modalManager.formData);
        break;
      case MODAL_TYPES.EDIT_TRANSACTION:
        updateTransaction(modalManager.formData, modalManager.selectedItem);
        break;
      case MODAL_TYPES.DELETE_TRANSACTION:
        deleteTransaction(modalManager.selectedItem);
        break;
      case MODAL_TYPES.ADD_TENANT:
        addTenant(modalManager.formData);
        break;
      case MODAL_TYPES.EDIT_TENANT:
        updateTenant(modalManager.formData, modalManager.selectedItem);
        break;
      case MODAL_TYPES.DELETE_TENANT:
        deleteTenant(modalManager.selectedItem);
        break;
      case MODAL_TYPES.ADD_PROPERTY:
        addProperty(modalManager.formData);
        break;
      case MODAL_TYPES.EDIT_PROPERTY:
        updateProperty(modalManager.formData, modalManager.selectedItem);
        break;
      case MODAL_TYPES.DELETE_PROPERTY:
        deleteProperty(modalManager.selectedItem);
        break;
      case MODAL_TYPES.ADD_WORK_ORDER:
        addWorkOrder(modalManager.formData);
        break;
      case MODAL_TYPES.EDIT_WORK_ORDER:
        updateWorkOrder(modalManager.formData, modalManager.selectedItem);
        break;
      case MODAL_TYPES.DELETE_WORK_ORDER:
        deleteWorkOrder(modalManager.selectedItem);
        break;
      default:
        console.log('Unhandled modal type:', modalManager.modalType);
    }

    modalManager.closeModal();
  }, [
    modalManager.modalType,
    modalManager.formData,
    modalManager.selectedItem,
    modalManager.closeModal,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    addTenant,
    updateTenant,
    deleteTenant,
    addProperty,
    updateProperty,
    deleteProperty,
    addWorkOrder,
    updateWorkOrder,
    deleteWorkOrder
  ]);

  const handleSearchChange = useCallback((value) => {
    setSearchQuery(value);
  }, []);

  const clearSearch = useCallback(() => {
    setSearchQuery('');
  }, []);

  // Filtered transactions function
  const getFilteredTransactions = useCallback(() => {
    return transactions.filter(t => {
      if (transactionFilter === 'income') return t.type === 'income';
      if (transactionFilter === 'expense') return t.type === 'expense';
      return true;
    });
  }, [transactions, transactionFilter]);

  // ===== SOLUTION 6: MINIMAL commonProps (Only Essential) =====
  const renderContent = () => {
    // Base props that ALL components need
    const baseProps = {
      searchQuery,
      setSearchQuery,
      openModal: modalManager.openModal,
      setActiveTab
    };

    switch (activeTab) {
      case 'dashboard':
        return (
          <Dashboard
            {...baseProps}
            properties={properties}
            tenants={tenants}
            workOrders={workOrders}
            showTips={showTips}
            setShowTips={setShowTips}
            getQuickStats={analytics.getQuickStats}
            getComprehensiveFinancialStats={analytics.getComprehensiveFinancialStats}
            getDynamicNotifications={analytics.getDynamicNotifications}
          />
        );

      case 'financial':
        return (
          <Financial
            {...baseProps}
            transactions={transactions}
            properties={properties}
            tenants={tenants}
            getComprehensiveFinancialStats={analytics.getComprehensiveFinancialStats}
            getExpenseCategories={analytics.getExpenseCategories}
            filteredTransactions={getFilteredTransactions}
            transactionFilter={transactionFilter}
            setTransactionFilter={setTransactionFilter}
            dateRange={dateRange}
            setDateRange={setDateRange}
            deleteTransaction={deleteTransaction}
          />
        );

      case 'properties':
        return (
          <Properties
            {...baseProps}
            properties={properties}
            tenants={tenants}
          />
        );

      case 'tenants':
        return (
          <Tenants
            {...baseProps}
            tenants={tenants}
            properties={properties}
          />
        );

      case 'workorders':
        return (
          <WorkOrders
            {...baseProps}
            workOrders={workOrders}
            filterStatus={filterStatus}
            setFilterStatus={setFilterStatus}
            filterPriority={filterPriority}
            setFilterPriority={setFilterPriority}
          />
        );

      case 'analytics':
        return (
          <Analytics
            {...baseProps}
            properties={properties}
            tenants={tenants}
            workOrders={workOrders}
            transactions={transactions}
          />
        );

      case 'communication':
        return (
          <Communication
            {...baseProps}
            tenants={tenants}
          />
        );

      case 'documents':
        return (
          <Documents
            {...baseProps}
            documents={documents}
          />
        );

      case 'reports':
        return (
          <Reports
            {...baseProps}
            properties={properties}
            tenants={tenants}
            workOrders={workOrders}
            transactions={transactions}
          />
        );

      default:
        return (
          <Dashboard
            {...baseProps}
            properties={properties}
            tenants={tenants}
            workOrders={workOrders}
            showTips={showTips}
            setShowTips={setShowTips}
            getQuickStats={analytics.getQuickStats}
            getComprehensiveFinancialStats={analytics.getComprehensiveFinancialStats}
            getDynamicNotifications={analytics.getDynamicNotifications}
          />
        );
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
      {modalManager.showModal && (
        <Modal
          showModal={modalManager.showModal}
          modalType={modalManager.modalType}
          closeModal={modalManager.closeModal}
          handleSubmit={handleSubmit}
          handleInputChange={modalManager.handleInputChange}
          formData={modalManager.formData}
          setFormData={modalManager.setFormData}
          selectedItem={modalManager.selectedItem}
          properties={properties}
          tenants={tenants}
          addTransaction={addTransaction}
          updateTransaction={updateTransaction}
          addTenant={addTenant}
          updateTenant={updateTenant}
        />
      )}
    </div>
  );
};

export default PropertyAdmin;

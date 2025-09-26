// Move your analytics functions
export const getQuickStats = (properties, tenants, workOrders, getComprehensiveFinancialStats) => {
  const totalUnits = properties.reduce((acc, prop) => acc + prop.units || 0, 0);
  const occupiedUnits = properties.reduce((acc, prop) => acc + (prop.occupied || 0), 0);
  const financialStats = getComprehensiveFinancialStats(); 
  const occupancyRate = totalUnits > 0 ? Math.round((occupiedUnits / totalUnits) * 100) : 0;
  const urgentWorkOrders = workOrders.filter(wo => wo.priority == 'High').length;
  const overduePayments = tenants.filter(t => t.balance < 0).length;

  return {
    totalUnits,
    occupiedUnits,
    totalRevenue: financialStats.monthlyIncome,
    occupancyRate,
    urgentWorkOrders,
    overduePayments
    };
};

export const getComprehensiveFinancialStats = () => {
  // Calculate income from transactions (actual payments received)
  const transactionIncome = transactions
    .filter(t => t.type == 'income' && t.amount > 0)
    .reduce((sum, t) => sum + t.amount, 0);

  // Calculate potential income from tenant rents
  const potentialMonthlyIncome = tenants
    .filter(t => t.status == 'Current')
    .reduce((sum, t) => sum + (parseFloat(t.rent) || 0), 0);

  // Use the potential income as primary source
  const actualMonthlyIncome = potentialMonthlyIncome;

  const monthlyExpenses = transactions
    .filter(t => t.type == 'expense' && t.amount < 0)
    .reduce((sum, t) => sum + Math.abs(parseFloat(t.amount)), 0);

  const outstandingBalance = tenants
    .filter(t => t.balance < 0)
    .reduce((sum, t) => sum + Math.abs(parseFloat(t.balance)), 0);

  const netIncome = actualMonthlyIncome - monthlyExpenses;
  
  return {
    monthlyIncome: actualMonthlyIncome,
    transactionIncome,
    potentialMonthlyIncome,
    monthlyExpenses,
    outstandingBalance,
    netIncome,
    overdueCount: tenants.filter(t => t.balance < 0).length
  };
};


// Add this function after getComprehensiveFinancialStats (around line 340):
export const getExpenseCategories = () => {
  const expenseCategories = [
    { id: 1, category: 'Maintenance', budget: 10000 },
    { id: 2, category: 'Utilities', budget: 4000 },
    { id: 3, category: 'Insurance', budget: 2000 }
  ];

  return expenseCategories.map(cat => {
    const amount = transactions
      .filter(t => t.type == 'expense' && t.category == cat.category.toLowerCase())
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);
    
    return {
      ...cat,
      amount,
      percentage: (amount / cat.budget) * 100
    };
  });
};

// Add this function after getExpenseCategories:
export const getDynamicNotifications = () => {
  const notifications = [];
  
  // Add overdue payment notifications
  tenants.filter(t => t.balance < 0).forEach(tenant => {
    notifications.push({
      id: `overdue-${tenant.id}`,
      message: `Rent due from ${tenant.name}`,
      type: "warning",
      time: "overdue"
    });
  });
  
  // Add urgent work order notifications
  workOrders.filter(wo => wo.status == 'Open' && wo.priority == 'High').forEach(order => {
    notifications.push({
      id: `urgent-${order.id}`,
      message: `Urgent work order: ${order.issue}`,
      type: "alert",
      time: order.dateSubmitted
    });
  });
  
  // Add completed work order notifications
  workOrders.filter(wo => wo.status == 'Completed').slice(0, 2).forEach(order => {
    notifications.push({
      id: `completed-${order.id}`,
      message: `Work order completed for ${order.unit}`,
      type: "success",
      time: "1 day ago"
    });
  });
  
  return notifications.slice(0, 5); // Limit to 5 notifications
};
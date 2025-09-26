// src/services/calculationService.js
export class CalculationService {
  static calculateOccupancyRate(properties) {
    const totalUnits = properties.reduce((acc, prop) => acc + (prop.units || 0), 0);
    const occupiedUnits = properties.reduce((acc, prop) => acc + (prop.occupied || 0), 0);
    return totalUnits > 0 ? Math.round((occupiedUnits / totalUnits) * 100) : 0;
  }

  static calculateTotalRevenue(properties) {
    return properties.reduce((acc, prop) => acc + (prop.monthlyRevenue || 0), 0);
  }

  static calculateFinancialMetrics(transactions) {
    const income = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const expenses = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);
    
    const netIncome = income - expenses;
    const profitMargin = income > 0 ? (netIncome / income) * 100 : 0;

    return {
      totalIncome: income,
      totalExpenses: expenses,
      netIncome,
      profitMargin
    };
  }

  static calculateMaintenanceMetrics(workOrders) {
    const total = workOrders.length;
    const completed = workOrders.filter(wo => wo.status === 'Completed').length;
    const pending = workOrders.filter(wo => wo.status === 'Pending').length;
    const inProgress = workOrders.filter(wo => wo.status === 'In Progress').length;

    return {
      total,
      completed,
      pending,
      inProgress,
      completionRate: total > 0 ? Math.round((completed / total) * 100) : 0
    };
  }
}
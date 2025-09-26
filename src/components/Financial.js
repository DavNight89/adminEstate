import React from 'react';
import { Plus, Download, TrendingUp, TrendingDown, AlertTriangle, BarChart3 } from 'lucide-react';

export const Financial = ({ 
  getComprehensiveFinancialStats,
  getExpenseCategories,
  transactions,
  filteredTransactions,
  transactionFilter,
  setTransactionFilter,
  dateRange,
  setDateRange,
  openModal,
  deleteTransaction 
}) => {
  const financialStats = getComprehensiveFinancialStats();
  const dynamicExpenses = getExpenseCategories();
  
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Financial Management</h2>
          <p className="text-gray-600">Track income, expenses, and payments</p>
        </div>
        <div className="flex space-x-2">
        <button 
  onClick={() => openModal('addTransaction')}
  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center transition-colors"
>
  <Plus className="w-4 h-4 mr-2" />
  Record Transaction
</button>

          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center transition-colors">
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </button>
        </div>
      </div>


      {/* Interactive Financial Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div 
        onClick={() => openModal('viewMonthlyRevenue')}
        className="bg-gradient-to-r from-green-500 to-green-600 text-white p-6 rounded-xl cursor-pointer hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Monthly Income</h3>
            <TrendingUp className="w-6 h-6" />
          </div>
          <p className="text-3xl font-bold mb-2">${financialStats.monthlyIncome.toLocaleString()}</p>
          <p className="text-green-100 text-sm">
            {financialStats.netIncome > 0 ? '+' : ''}
            ${Math.abs(financialStats.netIncome).toLocaleString()} net income
          </p>
        </div>
        
        <div className="bg-gradient-to-r from-red-500 to-red-600 text-white p-6 rounded-xl cursor-pointer hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Outstanding Balance</h3>
            <AlertTriangle className="w-6 h-6" />
          </div>
          <p className="text-3xl font-bold mb-2">${financialStats.outstandingBalance.toLocaleString()}</p>
          <p className="text-red-100 text-sm">{financialStats.overdueCount} tenants overdue</p>
        </div>
        
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-6 rounded-xl cursor-pointer hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Monthly Expenses</h3>
            <TrendingDown className="w-6 h-6" />
          </div>
          <p className="text-3xl font-bold mb-2">${financialStats.monthlyExpenses.toLocaleString()}</p>
          <p className="text-orange-100 text-sm">This month</p>
        </div>

        <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-6 rounded-xl cursor-pointer hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Profit Margin</h3>
            <BarChart3 className="w-6 h-6" />
          </div>
          <p className="text-3xl font-bold mb-2">
            {financialStats.monthlyIncome > 0 ? Math.round((financialStats.netIncome / financialStats.monthlyIncome) * 100) : 0}%
          </p>
          <p className="text-purple-100 text-sm">
            {financialStats.netIncome > 0 ? 'Profitable' : 'Loss'}
          </p>
        </div>
      </div>

      {/* Expense Categories */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold">Expense Categories</h3>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {dynamicExpenses.map(expense => (
              <div key={expense.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="flex-1">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-medium text-gray-900">{expense.category}</h4>
                    <span className="text-sm text-gray-600">
                      ${expense.amount.toLocaleString()} / ${expense.budget.toLocaleString()}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-300 ${
                        expense.percentage > 90 ? 'bg-red-500' : 
                        expense.percentage > 75 ? 'bg-yellow-500' : 'bg-green-500'
                      }`}
                      style={{ width: `${expense.percentage}%` }}
                    ></div>
                  </div>
                </div>
                <div className="ml-4 text-right">
                  <span className={`text-sm font-medium ${
                    expense.percentage > 90 ? 'text-red-600' : 
                    expense.percentage > 75 ? 'text-yellow-600' : 'text-green-600'
                  }`}>
                    {expense.percentage.toFixed(1)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Interactive Transactions Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h3 className="text-lg font-semibold">Recent Transactions</h3>
            <div className="flex space-x-2">
              <select 
                value={transactionFilter}
                onChange={(e) => setTransactionFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Transactions</option>
                <option value="income">Income Only</option>
                <option value="expense">Expenses Only</option>
              </select>
              <select 
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="week">This Week</option>
                <option value="month">This Month</option>
                <option value="quarter">This Quarter</option>
                <option value="year">This Year</option>
              </select>
            </div>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
  <tr>
    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Property/Unit</th> {/* ← Add this column */}
    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
  </tr>
</thead>
            
<tbody className="divide-y divide-gray-200">
  {filteredTransactions().slice(0, 10).map(transaction => (
    <tr key={transaction.id} className="hover:bg-gray-50 transition-colors">
      <td className="px-6 py-4 text-sm text-gray-900">{transaction.date}</td>
      <td className="px-6 py-4 text-sm text-gray-900">{transaction.description}</td>
      <td className="px-6 py-4">
        <span className={`px-2 py-1 rounded text-xs font-medium ${
          transaction.type == 'income' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {transaction.type == 'income' ? 'Income' : 'Expense'}
        </span>
      </td>
       <td className="px-6 py-4 text-sm text-gray-900">
        <div>
          <div className="font-medium">{transaction.property || 'General'}</div>
          {transaction.unit && (
            <div className="text-xs text-gray-500">Unit {transaction.unit}</div>
          )}
          {transaction.tenant && (
            <div className="text-xs text-gray-400">{transaction.tenant}</div>
          )}
        </div>
      </td>
      <td className={`px-6 py-4 text-sm font-medium ${
        transaction.amount > 0 ? 'text-green-600' : 'text-red-600'
      }`}>
        {transaction.amount > 0 ? '+' : ''}${Math.abs(transaction.amount).toLocaleString()}
      </td>
      <td className="px-6 py-4">
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          transaction.status == 'completed' ? 'bg-green-100 text-green-800' :
          transaction.status == 'pending' ? 'bg-yellow-100 text-yellow-800' :
          'bg-red-100 text-red-800'
        }`}>
          {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
        </span>
      </td>
      <td className="px-6 py-4 text-sm">
        <div className="flex space-x-2">
          <button 
            onClick={() => openModal('editTransaction', transaction)}
            className="text-blue-600 hover:text-blue-900 transition-colors"
          >
            Edit
          </button>
          <button 
            onClick={() => {
              console.log('View receipt for:', transaction);
            }}
            className="text-green-600 hover:text-green-900 transition-colors"
          >
            Receipt
          </button>
          <button 
            onClick={() => {
              if (window.confirm('Are you sure you want to delete this transaction?')) {
                deleteTransaction(transaction.id);
              }
            }}
            className="text-red-600 hover:text-red-900 transition-colors"
          >
            Delete
          </button>
        </div>
      </td>
    </tr>
  ))}
</tbody>
          </table>
        </div>
        {filteredTransactions().length == 0 && (
          <div className="text-center py-8">
            <p className="text-gray-500">No transactions found for the selected filter.</p>
          </div>
        )}
      </div>
    </div>
  );
};
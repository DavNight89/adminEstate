import React, { useState } from 'react';
import { 
  FileText, Calendar, Filter, Search, Eye, 
  Download, // ✅ Add this missing import
  BarChart3, PieChart, TrendingUp, Users, 
  Building, DollarSign
} from 'lucide-react';

export const Reports = ({ 
  properties = [], 
  tenants = [], 
  workOrders = [], 
  transactions = [] 
}) => {
  const [selectedReport, setSelectedReport] = useState('financial');
  const [dateRange, setDateRange] = useState('month');
  const [searchQuery, setSearchQuery] = useState('');

  // Available reports
  const reportTypes = [
    { id: 'financial', label: 'Financial Report', icon: DollarSign, description: 'Income, expenses, and profit analysis' },
    { id: 'occupancy', label: 'Occupancy Report', icon: Building, description: 'Property occupancy rates and trends' },
    { id: 'tenant', label: 'Tenant Report', icon: Users, description: 'Tenant demographics and lease information' },
    { id: 'maintenance', label: 'Maintenance Report', icon: FileText, description: 'Work orders and maintenance costs' },
    { id: 'performance', label: 'Performance Report', icon: TrendingUp, description: 'Overall portfolio performance metrics' }
  ];

  // Generate report data based on selected type
  const generateReportData = () => {
    const now = new Date();
    let startDate = new Date();
    
    switch(dateRange) {
      case 'week':
        startDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(now.getMonth() - 1);
        break;
      case 'quarter':
        startDate.setMonth(now.getMonth() - 3);
        break;
      case 'year':
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      default:
        startDate.setMonth(now.getMonth() - 1);
    }

    const filteredTransactions = transactions.filter(t => {
      const transactionDate = new Date(t.date);
      return transactionDate >= startDate && transactionDate <= now;
    });

    switch(selectedReport) {
      case 'financial':
        return {
          title: 'Financial Report',
          data: {
            totalIncome: filteredTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0),
            totalExpenses: filteredTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + Math.abs(t.amount), 0),
            netIncome: filteredTransactions.reduce((sum, t) => sum + (t.type === 'income' ? t.amount : -Math.abs(t.amount)), 0),
            transactionCount: filteredTransactions.length
          }
        };
      
      case 'occupancy':
        const totalUnits = properties.reduce((sum, p) => sum + (p.units || 0), 0);
        const occupiedUnits = properties.reduce((sum, p) => sum + (p.occupied || 0), 0);
        return {
          title: 'Occupancy Report',
          data: {
            totalUnits,
            occupiedUnits,
            vacantUnits: totalUnits - occupiedUnits,
            occupancyRate: totalUnits > 0 ? ((occupiedUnits / totalUnits) * 100).toFixed(1) : 0
          }
        };
      
      case 'tenant':
        return {
          title: 'Tenant Report',
          data: {
            totalTenants: tenants.length,
            activeTenants: tenants.filter(t => t.status === 'active').length,
            overdueTenants: tenants.filter(t => t.status === 'overdue').length,
            averageRent: tenants.length > 0 ? (tenants.reduce((sum, t) => sum + (t.rent || 0), 0) / tenants.length).toFixed(0) : 0
          }
        };
      
      case 'maintenance':
        return {
          title: 'Maintenance Report',
          data: {
            totalWorkOrders: workOrders.length,
            openWorkOrders: workOrders.filter(wo => wo.status === 'Open').length,
            completedWorkOrders: workOrders.filter(wo => wo.status === 'Completed').length,
            highPriorityOrders: workOrders.filter(wo => wo.priority === 'High').length
          }
        };
      
      case 'performance':
        const monthlyRevenue = properties.reduce((sum, p) => sum + (p.monthlyRevenue || 0), 0);
        return {
          title: 'Performance Report',
          data: {
            totalProperties: properties.length,
            monthlyRevenue,
            averageRevenuePerProperty: properties.length > 0 ? (monthlyRevenue / properties.length).toFixed(0) : 0,
            portfolioValue: properties.reduce((sum, p) => sum + (p.purchasePrice || 0), 0)
          }
        };
      
      default:
        return { title: 'Report', data: {} };
    }
  };

  const reportData = generateReportData();

  const handleDownloadReport = () => {
    // Simple CSV download functionality
    const csvContent = Object.entries(reportData.data)
      .map(([key, value]) => `${key},${value}`)
      .join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedReport}_report_${dateRange}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Reports</h2>
          <p className="text-gray-600">Generate detailed reports for your property portfolio</p>
        </div>
        
        <button
          onClick={handleDownloadReport}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center transition-colors"
        >
          <Download className="w-4 h-4 mr-2" />
          Download Report
        </button>
      </div>

      {/* Report Selection */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-semibold mb-4">Select Report Type</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {reportTypes.map(report => (
            <div
              key={report.id}
              onClick={() => setSelectedReport(report.id)}
              className={`p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                selectedReport === report.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center mb-2">
                <report.icon className={`w-5 h-5 mr-2 ${
                  selectedReport === report.id ? 'text-blue-600' : 'text-gray-600'
                }`} />
                <h4 className={`font-medium ${
                  selectedReport === report.id ? 'text-blue-900' : 'text-gray-900'
                }`}>
                  {report.label}
                </h4>
              </div>
              <p className="text-sm text-gray-600">{report.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Date Range Selection */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-semibold mb-4">Date Range</h3>
        <div className="flex flex-wrap gap-2">
          {[
            { id: 'week', label: 'Last Week' },
            { id: 'month', label: 'Last Month' },
            { id: 'quarter', label: 'Last Quarter' },
            { id: 'year', label: 'Last Year' }
          ].map(range => (
            <button
              key={range.id}
              onClick={() => setDateRange(range.id)}
              className={`px-4 py-2 rounded-lg transition-colors ${
                dateRange === range.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {range.label}
            </button>
          ))}
        </div>
      </div>

      {/* Report Display */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold">{reportData.title}</h3>
          <span className="text-sm text-gray-500">
            Generated on {new Date().toLocaleDateString()}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Object.entries(reportData.data).map(([key, value]) => (
            <div key={key} className="bg-gray-50 p-4 rounded-lg">
              <h4 className="text-sm font-medium text-gray-600 capitalize mb-1">
                {key.replace(/([A-Z])/g, ' $1').trim()}
              </h4>
              <p className="text-2xl font-bold text-gray-900">
                {typeof value === 'number' && key.toLowerCase().includes('revenue') || key.toLowerCase().includes('income') || key.toLowerCase().includes('expense') || key.toLowerCase().includes('value')
                  ? `$${value.toLocaleString()}`
                  : value
                }
                {key.toLowerCase().includes('rate') && '%'}
              </p>
            </div>
          ))}
        </div>

        {/* Additional Report Details */}
        <div className="mt-8">
          <h4 className="text-md font-semibold mb-4">Report Summary</h4>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-gray-700">
              This {reportData.title.toLowerCase()} covers the selected {dateRange} period and includes 
              key metrics relevant to your property management operations. 
              {selectedReport === 'financial' && ' Track your income, expenses, and overall profitability.'}
              {selectedReport === 'occupancy' && ' Monitor your property occupancy rates and identify opportunities.'}
              {selectedReport === 'tenant' && ' Analyze tenant demographics and lease status.'}
              {selectedReport === 'maintenance' && ' Review work order status and maintenance costs.'}
              {selectedReport === 'performance' && ' Evaluate overall portfolio performance and ROI.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
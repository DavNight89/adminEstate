import React, { useState } from 'react';
import { 
  FileText, Calendar, Filter, Search, Eye, 
  Download,
  BarChart3, PieChart, TrendingUp, Users, 
  Building, DollarSign
} from 'lucide-react';
import { ReportCharts } from './ReportCharts';

export const Reports = ({ 
  properties = [], 
  tenants = [], 
  workOrders = [], 
  transactions = [] 
}) => {
  const [selectedReport, setSelectedReport] = useState('financial');
  const [dateRange, setDateRange] = useState('month');
  const [searchQuery, setSearchQuery] = useState('');
    const totalRevenue = properties.reduce((acc, prop) => acc + (prop.monthlyRevenue || 0), 0);
  const totalUnits = properties.reduce((acc, prop) => acc + (prop.units || 0), 0);
  const occupiedUnits = properties.reduce((acc, prop) => acc + (prop.occupied || 0), 0);
  const vacantUnits = totalUnits - occupiedUnits;



  // Available reports
  const reportTypes = [
    { id: 'financial', label: 'Financial Report', icon: DollarSign, description: 'Income, expenses, and profit analysis' },
    { id: 'occupancy', label: 'Occupancy Report', icon: Building, description: 'Property occupancy rates and trends' },
    { id: 'tenant', label: 'Tenant Report', icon: Users, description: 'Tenant demographics and lease information' },
    { id: 'maintenance', label: 'Maintenance Report', icon: FileText, description: 'Work orders and maintenance costs' },
    { id: 'performance', label: 'Performance Report', icon: TrendingUp, description: 'Overall portfolio performance metrics' }
  ];

   // ✅ Filter report types by search query
  const filteredReportTypes = reportTypes.filter(report => 
    report.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
    report.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
            transactionCount: filteredTransactions.length,
            // ✅ Use the defined variables
            currentMonthlyRevenue: totalRevenue,
            portfolioOccupancy: totalUnits > 0 ? ((occupiedUnits / totalUnits) * 100).toFixed(1) : 0            
          }
        };
      
      case 'occupancy':
        return {
          title: 'Occupancy Report',
          data: {
            totalUnits,
            occupiedUnits,
            vacantUnits: totalUnits - occupiedUnits,
            occupancyRate: totalUnits > 0 ? ((occupiedUnits / totalUnits) * 100).toFixed(1) : 0,
                        // ✅ Add monthly revenue context
            monthlyRevenueFromOccupied: totalRevenue,
            potentialRevenueIfFull: totalUnits > 0 && occupiedUnits > 0 ? (totalRevenue / occupiedUnits * totalUnits) : 0
          }
        };
      
      case 'tenant':
        return {
          title: 'Tenant Report',
          data: {
            totalTenants: tenants.length,
            activeTenants: tenants.filter(t => t.status === 'active').length,
            overdueTenants: tenants.filter(t => t.status === 'overdue').length,
            averageRent: tenants.length > 0 ? (tenants.reduce((sum, t) => sum + (t.rent || 0), 0) / tenants.length).toFixed(0) : 0,
            // ✅ Use defined variables for context
            totalUnitsAvailable: totalUnits,
            unitsOccupied: occupiedUnits,
            unitsVacant: vacantUnits            
          }
        };
      
      case 'maintenance':
        return {
          title: 'Maintenance Report',
          data: {
            totalWorkOrders: workOrders.length,
            openWorkOrders: workOrders.filter(wo => wo.status === 'Open').length,
            completedWorkOrders: workOrders.filter(wo => wo.status === 'Completed').length,
            highPriorityOrders: workOrders.filter(wo => wo.priority === 'High').length,
            // ✅ Add portfolio context using defined variables
            workOrdersPerUnit: totalUnits > 0 ? (workOrders.length / totalUnits).toFixed(2) : 0,
            occupiedUnitsWithIssues: occupiedUnits > 0 ? ((workOrders.filter(wo => wo.status === 'Open').length / occupiedUnits) * 100).toFixed(1) : 0,
            // ✅ Add more metrics using defined variables
            totalUnitsManaged: totalUnits,
            occupancyPerformance: totalUnits > 0 ? ((occupiedUnits / totalUnits) * 100).toFixed(1) : 0,
            revenuePerUnit: totalUnits > 0 ? (totalRevenue / totalUnits).toFixed(0) : 0,
            vacancyLoss: vacantUnits > 0 && occupiedUnits > 0 ? (vacantUnits * (totalRevenue / occupiedUnits)).toFixed(0) : 0                     
          }
        };
      
case 'performance':
  // Calculate ROI metrics
  const portfolioValue = properties.reduce((sum, p) => sum + (p.purchasePrice || 0), 0);
  const annualRevenue = totalRevenue * 12;
  const annualExpenses = workOrders.reduce((sum, wo) => sum + (wo.estimatedCost || 0), 0) * 4; // Estimate annual maintenance
  const netOperatingIncome = annualRevenue - annualExpenses;
  const portfolioROI = portfolioValue > 0 ? ((netOperatingIncome / portfolioValue) * 100) : 0;
  const cashOnCashReturn = portfolioValue > 0 ? ((netOperatingIncome / portfolioValue) * 100) : 0;
  const capRate = portfolioValue > 0 ? ((netOperatingIncome / portfolioValue) * 100) : 0;
  
  return {
    title: 'Performance Report',
    data: {
      totalProperties: properties.length,
      monthlyRevenue: totalRevenue,
      averageRevenuePerProperty: properties.length > 0 ? (totalRevenue / properties.length).toFixed(0) : 0,
      portfolioValue: portfolioValue,
      totalUnitsManaged: totalUnits,
      occupancyPerformance: totalUnits > 0 ? ((occupiedUnits / totalUnits) * 100).toFixed(1) : 0,
      revenuePerUnit: totalUnits > 0 ? (totalRevenue / totalUnits).toFixed(0) : 0,
      vacancyLoss: vacantUnits > 0 && occupiedUnits > 0 ? (vacantUnits * (totalRevenue / occupiedUnits)).toFixed(0) : 0,
      // ✅ NEW ROI METRICS
      annualRevenue: annualRevenue,
      annualExpenses: annualExpenses,
      netOperatingIncome: netOperatingIncome,
      portfolioROI: portfolioROI.toFixed(2),
      cashOnCashReturn: cashOnCashReturn.toFixed(2),
      capRate: capRate.toFixed(2),
      revenueGrowthRate: 0, // Placeholder - would need historical data
      expenseRatio: annualRevenue > 0 ? ((annualExpenses / annualRevenue) * 100).toFixed(2) : 0
    }
  };
      default:
        return { title: 'Report', data: {} };
    }
  };

  const reportData = generateReportData();

  
  const handleDownloadReport = () => {
    // ✅ Enhanced CSV with portfolio summary
    const portfolioSummary = [
      'PORTFOLIO SUMMARY',
      `Total Properties,${properties.length}`,
      `Total Units,${totalUnits}`,
      `Occupied Units,${occupiedUnits}`,
      `Vacant Units,${vacantUnits}`,
      `Monthly Revenue,$${totalRevenue.toLocaleString()}`,
      '',
      'REPORT DATA'
    ].join('\n');
    
    const reportContent = Object.entries(reportData.data)
      .map(([key, value]) => `${key.replace(/([A-Z])/g, ' $1').trim()},${value}`)
      .join('\n');
    
    const csvContent = portfolioSummary + '\n' + reportContent;
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedReport}_report_${dateRange}_${new Date().toISOString().split('T')[0]}.csv`;
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
          {/* ✅ Show defined variables in header */}
          <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
            <span>{properties.length} Properties</span>
            <span>•</span>
            <span>{totalUnits} Total Units</span>
            <span>•</span>
            <span>{occupiedUnits} Occupied</span>
            <span>•</span>
            <span>${totalRevenue.toLocaleString()} Monthly Revenue</span>
          </div>          
        </div>
        
        <button
          onClick={handleDownloadReport}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center transition-colors"
        >
          <Download className="w-4 h-4 mr-2" />
          Download Report
        </button>
      </div>

      {/* ✅ Add Search Functionality */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Select Report Type</h3>
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search reports..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
        
        {/* ✅ Use filtered reports */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredReportTypes.map(report => (
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
        
        {/* ✅ Show no results message */}
        {filteredReportTypes.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-500">No reports match your search.</p>
          </div>
        )}
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

      {/* ✅ Portfolio Overview Card */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl p-6">
        <h3 className="text-lg font-semibold mb-4">Portfolio Overview</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold">{totalUnits}</div>
            <div className="text-blue-100 text-sm">Total Units</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">{occupiedUnits}</div>
            <div className="text-blue-100 text-sm">Occupied</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">{vacantUnits}</div>
            <div className="text-blue-100 text-sm">Vacant</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">${totalRevenue.toLocaleString()}</div>
            <div className="text-blue-100 text-sm">Monthly Revenue</div>
          </div>
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
                {typeof value === 'number' && (key.toLowerCase().includes('revenue') || key.toLowerCase().includes('income') || key.toLowerCase().includes('expense') || key.toLowerCase().includes('value') || key.toLowerCase().includes('loss'))
                  ? `$${value.toLocaleString()}`
                  : value
                }
                {(key.toLowerCase().includes('rate') || key.toLowerCase().includes('roi') || key.toLowerCase().includes('return') || key.toLowerCase().includes('performance') || key.toLowerCase().includes('ratio')) && typeof value === 'string' && '%'}
              </p>
            </div>
          ))}
        </div>

        {/* 📊 ADD VISUAL CHARTS */}
        <ReportCharts 
          reportData={reportData}
          reportType={selectedReport}
          properties={properties}
          tenants={tenants}
        />

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
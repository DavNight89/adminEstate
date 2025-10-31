import React, { useState, useEffect, useCallback } from 'react';
import { 
  TrendingUp, BarChart3, PieChart, Users, Building,
  RefreshCw, Calendar, Download, Filter, Target, Award, Zap
} from 'lucide-react';

export const PandasAnalytics = ({ onRefresh }) => {
  const [analyticsData, setAnalyticsData] = useState({});
  const [propertyTypeData, setPropertyTypeData] = useState({});
  const [rankings, setRankings] = useState({});
  const [portfolio, setPortfolio] = useState({});
  const [correlations, setCorrelations] = useState({});
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [activeTab, setActiveTab] = useState('dashboard');

  const fetchPandasAnalytics = async () => {
    setLoading(true);
    try {
      // Fetch all analytics endpoints
      const [dashboardRes, typeRes, rankingRes, portfolioRes, corrRes] = await Promise.all([
        fetch('http://localhost:5000/api/analytics/dashboard'),
        fetch('http://localhost:5000/api/analytics/property-types'),
        fetch('http://localhost:5000/api/analytics/rankings'),
        fetch('http://localhost:5000/api/analytics/portfolio'),
        fetch('http://localhost:5000/api/analytics/correlations')
      ]);

      const [dashboard, types, ranking, portfolioData, corrData] = await Promise.all([
        dashboardRes.json(),
        typeRes.json(),
        rankingRes.json(),
        portfolioRes.json(),
        corrRes.json()
      ]);

      setAnalyticsData(dashboard.data || {});
      setPropertyTypeData(types.data || {});
      setRankings(ranking.data || {});
      setPortfolio(portfolioData.data || {});
      setCorrelations(corrData.data || {});
      setLastUpdated(new Date());

    } catch (error) {
      console.error('Error fetching Pandas analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const syncLocalStorageToBackend = useCallback(async () => {
    try {
      setLoading(true);

      // Get all data from localStorage
      const localStorageData = {
        properties: JSON.parse(localStorage.getItem('properties') || '[]'),
        tenants: JSON.parse(localStorage.getItem('tenants') || '[]'),
        workOrders: JSON.parse(localStorage.getItem('workOrders') || '[]'),
        transactions: JSON.parse(localStorage.getItem('transactions') || '[]'),
        documents: JSON.parse(localStorage.getItem('documents') || '[]'),
        applications: JSON.parse(localStorage.getItem('applications') || '[]')
      };

      console.log('🔄 Syncing localStorage to backend...', {
        properties: localStorageData.properties.length,
        tenants: localStorageData.tenants.length,
        workOrders: localStorageData.workOrders.length,
        transactions: localStorageData.transactions.length,
        applications: localStorageData.applications.length
      });

      // Sync to backend
      const response = await fetch('http://localhost:5000/api/sync/localstorage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(localStorageData)
      });

      const result = await response.json();

      if (result.success) {
        console.log('✅ Sync successful!', result);
        // Refresh analytics after sync
        await fetchPandasAnalytics();
      } else {
        console.error('❌ Sync failed:', result.error);
      }
    } catch (error) {
      console.error('❌ Error syncing data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Sync localStorage to backend first, then fetch analytics
    syncLocalStorageToBackend();
  }, [syncLocalStorageToBackend]);

  const handleRefresh = () => {
    // Sync localStorage first, then fetch analytics
    syncLocalStorageToBackend();
    if (onRefresh) onRefresh();
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(value || 0);
  };

  const formatPercent = (value) => {
    return `${(value || 0).toFixed(1)}%`;
  };

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'types', label: 'Property Types', icon: Building },
    { id: 'rankings', label: 'Rankings', icon: Award },
    { id: 'portfolio', label: 'Portfolio', icon: PieChart },
    { id: 'correlations', label: 'Correlations', icon: Zap }
  ];

  return (
    <div className="space-y-6">
      {/* Header with Pandas Badge */}
      <div className="flex justify-between items-center">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold text-gray-900">Analytics</h2>
            <span className="bg-gradient-to-r from-green-500 to-blue-600 text-white text-xs px-3 py-1 rounded-full font-medium">
              🐼 Powered by Pandas
            </span>
          </div>
          <p className="text-gray-600">Advanced analytics using Python & Pandas</p>
        </div>
        
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-500">
            Updated: {lastUpdated.toLocaleTimeString()}
          </span>
          <button 
            onClick={handleRefresh}
            disabled={loading}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Dashboard Tab */}
      {activeTab === 'dashboard' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 rounded-xl text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm">Total Properties</p>
                <p className="text-3xl font-bold">{analyticsData.total_properties || 0}</p>
              </div>
              <Building className="w-8 h-8 text-blue-200" />
            </div>
          </div>

          <div className="bg-gradient-to-r from-green-600 to-green-700 p-6 rounded-xl text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm">Portfolio Value</p>
                <p className="text-3xl font-bold">{formatCurrency(analyticsData.total_portfolio_value)}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-200" />
            </div>
          </div>

          <div className="bg-gradient-to-r from-purple-600 to-purple-700 p-6 rounded-xl text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm">Monthly Revenue</p>
                <p className="text-3xl font-bold">{formatCurrency(analyticsData.total_monthly_revenue)}</p>
              </div>
              <Users className="w-8 h-8 text-purple-200" />
            </div>
          </div>

          <div className="bg-gradient-to-r from-orange-600 to-orange-700 p-6 rounded-xl text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm">Avg Cap Rate</p>
                <p className="text-3xl font-bold">{formatPercent(analyticsData.avg_cap_rate)}</p>
              </div>
              <Target className="w-8 h-8 text-orange-200" />
            </div>
          </div>

          {/* Additional metrics */}
          <div className="bg-white p-6 rounded-xl border border-gray-200">
            <h3 className="font-semibold text-gray-900 mb-4">Occupancy Overview</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Total Units:</span>
                <span className="font-medium">{analyticsData.total_units || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Occupied:</span>
                <span className="font-medium text-green-600">{analyticsData.occupied_units || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Vacant:</span>
                <span className="font-medium text-red-600">{analyticsData.vacant_units || 0}</span>
              </div>
              <div className="flex justify-between pt-2 border-t">
                <span className="text-sm text-gray-600">Occupancy Rate:</span>
                <span className="font-medium">{formatPercent(analyticsData.occupancy_rate)}</span>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl border border-gray-200">
            <h3 className="font-semibold text-gray-900 mb-4">Performance Metrics</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Avg Property Value:</span>
                <span className="font-medium">{formatCurrency(analyticsData.avg_property_value)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Avg Revenue:</span>
                <span className="font-medium">{formatCurrency(analyticsData.avg_revenue_per_property)}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Property Types Tab */}
      {activeTab === 'types' && (
        <div className="space-y-6">
          <div className="grid gap-6">
            {Object.entries(propertyTypeData).map(([type, data]) => (
              <div key={type} className="bg-white p-6 rounded-xl border border-gray-200">
                <h3 className="text-lg font-semibold capitalize text-gray-900 mb-4">{type} Properties</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Count</p>
                    <p className="text-2xl font-bold text-blue-600">{data.property_count}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Total Value</p>
                    <p className="text-2xl font-bold text-green-600">{formatCurrency(data.total_value)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Monthly Revenue</p>
                    <p className="text-2xl font-bold text-purple-600">{formatCurrency(data.total_revenue)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Avg Cap Rate</p>
                    <p className="text-2xl font-bold text-orange-600">{formatPercent(data.avg_cap_rate)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Rankings Tab */}
      {activeTab === 'rankings' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {rankings.top_by_value && (
            <div className="bg-white p-6 rounded-xl border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Top by Value</h3>
              <div className="space-y-3">
                {rankings.top_by_value.map((property, index) => (
                  <div key={index} className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">{property.name}</p>
                      <p className="text-sm text-gray-600">{property.type} • {property.units} units</p>
                    </div>
                    <span className="font-bold text-green-600">{formatCurrency(property.purchasePrice)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {rankings.top_by_revenue && (
            <div className="bg-white p-6 rounded-xl border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Top by Revenue</h3>
              <div className="space-y-3">
                {rankings.top_by_revenue.map((property, index) => (
                  <div key={index} className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">{property.name}</p>
                      <p className="text-sm text-gray-600">{property.type} • {formatPercent(property.occupancy_rate)} occupied</p>
                    </div>
                    <span className="font-bold text-purple-600">{formatCurrency(property.monthlyRevenue)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {loading && (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Loading Pandas analytics...</span>
        </div>
      )}
    </div>
  );
};
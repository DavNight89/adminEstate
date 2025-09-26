import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, BarChart3, PieChart, Users, Building,
  RefreshCw, Calendar, Download, Filter
} from 'lucide-react';

export const Analytics = ({ properties = [], tenants = [] }) => {
  const [analyticsData, setAnalyticsData] = useState({});
  const [lastUpdated, setLastUpdated] = useState(new Date());

  const calculateAnalytics = () => {
    const totalUnits = properties.reduce((acc, prop) => acc + (prop.units || 0), 0);
    const occupiedUnits = properties.reduce((acc, prop) => acc + (prop.occupied || 0), 0);
    const vacantUnits = totalUnits - occupiedUnits;
    const occupancyRate = totalUnits > 0 ? Math.round((occupiedUnits / totalUnits) * 100) : 0;
      
    // Calculate revenue metrics
    const totalRevenue = properties.reduce((acc, prop) => acc + (prop.monthlyRevenue || 0), 0);
    const averageRent = tenants.length > 0 ? 
      tenants.reduce((acc, tenant) => acc + (tenant.rent || 0), 0) / tenants.length : 0;
    
    // Property performance metrics
    const propertyMetrics = properties.map(property => {
      const propertyTenants = tenants.filter(t => t.property === property.name && t.status === 'Current');
      const propertyOccupancyRate = property.units > 0 ? (property.occupied / property.units) * 100 : 0;
      
      return {
        ...property,
        occupancyRate: propertyOccupancyRate,
        tenantCount: propertyTenants.length,
        revenuePerUnit: property.units > 0 ? property.monthlyRevenue / property.units : 0
      };
    });

    setAnalyticsData({
      totalUnits,
      occupiedUnits,
      vacantUnits,
      occupancyRate,
      totalRevenue,
      averageRent,
      propertyMetrics
    });
  };

  // ✅ FIX: Use useEffect properly
  useEffect(() => {
    calculateAnalytics();
    setLastUpdated(new Date());
  }, [properties, tenants]);

  const refreshData = () => {
    calculateAnalytics();
    setLastUpdated(new Date());
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h2>
          <p className="text-gray-600">Detailed insights into your property portfolio</p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-sm text-gray-500">Last updated</p>
            <p className="text-sm font-medium text-gray-900">
              {lastUpdated.toLocaleTimeString()}
            </p>
          </div>
          
          <button
            onClick={refreshData}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center transition-colors"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh Data
          </button>
        </div>
      </div>
      
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center mb-2">
            <Building className="w-5 h-5 text-blue-600 mr-2" />
            <h3 className="text-sm font-medium text-gray-600">Total Units</h3>
          </div>
          <p className="text-3xl font-bold text-gray-900">{analyticsData.totalUnits || 0}</p>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center mb-2">
            <Users className="w-5 h-5 text-green-600 mr-2" />
            <h3 className="text-sm font-medium text-gray-600">Occupied Units</h3>
          </div>
          <p className="text-3xl font-bold text-green-600">{analyticsData.occupiedUnits || 0}</p>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center mb-2">
            <Building className="w-5 h-5 text-orange-600 mr-2" />
            <h3 className="text-sm font-medium text-gray-600">Vacant Units</h3>
          </div>
          <p className="text-3xl font-bold text-orange-600">{analyticsData.vacantUnits || 0}</p>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center mb-2">
            <TrendingUp className="w-5 h-5 text-blue-600 mr-2" />
            <h3 className="text-sm font-medium text-gray-600">Occupancy Rate</h3>
          </div>
          <p className="text-3xl font-bold text-blue-600">{analyticsData.occupancyRate || 0}%</p>
        </div>
      </div>

      {/* Revenue Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Total Monthly Revenue</h3>
          <p className="text-2xl font-bold text-green-600">
            ${analyticsData.totalRevenue?.toLocaleString() || 0}
          </p>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Average Rent per Unit</h3>
          <p className="text-2xl font-bold text-blue-600">
            ${analyticsData.averageRent?.toFixed(0) || 0}
          </p>
        </div>
      </div>

      {/* ✅ SIMPLE OCCUPANCY CHART */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-semibold mb-4">Occupancy Overview</h3>
        <div className="flex items-center justify-center space-x-8">
          <div className="text-center">
            <div className="w-24 h-24 rounded-full bg-green-100 flex items-center justify-center mb-2">
              <span className="text-2xl font-bold text-green-600">
                {analyticsData.occupancyRate || 0}%
              </span>
            </div>
            <p className="text-sm text-gray-600">Occupied</p>
          </div>
          
          <div className="text-center">
            <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center mb-2">
              <span className="text-2xl font-bold text-gray-600">
                {100 - (analyticsData.occupancyRate || 0)}%
              </span>
            </div>
            <p className="text-sm text-gray-600">Vacant</p>
          </div>
        </div>
      </div>

      {/* Property Performance Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-semibold mb-4">Property Performance</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Property</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Units</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Occupied</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Occupancy Rate</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Monthly Revenue</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Revenue/Unit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {analyticsData.propertyMetrics?.length > 0 ? analyticsData.propertyMetrics.map(property => (
                <tr key={property.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{property.name}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{property.units || 0}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{property.occupied || 0}</td>
                  <td className="px-6 py-4 text-sm">
                    <div className="flex items-center">
                      <span className="text-gray-900 mr-2">{property.occupancyRate?.toFixed(1) || 0}%</span>
                      <div className="w-16 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${Math.min(property.occupancyRate || 0, 100)}%` }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">
                    ${(property.monthlyRevenue || 0).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    ${(property.revenuePerUnit || 0).toFixed(0)}
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                    No properties to analyze
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-semibold mb-4">Portfolio Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <p className="text-3xl font-bold text-gray-900">{properties.length}</p>
            <p className="text-sm text-gray-600">Total Properties</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-blue-600">{tenants.length}</p>
            <p className="text-sm text-gray-600">Active Tenants</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-green-600">
              ${(analyticsData.totalRevenue || 0).toLocaleString()}
            </p>
            <p className="text-sm text-gray-600">Monthly Revenue</p>
          </div>
        </div>
      </div>
    </div>
  );
};
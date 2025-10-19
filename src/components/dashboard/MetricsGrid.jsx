import React from 'react';
import { Building, Key, DollarSign, Users, TrendingUp } from 'lucide-react';
import { MetricCard } from './MetricCard';

export const MetricsGrid = ({ properties, stats, financialStats, openModal }) => {
  // Calculate occupancy rate for properties overview
  const totalUnits = properties.reduce((sum, p) => sum + p.units, 0);
  const occupiedUnits = properties.reduce((sum, p) => sum + p.occupied, 0);
  const occupancyRate = totalUnits > 0 ? (occupiedUnits / totalUnits) * 100 : 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {/* Total Properties */}
      <MetricCard
        icon={Building}
        iconColor="bg-blue-100"
        title="Total Properties"
        value={properties.length}
        badge="Click to view details"
        onClick={() => openModal('viewPropertiesOverview')}
      >
        <div className="flex items-center text-sm text-green-600">
          <TrendingUp className="w-4 h-4 mr-1" />
          {occupancyRate.toFixed(1)}% occupancy rate
        </div>
      </MetricCard>

      {/* Total Units */}
      <MetricCard
        icon={Key}
        iconColor="bg-green-100"
        title="Total Units"
        value={stats.totalUnits || 0}
        badge={`${stats.occupancyRate || 0}% filled`}
        subtitle={`${stats.occupiedUnits || 0} occupied • ${(stats.totalUnits || 0) - (stats.occupiedUnits || 0)} vacant`}
        onClick={() => openModal('viewTotalUnits')}
      />

      {/* Monthly Revenue */}
      <MetricCard
        icon={DollarSign}
        iconColor="bg-yellow-100"
        title="Monthly Revenue"
        value={`$${financialStats.monthlyIncome.toLocaleString()}`}
        badge={`${financialStats.netIncome > 0 ? '+' : ''}${financialStats.monthlyIncome > 0 ? ((financialStats.netIncome / financialStats.monthlyIncome) * 100).toFixed(1) : 0}% margin`}
        onClick={() => openModal('viewMonthlyRevenue')}
      >
        <div className="flex items-center text-sm text-green-600">
          <TrendingUp className="w-4 h-4 mr-1" />
          ${financialStats.netIncome.toLocaleString()} net income
        </div>
      </MetricCard>

      {/* Occupancy Rate */}
      <MetricCard
        icon={Users}
        iconColor="bg-purple-100"
        title="View Occupancy Rate"
        value={`${stats.occupancyRate || 0}%`}
        badge={`${stats.occupancyRate || 0}%`}
        onClick={() => openModal('viewOccupancyRate')}
      >
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-purple-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${stats.occupancyRate || 0}%` }}
          ></div>
        </div>
      </MetricCard>
    </div>
  );
};
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

// Chart component that works with your Reports data
export const ReportCharts = ({ reportData, reportType, properties = [], tenants = [] }) => {
  
  // Helper function to format property names (First word + first letter)
  const formatPropertyName = (name) => {
    if (!name) return 'Property';
    const words = name.trim().split(/\s+/);
    if (words.length === 1) return words[0];
    return `${words[0]} ${words[1][0]}.`;
  };

  // Generate chart data based on report type
  const generateChartData = () => {
    switch(reportType) {
      case 'financial':
        // Bar Chart: Revenue by Property
        const revenueData = properties.map(prop => ({
          name: formatPropertyName(prop.name),
          revenue: prop.monthlyRevenue || 0,
          units: prop.units || 0
        }));

        // Pie Chart: Revenue Distribution
        const revenuePieData = properties.map((prop, index) => ({
          name: formatPropertyName(prop.name),
          value: prop.monthlyRevenue || 0
        })).filter(item => item.value > 0);

        return { barData: revenueData, pieData: revenuePieData };

      case 'occupancy':
        // Bar Chart: Occupancy by Property
        const occupancyData = properties.map(prop => ({
          name: formatPropertyName(prop.name),
          occupied: prop.occupied || 0,
          vacant: (prop.units || 0) - (prop.occupied || 0),
          total: prop.units || 0
        }));

        // Pie Chart: Overall Occupancy
        const totalUnits = properties.reduce((sum, p) => sum + (p.units || 0), 0);
        const totalOccupied = properties.reduce((sum, p) => sum + (p.occupied || 0), 0);
        const occupancyPieData = [
          { name: 'Occupied', value: totalOccupied },
          { name: 'Vacant', value: totalUnits - totalOccupied }
        ];

        return { barData: occupancyData, pieData: occupancyPieData };

      case 'performance':
        // Bar Chart: ROI by Property
        const performanceData = properties.map(prop => {
          const annualRevenue = (prop.monthlyRevenue || 0) * 12;
          const purchasePrice = prop.purchasePrice || 1;
          const roi = ((annualRevenue / purchasePrice) * 100);

          return {
            name: formatPropertyName(prop.name),
            roi: roi.toFixed(1),
            revenue: prop.monthlyRevenue || 0
          };
        });

        // Pie Chart: Portfolio Value Distribution
        const portfolioPieData = properties.map((prop, index) => ({
          name: formatPropertyName(prop.name),
          value: prop.purchasePrice || 0
        })).filter(item => item.value > 0);

        return { barData: performanceData, pieData: portfolioPieData };

      default:
        return { barData: [], pieData: [] };
    }
  };

  const { barData, pieData } = generateChartData();
  
  // Colors for charts
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

  return (
    <div className="grid grid-cols-1 gap-6 mt-6">
      
      {/* Bar Chart */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-lg font-semibold mb-4">
          {reportType === 'financial' && 'Revenue by Property'}
          {reportType === 'occupancy' && 'Occupancy Status'}
          {reportType === 'performance' && 'ROI Performance'}
        </h3>
        
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={barData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            
            {reportType === 'financial' && (
              <Bar dataKey="revenue" fill="#0088FE" name="Monthly Revenue ($)" />
            )}
            
            {reportType === 'occupancy' && (
              <>
                <Bar dataKey="occupied" stackId="a" fill="#00C49F" name="Occupied" />
                <Bar dataKey="vacant" stackId="a" fill="#FF8042" name="Vacant" />
              </>
            )}
            
            {reportType === 'performance' && (
              <Bar dataKey="roi" fill="#8884d8" name="ROI %" />
            )}
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Pie Chart */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-lg font-semibold mb-4">
          {reportType === 'financial' && 'Revenue Distribution'}
          {reportType === 'occupancy' && 'Overall Occupancy'}
          {reportType === 'performance' && 'Portfolio Value'}
        </h3>
        
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={pieData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({name, percent}) => `${name}: ${(percent * 80).toFixed(0)}%`}
              outerRadius={60}
              fill="#8884d8"
              dataKey="value"
            >
              {pieData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip formatter={(value, name) => [
              reportType === 'financial' ? `$${value.toLocaleString()}` : value.toLocaleString(),
              name
            ]} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
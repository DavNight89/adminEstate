import React from 'react';
import { PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { Home, Key, Clock, DollarSign } from 'lucide-react';
// Update your OccupancyCharts.js components to accept and use props:

export const OccupancyMetrics = ({ properties = [], tenants = [] }) => {
  // Calculate real metrics from props
  const totalUnits = properties.reduce((acc, prop) => acc + (prop.units || 0), 0);
  const occupiedUnits = properties.reduce((acc, prop) => acc + (prop.occupied || 0), 0);
  const occupancyRate = totalUnits > 0 ? Math.round((occupiedUnits / totalUnits) * 100) : 0;
  const vacantUnits = totalUnits - occupiedUnits;
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
      <div className="bg-white p-6 rounded-xl shadow-sm border">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">Overall Occupancy</p>
            <p className="text-3xl font-bold text-green-600">{occupancyRate}%</p>
            <p className="text-sm text-green-600">Real-time data</p>
          </div>
          <div className="p-3 bg-green-100 rounded-full">
            <Home className="w-6 h-6 text-green-600" />
          </div>
        </div>
      </div>
      
      <div className="bg-white p-6 rounded-xl shadow-sm border">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">Vacant Units</p>
            <p className="text-3xl font-bold text-red-600">{vacantUnits}</p>
            <p className="text-sm text-red-600">Available now</p>
          </div>
          <div className="p-3 bg-red-100 rounded-full">
            <Key className="w-6 h-6 text-red-600" />
          </div>
        </div>
      </div>
      
      <div className="bg-white p-6 rounded-xl shadow-sm border">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">Total Properties</p>
            <p className="text-3xl font-bold text-yellow-600">{properties.length}</p>
            <p className="text-sm text-yellow-600">In portfolio</p>
          </div>
          <div className="p-3 bg-yellow-100 rounded-full">
            <Clock className="w-6 h-6 text-yellow-600" />
          </div>
        </div>
      </div>
      
      <div className="bg-white p-6 rounded-xl shadow-sm border">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">Total Revenue</p>
            <p className="text-3xl font-bold text-blue-600">
              ${properties.reduce((acc, prop) => acc + (prop.monthlyRevenue || 0), 0).toLocaleString()}
            </p>
            <p className="text-sm text-blue-600">Monthly income</p>
          </div>
          <div className="p-3 bg-blue-100 rounded-full">
            <DollarSign className="w-6 h-6 text-blue-600" />
          </div>
        </div>
      </div>
    </div>
  );
};

export const OccupancyDonutChart = ({ properties = [] }) => {
  // Calculate real occupancy data
  const totalUnits = properties.reduce((acc, prop) => acc + (prop.units || 0), 0);
  const occupiedUnits = properties.reduce((acc, prop) => acc + (prop.occupied || 0), 0);
  const vacantUnits = totalUnits - occupiedUnits;
  
  const occupancyData = totalUnits > 0 ? [
    { name: 'Occupied', value: Math.round((occupiedUnits / totalUnits) * 100), color: '#10B981' },
    { name: 'Vacant', value: Math.round((vacantUnits / totalUnits) * 100), color: '#EF4444' }
  ] : [
    { name: 'No Data', value: 100, color: '#9CA3AF' }
  ];

  return (
    <div className="h-full">
      {totalUnits > 0 ? (
        <>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={occupancyData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={5}
                dataKey="value"
              >
                {occupancyData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => [`${value}%`, 'Percentage']} />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex justify-center space-x-6 mt-4">
            {occupancyData.map((item, index) => (
              <div key={index} className="flex items-center">
                <div 
                  className="w-3 h-3 rounded-full mr-2" 
                  style={{ backgroundColor: item.color }}
                ></div>
                <span className="text-sm text-gray-600">{item.name}: {item.value}%</span>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="flex items-center justify-center h-64 text-gray-500">
          <div className="text-center">
            <Home className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>No property data available</p>
            <p className="text-sm">Add properties to see occupancy distribution</p>
          </div>
        </div>
      )}
    </div>
  );
};

export const OccupancyTrendChart = ({ properties = [] }) => {
  // For now, show a placeholder since we don't have historical data
  const placeholderData = [
    { month: 'Jan', occupancy: 0 },
    { month: 'Feb', occupancy: 0 },
    { month: 'Mar', occupancy: 0 },
    { month: 'Apr', occupancy: 0 },
    { month: 'May', occupancy: 0 },
    { month: 'Jun', occupancy: 0 }
  ];

  const currentOccupancy = properties.length > 0 ? 
    Math.round((properties.reduce((acc, prop) => acc + (prop.occupied || 0), 0) / 
               properties.reduce((acc, prop) => acc + (prop.units || 0), 0)) * 100) : 0;

  return (
    <div className="h-full">
      {properties.length > 0 ? (
        <>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={placeholderData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis domain={[0, 100]} />
              <Tooltip formatter={(value) => [`${value}%`, 'Occupancy Rate']} />
              <Line 
                type="monotone" 
                dataKey="occupancy" 
                stroke="#3B82F6" 
                strokeWidth={3}
                dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
          <div className="mt-4 text-center">
            <p className="text-sm text-gray-600">Current Occupancy: {currentOccupancy}%</p>
            <p className="text-xs text-gray-500">Historical trend data will appear as you use the app</p>
          </div>
        </>
      ) : (
        <div className="flex items-center justify-center h-64 text-gray-500">
          <div className="text-center">
            <Clock className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>No trend data available</p>
            <p className="text-sm">Add properties to see occupancy trends</p>
          </div>
        </div>
      )}
    </div>
  );
};

export const OccupancyByPropertyChart = ({ properties = [] }) => {
  const propertyData = properties.map(property => ({
    property: property.name,
    occupied: property.occupied || 0,
    total: property.units || 0,
    rate: property.units > 0 ? Math.round((property.occupied / property.units) * 100) : 0
  }));

  return (
    <div className="h-full">
      {properties.length > 0 ? (
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={propertyData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="property" />
            <YAxis domain={[0, 100]} />
            <Tooltip formatter={(value) => [`${value}%`, 'Occupancy Rate']} />
            <Bar dataKey="rate" fill="#10B981" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      ) : (
        <div className="flex items-center justify-center h-64 text-gray-500">
          <div className="text-center">
            <Home className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>No property data available</p>
            <p className="text-sm">Add properties to see individual occupancy rates</p>
          </div>
        </div>
      )}
    </div>
  );
};
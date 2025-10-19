import React from 'react';

export const MetricCard = ({ 
  icon: Icon, 
  iconColor, 
  title, 
  value, 
  subtitle, 
  badge, 
  onClick,
  children 
}) => {
  return (
    <div 
      onClick={onClick}
      className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow cursor-pointer"
    >
      <div className="flex items-center justify-between mb-4">
        <div className={`p-2 ${iconColor} rounded-lg`}>
          <Icon className={`w-6 h-6 ${iconColor.replace('bg-', 'text-').replace('100', '600')}`} />
        </div>
        {badge && (
          <span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded-full">
            {badge}
          </span>
        )}
      </div>
      
      <h3 className="text-sm font-medium text-gray-600 mb-1">{title}</h3>
      <p className="text-2xl font-bold text-gray-900 mb-2">{value}</p>
      
      {subtitle && (
        <div className="text-sm text-gray-600">
          {subtitle}
        </div>
      )}
      
      {children}
    </div>
  );
};
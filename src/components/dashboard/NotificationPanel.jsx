import React from 'react';
import { Bell, AlertTriangle, Clock, CheckCircle } from 'lucide-react';

export const NotificationPanel = ({ stats, notifications }) => {
  const getNotificationStyle = (type) => {
    switch (type) {
      case 'warning':
        return {
          container: 'bg-yellow-50 border-yellow-200',
          text: 'text-yellow-800',
          subtext: 'text-yellow-600',
          dot: 'bg-yellow-600'
        };
      case 'alert':
        return {
          container: 'bg-red-50 border-red-200',
          text: 'text-red-800',
          subtext: 'text-red-600',
          dot: 'bg-red-600'
        };
      default:
        return {
          container: 'bg-blue-50 border-blue-200',
          text: 'text-blue-800',
          subtext: 'text-blue-600',
          dot: 'bg-blue-600'
        };
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <h3 className="text-lg font-semibold mb-4 flex items-center">
        <Bell className="w-5 h-5 mr-2 text-orange-600" />
        Alerts & Notifications
      </h3>
      <div className="space-y-3">
        {/* Urgent Work Orders */}
        {stats.urgentWorkOrders > 0 && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center">
              <AlertTriangle className="w-4 h-4 text-red-600 mr-2" />
              <span className="text-sm font-medium text-red-800">
                {stats.urgentWorkOrders} urgent work orders
              </span>
            </div>
          </div>
        )}
        
        {/* Overdue Payments */}
        {stats.overduePayments > 0 && (
          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center">
              <Clock className="w-4 h-4 text-yellow-600 mr-2" />
              <span className="text-sm font-medium text-yellow-800">
                {stats.overduePayments} overdue payments
              </span>
            </div>
          </div>
        )}

        {/* Dynamic Notifications */}
        {notifications.length > 0 ? (
          notifications.map(notification => {
            const styles = getNotificationStyle(notification.type);
            return (
              <div key={notification.id} className={`p-3 border rounded-lg ${styles.container}`}>
                <div className="flex items-start justify-between">
                  <div className="flex items-center">
                    <div className={`w-2 h-2 rounded-full mr-2 mt-1 ${styles.dot}`}></div>
                    <div>
                      <p className={`text-sm font-medium ${styles.text}`}>
                        {notification.message}
                      </p>
                      <p className={`text-xs ${styles.subtext}`}>
                        {notification.time}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          /* All Clear Message */
          <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center">
              <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
              <span className="text-sm font-medium text-green-800">
                All caught up! No urgent notifications.
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
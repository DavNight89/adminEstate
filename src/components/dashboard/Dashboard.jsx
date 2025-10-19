import React from 'react';
import { WelcomeHeader } from './WelcomeHeader';
import { GettingStarted } from './GettingStarted';
import { MetricsGrid } from './MetricsGrid';
import { QuickActions } from './QuickActions';
import { NotificationPanel } from './NotificationPanel';
import { RecentWorkOrders } from './RecentWorkOrders';

export const Dashboard = ({ 
  properties, 
  tenants, 
  workOrders, 
  openModal, 
  setActiveTab, 
  getQuickStats, 
  getComprehensiveFinancialStats,
  getDynamicNotifications,
  showTips,
  setShowTips 
}) => {
  const stats = getQuickStats();
  const financialStats = getComprehensiveFinancialStats();
  const dynamicNotifications = getDynamicNotifications();
  const hasData = properties.length > 0;

  return (
    <div className="space-y-8">
      <WelcomeHeader 
        hasProperties={hasData}
        showTips={showTips}
        setShowTips={setShowTips}
      />

      {!hasData ? (
        <GettingStarted 
          openModal={openModal}
          setShowTips={setShowTips}
        />
      ) : (
        <>
          <MetricsGrid 
            properties={properties}
            stats={stats}
            financialStats={financialStats}
            openModal={openModal}
          />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <QuickActions 
              openModal={openModal}
              setActiveTab={setActiveTab}
            />
            
            <NotificationPanel 
              stats={stats}
              notifications={dynamicNotifications}
            />
            
            <RecentWorkOrders 
              workOrders={workOrders}
              openModal={openModal}
              setActiveTab={setActiveTab}
            />
          </div>
        </>
      )}
    </div>
  );
};
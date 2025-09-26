export const calculateLeaseMetrics = (tenants, properties) => {
  const activeLeases = tenants.filter(tenant => tenant.status === 'Current').length;
  const totalLeases = tenants.length;
  const expiredLeases = tenants.filter(tenant => {
    if (!tenant.leaseEnd) return false;
    return new Date(tenant.leaseEnd) < new Date();
  }).length;
  
  const expiringInNext30Days = tenants.filter(tenant => {
    if (!tenant.leaseEnd) return false;
    const leaseEnd = new Date(tenant.leaseEnd);
    const today = new Date();
    const thirtyDaysFromNow = new Date(today.getTime() + (30 * 24 * 60 * 60 * 1000));
    return leaseEnd >= today && leaseEnd <= thirtyDaysFromNow;
  }).length;

  return {
    activeLeases,
    totalLeases,
    expiredLeases,
    expiringInNext30Days
  };
};
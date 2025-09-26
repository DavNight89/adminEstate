// Move these functions from your main file:
export const calculateRevenueMetrics = (properties, tenants, transactions) => {
  const currentRevenue = properties.reduce((acc, prop) => acc + (prop.monthlyRevenue || 0), 0);
  const potentialRevenue = properties.reduce((acc, prop) => acc + (prop.units * 1500), 0);
  
  return {
    totalRevenue: currentRevenue,
    potentialRevenue,
    revenueEfficiency: (currentRevenue / potentialRevenue) * 100,
    avgRevenuePerUnit: currentRevenue / properties.reduce((acc, prop) => acc + prop.units, 0),
    vacancyLoss: potentialRevenue - currentRevenue
  };
};

export const calculateCollectionRate = (transactions) => {
  const rentCharges = transactions.filter(t => t.type === 'income' && t.description.includes('Rent'));
  const rentCollected = rentCharges.reduce((sum, t) => sum + t.amount, 0);
  const rentCharged = rentCharges.length * 1500;
  return rentCharged > 0 ? (rentCollected / rentCharged) * 100 : 100;
};

export const generateRevenueProjections = (currentRevenue, growthRate = 0.05) => {
  return {
    month3: currentRevenue * 3 * (1 + growthRate/4),
    month6: currentRevenue * 6 * (1 + growthRate/2),
    year1: currentRevenue * 12 * (1 + growthRate),
    year2: currentRevenue * 24 * (1 + growthRate) * (1 + growthRate * 0.8)
  };
};
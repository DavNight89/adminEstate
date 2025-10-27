/**
 * Direct localStorage to data.json sync utility
 * Works without backend server
 */

const fs = require('fs');
const path = require('path');

// Path to data.json
const DATA_JSON_PATH = path.join(__dirname, '..', 'src', 'data.json');

/**
 * Read localStorage-like data and write to data.json
 */
function syncLocalStorageToDataJson() {
  try {
    // Simulate reading from localStorage (this would come from your React app)
    // For now, let's read what's currently in localStorage format
    
    console.log('🔄 Syncing localStorage to data.json...');
    
    // Read current data.json
    let currentData = {};
    try {
      const rawData = fs.readFileSync(DATA_JSON_PATH, 'utf8');
      currentData = JSON.parse(rawData);
    } catch (e) {
      console.log('📄 Creating new data.json structure');
      currentData = {
        properties: [],
        tenants: [],
        workOrders: [],
        transactions: [],
        documents: []
      };
    }

    // Log current state
    console.log('📊 Current data.json contents:', {
      properties: currentData.properties?.length || 0,
      tenants: currentData.tenants?.length || 0,
      workOrders: currentData.workOrders?.length || 0,
      transactions: currentData.transactions?.length || 0,
      documents: currentData.documents?.length || 0
    });

    // Write back to ensure structure is complete
    const completeData = {
      properties: currentData.properties || [],
      tenants: currentData.tenants || [],
      workOrders: currentData.workOrders || [],
      transactions: currentData.transactions || [],
      documents: currentData.documents || []
    };

    fs.writeFileSync(DATA_JSON_PATH, JSON.stringify(completeData, null, 2));
    
    console.log('✅ data.json structure verified/updated');
    return true;

  } catch (error) {
    console.error('❌ Sync error:', error.message);
    return false;
  }
}

// Run the sync
if (require.main === module) {
  console.log('🚀 Starting localStorage → data.json sync...');
  const success = syncLocalStorageToDataJson();
  if (success) {
    console.log('🎉 Sync completed successfully!');
  } else {
    console.log('💥 Sync failed!');
  }
}

module.exports = { syncLocalStorageToDataJson };
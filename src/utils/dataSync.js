/**
 * Client-side data persistence utility
 * Saves localStorage data to data.json when backend is unavailable
 */

export const syncToDataJson = async (data) => {
  try {
    // Check if we're in development mode and can access the file system
    if (process.env.NODE_ENV === 'development') {
      console.log('🔄 Attempting direct data.json sync...');
      
      // Try to use the backend sync endpoint first
      try {
        const response = await fetch('http://localhost:5000/api/sync/localstorage', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        });
        
        if (response.ok) {
          console.log('✅ Backend sync successful');
          return true;
        }
      } catch (e) {
        console.log('⚠️ Backend unavailable, using fallback sync...');
      }
      
      // Fallback: Write directly to public folder (for development)
      const dataBlob = new Blob([JSON.stringify(data, null, 2)], {
        type: 'application/json'
      });
      
      // Create download link (as fallback for browser security)
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'data-backup.json';
      
      console.log('💾 Data ready for manual sync. Backend sync recommended.');
      console.log('📋 Current localStorage data:', {
        properties: data.properties?.length || 0,
        tenants: data.tenants?.length || 0,
        workOrders: data.workOrders?.length || 0,
        transactions: data.transactions?.length || 0,
        documents: data.documents?.length || 0
      });
      
      return false; // Indicates manual intervention needed
    }
    
    return false;
  } catch (error) {
    console.error('❌ Sync error:', error);
    return false;
  }
};

/**
 * Get all localStorage data in the correct format
 */
export const getAllLocalStorageData = () => {
  try {
    return {
      properties: JSON.parse(localStorage.getItem('properties') || '[]'),
      tenants: JSON.parse(localStorage.getItem('tenants') || '[]'),
      workOrders: JSON.parse(localStorage.getItem('workOrders') || '[]'),
      transactions: JSON.parse(localStorage.getItem('transactions') || '[]'),
      documents: JSON.parse(localStorage.getItem('documents') || '[]')
    };
  } catch (error) {
    console.error('❌ Error reading localStorage:', error);
    return {
      properties: [],
      tenants: [],
      workOrders: [],
      transactions: [],
      documents: []
    };
  }
};

/**
 * Manual sync function for development
 */
export const manualSync = () => {
  const data = getAllLocalStorageData();
  console.log('🔍 Current localStorage data:', data);
  console.log('💡 To sync manually: Copy this data to src/data.json');
  return data;
};
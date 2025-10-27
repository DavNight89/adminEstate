/**
 * Manual Data Sync Utility - Run this in browser console
 * Copies localStorage data to help update data.json manually
 */

function manualDataSync() {
  console.log('🔍 Reading localStorage data...');
  
  const localStorageData = {
    properties: JSON.parse(localStorage.getItem('properties') || '[]'),
    tenants: JSON.parse(localStorage.getItem('tenants') || '[]'),
    workOrders: JSON.parse(localStorage.getItem('workOrders') || '[]'),
    transactions: JSON.parse(localStorage.getItem('transactions') || '[]'),
    documents: JSON.parse(localStorage.getItem('documents') || '[]')
  };
  
  console.log('📊 Current localStorage contents:', {
    properties: localStorageData.properties.length,
    tenants: localStorageData.tenants.length,
    workOrders: localStorageData.workOrders.length,
    transactions: localStorageData.transactions.length,
    documents: localStorageData.documents.length
  });
  
  console.log('📋 Complete localStorage data:');
  console.log(JSON.stringify(localStorageData, null, 2));
  
  console.log('💡 To sync manually:');
  console.log('1. Copy the JSON above');
  console.log('2. Replace contents of src/data.json with this data');
  console.log('3. Save the file');
  
  // Also create a downloadable backup
  const dataStr = JSON.stringify(localStorageData, null, 2);
  const dataBlob = new Blob([dataStr], {type: 'application/json'});
  const url = URL.createObjectURL(dataBlob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = 'localStorage-backup.json';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
  
  console.log('💾 localStorage backup downloaded as localStorage-backup.json');
  
  return localStorageData;
}

// Instructions for use
console.log('🚀 Manual Data Sync Utility Loaded');
console.log('📞 Run: manualDataSync() to extract your localStorage data');

// Make function globally available
window.manualDataSync = manualDataSync;
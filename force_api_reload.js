// Force Flask API Integration Script
// Run this in your React app's browser console to force API reload

console.log('🔄 Forcing React to reload from Flask API...');

// Clear all localStorage data
localStorage.clear();
sessionStorage.clear();

// Force re-fetch from API by reloading page
console.log('✅ Storage cleared. Reloading page to fetch from Flask API...');
window.location.reload();
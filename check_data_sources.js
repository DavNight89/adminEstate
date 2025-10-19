// Data Loading Verification Script
// Run this in your React app console to see current data sources

console.log('🔍 CHECKING CURRENT DATA SOURCES');
console.log('=' .repeat(40));

// Check localStorage
const localProperties = localStorage.getItem('properties');
const localPropsCount = localProperties ? JSON.parse(localProperties).length : 0;
console.log(`📱 localStorage properties: ${localPropsCount}`);

// Check sessionStorage  
const sessionProperties = sessionStorage.getItem('properties');
const sessionPropsCount = sessionProperties ? JSON.parse(sessionProperties).length : 0;
console.log(`🗂️ sessionStorage properties: ${sessionPropsCount}`);

// Test Flask API
async function checkFlaskAPI() {
    try {
        const response = await fetch('http://localhost:5000/api/properties');
        const data = await response.json();
        const apiPropsCount = data.data ? data.data.length : 0;
        console.log(`🌐 Flask API properties: ${apiPropsCount}`);
        console.log(`📊 Flask API source: ${data.source || 'unknown'}`);
        
        if (apiPropsCount > 0) {
            console.log('✅ Sample property from Flask:', data.data[0].name);
        }
    } catch (error) {
        console.log(`❌ Flask API error: ${error.message}`);
    }
}

checkFlaskAPI();

// Check what data the React app is actually displaying
console.log('🎯 What React is actually using:');
// This will show in the React DevTools components
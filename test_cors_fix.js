// CORS Fix Test Script
// Run this in your React app's browser console to test CORS

console.log('🧪 Testing CORS connection to Flask backend...');

async function testCORS() {
    try {
        // Test 1: Simple CORS test endpoint
        console.log('1️⃣ Testing CORS test endpoint...');
        const corsResponse = await fetch('http://localhost:5000/api/cors-test');
        const corsData = await corsResponse.json();
        console.log('✅ CORS Test Success:', corsData);
        
        // Test 2: Properties endpoint  
        console.log('2️⃣ Testing properties endpoint...');
        const propertiesResponse = await fetch('http://localhost:5000/api/properties');
        const propertiesData = await propertiesResponse.json();
        console.log('✅ Properties API Success:', {
            success: propertiesData.success,
            count: propertiesData.data?.length || 0,
            source: propertiesData.source
        });
        
        // Test 3: OPTIONS preflight
        console.log('3️⃣ Testing OPTIONS preflight...');
        const optionsResponse = await fetch('http://localhost:5000/api/properties', {
            method: 'OPTIONS'
        });
        console.log('✅ OPTIONS Success:', optionsResponse.status);
        
        console.log('🎉 All CORS tests passed! Flask backend is accessible.');
        return true;
        
    } catch (error) {
        console.error('❌ CORS Test Failed:', error);
        
        if (error.message.includes('CORS')) {
            console.log('🔧 CORS is still blocked. Try restarting Flask server.');
        } else if (error.message.includes('fetch')) {
            console.log('🔧 Flask server might not be running on port 5000.');
        }
        
        return false;
    }
}

// Run the test
testCORS();
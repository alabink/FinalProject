const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api';

const checkEndpoint = async (url, method = 'get', data = null) => {
    try {
        console.log(`Checking ${method.toUpperCase()} ${url}...`);
        
        const options = {
            method,
            url: `${BASE_URL}${url}`,
            ...(data && { data })
        };
        
        const response = await axios(options);
        console.log(`✅ ${method.toUpperCase()} ${url} - Status: ${response.status}`);
        return true;
    } catch (error) {
        console.error(`❌ ${method.toUpperCase()} ${url} - Error: ${error.response?.status || error.message}`);
        if (error.response?.data) {
            console.error('Response data:', error.response.data);
        }
        return false;
    }
};

const checkRecommendationEndpoints = async () => {
    console.log('\n=== Checking Recommendation API Endpoints ===\n');
    
    // Check popular products endpoint (doesn't require authentication)
    await checkEndpoint('/popular-products');
    
    // These endpoints require authentication, so they might fail without a valid token
    console.log('\n--- The following endpoints require authentication ---');
    
    // Check track interaction endpoint
    await checkEndpoint('/track-interaction', 'post', {
        userId: '123', // Replace with a valid user ID
        productId: '456', // Replace with a valid product ID
        type: 'view'
    });
    
    // Check recommendations endpoint
    await checkEndpoint('/recommendations/123'); // Replace 123 with a valid user ID
};

checkRecommendationEndpoints().then(() => {
    console.log('\nEndpoint check complete!');
    console.log('\nIf endpoints are failing, check:');
    console.log('1. Is the server running?');
    console.log('2. Are the routes properly configured?');
    console.log('3. Are there any errors in the server logs?');
}); 
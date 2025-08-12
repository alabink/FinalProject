const mongoose = require('mongoose');
require('dotenv').config();

// Import chatbot functions
const { askQuestion, healthCheck, getRelevantProducts } = require('./src/utils/Chatbot');

async function testChatbot() {
    console.log('🧪 Starting Chatbot Test...\n');
    
    try {
        // Test 1: Health Check
        console.log('📋 Test 1: Health Check');
        const health = await healthCheck();
        console.log('Health Status:', health);
        console.log('---\n');
        
        // Test 2: Product Search
        console.log('📋 Test 2: Product Search');
        const testQueries = [
            'iphone',
            'samsung',
            'điện thoại',
            'iPhone 15',
            'Samsung Galaxy'
        ];
        
        for (const query of testQueries) {
            console.log(`🔍 Testing query: "${query}"`);
            const products = await getRelevantProducts(query, 3);
            console.log(`Found ${products.length} products:`);
            products.forEach((product, index) => {
                console.log(`  ${index + 1}. ${product.name} - ${product.brand}`);
                if (product.availableColors && product.availableColors.length > 0) {
                    console.log(`     Colors: ${product.availableColors.join(', ')}`);
                }
                if (product.availableStorages && product.availableStorages.length > 0) {
                    console.log(`     Storage: ${product.availableStorages.join(', ')}`);
                }
            });
            console.log('---');
        }
        
        // Test 3: Chatbot Questions
        console.log('📋 Test 3: Chatbot Questions');
        const testQuestions = [
            'Xin chào',
            'iPhone 15 có mấy màu?',
            'Samsung Galaxy S24 giá bao nhiêu?',
            'Có điện thoại nào dưới 10 triệu không?',
            'iPhone 15 Pro Max có phiên bản 1TB không?'
        ];
        
        for (const question of testQuestions) {
            console.log(`💬 Question: "${question}"`);
            try {
                const answer = await askQuestion(question, 'test-user');
                console.log(`🤖 Answer: ${typeof answer === 'string' ? answer.substring(0, 200) + '...' : JSON.stringify(answer, null, 2)}`);
            } catch (error) {
                console.error(`❌ Error: ${error.message}`);
            }
            console.log('---');
        }
        
        console.log('✅ Chatbot test completed successfully!');
        
    } catch (error) {
        console.error('❌ Test failed:', error);
    } finally {
        // Close database connection
        if (mongoose.connection.readyState === 1) {
            await mongoose.connection.close();
            console.log('🔌 Database connection closed');
        }
        process.exit(0);
    }
}

// Run the test
testChatbot();

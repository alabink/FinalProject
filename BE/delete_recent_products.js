const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const Product = require('./src/models/products.model');
const Category = require('./src/models/category.model');

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.CONNECT_DB, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('✅ Connected to MongoDB');
    } catch (error) {
        console.error('❌ MongoDB connection error:', error);
        process.exit(1);
    }
};

const deleteRecentProducts = async () => {
    try {
        console.log('\n🗑️ STARTING PRODUCT DELETION...\n');
        
        // Get current count
        const currentCount = await Product.countDocuments();
        console.log(`📦 Current total products: ${currentCount}`);
        
        // Get all products sorted by creation date (newest first)
        const allProducts = await Product.find({})
            .sort({ createdAt: -1 })
            .select('name brand createdAt category');
        
        console.log(`🔍 Found ${allProducts.length} total products`);
        
        // Show the most recent products that will be deleted
        console.log('\n📝 Most recent products (will be deleted):');
        allProducts.slice(0, 10).forEach((product, index) => {
            const date = new Date(product.createdAt).toLocaleString('vi-VN');
            console.log(`   ${index + 1}. ${product.brand} ${product.name} (Created: ${date})`);
        });
        
        if (allProducts.length > 10) {
            console.log(`   ... and ${allProducts.length - 10} more products`);
        }
        
        // Ask for confirmation
        console.log('\n⚠️  WARNING: This will delete the most recent products!');
        console.log('📊 Products to delete: 900 (or all if less than 900)');
        console.log('📊 Products to keep: ~48 (original products)');
        
        // For safety, let's delete products created after a specific time
        // We'll delete products created in the last 24 hours (assuming the insertion was recent)
        const cutoffTime = new Date(Date.now() - 24 * 60 * 60 * 1000); // 24 hours ago
        
        const productsToDelete = allProducts.filter(product => 
            new Date(product.createdAt) > cutoffTime
        );
        
        console.log(`\n🗑️  Found ${productsToDelete.length} products created after ${cutoffTime.toLocaleString('vi-VN')}`);
        
        if (productsToDelete.length === 0) {
            console.log('✅ No recent products found to delete');
            return;
        }
        
        // Show what will be deleted
        console.log('\n📋 Products that will be deleted:');
        productsToDelete.slice(0, 5).forEach((product, index) => {
            const date = new Date(product.createdAt).toLocaleString('vi-VN');
            console.log(`   ${index + 1}. ${product.brand} ${product.name} (${date})`);
        });
        
        if (productsToDelete.length > 5) {
            console.log(`   ... and ${productsToDelete.length - 5} more products`);
        }
        
        // Count by category
        const categoryCounts = {};
        for (const product of productsToDelete) {
            const categoryId = product.category.toString();
            categoryCounts[categoryId] = (categoryCounts[categoryId] || 0) + 1;
        }
        
        console.log('\n📊 Products to delete by category:');
        for (const [categoryId, count] of Object.entries(categoryCounts)) {
            console.log(`   Category ${categoryId}: ${count} products`);
        }
        
        // Perform deletion
        console.log('\n🚀 Starting deletion...');
        
        const deleteResult = await Product.deleteMany({
            createdAt: { $gt: cutoffTime }
        });
        
        console.log(`✅ Deletion completed!`);
        console.log(`🗑️  Deleted ${deleteResult.deletedCount} products`);
        
        // Final count
        const finalCount = await Product.countDocuments();
        console.log(`📦 Remaining products: ${finalCount}`);
        
        // Show remaining products
        const remainingProducts = await Product.find({})
            .sort({ createdAt: -1 })
            .select('name brand createdAt')
            .limit(10);
        
        console.log('\n📝 Remaining products:');
        remainingProducts.forEach((product, index) => {
            const date = new Date(product.createdAt).toLocaleString('vi-VN');
            console.log(`   ${index + 1}. ${product.brand} ${product.name} (${date})`);
        });
        
    } catch (error) {
        console.error('❌ Error during deletion:', error);
    } finally {
        await mongoose.disconnect();
        console.log('🔌 Disconnected from MongoDB');
    }
};

// Alternative function to delete by specific date range
const deleteProductsByDateRange = async (startDate, endDate) => {
    try {
        console.log('\n🗑️ DELETING PRODUCTS BY DATE RANGE...\n');
        
        const start = new Date(startDate);
        const end = new Date(endDate);
        
        console.log(`📅 Date range: ${start.toLocaleString('vi-VN')} to ${end.toLocaleString('vi-VN')}`);
        
        // Find products in date range
        const productsInRange = await Product.find({
            createdAt: { $gte: start, $lte: end }
        }).select('name brand createdAt');
        
        console.log(`🔍 Found ${productsInRange.length} products in date range`);
        
        if (productsInRange.length === 0) {
            console.log('✅ No products found in specified date range');
            return;
        }
        
        // Show products to be deleted
        console.log('\n📋 Products to be deleted:');
        productsInRange.slice(0, 10).forEach((product, index) => {
            const date = new Date(product.createdAt).toLocaleString('vi-VN');
            console.log(`   ${index + 1}. ${product.brand} ${product.name} (${date})`);
        });
        
        if (productsInRange.length > 10) {
            console.log(`   ... and ${productsInRange.length - 10} more products`);
        }
        
        // Delete products
        const deleteResult = await Product.deleteMany({
            createdAt: { $gte: start, $lte: end }
        });
        
        console.log(`✅ Deletion completed!`);
        console.log(`🗑️  Deleted ${deleteResult.deletedCount} products`);
        
        // Final count
        const finalCount = await Product.countDocuments();
        console.log(`📦 Remaining products: ${finalCount}`);
        
    } catch (error) {
        console.error('❌ Error during deletion:', error);
    } finally {
        await mongoose.disconnect();
        console.log('🔌 Disconnected from MongoDB');
    }
};

// Function to delete by product names (more specific)
const deleteProductsByNamePattern = async () => {
    try {
        console.log('\n🗑️ DELETING PRODUCTS BY NAME PATTERN...\n');
        
        // Patterns that match the generated products
        const patterns = [
            /iPhone \d+/,           // iPhone with numbers
            /Galaxy S \d+/,         // Galaxy S with numbers
            /Galaxy A \d+/,         // Galaxy A with numbers
            /Redmi \d+/,            // Redmi with numbers
            /POCO \d+/,             // POCO with numbers
            /MacBook Pro \d+/,      // MacBook Pro with numbers
            /MacBook Air \d+/,      // MacBook Air with numbers
            /iPad Pro \d+/,         // iPad Pro with numbers
            /AirPods Pro \d+/,      // AirPods Pro with numbers
            /Apple Watch \d+/       // Apple Watch with numbers
        ];
        
        let totalDeleted = 0;
        
        for (const pattern of patterns) {
            const products = await Product.find({
                name: { $regex: pattern }
            }).select('name brand');
            
            if (products.length > 0) {
                console.log(`🔍 Found ${products.length} products matching pattern: ${pattern}`);
                
                const deleteResult = await Product.deleteMany({
                    name: { $regex: pattern }
                });
                
                console.log(`   ✅ Deleted ${deleteResult.deletedCount} products`);
                totalDeleted += deleteResult.deletedCount;
            }
        }
        
        console.log(`\n🎉 Total deletion completed!`);
        console.log(`🗑️  Total deleted: ${totalDeleted} products`);
        
        // Final count
        const finalCount = await Product.countDocuments();
        console.log(`📦 Remaining products: ${finalCount}`);
        
    } catch (error) {
        console.error('❌ Error during deletion:', error);
    } finally {
        await mongoose.disconnect();
        console.log('🔌 Disconnected from MongoDB');
    }
};

// Main execution
const main = async () => {
    const args = process.argv.slice(2);
    const method = args[0] || 'recent';
    
    switch (method) {
        case 'recent':
            await deleteRecentProducts();
            break;
        case 'date':
            const startDate = args[1];
            const endDate = args[2];
            if (!startDate || !endDate) {
                console.log('Usage: node delete_recent_products.js date "2024-01-01" "2024-01-02"');
                return;
            }
            await deleteProductsByDateRange(startDate, endDate);
            break;
        case 'pattern':
            await deleteProductsByNamePattern();
            break;
        default:
            console.log('Available methods:');
            console.log('  recent  - Delete products created in last 24 hours');
            console.log('  date    - Delete products in specific date range');
            console.log('  pattern - Delete products by name patterns');
            console.log('\nUsage:');
            console.log('  node delete_recent_products.js recent');
            console.log('  node delete_recent_products.js date "2024-01-01" "2024-01-02"');
            console.log('  node delete_recent_products.js pattern');
    }
};

// Run the deletion
connectDB().then(main);

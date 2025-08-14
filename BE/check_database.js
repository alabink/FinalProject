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

const checkDatabase = async () => {
    try {
        console.log('\n📊 CHECKING DATABASE STATUS...\n');
        
        // Count products
        const productCount = await Product.countDocuments();
        console.log(`📦 Total products: ${productCount}`);
        
        // Count categories
        const categoryCount = await Category.countDocuments();
        console.log(`📂 Total categories: ${categoryCount}`);
        
        // Get all categories
        const categories = await Category.find({}).sort({ nameCategory: 1 });
        console.log('\n📂 Categories in database:');
        categories.forEach((cat, index) => {
            console.log(`   ${index + 1}. ${cat.nameCategory} (ID: ${cat._id})`);
        });
        
        // Count products per category
        console.log('\n📊 Products per category:');
        for (const category of categories) {
            const count = await Product.countDocuments({ category: category._id });
            console.log(`   ${category.nameCategory}: ${count} products`);
        }
        
        // Get existing product names to avoid duplicates
        const existingProducts = await Product.find({}, 'name brand');
        console.log(`\n🔍 Found ${existingProducts.length} existing products`);
        
        // Show some existing product names for reference
        console.log('\n📝 Sample existing products:');
        existingProducts.slice(0, 10).forEach((product, index) => {
            console.log(`   ${index + 1}. ${product.brand} ${product.name}`);
        });
        
        if (existingProducts.length > 10) {
            console.log(`   ... and ${existingProducts.length - 10} more products`);
        }
        
        console.log('\n✅ Database check completed!');
        
    } catch (error) {
        console.error('❌ Error checking database:', error);
    } finally {
        await mongoose.disconnect();
        console.log('🔌 Disconnected from MongoDB');
    }
};

// Run the check
connectDB().then(checkDatabase);

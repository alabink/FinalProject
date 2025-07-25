const Mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async () => {
    let connectionAttempts = 0;
    const maxAttempts = 5;
    
    // Check if CONNECT_DB environment variable is set
    const dbUri = process.env.CONNECT_DB;
    if (!dbUri) {
        console.error('CONNECT_DB environment variable is not set!');
        console.warn('Using fallback connection string for development');
        // Using a fallback connection for development
        process.env.CONNECT_DB = 'mongodb://localhost:27017/techify';
    }
    
    while (connectionAttempts < maxAttempts) {
        try {
            console.log(`Attempt ${connectionAttempts + 1}: Connecting to MongoDB at ${process.env.CONNECT_DB}`);
            await Mongoose.connect(process.env.CONNECT_DB, {
                useNewUrlParser: true,
                useUnifiedTopology: true,
                serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
            });
            console.log('MongoDB connected');
            return;
        } catch (error) {
            connectionAttempts++;
            console.error(`Failed to connect to MongoDB (attempt ${connectionAttempts}):`, error.message);
            
            if (connectionAttempts >= maxAttempts) {
                console.error('Maximum connection attempts reached. Giving up...');
                console.error('Please check your MongoDB connection string and ensure the database server is running.');
                // Don't throw the error, just log it and continue
                // The application can still run with limited functionality
                console.warn('Application will continue with limited functionality');
                return;
            }
            
            // Wait before trying again
            console.log(`Waiting 5 seconds before retry...`);
            await new Promise(resolve => setTimeout(resolve, 5000));
        }
    }
};

module.exports = connectDB;

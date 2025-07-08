const Mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async () => {
    let connectionAttempts = 0;
    const maxAttempts = 5;
    
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
                throw error;
            }
            
            // Wait before trying again
            console.log(`Waiting 5 seconds before retry...`);
            await new Promise(resolve => setTimeout(resolve, 5000));
        }
    }
};

module.exports = connectDB;

const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const modelOtp = new Schema(
    {
        email: { type: String, required: true, ref: 'user' },
        otp: { type: String, required: true },
        type: { type: String, required: true, default: 'forgot_password' },
        createdAt: { 
            type: Date, 
            default: Date.now, 
            expires: 300 // 5 minutes in seconds
        }
    },
    {
        timestamps: true,
    },
);

// Index for faster queries
modelOtp.index({ email: 1, type: 1 });
modelOtp.index({ createdAt: 1 }, { expireAfterSeconds: 300 });

module.exports = mongoose.model('otp', modelOtp);

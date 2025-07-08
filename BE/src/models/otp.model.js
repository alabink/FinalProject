const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const modelOtp = new Schema(
    {
        email: { type: String, require: true, ref: 'user' },
        otp: { type: String, require: true },
        time: { type: Date, default: Date.now(), index: { expires: 300 } },
        type: { type: String, require: true },
    },
    {
        timestamps: true,
    },
);

module.exports = mongoose.model('otp', modelOtp);

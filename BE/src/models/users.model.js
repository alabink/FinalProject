const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const modelUser = new Schema(
    {
        fullName: { type: String, require: true },
        email: { type: String, require: true },
        password: { type: String, require: true },
        phone: { type: String, require: true },
        isAdmin: { type: Boolean, default: false },
        typeLogin: { type: String, enum: ['email', 'google'] },
        address: { type: String, require: true },
        avatar: { type: String, require: true },
    },
    {
        timestamps: true,
    },
);

module.exports = mongoose.model('user', modelUser);

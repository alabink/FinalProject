const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const modelCoupon = new Schema(
    {
        nameCoupon: { type: String, required: true },
        discount: { type: Number, required: true },
        quantity: { type: Number, required: true },
        startDate: { type: Date, required: true },
        endDate: { type: Date, required: true },
        productUsed: [{ type: String, required: true }],
        minPrice: { type: Number, required: true },
    },
    {
        timestamps: true,
    },
);

module.exports = mongoose.model('coupon', modelCoupon);

const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const modelPayments = new Schema(
    {
        userId: { type: String, require: true, ref: 'user' },
        products: [
            {
                productId: { type: String, require: true, ref: 'product' },
                quantity: { type: Number, require: true },
                variantId: { type: String },
                sku: { type: String },
                variantInfo: {
                    color: {
                        name: { type: String },
                        code: { type: String },
                        image: { type: String }
                    },
                    storage: {
                        size: { type: String },
                        displayName: { type: String }
                    }
                },
                productDeleted: { type: Boolean, default: false } // Add this field to track deleted products
            }
        ],
        fullName: { type: String, require: true },
        phone: { type: Number, require: true },
        address: { type: String, require: true },
        typePayments: { type: String, enum: ['COD', 'MOMO', 'VNPAY'], default: 'COD', require: true },
        statusOrder: {
            type: String,
            enum: ['pending', 'completed', 'shipping', 'delivered', 'cancelled'],
            default: 'pending',
            require: true,
        },
        totalPrice: { type: Number, require: true },
        couponApplied: {
            nameCoupon: { type: String },
            discount: { type: Number }
        },
    },
    {
        timestamps: true,
    },
);

module.exports = mongoose.model('payments', modelPayments);

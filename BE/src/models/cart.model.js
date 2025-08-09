const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const modelCart = new Schema(
    {
        userId: { type: String, require: true, ref: 'user' },
        product: [
            {
                productId: { type: String, required: true, ref: 'product' },
                quantity: { type: Number, required: true },
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
                }
            },
        ],
        totalPrice: { type: Number, require: true },
        fullName: { type: String, require: true },
        phone: { type: String, require: true },
        address: { type: String, require: true },
        nameCoupon: { type: String, require: true },
    },
    {
        timestamps: true,
    },
);

module.exports = mongoose.model('cart', modelCart);

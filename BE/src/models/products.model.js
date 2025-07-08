const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const modelProduct = new Schema(
    {
        name: { type: String, require: true },
        price: { type: Number, require: true },
        priceDiscount: { type: Number, require: true },
        images: { type: Array, require: true },
        stock: { type: Number, require: true },
        attributes: { type: mongoose.Schema.Types.Mixed, require: true },
        category: { type: mongoose.Schema.Types.ObjectId, ref: 'category', require: true },
    },
    {
        timestamps: true,
    },
);

module.exports = mongoose.model('product', modelProduct);

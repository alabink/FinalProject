const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const modelProductPreview = new Schema(
    {
        productId: { type: Schema.Types.ObjectId, require: true, ref: 'product' },
        userId: { type: Schema.Types.ObjectId, require: true, ref: 'user' },
        rating: { type: Number, require: true },
        comment: { type: String, require: true },
    },
    {
        timestamps: true,
    },
);

module.exports = mongoose.model('productPreview', modelProductPreview);

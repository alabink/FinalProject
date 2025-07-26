const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userInteractionSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'users',
        required: true
    },
    productId: {
        type: Schema.Types.ObjectId,
        ref: 'products',
        required: true
    },
    click: {
        type: Number,
        default: 0
    },
    view: {
        type: Number,
        default: 0
    },
    favorite: {
        type: Number,
        default: 0
    },
    purchase: {
        type: Number,
        default: 0
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Create compound index on userId and productId for faster lookups
userInteractionSchema.index({ userId: 1, productId: 1 }, { unique: true });

// Create index for querying by userId for recommendations
userInteractionSchema.index({ userId: 1 });

// Create index for querying popular products
userInteractionSchema.index({ 
    click: -1, 
    view: -1, 
    favorite: -1, 
    purchase: -1 
});

module.exports = mongoose.model('UserInteraction', userInteractionSchema); 
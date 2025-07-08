const mongoose = require('mongoose');
const { Schema } = mongoose;

const commentSchema = new Schema({
    postId: { type: Schema.Types.ObjectId, required: true, index: true, ref: 'Post' },
    userId: { type: Schema.Types.ObjectId, required: true, ref: 'User' },
    content: { type: String, required: true },
    isAdmin: { type: Boolean, default: false },
    parentId: { type: Schema.Types.ObjectId, ref: 'Comment', default: null }, // null = comment gốc
    createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Comment', commentSchema);

const Comment = require('../models/comment.model');
const modelUser = require('../models/users.model');

const { BadRequestError } = require('../core/error.response');
const { OK, Created } = require('../core/success.response');

class CommentController {
    async createComment(req, res) {
        const { id } = req.user;
        const { postId, content, isAdmin, parentId } = req.body;

        const user = await modelUser.findById(id);

        if (!user) {
            throw new BadRequestError('User not found');
        }

        if (parentId) {
            const parentComment = await Comment.findById(parentId);
            if (!parentComment) {
                throw new BadRequestError('Không tìm thấy bình luận gốc.');
            }
            // Cho phép phản hồi tất cả các bình luận, không chỉ bình luận cấp 1
        }

        const newComment = await Comment.create({
            postId,
            userId: user._id,
            content,
            parentId,
            isAdmin: user.isAdmin,
        });

        new Created({
            message: 'Comment created successfully',
            metadata: newComment,
        }).send(res);
    }
}

module.exports = new CommentController();

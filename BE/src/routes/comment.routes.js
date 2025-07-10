const express = require('express');
const router = express.Router();

const { asyncHandler, authUser, authAdmin } = require('../auth/checkAuth');

const controllerComment = require('../controllers/comment.controller');

/**
 * @swagger
 * /api/create-comment:
 *   post:
 *     summary: Tạo bình luận mới
 *     tags: [Comment]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Tạo bình luận thành công
 */
router.post('/api/create-comment', authUser, asyncHandler(controllerComment.createComment));

module.exports = router;

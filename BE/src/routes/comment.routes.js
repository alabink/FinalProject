const express = require('express');
const router = express.Router();

const { asyncHandler, authUser, authAdmin } = require('../auth/checkAuth');

const controllerComment = require('../controllers/comment.controller');

router.post('/api/create-comment', authUser, asyncHandler(controllerComment.createComment));

module.exports = router;

const express = require('express');
const router = express.Router();

const { asyncHandler, authUser, authAdmin } = require('../auth/checkAuth');

const controllerProductPreview = require('../controllers/productPreview.controller');

/**
 * @swagger
 * /api/create-product-preview:
 *   post:
 *     summary: Tạo product preview mới
 *     tags: [ProductPreview]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Tạo product preview thành công
 */
router.post('/api/create-product-preview', authUser, asyncHandler(controllerProductPreview.createProductPreview));

module.exports = router;

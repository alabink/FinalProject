const express = require('express');
const router = express.Router();

const { asyncHandler, authUser, authAdmin } = require('../auth/checkAuth');

const controllerProductPreview = require('../controllers/productPreview.controller');

/**
 * @swagger
 * tags:
 *   name: ProductPreview
 *   description: Product preview management
 */

/**
 * @swagger
 * /api/create-product-preview:
 *   post:
 *     summary: Create a product preview
 *     tags: [ProductPreview]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Product preview created successfully
 */
router.post('/api/create-product-preview', authUser, asyncHandler(controllerProductPreview.createProductPreview));

module.exports = router;

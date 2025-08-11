const express = require('express');
const router = express.Router();
const { asyncHandler, authUser, authAdmin } = require('../auth/checkAuth');
const controllerProducts = require('../controllers/products.controller');
const uploadCloud = require('../config/cloudinary.config');

/**
 * @swagger
 * tags:
 *   name: Products
 *   description: Product management
 */

/**
 * @swagger
 * /api/add-product:
 *   post:
 *     summary: Add a new product (admin only)
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       200:
 *         description: Product added successfully
 */
router.post('/api/add-product', authAdmin, uploadCloud.array('images'), asyncHandler(controllerProducts.addProduct));

/**
 * @swagger
 * /api/products:
 *   get:
 *     summary: Get a list of products
 *     tags: [Products]
 *     responses:
 *       200:
 *         description: A list of products
 */
router.get('/api/products', asyncHandler(controllerProducts.getProducts));

/**
 * @swagger
 * /api/product:
 *   get:
 *     summary: Get a product by ID
 *     tags: [Products]
 *     parameters:
 *       - in: query
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: A single product
 */
router.get('/api/product', asyncHandler(controllerProducts.getProductById));

/**
 * @swagger
 * /api/upload-image:
 *   post:
 *     summary: Upload product images
 *     tags: [Products]
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       200:
 *         description: Images uploaded successfully
 */
router.post('/api/upload-image', authAdmin, uploadCloud.array('images'), asyncHandler(controllerProducts.uploadImage));

/**
 * @swagger
 * /api/all-product:
 *   get:
 *     summary: Get all products
 *     tags: [Products]
 *     responses:
 *       200:
 *         description: All products
 */
router.get('/api/all-product', asyncHandler(controllerProducts.getAllProduct));

/**
 * @swagger
 * /api/edit-product:
 *   post:
 *     summary: Edit a product
 *     tags: [Products]
 *     responses:
 *       200:
 *         description: Product edited successfully
 */
router.post('/api/edit-product', authAdmin, asyncHandler(controllerProducts.editProduct));

/**
 * @swagger
 * /api/delete-product:
 *   delete:
 *     summary: Delete a product
 *     tags: [Products]
 *     parameters:
 *       - in: query
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Product deleted successfully
 */
router.delete('/api/delete-product', authAdmin, asyncHandler(controllerProducts.deleteProduct));

/**
 * @swagger
 * /api/search-product:
 *   get:
 *     summary: Search for products
 *     tags: [Products]
 *     parameters:
 *       - in: query
 *         name: keyword
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: A list of matching products
 */
router.get('/api/search-product', asyncHandler(controllerProducts.searchProduct));

/**
 * @swagger
 * /api/filter-product:
 *   get:
 *     summary: Filter products
 *     tags: [Products]
 *     responses:
 *       200:
 *         description: A list of filtered products
 */
router.get('/api/filter-product', asyncHandler(controllerProducts.filterProduct));

/**
 * @swagger
 * /api/product-variants:
 *   get:
 *     summary: Get product variants
 *     tags: [Products]
 *     responses:
 *       200:
 *         description: Product variants
 */
router.get('/api/product-variants', asyncHandler(controllerProducts.getProductVariants));

/**
 * @swagger
 * /api/variant-by-selection:
 *   get:
 *     summary: Get a variant by selection
 *     tags: [Products]
 *     responses:
 *       200:
 *         description: A product variant
 */
router.get('/api/variant-by-selection', asyncHandler(controllerProducts.getVariantBySelection));

/**
 * @swagger
 * /api/compare-products:
 *   post:
 *     summary: Compare products
 *     tags: [Products]
 *     responses:
 *       200:
 *         description: Comparison result
 */
router.post('/api/compare-products', asyncHandler(controllerProducts.compareProducts));

/**
 * @swagger
 * /api/quick-compare-products:
 *   post:
 *     summary: Quick compare products
 *     tags: [Products]
 *     responses:
 *       200:
 *         description: Quick comparison result
 */
router.post('/api/quick-compare-products', asyncHandler(controllerProducts.quickCompareProducts));

module.exports = router;

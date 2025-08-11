const express = require('express');
const router = express.Router();

const { asyncHandler, authUser, authAdmin } = require('../auth/checkAuth');

const controllerCategory = require('../controllers/category.controller');

/**
 * @swagger
 * tags:
 *   name: Categories
 *   description: Category management
 */

/**
 * @swagger
 * /api/create-category:
 *   post:
 *     summary: Create a new category
 *     tags: [Categories]
 *     responses:
 *       200:
 *         description: Category created successfully
 */
router.post('/api/create-category', authAdmin, asyncHandler(controllerCategory.createCategory));

/**
 * @swagger
 * /api/get-all-category:
 *   get:
 *     summary: Get all categories
 *     tags: [Categories]
 *     responses:
 *       200:
 *         description: A list of all categories
 */
router.get('/api/get-all-category', asyncHandler(controllerCategory.getAllCategory));

/**
 * @swagger
 * /api/delete-category:
 *   delete:
 *     summary: Delete a category
 *     tags: [Categories]
 *     responses:
 *       200:
 *         description: Category deleted successfully
 */
router.delete('/api/delete-category', authAdmin, asyncHandler(controllerCategory.deleteCategory));

/**
 * @swagger
 * /api/update-category:
 *   post:
 *     summary: Update a category
 *     tags: [Categories]
 *     responses:
 *       200:
 *         description: Category updated successfully
 */
router.post('/api/update-category', authAdmin, asyncHandler(controllerCategory.updateCategory));

/**
 * @swagger
 * /api/get-product-by-category:
 *   get:
 *     summary: Get products by category
 *     tags: [Categories]
 *     responses:
 *       200:
 *         description: A list of products in the category
 */
router.get('/api/get-product-by-category', asyncHandler(controllerCategory.getProductByCategory));

/**
 * @swagger
 * /api/filter-product-category:
 *   get:
 *     summary: Filter products by category
 *     tags: [Categories]
 *     responses:
 *       200:
 *         description: A list of filtered products in the category
 */
router.get('/api/filter-product-category', asyncHandler(controllerCategory.filterProductCategory));

module.exports = router;

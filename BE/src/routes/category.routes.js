const express = require('express');
const router = express.Router();

const { asyncHandler, authUser, authAdmin } = require('../auth/checkAuth');

const controllerCategory = require('../controllers/category.controller');

/**
 * @swagger
 * /api/create-category:
 *   post:
 *     summary: Tạo danh mục mới
 *     tags: [Category]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Tạo danh mục thành công
 */
router.post('/api/create-category', asyncHandler(controllerCategory.createCategory));

/**
 * @swagger
 * /api/get-all-category:
 *   get:
 *     summary: Lấy tất cả danh mục
 *     tags: [Category]
 *     responses:
 *       200:
 *         description: Danh sách tất cả danh mục
 */
router.get('/api/get-all-category', asyncHandler(controllerCategory.getAllCategory));

/**
 * @swagger
 * /api/delete-category:
 *   delete:
 *     summary: Xóa danh mục
 *     tags: [Category]
 *     parameters:
 *       - in: query
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID danh mục cần xóa
 *     responses:
 *       200:
 *         description: Xóa danh mục thành công
 */
router.delete('/api/delete-category', asyncHandler(controllerCategory.deleteCategory));

/**
 * @swagger
 * /api/update-category:
 *   post:
 *     summary: Cập nhật danh mục
 *     tags: [Category]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Cập nhật danh mục thành công
 */
router.post('/api/update-category', asyncHandler(controllerCategory.updateCategory));

/**
 * @swagger
 * /api/get-product-by-category:
 *   get:
 *     summary: Lấy sản phẩm theo danh mục
 *     tags: [Category]
 *     parameters:
 *       - in: query
 *         name: categoryId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID danh mục
 *     responses:
 *       200:
 *         description: Danh sách sản phẩm theo danh mục
 */
router.get('/api/get-product-by-category', asyncHandler(controllerCategory.getProductByCategory));

/**
 * @swagger
 * /api/filter-product-category:
 *   get:
 *     summary: Lọc sản phẩm theo danh mục
 *     tags: [Category]
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         required: false
 *         description: Lọc theo danh mục
 *     responses:
 *       200:
 *         description: Kết quả lọc sản phẩm theo danh mục
 */
router.get('/api/filter-product-category', asyncHandler(controllerCategory.filterProductCategory));

module.exports = router;

const express = require('express');
const router = express.Router();

const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'src/uploads/images');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));
    },
});

var upload = multer({
    storage: storage,
    limits: { fileSize: 500 * 1024 * 1024 },
});

const { asyncHandler, authUser, authAdmin } = require('../auth/checkAuth');

const controllerProducts = require('../controllers/products.controller');

/**
 * @swagger
 * /api/add-product:
 *   post:
 *     summary: Thêm sản phẩm mới
 *     tags: [Products]
 *     requestBody:
 *       required: true
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
 *         description: Sản phẩm đã được thêm thành công
 */
router.post('/api/add-product', authAdmin, upload.array('images'), asyncHandler(controllerProducts.addProduct));

/**
 * @swagger
 * /api/products:
 *   get:
 *     summary: Lấy danh sách sản phẩm
 *     tags: [Products]
 *     responses:
 *       200:
 *         description: Danh sách sản phẩm
 */
router.get('/api/products', asyncHandler(controllerProducts.getProducts));

/**
 * @swagger
 * /api/product:
 *   get:
 *     summary: Lấy chi tiết sản phẩm theo ID
 *     tags: [Products]
 *     parameters:
 *       - in: query
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID sản phẩm
 *     responses:
 *       200:
 *         description: Chi tiết sản phẩm
 */
router.get('/api/product', asyncHandler(controllerProducts.getProductById));

/**
 * @swagger
 * /api/upload-image:
 *   post:
 *     summary: Upload hình ảnh sản phẩm
 *     tags: [Products]
 *     requestBody:
 *       required: true
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
 *         description: Upload thành công
 */
router.post('/api/upload-image', upload.array('images'), asyncHandler(controllerProducts.uploadImage));

/**
 * @swagger
 * /api/all-product:
 *   get:
 *     summary: Lấy tất cả sản phẩm (không phân trang)
 *     tags: [Products]
 *     responses:
 *       200:
 *         description: Danh sách tất cả sản phẩm
 */
router.get('/api/all-product', asyncHandler(controllerProducts.getAllProduct));

/**
 * @swagger
 * /api/edit-product:
 *   post:
 *     summary: Chỉnh sửa sản phẩm
 *     tags: [Products]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Sản phẩm đã được chỉnh sửa thành công
 */
router.post('/api/edit-product', asyncHandler(controllerProducts.editProduct));

/**
 * @swagger
 * /api/delete-product:
 *   delete:
 *     summary: Xóa sản phẩm
 *     tags: [Products]
 *     parameters:
 *       - in: query
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID sản phẩm cần xóa
 *     responses:
 *       200:
 *         description: Sản phẩm đã được xóa thành công
 */
router.delete('/api/delete-product', asyncHandler(controllerProducts.deleteProduct));

/**
 * @swagger
 * /api/search-product:
 *   get:
 *     summary: Tìm kiếm sản phẩm
 *     tags: [Products]
 *     parameters:
 *       - in: query
 *         name: keyword
 *         schema:
 *           type: string
 *         required: false
 *         description: Từ khóa tìm kiếm
 *     responses:
 *       200:
 *         description: Kết quả tìm kiếm sản phẩm
 */
router.get('/api/search-product', asyncHandler(controllerProducts.searchProduct));

/**
 * @swagger
 * /api/filter-product:
 *   get:
 *     summary: Lọc sản phẩm
 *     tags: [Products]
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         required: false
 *         description: Lọc theo danh mục
 *       - in: query
 *         name: priceMin
 *         schema:
 *           type: number
 *         required: false
 *         description: Giá tối thiểu
 *       - in: query
 *         name: priceMax
 *         schema:
 *           type: number
 *         required: false
 *         description: Giá tối đa
 *     responses:
 *       200:
 *         description: Kết quả lọc sản phẩm
 */
router.get('/api/filter-product', asyncHandler(controllerProducts.filterProduct));
module.exports = router;

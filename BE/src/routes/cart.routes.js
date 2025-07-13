const express = require('express');
const router = express.Router();

const { asyncHandler, authUser, authAdmin } = require('../auth/checkAuth');

const controllerCart = require('../controllers/cart.controller');

/**
 * @swagger
 * /api/add-to-cart:
 *   post:
 *     summary: Thêm sản phẩm vào giỏ hàng
 *     tags: [Cart]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Thêm vào giỏ hàng thành công
 */
router.post('/api/add-to-cart', authUser, asyncHandler(controllerCart.addToCart));

/**
 * @swagger
 * /api/get-cart:
 *   get:
 *     summary: Lấy giỏ hàng của người dùng
 *     tags: [Cart]
 *     responses:
 *       200:
 *         description: Lấy giỏ hàng thành công
 */
router.get('/api/get-cart', authUser, asyncHandler(controllerCart.getCart));

/**
 * @swagger
 * /api/delete-cart:
 *   delete:
 *     summary: Xóa sản phẩm khỏi giỏ hàng
 *     tags: [Cart]
 *     parameters:
 *       - in: query
 *         name: productId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID sản phẩm cần xóa
 *     responses:
 *       200:
 *         description: Xóa sản phẩm khỏi giỏ hàng thành công
 */
router.delete('/api/delete-cart', authUser, asyncHandler(controllerCart.deleteProductCart));

/**
 * @swagger
 * /api/update-info-user-cart:
 *   post:
 *     summary: Cập nhật thông tin người nhận trong giỏ hàng
 *     tags: [Cart]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Cập nhật thông tin thành công
 */
router.post('/api/update-info-user-cart', authUser, asyncHandler(controllerCart.updateInfoUserCart));

/**
 * @swagger
 * /api/apply-coupon:
 *   post:
 *     summary: Áp dụng mã giảm giá cho giỏ hàng
 *     tags: [Cart]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Áp dụng mã giảm giá thành công
 */
router.post('/api/apply-coupon', authUser, asyncHandler(controllerCart.applyCoupon));

/**
 * @swagger
 * /api/update-cart-quantity:
 *   post:
 *     summary: Cập nhật số lượng sản phẩm trong giỏ hàng
 *     tags: [Cart]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               productId:
 *                 type: string
 *                 description: ID sản phẩm
 *               quantity:
 *                 type: integer
 *                 description: Số lượng mới
 *     responses:
 *       200:
 *         description: Cập nhật số lượng thành công
 */
router.post('/api/update-cart-quantity', authUser, asyncHandler(controllerCart.updateCartQuantity));

module.exports = router;

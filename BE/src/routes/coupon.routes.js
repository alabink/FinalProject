const express = require('express');
const router = express.Router();

const controllerCoupon = require('../controllers/coupon.controller');

const { asyncHandler, authUser, authAdmin } = require('../auth/checkAuth');

/**
 * @swagger
 * /api/create-coupon:
 *   post:
 *     summary: Tạo mã giảm giá mới
 *     tags: [Coupon]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Tạo mã giảm giá thành công
 */
router.post('/api/create-coupon', asyncHandler(controllerCoupon.createCoupon));

/**
 * @swagger
 * /api/coupon:
 *   get:
 *     summary: Lấy thông tin mã giảm giá
 *     tags: [Coupon]
 *     parameters:
 *       - in: query
 *         name: code
 *         schema:
 *           type: string
 *         required: false
 *         description: Mã giảm giá
 *     responses:
 *       200:
 *         description: Thông tin mã giảm giá
 */
router.get('/api/coupon', asyncHandler(controllerCoupon.getCoupons));

/**
 * @swagger
 * /api/coupons:
 *   get:
 *     summary: Lấy tất cả mã giảm giá
 *     tags: [Coupon]
 *     responses:
 *       200:
 *         description: Danh sách tất cả mã giảm giá
 */
router.get('/api/coupons', asyncHandler(controllerCoupon.getAllCoupon));

/**
 * @swagger
 * /api/delete-coupon:
 *   delete:
 *     summary: Xóa mã giảm giá
 *     tags: [Coupon]
 *     parameters:
 *       - in: query
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID mã giảm giá cần xóa
 *     responses:
 *       200:
 *         description: Xóa mã giảm giá thành công
 */
router.delete('/api/delete-coupon', asyncHandler(controllerCoupon.deleteCoupon));

/**
 * @swagger
 * /api/update-coupon:
 *   post:
 *     summary: Cập nhật mã giảm giá
 *     tags: [Coupon]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Cập nhật mã giảm giá thành công
 */
router.post('/api/update-coupon', asyncHandler(controllerCoupon.updateCoupon));

module.exports = router;

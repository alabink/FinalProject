const express = require('express');
const router = express.Router();

const { asyncHandler, authUser, authAdmin } = require('../auth/checkAuth');

const controllerPayments = require('../controllers/payments.controller');

/**
 * @swagger
 * /api/payment:
 *   post:
 *     summary: Thanh toán đơn hàng
 *     tags: [Payments]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Thanh toán thành công
 */
router.post('/api/payment', authUser, asyncHandler(controllerPayments.payment));

/**
 * @swagger
 * /api/check-payment-momo:
 *   get:
 *     summary: Kiểm tra trạng thái thanh toán MoMo
 *     tags: [Payments]
 *     responses:
 *       200:
 *         description: Trạng thái thanh toán MoMo
 */
router.get('/api/check-payment-momo', asyncHandler(controllerPayments.checkPaymentMomo));

/**
 * @swagger
 * /api/check-payment-vnpay:
 *   get:
 *     summary: Kiểm tra trạng thái thanh toán VNPay
 *     tags: [Payments]
 *     responses:
 *       200:
 *         description: Trạng thái thanh toán VNPay
 */
router.get('/api/check-payment-vnpay', asyncHandler(controllerPayments.checkPaymentVnpay));

/**
 * @swagger
 * /api/get-history-order:
 *   get:
 *     summary: Lấy lịch sử đơn hàng của người dùng
 *     tags: [Payments]
 *     responses:
 *       200:
 *         description: Lịch sử đơn hàng
 */
router.get('/api/get-history-order', authUser, asyncHandler(controllerPayments.getHistoryOrder));

/**
 * @swagger
 * /api/get-one-payment:
 *   get:
 *     summary: Lấy chi tiết một đơn hàng
 *     tags: [Payments]
 *     parameters:
 *       - in: query
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID đơn hàng
 *     responses:
 *       200:
 *         description: Chi tiết đơn hàng
 */
router.get('/api/get-one-payment', authUser, asyncHandler(controllerPayments.getOnePayment));

/**
 * @swagger
 * /api/update-status-order:
 *   post:
 *     summary: Admin cập nhật trạng thái đơn hàng
 *     tags: [Payments]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Cập nhật trạng thái thành công
 */
router.post('/api/update-status-order', authAdmin, asyncHandler(controllerPayments.updateStatusOrder));

/**
 * @swagger
 * /api/get-order-admin:
 *   get:
 *     summary: Admin lấy danh sách đơn hàng
 *     tags: [Payments]
 *     responses:
 *       200:
 *         description: Danh sách đơn hàng
 */
router.get('/api/get-order-admin', authAdmin, asyncHandler(controllerPayments.getOrderAdmin));

/**
 * @swagger
 * /api/cancel-order:
 *   post:
 *     summary: Hủy đơn hàng
 *     tags: [Payments]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Hủy đơn hàng thành công
 */
router.post('/api/cancel-order', authUser, asyncHandler(controllerPayments.cancelOrder));

module.exports = router;

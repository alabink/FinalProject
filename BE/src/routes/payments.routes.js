const express = require('express');
const router = express.Router();

const { asyncHandler, authUser, authAdmin } = require('../auth/checkAuth');

const controllerPayments = require('../controllers/payments.controller');

/**
 * @swagger
 * tags:
 *   name: Payments
 *   description: Payment and order management
 */

/**
 * @swagger
 * /api/payment:
 *   post:
 *     summary: Create a new payment
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Payment created successfully
 */
router.post('/api/payment', authUser, asyncHandler(controllerPayments.payment));

/**
 * @swagger
 * /api/check-payment-momo:
 *   get:
 *     summary: Check Momo payment status
 *     tags: [Payments]
 *     responses:
 *       200:
 *         description: Momo payment status
 */
router.get('/api/check-payment-momo', asyncHandler(controllerPayments.checkPaymentMomo));

/**
 * @swagger
 * /api/check-payment-vnpay:
 *   get:
 *     summary: Check VNPay payment status
 *     tags: [Payments]
 *     responses:
 *       200:
 *         description: VNPay payment status
 */
router.get('/api/check-payment-vnpay', asyncHandler(controllerPayments.checkPaymentVnpay));

/**
 * @swagger
 * /api/get-history-order:
 *   get:
 *     summary: Get user's order history
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: A list of orders
 */
router.get('/api/get-history-order', authUser, asyncHandler(controllerPayments.getHistoryOrder));

/**
 * @swagger
 * /api/get-one-payment:
 *   get:
 *     summary: Get a single payment by ID
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: A single payment
 */
router.get('/api/get-one-payment', authUser, asyncHandler(controllerPayments.getOnePayment));

/**
 * @swagger
 * /api/update-status-order:
 *   post:
 *     summary: Update order status (admin only)
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Order status updated successfully
 */
router.post('/api/update-status-order', authAdmin, asyncHandler(controllerPayments.updateStatusOrder));

/**
 * @swagger
 * /api/get-order-admin:
 *   get:
 *     summary: Get all orders (admin only)
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: A list of all orders
 */
router.get('/api/get-order-admin', authAdmin, asyncHandler(controllerPayments.getOrderAdmin));

/**
 * @swagger
 * /api/cancel-order:
 *   post:
 *     summary: Cancel an order
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Order cancelled successfully
 */
router.post('/api/cancel-order', authUser, asyncHandler(controllerPayments.cancelOrder));

module.exports = router;

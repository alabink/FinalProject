const express = require('express');
const router = express.Router();

const { asyncHandler, authUser, authAdmin } = require('../auth/checkAuth');

const controllerPayments = require('../controllers/payments.controller');

router.post('/api/payment', authUser, asyncHandler(controllerPayments.payment));

router.get('/api/check-payment-momo', asyncHandler(controllerPayments.checkPaymentMomo));

router.get('/api/check-payment-vnpay', asyncHandler(controllerPayments.checkPaymentVnpay));

router.get('/api/get-history-order', authUser, asyncHandler(controllerPayments.getHistoryOrder));

router.get('/api/get-one-payment', authUser, asyncHandler(controllerPayments.getOnePayment));

router.post('/api/update-status-order', authAdmin, asyncHandler(controllerPayments.updateStatusOrder));

router.get('/api/get-order-admin', authAdmin, asyncHandler(controllerPayments.getOrderAdmin));

router.post('/api/cancel-order', authUser, asyncHandler(controllerPayments.cancelOrder));

module.exports = router;

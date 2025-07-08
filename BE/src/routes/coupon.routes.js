const express = require('express');
const router = express.Router();

const controllerCoupon = require('../controllers/coupon.controller');

const { asyncHandler, authUser, authAdmin } = require('../auth/checkAuth');

router.post('/api/create-coupon', asyncHandler(controllerCoupon.createCoupon));
router.get('/api/coupon', asyncHandler(controllerCoupon.getCoupons));
router.get('/api/coupons', asyncHandler(controllerCoupon.getAllCoupon));
router.delete('/api/delete-coupon', asyncHandler(controllerCoupon.deleteCoupon));
router.post('/api/update-coupon', asyncHandler(controllerCoupon.updateCoupon));

module.exports = router;

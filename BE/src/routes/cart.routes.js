const express = require('express');
const router = express.Router();

const { asyncHandler, authUser, authAdmin } = require('../auth/checkAuth');

const controllerCart = require('../controllers/cart.controller');

router.post('/api/add-to-cart', authUser, asyncHandler(controllerCart.addToCart));

router.get('/api/get-cart', authUser, asyncHandler(controllerCart.getCart));

router.delete('/api/delete-cart', authUser, asyncHandler(controllerCart.deleteProductCart));

router.post('/api/update-info-user-cart', authUser, asyncHandler(controllerCart.updateInfoUserCart));

router.post('/api/apply-coupon', authUser, asyncHandler(controllerCart.applyCoupon));

module.exports = router;

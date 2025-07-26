const express = require('express');
const router = express.Router();

const { asyncHandler, authUser, authAdmin } = require('../auth/checkAuth');

const controllerCart = require('../controllers/cart.controller');

/**
 * @swagger
 * tags:
 *   name: Cart
 *   description: Cart management
 */

/**
 * @swagger
 * /api/add-to-cart:
 *   post:
 *     summary: Add a product to the cart
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Product added to cart successfully
 */
router.post('/api/add-to-cart', authUser, asyncHandler(controllerCart.addToCart));

/**
 * @swagger
 * /api/get-cart:
 *   get:
 *     summary: Get the user's cart
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: The user's cart
 */
router.get('/api/get-cart', authUser, asyncHandler(controllerCart.getCart));

/**
 * @swagger
 * /api/delete-cart:
 *   delete:
 *     summary: Delete a product from the cart
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Product deleted from cart successfully
 */
router.delete('/api/delete-cart', authUser, asyncHandler(controllerCart.deleteProductCart));

/**
 * @swagger
 * /api/update-cart-quantity:
 *   post:
 *     summary: Update the quantity of a product in the cart
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Cart quantity updated successfully
 */
router.post('/api/update-cart-quantity', authUser, asyncHandler(controllerCart.updateCartQuantity));

/**
 * @swagger
 * /api/update-info-user-cart:
 *   post:
 *     summary: Update user information in the cart
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User information in cart updated successfully
 */
router.post('/api/update-info-user-cart', authUser, asyncHandler(controllerCart.updateInfoUserCart));

/**
 * @swagger
 * /api/apply-coupon:
 *   post:
 *     summary: Apply a coupon to the cart
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Coupon applied successfully
 */
router.post('/api/apply-coupon', authUser, asyncHandler(controllerCart.applyCoupon));

module.exports = router;

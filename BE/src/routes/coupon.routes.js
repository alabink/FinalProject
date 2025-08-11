const express = require('express');
const router = express.Router();

const controllerCoupon = require('../controllers/coupon.controller');

const { asyncHandler, authUser, authAdmin } = require('../auth/checkAuth');

/**
 * @swagger
 * tags:
 *   name: Coupons
 *   description: Coupon management
 */

/**
 * @swagger
 * /api/create-coupon:
 *   post:
 *     summary: Create a new coupon
 *     tags: [Coupons]
 *     responses:
 *       200:
 *         description: Coupon created successfully
 */
router.post('/api/create-coupon', authAdmin, asyncHandler(controllerCoupon.createCoupon));

/**
 * @swagger
 * /api/coupon:
 *   get:
 *     summary: Get a list of coupons
 *     tags: [Coupons]
 *     responses:
 *       200:
 *         description: A list of coupons
 */
router.get('/api/coupon', asyncHandler(controllerCoupon.getCoupons));

/**
 * @swagger
 * /api/coupons:
 *   get:
 *     summary: Get all coupons
 *     tags: [Coupons]
 *     responses:
 *       200:
 *         description: A list of all coupons
 */
router.get('/api/coupons', asyncHandler(controllerCoupon.getAllCoupon));

/**
 * @swagger
 * /api/delete-coupon:
 *   delete:
 *     summary: Delete a coupon
 *     tags: [Coupons]
 *     responses:
 *       200:
 *         description: Coupon deleted successfully
 */
router.delete('/api/delete-coupon', authAdmin, asyncHandler(controllerCoupon.deleteCoupon));

/**
 * @swagger
 * /api/update-coupon:
 *   post:
 *     summary: Update a coupon
 *     tags: [Coupons]
 *     responses:
 *       200:
 *         description: Coupon updated successfully
 */
router.post('/api/update-coupon', authAdmin, asyncHandler(controllerCoupon.updateCoupon));

module.exports = router;

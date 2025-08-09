const express = require('express');
const router = express.Router();
const recommendationController = require('../controllers/recommendation.controller');
const { asyncHandler, authUser, optionalAuth } = require('../auth/checkAuth');

/**
 * @swagger
 * tags:
 *   name: Recommendations
 *   description: Recommendation engine
 */

/**
 * @swagger
 * /api/track-interaction:
 *   post:
 *     summary: Track user interaction with a product
 *     tags: [Recommendations]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Interaction tracked successfully
 */
router.post('/track-interaction', authUser, asyncHandler(recommendationController.trackInteraction.bind(recommendationController)));

/**
 * @swagger
 * /api/recommendations/{userId}:
 *   get:
 *     summary: Get personalized recommendations for a user
 *     tags: [Recommendations]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: A list of recommended products
 */
router.get('/recommendations/:userId', optionalAuth, asyncHandler(recommendationController.getRecommendations.bind(recommendationController)));

/**
 * @swagger
 * /api/popular-products:
 *   get:
 *     summary: Get popular products
 *     tags: [Recommendations]
 *     responses:
 *       200:
 *         description: A list of popular products
 */
router.get('/popular-products', asyncHandler(recommendationController.getPopularProducts.bind(recommendationController)));

module.exports = router; 
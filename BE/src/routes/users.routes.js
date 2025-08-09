const express = require('express');
const router = express.Router();

const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'src/uploads/avatars');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));
    },
});

var upload = multer({
    storage: storage,
    limits: { fileSize: 500 * 1024 * 1024 },
});

const { asyncHandler, authUser, authAdmin } = require('../auth/checkAuth');

const controllerUsers = require('../controllers/users.controller');

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: User management and authentication
 */

/**
 * @swagger
 * /api/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: User registered successfully
 */
router.post('/api/register', asyncHandler(controllerUsers.register));

/**
 * @swagger
 * /api/login:
 *   post:
 *     summary: Login a user
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: User logged in successfully
 */
router.post('/api/login', asyncHandler(controllerUsers.login));

/**
 * @swagger
 * /api/login-google:
 *   post:
 *     summary: Login with Google
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: User logged in successfully with Google
 */
router.post('/api/login-google', asyncHandler(controllerUsers.loginGoogle));

/**
 * @swagger
 * /api/auth:
 *   get:
 *     summary: Authenticate a user
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User is authenticated
 */
router.get('/api/auth', authUser, asyncHandler(controllerUsers.authUser));

/**
 * @swagger
 * /api/logout:
 *   get:
 *     summary: Logout a user
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User logged out successfully
 */
router.get('/api/logout', authUser, asyncHandler(controllerUsers.logout));

/**
 * @swagger
 * /api/refresh-token:
 *   get:
 *     summary: Refresh authentication token
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: Token refreshed successfully
 */
router.get('/api/refresh-token', asyncHandler(controllerUsers.refreshToken));

/**
 * @swagger
 * /api/change-password:
 *   post:
 *     summary: Change user password
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Password changed successfully
 */
router.post('/api/change-password', authUser, asyncHandler(controllerUsers.changePassword));

/**
 * @swagger
 * /api/forgot-password:
 *   post:
 *     summary: Send forgot password email
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: Forgot password email sent successfully
 */
router.post('/api/forgot-password', asyncHandler(controllerUsers.sendMailForgotPassword));

/**
 * @swagger
 * /api/reset-password:
 *   post:
 *     summary: Reset password with OTP
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: Password reset successfully
 */
router.post('/api/reset-password', asyncHandler(controllerUsers.verifyOtp));

/**
 * @swagger
 * /api/update-info-user:
 *   post:
 *     summary: Update user information
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               avatar:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: User information updated successfully
 */
router.post('/api/update-info-user', authUser, upload.single('avatar'), asyncHandler(controllerUsers.updateInfoUser));

/**
 * @swagger
 * /api/update-password:
 *   post:
 *     summary: Update user password (alternative route)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Password updated successfully
 */
router.post('/api/update-password', authUser, asyncHandler(controllerUsers.updatePassword));


/**
 * @swagger
 * /api/get-admin-stats:
 *   get:
 *     summary: Get admin statistics
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Admin stats retrieved successfully
 */
router.get('/api/get-admin-stats', authAdmin, asyncHandler(controllerUsers.getAdminStats));

/**
 * @swagger
 * /api/get-all-users:
 *   get:
 *     summary: Get all users (admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: All users retrieved successfully
 */
router.get('/api/get-all-users', authAdmin, asyncHandler(controllerUsers.getAllUser));

/**
 * @swagger
 * /api/update-user:
 *   post:
 *     summary: Update a user (admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User updated successfully
 */
router.post('/api/update-user', authAdmin, asyncHandler(controllerUsers.updateUser));

/**
 * @swagger
 * /admin:
 *   get:
 *     summary: Authenticate an admin
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Admin is authenticated
 */
router.get('/admin', authAdmin, asyncHandler(controllerUsers.authAdmin));

module.exports = router;

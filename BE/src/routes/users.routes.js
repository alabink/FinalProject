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
 * /api/register:
 *   post:
 *     summary: Đăng ký tài khoản
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Đăng ký thành công
 */
router.post('/api/register', asyncHandler(controllerUsers.register));

/**
 * @swagger
 * /api/login:
 *   post:
 *     summary: Đăng nhập
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Đăng nhập thành công
 */
router.post('/api/login', asyncHandler(controllerUsers.login));

/**
 * @swagger
 * /api/login-google:
 *   post:
 *     summary: Đăng nhập bằng Google
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Đăng nhập Google thành công
 */
router.post('/api/login-google', asyncHandler(controllerUsers.loginGoogle));

/**
 * @swagger
 * /api/auth:
 *   get:
 *     summary: Xác thực người dùng
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: Xác thực thành công
 */
router.get('/api/auth', authUser, asyncHandler(controllerUsers.authUser));

/**
 * @swagger
 * /api/logout:
 *   get:
 *     summary: Đăng xuất
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: Đăng xuất thành công
 */
router.get('/api/logout', authUser, asyncHandler(controllerUsers.logout));

/**
 * @swagger
 * /api/refresh-token:
 *   get:
 *     summary: Làm mới token
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: Token mới
 */
router.get('/api/refresh-token', asyncHandler(controllerUsers.refreshToken));

/**
 * @swagger
 * /api/change-password:
 *   post:
 *     summary: Đổi mật khẩu
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Đổi mật khẩu thành công
 */
router.post('/api/change-password', authUser, asyncHandler(controllerUsers.changePassword));

/**
 * @swagger
 * /api/forgot-password:
 *   post:
 *     summary: Gửi email quên mật khẩu
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Gửi email thành công
 */
router.post('/api/forgot-password', asyncHandler(controllerUsers.sendMailForgotPassword));

/**
 * @swagger
 * /api/reset-password:
 *   post:
 *     summary: Xác thực OTP đổi mật khẩu
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Đổi mật khẩu thành công
 */
router.post('/api/reset-password', asyncHandler(controllerUsers.verifyOtp));

/**
 * @swagger
 * /api/update-info-user:
 *   post:
 *     summary: Cập nhật thông tin người dùng
 *     tags: [Users]
 *     requestBody:
 *       required: true
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
 *         description: Cập nhật thành công
 */
router.post('/api/update-info-user', authUser, upload.single('avatar'), asyncHandler(controllerUsers.updateInfoUser));

/**
 * @swagger
 * /api/update-password:
 *   post:
 *     summary: Đổi mật khẩu (có xác thực)
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Đổi mật khẩu thành công
 */
router.post('/api/update-password', authUser, asyncHandler(controllerUsers.updatePassword));

/**
 * @swagger
 * /api/get-admin-stats:
 *   get:
 *     summary: Lấy thống kê admin
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: Thống kê admin
 */
router.get('/api/get-admin-stats', authAdmin, asyncHandler(controllerUsers.getAdminStats));

/**
 * @swagger
 * /api/get-all-users:
 *   get:
 *     summary: Lấy tất cả user
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: Danh sách user
 */
router.get('/api/get-all-users', authAdmin, asyncHandler(controllerUsers.getAllUser));

/**
 * @swagger
 * /api/update-user:
 *   post:
 *     summary: Admin cập nhật user
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Cập nhật user thành công
 */
router.post('/api/update-user', authAdmin, asyncHandler(controllerUsers.updateUser));

/**
 * @swagger
 * /admin:
 *   get:
 *     summary: Xác thực admin
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: Xác thực admin thành công
 */
router.get('/admin', authAdmin, asyncHandler(controllerUsers.authAdmin));

module.exports = router;

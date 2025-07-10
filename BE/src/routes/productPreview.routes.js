const express = require('express');
const router = express.Router();

const { asyncHandler, authUser, authAdmin } = require('../auth/checkAuth');

const controllerProductPreview = require('../controllers/productPreview.controller');

router.post('/api/create-product-preview', authUser, asyncHandler(controllerProductPreview.createProductPreview));

module.exports = router;

const userRoutes = require('./users.routes');
const productRoutes = require('./products.routes');
const cartRoutes = require('./cart.routes');
const paymentsRoutes = require('./payments.routes');
const categoryRoutes = require('./category.routes');
const couponRoutes = require('./coupon.routes');
const productPreviewRoutes = require('./productPreview.routes');
const commentRoutes = require('./comment.routes');

function routes(app) {
    app.post('/api/register', userRoutes);
    app.post('/api/login', userRoutes);
    app.post('/api/login-google', userRoutes);
    app.get('/api/auth', userRoutes);
    app.get('/api/logout', userRoutes);
    app.get('/api/refresh-token', userRoutes);
    app.post('/api/change-password', userRoutes);
    app.get('/api/get-admin-stats', userRoutes);
    app.get('/api/get-all-users', userRoutes);
    app.post('/api/forgot-password', userRoutes);
    app.post('/api/reset-password', userRoutes);
    app.post('/api/update-info-user', userRoutes);
    app.post('/api/update-password', userRoutes);
    app.post('/api/login-google', userRoutes);
    app.post('/api/update-user', userRoutes);
    app.get('/admin', userRoutes);

    app.post('/api/create-category', categoryRoutes);
    app.get('/api/get-all-category', categoryRoutes);
    app.delete('/api/delete-category', categoryRoutes);
    app.post('/api/update-category', categoryRoutes);
    app.get('/api/get-product-by-category', categoryRoutes);
    app.get('/api/filter-product-category', categoryRoutes);

    app.post('/api/add-product', productRoutes);
    app.post('/api/upload-image', productRoutes);
    app.get('/api/products', productRoutes);
    app.get('/api/product', productRoutes);
    app.get('/api/all-product', productRoutes);
    app.post('/api/edit-product', productRoutes);
    app.delete('/api/delete-product', productRoutes);
    app.get('/api/search-product', productRoutes);
    app.get('/api/filter-product', productRoutes);

    app.post('/api/add-to-cart', cartRoutes);
    app.get('/api/get-cart', cartRoutes);
    app.delete('/api/delete-cart', cartRoutes);
    app.post('/api/update-cart-quantity', cartRoutes);
    app.post('/api/update-info-user-cart', cartRoutes);
    app.post('/api/apply-coupon', cartRoutes);

    app.post('/api/payment', paymentsRoutes);
    app.get('/api/check-payment-momo', paymentsRoutes);
    app.get('/api/check-payment-vnpay', paymentsRoutes);
    app.get('/api/get-history-order', paymentsRoutes);
    app.get('/api/get-one-payment', paymentsRoutes);
    app.post('/api/update-status-order', paymentsRoutes);
    app.get('/api/get-order-admin', paymentsRoutes);
    app.post('/api/cancel-order', paymentsRoutes);

    app.post('/api/create-coupon', couponRoutes);
    app.get('/api/coupon', couponRoutes);
    app.get('/api/coupons', couponRoutes);
    app.delete('/api/delete-coupon', couponRoutes);
    app.post('/api/update-coupon', couponRoutes);

    app.post('/api/create-product-preview', productPreviewRoutes);

    app.post('/api/create-comment', commentRoutes);
}

module.exports = routes;

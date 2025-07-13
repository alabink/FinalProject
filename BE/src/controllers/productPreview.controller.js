const { BadRequestError } = require('../core/error.response');
const { OK } = require('../core/success.response');

const modelProductPreview = require('../models/productPreview.model');
const modelPayments = require('../models/payments.model');

class controllerProductPreview {
    async createProductPreview(req, res) {
        const { id } = req.user;
        const { productId, rating, comment, orderId } = req.body;

        // Kiểm tra xem orderId có được truyền vào không
        if (!orderId) {
            throw new BadRequestError('Thiếu thông tin đơn hàng');
        }

        // Kiểm tra xem đơn hàng có tồn tại và thuộc về user này không
        const order = await modelPayments.findOne({ 
            _id: orderId, 
            userId: id 
        });

        if (!order) {
            throw new BadRequestError('Không tìm thấy đơn hàng hoặc đơn hàng không thuộc về bạn');
        }

        // Kiểm tra xem đơn hàng đã được giao thành công chưa
        if (order.statusOrder !== 'delivered') {
            throw new BadRequestError('Chỉ có thể đánh giá sản phẩm từ đơn hàng đã giao thành công');
        }

        // Kiểm tra xem sản phẩm có trong đơn hàng này không
        const productInOrder = order.products.find(p => p.productId.toString() === productId);
        if (!productInOrder) {
            throw new BadRequestError('Sản phẩm không có trong đơn hàng này');
        }

        // Kiểm tra xem sản phẩm đã được đánh giá chưa
        const existingReview = await modelProductPreview.findOne({
            userId: id,
            productId,
            orderId
        });

        if (existingReview) {
            throw new BadRequestError('Bạn đã đánh giá sản phẩm này rồi');
        }

        const productPreview = await modelProductPreview.create({
            userId: id,
            productId,
            orderId,
            rating,
            comment,
        });

        new OK({
            message: 'Tạo đánh giá sản phẩm thành công',
            metadata: productPreview,
        }).send(res);
    }
}

module.exports = new controllerProductPreview();

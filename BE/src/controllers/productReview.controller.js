const { BadRequestError } = require('../core/error.response');
const { OK } = require('../core/success.response');

const modelProductPreview = require('../models/productPreview.model');

class controllerProductPreview {
    async createProductPreview(req, res) {
        const { id } = req.user;
        const { productId, rating, comment } = req.body;

        const productPreview = await modelProductPreview.create({
            userId: id,
            productId,
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

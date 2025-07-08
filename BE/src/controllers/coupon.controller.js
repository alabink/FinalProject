const modelCoupon = require('../models/coupon.model');
const modelCart = require('../models/cart.model');
const modelProduct = require('../models/products.model');
const { BadRequestError } = require('../core/error.response');
const { OK } = require('../core/success.response');

const dayjs = require('dayjs');

class controllerCoupon {
    async createCoupon(req, res) {
        const { nameCoupon, discount, quantity, startDate, endDate, minPrice, productUsed } = req.body;
        if (!nameCoupon || !discount || !quantity || !startDate || !endDate || !minPrice || !productUsed) {
            return res.status(400).json({ message: 'Vui lòng nhập đầy đủ thông tin' });
        }
        const newCoupon = new modelCoupon({
            nameCoupon,
            discount,
            quantity,
            startDate,
            endDate,
            minPrice,
            productUsed,
        });
        await newCoupon.save();
        return res.status(201).json({ message: 'Tạo mã giảm giá thành công' });
    }

    async getCoupons(req, res) {
        const { id } = req.user;
        const today = dayjs().toDate(); // Lấy ngày hiện tại dạng `Date`

        const findCart = await modelCart.findOne({ userId: id });
        if (!findCart) {
            throw new BadRequestError('Không tìm thấy giỏ hàng');
        }

        // Lọc các coupon hợp lệ
        const validCoupons = await modelCoupon.find({
            startDate: { $lte: today }, // Ngày bắt đầu <= hôm nay
            endDate: { $gte: today }, // Ngày kết thúc >= hôm nay
            quantity: { $gt: 0 }, // Số lượng > 0
            minPrice: { $lte: findCart.totalCartBefore },
        });

        return res.status(200).json({
            success: true,
            coupons: validCoupons,
        });
    }

    async getAllCoupon(req, res) {
        const dataCoupon = await modelCoupon.find();

        const data = await Promise.all(
            dataCoupon.map(async (coupon) => {
                if (coupon.productUsed.includes('all')) {
                    const product = await modelProduct.find();
                    return { ...coupon._doc, product };
                } else {
                    const product = await modelProduct.findById(coupon.productUsed);
                    return { ...coupon._doc, product };
                }
            }),
        );
        return res.status(200).json({
            success: true,
            coupons: data,
        });
    }

    async deleteCoupon(req, res) {
        try {
            const { id } = req.query;
            await modelCoupon.findByIdAndDelete(id);
            return res.status(200).json({ message: 'Xoá mã giảm giá thành công' });
        } catch (error) {
            return res.status(500).json({ message: 'error' });
        }
    }

    async updateCoupon(req, res) {
        const { _id, nameCoupon, discount, quantity, startDate, endDate, minPrice, productUsed } = req.body;
        await modelCoupon.findByIdAndUpdate(_id, {
            nameCoupon,
            discount,
            quantity,
            startDate,
            endDate,
            minPrice,
            productUsed,
        });
        return res.status(200).json({ message: 'Cập nhật mã giảm giá thành công' });
    }
}

module.exports = new controllerCoupon();

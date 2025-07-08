const modelProduct = require('../models/products.model');
const modelCart = require('../models/cart.model');
const modelCoupon = require('../models/coupon.model');

const { BadRequestError } = require('../core/error.response');
const { OK } = require('../core/success.response');

class controllerCart {
    async addToCart(req, res) {
        const { productId, quantity } = req.body;
        const { id } = req.user;
        const findProduct = await modelProduct.findById(productId);
        if (!findProduct) {
            throw new BadRequestError('Không tìm thấy sản phẩm');
        }
        if (quantity > findProduct.stock) {
            throw new BadRequestError('Số lượng trong kho không đủ');
        }
        const findCart = await modelCart.findOne({ userId: id });

        const totalPriceProduct =
            findProduct.priceDiscount > 0 ? findProduct.priceDiscount * quantity : findProduct.price * quantity;

        if (!findCart) {
            const newCart = await modelCart.create({
                userId: id,
                product: [{ productId, quantity }],
                totalPrice: totalPriceProduct,
            });

            await newCart.save();

            await modelProduct.updateOne({ _id: productId }, { $inc: { stock: -quantity } });

            new OK({
                message: 'Thêm sản phẩm vào giỏ hàng thành công',
                metadata: findCart,
            }).send(res);
        } else {
            if (findCart.product.some((item) => item.productId.toString() === productId)) {
                findCart.product.find((item) => item.productId.toString() === productId).quantity += quantity;
            } else {
                findCart.product.push({ productId, quantity });
            }
            findCart.totalPrice += totalPriceProduct;
            await findCart.save();

            await modelProduct.updateOne({ _id: productId }, { $inc: { stock: -quantity } });
            new OK({
                message: 'Thêm sản phẩm vào giỏ hàng thành công',
                metadata: findCart,
            }).send(res);
        }
    }

    async getCart(req, res) {
        const { id } = req.user;
        const cart = await modelCart.findOne({ userId: id });
        if (!cart) {
            new OK({
                message: 'Giỏ hàng trống',
                metadata: [],
            }).send(res);
        }

        const data = await Promise.all(
            cart.product.map(async (item) => {
                const product = await modelProduct.findById(item.productId);

                return {
                    ...product?._doc,
                    quantity: item.quantity,
                    price: product?.priceDiscount > 0 ? product?.priceDiscount : product?.price,
                };
            }),
        );

        const newData = {
            data,
            totalPrice: cart.totalPrice,
        };
        new OK({ message: 'Thành công', metadata: { newData } }).send(res);
    }

    async deleteProductCart(req, res) {
        try {
            const { id } = req.user;
            const { productId } = req.query;

            const cart = await modelCart.findOne({ userId: id });
            if (!cart) {
                throw new BadRequestError('Không tìm thấy giỏ hàng');
            }

            const product = await modelProduct.findById(productId);
            if (!product) {
                throw new BadRequestError('Không tìm thấy sản phẩm');
            }

            const index = cart.product.findIndex((item) => item.productId.toString() === productId);
            if (index === -1) {
                throw new BadRequestError('Không tìm thấy sản phẩm trong giỏ hàng');
            }

            // Lưu lại số lượng sản phẩm trước khi xoá
            const removedProduct = cart.product[index];

            // Cập nhật totalPrice trước khi xoá sản phẩm
            cart.totalPrice -=
                (product.priceDiscount > 0 ? product.priceDiscount : product.price) * removedProduct.quantity;

            // Xoá sản phẩm khỏi giỏ hàng
            cart.product.splice(index, 1);

            if (cart.product.length === 0) {
                cart.nameCoupon = null;
                cart.totalPrice = 0;
            }

            await cart.save();

            // Cập nhật lại số lượng tồn kho
            await modelProduct.updateOne({ _id: productId }, { $inc: { stock: removedProduct.quantity } });

            new OK({ message: 'Xoá thành công', metadata: cart }).send(res);
        } catch (error) {
            new BadRequestError(error.message).send(res);
        }
    }

    async updateInfoUserCart(req, res) {
        const { id } = req.user;
        const { fullName, phone, address } = req.body;
        const cart = await modelCart.findOne({ userId: id });
        if (!cart) {
            throw new BadRequestError('Không tìm thấy giỏ hàng');
        }
        cart.fullName = fullName;
        cart.phone = phone;
        cart.address = address;
        await cart.save();
        new OK({ message: 'Thành công', metadata: cart }).send(res);
    }

    async applyCoupon(req, res) {
        const { nameCoupon } = req.body;
        const { id } = req.user;
        const dataCart = await modelCart.findOne({ userId: id });
        const findCoupon = await modelCoupon.findOne({ nameCoupon: nameCoupon });

        if (dataCart.nameCoupon === nameCoupon) {
            throw new BadRequestError('Mã giảm giá đã được áp dụng');
        }

        if (!findCoupon) {
            throw new BadRequestError('Mã giảm giá không tồn tại');
        }

        const productUser = dataCart.product.map((item) => item.productId);

        if (findCoupon.productUsed[0] === 'all') {
            const dataCoupon = await modelCoupon.findOne({ nameCoupon });
            if (dataCoupon) {
                dataCart.totalPrice -= dataCoupon.discount;
                dataCart.nameCoupon = nameCoupon;
            } else {
                throw new BadRequestError('Mã giảm giá không tồn tại');
            }
            await dataCart.save();
            return res.status(200).json({ message: 'Áp dụng mã giảm giá thành công', metadata: dataCart });
        }

        if (!findCoupon.productUsed.some((product) => productUser.includes(product))) {
            throw new BadRequestError('Mã giảm giá không hợp lệ');
        }
        if (!dataCart.nameCoupon) {
            const dataCoupon = await modelCoupon.findOne({ nameCoupon });
            if (dataCoupon) {
                dataCart.totalPrice -= dataCoupon.discount;
                dataCart.nameCoupon = nameCoupon;
            } else {
                throw new BadRequestError('Mã giảm giá không tồn tại');
            }
            await dataCart.save();
        }

        if (dataCart) {
            const updatedCart = await modelCart.findOneAndUpdate({ userId: id }, { nameCoupon });
            new OK({ message: 'Áp dụng mã giảm giá thành công', metadata: updatedCart }).send(res);
        }
    }
}

module.exports = new controllerCart();

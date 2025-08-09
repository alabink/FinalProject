const modelProduct = require('../models/products.model');
const modelCart = require('../models/cart.model');
const modelCoupon = require('../models/coupon.model');

const { BadRequestError } = require('../core/error.response');
const { OK } = require('../core/success.response');

class controllerCart {
    async addToCart(req, res) {
        const { productId, quantity, variantId, sku, variantInfo } = req.body;
        const { id } = req.user;
        const findProduct = await modelProduct.findById(productId);
        if (!findProduct) {
            throw new BadRequestError('Không tìm thấy sản phẩm');
        }
        
        // Kiểm tra tồn kho dựa trên variant nếu có
        let stockToCheck = findProduct.stock;
        let priceToUse = findProduct.priceDiscount > 0 ? findProduct.priceDiscount : findProduct.price;
        
        // Nếu có variantId, tìm và sử dụng thông tin từ variant
        if (variantId && findProduct.variants) {
            const variant = findProduct.variants.find(v => v._id.toString() === variantId);
            if (variant) {
                stockToCheck = variant.stock;
                priceToUse = variant.priceDiscount > 0 ? variant.priceDiscount : variant.price;
            }
        }
        
        if (quantity > stockToCheck) {
            throw new BadRequestError('Số lượng trong kho không đủ');
        }
        
        const findCart = await modelCart.findOne({ userId: id });

        const totalPriceProduct = priceToUse * quantity;
        
        // Tạo cartItem với thông tin variant nếu có
        const cartItem = {
            productId,
            quantity,
        };
        
        // Thêm thông tin variant nếu có
        if (variantId) {
            cartItem.variantId = variantId;
            cartItem.sku = sku;
            cartItem.variantInfo = variantInfo;
        }

        if (!findCart) {
            const newCart = await modelCart.create({
                userId: id,
                product: [cartItem],
                totalPrice: totalPriceProduct,
            });

            await newCart.save();

            // Cập nhật tồn kho dựa trên variant nếu có
            if (variantId && findProduct.variants) {
                // Cập nhật stock trong variant
                await modelProduct.updateOne(
                    { _id: productId, "variants._id": variantId },
                    { $inc: { "variants.$.stock": -quantity } }
                );
            } else {
            await modelProduct.updateOne({ _id: productId }, { $inc: { stock: -quantity } });
            }

            new OK({
                message: 'Thêm sản phẩm vào giỏ hàng thành công',
                metadata: newCart,
            }).send(res);
        } else {
            // Tìm sản phẩm với cùng productId và variantId (nếu có)
            const existingProductIndex = findCart.product.findIndex(item => {
                if (variantId) {
                    return item.productId.toString() === productId && 
                           item.variantId && item.variantId.toString() === variantId;
                }
                return item.productId.toString() === productId && !item.variantId;
            });
            
            if (existingProductIndex !== -1) {
                // Cập nhật số lượng nếu đã có sản phẩm với variant tương tự
                findCart.product[existingProductIndex].quantity += quantity;
            } else {
                // Thêm sản phẩm mới vào giỏ hàng
                findCart.product.push(cartItem);
            }
            
            findCart.totalPrice += totalPriceProduct;
            await findCart.save();

            // Cập nhật tồn kho dựa trên variant nếu có
            if (variantId && findProduct.variants) {
                // Cập nhật stock trong variant
                await modelProduct.updateOne(
                    { _id: productId, "variants._id": variantId },
                    { $inc: { "variants.$.stock": -quantity } }
                );
            } else {
            await modelProduct.updateOne({ _id: productId }, { $inc: { stock: -quantity } });
            }
            
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
            return;
        }

        const data = await Promise.all(
            cart.product.map(async (item) => {
                const product = await modelProduct.findById(item.productId);
                
                // Tìm variant nếu có
                let variant = null;
                if (item.variantId && product?.variants) {
                    variant = product.variants.find(
                        v => v._id.toString() === item.variantId.toString()
                    );
                }

                return {
                    ...product?._doc,
                    quantity: item.quantity,
                    price: variant ? 
                        (variant.priceDiscount > 0 ? variant.priceDiscount : variant.price) :
                        (product?.priceDiscount > 0 ? product?.priceDiscount : product?.price),
                    // Thêm thông tin variant
                    variant: variant || item.variantInfo || null,
                    variantId: item.variantId || null,
                    sku: item.sku || null,
                };
            }),
        );

        const newData = {
            data,
            totalPrice: cart.totalPrice,
            subtotal: cart.totalPrice,
            couponApplied: null
        };

        // Thêm thông tin mã giảm giá nếu có
        if (cart.nameCoupon) {
            const coupon = await modelCoupon.findOne({ nameCoupon: cart.nameCoupon });
            if (coupon) {
                newData.subtotal = cart.totalPrice + coupon.discount;
                newData.couponApplied = {
                    nameCoupon: coupon.nameCoupon,
                    discount: coupon.discount
                };
            }
        }

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

    async updateCartQuantity(req, res) {
        try {
            const { id } = req.user;
            const { productId, quantity } = req.body;

            if (!productId || !quantity || quantity < 1) {
                throw new BadRequestError('Thông tin không hợp lệ');
            }

            const cart = await modelCart.findOne({ userId: id });
            if (!cart) {
                throw new BadRequestError('Không tìm thấy giỏ hàng');
            }

            const product = await modelProduct.findById(productId);
            if (!product) {
                throw new BadRequestError('Không tìm thấy sản phẩm');
            }

            const cartItemIndex = cart.product.findIndex((item) => item.productId.toString() === productId);
            if (cartItemIndex === -1) {
                throw new BadRequestError('Không tìm thấy sản phẩm trong giỏ hàng');
            }

            const cartItem = cart.product[cartItemIndex];
            const oldQuantity = cartItem.quantity;
            const quantityDifference = quantity - oldQuantity;

            // Kiểm tra tồn kho
            if (quantityDifference > 0 && product.stock < quantityDifference) {
                throw new BadRequestError('Số lượng trong kho không đủ');
            }

            // Cập nhật số lượng sản phẩm trong giỏ hàng
            cartItem.quantity = quantity;

            // Tính lại tổng giá
            const unitPrice = product.priceDiscount > 0 ? product.priceDiscount : product.price;
            cart.totalPrice += unitPrice * quantityDifference;

            // Cập nhật tồn kho
            await modelProduct.updateOne({ _id: productId }, { $inc: { stock: -quantityDifference } });

            await cart.save();

            new OK({ 
                message: 'Cập nhật số lượng thành công', 
                metadata: cart 
            }).send(res);
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

    async applyCoupon(req, res, next) {
        try {
            const { id } = req.user;
        const { nameCoupon } = req.body;

            // Check if coupon exists
            const coupon = await modelCoupon.findOne({ nameCoupon });
            if (!coupon) {
                return res.status(400).json({
                    success: false,
                    message: 'Mã giảm giá không tồn tại'
                });
        }

            // Check if coupon is expired
            const currentDate = new Date();
            if (currentDate < coupon.startDate || currentDate > coupon.endDate) {
                return res.status(400).json({
                    success: false,
                    message: 'Mã giảm giá đã hết hạn hoặc chưa đến thời gian sử dụng'
                });
        }

            // Check if coupon is out of stock
            if (coupon.quantity <= 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Mã giảm giá đã hết lượt sử dụng'
                });
            }

            // Get user's cart
            const cart = await modelCart.findOne({ userId: id });
            if (!cart) {
                return res.status(400).json({
                    success: false,
                    message: 'Không tìm thấy giỏ hàng'
                });
            }

            // Check if cart is empty
            if (!cart.product || cart.product.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Giỏ hàng trống'
                });
            }

            // Calculate total price
            let totalPrice = 0;
            for (const item of cart.product) {
                const product = await modelProduct.findById(item.productId);
                if (!product) {
                    return res.status(400).json({
                        success: false,
                        message: 'Sản phẩm không tồn tại'
                    });
        }

                // Get price based on variant or product price
                let price = product.price;
                if (item.variantId && product.variants && product.variants.length > 0) {
                    const variant = product.variants.find(v => v._id.toString() === item.variantId.toString());
                    if (variant) {
                        price = variant.priceDiscount > 0 ? variant.priceDiscount : variant.price;
                    }
            } else {
                    price = product.priceDiscount > 0 ? product.priceDiscount : product.price;
                }

                totalPrice += price * item.quantity;
            }

            // Check if cart meets minimum price requirement
            if (totalPrice < coupon.minPrice) {
                return res.status(400).json({
                    success: false,
                    message: `Giá trị đơn hàng tối thiểu để sử dụng mã giảm giá này là ${coupon.minPrice.toLocaleString('vi-VN')}đ`
                });
            }

            // Check if coupon is applicable to products in cart
            if (!coupon.productUsed.includes('all')) {
                let isApplicable = false;
                for (const item of cart.product) {
                    if (coupon.productUsed.includes(item.productId.toString())) {
                        isApplicable = true;
                        break;
                    }
                }
                if (!isApplicable) {
                    return res.status(400).json({
                        success: false,
                        message: 'Mã giảm giá không áp dụng cho sản phẩm trong giỏ hàng'
                    });
                }
            }

            // Apply coupon
            cart.nameCoupon = nameCoupon;
            
            // Ensure total price is not negative after applying coupon
            cart.totalPrice = Math.max(0, totalPrice - coupon.discount);

            await cart.save();

            // Decrease coupon quantity
            coupon.quantity -= 1;
            await coupon.save();

            return res.status(200).json({
                success: true,
                message: 'Áp dụng mã giảm giá thành công',
                metadata: {
                    cart,
                    discount: coupon.discount,
                    originalPrice: totalPrice
                }
            });
        } catch (error) {
            console.error('Error applying coupon:', error);
            return res.status(500).json({
                success: false,
                message: 'Có lỗi xảy ra khi áp dụng mã giảm giá'
            });
        }
    }
}

module.exports = new controllerCart();

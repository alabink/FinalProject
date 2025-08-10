const modelPayments = require('../models/payments.model');
const modelCart = require('../models/cart.model');
const modelProduct = require('../models/products.model');
const modelProductPreview = require('../models/productPreview.model');
const modelCoupon = require('../models/coupon.model');
const UserInteraction = require('../models/userInteraction.model');

const { BadRequestError } = require('../core/error.response');
const { OK } = require('../core/success.response');

const crypto = require('crypto');
const axios = require('axios');
const { VNPay, ignoreLogger, ProductCode, VnpLocale, dateFormat } = require('vnpay');

async function trackPurchases(userId, products) {
    try {
        // Track each purchased product
        for (const product of products) {
            const existingInteraction = await UserInteraction.findOne({
                userId,
                productId: product.productId
            });
            
            if (existingInteraction) {
                // Update existing interaction
                existingInteraction.purchase += product.quantity;
                existingInteraction.timestamp = new Date();
                await existingInteraction.save();
            } else {
                // Create new interaction
                const newInteraction = new UserInteraction({
                    userId,
                    productId: product.productId,
                    purchase: product.quantity,
                    timestamp: new Date()
                });
                await newInteraction.save();
            }
        }
    } catch (error) {
        console.error('Error tracking purchases:', error);
        // Don't throw error to avoid interrupting the payment flow
    }
}

class PaymentsController {
    async payment(req, res) {
        try {
            const { id } = req.user;
            const { typePayment } = req.body;
            if (!typePayment) {
                throw new BadRequestError('Vui lòng nhập đầy đủ thông tin');
            }

            const findCart = await modelCart.findOne({ userId: id });
            if (!findCart) {
                throw new BadRequestError('Không tìm thấy giỏ hàng');
            }
            if (findCart.address === '' || findCart.phone === '' || findCart.fullName === '') {
                throw new BadRequestError('Vui lòng nhập đầy đủ thông tin');
            }
            
            // Tính toán tổng tiền thực tế (không thể âm)
            let totalPrice = Math.max(0, findCart.totalPrice || 0);
            
            if (typePayment === 'COD') {
                // Tạo mảng sản phẩm với thông tin variant đầy đủ
                const orderProducts = findCart.product.map(item => ({
                    productId: item.productId,
                    quantity: item.quantity,
                    variantId: item.variantId || null,
                    sku: item.sku || null,
                    variantInfo: item.variantInfo || null
                }));
                
                // Tạo đối tượng payment với các thông tin cơ bản
                const paymentData = {
                    userId: id,
                    products: orderProducts,
                    address: findCart.address,
                    phone: findCart.phone,
                    fullName: findCart.fullName,
                    typePayments: 'COD',
                    totalPrice: totalPrice,
                    statusOrder: 'pending',
                };
                
                // Nếu có mã giảm giá, thêm thông tin mã giảm giá vào đơn hàng
                if (findCart.nameCoupon) {
                    const coupon = await modelCoupon.findOne({ nameCoupon: findCart.nameCoupon });
                    if (coupon) {
                        // Tính toán giá trị gốc của đơn hàng trước khi áp dụng giảm giá
                        let originalPrice = 0;
                        for (const item of findCart.product) {
                            const product = await modelProduct.findById(item.productId);
                            if (product) {
                                // Tính giá dựa trên variant hoặc giá sản phẩm
                                let price = product.price;
                                if (item.variantId && product.variants && product.variants.length > 0) {
                                    const variant = product.variants.find(v => v._id.toString() === item.variantId.toString());
                                    if (variant) {
                                        price = variant.priceDiscount > 0 ? variant.priceDiscount : variant.price;
                                    }
                                } else {
                                    price = product.priceDiscount > 0 ? product.priceDiscount : product.price;
                                }
                                originalPrice += price * item.quantity;
                            }
                        }
                        
                        // Đảm bảo giảm giá không lớn hơn tổng tiền gốc
                        const discount = Math.min(coupon.discount, originalPrice);
                        
                        paymentData.couponApplied = {
                            nameCoupon: coupon.nameCoupon,
                            discount: discount
                        };
                        
                        // Đảm bảo tổng tiền không âm
                        paymentData.totalPrice = Math.max(0, originalPrice - discount);
                    }
                }
                
                const newPayment = new modelPayments(paymentData);
                await newPayment.save();
                await findCart.deleteOne();

                // Track purchases for recommendation system
                await trackPurchases(id, orderProducts);

                new OK({
                    message: 'Thanh toán thành công',
                    metadata: newPayment._id,
                }).send(res);
            }
            if (typePayment === 'MOMO') {
                var partnerCode = 'MOMO';
                var accessKey = 'F8BBA842ECF85';
                var secretkey = 'K951B6PE1waDMi640xX08PD3vg6EkVlz';
                var requestId = partnerCode + new Date().getTime();
                var orderId = requestId;
                var orderInfo = `thanh toan ${findCart._id}`; // nội dung giao dịch thanh toán
                var redirectUrl = 'http://localhost:3000/api/check-payment-momo'; // 8080
                var ipnUrl = 'http://localhost:3000/api/check-payment-momo';
                var amount = totalPrice;
                var requestType = 'captureWallet';
                var extraData = ''; //pass empty value if your merchant does not have stores

                var rawSignature =
                    'accessKey=' +
                    accessKey +
                    '&amount=' +
                    amount +
                    '&extraData=' +
                    extraData +
                    '&ipnUrl=' +
                    ipnUrl +
                    '&orderId=' +
                    orderId +
                    '&orderInfo=' +
                    orderInfo +
                    '&partnerCode=' +
                    partnerCode +
                    '&redirectUrl=' +
                    redirectUrl +
                    '&requestId=' +
                    requestId +
                    '&requestType=' +
                    requestType;
                //puts raw signature

                //signature
                var signature = crypto.createHmac('sha256', secretkey).update(rawSignature).digest('hex');

                //json object send to MoMo endpoint
                const requestBody = JSON.stringify({
                    partnerCode: partnerCode,
                    accessKey: accessKey,
                    requestId: requestId,
                    amount: amount,
                    orderId: orderId,
                    orderInfo: orderInfo,
                    redirectUrl: redirectUrl,
                    ipnUrl: ipnUrl,
                    extraData: extraData,
                    requestType: requestType,
                    signature: signature,
                    lang: 'en',
                });

                const response = await axios.post('https://test-payment.momo.vn/v2/gateway/api/create', requestBody, {
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });
                new OK({
                    message: 'Thanh toán thông báo',
                    metadata: response.data,
                }).send(res);
            }
            if (typePayment === 'VNPAY') {
                const vnpay = new VNPay({
                    tmnCode: process.env.VNPAY_TMN_CODE,
                    secureSecret: process.env.VNPAY_SECRET,
                    vnpayHost: process.env.VNPAY_HOST || 'https://sandbox.vnpayment.vn',
                    testMode: (process.env.VNPAY_TEST_MODE || 'true') === 'true', // mặc định chạy sandbox
                    hashAlgorithm: 'SHA512', // tùy chọn
                    loggerFn: ignoreLogger, // tùy chọn
                });

                // Ngày hết hạn (cộng thêm 1 ngày)
                const tomorrow = new Date();
                tomorrow.setDate(tomorrow.getDate() + 1);

                const vnpayResponse = await vnpay.buildPaymentUrl({
                    vnp_Amount: totalPrice,
                    vnp_IpAddr: req.ip || req.connection.remoteAddress || '127.0.0.1',
                    vnp_TxnRef: findCart._id,
                    vnp_OrderInfo: `${findCart._id}`,
                    vnp_OrderType: ProductCode.Other,
                    vnp_ReturnUrl: `${process.env.SERVER_URL || 'http://localhost:3000'}/api/check-payment-vnpay`,
                    vnp_Locale: VnpLocale.VN,
                    vnp_CreateDate: dateFormat(new Date()),
                    vnp_ExpireDate: dateFormat(tomorrow),
                });

                new OK({
                    message: 'Thanh toán thông báo',
                    metadata: vnpayResponse,
                }).send(res);
            }
        } catch (error) {
            console.error('Error in payment:', error);
            throw new BadRequestError('Lỗi khi thanh toán');
        }
    }

    async checkPaymentMomo(req, res, next) {
        const { orderInfo, resultCode } = req.query;
        if (resultCode === '0') {
            const result = orderInfo.split(' ')[2];
            const findCart = await modelCart.findOne({ _id: result });
            
            // Tạo mảng sản phẩm với thông tin variant đầy đủ
            const momoOrderProducts = findCart.product.map(item => ({
                productId: item.productId,
                quantity: item.quantity,
                variantId: item.variantId || null,
                sku: item.sku || null,
                variantInfo: item.variantInfo || null
            }));
            
            // Tính toán giá trị gốc của đơn hàng
            let originalPrice = 0;
            for (const item of findCart.product) {
                const product = await modelProduct.findById(item.productId);
                if (product) {
                    // Tính giá dựa trên variant hoặc giá sản phẩm
                    let price = product.price;
                    if (item.variantId && product.variants && product.variants.length > 0) {
                        const variant = product.variants.find(v => v._id.toString() === item.variantId.toString());
                        if (variant) {
                            price = variant.priceDiscount > 0 ? variant.priceDiscount : variant.price;
                        }
                    } else {
                        price = product.priceDiscount > 0 ? product.priceDiscount : product.price;
                    }
                    originalPrice += price * item.quantity;
                }
            }
            
            // Tạo đối tượng payment với các thông tin cơ bản
            const paymentData = {
                userId: findCart.userId,
                products: momoOrderProducts,
                address: findCart.address,
                phone: findCart.phone,
                fullName: findCart.fullName,
                typePayments: 'MOMO',
                totalPrice: originalPrice, // Giá gốc trước khi áp dụng mã giảm giá
            };
            
            // Nếu có mã giảm giá, thêm thông tin mã giảm giá vào đơn hàng
            if (findCart.nameCoupon) {
                const coupon = await modelCoupon.findOne({ nameCoupon: findCart.nameCoupon });
                if (coupon) {
                    // Đảm bảo giảm giá không lớn hơn tổng tiền gốc
                    const discount = Math.min(coupon.discount, originalPrice);
                    
                    paymentData.couponApplied = {
                        nameCoupon: coupon.nameCoupon,
                        discount: discount
                    };
                    
                    // Đảm bảo tổng tiền không âm
                    paymentData.totalPrice = Math.max(0, originalPrice - discount);
                }
            }
            
            const newPayment = new modelPayments(paymentData);
            await newPayment.save();
            await findCart.deleteOne();

            // Track purchases for recommendation system
            await trackPurchases(newPayment.userId, momoOrderProducts);

            return res.redirect(`http://localhost:5173/payment/${newPayment._id}`);
        }
    }

    async checkPaymentVnpay(req, res) {
        const { vnp_ResponseCode, vnp_OrderInfo } = req.query;
        if (vnp_ResponseCode === '00') {
            const idCart = vnp_OrderInfo;
            const findCart = await modelCart.findOne({ _id: idCart });
            
            // Tạo mảng sản phẩm với thông tin variant đầy đủ
            const vnpayOrderProducts = findCart.product.map(item => ({
                productId: item.productId,
                quantity: item.quantity,
                variantId: item.variantId || null,
                sku: item.sku || null,
                variantInfo: item.variantInfo || null
            }));
            
            // Tính toán giá trị gốc của đơn hàng
            let originalPrice = 0;
            for (const item of findCart.product) {
                const product = await modelProduct.findById(item.productId);
                if (product) {
                    // Tính giá dựa trên variant hoặc giá sản phẩm
                    let price = product.price;
                    if (item.variantId && product.variants && product.variants.length > 0) {
                        const variant = product.variants.find(v => v._id.toString() === item.variantId.toString());
                        if (variant) {
                            price = variant.priceDiscount > 0 ? variant.priceDiscount : variant.price;
                        }
                    } else {
                        price = product.priceDiscount > 0 ? product.priceDiscount : product.price;
                    }
                    originalPrice += price * item.quantity;
                }
            }
            
            // Tạo đối tượng payment với các thông tin cơ bản
            const paymentData = {
                userId: findCart.userId,
                products: vnpayOrderProducts,
                address: findCart.address,
                phone: findCart.phone,
                fullName: findCart.fullName,
                typePayments: 'VNPAY',
                totalPrice: originalPrice, // Giá gốc trước khi áp dụng mã giảm giá
            };
            
            // Nếu có mã giảm giá, thêm thông tin mã giảm giá vào đơn hàng
            if (findCart.nameCoupon) {
                const coupon = await modelCoupon.findOne({ nameCoupon: findCart.nameCoupon });
                if (coupon) {
                    // Đảm bảo giảm giá không lớn hơn tổng tiền gốc
                    const discount = Math.min(coupon.discount, originalPrice);
                    
                    paymentData.couponApplied = {
                        nameCoupon: coupon.nameCoupon,
                        discount: discount
                    };
                    
                    // Đảm bảo tổng tiền không âm
                    paymentData.totalPrice = Math.max(0, originalPrice - discount);
                }
            }
            
            const newPayment = new modelPayments(paymentData);
            await newPayment.save();
            await findCart.deleteOne();

            // Track purchases for recommendation system
            await trackPurchases(newPayment.userId, vnpayOrderProducts);

            return res.redirect(`http://localhost:5173/payment/${newPayment._id}`);
        }
    }

    async getHistoryOrder(req, res) {
        const { id } = req.user;
        const payments = await modelPayments.find({ userId: id });

        const orders = await Promise.all(
            payments.map(async (order) => {
                const orderHistoryProducts = await Promise.all(
                    order.products.map(async (item) => {
                        const product = await modelProduct.findById(item.productId);
                        const dataPreview = await modelProductPreview.find({ 
                            productId: item.productId, 
                            orderId: order._id 
                        });
                        
                        if (!product) {
                            return {
                                productId: item.productId,
                                name: 'Sản phẩm không tồn tại',
                                image: '',
                                price: 0,
                                quantity: item.quantity,
                                variantInfo: item.variantInfo || null,
                                sku: item.sku || null,
                            };
                        }
                        
                        // Tính giá dựa trên variant nếu có
                        let price = product.price;
                        let priceDiscount = product.priceDiscount;
                        
                        if (item.variantId && product.variants && product.variants.length > 0) {
                            const variant = product.variants.find(v => 
                                v._id.toString() === item.variantId.toString()
                            );
                            
                            if (variant) {
                                price = variant.price;
                                priceDiscount = variant.priceDiscount;
                            }
                        }
                        
                        // Sử dụng giá khuyến mãi nếu có
                        const finalPrice = priceDiscount > 0 ? priceDiscount : price;

                        return {
                            productId: product._id,
                            name: product.name,
                            image: item.variantInfo?.color?.image || product.images[0],
                            price: finalPrice,
                            quantity: item.quantity,
                            variantInfo: item.variantInfo || null,
                            sku: item.sku || null,
                            dataPreview,
                        };
                    }),
                );

                return {
                    orderId: order._id,
                    fullName: order.fullName,
                    phone: order.phone,
                    address: order.address,
                    totalPrice: order.totalPrice,
                    typePayments: order.typePayments,
                    statusOrder: order.statusOrder,
                    createdAt: order.createdAt,
                    products: orderHistoryProducts,
                    couponApplied: order.couponApplied || null,
                };
            }),
        );

        new OK({ message: 'Thành công', metadata: { orders } }).send(res);
    }

    async getOnePayment(req, res, next) {
        try {
            const { id } = req.query;
            if (!id) {
                throw new BadRequestError('Không tìm thấy đơn hàng');
            }

            const findPayment = await modelPayments.findById(id);

            if (!findPayment) {
                throw new BadRequestError('Không tìm thấy đơn hàng');
            }

            // Tính tổng giá trị sản phẩm trước khi áp dụng mã giảm giá
            let subtotal = 0;
            let couponInfo = null;

            const dataProduct = await Promise.all(
                findPayment.products.map(async (item) => {
                    try {
                    const product = await modelProduct.findById(item.productId);
                    
                    // Lấy thông tin về variant (màu sắc và phiên bản) từ sản phẩm
                    let variantInfo = null;
                    let variantPrice = product?.price || 0;
                    let variantPriceDiscount = product?.priceDiscount || 0;
                    
                        // Nếu có thông tin về variant từ đơn hàng
                    if (item.variantInfo) {
                        variantInfo = item.variantInfo;
                        
                        // Tìm variant tương ứng trong sản phẩm để lấy giá
                        if (product?.variants && product.variants.length > 0) {
                            const matchedVariant = product.variants.find(variant => 
                                variant.color.name === variantInfo.color.name && 
                                variant.storage.size === variantInfo.storage.size
                            );
                            
                            if (matchedVariant) {
                                variantPrice = matchedVariant.price;
                                variantPriceDiscount = matchedVariant.priceDiscount || 0;
                            }
                        }
                    }
                    
                    // Tính giá cuối cùng của sản phẩm
                    const finalPrice = variantPriceDiscount > 0 ? variantPriceDiscount : variantPrice;
                    
                    // Cộng vào tổng giá trị sản phẩm
                    subtotal += finalPrice * item.quantity;
                    
                    return {
                            product: product || { name: 'Sản phẩm không tồn tại', images: [] },
                            quantity: item.quantity || 0,
                        variantInfo: item.variantInfo || null,
                        sku: item.sku || null,
                        variantPrice: variantPriceDiscount > 0 ? variantPriceDiscount : variantPrice
                    };
                    } catch (error) {
                        console.error('Error processing product:', error);
                        return {
                            product: { name: 'Sản phẩm không tồn tại', images: [] },
                            quantity: item.quantity || 0,
                            variantInfo: item.variantInfo || null,
                            sku: item.sku || null,
                            variantPrice: 0
                        };
                    }
                }),
            );
            
            // Kiểm tra nếu có mã giảm giá đã áp dụng
            if (findPayment.couponApplied && findPayment.couponApplied.nameCoupon) {
                // Đảm bảo giảm giá không lớn hơn tổng tiền
                const discount = findPayment.couponApplied.discount || 0;
                
                couponInfo = {
                    nameCoupon: findPayment.couponApplied.nameCoupon,
                    discount: discount
                };
            } else {
                // Nếu không có thông tin mã giảm giá nhưng tổng tiền nhỏ hơn subtotal
                if (subtotal > findPayment.totalPrice) {
                    // Tính toán giảm giá dựa trên sự chênh lệch
                    const discount = subtotal - findPayment.totalPrice;
                    
                    couponInfo = {
                        nameCoupon: "Mã giảm giá",
                        discount: discount
                    };
                }
            }
            
            // Đảm bảo totalPrice không âm
            const safeTotal = Math.max(0, findPayment.totalPrice);
            
            // Nếu tổng tiền là 0 và có mã giảm giá, hiển thị rõ là đã được giảm 100%
            let paymentObj = findPayment.toObject();
            paymentObj.totalPrice = safeTotal;
            
            if (safeTotal === 0 && couponInfo && couponInfo.discount >= subtotal) {
                couponInfo.fullDiscount = true; // Đánh dấu là đã được giảm 100%
            }
            
            const data = { 
                findPayment: paymentObj, 
                dataProduct, 
                subtotal,
                couponInfo
            };

            new OK({ message: 'Thành công', metadata: data }).send(res);
        } catch (error) {
            console.error('Error in getOnePayment:', error);
            next(error);
        }
    }

    async updateStatusOrder(req, res, next) {
        const { statusOrder, orderId } = req.body;
        const findPayment = await modelPayments.findById(orderId);
        if (!findPayment) {
            throw new BadRequestError('Không tìm thấy đơn hàng');
        }
        findPayment.statusOrder = statusOrder;
        await findPayment.save();
        new OK({ message: 'Thành công', metadata: findPayment }).send(res);
    }

    async getOrderAdmin(req, res) {
        try {
            const payments = await modelPayments.find().sort({ createdAt: -1 });
            const detailedPayments = await Promise.all(
                payments.map(async (order) => {
                    const orderProducts = await Promise.all(
                        order.products.map(async (item) => {
                            const product = await modelProduct.findById(item?.productId);
                            
                            if (!product) {
                                return {
                                    productId: item.productId,
                                    name: 'Sản phẩm không tồn tại',
                                    image: '',
                                    price: 0,
                                    quantity: item.quantity,
                                    variantInfo: item.variantInfo || null,
                                    sku: item.sku || null,
                                };
                            }
                            
                            // Tính giá dựa trên variant nếu có
                            let price = product.price;
                            let priceDiscount = product.priceDiscount;
                            
                            if (item.variantId && product.variants && product.variants.length > 0) {
                                const variant = product.variants.find(v => 
                                    v._id.toString() === item.variantId.toString()
                                );
                                
                                if (variant) {
                                    price = variant.price;
                                    priceDiscount = variant.priceDiscount;
                                }
                            }
                            
                            // Sử dụng giá khuyến mãi nếu có
                            const finalPrice = priceDiscount > 0 ? priceDiscount : price;

                            return {
                                productId: product._id,
                                name: product.name,
                                image: item.variantInfo?.color?.image || product.images[0],
                                price: finalPrice,
                                quantity: item.quantity,
                                variantInfo: item.variantInfo || null,
                                sku: item.sku || null,
                            };
                        }),
                    );

                    // Tạo mã đơn hàng từ timestamp và ObjectId
                    const orderDate = new Date(order.createdAt);
                    const dateStr = orderDate.getFullYear().toString().slice(-2) + 
                                   (orderDate.getMonth() + 1).toString().padStart(2, '0') + 
                                   orderDate.getDate().toString().padStart(2, '0');
                    const orderCode = 'DH' + dateStr + order._id.toString().substring(18, 24).toUpperCase();

                    return {
                        orderId: orderCode,
                        originalId: order._id, // Giữ lại ID gốc để update status
                        userId: order.userId,
                        fullName: order.fullName,
                        phone: order.phone,
                        address: order.address,
                        totalPrice: order.totalPrice,
                        typePayments: order.typePayments,
                        statusOrder: order.statusOrder,
                        createdAt: order.createdAt,
                        products: orderProducts,
                        couponApplied: order.couponApplied || null,
                    };
                }),
            );

            new OK({ message: 'Thành công', metadata: { detailedPayments } }).send(res);
        } catch (error) {
            console.error('Error in getOrderAdmin:', error);
            throw new BadRequestError('Lỗi khi lấy danh sách đơn hàng');
        }
    }

    async cancelOrder(req, res) {
        const { orderId } = req.body;
        const findPayment = await modelPayments.findById(orderId);
        if (!findPayment) {
            throw new BadRequestError('Không tìm thấy đơn hàng');
        }
        findPayment.statusOrder = 'cancelled';
        await findPayment.save();
        new OK({ message: 'Thành công', metadata: findPayment }).send(res);
    }
}

module.exports = new PaymentsController();

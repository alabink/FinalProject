const modelPayments = require('../models/payments.model');
const modelCart = require('../models/cart.model');
const modelProduct = require('../models/products.model');
const modelProductPreview = require('../models/productPreview.model');

const { BadRequestError } = require('../core/error.response');
const { OK } = require('../core/success.response');

const crypto = require('crypto');
const axios = require('axios');
const { VNPay, ignoreLogger, ProductCode, VnpLocale, dateFormat } = require('vnpay');

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
            if (typePayment === 'COD') {
                const newPayment = new modelPayments({
                    userId: id,
                    products: findCart.product,
                    address: findCart.address,
                    phone: findCart.phone,
                    fullName: findCart.fullName,
                    typePayments: 'COD',
                    totalPrice: findCart.totalPrice,
                    statusOrder: 'pending',
                });
                await newPayment.save();
                await findCart.deleteOne();

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
                var amount = findCart.totalPrice;
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
                    tmnCode: 'DH2F13SW',
                    secureSecret: 'NXZM3DWFR0LC4R5VBK85OJZS1UE9KI6F',
                    vnpayHost: 'https://sandbox.vnpayment.vn',
                    testMode: true, // tùy chọn
                    hashAlgorithm: 'SHA512', // tùy chọn
                    loggerFn: ignoreLogger, // tùy chọn
                });
                const tomorrow = new Date();
                tomorrow.setDate(tomorrow.getDate() + 1);
                const vnpayResponse = await vnpay.buildPaymentUrl({
                    vnp_Amount: findCart.totalPrice, //
                    vnp_IpAddr: '127.0.0.1', //
                    vnp_TxnRef: findCart._id,
                    vnp_OrderInfo: `${findCart._id}`,
                    vnp_OrderType: ProductCode.Other,
                    vnp_ReturnUrl: `http://localhost:3000/api/check-payment-vnpay`, //
                    vnp_Locale: VnpLocale.VN, // 'vn' hoặc 'en'
                    vnp_CreateDate: dateFormat(new Date()), // tùy chọn, mặc định là hiện tại
                    vnp_ExpireDate: dateFormat(tomorrow), // tùy chọn
                });
                new OK({
                    message: 'Thanh toán thông báo',
                    metadata: vnpayResponse,
                }).send(res);
            }
        } catch (error) {
            console.log(error);
            throw new BadRequestError('Lỗi khi thanh toán');
        }
    }

    async checkPaymentMomo(req, res, next) {
        const { orderInfo, resultCode } = req.query;
        if (resultCode === '0') {
            const result = orderInfo.split(' ')[2];
            const findCart = await modelCart.findOne({ _id: result });
            const newPayment = new modelPayments({
                userId: findCart.userId,
                products: findCart.product,
                address: findCart.address,
                phone: findCart.phone,
                fullName: findCart.fullName,
                typePayments: 'MOMO',
            });
            await newPayment.save();
            await findCart.deleteOne();
            return res.redirect(`http://localhost:5173/payment/${newPayment._id}`);
        }
    }

    async checkPaymentVnpay(req, res) {
        const { vnp_ResponseCode, vnp_OrderInfo } = req.query;
        if (vnp_ResponseCode === '00') {
            const idCart = vnp_OrderInfo;
            const findCart = await modelCart.findOne({ _id: idCart });
            const newPayment = new modelPayments({
                userId: findCart.userId,
                products: findCart.product,
                address: findCart.address,
                phone: findCart.phone,
                typePayments: 'VNPAY',
                fullName: findCart.fullName,
            });
            await newPayment.save();
            await findCart.deleteOne();
            return res.redirect(`http://localhost:5173/payment/${newPayment._id}`);
        }
    }

    async getHistoryOrder(req, res) {
        const { id } = req.user;
        const payments = await modelPayments.find({ userId: id });

        const orders = await Promise.all(
            payments.map(async (order) => {
                const products = await Promise.all(
                    order.products.map(async (item) => {
                        const product = await modelProduct.findById(item.productId);
                        const dataPreview = await modelProductPreview.find({ productId: item.productId });
                        if (!product) {
                            return {
                                productId: item.productId,
                                name: 'Sản phẩm không tồn tại',
                                image: '',
                                price: 0,
                                quantity: item.quantity,
                            };
                        }

                        return {
                            productId: product._id,
                            name: product.name,
                            image: product.images[0],
                            price: product.price,
                            quantity: item.quantity,
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
                    products,
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

            const dataProduct = await Promise.all(
                findPayment.products.map(async (item) => {
                    const product = await modelProduct.findById(item.productId);
                    return {
                        product: product,
                        quantity: item.quantity,
                    };
                }),
            );
            const data = { findPayment, dataProduct };

            new OK({ message: 'Thành công', metadata: data }).send(res);
        } catch (error) {
            console.log(error);
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
                    const products = await Promise.all(
                        order.products.map(async (item) => {
                            const product = await modelProduct.findById(item?.productId);
                            return {
                                productId: product?._id,
                                name: product?.name,
                                image: product?.images[0],
                                price: product?.price,
                                quantity: item?.quantity,
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
                        products,
                    };
                }),
            );

            new OK({
                message: 'Thành công',
                metadata: detailedPayments,
            }).send(res);
        } catch (error) {
            console.log(error);
            throw new BadRequestError('Không thể lấy danh sách đơn hàng');
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

const { BadRequestError } = require('../core/error.response');
const { OK } = require('../core/success.response');

const modelProduct = require('../models/products.model');
const modelCoupon = require('../models/coupon.model');
const modelProductPreview = require('../models/productPreview.model');
const modelUser = require('../models/users.model');
const Comment = require('../models/comment.model');

async function getComment(postId) {
    // 1. Lấy comment gốc
    const rootComments = await Comment.find({ postId, parentId: null }).sort({ createdAt: -1 }).lean();

    // 2. Lấy tất cả replies
    const rootIds = rootComments.map((c) => c._id);
    const replies = await Comment.find({ parentId: { $in: rootIds } })
        .sort({ createdAt: -1 })
        .lean();

    // 3. Tập hợp tất cả userId từ comment + reply
    const userIds = [
        ...new Set([...rootComments.map((c) => c.userId.toString()), ...replies.map((r) => r.userId.toString())]),
    ];

    // 4. Lấy tất cả thông tin người dùng
    const users = await modelUser.find({ _id: { $in: userIds } }).lean();
    const userMap = {};
    users.forEach((user) => {
        userMap[user._id.toString()] = {
            fullName: user.fullName,
            avatar: user.avatar,
        };
    });

    // 5. Gắn thông tin user vào reply
    const repliesWithUser = replies.map((reply) => ({
        ...reply,
        fullName: userMap[reply.userId.toString()]?.fullName || 'Unknown',
        avatar: userMap[reply.userId.toString()]?.avatar || '',
    }));

    // 6. Gắn replies và thông tin user vào comment gốc
    const commentsWithReplies = rootComments.map((comment) => ({
        ...comment,
        fullName: userMap[comment.userId.toString()]?.fullName || 'Unknown',
        avatar: userMap[comment.userId.toString()]?.avatar || '',
        replies: repliesWithUser.filter((r) => r.parentId.toString() === comment._id.toString()),
    }));

    return commentsWithReplies;
}

class controllerProducts {
    async addProduct(req, res) {
        const { name, price, images, stock, priceDiscount, attributes, category } = req.body;
        if (!name || !price || !images || !stock || !attributes || !category) {
            throw new BadRequestError('Vui lòng nhập đầy đủ thông tin');
        }

        const data = await modelProduct.create({
            name,
            price,
            priceDiscount,
            images,
            stock,
            attributes,
            category,
            priceDiscount,
        });

        new OK({
            message: 'Thêm sản phẩm thành công',
            metadata: data,
        }).send(res);
    }

    async uploadImage(req, res) {
        if (!req.files) {
            return;
        }
        const files = req.files;
        const data = files.map((file) => {
            return `http://localhost:3000/uploads/images/${file.filename}`;
        });

        new OK({ message: 'Tạo sản phẩm thông tin', metadata: data }).send(res);
    }

    async getProducts(req, res) {
        const data = await modelProduct.find();
        new OK({ message: 'Lấy sản phẩm thông tin', metadata: data }).send(res);
    }

    async getProductById(req, res) {
        const { id } = req.query;

        const data = await modelProduct.findById(id);

        if (!data) {
            throw new BadRequestError('Không tìm thấy sản phẩm');
        }

        const currentDate = new Date();

        // Find valid coupons
        const dataCoupon = await modelCoupon.find({
            minPrice: { $lte: data.price || data.priceDiscount },
            quantity: { $gt: 0 },
            startDate: { $lte: currentDate },
            endDate: { $gte: currentDate },
            $or: [{ productUsed: 'all' }, { productUsed: data._id }],
        });

        const productRelated = await modelProduct.find({ category: data.category }).sort({ createdAt: -1 }).limit(4);

        const dataProductPreview = await modelProductPreview.find({ productId: data._id });
        const dataPreview = await Promise.all(
            dataProductPreview.map(async (item) => {
                const dataUser = await modelUser.findById(item.userId);
                return {
                    ...item._doc,
                    fullName: dataUser.fullName,
                    avatar: dataUser.avatar || 'https://doanwebsite.com/assets/userNotFound-DUSu2NMF.png',
                };
            }),
        );

        const dataComment = await getComment(data._id);

        new OK({
            message: 'Lấy sản phẩm thành công',
            metadata: { data, dataCoupon, dataPreview, productRelated, dataComment },
        }).send(res);
    }

    async getAllProduct(req, res) {
        const data = await modelProduct.find();
        new OK({ message: 'Lấy sản phẩm thông tin', metadata: data }).send(res);
    }

    async editProduct(req, res) {
        try {
            const { _id, name, price, description, category, attributes, images, stock, priceDiscount } = req.body;
            const product = await modelProduct.findByIdAndUpdate(_id, {
                name,
                price,
                description,
                category,
                attributes,
                images,
                stock,
                priceDiscount,
            });
            if (!product) {
                throw new BadRequestError('Không tìm thấy sản phẩm');
            }
            new OK({
                message: 'Chiềnh sửa thống tin sản phẩm thành cong',
                metadata: product,
            }).send(res);
        } catch (error) {
            new BadRequestError({
                message: 'Lỗi khi chiềnh sửa thống tin sản phẩm',
                error: error.message,
            }).send(res);
        }
    }

    async deleteProduct(req, res) {
        const { id } = req.query;
        const product = await modelProduct.findByIdAndDelete(id);
        if (!product) {
            throw new BadRequestError('Không tìm thấy sản phẩm');
        }
        new OK({ message: 'Xoá sản phẩm thành công', metadata: product }).send(res);
    }

    async searchProduct(req, res) {
        const { keyword } = req.query;
        const data = await modelProduct.find({
            name: { $regex: keyword, $options: 'i' },
        });
        new OK({ message: 'Tìm kiếm sản phẩm', metadata: data }).send(res);
    }

    async filterProduct(req, res) {
        const { categoryId, priceRange, pricedes } = req.query;
        let query = {};

        // Filter by category if provided
        if (categoryId) {
            query.category = categoryId;
        }

        // Filter by price range if provided
        if (priceRange) {
            const priceQuery = {
                $or: [
                    // Case 1: When priceDiscount > 0, use priceDiscount
                    {
                        priceDiscount: { $gt: 0 },
                        ...(priceRange === 'under20' && { priceDiscount: { $lt: 20000000 } }),
                        ...(priceRange === '20to40' && { priceDiscount: { $gte: 20000000, $lte: 40000000 } }),
                        ...(priceRange === 'above40' && { priceDiscount: { $gt: 40000000 } }),
                    },
                    // Case 2: When priceDiscount = 0, use price
                    {
                        $or: [{ priceDiscount: 0 }, { priceDiscount: null }],
                        ...(priceRange === 'under20' && { price: { $lt: 20000000 } }),
                        ...(priceRange === '20to40' && { price: { $gte: 20000000, $lte: 40000000 } }),
                        ...(priceRange === 'above40' && { price: { $gt: 40000000 } }),
                    },
                ],
            };

            query = { ...query, ...priceQuery };
        }

        // Get products with filters
        let products = await modelProduct.find(query);

        // Sort by price if specified, considering priceDiscount
        if (pricedes) {
            products = products.sort((a, b) => {
                const priceA = a.priceDiscount > 0 ? a.priceDiscount : a.price;
                const priceB = b.priceDiscount > 0 ? b.priceDiscount : b.price;

                if (pricedes === 'desc') {
                    return priceB - priceA;
                }
                return priceA - priceB;
            });
        }

        new OK({
            message: 'Lọc sản phẩm thành công',
            metadata: products,
        }).send(res);
    }
}

module.exports = new controllerProducts();

const { BadRequestError } = require('../core/error.response');
const { OK } = require('../core/success.response');

const modelProduct = require('../models/products.model');
const modelCoupon = require('../models/coupon.model');
const modelProductPreview = require('../models/productPreview.model');
const modelUser = require('../models/users.model');
const Comment = require('../models/comment.model');
const modelCart = require('../models/cart.model');
const modelPayments = require('../models/payments.model');

// Default avatar URL
const DEFAULT_AVATAR_URL = 'https://uxwing.com/wp-content/themes/uxwing/download/peoples-avatars/man-user-color-icon.png';

async function getComment(postId) {
    // 1. Lấy tất cả comment của bài viết
    const allComments = await Comment.find({ postId }).sort({ createdAt: 1 }).lean();

    // 2. Phân loại comment gốc và các phản hồi
    const rootComments = allComments.filter(comment => !comment.parentId);
    const replies = allComments.filter(comment => comment.parentId);

    // 3. Tập hợp tất cả userId từ comment
    const userIds = [...new Set(allComments.map(c => c.userId.toString()))];

    // 4. Lấy tất cả thông tin người dùng
    const users = await modelUser.find({ _id: { $in: userIds } }).lean();
    const userMap = {};
    users.forEach((user) => {
        userMap[user._id.toString()] = {
            fullName: user.fullName,
            avatar: user.avatar || DEFAULT_AVATAR_URL,
            isAdmin: user.isAdmin || false,
        };
    });

    // 5. Gắn thông tin user vào tất cả comment
    const commentsWithUser = allComments.map(comment => ({
        ...comment,
        fullName: userMap[comment.userId.toString()]?.fullName || 'Unknown',
        avatar: userMap[comment.userId.toString()]?.avatar || DEFAULT_AVATAR_URL,
        isAdmin: userMap[comment.userId.toString()]?.isAdmin || false,
        replies: [], // Khởi tạo mảng replies rỗng
    }));
    
    // 6. Tạo map để truy cập nhanh các comment theo id
    const commentMap = {};
    commentsWithUser.forEach(comment => {
        commentMap[comment._id.toString()] = comment;
    });
    
    // 7. Xây dựng cấu trúc phân cấp comment - tất cả phản hồi đều ở cấp độ 1
    replies.forEach(reply => {
        const parentId = reply.parentId.toString();
        // Tìm comment gốc (cấp độ 0) của reply này
        let rootParent = commentMap[parentId];
        // Nếu parent cũng là một reply, tìm đến root comment
        while (rootParent && rootParent.parentId) {
            rootParent = commentMap[rootParent.parentId.toString()];
        }
        
        // Nếu tìm được comment gốc, thêm reply vào replies của comment gốc
        if (rootParent) {
            rootParent.replies.push(commentMap[reply._id.toString()]);
        }
    });
    
    // 8. Sắp xếp các phản hồi theo thời gian tạo (cũ đến mới)
    rootComments.forEach(comment => {
        const rootComment = commentMap[comment._id.toString()];
        if (rootComment.replies && rootComment.replies.length > 0) {
            rootComment.replies.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        }
    });
    
    // 9. Trả về chỉ các comment gốc (đã bao gồm phản hồi)
    return rootComments.map(comment => commentMap[comment._id.toString()]);
}

class controllerProducts {
    async addProduct(req, res) {
        const { name, brand, description, images, attributes, category, variants, price, priceDiscount, stock } = req.body;
        
        // Check if we're using variants mode or simple mode
        const useVariants = variants && variants.length > 0;
        
        if (!name || !brand || !images || !attributes || !category) {
            throw new BadRequestError('Vui lòng nhập đầy đủ thông tin cơ bản');
        }

        let productData = {
            name,
            brand,
            description,
            images,
            attributes,
            category
        };

        // Check if we're using variants or not
        if (useVariants) {
        // Validate variants
        for (let i = 0; i < variants.length; i++) {
            const variant = variants[i];
            if (!variant.color?.name || !variant.color?.code || !variant.color?.image ||
                !variant.storage?.size || !variant.storage?.displayName ||
                !variant.price || !variant.sku) {
                throw new BadRequestError(`Variant ${i + 1} thiếu thông tin bắt buộc`);
            }
        }

        // Tính giá và stock tổng từ variants
        const minPrice = Math.min(...variants.map(v => v.priceDiscount > 0 ? v.priceDiscount : v.price));
        const totalStock = variants.reduce((sum, v) => sum + (v.stock || 0), 0);

            productData = {
                ...productData,
            variants,
                price: minPrice,
            stock: totalStock,
            defaultVariant: {
                colorIndex: 0,
                storageIndex: 0
            }
            };
        } else {
            // Simple product mode
            if (!price || !stock) {
                throw new BadRequestError('Vui lòng nhập giá và số lượng sản phẩm');
            }
            
            productData = {
                ...productData,
                price,
                priceDiscount: priceDiscount || 0,
                stock,
                variants: []
            };
        }

        const data = await modelProduct.create(productData);

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
            return file.path; // Cloudinary trả về URL trong file.path
        });

        new OK({ message: 'Upload ảnh thành công', metadata: data }).send(res);
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
                    avatar: dataUser.avatar || DEFAULT_AVATAR_URL,
                    isAdmin: dataUser.isAdmin || false, // Thêm thông tin isAdmin vào đánh giá sản phẩm
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
            const { _id, name, brand, price, description, category, attributes, images, stock, priceDiscount, variants } = req.body;
            
            console.log('Received editProduct request:', { _id, name, hasVariants: variants && variants.length > 0 });
            
            const updateData = {
                name,
                brand,
                description,
                category,
                attributes,
                images,
            };

            // Nếu có variants, cập nhật variants và tính toán giá, stock từ variants
            if (variants && variants.length > 0) {
                console.log('Updating with variants:', variants.length);
                updateData.variants = variants;
                
                // Tính giá thấp nhất từ variants
                const minPrice = Math.min(...variants.map(v => v.priceDiscount > 0 ? v.priceDiscount : v.price));
                const totalStock = variants.reduce((sum, v) => sum + (v.stock || 0), 0);
                
                updateData.price = minPrice;
                updateData.stock = totalStock;
                updateData.priceDiscount = 0; // Reset priceDiscount khi dùng variants
            } else {
                console.log('Updating without variants');
                // Nếu không có variants, dùng giá và stock truyền vào
                updateData.price = price;
                updateData.stock = stock;
                updateData.priceDiscount = priceDiscount || 0;
                updateData.variants = []; // Xóa variants nếu chuyển về chế độ đơn
            }

            console.log('Update data:', updateData);

            const product = await modelProduct.findByIdAndUpdate(_id, updateData, { new: true });
            
            if (!product) {
                throw new BadRequestError('Không tìm thấy sản phẩm');
            }
            
            console.log('Updated product:', { id: product._id, hasVariants: product.variants && product.variants.length > 0 });
            
            new OK({
                message: 'Chỉnh sửa thông tin sản phẩm thành công',
                metadata: product,
            }).send(res);
        } catch (error) {
            console.error('Error in editProduct:', error);
            throw new BadRequestError({
                message: 'Lỗi khi chỉnh sửa thông tin sản phẩm',
                error: error.message,
            });
        }
    }

    async deleteProduct(req, res) {
        try {
        const { id } = req.query;
            
            // 1. Find the product first to check if it exists
            const product = await modelProduct.findById(id);
        if (!product) {
            throw new BadRequestError('Không tìm thấy sản phẩm');
        }

            // 2. Delete all carts containing this product
            await modelCart.deleteMany({ "product.productId": id });

            // 3. Delete all orders containing this product
            await modelPayments.deleteMany({ "products.productId": id });

            // 4. Delete all product reviews
            await modelProductPreview.deleteMany({ productId: id });

            // 5. Delete all product comments
            await Comment.deleteMany({ postId: id });

            // 6. Remove product from all coupons and delete coupons if they only applied to this product
            await modelCoupon.deleteMany({ productUsed: { $size: 1, $in: [id] } }); // Delete coupons that only applied to this product
            await modelCoupon.updateMany(
                { productUsed: id },
                { $pull: { productUsed: id } }
            );

            // 7. Finally delete the product
            await modelProduct.findByIdAndDelete(id);

            new OK({ 
                message: 'Đã xóa sản phẩm và tất cả dữ liệu liên quan', 
                metadata: {
                    productId: id
                }
            }).send(res);
        } catch (error) {
            throw new BadRequestError(error.message);
        }
    }

    async searchProduct(req, res) {
        const { keyword } = req.query;
        
        if (!keyword || keyword.trim() === '') {
            return new OK({ message: 'Tìm kiếm sản phẩm', metadata: [] }).send(res);
        }
        
        const searchKeyword = keyword.trim();
        
        const data = await modelProduct.find({
            $or: [
                { name: { $regex: searchKeyword, $options: 'i' } },
                { brand: { $regex: searchKeyword, $options: 'i' } },
                { description: { $regex: searchKeyword, $options: 'i' } },
                { 'attributes.color': { $regex: searchKeyword, $options: 'i' } },
                { 'attributes.storage': { $regex: searchKeyword, $options: 'i' } },
                { 'attributes.ram': { $regex: searchKeyword, $options: 'i' } }
            ]
        }).sort({ createdAt: -1 });
        
        new OK({ message: 'Tìm kiếm sản phẩm', metadata: data }).send(res);
    }

async filterProduct(req, res) {
    const { categoryId, priceRange, pricedes } = req.query;
    let query = {};

    if (categoryId) {
        query.category = categoryId;
    }

    if (priceRange) {
        const orClauses = [];

        if (priceRange === 'under20') {
            orClauses.push(
                // priceDiscount > 0 và < 20tr
                { priceDiscount: { $gt: 0, $lt: 20000000 } },
                // priceDiscount = 0/null và price < 20tr
                {
                    $and: [
                        { $or: [{ priceDiscount: 0 }, { priceDiscount: null }] },
                        { price: { $lt: 20000000 } },
                    ],
                }
            );
        } else if (priceRange === '20to40') {
            orClauses.push(
                { priceDiscount: { $gte: 20000000, $lte: 40000000 } },
                {
                    $and: [
                        { $or: [{ priceDiscount: 0 }, { priceDiscount: null }] },
                        { price: { $gte: 20000000, $lte: 40000000 } },
                    ],
                }
            );
        } else if (priceRange === 'above40') {
            orClauses.push(
                { priceDiscount: { $gt: 40000000 } },
                {
                    $and: [
                        { $or: [{ priceDiscount: 0 }, { priceDiscount: null }] },
                        { price: { $gt: 40000000 } },
                    ],
                }
            );
        }

        if (orClauses.length) {
            query.$or = orClauses;
        }
    }

    let products = await modelProduct.find(query);

    if (pricedes) {
        products = products.sort((a, b) => {
            const priceA = a.priceDiscount > 0 ? a.priceDiscount : a.price;
            const priceB = b.priceDiscount > 0 ? b.priceDiscount : b.price;
            return pricedes === 'desc' ? priceB - priceA : priceA - priceB;
        });
    }

    new OK({
        message: 'Lọc sản phẩm thành công',
        metadata: products,
    }).send(res);
}
/// moi fix ne
    async getProductVariants(req, res) {
        const { productId } = req.query;
        
        if (!productId) {
            throw new BadRequestError('Vui lòng cung cấp ID sản phẩm');
        }

        const product = await modelProduct.findById(productId);
        
        if (!product) {
            throw new BadRequestError('Không tìm thấy sản phẩm');
        }

        // Lấy tất cả màu sắc và phiên bản có sẵn
        const colors = [...new Set(product.variants.map(v => JSON.stringify(v.color)))].map(c => JSON.parse(c));
        const storages = [...new Set(product.variants.map(v => JSON.stringify(v.storage)))].map(s => JSON.parse(s));

        // Tạo ma trận giá cho mỗi tổ hợp
        const priceMatrix = {};
        product.variants.forEach(variant => {
            const key = `${variant.color.name}_${variant.storage.size}`;
            priceMatrix[key] = {
                price: variant.price,
                priceDiscount: variant.priceDiscount,
                stock: variant.stock,
                sku: variant.sku,
                available: variant.stock > 0
            };
        });

        new OK({
            message: 'Lấy thông tin variants thành công',
            metadata: {
                colors,
                storages,
                priceMatrix,
                defaultVariant: product.defaultVariant
            }
        }).send(res);
    }

    async getVariantBySelection(req, res) {
        const { productId, colorName, storageSize } = req.query;
        
        if (!productId || !colorName || !storageSize) {
            throw new BadRequestError('Vui lòng cung cấp đầy đủ thông tin');
        }

        const product = await modelProduct.findById(productId);
        
        if (!product) {
            throw new BadRequestError('Không tìm thấy sản phẩm');
        }

        const variant = product.variants.find(v => 
            v.color.name === colorName && v.storage.size === storageSize
        );

        if (!variant) {
            throw new BadRequestError('Không tìm thấy biến thể phù hợp');
        }

        new OK({
            message: 'Lấy thông tin variant thành công',
            metadata: variant
        }).send(res);
    }

    // New endpoints for product comparison
    async compareProducts(req, res) {
        try {
            // Load the AI comparison module
            const { compareProducts } = require('../utils/AICompareProduct');
            
            // Get product IDs from request (expects an array of IDs)
            const { productIds } = req.body;
            
            if (!productIds || !Array.isArray(productIds) || productIds.length < 2) {
                throw new BadRequestError('Cần ít nhất 2 sản phẩm để so sánh');
            }
            
            // Get detailed HTML comparison
            const comparisonHTML = await compareProducts(productIds);
            
            new OK({
                message: 'So sánh sản phẩm thành công',
                metadata: { comparisonHTML }
            }).send(res);
        } catch (error) {
            console.error('Error in product comparison:', error);
            throw new BadRequestError(error.message || 'Lỗi khi so sánh sản phẩm');
        }
    }

    async quickCompareProducts(req, res) {
        try {
            // Load the AI comparison module
            const { quickCompareProducts } = require('../utils/AICompareProduct');
            
            // Get product IDs from request (expects an array of IDs)
            const { productIds } = req.body;
            
            if (!productIds || !Array.isArray(productIds) || productIds.length < 2) {
                throw new BadRequestError('Cần ít nhất 2 sản phẩm để so sánh nhanh');
            }
            
            // Get quick comparison table
            const comparisonTable = await quickCompareProducts(productIds);
            
            new OK({
                message: 'So sánh nhanh sản phẩm thành công',
                metadata: { comparisonTable }
            }).send(res);
        } catch (error) {
            console.error('Error in quick product comparison:', error);
            throw new BadRequestError(error.message || 'Lỗi khi so sánh nhanh sản phẩm');
        }
    }
}

module.exports = new controllerProducts();

const modelProduct = require('../models/products.model');
const modelCategory = require('../models/category.model');

const { OK, Created } = require('../core/success.response');
const { BadRequestError } = require('../core/error.response');

class controllerCategory {
    async createCategory(req, res) {
        const { nameCategory } = req.body;

        if (!nameCategory) {
            throw new BadRequestError('Bạn chưa nhập tên danh mục');
        }

        const category = await modelCategory.create({ nameCategory });

        new Created({
            message: 'Tạo danh mục thành công',
            metadata: category,
        }).send(res);
    }

    async getAllCategory(req, res) {
        const categories = await modelCategory.find();
        const data = await Promise.all(
            categories.map(async (category) => {
                const products = await modelProduct.find({ category: category._id });
                return {
                    ...category._doc,
                    products,
                };
            }),
        );
        new OK({
            message: 'Lấy danh mục thành công',
            metadata: data,
        }).send(res);
    }

    async deleteCategory(req, res) {
        const { id } = req.query;
        await modelCategory.deleteOne({ _id: id });
        const dataProduct = await modelProduct.find({ categoryId: id });
        await Promise.all(
            dataProduct.map(async (product) => {
                await modelProduct.deleteOne({ _id: product._id });
            }),
        );
        new OK({
            message: 'Xóa danh mục thành công',
        }).send(res);
    }

    async updateCategory(req, res) {
        const { id, nameCategory } = req.body;

        await modelCategory.updateOne({ _id: id }, { nameCategory });

        new OK({
            message: 'Cập nhật danh mục thành công',
        }).send(res);
    }

    async getProductByCategory(req, res) {
        const { id } = req.query;
        const findCategory = await modelCategory.findById(id);
        if (!findCategory) {
            throw new NotFoundError('Danh mục không tồn tại');
        }
        const products = await modelProduct.find({ categoryId: id });
        new OK({
            message: 'Lấy sản phẩm thành công',
            metadata: products,
        }).send(res);
    }

    async filterProduct(req, res) {
        const { pricedes, priceRange } = req.query;
        let query = {};
        let sortOptions = {};

        // Handle price range filtering
        if (priceRange) {
            switch (priceRange) {
                case 'under20':
                    query.priceProduct = { $lt: 20000000 }; // Under 20 million
                    break;
                case '20to40':
                    query.priceProduct = { $gte: 20000000, $lte: 40000000 }; // 20-40 million
                    break;
                case 'above40':
                    query.priceProduct = { $gt: 40000000 }; // Above 40 million
                    break;
            }
        }

        // Handle price sorting
        if (pricedes === 'desc') {
            sortOptions.priceProduct = -1; // High to low
        } else if (pricedes === 'asc') {
            sortOptions.priceProduct = 1; // Low to high
        }

        const data = await modelProduct.find(query).sort(sortOptions);
        new OK({ message: 'Lọc sản phẩm thành công', metadata: data }).send(res);
    }
}
module.exports = new controllerCategory();

const mongoose = require('mongoose');

const Schema = mongoose.Schema;

// Schema cho từng variant (biến thể) của sản phẩm
const variantSchema = new Schema({
    color: {
        name: { type: String, required: true }, // Tên màu: "Titan Tự Nhiên"
        code: { type: String, required: true }, // Mã màu hex: "#F5F5DC" 
        image: { type: String, required: true } // Ảnh của màu này
    },
    storage: {
        size: { type: String, required: true }, // "256GB", "512GB", "1TB"
        displayName: { type: String, required: true } // "256GB", "512GB", "1TB"
    },
    price: { type: Number, required: true }, // Giá cho variant này
    priceDiscount: { type: Number, default: 0 }, // Giá khuyến mãi
    stock: { type: Number, required: true, default: 0 }, // Số lượng tồn kho
    sku: { type: String, required: true, unique: true } // Mã SKU duy nhất
});

const modelProduct = new Schema(
    {
        name: { type: String, required: true },
        brand: { type: String, required: true },
        description: { type: String },
        images: { type: Array, required: true }, // Ảnh chung của sản phẩm
        attributes: { type: mongoose.Schema.Types.Mixed, required: true },
        category: { type: mongoose.Schema.Types.ObjectId, ref: 'category', required: true },
        
        // Thông tin cơ bản (có thể deprecated sau này)
        price: { type: Number }, // Giá gốc (tham khảo)
        priceDiscount: { type: Number, default: 0 },
        stock: { type: Number, default: 0 },
        
        // Mảng các variants
        variants: [variantSchema],
        
        // Variant mặc định được hiển thị
        defaultVariant: {
            colorIndex: { type: Number, default: 0 },
            storageIndex: { type: Number, default: 0 }
        }
    },
    {
        timestamps: true,
    },
);

module.exports = mongoose.model('product', modelProduct);

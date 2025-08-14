const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const Product = require('./src/models/products.model');
const Category = require('./src/models/category.model');

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.CONNECT_DB, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('✅ Connected to MongoDB');
    } catch (error) {
        console.error('❌ MongoDB connection error:', error);
        process.exit(1);
    }
};

// Real image URLs for different product categories
const productImages = {
    'Điện thoại': [
        'https://picsum.photos/400/600?random=1',
        'https://picsum.photos/400/600?random=2',
        'https://picsum.photos/400/600?random=3',
        'https://picsum.photos/400/600?random=4',
        'https://picsum.photos/400/600?random=5',
        'https://picsum.photos/400/600?random=6',
        'https://picsum.photos/400/600?random=7',
        'https://picsum.photos/400/600?random=8',
        'https://picsum.photos/400/600?random=9',
        'https://picsum.photos/400/600?random=10'
    ],
    'Laptop': [
        'https://picsum.photos/500/400?random=11',
        'https://picsum.photos/500/400?random=12',
        'https://picsum.photos/500/400?random=13',
        'https://picsum.photos/500/400?random=14',
        'https://picsum.photos/500/400?random=15',
        'https://picsum.photos/500/400?random=16',
        'https://picsum.photos/500/400?random=17',
        'https://picsum.photos/500/400?random=18',
        'https://picsum.photos/500/400?random=19',
        'https://picsum.photos/500/400?random=20'
    ],
    'Máy tính bảng': [
        'https://picsum.photos/450/600?random=21',
        'https://picsum.photos/450/600?random=22',
        'https://picsum.photos/450/600?random=23',
        'https://picsum.photos/450/600?random=24',
        'https://picsum.photos/450/600?random=25',
        'https://picsum.photos/450/600?random=26',
        'https://picsum.photos/450/600?random=27',
        'https://picsum.photos/450/600?random=28',
        'https://picsum.photos/450/600?random=29',
        'https://picsum.photos/450/600?random=30'
    ],
    'Tai nghe': [
        'https://picsum.photos/400/400?random=31',
        'https://picsum.photos/400/400?random=32',
        'https://picsum.photos/400/400?random=33',
        'https://picsum.photos/400/400?random=34',
        'https://picsum.photos/400/400?random=35',
        'https://picsum.photos/400/400?random=36',
        'https://picsum.photos/400/400?random=37',
        'https://picsum.photos/400/400?random=38',
        'https://picsum.photos/400/400?random=39',
        'https://picsum.photos/400/400?random=40'
    ],
    'Đồng hồ': [
        'https://picsum.photos/400/400?random=41',
        'https://picsum.photos/400/400?random=42',
        'https://picsum.photos/400/400?random=43',
        'https://picsum.photos/400/400?random=44',
        'https://picsum.photos/400/400?random=45',
        'https://picsum.photos/400/400?random=46',
        'https://picsum.photos/400/400?random=47',
        'https://picsum.photos/400/400?random=48',
        'https://picsum.photos/400/400?random=49',
        'https://picsum.photos/400/400?random=50'
    ]
};

// Data generators with detailed specifications
const brands = {
    'Điện thoại': ['Apple', 'Samsung', 'Xiaomi', 'OPPO', 'Vivo', 'Huawei', 'OnePlus', 'Realme', 'Google', 'Nothing'],
    'Laptop': ['Apple', 'Dell', 'HP', 'Lenovo', 'ASUS', 'Acer', 'MSI', 'Razer', 'Alienware', 'Gigabyte'],
    'Máy tính bảng': ['Apple', 'Samsung', 'Xiaomi', 'Huawei', 'Lenovo', 'OPPO', 'Realme', 'Amazon', 'Microsoft', 'Google'],
    'Tai nghe': ['Apple', 'Samsung', 'Sony', 'Bose', 'JBL', 'Beats', 'Sennheiser', 'Audio-Technica', 'Jabra', 'Anker'],
    'Đồng hồ': ['Apple', 'Samsung', 'Garmin', 'Fitbit', 'Huawei', 'Xiaomi', 'Amazfit', 'Fossil', 'Casio', 'Suunto']
};

// Complete specifications for each category (đầy đủ 8 thông số như trong ảnh)
const completeSpecs = {
    'Điện thoại': {
        'Bộ xử lý CPU': [
            'Apple A17 Pro',
            'Snapdragon 8 Gen 3',
            'Dimensity 9200+',
            'Exynos 2400',
            'Apple A16 Bionic',
            'Snapdragon 8+ Gen 1',
            'Dimensity 9000+',
            'Exynos 2200'
        ],
        'RAM': [
            '8GB LPDDR5',
            '12GB LPDDR5',
            '16GB LPDDR5',
            '6GB LPDDR4X',
            '8GB LPDDR4X',
            '12GB LPDDR4X'
        ],
        'Màn hình': [
            '6.1 inch OLED 120Hz',
            '6.7 inch AMOLED 120Hz',
            '6.8 inch Dynamic AMOLED 2X',
            '6.6 inch IPS LCD 90Hz',
            '6.4 inch Super AMOLED 120Hz',
            '6.2 inch OLED 60Hz',
            '6.9 inch Dynamic AMOLED 2X',
            '6.3 inch IPS LCD 90Hz'
        ],
        'GPU': [
            'Apple GPU 6-core',
            'Adreno 750',
            'Mali-G715 MC11',
            'Xclipse 940',
            'Apple GPU 5-core',
            'Adreno 730',
            'Mali-G710 MC10',
            'Xclipse 920'
        ],
        'Ổ cứng': [
            '128GB UFS 4.0',
            '256GB UFS 4.0',
            '512GB UFS 4.0',
            '1TB UFS 4.0',
            '128GB UFS 3.1',
            '256GB UFS 3.1',
            '512GB UFS 3.1'
        ],
        'Kích thước': [
            '168g',
            '185g',
            '195g',
            '175g',
            '190g',
            '200g',
            '210g',
            '180g'
        ],
        'Camera': [
            '48MP + 12MP + 12MP',
            '50MP + 12MP + 12MP',
            '108MP + 12MP + 10MP',
            '64MP + 8MP + 2MP',
            '50MP + 8MP + 2MP',
            '48MP + 8MP + 2MP',
            '108MP + 8MP + 2MP',
            '64MP + 12MP + 8MP'
        ],
        'Pin': [
            '4000mAh Li-Po',
            '4500mAh Li-Po',
            '5000mAh Li-Po',
            '4800mAh Li-Po',
            '4300mAh Li-Po',
            '4600mAh Li-Po',
            '5200mAh Li-Po',
            '4700mAh Li-Po'
        ]
    },
    'Laptop': {
        'Bộ xử lý CPU': [
            'Intel Core i5-12400H',
            'Intel Core i7-12700H',
            'Intel Core i9-12900H',
            'AMD Ryzen 5 6600H',
            'AMD Ryzen 7 6800H',
            'AMD Ryzen 9 6900HX',
            'Intel Core i5-13400H',
            'Intel Core i7-13700H',
            'Intel Core i9-13900H',
            'AMD Ryzen 5 7640H',
            'AMD Ryzen 7 7840H',
            'AMD Ryzen 9 7940H'
        ],
        'RAM': [
            '8GB DDR4 3200MHz',
            '16GB DDR4 3200MHz',
            '32GB DDR4 3200MHz',
            '8GB DDR5 4800MHz',
            '16GB DDR5 4800MHz',
            '32GB DDR5 4800MHz',
            '64GB DDR5 4800MHz'
        ],
        'Màn hình': [
            '13.3 inch FHD IPS',
            '14 inch FHD IPS',
            '15.6 inch FHD IPS',
            '16 inch FHD IPS',
            '13.3 inch QHD OLED',
            '14 inch QHD OLED',
            '15.6 inch QHD IPS',
            '16 inch QHD IPS',
            '17.3 inch FHD IPS',
            '13.3 inch 4K OLED'
        ],
        'GPU': [
            'Intel UHD Graphics',
            'NVIDIA RTX 3050 4GB',
            'NVIDIA RTX 3060 6GB',
            'NVIDIA RTX 3070 8GB',
            'NVIDIA RTX 3080 8GB',
            'NVIDIA RTX 4070 8GB',
            'NVIDIA RTX 4080 12GB',
            'AMD Radeon 660M',
            'AMD Radeon 680M',
            'AMD Radeon 780M'
        ],
        'Ổ cứng': [
            '256GB SSD NVMe',
            '512GB SSD NVMe',
            '1TB SSD NVMe',
            '2TB SSD NVMe',
            '256GB SSD SATA',
            '512GB SSD SATA',
            '1TB SSD SATA'
        ],
        'Kích thước': [
            '1.2 kg',
            '1.4 kg',
            '1.6 kg',
            '1.8 kg',
            '2.0 kg',
            '2.3 kg',
            '2.5 kg',
            '2.8 kg',
            '3.0 kg'
        ],
        'Camera': [
            'HD 720p',
            'FHD 1080p',
            'HD 720p with IR',
            'FHD 1080p with IR',
            'HD 720p with Privacy Shutter'
        ],
        'Pin': [
            '3 Cell 45WHr',
            '4 Cell 60WHr',
            '4 Cell 90WHr',
            '6 Cell 86WHr',
            '6 Cell 99WHr',
            '8 Cell 99WHr'
        ]
    },
    'Máy tính bảng': {
        'Bộ xử lý CPU': [
            'Apple A17 Pro',
            'Apple A16 Bionic',
            'Apple A15 Bionic',
            'Snapdragon 8 Gen 2',
            'Snapdragon 8+ Gen 1',
            'Dimensity 9200',
            'Exynos 1380',
            'Apple M2',
            'Apple M1'
        ],
        'RAM': [
            '4GB LPDDR4X',
            '6GB LPDDR4X',
            '8GB LPDDR4X',
            '12GB LPDDR4X',
            '16GB LPDDR4X'
        ],
        'Màn hình': [
            '10.2 inch Retina IPS',
            '10.9 inch Liquid Retina',
            '11 inch Liquid Retina XDR',
            '12.9 inch Liquid Retina XDR',
            '10.1 inch TFT LCD',
            '10.4 inch TFT LCD',
            '11 inch Super AMOLED',
            '12.4 inch Super AMOLED',
            '13 inch Super AMOLED'
        ],
        'GPU': [
            'Apple GPU 6-core',
            'Apple GPU 5-core',
            'Apple GPU 4-core',
            'Adreno 740',
            'Adreno 730',
            'Mali-G710 MC10',
            'Xclipse 920',
            'Apple M2 GPU',
            'Apple M1 GPU'
        ],
        'Ổ cứng': [
            '64GB eMMC',
            '128GB eMMC',
            '256GB eMMC',
            '512GB eMMC',
            '1TB eMMC',
            '128GB UFS 3.1',
            '256GB UFS 3.1',
            '512GB UFS 3.1'
        ],
        'Kích thước': [
            '450g',
            '500g',
            '550g',
            '600g',
            '650g',
            '700g',
            '750g',
            '800g'
        ],
        'Camera': [
            '8MP + 12MP',
            '12MP + 12MP',
            '13MP + 8MP',
            '16MP + 8MP',
            '20MP + 8MP',
            '8MP + 5MP',
            '12MP + 5MP'
        ],
        'Pin': [
            '6000mAh Li-Po',
            '7000mAh Li-Po',
            '8000mAh Li-Po',
            '9000mAh Li-Po',
            '10000mAh Li-Po',
            '11000mAh Li-Po',
            '12000mAh Li-Po'
        ]
    },
    'Tai nghe': {
        'Bộ xử lý CPU': [
            'Qualcomm QCC3040',
            'Qualcomm QCC5124',
            'Apple H1',
            'Apple H2',
            'Realtek RTL8763B',
            'BES2300',
            'CSR8675'
        ],
        'RAM': [
            '32MB',
            '64MB',
            '128MB',
            '256MB'
        ],
        'Màn hình': [
            'Không có màn hình',
            'LED indicator',
            'OLED display',
            'LCD display'
        ],
        'GPU': [
            'Không có GPU',
            'Integrated graphics',
            'DSP processor'
        ],
        'Ổ cứng': [
            '4GB Flash',
            '8GB Flash',
            '16GB Flash',
            '32GB Flash'
        ],
        'Kích thước': [
            '5g',
            '8g',
            '12g',
            '15g',
            '20g',
            '25g',
            '30g',
            '35g',
            '40g',
            '45g',
            '50g'
        ],
        'Camera': [
            'Không có camera',
            'IR sensor',
            'Proximity sensor'
        ],
        'Pin': [
            '20 giờ',
            '25 giờ',
            '30 giờ',
            '35 giờ',
            '40 giờ',
            '45 giờ',
            '50 giờ'
        ]
    },
    'Đồng hồ': {
        'Bộ xử lý CPU': [
            'Apple S9',
            'Apple S8',
            'Apple S7',
            'Exynos W920',
            'Exynos W930',
            'Qualcomm Snapdragon Wear 4100',
            'Qualcomm Snapdragon Wear 3100',
            'Garmin Fenix 7',
            'Garmin Forerunner 955'
        ],
        'RAM': [
            '32MB',
            '64MB',
            '128MB',
            '256MB',
            '512MB',
            '1GB'
        ],
        'Màn hình': [
            '1.1 inch AMOLED',
            '1.2 inch AMOLED',
            '1.3 inch AMOLED',
            '1.4 inch AMOLED',
            '1.5 inch AMOLED',
            '1.6 inch AMOLED',
            '1.7 inch AMOLED',
            '1.8 inch AMOLED',
            '1.9 inch AMOLED'
        ],
        'GPU': [
            'Không có GPU',
            'Integrated graphics',
            'Mali-G52',
            'PowerVR GT7600'
        ],
        'Ổ cứng': [
            '4GB Flash',
            '8GB Flash',
            '16GB Flash',
            '32GB Flash',
            '64GB Flash'
        ],
        'Kích thước': [
            '25g',
            '30g',
            '35g',
            '40g',
            '45g',
            '50g',
            '55g',
            '60g',
            '65g',
            '70g'
        ],
        'Camera': [
            'Không có camera',
            'IR sensor',
            'Heart rate sensor',
            'SpO2 sensor'
        ],
        'Pin': [
            '5 ngày',
            '7 ngày',
            '10 ngày',
            '14 ngày',
            '21 ngày',
            '30 ngày',
            '45 ngày',
            '60 ngày'
        ]
    }
};

const phoneModels = [
    'Galaxy S', 'Galaxy A', 'Galaxy Z', 'Galaxy Note', 'iPhone', 'Redmi', 'POCO', 'Mi', 'Find X', 'Reno',
    'Vivo X', 'Vivo Y', 'P series', 'Mate series', 'OnePlus', 'Realme GT', 'Pixel', 'Nothing Phone'
];

const laptopModels = [
    'MacBook Pro', 'MacBook Air', 'Inspiron', 'XPS', 'Latitude', 'Pavilion', 'Envy', 'Spectre', 'ThinkPad',
    'IdeaPad', 'Legion', 'ZenBook', 'VivoBook', 'ROG', 'TUF', 'Nitro', 'Predator', 'Aspire', 'Swift'
];

const tabletModels = [
    'iPad Pro', 'iPad Air', 'iPad', 'iPad mini', 'Galaxy Tab S', 'Galaxy Tab A', 'Mi Pad', 'MatePad',
    'Yoga Tab', 'Tab P', 'Realme Pad', 'Fire HD', 'Surface Pro', 'Surface Go', 'Pixel Tablet'
];

const headphoneModels = [
    'AirPods Pro', 'AirPods', 'Galaxy Buds', 'WH-1000XM', 'WF-1000XM', 'QuietComfort', 'SoundLink',
    'JBL Tour', 'Beats Studio', 'Beats Solo', 'HD 660S', 'ATH-M50x', 'Elite', 'Soundcore'
];

const watchModels = [
    'Apple Watch', 'Galaxy Watch', 'Garmin Fenix', 'Garmin Forerunner', 'Fitbit Sense', 'Fitbit Versa',
    'Huawei Watch', 'Mi Band', 'Amazfit GTR', 'Fossil Gen', 'G-Shock', 'Suunto 9'
];

// Colors with different images for each color
const colors = [
    { 
        name: 'Đen', 
        code: '#000000', 
        image: 'https://picsum.photos/100/100?random=101',
        productImage: 'https://picsum.photos/400/600?random=201'
    },
    { 
        name: 'Trắng', 
        code: '#FFFFFF', 
        image: 'https://picsum.photos/100/100?random=102',
        productImage: 'https://picsum.photos/400/600?random=202'
    },
    { 
        name: 'Xanh dương', 
        code: '#0066CC', 
        image: 'https://picsum.photos/100/100?random=103',
        productImage: 'https://picsum.photos/400/600?random=203'
    },
    { 
        name: 'Xanh lá', 
        code: '#00CC66', 
        image: 'https://picsum.photos/100/100?random=104',
        productImage: 'https://picsum.photos/400/600?random=204'
    },
    { 
        name: 'Đỏ', 
        code: '#CC0000', 
        image: 'https://picsum.photos/100/100?random=105',
        productImage: 'https://picsum.photos/400/600?random=205'
    },
    { 
        name: 'Vàng', 
        code: '#FFD700', 
        image: 'https://picsum.photos/100/100?random=106',
        productImage: 'https://picsum.photos/400/600?random=206'
    },
    { 
        name: 'Bạc', 
        code: '#C0C0C0', 
        image: 'https://picsum.photos/100/100?random=107',
        productImage: 'https://picsum.photos/400/600?random=207'
    },
    { 
        name: 'Tím', 
        code: '#800080', 
        image: 'https://picsum.photos/100/100?random=108',
        productImage: 'https://picsum.photos/400/600?random=208'
    }
];

const storageOptions = [
    { size: '128GB', displayName: '128GB' },
    { size: '256GB', displayName: '256GB' },
    { size: '512GB', displayName: '512GB' },
    { size: '1TB', displayName: '1TB' }
];

// Function to get random images for a product
const getProductImages = (categoryName, productIndex, colorIndex = 0) => {
    const images = productImages[categoryName] || [];
    const numImages = Math.floor(Math.random() * 3) + 3; // 3-5 images
    const selectedImages = [];
    
    // Use color-specific image as first image
    if (colors[colorIndex] && colors[colorIndex].productImage) {
        selectedImages.push(colors[colorIndex].productImage);
    }
    
    // Add additional random images
    for (let i = 0; i < numImages - 1; i++) {
        const randomIndex = (productIndex + i) % images.length;
        const imageUrl = images[randomIndex];
        const uniqueImage = `${imageUrl}&random=${productIndex * 100 + i}`;
        selectedImages.push(uniqueImage);
    }
    
    return selectedImages;
};

// Function to get random spec from array
const getRandomSpec = (specArray) => {
    return specArray[Math.floor(Math.random() * specArray.length)];
};

const generateProductData = (categoryName, brand, model, index) => {
    const basePrice = Math.floor(Math.random() * 20000000) + 5000000; // 5M - 25M
    const discountPercent = Math.random() > 0.7 ? Math.floor(Math.random() * 30) + 5 : 0; // 30% chance có discount
    
    const variants = [];
    
    // Create variants for ALL colors and ALL storage options
    colors.forEach((color, colorIndex) => {
        storageOptions.forEach((storage, storageIndex) => {
            const variantPrice = basePrice + (storageIndex * 2000000) + (colorIndex * 500000);
            const discountPrice = discountPercent > 0 ? variantPrice * (1 - discountPercent / 100) : 0;
            
            // Random stock - some variants might be out of stock
            const stock = Math.random() > 0.3 ? Math.floor(Math.random() * 50) + 10 : 0;
            
            variants.push({
                color,
                storage,
                price: variantPrice,
                priceDiscount: discountPrice,
                stock: stock,
                sku: `${brand.replace(/\s+/g, '')}_${model.replace(/\s+/g, '')}_${storage.size}_${color.name.replace(/\s+/g, '')}_${index}`
            });
        });
    });
    
    // Generate COMPLETE attributes based on category (đầy đủ 8 thông số)
    const specs = completeSpecs[categoryName];
    let attributes = {};
    
    if (specs) {
        // Đảm bảo tất cả 8 thông số đều được điền
        Object.keys(specs).forEach(key => {
            attributes[key] = getRandomSpec(specs[key]);
        });
    }
    
    // Get product images (use first color as default)
    const productImages = getProductImages(categoryName, index, 0);
    
    return {
        name: `${brand} ${model}`,
        brand,
        description: `${brand} ${model} - Sản phẩm chất lượng cao với thiết kế hiện đại và hiệu năng mạnh mẽ. Phù hợp cho mọi nhu cầu sử dụng.`,
        images: productImages,
        attributes, // Đầy đủ 8 thông số kỹ thuật
        price: variants[0].price,
        priceDiscount: variants[0].priceDiscount,
        stock: variants.reduce((sum, v) => sum + v.stock, 0),
        variants,
        defaultVariant: {
            colorIndex: 0,
            storageIndex: 0
        }
    };
};

const insertProducts = async () => {
    try {
        console.log('\n🚀 STARTING PRODUCT INSERTION WITH COMPLETE SPECIFICATIONS...\n');
        
        // Get all categories
        const categories = await Category.find({}).sort({ nameCategory: 1 });
        console.log(`📂 Found ${categories.length} categories`);
        
        // Get existing product names to avoid duplicates
        const existingProducts = await Product.find({}, 'name brand');
        const existingProductNames = new Set(existingProducts.map(p => `${p.brand} ${p.name}`));
        console.log(`🔍 Found ${existingProducts.length} existing products to avoid duplicates`);
        
        let totalInserted = 0;
        const productsPerCategory = 180; // 900 / 5 categories
        
        for (const category of categories) {
            console.log(`\n📦 Processing category: ${category.nameCategory}`);
            
            const categoryBrands = brands[category.nameCategory] || [];
            const categoryModels = (() => {
                switch (category.nameCategory) {
                    case 'Điện thoại': return phoneModels;
                    case 'Laptop': return laptopModels;
                    case 'Máy tính bảng': return tabletModels;
                    case 'Tai nghe': return headphoneModels;
                    case 'Đồng hồ': return watchModels;
                    default: return [];
                }
            })();
            
            let insertedInCategory = 0;
            let attempts = 0;
            const maxAttempts = productsPerCategory * 3;
            
            while (insertedInCategory < productsPerCategory && attempts < maxAttempts) {
                attempts++;
                
                const brand = categoryBrands[Math.floor(Math.random() * categoryBrands.length)];
                const model = categoryModels[Math.floor(Math.random() * categoryModels.length)];
                const modelSuffix = Math.floor(Math.random() * 5) + 1;
                const fullModel = `${model} ${modelSuffix}`;
                
                const productName = `${brand} ${fullModel}`;
                
                // Check if product already exists
                if (existingProductNames.has(productName)) {
                    continue;
                }
                
                try {
                    const productData = generateProductData(category.nameCategory, brand, fullModel, insertedInCategory + 1);
                    
                    const newProduct = new Product({
                        ...productData,
                        category: category._id
                    });
                    
                    await newProduct.save();
                    insertedInCategory++;
                    totalInserted++;
                    
                    if (insertedInCategory % 20 === 0) {
                        console.log(`   ✅ Inserted ${insertedInCategory}/${productsPerCategory} products in ${category.nameCategory}`);
                        console.log(`   📸 Sample image: ${productData.images[0]}`);
                        console.log(`   🔧 Complete specs: ${Object.keys(productData.attributes).join(', ')}`);
                        console.log(`   🎨 Variants: ${productData.variants.length} (${colors.length} colors × ${storageOptions.length} storage)`);
                    }
                    
                } catch (error) {
                    console.error(`   ❌ Error inserting product: ${error.message}`);
                }
            }
            
            console.log(`   ✅ Completed ${category.nameCategory}: ${insertedInCategory} products inserted`);
        }
        
        console.log(`\n🎉 INSERTION COMPLETED!`);
        console.log(`📊 Total products inserted: ${totalInserted}`);
        console.log(`🖼️  All products have real images from Picsum`);
        console.log(`🔧 All products have COMPLETE technical specifications (8 specs each)`);
        console.log(`🎨 Each product has ${colors.length} colors × ${storageOptions.length} storage = ${colors.length * storageOptions.length} variants`);
        
        // Final count
        const finalCount = await Product.countDocuments();
        console.log(`📦 Total products in database: ${finalCount}`);
        
    } catch (error) {
        console.error('❌ Error during insertion:', error);
    } finally {
        await mongoose.disconnect();
        console.log('🔌 Disconnected from MongoDB');
    }
};

// Run the insertion
connectDB().then(insertProducts);

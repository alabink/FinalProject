const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

const genAI = new GoogleGenerativeAI(process.env.API_KEY_GEMINI);
const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

const modelProduct = require('../models/products.model');
const modelCategory = require('../models/category.model');

// Cloudinary configuration
const CLOUDINARY_BASE_URL = 'https://res.cloudinary.com/dgliyvuvy/image/upload';
const DEFAULT_IMAGE = `${CLOUDINARY_BASE_URL}/v1712345678/phone_shop/default-product.webp`;

const chatHistory = new Map();
const userContext = new Map();

// Helper function to get image URL
function getImageUrl(imagePath) {
  if (
    !imagePath ||
    imagePath.includes('placeholder-product.jpg') ||
    imagePath.startsWith('/')
  ) {
    return DEFAULT_IMAGE;
  }

  if (imagePath.startsWith('http')) return imagePath;
  return `${CLOUDINARY_BASE_URL}/${imagePath}`;
}

// ✅ FIXED: Hàm truy vấn sản phẩm được tối ưu hóa hoàn toàn
async function getRelevantProducts(query, limit = 10) {
    try {
        // Bước 1: Phân tích và làm sạch query
        const cleanQuery = query.toLowerCase()
            .replace(/[^\w\s\u00C0-\u024F\u1E00-\u1EFF]/g, ' ') // Giữ lại ký tự tiếng Việt
            .replace(/\s+/g, ' ')
            .trim();

        console.log('🔍 Original query:', query);
        console.log('🧹 Cleaned query:', cleanQuery);

        if (!cleanQuery || cleanQuery.length < 2) {
            // Trả về sản phẩm mới nhất nếu query rỗng
            const products = await modelProduct
                .find({})
                .populate('category')
                .sort({ createdAt: -1 })
                .limit(limit)
                .lean();
            
            console.log('📦 Fallback products count:', products.length);
            return products.map(product => formatProduct(product));
        }

        // Bước 2: Tách từ khóa thông minh
        const keywords = extractKeywords(cleanQuery);
        console.log('🔑 Keywords extracted:', keywords);

        if (keywords.length === 0) {
            // Fallback với aggregation đơn giản
            const products = await modelProduct
                .find({})
                .populate('category')
                .sort({ createdAt: -1 })
                .limit(limit)
                .lean();
            
            return products.map(product => formatProduct(product));
        }

        // Bước 3: Xây dựng pipeline aggregation được tối ưu
        const pipeline = buildSearchPipeline(keywords, limit);
        
        console.log('⚙️ Search pipeline:', JSON.stringify(pipeline, null, 2));

        // Bước 4: Thực hiện truy vấn
        const products = await modelProduct.aggregate(pipeline);
        
        console.log('📊 Found products:', products.length);
        console.log('📝 Product names:', products.map(p => p.name));

        if (products.length === 0) {
            console.log('⚠️ No products found, trying fallback search...');
            return await fallbackSearch(cleanQuery, limit);
        }

        return products.map(product => formatProduct(product));

    } catch (error) {
        console.error('❌ Error in getRelevantProducts:', error);
        
        // Ultimate fallback
        try {
            const fallbackProducts = await modelProduct
                .find({})
                .populate('category')
                .limit(limit)
                .lean();
            
            console.log('🆘 Ultimate fallback returned:', fallbackProducts.length, 'products');
            return fallbackProducts.map(product => formatProduct(product));
        } catch (fallbackError) {
            console.error('💀 Ultimate fallback failed:', fallbackError);
            return [];
        }
    }
}

// ✅ Hàm tách từ khóa thông minh
function extractKeywords(query) {
    const stopWords = new Set([
        'của', 'cho', 'và', 'có', 'là', 'được', 'trong', 'với', 'về', 
        'tôi', 'bạn', 'này', 'đó', 'the', 'and', 'or', 'in', 'on', 'at',
        'giá', 'bao', 'nhiêu', 'thế', 'nào', 'gì', 'sao', 'như'
    ]);

    return query
        .split(/\s+/)
        .map(word => word.trim())
        .filter(word => word.length > 1 && !stopWords.has(word))
        .filter(word => !/^\d+$/.test(word) || word.length > 3); // Giữ lại số có ý nghĩa
}

// ✅ Xây dựng pipeline tìm kiếm tối ưu
function buildSearchPipeline(keywords, limit) {
    // Tạo regex patterns cho từng keyword
    const regexPatterns = keywords.map(keyword => ({
        $regex: keyword,
        $options: 'i'
    }));

    return [
        // Bước 1: Join với category
        {
            $lookup: {
                from: 'categories',
                localField: 'category',
                foreignField: '_id',
                as: 'category'
            }
        },
        {
            $unwind: {
                path: '$category',
                preserveNullAndEmptyArrays: true
            }
        },
        
        // Bước 2: Tính điểm relevance
        {
            $addFields: {
                relevanceScore: {
                    $add: [
                        // Điểm perfect match cho tên (trọng số 20)
                        {
                            $cond: {
                                if: {
                                    $or: keywords.map(keyword => ({
                                        $regexMatch: {
                                            input: { $toLower: '$name' },
                                            regex: new RegExp(`\\b${keyword}\\b`, 'i')
                                        }
                                    }))
                                },
                                then: 20,
                                else: 0
                            }
                        },
                        
                        // Điểm partial match cho tên (trọng số 15)
                        {
                            $multiply: [
                                {
                                    $size: {
                                        $filter: {
                                            input: regexPatterns,
                                            cond: {
                                                $regexMatch: {
                                                    input: { $toLower: '$name' },
                                                    regex: '$$this'
                                                }
                                            }
                                        }
                                    }
                                },
                                15
                            ]
                        },
                        
                        // Điểm brand match (trọng số 12)
                        {
                            $multiply: [
                                {
                                    $size: {
                                        $filter: {
                                            input: regexPatterns,
                                            cond: {
                                                $regexMatch: {
                                                    input: { $toLower: { $ifNull: ['$brand', ''] } },
                                                    regex: '$$this'
                                                }
                                            }
                                        }
                                    }
                                },
                                12
                            ]
                        },
                        
                        // Điểm category match (trọng số 8)
                        {
                            $multiply: [
                                {
                                    $size: {
                                        $filter: {
                                            input: regexPatterns,
                                            cond: {
                                                $regexMatch: {
                                                    input: { $toLower: { $ifNull: ['$category.nameCategory', ''] } },
                                                    regex: '$$this'
                                                }
                                            }
                                        }
                                    }
                                },
                                8
                            ]
                        },
                        
                        // Điểm description match (trọng số 5)
                        {
                            $multiply: [
                                {
                                    $size: {
                                        $filter: {
                                            input: regexPatterns,
                                            cond: {
                                                $regexMatch: {
                                                    input: { $toLower: { $ifNull: ['$description', ''] } },
                                                    regex: '$$this'
                                                }
                                            }
                                        }
                                    }
                                },
                                5
                            ]
                        }
                    ]
                }
            }
        },
        
        // Bước 3: Lọc sản phẩm có điểm > 0
        {
            $match: {
                relevanceScore: { $gt: 0 }
            }
        },
        
        // Bước 4: Sắp xếp theo điểm relevance và thời gian
        {
            $sort: { 
                relevanceScore: -1, 
                createdAt: -1 
            }
        },
        
        // Bước 5: Giới hạn kết quả
        {
            $limit: limit
        }
    ];
}

// ✅ Fallback search khi không tìm thấy kết quả
async function fallbackSearch(query, limit) {
    try {
        console.log('🔄 Executing fallback search for:', query);
        
        // Thử tìm kiếm với text search index (nếu có)
        let products = await modelProduct
            .find({
                $or: [
                    { name: { $regex: query, $options: 'i' } },
                    { brand: { $regex: query, $options: 'i' } },
                    { description: { $regex: query, $options: 'i' } }
                ]
            })
            .populate('category')
            .limit(limit)
            .lean();

        if (products.length === 0) {
            // Nếu vẫn không có, thử tìm từng từ
            const words = query.split(' ').filter(word => word.length > 2);
            for (const word of words) {
                products = await modelProduct
                    .find({
                        $or: [
                            { name: { $regex: word, $options: 'i' } },
                            { brand: { $regex: word, $options: 'i' } }
                        ]
                    })
                    .populate('category')
                    .limit(limit)
                    .lean();
                
                if (products.length > 0) break;
            }
        }

        console.log('🔄 Fallback found:', products.length, 'products');
        return products.map(product => formatProduct(product));
    } catch (error) {
        console.error('❌ Fallback search error:', error);
        return [];
    }
}

// ✅ Helper function để format product data - CẢI TIẾN
function formatProduct(product) {
    return {
        id: product._id.toString(),
        name: product.name || '',
        brand: product.brand || '',
        price: product.price || 0,
        priceDiscount: product.priceDiscount || null,
        description: product.description || '',
        attributes: product.attributes || {},
        variants: product.variants || [],
        stock: product.stock || 0,
        rating: product.rating || 0,
        category: product.category ? {
            id: product.category._id?.toString() || product.category.toString(),
            name: product.category.nameCategory || product.category.name || '',
            description: product.category.description || ''
        } : null,
        images: product.images?.map(img => getImageUrl(img)) || [DEFAULT_IMAGE],
        slug: product.slug || product._id.toString()
    };
}

// ✅ Hàm lấy categories được tối ưu
async function getCategories() {
    try {
        const categories = await modelCategory.find({}).lean();
        return categories.map(cat => ({
            id: cat._id.toString(),
            name: cat.nameCategory || cat.name || '',
            description: cat.description || ''
        }));
    } catch (error) {
        console.error('❌ Error getting categories:', error);
        return [];
    }
}

// ✅ Hàm tìm kiếm thông minh được cải tiến
async function smartProductSearch(query, limit = 8) {
    console.log('🎯 Smart product search for:', query, 'limit:', limit);
    
    const results = await getRelevantProducts(query, limit);
    
    console.log('✅ Smart search results:', results.length);
    console.log('📋 Product names:', results.map(p => p.name));
    
    return results;
}

// Giữ nguyên các hàm còn lại...
function analyzeQuestion(question) {
    const intents = {
        product_specific: {
            patterns: [
                /iphone|samsung|xiaomi|oppo|vivo|huawei|nokia|realme/i,
                /\d+\s*(gb|tb|pro|max|plus|mini)/i
            ],
            confidence: 0.9
        },
        variant_inquiry: {
            patterns: [
                /màu|color|colours/i,
                /phiên bản|version|variant/i,
                /bộ nhớ|storage|gb|tb/i,
                /có mấy màu|có những màu|màu nào|màu gì/i,
                /có mấy phiên bản|phiên bản nào/i
            ],
            confidence: 0.9
        },
        price_inquiry: {
            patterns: [/giá|bao nhiêu|cost|price|tiền/i],
            confidence: 0.8
        },
        comparison: {
            patterns: [/so sánh|khác|hơn|tốt hơn|nên chọn|vs|versus/i],
            confidence: 0.8
        },
        recommendation: {
            patterns: [/tư vấn|gợi ý|đề xuất|nên mua|phù hợp|recommend/i],
            confidence: 0.7
        },
        technical_specs: {
            patterns: [/thông số|cấu hình|ram|cpu|camera|pin|màn hình|storage/i],
            confidence: 0.8
        },
        availability: {
            patterns: [/còn hàng|hết hàng|có sẵn|stock|available/i],
            confidence: 0.7
        },
        warranty: {
            patterns: [/bảo hành|warranty|guarantee|lỗi|sửa chữa/i],
            confidence: 0.6
        },
        promotion: {
            patterns: [/khuyến mãi|giảm giá|sale|promotion|ưu đãi|discount/i],
            confidence: 0.6
        },
        general_info: {
            patterns: [/cửa hàng|địa chỉ|liên hệ|hotline|store|contact/i],
            confidence: 0.5
        }
    };

    const results = [];
    for (const [intent, config] of Object.entries(intents)) {
        const matches = config.patterns.filter(pattern => pattern.test(question));
        if (matches.length > 0) {
            results.push({
                intent,
                confidence: config.confidence * (matches.length / config.patterns.length)
            });
        }
    }

    return results.sort((a, b) => b.confidence - a.confidence);
}

async function buildIntelligentContext(userId, question, dbData) {
    if (!userContext.has(userId)) {
        userContext.set(userId, {
            currentProducts: [],
            preferences: {},
            conversationFlow: [],
            lastIntent: null
        });
    }

    const context = userContext.get(userId);
    const intents = analyzeQuestion(question);
    
    if (intents.length > 0) {
        context.lastIntent = intents[0].intent;
    }

    // ✅ CẢI TIẾN: Tăng số lượng sản phẩm để có nhiều lựa chọn hơn
    const mentionedProducts = await smartProductSearch(question, 8);
    console.log("🔍 Mentioned products found:", mentionedProducts.length);
    console.log("📋 Product names:", mentionedProducts.map(p => p.name));
    
    if (mentionedProducts.length > 0) {
        context.currentProducts = mentionedProducts;
    }

    // Phân tích preferences
    const priceMatch = question.match(/(\d+)\s*(triệu|tr|million)/i);
    if (priceMatch) {
        context.preferences.maxPrice = parseInt(priceMatch[1]) * 1000000;
    }

    const features = {
        camera: /camera|chụp ảnh|photography|selfie/i,
        gaming: /game|gaming|fps|performance|hiệu năng/i,
        battery: /pin|battery|dùng lâu|thời lượng/i,
        screen: /màn hình|screen|display|xem phim/i,
        storage: /bộ nhớ|storage|gb|tb/i
    };

    for (const [feature, pattern] of Object.entries(features)) {
        if (pattern.test(question)) {
            context.preferences[feature] = true;
        }
    }

    context.conversationFlow.push({
        question,
        intents,
        timestamp: new Date()
    });

    // Giới hạn conversation flow
    if (context.conversationFlow.length > 5) {
        context.conversationFlow.shift();
    }

    return context;
}

async function createIntelligentPrompt(question, context, relevantProducts, categories) {
    // ✅ CẢI TIẾN: Hiển thị thông tin sản phẩm chi tiết hơn
    const productInfo = relevantProducts.map((product, index) => {
        let variantInfo = '';
        if (product.variants && product.variants.length > 0) {
            const colors = [...new Set(product.variants.map(v => v.color?.name).filter(Boolean))];
            const storages = [...new Set(product.variants.map(v => v.storage?.size).filter(Boolean))];
            const priceRange = {
                min: Math.min(...product.variants.map(v => v.priceDiscount || v.price)),
                max: Math.max(...product.variants.map(v => v.price))
            };
            
            variantInfo = `
Màu sắc có sẵn: ${colors.length > 0 ? colors.join(', ') : 'Không có thông tin'}
Phiên bản bộ nhớ: ${storages.length > 0 ? storages.join(', ') : 'Không có thông tin'}
Khoảng giá: ${priceRange.min.toLocaleString('vi-VN')}đ - ${priceRange.max.toLocaleString('vi-VN')}đ`;
        }

        const attributesText = Object.entries(product.attributes || {})
            .map(([k, v]) => `${k}: ${v}`)
            .join(', ');

        return `
[SẢN PHẨM ${index + 1}]
ID: ${product.id}
Tên: ${product.name}
Brand: ${product.brand}
Giá: ${product.price?.toLocaleString('vi-VN') || 'N/A'}đ${product.priceDiscount ? ` (Giảm giá: ${product.priceDiscount.toLocaleString('vi-VN')}đ)` : ''}
Mô tả: ${product.description || 'Không có mô tả'}
Thông số kỹ thuật: ${attributesText || 'Không có thông số'}${variantInfo}
Số lượng tồn kho: ${product.stock || 0}
Đánh giá: ${product.rating || 0}/5
Danh mục: ${product.category?.name || 'Không xác định'}
Ảnh: ${product.images?.[0] || DEFAULT_IMAGE}
Slug: ${product.slug}
`;
    }).join('\n---\n');

    const categoryInfo = categories.map(cat => `
Danh mục: ${cat.name}
Mô tả: ${cat.description || 'Không có mô tả'}
`).join('\n');

    const contextInfo = `
Sản phẩm đang quan tâm: ${context.currentProducts.map(p => p.name).join(', ') || 'Chưa có'}
Intent cuối cùng: ${context.lastIntent || 'Chưa xác định'}
Preferences: ${Object.entries(context.preferences).filter(([k, v]) => v).map(([k, v]) => k).join(', ') || 'Chưa có'}
Lịch sử hội thoại: ${context.conversationFlow.slice(-3).map(f => f.question).join(' -> ')}
`;

    return `
Bạn là một AI trợ lý thông minh của cửa hàng điện thoại. Nhiệm vụ của bạn là trả lời mọi câu hỏi của khách hàng một cách chính xác và phù hợp.

THÔNG TIN CỬA HÀNG:
DANH SÁCH SẢN PHẨM (${relevantProducts.length} sản phẩm được tìm thấy):
${productInfo}

DANH MỤC SẢN PHẨM:
${categoryInfo}

CONTEXT CUỘC TRÒ CHUYỆN:
${contextInfo}

CÂU HỎI KHÁCH HÀNG:
"${question}"

QUY TẮC TRẢ LỜI QUAN TRỌNG:

1. PHÂN TÍCH CÂU HỎI TRƯỚC KHI TRẢ LỜI:
   - Nếu câu hỏi KHÔNG liên quan đến sản phẩm điện thoại (ví dụ: chào hỏi, hỏi thời tiết, câu hỏi chung): KHÔNG đề cập đến sản phẩm nào
   - Nếu câu hỏi có liên quan đến sản phẩm: Tiếp tục bước 2

2. KIỂM TRA SẢN PHẨM TRONG CỬA HÀNG:
   - Tìm CHÍNH XÁC sản phẩm được hỏi trong danh sách trên
   - Nếu KHÔNG TÌM THẤY sản phẩm: Trả lời "Xin lỗi, hiện tại cửa hàng chúng tôi không có sản phẩm [tên sản phẩm] mà bạn đang tìm kiếm"
   - Nếu TÌM THẤY sản phẩm: Trả lời thông tin chi tiết

3. CÁC LOẠI CÂU HỎI VÀ CÁCH XỬ LÝ:
   - Chào hỏi/cảm ơn: Trả lời lịch sự, không đề cập sản phẩm
   - Hỏi về giờ mở cửa/địa chỉ: Trả lời thông tin cửa hàng
   - Hỏi sản phẩm cụ thể: Kiểm tra có trong danh sách không
   - So sánh sản phẩm: Chỉ so sánh những sản phẩm có trong cửa hàng
   - Tư vấn: Chỉ đề xuất sản phẩm có trong danh sách
   - HỎI VỀ MÀU SẮC/PHIÊN BẢN: Trả lời dạng TEXT thông thường, KHÔNG dùng JSON format

4. YÊU CẦU ĐỊNH DẠNG:
   - TUYỆT ĐỐI KHÔNG sử dụng các ký tự đặc biệt như **, ##, --, ==
   - Không sử dụng in hoa để nhấn mạnh
   - Trả lời ngắn gọn, rõ ràng, dễ hiểu
   - Sử dụng emoji phù hợp
   - Không đề cập đến từ "database"

5. KHI TRẢ LỜI VỀ SẢN PHẨM:
   - QUAN TRỌNG: Nếu câu hỏi về MÀU SẮC, PHIÊN BẢN, BỘ NHỚ của sản phẩm:
     * Trả lời dạng TEXT thông thường
     * Liệt kê đầy đủ các màu sắc và phiên bản có sẵn
     * Không sử dụng JSON format
     * Không hiển thị ảnh hay link sản phẩm
   
   - Nếu câu hỏi về GIỚI THIỆU sản phẩm cụ thể, hãy trả lời với format JSON đặc biệt:
   {
     "type": "product_info",
     "message": "Thông tin sản phẩm...",
     "products": [
       {
         "id": "product_id",
         "name": "Tên sản phẩm",
         "price": 1000000,
         "priceDiscount": 900000,
         "image": "đường_dẫn_ảnh",
         "slug": "product_slug"
       }
     ]
   }
   
   - Nếu không có sản phẩm cụ thể, trả lời bình thường

VÍ DỤ CỤ THỂ:

Câu hỏi: "Xin chào"
Trả lời: "Xin chào! Chào mừng bạn đến với cửa hàng điện thoại của chúng tôi. Tôi có thể hỗ trợ gì cho bạn hôm nay? 😊"

Câu hỏi: "iPhone 15 Pro Max giá bao nhiêu?"
- Nếu có trong danh sách: Trả lời với JSON format như trên
- Nếu không có: "Xin lỗi, hiện tại cửa hàng chúng tôi không có sản phẩm iPhone 15 Pro Max mà bạn đang tìm kiếm."

Câu hỏi: "iPhone 15 Pro có mấy màu?"
Trả lời: "iPhone 15 Pro hiện có các màu: Titan Tự Nhiên, Titan Xanh, Titan Trắng, Titan Đen. Sản phẩm có các phiên bản bộ nhớ: 128GB, 256GB, 512GB, 1TB với mức giá từ 28.990.000đ đến 43.990.000đ tùy theo phiên bản bạn chọn."

Câu hỏi: "Hôm nay thời tiết thế nào?"
Trả lời: "Tôi là trợ lý của cửa hàng điện thoại nên không thể cung cấp thông tin thời tiết. Tôi có thể giúp bạn tìm hiểu về các sản phẩm điện thoại không? 😊"

Hãy áp dụng các quy tắc trên để trả lời câu hỏi một cách chính xác!
`;
}

// ✅ Hàm xử lý câu hỏi chính - CẢI TIẾN
async function askQuestion(question, userId = 'guest') {
    try {
        console.log('🎤 Processing question:', question, 'for user:', userId);
        
        // Tối ưu hóa: Tăng số lượng sản phẩm để có kết quả tốt hơn
        const [relevantProducts, categories] = await Promise.all([
            getRelevantProducts(question, 10), // Tăng từ 5 lên 10
            getCategories()
        ]);
        
        console.log('📦 Retrieved products:', relevantProducts.length);
        console.log('🏷️ Retrieved categories:', categories.length);
        
        const context = await buildIntelligentContext(userId, question, { products: relevantProducts, categories });
        const prompt = await createIntelligentPrompt(question, context, relevantProducts, categories);
        
        const result = await model.generateContent(prompt);
        const answer = result.response.text();

        // Parse JSON response if exists
        let parsedAnswer;
        try {
            const jsonMatch = answer.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                parsedAnswer = JSON.parse(jsonMatch[0]);

                // ✅ Gắn lại ảnh đúng từ DB nếu có
                if (parsedAnswer.products) {
                    parsedAnswer.products = parsedAnswer.products.map(product => {
                        const matched = relevantProducts.find(p =>
                            p.id === product.id || p.slug === product.slug
                        );

                        return {
                            ...product,
                            image: matched?.images?.[0] || DEFAULT_IMAGE
                        };
                    });
                }
            }
        } catch (e) {
            console.error('❌ Error parsing JSON response:', e);
        }

        // Save chat history
        if (!chatHistory.has(userId)) {
            chatHistory.set(userId, []);
        }
        
        const historyEntry = {
            question,
            answer: parsedAnswer || answer,
            timestamp: new Date(),
            productsFound: relevantProducts.length,
            productNames: relevantProducts.map(p => p.name)
        };
        
        chatHistory.get(userId).push(historyEntry);
        
        // Giới hạn lịch sử chat
        const userHistory = chatHistory.get(userId);
        if (userHistory.length > 10) {
            userHistory.shift();
        }

        console.log('✅ Question processed successfully');
        console.log('📊 Final answer type:', parsedAnswer ? 'JSON' : 'TEXT');
        
        return parsedAnswer || answer;
    } catch (error) {
        console.error('❌ Critical error in askQuestion:', error);
        return 'Xin lỗi, đã có lỗi xảy ra khi xử lý câu hỏi của bạn. Vui lòng thử lại sau hoặc liên hệ với chúng tôi để được hỗ trợ.';
    }
}

// ✅ THÊM: Hàm debug để kiểm tra kết quả tìm kiếm
async function debugSearch(query) {
    try {
        console.log('🐛 DEBUG: Testing search for:', query);
        
        const results = await getRelevantProducts(query, 5);
        
        console.log('🐛 DEBUG Results:');
        console.log('📊 Total found:', results.length);
        
        results.forEach((product, index) => {
            console.log(`🐛 Product ${index + 1}:`, {
                id: product.id,
                name: product.name,
                brand: product.brand,
                price: product.price,
                category: product.category?.name
            });
        });
        
        return results;
    } catch (error) {
        console.error('🐛 DEBUG Error:', error);
        return [];
    }
}

// ✅ THÊM: Hàm kiểm tra sức khỏe của database
async function healthCheck() {
    try {
        console.log('🏥 Running health check...');
        
        const [productCount, categoryCount] = await Promise.all([
            modelProduct.countDocuments({}),
            modelCategory.countDocuments({})
        ]);
        
        console.log('📊 Database Status:');
        console.log('📱 Total products:', productCount);
        console.log('🏷️ Total categories:', categoryCount);
        
        if (productCount === 0) {
            console.warn('⚠️ WARNING: No products found in database!');
        }
        
        if (categoryCount === 0) {
            console.warn('⚠️ WARNING: No categories found in database!');
        }
        
        // Test một vài truy vấn mẫu
        const testQueries = ['iphone', 'samsung', 'điện thoại'];
        
        for (const query of testQueries) {
            const results = await getRelevantProducts(query, 3);
            console.log(`🔍 Test query "${query}": ${results.length} results`);
        }
        
        return {
            status: 'healthy',
            productCount,
            categoryCount,
            timestamp: new Date()
        };
    } catch (error) {
        console.error('🏥 Health check failed:', error);
        return {
            status: 'unhealthy',
            error: error.message,
            timestamp: new Date()
        };
    }
}

module.exports = { 
    askQuestion,
    debugSearch,
    healthCheck,
    getRelevantProducts,
    smartProductSearch
};
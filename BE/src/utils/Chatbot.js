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
//


async function getAllDatabaseData() {
    try {
        const [products, categories] = await Promise.all([
            modelProduct.find({}).populate('category'),
            modelCategory.find({})
        ]);

        return {
            products: products.map(product => ({
                id: product._id.toString(),
                name: product.name,
                price: product.price,
                priceDiscount: product.priceDiscount,
                description: product.description,
                attributes: product.attributes,
                stock: product.stock,
                rating: product.rating,
                category: product.category,
                images: product.images?.map(img => getImageUrl(img)) || [DEFAULT_IMAGE],
                slug: product.slug || product._id.toString()
            })),
            categories: categories.map(cat => ({
                id: cat._id.toString(),
                name: cat.name,
                description: cat.description
            }))
        };
    } catch (error) {
        console.error('Error getting database data:', error);
        return { products: [], categories: [] };
    }
}

// Hàm tìm kiếm sản phẩm thông minh
async function smartProductSearch(query) {
    try {
        const products = await modelProduct.find({}).populate('category');
        const searchTerms = query.toLowerCase().split(' ').filter(term => term.length > 1);
        
        return products.filter(product => {
            const searchText = [
                product.name,
                product.description || '',
                Object.values(product.attributes || {}).join(' '),
                product.category?.nameCategory || ''
            ].join(' ').toLowerCase();
            
            return searchTerms.some(term => searchText.includes(term));
        }).sort((a, b) => {
            // Ưu tiên sản phẩm có tên chứa từ khóa
            const aNameMatch = searchTerms.some(term => a.name.toLowerCase().includes(term));
            const bNameMatch = searchTerms.some(term => b.name.toLowerCase().includes(term));
            
            if (aNameMatch && !bNameMatch) return -1;
            if (!aNameMatch && bNameMatch) return 1;
            return 0;
        });
    } catch (error) {
        console.error('Error in smart product search:', error);
        return [];
    }
}

// Hàm phân tích câu hỏi và tìm intent
function analyzeQuestion(question) {
    const intents = {
        product_specific: {
            patterns: [
                /iphone|samsung|xiaomi|oppo|vivo|huawei|nokia|realme/i,
                /\d+\s*(gb|tb|pro|max|plus|mini)/i
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

// Hàm tạo context thông minh
function buildIntelligentContext(userId, question, dbData) {
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

    // Tìm sản phẩm được đề cập trong câu hỏi
    const mentionedProducts = smartProductSearch(question);
    console.log ("mentionedProducts:",mentionedProducts)
    if (mentionedProducts.length > 0) {
        context.currentProducts = mentionedProducts.slice(0, 3); // Lấy top 3 sản phẩm liên quan
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

// Hàm tạo prompt thông minh cho AI
function createIntelligentPrompt(question, context, dbData) {
    const { products, categories } = dbData;
    
    const productInfo = products.map(product => `
ID: ${product.id}
Tên: ${product.name}
Giá: ${product.price.toLocaleString('vi-VN')}đ${product.priceDiscount ? ` (Giảm giá: ${product.priceDiscount.toLocaleString('vi-VN')}đ)` : ''}
Mô tả: ${product.description || 'Không có mô tả'}
Thông số: ${Object.entries(product.attributes || {}).map(([k, v]) => `${k}: ${v}`).join(', ')}
Ảnh: ${product.images?.[0] || DEFAULT_IMAGE}
Slug: ${product.slug}
`).join('\n---\n');

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
DANH SÁCH SẢN PHẨM:
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

4. YÊU CẦU ĐỊNH DẠNG:
   - TUYỆT ĐỐI KHÔNG sử dụng các ký tự đặc biệt như **, ##, --, ==
   - Không sử dụng in hoa để nhấn mạnh
   - Trả lời ngắn gọn, rõ ràng, dễ hiểu
   - Sử dụng emoji phù hợp
   - Không đề cập đến từ "database"

5. KHI TRẢ LỜI VỀ SẢN PHẨM:
   - Nếu câu hỏi liên quan đến sản phẩm cụ thể, hãy trả lời với format JSON đặc biệt:
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

Câu hỏi: "Hôm nay thời tiết thế nào?"
Trả lời: "Tôi là trợ lý của cửa hàng điện thoại nên không thể cung cấp thông tin thời tiết. Tôi có thể giúp bạn tìm hiểu về các sản phẩm điện thoại không? 😊"

Hãy áp dụng các quy tắc trên để trả lời câu hỏi một cách chính xác!
`;
}

// Hàm xử lý câu hỏi chính

async function askQuestion(question, userId = 'guest') {
    try {
        const dbData = await getAllDatabaseData();
        const context = buildIntelligentContext(userId, question, dbData);
        const prompt = createIntelligentPrompt(question, context, dbData);
        
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
  const matched = dbData.products.find(p =>
    p.id === product.id || p.slug === product.slug
  );

  return {
    ...product,
    image: matched?.images?.[0] || DEFAULT_PRODUCT_IMAGE
  };
});
    }
  }
} catch (e) {
  console.error('Error parsing JSON response:', e);
}


        // Save chat history
        if (!chatHistory.has(userId)) {
            chatHistory.set(userId, []);
        }
        
        chatHistory.get(userId).push({
            question,
            answer: parsedAnswer || answer,
            timestamp: new Date()
        });

        return parsedAnswer || answer;
    } catch (error) {
        console.error('Error in askQuestion:', error);
        return 'Xin lỗi, đã có lỗi xảy ra. Vui lòng thử lại sau.';
    }
}

module.exports = { askQuestion };
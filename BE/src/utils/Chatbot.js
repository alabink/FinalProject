const { GoogleGenerativeAI } = require('@google/generative-ai');

require('dotenv').config();

const genAI = new GoogleGenerativeAI(process.env.API_KEY_GEMINI);
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

const modelProduct = require('../models/products.model');

async function askQuestion(question) {
    try {
        const products = await modelProduct.find({});
        const productData = products
            .map(
                (product) => `
        Tên: ${product.name}
        Giá: ${product.price.toLocaleString('vi-VN')}đ ${
                    product.priceDiscount ? `(Giảm giá: ${product.priceDiscount.toLocaleString('vi-VN')}đ)` : ''
                }
        Thông số chi tiết:
        ${Object.entries(product.attributes || {})
            .map(([key, value]) => `- ${key}: ${value}`)
            .join('\n        ')}
        Số lượng còn lại: ${product.stock}
      `,
            )
            .join('\n----------------------------------------\n');

        const prompt = `
        Bạn là một chuyên viên tư vấn điện thoại cao cấp với hơn 10 năm kinh nghiệm trong ngành. Nhiệm vụ của bạn là tư vấn chọn điện thoại phù hợp nhất với nhu cầu của khách hàng.

        Đây là danh sách điện thoại hiện có trong cửa hàng:
        ${productData}

        Câu hỏi của khách hàng: "${question}"
        
        Hãy tư vấn một cách chuyên nghiệp, thân thiện và chi tiết theo các bước sau:

        1. Phân tích nhu cầu:
        - Xác định mục đích sử dụng chính (chơi game, chụp ảnh, làm việc, v.v.)
        - Phân tích các yêu cầu về hiệu năng, camera, pin
        - Xem xét ngân sách nếu được đề cập

        2. Đề xuất sản phẩm:
        - Chọn 2-3 điện thoại phù hợp nhất từ danh sách
        - Sắp xếp theo thứ tự phù hợp từ cao đến thấp
        - Nêu rõ giá tiền và thông số nổi bật của từng máy

        3. Phân tích chi tiết:
        - So sánh ưu/nhược điểm của từng máy
        - Giải thích tại sao các thông số kỹ thuật phù hợp với nhu cầu
        - Đánh giá về hiệu năng/giá thành
        - Nhận xét về camera, pin, màn hình theo nhu cầu

        4. Kết luận và tư vấn:
        - Đưa ra lời khuyên cụ thể nên chọn máy nào
        - Giải thích lý do chọn máy đó
        - Đề xuất phụ kiện đi kèm (ốp lưng, cường lực, sạc dự phòng...)
        - Thông tin về chế độ bảo hành và ưu đãi

        Yêu cầu về cách trả lời:
        - Sử dụng ngôn ngữ dễ hiểu, tránh quá nhiều thuật ngữ kỹ thuật
        - Trình bày rõ ràng, có cấu trúc
        - Thể hiện sự quan tâm đến nhu cầu của khách hàng
        - Đưa ra các so sánh cụ thể để khách hàng dễ quyết định
        - Trả lời bằng tiếng Việt, thân thiện và tự nhiên

        Hãy trả lời một cách chi tiết và đầy đủ nhất có thể.
        `;

        const result = await model.generateContent(prompt);
        const answer = result.response.text();
        return answer;
    } catch (error) {
        console.log(error);
        return 'Xin lỗi, đã có lỗi xảy ra trong quá trình xử lý câu hỏi của bạn. Vui lòng thử lại sau hoặc liên hệ trực tiếp với nhân viên tư vấn.';
    }
}

module.exports = { askQuestion };

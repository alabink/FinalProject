const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config();
const mongoose = require('mongoose');

const genAI = new GoogleGenerativeAI(process.env.API_KEY_GEMINI);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" }); // Upgraded to newer model

const modelProduct = require("../models/products.model");
const modelCategory = require("../models/category.model");

/**
 * Sanitizes the AI response to remove Markdown symbols and unwanted characters
 * @param {String} text - Raw text from AI response
 * @returns {String} - Cleaned text ready for HTML
 */
function sanitizeComparisonText(text) {
  // Convert Markdown bold to HTML bold
  text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  
  // Convert Markdown italic to HTML italic
  text = text.replace(/\*(.*?)\*/g, '<em>$1</em>');
  text = text.replace(/_(.*?)_/g, '<em>$1</em>');
  
  // Remove any remaining asterisks
  text = text.replace(/\*/g, '');
  
  // Handle potential markdown headings not properly converted to HTML
  text = text.replace(/#{2,6}\s+(.*?)(\r\n|\r|\n)/g, '<h2>$1</h2>');
  
  // Remove other special Markdown characters
  text = text.replace(/`{1,3}/g, ''); // backticks
  text = text.replace(/~/g, '');      // tildes
  
  // Fix any potential HTML inconsistencies
  text = text.replace(/<\/?(strong|em|h[1-6]|p|ul|li)(>|\s[^>]*>)/gi, match => match.toLowerCase());
  
  // Ensure proper spacing after removing Markdown
  text = text.replace(/\s{2,}/g, ' ');
  
  return text;
}

/**
 * Compare two or more products with advanced AI analysis
 * @param {Array} productIds - Array of product IDs to compare
 * @returns {String} - HTML formatted comparison
 */
async function compareProducts(productIds) {
  try {
    if (!Array.isArray(productIds)) {
      productIds = [productIds];
    }

    // Sanitize & validate ids
    productIds = productIds
      .map((id) => (typeof id === 'string' ? id.trim().replace(/^"|"$/g, '') : id))
      .filter((id) => mongoose.Types.ObjectId.isValid(id));

    if (productIds.length < 2) {
      throw new Error('Cần ít nhất 2 sản phẩm hợp lệ để so sánh');
    }

    // Fetch all products in parallel
    const productPromises = productIds.map((id) => modelProduct.findById(id).populate('category'));
    const products = await Promise.all(productPromises);

    // Check if all products were found
    if (products.some(p => !p)) {
      throw new Error("Không tìm thấy một hoặc nhiều sản phẩm");
    }

    // Get the category of the first product to determine product type
    const category = await modelCategory.findById(products[0].category);
    const productType = category?.name || "unknown";
    
    // Extract all attributes from products to ensure we compare all available attributes
    const allAttributes = new Set();
    products.forEach(product => {
      if (product.attributes) {
        Object.keys(product.attributes).forEach(attr => allAttributes.add(attr));
      }
    });

    // Prepare product data for comparison
    const productData = products.map(product => {
      const variantInfo = product.variants && product.variants.length > 0 
        ? {
            colors: [...new Set(product.variants.map(v => v.color.name))],
            storageOptions: [...new Set(product.variants.map(v => v.storage.size))],
            priceRange: {
              min: Math.min(...product.variants.map(v => v.priceDiscount || v.price)),
              max: Math.max(...product.variants.map(v => v.price))
            }
          }
        : null;
      
      const currentPrice = product.priceDiscount > 0 ? product.priceDiscount : product.price;
      
      return {
        id: product._id.toString(),
        name: product.name,
        brand: product.brand,
        price: currentPrice,
        originalPrice: product.price,
        discount: product.priceDiscount > 0 ? (1 - product.priceDiscount / product.price) * 100 : 0,
        attributes: product.attributes || {},
        description: product.description || "",
        images: product.images || [],
        variants: variantInfo,
        stock: product.stock,
        formattedPrice: currentPrice.toLocaleString("vi-VN") + " VND"
      };
    });

    // Create a detailed comparison prompt based on product type
    let comparisonPrompt = getComparisonPromptByType(productType, productData, Array.from(allAttributes));
    
    // Generate the comparison using AI
    const result = await model.generateContent(comparisonPrompt);
    let comparison = result.response.text();
    
    // Sanitize the AI response to remove Markdown symbols
    comparison = sanitizeComparisonText(comparison);

    // Create a styled HTML response with product images
    return createStyledComparisonHTML(productData, comparison);
  } catch (error) {
    console.error("Lỗi khi so sánh sản phẩm:", error);
    throw error;
  }
}

/**
 * Generate a type-specific comparison prompt
 * @param {String} productType - Category name of products
 * @param {Array} products - Array of product data
 * @param {Array} attributes - Array of all attributes to compare
 * @returns {String} - AI prompt for comparison
 */
function getComparisonPromptByType(productType, products, attributes) {
  // Base comparison data
  const productsInfo = products.map((product, index) => `
Sản phẩm ${index + 1}: ${product.name} (${product.brand})
- Giá: ${product.formattedPrice}${product.discount > 0 ? ` (Giảm ${product.discount.toFixed(1)}%)` : ''}
- Mô tả: ${product.description}
${Object.entries(product.attributes).map(([key, value]) => `- ${key}: ${value}`).join('\n')}
${product.variants ? `- Màu sắc: ${product.variants.colors.join(', ')}
- Tùy chọn bộ nhớ: ${product.variants.storageOptions.join(', ')}
- Khoảng giá: ${product.variants.priceRange.min.toLocaleString("vi-VN")} - ${product.variants.priceRange.max.toLocaleString("vi-VN")} VND` : ''}
  `).join('\n\n');

  // Generic comparison categories
  let comparisonCategories = [
    "1. Thiết kế và chất liệu",
    "2. Hiệu suất và tính năng chính",
    "3. Khả năng đáp ứng nhu cầu người dùng",
    "4. Giá trị so với chi phí",
    "5. Đối tượng người dùng phù hợp",
    "6. Các tính năng đặc biệt hoặc độc quyền"
  ];

  // Product type specific categories
  if (productType.toLowerCase().includes('phone') || productType.toLowerCase().includes('điện thoại')) {
    comparisonCategories = [
      "1. Thiết kế và màn hình",
      "2. Hiệu năng và RAM",
      "3. Camera và khả năng chụp ảnh/quay video",
      "4. Pin và thời lượng sử dụng",
      "5. Các tính năng đặc biệt (bảo mật, kháng nước, sạc nhanh...)",
      "6. Giá trị đồng tiền",
      "7. Đối tượng người dùng phù hợp"
    ];
  } else if (productType.toLowerCase().includes('laptop')) {
    comparisonCategories = [
      "1. Thiết kế và độ di động",
      "2. Màn hình và chất lượng hiển thị",
      "3. Hiệu năng (CPU, GPU, RAM)",
      "4. Thời lượng pin và khả năng sạc",
      "5. Bàn phím và touchpad",
      "6. Cổng kết nối và tính mở rộng",
      "7. Giá trị đồng tiền và phân khúc người dùng"
    ];
  } else if (productType.toLowerCase().includes('tablet') || productType.toLowerCase().includes('máy tính bảng')) {
    comparisonCategories = [
      "1. Thiết kế và kích thước màn hình",
      "2. Hiệu năng và khả năng đa nhiệm",
      "3. Hỗ trợ bút cảm ứng và phụ kiện",
      "4. Pin và thời lượng sử dụng",
      "5. Tính năng đặc biệt",
      "6. Giá trị đồng tiền",
      "7. Đối tượng người dùng phù hợp"
    ];
  }
  
  // Common attributes to focus on by product type
  const attributesByType = {
    'phone': ['screen', 'ram', 'storage', 'camera', 'battery', 'processor', 'os', 'resolution'],
    'laptop': ['screen', 'cpu', 'ram', 'storage', 'gpu', 'battery', 'weight', 'ports'],
    'tablet': ['screen', 'processor', 'ram', 'storage', 'battery', 'os', 'pen_support', 'connectivity'],
    'default': attributes
  };

  // Select attributes to focus on
  let productTypeKey = 'default';
  if (productType.toLowerCase().includes('phone') || productType.toLowerCase().includes('điện thoại')) {
    productTypeKey = 'phone';
  } else if (productType.toLowerCase().includes('laptop')) {
    productTypeKey = 'laptop';
  } else if (productType.toLowerCase().includes('tablet') || productType.toLowerCase().includes('máy tính bảng')) {
    productTypeKey = 'tablet';
  }
  
  const focusAttributes = attributesByType[productTypeKey];
  
  // Create the prompt
  return `
Bạn là một chuyên gia thiết bị công nghệ. Dưới đây là thông tin ${products.length} sản phẩm cần tư vấn:

${productsInfo}

Nhiệm vụ: KHÔNG tạo bảng thông số. KHÔNG liệt kê chi tiết kỹ thuật.

Hãy chỉ tập trung vào câu hỏi: "Người dùng nào phù hợp với mỗi sản phẩm?"

YÊU CẦU:
1. Giới thiệu ngắn gọn bối cảnh, mục tiêu chọn mua (tối đa 2–3 câu).
2. Đối với MỖI sản phẩm:
   - Nêu 3–5 nhóm người dùng / nhu cầu chính mà sản phẩm đó PHÙ HỢP.
   - Giải thích ngắn gọn lý do tại sao.
3. So sánh nhanh ưu thế về giá trị sử dụng giữa các sản phẩm (1 đoạn duy nhất).
4. Kết luận cuối cùng: đề xuất sản phẩm A, B … cho từng tình huống (học sinh, game thủ, người cần pin lâu, người ưa chụp ảnh, ngân sách tiết kiệm…).

LƯU Ý QUAN TRỌNG:
- Đầu ra PHẢI là HTML thuần túy, KHÔNG sử dụng cú pháp Markdown
- Dùng thẻ <h2> cho tiêu đề sản phẩm
- Dùng thẻ <ul><li> cho danh sách các nhóm người dùng
- Dùng thẻ <p> cho đoạn văn
- KHÔNG sử dụng bảng HTML
- KHÔNG sử dụng cú pháp Markdown trong phản hồi
- KHÔNG bao gồm các ký tự đặc biệt của Markdown trong phản hồi
- Phải dùng đúng cấu trúc HTML để hiển thị nội dung, không dùng định dạng Markdown
- BẮT BUỘC kết thúc bài viết bằng thẻ <h2>Kết luận</h2> theo định dạng:
  <ul>
    <li><strong>Tên sản phẩm 1</strong>: tóm tắt thân thiện 1–2 câu nêu đối tượng / nhu cầu phù hợp.</li>
    <li><strong>Tên sản phẩm 2</strong>: tóm tắt thân thiện 1–2 câu nêu đối tượng / nhu cầu phù hợp.</li>
  </ul>
  Viết ngắn gọn, giọng gần gũi, tránh thuật ngữ phức tạp.
`;
}

/**
 * Create styled HTML with product images and comparison content
 * @param {Array} products - Array of product data
 * @param {String} comparisonContent - AI generated comparison text
 * @returns {String} - Styled HTML content
 */
function createStyledComparisonHTML(products, comparisonContent) {
  // Ensure we have exactly 2 products for the VS design
  const product1 = products[0] || {};
  const product2 = products.length > 1 ? products[1] : {};

  // Determine which product is premium based on higher current price
  const product1Price = product1.price || 0;
  const product2Price = product2.price || 0;
  const product1IsPremium = product1Price >= product2Price;

  const premiumProduct = product1IsPremium ? product1 : product2;
  const valueProduct = product1IsPremium ? product2 : product1;

  // Helper to get badge HTML for a given product
  const getBadgeHTML = (isPremium) => {
    return isPremium ? 
      `<div class="badge premium">Cao cấp</div>` : 
      `<div class="badge value">Tiết kiệm</div>`;
  };
  
  // Create a more visually appealing VS comparison layout
  const productComparison = `
    <div class="product-comparison">
      <div class="product-card left">
        <div class="product-image-container">
      <div class="product-image">
            <img src="${product1.images?.[0] || ''}" alt="${product1.name}">
          </div>
          ${getBadgeHTML(product1IsPremium)}
        </div>
        <div class="product-details">
          <h3>${product1.name}</h3>
          <div class="product-price">
            ${product1.discount > 0 ? 
              `<span class="original-price">${product1.originalPrice?.toLocaleString("vi-VN")} VND</span>
              <span class="discount-price">${product1.formattedPrice}</span>
              <span class="discount-percent">-${Math.round(product1.discount)}%</span>` :
              `<span class="regular-price">${product1.formattedPrice}</span>`
            }
          </div>
          <div class="product-brand">
            <span>Thương hiệu: ${product1.brand}</span>
          </div>
        </div>
      </div>
      
      <div class="vs-container">
        <div class="vs-circle">VS</div>
      </div>
      
      <div class="product-card right">
        <div class="product-image-container">
          <div class="product-image">
            <img src="${product2.images?.[0] || ''}" alt="${product2.name}">
          </div>
          ${getBadgeHTML(!product1IsPremium)}
        </div>
        <div class="product-details">
          <h3>${product2.name}</h3>
      <div class="product-price">
            ${product2.discount > 0 ? 
              `<span class="original-price">${product2.originalPrice?.toLocaleString("vi-VN")} VND</span>
              <span class="discount-price">${product2.formattedPrice}</span>
              <span class="discount-percent">-${Math.round(product2.discount)}%</span>` :
              `<span class="regular-price">${product2.formattedPrice}</span>`
        }
          </div>
          <div class="product-brand">
            <span>Thương hiệu: ${product2.brand}</span>
          </div>
        </div>
      </div>
    </div>
  `;
  
  // Create a feature comparison for the two products if they have attributes
  const createFeatureComparison = () => {
    if (!product1.attributes || !product2.attributes) return '';
    
    // Get all unique attributes from both products
    const allAttributes = new Set();
    [product1, product2].forEach(product => {
      if (product.attributes) {
        Object.keys(product.attributes).forEach(key => allAttributes.add(key));
      }
    });
    
    // Create comparison rows for each attribute
    const attributeRows = Array.from(allAttributes).map(attr => {
      const value1 = product1.attributes[attr] || '-';
      const value2 = product2.attributes[attr] || '-';
      return `
        <tr>
          <td>${attr}</td>
          <td>${value1}</td>
          <td>${value2}</td>
        </tr>
      `;
    });
    
    return `
      <div class="features-table-container">
        <h2>So sánh thông số kỹ thuật</h2>
        <table class="features-table">
          <thead>
            <tr>
              <th>Thông số</th>
              <th>${product1.name}</th>
              <th>${product2.name}</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Giá</td>
              <td>${product1.formattedPrice}</td>
              <td>${product2.formattedPrice}</td>
            </tr>
            ${attributeRows.join('')}
          </tbody>
        </table>
      </div>
    `;
  };
   
  // Ensure comparison content is properly processed
  let processedContent = comparisonContent;
  
  // Check if the content has proper HTML structure
  if (!processedContent.includes('<h2>') && !processedContent.includes('<ul>')) {
    // If missing proper HTML, wrap in paragraph tags
    processedContent = `<p>${processedContent}</p>`;
  }
  
  // Ensure the content doesn't have any unwanted scripts
  processedContent = processedContent
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '');

  return `
      <style>
      /* Modern, clean design with better typography */
        .comparison-container {
        max-width: 1200px;
          margin: 0 auto;
        padding: 0;
        font-family: 'Segoe UI', Roboto, -apple-system, BlinkMacSystemFont, sans-serif;
          line-height: 1.6;
          color: #333;
        background: white;
        border-radius: 20px;
        overflow: hidden;
        box-shadow: 0 10px 40px rgba(0, 0, 0, 0.08);
      }
      
      /* Header with gradient background */
      .comparison-header {
        background: linear-gradient(135deg, #0062E6, #33A0FF);
        padding: 30px;
        color: white;
        text-align: center;
        position: relative;
        overflow: hidden;
      }
      
      .comparison-header h1 {
        margin: 0;
        font-weight: 600;
        font-size: 24px;
        position: relative;
        z-index: 2;
      }
      
      .comparison-header p {
        margin: 10px 0 0;
        opacity: 0.9;
        font-size: 15px;
        position: relative;
        z-index: 2;
      }
      
      /* Background pattern for header */
      .comparison-header::before {
        content: "";
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z' fill='rgba(255,255,255,0.05)' fill-rule='evenodd'/%3E%3C/svg%3E");
        opacity: 0.5;
        z-index: 1;
      }
      
      /* Product comparison section with VS */
      .product-comparison {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 30px;
        background: #f8f9fa;
        position: relative;
      }
      
      /* VS icon in the middle */
      .vs-container {
        position: relative;
        z-index: 10;
      }
      
      .vs-circle {
        width: 60px;
        height: 60px;
        background: linear-gradient(135deg, #ff416c, #ff4b2b);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-weight: 700;
        font-size: 20px;
        box-shadow: 0 5px 15px rgba(255, 75, 43, 0.3);
        position: relative;
      }
      
      .vs-circle::before {
        content: "";
        position: absolute;
        top: -5px;
        left: -5px;
        right: -5px;
        bottom: -5px;
        background: rgba(255, 75, 43, 0.2);
        border-radius: 50%;
        z-index: -1;
        animation: pulse 2s infinite;
      }
      
      @keyframes pulse {
        0% { transform: scale(1); opacity: 0.8; }
        70% { transform: scale(1.1); opacity: 0; }
        100% { transform: scale(1); opacity: 0; }
      }
      
      /* Product cards */
        .product-card {
        width: 45%;
        background: white;
        border-radius: 15px;
        overflow: hidden;
        box-shadow: 0 5px 15px rgba(0, 0, 0, 0.08);
        transition: all 0.4s ease;
        transform: perspective(1000px) rotateX(0deg);
        position: relative;
      }
      
      .product-card:hover {
        transform: perspective(1000px) rotateX(5deg) translateY(-10px);
        box-shadow: 0 20px 30px rgba(0, 0, 0, 0.12);
      }
      
      .product-card.left {
        transform: perspective(1000px) rotateY(5deg);
      }
      
      .product-card.right {
        transform: perspective(1000px) rotateY(-5deg);
      }
      
      .product-card.left:hover {
        transform: perspective(1000px) rotateY(0deg) translateY(-10px);
      }
      
      .product-card.right:hover {
        transform: perspective(1000px) rotateY(0deg) translateY(-10px);
      }
      
      /* Badge for product positioning */
      .badge {
        position: absolute;
        top: 15px;
        right: 15px;
        color: white;
        padding: 5px 10px;
        border-radius: 30px;
        font-size: 12px;
        font-weight: 600;
        box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
        z-index: 5;
      }
      
      .badge.premium {
        background: linear-gradient(135deg, #4EB3FF, #0062E6);
      }
      
      .badge.value {
        background: linear-gradient(135deg, #41B883, #28A16C);
      }
      
      /* Product image container */
      .product-image-container {
        position: relative;
        padding-top: 15px;
        background: #f8f9fa;
        height: 220px;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      
      .product-image {
        height: 200px;
        width: 200px;
        display: flex;
        align-items: center;
        justify-content: center;
        }
        
      .product-image img {
        max-height: 100%;
        max-width: 100%;
        object-fit: contain;
        filter: drop-shadow(0 5px 15px rgba(0, 0, 0, 0.08));
        transition: transform 0.5s ease;
      }
      
      .product-card:hover .product-image img {
        transform: scale(1.05);
      }
      
      /* Product details area */
      .product-details {
        padding: 20px;
        text-align: center;
      }
      
      .product-details h3 {
        margin: 0 0 10px;
        font-size: 16px;
        font-weight: 600;
        color: #333;
        line-height: 1.4;
        height: 44px;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
      }
      
      .product-brand {
        font-size: 13px;
        color: #666;
        margin-top: 10px;
        }
        
      /* Price styling */
      .product-price {
        display: flex;
        align-items: center;
        justify-content: center;
        flex-wrap: wrap;
        gap: 8px;
        margin-top: 5px;
        }
        
      .original-price {
        text-decoration: line-through;
        color: #999;
        font-size: 14px;
      }
      
      .discount-price {
        color: #E53935;
        font-weight: 600;
        font-size: 18px;
      }
      
      .regular-price {
        color: #0062E6;
        font-weight: 600;
        font-size: 18px;
      }
      
      .discount-percent {
        background: #FFE0E0;
        color: #E53935;
        padding: 2px 6px;
        border-radius: 4px;
        font-size: 12px;
        font-weight: 600;
      }
      
      /* Content area */
      .comparison-content {
        padding: 40px;
      }
      
      /* Features table */
      .features-table-container {
        margin: 30px 0;
      }
      
      .features-table-container h2 {
        color: #0062E6;
        font-size: 22px;
        font-weight: 600;
        margin: 0 0 20px;
        padding-bottom: 12px;
        position: relative;
      }
      
      .features-table-container h2::after {
        content: "";
        position: absolute;
        left: 0;
        bottom: 0;
        width: 50px;
        height: 3px;
        background: #0062E6;
        border-radius: 3px;
      }
      
      .features-table {
        width: 100%;
        border-collapse: separate;
        border-spacing: 0;
        border-radius: 10px;
        overflow: hidden;
        box-shadow: 0 0 20px rgba(0, 0, 0, 0.05);
      }
      
      .features-table th,
      .features-table td {
        padding: 15px;
        text-align: left;
        border-bottom: 1px solid #eee;
      }
      
      .features-table th {
        background: #f8f9fa;
        font-weight: 600;
        color: #333;
      }
      
      .features-table th:first-child {
        width: 30%;
      }
      
      .features-table th:nth-child(2),
      .features-table th:nth-child(3) {
        width: 35%;
      }
      
      .features-table tr:last-child td {
        border-bottom: none;
      }
      
      .features-table tr:nth-child(even) {
        background-color: #fafbfc;
      }
      
      .features-table tr:hover td {
        background-color: #f1f7ff;
      }
      
      /* Typography enhancements */
      .comparison-content h2 {
        color: #0062E6;
        font-size: 22px;
        font-weight: 600;
        margin: 35px 0 20px;
        padding-bottom: 12px;
        position: relative;
      }
      
      .comparison-content h2:first-child {
        margin-top: 0;
      }
      
      .comparison-content h2::after {
        content: "";
        position: absolute;
        left: 0;
        bottom: 0;
        width: 50px;
        height: 3px;
        background: #0062E6;
        border-radius: 3px;
      }
      
      /* Enhanced lists */
      .comparison-content ul {
        list-style: none;
        padding: 0;
        margin: 20px 0 30px;
      }
      
      .comparison-content li {
        padding: 12px 0 12px 35px;
        margin: 0;
        position: relative;
        border-bottom: 1px solid #f0f0f0;
      }
      
      .comparison-content li:last-child {
        border-bottom: none;
      }
      
      .comparison-content li::before {
        content: "✓";
        position: absolute;
        left: 0;
        top: 12px;
        width: 24px;
        height: 24px;
        background: rgba(0, 98, 230, 0.1);
        color: #0062E6;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 13px;
      }
      
      /* Paragraphs */
      .comparison-content p {
        line-height: 1.8;
        color: #444;
        margin: 20px 0;
      }
      
      /* Conclusion section */
      .conclusion-section {
        background: #F1F7FF;
        border-left: 4px solid #0062E6;
        padding: 25px;
        margin: 40px 0 20px;
        border-radius: 0 8px 8px 0;
        position: relative;
      }
      
      .conclusion-section h2 {
        color: #0062E6;
        margin-top: 0;
        padding-bottom: 10px;
        }
        
      /* Responsive design */
      @media (max-width: 768px) {
        .comparison-header {
          padding: 20px;
      }
      
        .comparison-header h1 {
          font-size: 20px;
        }
        
        .product-comparison {
          flex-direction: column;
          gap: 40px;
          padding: 20px;
        }
        
        .product-card {
          width: 100%;
        }
        
        .vs-container {
          margin: 10px 0;
        }
        
        .comparison-content {
          padding: 25px;
        }
        
        .features-table th,
        .features-table td {
          padding: 10px;
        }
      }
      
      @media (max-width: 480px) {
        .comparison-content {
          padding: 20px;
        }
        
        .comparison-content h2,
        .features-table-container h2 {
          font-size: 18px;
        }
        
        .features-table {
          font-size: 14px;
        }
        
        .features-table th,
        .features-table td {
          padding: 8px;
        }
        
        .vs-circle {
          width: 50px;
          height: 50px;
          font-size: 18px;
        }
        
        .comparison-content li {
          padding-left: 30px;
        }
        
        .comparison-content li::before {
          width: 20px;
          height: 20px;
          font-size: 12px;
          top: 14px;
        }
        }
      </style>
    
      <div class="comparison-container">
      ${productComparison}
      
      ${createFeatureComparison()}
      
      <div class="comparison-content">
        ${processedContent}
      </div>
    </div>
    
    <script>
      document.addEventListener('DOMContentLoaded', function() {
        // Add animation for product cards
        const productCards = document.querySelectorAll('.product-card');
        productCards.forEach((card, index) => {
          card.style.opacity = '0';
          card.style.transform = index === 0 ? 
            'perspective(1000px) rotateY(5deg) translateY(20px)' : 
            'perspective(1000px) rotateY(-5deg) translateY(20px)';
          
          setTimeout(() => {
            card.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
            card.style.opacity = '1';
            card.style.transform = index === 0 ? 
              'perspective(1000px) rotateY(5deg) translateY(0)' : 
              'perspective(1000px) rotateY(-5deg) translateY(0)';
          }, 100 * index);
        });
      });
    </script>
  `;
}

/**
 * Compare multiple products and return a summary
 * @param {Array} productIds - Array of product IDs to compare
 * @returns {String} - Brief HTML comparison summary
 */
async function quickCompareProducts(productIds) {
  try {
    if (!Array.isArray(productIds)) {
      productIds = [productIds]; // Convert to array if single ID is provided
    }

    if (productIds.length < 2) {
      throw new Error("Cần ít nhất 2 sản phẩm để so sánh nhanh");
    }

    // Limit to 5 products for quick comparison
    const limitedIds = productIds.slice(0, 5);
    
    // Fetch all products in parallel
    const productPromises = limitedIds.map(id => modelProduct.findById(id));
    const products = await Promise.all(productPromises);
    
    // Check if all products were found
    if (products.some(p => !p)) {
      throw new Error("Không tìm thấy một hoặc nhiều sản phẩm");
    }

    // Extract common attributes for comparison
    const commonAttributes = findCommonAttributes(products);
    
    // Create comparison table
    const comparisonTable = createComparisonTable(products, commonAttributes);
    
    return comparisonTable;
  } catch (error) {
    console.error("Lỗi khi so sánh nhanh sản phẩm:", error);
    throw error;
  }
}

/**
 * Find common attributes across all products
 * @param {Array} products - Array of product documents
 * @returns {Array} - Array of common attribute keys
 */
function findCommonAttributes(products) {
  // Start with all attributes from the first product
  const allAttributes = new Set();
  products.forEach(product => {
    if (product.attributes) {
      Object.keys(product.attributes).forEach(attr => allAttributes.add(attr));
    }
  });
  
  // Important attributes to prioritize
  const priorityAttributes = [
    'screen', 'ram', 'storage', 'camera', 'battery', 'processor', 
    'cpu', 'gpu', 'resolution', 'weight', 'os'
  ];
  
  // Filter and sort attributes
  return Array.from(allAttributes)
    .sort((a, b) => {
      const aIndex = priorityAttributes.indexOf(a.toLowerCase());
      const bIndex = priorityAttributes.indexOf(b.toLowerCase());
      
      // If both are priority attributes, sort by priority
      if (aIndex !== -1 && bIndex !== -1) {
        return aIndex - bIndex;
      }
      
      // If only one is a priority attribute, it comes first
      if (aIndex !== -1) return -1;
      if (bIndex !== -1) return 1;
      
      // Otherwise sort alphabetically
      return a.localeCompare(b);
    })
    .slice(0, 8); // Limit to 8 attributes for quick comparison
}

/**
 * Create an HTML comparison table
 * @param {Array} products - Array of product documents 
 * @param {Array} attributes - Array of attribute keys to compare
 * @returns {String} - HTML formatted comparison table
 */
function createComparisonTable(products, attributes) {
  // Create table headers
  const headers = ['Thông số', ...products.map(p => p.name)];
  
  // Create table rows for each attribute
  const rows = attributes.map(attr => {
    const values = products.map(p => {
      const value = p.attributes?.[attr] || '-';
      return value;
    });
    
    return [attr, ...values];
  });
  
  // Add price row
  const priceRow = [
    'Giá', 
    ...products.map(p => {
      const currentPrice = p.priceDiscount > 0 ? p.priceDiscount : p.price;
      return `${currentPrice.toLocaleString('vi-VN')} VND`;
    })
  ];
  
  // Add all rows
  const allRows = [priceRow, ...rows];
  
  // Generate HTML table
  const tableHTML = `
    <style>
      .quick-comparison {
        width: 100%;
        border-collapse: collapse;
        font-family: Arial, sans-serif;
      }
      .quick-comparison th, .quick-comparison td {
        padding: 12px;
        border: 1px solid #e0e0e0;
        text-align: left;
      }
      .quick-comparison th {
        background-color: #f5f5f5;
        font-weight: bold;
      }
      .quick-comparison tr:nth-child(even) {
        background-color: #f9f9f9;
      }
      .quick-comparison tr:hover {
        background-color: #f1f1f1;
      }
      .quick-comparison th:first-child, .quick-comparison td:first-child {
        font-weight: bold;
        width: 120px;
      }
    </style>
    <table class="quick-comparison">
      <thead>
        <tr>
          ${headers.map(h => `<th>${h}</th>`).join('')}
        </tr>
      </thead>
      <tbody>
        ${allRows.map(row => `
          <tr>
            ${row.map(cell => `<td>${cell}</td>`).join('')}
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;
  
  return tableHTML;
}

module.exports = { 
  compareProducts,
  quickCompareProducts
};

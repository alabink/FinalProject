const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_KEY,
  api_secret: process.env.CLOUDINARY_SECRET
});

// Sử dụng cú pháp params mới của CloudinaryStorage để tránh lỗi "unknown parameter" ở các phiên bản gần đây
const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    return {
      folder: 'phone_shop',
      resource_type: 'auto',
      allowed_formats: ['jpg', 'png', 'jpeg', 'webp']
    };
  }
});

const uploadCloud = multer({ storage });

module.exports = uploadCloud; 
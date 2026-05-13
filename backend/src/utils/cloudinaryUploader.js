const cloudinary = require('../config/cloudinary');
const streamifier = require('streamifier');
const AppError = require('./appError');

const uploadBufferToCloudinary = (buffer, folder = 'produk') => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder },
      (error, result) => {
        if (error) {
          reject(new AppError('Gagal mengunggah gambar ke Cloudinary.', 500));
        } else {
          resolve(result);
        }
      }
    );

    streamifier.createReadStream(buffer).pipe(uploadStream);
  });
};

module.exports = { uploadBufferToCloudinary };

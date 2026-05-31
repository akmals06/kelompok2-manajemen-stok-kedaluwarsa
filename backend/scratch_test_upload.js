const cloudinary = require('./src/config/cloudinary');

// 1x1 transparent GIF base64
const base64Image = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';

async function main() {
  console.log('Sending test upload to Cloudinary...');
  try {
    const result = await cloudinary.uploader.upload(base64Image, {
      folder: 'manajemen-stok-kedaluwarsa/test'
    });
    console.log('Upload SUCCESS!');
    console.log('Secure URL:', result.secure_url);
    console.log('Public ID:', result.public_id);

    console.log('Cleaning up (deleting test image)...');
    await cloudinary.uploader.destroy(result.public_id);
    console.log('Cleanup SUCCESS!');
  } catch (error) {
    console.error('Upload FAILED:', error);
  }
}

main();

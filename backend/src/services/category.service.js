const kategoriRepo = require('../repositories/category.repository');
const cloudinary = require('../config/cloudinary');

const uploadBufferToCloudinary = (buffer) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: 'manajemen-stok-kedaluwarsa/kategori' },
      (error, result) => {
        if (error) return reject(error);
        resolve({ secure_url: result.secure_url, public_id: result.public_id });
      }
    );
    stream.end(buffer);
  });
};

const hapusGambarCloudinary = async (publicId) => {
  if (!publicId) return;
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (_) {
    // silent — cleanup failure should not break the flow
  }
};

const buatKategori = async (data, fileBuffer) => {
  const adaKategori = await kategoriRepo.cariKategoriByNama(data.nama_kategori);

  if (adaKategori) {
    const error = new Error('Nama kategori sudah digunakan');
    error.statusCode = 409;
    throw error;
  }

  let gambar_kategori = null;
  let cloudinary_public_id = null;

  if (fileBuffer) {
    try {
      const hasil = await uploadBufferToCloudinary(fileBuffer);
      gambar_kategori = hasil.secure_url;
      cloudinary_public_id = hasil.public_id;
    } catch (_) {
      const error = new Error('Gagal mengunggah gambar kategori');
      error.statusCode = 500;
      throw error;
    }
  }

  return kategoriRepo.buatKategori({
    nama_kategori: data.nama_kategori,
    deskripsi: data.deskripsi || null,
    gambar_kategori,
    cloudinary_public_id,
  });
};

const ambilSemuaKategori = async () => {
  return kategoriRepo.ambilSemuaKategori();
};

const ambilKategoriById = async (idKategori) => {
  const idNum = parseInt(idKategori, 10);
  const kategori = await kategoriRepo.ambilKategoriById(idNum);

  if (!kategori) {
    const error = new Error('Kategori tidak ditemukan');
    error.statusCode = 404;
    throw error;
  }

  return kategori;
};

const updateKategori = async (idKategori, data, fileBuffer) => {
  const idNum = parseInt(idKategori, 10);
  const kategori = await kategoriRepo.ambilKategoriById(idNum);

  if (!kategori) {
    const error = new Error('Kategori tidak ditemukan');
    error.statusCode = 404;
    throw error;
  }

  if (data.nama_kategori && data.nama_kategori !== kategori.nama_kategori) {
    const adaKategoriLain = await kategoriRepo.cariKategoriByNama(data.nama_kategori);
    if (adaKategoriLain) {
      const error = new Error('Nama kategori sudah digunakan');
      error.statusCode = 409;
      throw error;
    }
  }

  let gambar_kategori = kategori.gambar_kategori;
  let cloudinary_public_id = kategori.cloudinary_public_id;
  const publicIdLama = kategori.cloudinary_public_id;

  if (fileBuffer) {
    try {
      const hasil = await uploadBufferToCloudinary(fileBuffer);
      gambar_kategori = hasil.secure_url;
      cloudinary_public_id = hasil.public_id;
    } catch (uploadErr) {
      const error = new Error('Gagal mengunggah gambar kategori');
      error.statusCode = 500;
      throw error;
    }
    await hapusGambarCloudinary(publicIdLama);
  } else if (data.hapus_gambar === 'true' || data.hapus_gambar === true) {
    gambar_kategori = null;
    cloudinary_public_id = null;
    await hapusGambarCloudinary(publicIdLama);
  }

  const updateData = {
    nama_kategori: data.nama_kategori !== undefined ? data.nama_kategori : kategori.nama_kategori,
    deskripsi: data.deskripsi !== undefined ? data.deskripsi : kategori.deskripsi,
    gambar_kategori,
    cloudinary_public_id,
  };

  if (data.status_aktif !== undefined) {
    if (typeof data.status_aktif === 'string') {
      updateData.status_aktif = data.status_aktif === 'true';
    } else {
      updateData.status_aktif = Boolean(data.status_aktif);
    }
  }

  return kategoriRepo.updateKategori(idNum, updateData);
};

const hapusKategori = async (idKategori) => {
  const idNum = parseInt(idKategori, 10);
  const kategori = await kategoriRepo.ambilKategoriById(idNum);

  if (!kategori) {
    const error = new Error('Kategori tidak ditemukan');
    error.statusCode = 404;
    throw error;
  }

  // Tidak bisa hapus kategori yang masih memiliki produk
  const jumlahProduk = await kategoriRepo.hitungProdukByKategori(idNum);
  if (jumlahProduk > 0) {
    const error = new Error('Kategori tidak dapat dihapus karena sedang digunakan oleh produk');
    error.statusCode = 409;
    throw error;
  }

  try {
    const hasil = await kategoriRepo.hapusKategori(idNum);
    await hapusGambarCloudinary(kategori.cloudinary_public_id);
    return hasil;
  } catch (err) {
    if (err.code === 'P2003') {
      const error = new Error('Kategori tidak dapat dihapus karena sedang digunakan oleh produk');
      error.statusCode = 409;
      throw error;
    }
    throw err;
  }
};

module.exports = {
  buatKategori,
  ambilSemuaKategori,
  ambilKategoriById,
  updateKategori,
  hapusKategori,
};

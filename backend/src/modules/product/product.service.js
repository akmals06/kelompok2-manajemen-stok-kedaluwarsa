const produkRepository = require('./product.repository');
const cloudinary = require('../../config/cloudinary');

const uploadBufferToCloudinary = (buffer) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: 'manajemen-stok-kedaluwarsa/produk' },
      (error, result) => {
        if (error) return reject(error);
        resolve(result.secure_url);
      }
    );
    stream.end(buffer);
  });
};

const ambilSemuaProduk = async () => {
  return produkRepository.ambilSemuaProduk();
};

const ambilProdukById = async (idProduk) => {
  const produk = await produkRepository.ambilProdukById(idProduk);
  if (!produk) {
    const error = new Error('Produk tidak ditemukan');
    error.statusCode = 404;
    throw error;
  }
  return produk;
};

const buatProduk = async (dataProduk, fileBuffer) => {
  const kategoriAda = await produkRepository.cekKategoriAda(dataProduk.id_kategori);
  if (!kategoriAda) {
    const error = new Error('Kategori tidak valid atau tidak ditemukan');
    error.statusCode = 400;
    throw error;
  }

  const produkAda = await produkRepository.cariProdukByNama(dataProduk.nama_produk);
  if (produkAda) {
    const error = new Error('Nama produk sudah digunakan');
    error.statusCode = 409;
    throw error;
  }

  let gambar_produk = null;
  if (fileBuffer) {
    try {
      gambar_produk = await uploadBufferToCloudinary(fileBuffer);
    } catch (uploadError) {
      const error = new Error('Gagal mengunggah gambar produk');
      error.statusCode = 500;
      throw error;
    }
  }

  const payload = {
    nama_produk: dataProduk.nama_produk,
    satuan: dataProduk.satuan,
    id_kategori: parseInt(dataProduk.id_kategori, 10),
    stok_minimum: parseInt(dataProduk.stok_minimum, 10),
    gambar_produk,
  };

  return produkRepository.buatProduk(payload);
};

const updateProduk = async (idProduk, dataProduk, fileBuffer) => {
  const produkLama = await ambilProdukById(idProduk);

  if (dataProduk.id_kategori) {
    const kategoriAda = await produkRepository.cekKategoriAda(dataProduk.id_kategori);
    if (!kategoriAda) {
      const error = new Error('Kategori tidak valid atau tidak ditemukan');
      error.statusCode = 400;
      throw error;
    }
  }

  if (dataProduk.nama_produk && dataProduk.nama_produk !== produkLama.nama_produk) {
    const produkAda = await produkRepository.cariProdukByNama(dataProduk.nama_produk);
    if (produkAda) {
      const error = new Error('Nama produk sudah digunakan oleh produk lain');
      error.statusCode = 409;
      throw error;
    }
  }

  let gambar_produk = produkLama.gambar_produk;
  if (fileBuffer) {
    try {
      gambar_produk = await uploadBufferToCloudinary(fileBuffer);
    } catch (uploadError) {
      const error = new Error('Gagal mengunggah gambar produk');
      error.statusCode = 500;
      throw error;
    }
  }

  const payload = {
    nama_produk: dataProduk.nama_produk !== undefined ? dataProduk.nama_produk : produkLama.nama_produk,
    satuan: dataProduk.satuan !== undefined ? dataProduk.satuan : produkLama.satuan,
    id_kategori: dataProduk.id_kategori ? parseInt(dataProduk.id_kategori, 10) : produkLama.id_kategori,
    stok_minimum: dataProduk.stok_minimum !== undefined && dataProduk.stok_minimum !== null ? parseInt(dataProduk.stok_minimum, 10) : produkLama.stok_minimum,
    gambar_produk,
  };

  return produkRepository.updateProduk(idProduk, payload);
};

const nonaktifkanProduk = async (idProduk) => {
  await ambilProdukById(idProduk);
  return produkRepository.ubahStatusProduk(idProduk, false);
};

const aktifkanProduk = async (idProduk) => {
  await ambilProdukById(idProduk);
  return produkRepository.ubahStatusProduk(idProduk, true);
};

module.exports = {
  ambilSemuaProduk,
  ambilProdukById,
  buatProduk,
  updateProduk,
  nonaktifkanProduk,
  aktifkanProduk,
};

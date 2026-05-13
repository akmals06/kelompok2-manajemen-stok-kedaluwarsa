const kategoriRepo = require('../repositories/kategori.repository');

const buatKategori = async (data) => {
  const adaKategori = await kategoriRepo.cariKategoriByNama(data.nama_kategori);
  
  if (adaKategori) {
    const error = new Error('Nama kategori sudah digunakan');
    error.statusCode = 409;
    throw error;
  }

  return kategoriRepo.buatKategori({
    nama_kategori: data.nama_kategori,
    deskripsi: data.deskripsi || null,
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

const updateKategori = async (idKategori, data) => {
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

  return kategoriRepo.updateKategori(idNum, {
    nama_kategori: data.nama_kategori !== undefined ? data.nama_kategori : kategori.nama_kategori,
    deskripsi: data.deskripsi !== undefined ? data.deskripsi : kategori.deskripsi,
  });
};

const hapusKategori = async (idKategori) => {
  const idNum = parseInt(idKategori, 10);
  const kategori = await kategoriRepo.ambilKategoriById(idNum);
  
  if (!kategori) {
    const error = new Error('Kategori tidak ditemukan');
    error.statusCode = 404;
    throw error;
  }

  try {
    return await kategoriRepo.hapusKategori(idNum);
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

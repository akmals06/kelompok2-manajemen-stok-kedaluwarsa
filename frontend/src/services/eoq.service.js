import api from './api';

const eoqService = {
  hitung: async (data) => {
    const res = await api.post('/eoq', data);
    return res.data;
  },

  ambilRiwayat: async (idProduk) => {
    const params = idProduk ? { id_produk: idProduk } : {};
    const res = await api.get('/eoq', { params });
    return res.data;
  },
};

export default eoqService;

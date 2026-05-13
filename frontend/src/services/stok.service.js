import api from './api';

const stokService = {
  masuk: async (data) => {
    const res = await api.post('/stok/masuk', data);
    return res.data;
  },

  keluar: async (data) => {
    const res = await api.post('/stok/keluar', data);
    return res.data;
  },

  ambilTransaksiMasuk: async () => {
    const res = await api.get('/stok/masuk');
    return res.data;
  },

  ambilTransaksiKeluar: async () => {
    const res = await api.get('/stok/keluar');
    return res.data;
  },
};

export default stokService;

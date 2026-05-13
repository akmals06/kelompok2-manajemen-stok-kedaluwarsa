import api from './api';

const laporanService = {
  ringkasanStok: async () => {
    const res = await api.get('/laporan/ringkasan-stok');
    return res.data;
  },

  ambilSemua: async () => {
    const res = await api.get('/laporan');
    return res.data;
  },

  buatLaporan: async (data) => {
    const res = await api.post('/laporan', data);
    return res.data;
  },
};

export default laporanService;

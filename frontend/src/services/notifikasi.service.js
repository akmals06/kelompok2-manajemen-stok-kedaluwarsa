import api from './api';

const notifikasiService = {
  ambilSemua: async () => {
    const res = await api.get('/notifikasi');
    return res.data;
  },

  hitungBelumDibaca: async () => {
    const res = await api.get('/notifikasi/count');
    return res.data;
  },

  tandaiDibaca: async (id) => {
    const res = await api.patch(`/notifikasi/${id}/baca`);
    return res.data;
  },

  tandaiSemuaDibaca: async () => {
    const res = await api.patch('/notifikasi/baca-semua');
    return res.data;
  },
};

export default notifikasiService;

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

  // MOCKUP FRONTEND ONLY: Fungsi hapus untuk simulasi UI
  // Backend belum menyediakan endpoint ini
  hapus: async (id) => {
    // Simulasi delay jaringan
    await new Promise((resolve) => setTimeout(resolve, 300));
    return { success: true, message: 'Notifikasi berhasil dihapus (Mock)' };
  },

  hapusSemua: async () => {
    // Simulasi delay jaringan
    await new Promise((resolve) => setTimeout(resolve, 500));
    return { success: true, message: 'Semua notifikasi berhasil dihapus (Mock)' };
  },
};

export default notifikasiService;

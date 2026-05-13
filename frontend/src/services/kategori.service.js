import api from './api';

const kategoriService = {
  ambilSemua: async () => {
    const res = await api.get('/kategori');
    return res.data;
  },

  tambah: async (data) => {
    const res = await api.post('/kategori', data);
    return res.data;
  },

  ubah: async (id, data) => {
    const res = await api.put(`/kategori/${id}`, data);
    return res.data;
  },

  hapus: async (id) => {
    const res = await api.delete(`/kategori/${id}`);
    return res.data;
  },
};

export default kategoriService;

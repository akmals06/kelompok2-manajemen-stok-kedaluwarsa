import api from './api';

const produkService = {
  ambilSemua: async () => {
    const res = await api.get('/produk');
    return res.data;
  },

  ambilById: async (id) => {
    const res = await api.get(`/produk/${id}`);
    return res.data;
  },

  tambah: async (formData) => {
    const res = await api.post('/produk', formData);
    return res.data;
  },

  ubah: async (id, formData) => {
    const res = await api.put(`/produk/${id}`, formData);
    return res.data;
  },

  ubahStatus: async (id, statusAktif) => {
    const endpoint = statusAktif ? 'aktif' : 'nonaktif';
    const res = await api.patch(`/produk/${id}/${endpoint}`);
    return res.data;
  },
};

export default produkService;

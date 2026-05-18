import api from './api';

const penggunaService = {
  ambilProfil: async () => {
    const res = await api.get('/pengguna/profil');
    return res.data;
  },

  perbaruiProfil: async (data) => {
    const res = await api.put('/pengguna/profil', data);
    return res.data;
  },

  gantiPassword: async (data) => {
    const res = await api.put('/pengguna/ganti-password', data);
    return res.data;
  },

  gantiEmail: async (data) => {
    const res = await api.put('/pengguna/ganti-email', data);
    return res.data;
  },

  uploadFoto: async (file) => {
    const formData = new FormData();
    formData.append('foto', file);
    const res = await api.post('/pengguna/upload-foto', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },
};

export default penggunaService;
import api from './api';

const batchService = {
  ambilSemua: async () => {
    const res = await api.get('/batch');
    return res.data;
  },

  ambilById: async (id) => {
    const res = await api.get(`/batch/${id}`);
    return res.data;
  },

  arsipkan: async (id) => {
    const res = await api.patch(`/batch/${id}/arsip`);
    return res.data;
  },
};

export default batchService;

import api from './api';

const riwayatService = {
  ambilSemua: async () => {
    const res = await api.get('/riwayat');
    return res.data;
  },
};

export default riwayatService;

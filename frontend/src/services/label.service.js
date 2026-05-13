import api from './api';

const labelService = {
  labelProduk: async (data) => {
    const res = await api.post('/label/produk', data, { responseType: 'blob' });
    return res.data;
  },

  labelBatch: async (data) => {
    const res = await api.post('/label/batch', data, { responseType: 'blob' });
    return res.data;
  },
};

export default labelService;

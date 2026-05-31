import api from './api';

const importService = {
  preview: async (formData) => {
    const res = await api.post('/import/preview', formData);
    return res.data;
  },

  eksekusi: async (data) => {
    const res = await api.post('/import/eksekusi', data);
    return res.data;
  },
};

export default importService;

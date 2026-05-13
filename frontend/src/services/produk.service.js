import { api } from './api';

export const produkService = {
  getAll: async () => {
    return await api.get('/produk');
  },

  getById: async (id) => {
    return await api.get(`/produk/${id}`);
  },

  create: async (data) => {
    // If it's a FormData object, we don't stringify it and we let the browser set the Content-Type
    if (data instanceof FormData) {
      // Create a specific config for FormData
      const token = localStorage.getItem('token');
      const headers = {
        'Authorization': `Bearer ${token}`
        // Do NOT set Content-Type, browser will set it to multipart/form-data with boundary
      };
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/produk`, {
        method: 'POST',
        headers,
        body: data,
      });
      
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message || result.error || `HTTP Error ${response.status}`);
      }
      return result;
    }
    
    return await api.post('/produk', data);
  },

  update: async (id, data) => {
    return await api.put(`/produk/${id}`, data);
  },

  delete: async (id) => {
    return await api.delete(`/produk/${id}`);
  }
};

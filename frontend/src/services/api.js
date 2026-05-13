const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
console.log("API Base URL:", BASE_URL);

/**
 * Centalized fetcher for consistent communication with backend
 */
async function request(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;
  
  const defaultHeaders = {
    'Content-Type': 'application/json',
  };

  // Add token if exists in localStorage
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) {
      defaultHeaders['Authorization'] = `Bearer ${token}`;
    }
  }

  const config = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  };

  try {
    const response = await fetch(url, config);
    
    let result;
    try {
      result = await response.json();
    } catch (parseError) {
      if (!response.ok) {
        throw new Error(`HTTP Error ${response.status}: ${response.statusText}`);
      }
      throw new Error('Invalid JSON response dari server');
    }

    if (!response.ok) {
      throw new Error(result.message || result.error || `HTTP Error ${response.status}`);
    }

    return result;
  } catch (error) {
    // Tangani error network (koneksi terputus, server mati, dll)
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      console.error(`Network Error [${endpoint}]:`, error.message);
      throw new Error('Gagal terhubung ke server. Pastikan backend berjalan dan koneksi internet stabil.');
    }
    
    console.error(`API Error [${endpoint}]:`, error.message);
    throw error;
  }
}

export const api = {
  get: (endpoint, options) => request(endpoint, { ...options, method: 'GET' }),
  post: (endpoint, data, options) => request(endpoint, { ...options, method: 'POST', body: JSON.stringify(data) }),
  put: (endpoint, data, options) => request(endpoint, { ...options, method: 'PUT', body: JSON.stringify(data) }),
  delete: (endpoint, options) => request(endpoint, { ...options, method: 'DELETE' }),
};

import axios from 'axios';

const isProduction = process.env.NODE_ENV === 'production';
let BASE_URL = process.env.NEXT_PUBLIC_API_URL;

if (!BASE_URL) {
  if (isProduction) {
    if (typeof window !== 'undefined') {
      console.error('CRITICAL ERROR: NEXT_PUBLIC_API_URL is not configured for production!');
    }
    BASE_URL = '/api';
  } else {
    BASE_URL = 'http://localhost:5000/api';
  }
}

// Auto-append /api if the user configured the root domain instead of the API path
if (BASE_URL !== '/api' && !BASE_URL.endsWith('/api') && !BASE_URL.endsWith('/api/')) {
  BASE_URL = BASE_URL.endsWith('/') ? `${BASE_URL}api` : `${BASE_URL}/api`;
}

const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  timeout: 10000, // 10 seconds timeout to prevent hanging forever
});

let accessToken = null;
let isRefreshing = false;
let antrianGagal = [];

const prosesAntrian = (token) => {
  antrianGagal.forEach((cb) => cb(token));
  antrianGagal = [];
};

const tolakAntrian = (error) => {
  antrianGagal.forEach((cb) => cb(null, error));
  antrianGagal = [];
};

export const setAccessToken = (token) => {
  accessToken = token;
};

export const getAccessToken = () => accessToken;

export const clearAccessToken = () => {
  accessToken = null;
};

api.interceptors.request.use(
  (config) => {
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Refresh endpoint sendiri gagal → langsung reject, jangan infinite loop
    if (originalRequest.url?.includes('/auth/refresh')) {
      clearAccessToken();
      return Promise.reject(error);
    }

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          antrianGagal.push((token, err) => {
            if (err) return reject(err);
            originalRequest.headers.Authorization = `Bearer ${token}`;
            resolve(api(originalRequest));
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const res = await axios.post(`${BASE_URL}/auth/refresh`, {}, {
          withCredentials: true,
        });

        const tokenBaru = res.data.data.accessToken;
        setAccessToken(tokenBaru);
        prosesAntrian(tokenBaru);

        originalRequest.headers.Authorization = `Bearer ${tokenBaru}`;
        return api(originalRequest);
      } catch (refreshError) {
        tolakAntrian(refreshError);
        clearAccessToken();
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;

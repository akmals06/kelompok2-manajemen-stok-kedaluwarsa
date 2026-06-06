import axios from 'axios';

// Base URL — deteksi lokal vs production
const isLocalhost =
  typeof window !== 'undefined' &&
  (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

function resolveBaseUrl() {
  const envUrl = process.env.NEXT_PUBLIC_API_URL;

  // Jika di localhost, selalu gunakan proxy Next.js (next.config.mjs rewrites)
  if (isLocalhost) return '/api';

  // Jika env variable tersedia, gunakan itu
  if (envUrl) {
    let url = envUrl;
    if (url !== '/api' && !url.endsWith('/api') && !url.endsWith('/api/')) {
      url = url.endsWith('/') ? `${url}api` : `${url}/api`;
    }
    return url;
  }

  // Fallback production
  return 'https://uas-softdev-production.up.railway.app/api';
}

const BASE_URL = resolveBaseUrl();


const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  timeout: 10000,
});

// Token state
let accessToken = null;

export const setAccessToken = (token) => { accessToken = token; };
export const getAccessToken = () => accessToken;
export const clearAccessToken = () => { accessToken = null; };

// Silent refresh queue
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

// Interceptors

// Request: sisipkan Bearer token
api.interceptors.request.use(
  (config) => {
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Response: auto-refresh token jika 401
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Refresh endpoint gagal → langsung reject, hindari infinite loop
    if (originalRequest.url?.includes('/auth/refresh')) {
      clearAccessToken();
      return Promise.reject(error);
    }

    // Jika 401 dan belum retry, coba refresh token
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
        const res = await axios.post(`${BASE_URL}/auth/refresh`, {}, { withCredentials: true });
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
  },
);

export default api;
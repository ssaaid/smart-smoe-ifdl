import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1',
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});

// Request interceptor — attach JWT from localStorage
api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('smoe_access_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor — unwrap backend envelope + handle 401
api.interceptors.response.use(
  (response) => {
    // The backend TransformInterceptor wraps every response as
    // { success: true, data: <actual payload>, timestamp: '...' }
    // Unwrap it so callers always get the actual payload in response.data
    const d = response.data;
    if (d && typeof d === 'object' && 'success' in d && 'data' in d) {
      response.data = d.data;
    }
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('smoe_access_token');
        localStorage.removeItem('smoe_refresh_token');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export { api };
export default api;

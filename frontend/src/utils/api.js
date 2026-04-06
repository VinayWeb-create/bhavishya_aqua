import axios from 'axios';

let base = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
if (base.endsWith('/')) base = base.slice(0, -1);
if (!base.endsWith('/api')) base += '/api';

const api = axios.create({
  baseURL: base,
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle 401 — auto logout
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export default api;

import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token + ?lng= to every request
api.interceptors.request.use(
  (config) => {
    // Auth token
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Dynamic translation — append ?lng=<code> so the backend translates
    // all database content at render time without touching the DB.
    const lang = localStorage.getItem('language') || 'en';
    if (lang && lang !== 'en') {
      config.params = { ...config.params, lng: lang };
    }

    return config;
  },
  (error) => Promise.reject(error)
);

export default api;

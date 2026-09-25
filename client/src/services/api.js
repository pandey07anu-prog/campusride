import axios from 'axios';
import { Capacitor } from '@capacitor/core';

const isLocal = !Capacitor.isNativePlatform() && (
  window.location.hostname === 'localhost' ||
  window.location.hostname === '127.0.0.1' ||
  window.location.hostname.startsWith('192.168.') ||
  window.location.hostname.startsWith('10.') ||
  window.location.hostname.startsWith('172.') ||
  window.location.hostname.endsWith('.local')
);

const API_BASE_URL = isLocal
  ? `http://${window.location.hostname}:5000/api`
  : (import.meta.env.VITE_API_BASE_URL || 'https://campusride-backend-03ea.onrender.com/api');

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('campusride_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor for response handling
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message = error.response?.data?.message || 'Something went wrong. Please check connection.';
    return Promise.reject(new Error(message));
  }
);

export default api;

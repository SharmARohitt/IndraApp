import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

// Get API URL from expo constants (loaded from .env)
// Try multiple URLs for better connectivity
const POSSIBLE_URLS = [
  Constants.expoConfig?.extra?.apiUrl,
  'http://192.168.1.15:3000/api',
  'http://localhost:3000/api',
  'http://127.0.0.1:3000/api',
  'http://10.0.2.2:3000/api', // Android emulator
];

const API_BASE_URL = POSSIBLE_URLS.find(url => url) || 'http://192.168.1.15:3000/api';

console.log('API Base URL:', API_BASE_URL);
console.log('Platform:', Platform.OS);
console.log('All possible URLs:', POSSIBLE_URLS);

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request logging
api.interceptors.request.use(
  (config) => {
    console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`);
    console.log('Base URL:', config.baseURL);
    return config;
  },
  (error) => {
    console.error('❌ Request Error:', error);
    return Promise.reject(error);
  }
);

// Add response logging
api.interceptors.response.use(
  (response) => {
    console.log(`✅ API Response: ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    console.error('❌ API Error:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    } else if (error.request) {
      console.error('No response received:', error.request);
    }
    return Promise.reject(error);
  }
);

// Request interceptor to add auth token
api.interceptors.request.use(
  async (config) => {
    try {
      let token = null;
      if (Platform.OS === 'web') {
        token = localStorage.getItem('accessToken');
      } else {
        const SecureStore = require('expo-secure-store');
        token = await SecureStore.getItemAsync('accessToken');
      }
      
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Failed to get token:', error);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        let refreshToken = null;
        if (Platform.OS === 'web') {
          refreshToken = localStorage.getItem('refreshToken');
        } else {
          const SecureStore = require('expo-secure-store');
          refreshToken = await SecureStore.getItemAsync('refreshToken');
        }
        
        if (!refreshToken) {
          throw new Error('No refresh token');
        }

        const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
          refreshToken,
        });

        const { accessToken } = response.data;
        
        if (Platform.OS === 'web') {
          localStorage.setItem('accessToken', accessToken);
        } else {
          const SecureStore = require('expo-secure-store');
          await SecureStore.setItemAsync('accessToken', accessToken);
        }

        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh failed, logout user
        if (Platform.OS === 'web') {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
        } else {
          const SecureStore = require('expo-secure-store');
          await SecureStore.deleteItemAsync('accessToken');
          await SecureStore.deleteItemAsync('refreshToken');
        }
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;

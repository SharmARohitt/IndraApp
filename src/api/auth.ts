import api from './index';
import { Platform } from 'react-native';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
  accessToken: string;
  refreshToken: string;
}

// Test connection to backend
export const testConnection = async (): Promise<boolean> => {
  try {
    console.log('Testing connection to backend...');
    const response = await api.get('/worker/tasks');
    console.log('✅ Backend connection successful');
    return true;
  } catch (error) {
    console.error('❌ Backend connection failed:', error);
    return false;
  }
};

export const login = async (credentials: LoginCredentials): Promise<AuthResponse> => {
  console.log('Attempting login with:', credentials.email);
  
  // Test connection first
  const isConnected = await testConnection();
  if (!isConnected) {
    throw new Error('Cannot connect to server. Please check your network connection.');
  }
  
  const response = await api.post<AuthResponse>('/auth/login', credentials);
  
  console.log('Login response:', response.data);
  
  // Store tokens securely
  try {
    if (Platform.OS === 'web') {
      localStorage.setItem('accessToken', response.data.accessToken);
      localStorage.setItem('refreshToken', response.data.refreshToken);
    } else {
      const SecureStore = require('expo-secure-store');
      await SecureStore.setItemAsync('accessToken', response.data.accessToken);
      await SecureStore.setItemAsync('refreshToken', response.data.refreshToken);
    }
    console.log('Tokens stored successfully');
  } catch (error) {
    console.error('Failed to store tokens:', error);
  }
  
  return response.data;
};

export const logout = async (): Promise<void> => {
  try {
    await api.post('/auth/logout');
  } catch (error) {
    console.error('Logout API call failed:', error);
  } finally {
    // Clear local tokens regardless of API call result
    if (Platform.OS === 'web') {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
    } else {
      const SecureStore = require('expo-secure-store');
      await SecureStore.deleteItemAsync('accessToken');
      await SecureStore.deleteItemAsync('refreshToken');
    }
  }
};

export const refreshAccessToken = async (): Promise<string> => {
  let refreshToken = null;
  if (Platform.OS === 'web') {
    refreshToken = localStorage.getItem('refreshToken');
  } else {
    const SecureStore = require('expo-secure-store');
    refreshToken = await SecureStore.getItemAsync('refreshToken');
  }
  
  if (!refreshToken) {
    throw new Error('No refresh token available');
  }

  const response = await api.post<{ accessToken: string }>('/auth/refresh', {
    refreshToken,
  });

  if (Platform.OS === 'web') {
    localStorage.setItem('accessToken', response.data.accessToken);
  } else {
    const SecureStore = require('expo-secure-store');
    await SecureStore.setItemAsync('accessToken', response.data.accessToken);
  }
  
  return response.data.accessToken;
};

export const registerPushToken = async (pushToken: string): Promise<void> => {
  await api.post('/worker/register-device', { pushToken });
};

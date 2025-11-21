import api from './index';
import * as SecureStore from 'expo-secure-store';

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

export const login = async (credentials: LoginCredentials): Promise<AuthResponse> => {
  const response = await api.post<AuthResponse>('/auth/login', credentials);
  
  // Store tokens securely
  await SecureStore.setItemAsync('accessToken', response.data.accessToken);
  await SecureStore.setItemAsync('refreshToken', response.data.refreshToken);
  
  return response.data;
};

export const logout = async (): Promise<void> => {
  try {
    await api.post('/auth/logout');
  } catch (error) {
    console.error('Logout API call failed:', error);
  } finally {
    // Clear local tokens regardless of API call result
    await SecureStore.deleteItemAsync('accessToken');
    await SecureStore.deleteItemAsync('refreshToken');
  }
};

export const refreshAccessToken = async (): Promise<string> => {
  const refreshToken = await SecureStore.getItemAsync('refreshToken');
  if (!refreshToken) {
    throw new Error('No refresh token available');
  }

  const response = await api.post<{ accessToken: string }>('/auth/refresh', {
    refreshToken,
  });

  await SecureStore.setItemAsync('accessToken', response.data.accessToken);
  return response.data.accessToken;
};

export const registerPushToken = async (pushToken: string): Promise<void> => {
  await api.post('/worker/register-device', { pushToken });
};

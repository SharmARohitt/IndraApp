import { useState, useEffect } from 'react';
import { Platform } from 'react-native';
import { useStore } from '../store/useStore';
import { login as apiLogin, logout as apiLogout } from '../api/auth';

// Conditional imports for native modules
let SecureStore: any;
let initDatabase: any;

if (Platform.OS !== 'web') {
  try {
    SecureStore = require('expo-secure-store');
    initDatabase = require('../libs/db').initDatabase;
  } catch (e) {
    console.warn('Native modules not available');
  }
}

export const useAuth = () => {
  const [isLoading, setIsLoading] = useState(true);
  const { user, setUser, setAccessToken, logout: storeLogout } = useStore();

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      // Initialize database (only on native)
      if (Platform.OS !== 'web' && initDatabase) {
        await initDatabase();
      }

      // Check for stored token
      let token = null;
      if (Platform.OS === 'web') {
        token = localStorage.getItem('accessToken');
      } else if (SecureStore) {
        token = await SecureStore.getItemAsync('accessToken');
      }

      if (token) {
        setAccessToken(token);
      }
    } catch (error) {
      console.error('Failed to check auth status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const response = await apiLogin({ email, password });
      setUser(response.user);
      setAccessToken(response.accessToken);
      return { success: true };
    } catch (error: any) {
      console.error('Login failed:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Login failed',
      };
    }
  };

  const logout = async () => {
    try {
      await apiLogout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      storeLogout();
    }
  };

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    logout,
  };
};

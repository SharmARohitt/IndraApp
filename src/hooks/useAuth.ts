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
      
      // Store token
      if (Platform.OS === 'web') {
        localStorage.setItem('accessToken', response.accessToken);
      } else if (SecureStore) {
        await SecureStore.setItemAsync('accessToken', response.accessToken);
      }
      
      setUser(response.user);
      setAccessToken(response.accessToken);
      return { success: true };
    } catch (error: any) {
      console.error('Login failed:', error);
      
      // If network error and using demo credentials, allow mock login
      if (error.message?.includes('Network Error') || error.message?.includes('Cannot connect')) {
        if (email === 'worker@indra.com' && password === 'password123') {
          console.log('🔄 Using mock login for demo');
          
          const mockUser = {
            id: 'mock-worker-1',
            name: 'Demo Field Worker',
            email: 'worker@indra.com',
            role: 'worker' as const,
          };
          
          const mockToken = 'mock-token-' + Date.now();
          
          // Store mock token
          if (Platform.OS === 'web') {
            localStorage.setItem('accessToken', mockToken);
          } else if (SecureStore) {
            await SecureStore.setItemAsync('accessToken', mockToken);
          }
          
          setUser(mockUser);
          setAccessToken(mockToken);
          return { success: true };
        }
      }
      
      return {
        success: false,
        error: error.message || 'Login failed',
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

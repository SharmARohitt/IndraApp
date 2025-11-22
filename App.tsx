import 'react-native-gesture-handler';
import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import AppNavigator from './src/navigation/AppNavigator';
import { useStore } from './src/store/useStore';
import NotificationService from './src/services/NotificationService';
import ErrorBoundary from './src/components/ErrorBoundary';
import { DebugButton } from './src/components/debug/DebugButton';
import { useLogger } from './src/hooks/useLogger';
import { performanceMonitor } from './src/libs/performance';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (renamed from cacheTime in v5)
    },
    mutations: {
      retry: 1,
    },
  },
});

export default function App() {
  const { log } = useLogger();

  useEffect(() => {
    // Initialize services
    const initializeApp = async () => {
      try {
        // Start performance monitoring
        performanceMonitor.setEnabled(__DEV__);
        performanceMonitor.trackMetric('app_start', Date.now());

        // Initialize notification service
        await NotificationService.initialize();
        
        log('info', 'App initialized successfully');
      } catch (error) {
        log('error', 'Failed to initialize app', error);
      }
    };

    initializeApp();
  }, []);

  return (
    <ErrorBoundary>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SafeAreaProvider>
          <QueryClientProvider client={queryClient}>
            <AppNavigator />
            <StatusBar style="auto" />
            <DebugButton />
          </QueryClientProvider>
        </SafeAreaProvider>
      </GestureHandlerRootView>
    </ErrorBoundary>
  );
}

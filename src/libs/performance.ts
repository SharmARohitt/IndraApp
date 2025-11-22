import { Platform } from 'react-native';

interface PerformanceMetric {
  name: string;
  value: number;
  timestamp: number;
  metadata?: Record<string, any>;
}

interface ScreenLoadMetric {
  screenName: string;
  loadTime: number;
  timestamp: number;
}

interface APICallMetric {
  endpoint: string;
  method: string;
  duration: number;
  status: number;
  timestamp: number;
}

class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: PerformanceMetric[] = [];
  private screenLoadTimes: ScreenLoadMetric[] = [];
  private apiCallMetrics: APICallMetric[] = [];
  private screenStartTimes: Map<string, number> = new Map();
  private isEnabled: boolean = true;

  private constructor() {}

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
  }

  // Screen performance tracking
  startScreenLoad(screenName: string): void {
    if (!this.isEnabled) return;
    this.screenStartTimes.set(screenName, Date.now());
  }

  endScreenLoad(screenName: string): void {
    if (!this.isEnabled) return;
    
    const startTime = this.screenStartTimes.get(screenName);
    if (startTime) {
      const loadTime = Date.now() - startTime;
      this.screenLoadTimes.push({
        screenName,
        loadTime,
        timestamp: Date.now(),
      });
      this.screenStartTimes.delete(screenName);
      
      console.log(`📱 Screen Load: ${screenName} - ${loadTime}ms`);
    }
  }

  // API call tracking
  trackAPICall(endpoint: string, method: string, duration: number, status: number): void {
    if (!this.isEnabled) return;
    
    this.apiCallMetrics.push({
      endpoint,
      method,
      duration,
      status,
      timestamp: Date.now(),
    });
    
    console.log(`🌐 API Call: ${method} ${endpoint} - ${duration}ms (${status})`);
  }

  // Generic metric tracking
  trackMetric(name: string, value: number, metadata?: Record<string, any>): void {
    if (!this.isEnabled) return;
    
    this.metrics.push({
      name,
      value,
      timestamp: Date.now(),
      metadata,
    });
    
    console.log(`📊 Metric: ${name} - ${value}`, metadata);
  }

  // Memory usage tracking
  trackMemoryUsage(): void {
    if (!this.isEnabled || Platform.OS === 'web') return;
    
    // Note: React Native doesn't have built-in memory tracking
    // This would require a native module in production
    this.trackMetric('memory_usage', 0, { platform: Platform.OS });
  }

  // Bundle size tracking
  trackBundleSize(size: number): void {
    if (!this.isEnabled) return;
    this.trackMetric('bundle_size', size, { platform: Platform.OS });
  }

  // Animation performance
  trackAnimationFrame(frameName: string, duration: number): void {
    if (!this.isEnabled) return;
    this.trackMetric('animation_frame', duration, { frame: frameName });
  }

  // User interaction tracking
  trackUserInteraction(action: string, duration?: number): void {
    if (!this.isEnabled) return;
    this.trackMetric('user_interaction', duration || 0, { action });
  }

  // Get performance summary
  getPerformanceSummary(): {
    screenLoads: ScreenLoadMetric[];
    apiCalls: APICallMetric[];
    metrics: PerformanceMetric[];
    averageScreenLoad: number;
    averageAPICall: number;
    slowestScreen: ScreenLoadMetric | null;
    slowestAPI: APICallMetric | null;
  } {
    const averageScreenLoad = this.screenLoadTimes.length > 0
      ? this.screenLoadTimes.reduce((sum, metric) => sum + metric.loadTime, 0) / this.screenLoadTimes.length
      : 0;

    const averageAPICall = this.apiCallMetrics.length > 0
      ? this.apiCallMetrics.reduce((sum, metric) => sum + metric.duration, 0) / this.apiCallMetrics.length
      : 0;

    const slowestScreen = this.screenLoadTimes.length > 0
      ? this.screenLoadTimes.reduce((slowest, current) => 
          current.loadTime > slowest.loadTime ? current : slowest
        )
      : null;

    const slowestAPI = this.apiCallMetrics.length > 0
      ? this.apiCallMetrics.reduce((slowest, current) => 
          current.duration > slowest.duration ? current : slowest
        )
      : null;

    return {
      screenLoads: this.screenLoadTimes,
      apiCalls: this.apiCallMetrics,
      metrics: this.metrics,
      averageScreenLoad,
      averageAPICall,
      slowestScreen,
      slowestAPI,
    };
  }

  // Clear metrics
  clearMetrics(): void {
    this.metrics = [];
    this.screenLoadTimes = [];
    this.apiCallMetrics = [];
    this.screenStartTimes.clear();
  }

  // Export metrics for analytics
  exportMetrics(): string {
    return JSON.stringify({
      timestamp: Date.now(),
      platform: Platform.OS,
      summary: this.getPerformanceSummary(),
    }, null, 2);
  }
}

export const performanceMonitor = PerformanceMonitor.getInstance();

import React from 'react';

// React hook for screen performance tracking
export const useScreenPerformance = (screenName: string) => {
  React.useEffect(() => {
    performanceMonitor.startScreenLoad(screenName);
    
    return () => {
      performanceMonitor.endScreenLoad(screenName);
    };
  }, [screenName]);
};

// HOC for automatic screen performance tracking
export const withPerformanceTracking = <P extends object>(
  WrappedComponent: React.ComponentType<P>,
  screenName: string
): React.ComponentType<P> => {
  const PerformanceWrappedComponent = (props: P) => {
    useScreenPerformance(screenName);
    return React.createElement(WrappedComponent, props);
  };
  
  return PerformanceWrappedComponent;
};

// API call performance wrapper
export const trackAPIPerformance = async <T>(
  apiCall: () => Promise<T>,
  endpoint: string,
  method: string = 'GET'
): Promise<T> => {
  const startTime = Date.now();
  let status = 200;
  
  try {
    const result = await apiCall();
    return result;
  } catch (error: any) {
    status = error.response?.status || 500;
    throw error;
  } finally {
    const duration = Date.now() - startTime;
    performanceMonitor.trackAPICall(endpoint, method, duration, status);
  }
};

export default performanceMonitor;
import { useCallback } from 'react';
import api from '../api';

type LogLevel = 'info' | 'warn' | 'error' | 'debug';

interface LogEntry {
  level: LogLevel;
  message: string;
  data?: any;
  timestamp: string;
}

export const useLogger = () => {
  const log = useCallback(async (level: LogLevel, message: string, data?: any) => {
    const entry: LogEntry = {
      level,
      message,
      data,
      timestamp: new Date().toISOString(),
    };

    // Log to console
    console[level === 'error' ? 'error' : level === 'warn' ? 'warn' : 'log'](
      `[${level.toUpperCase()}] ${message}`,
      data || ''
    );

    // Send to remote logging endpoint (optional)
    if (level === 'error' || level === 'warn') {
      try {
        await api.post('/logs', entry);
      } catch (error) {
        // Silently fail - don't want logging to break the app
        console.error('Failed to send log to server:', error);
      }
    }
  }, []);

  return { log };
};

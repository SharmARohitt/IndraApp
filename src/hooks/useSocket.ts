import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import * as SecureStore from 'expo-secure-store';
import Constants from 'expo-constants';
import { useStore } from '../store/useStore';

const WEBSOCKET_URL = Constants.expoConfig?.extra?.wsUrl || 'ws://192.168.1.15:3000';

console.log('WebSocket URL:', WEBSOCKET_URL);

export const useSocket = () => {
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const { user, setTasks, updateTask } = useStore();

  useEffect(() => {
    if (!user) return;

    connectSocket();

    return () => {
      disconnectSocket();
    };
  }, [user]);

  const connectSocket = async () => {
    try {
      const token = await SecureStore.getItemAsync('accessToken');
      if (!token) return;

      socketRef.current = io(WEBSOCKET_URL, {
        auth: { token },
        transports: ['websocket'],
      });

      socketRef.current.on('connect', () => {
        console.log('WebSocket connected');
        setIsConnected(true);
      });

      socketRef.current.on('disconnect', () => {
        console.log('WebSocket disconnected');
        setIsConnected(false);
      });

      // Listen for new task assignments
      socketRef.current.on('task:assigned', (task) => {
        console.log('New task assigned:', task);
        useStore.getState().setTasks([...useStore.getState().tasks, task]);
      });

      // Listen for task updates
      socketRef.current.on('task:updated', (update) => {
        console.log('Task updated:', update);
        updateTask(update.taskId, update.changes);
      });

      // Listen for task deletions
      socketRef.current.on('task:deleted', (taskId) => {
        console.log('Task deleted:', taskId);
        const tasks = useStore.getState().tasks.filter((t) => t.id !== taskId);
        setTasks(tasks);
      });
    } catch (error) {
      console.error('Failed to connect socket:', error);
    }
  };

  const disconnectSocket = () => {
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
      setIsConnected(false);
    }
  };

  const emit = (event: string, data: any) => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit(event, data);
    } else {
      console.warn('Socket not connected, cannot emit event:', event);
    }
  };

  return {
    isConnected,
    emit,
  };
};

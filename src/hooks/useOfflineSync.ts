import { useEffect } from 'react';
import { useStore } from '../store/useStore';
import SyncService from '../services/SyncService';
import { loadQueuedReports } from '../libs/db';

export const useOfflineSync = () => {
  const { isOnline, queuedReports, setTasks } = useStore();

  useEffect(() => {
    // Load queued reports from DB on mount
    loadQueuedReportsFromDB();

    // Start periodic sync
    SyncService.startPeriodicSync(60000); // Every minute

    return () => {
      SyncService.stopPeriodicSync();
    };
  }, []);

  useEffect(() => {
    if (isOnline && queuedReports.length > 0) {
      SyncService.syncQueuedReports();
    }
  }, [isOnline]);

  const loadQueuedReportsFromDB = async () => {
    try {
      // Initialize database first
      const { initDatabase } = require('../libs/db');
      await initDatabase();
      
      const reports = await loadQueuedReports();
      // Update store with queued reports
      reports.forEach((report) => {
        useStore.getState().addQueuedReport(report);
      });
    } catch (error) {
      console.error('Failed to load queued reports:', error);
    }
  };

  const forceSyncReport = async (reportId: string): Promise<boolean> => {
    return await SyncService.forceSyncReport(reportId);
  };

  const manualSync = async () => {
    await SyncService.syncQueuedReports();
  };

  return {
    isOnline,
    queuedReports,
    unsyncedCount: queuedReports.filter((r) => !r.synced).length,
    forceSyncReport,
    manualSync,
  };
};

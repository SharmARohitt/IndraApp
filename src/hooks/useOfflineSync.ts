import { useEffect, useState } from 'react';
import { useStore } from '../store/useStore';
import SyncService from '../services/SyncService';
import { loadQueuedReports, initDatabase, isDatabaseReady } from '../libs/db';

export const useOfflineSync = () => {
  const { isOnline, queuedReports } = useStore();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    initializeSync();
  }, []);

  useEffect(() => {
    if (isOnline && isDatabaseReady()) {
      SyncService.syncQueuedReports();
    }
  }, [isOnline]);

  const initializeSync = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Initialize database first
      await initDatabase();
      
      // Load queued reports from database
      await loadQueuedReportsFromDB();

      // Start periodic sync
      SyncService.startPeriodicSync(60000); // Every minute

      console.log('Offline sync initialized successfully');
    } catch (error) {
      console.error('Failed to initialize offline sync:', error);
      setError(error instanceof Error ? error.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }

    // Cleanup function
    return () => {
      SyncService.stopPeriodicSync();
    };
  };

  const loadQueuedReportsFromDB = async () => {
    try {
      if (!isDatabaseReady()) {
        console.log('Database not ready, skipping report load');
        return;
      }

      const reports = await loadQueuedReports();
      console.log(`Loaded ${reports.length} queued reports from database`);
      
      // Clear existing reports and add loaded ones
      const store = useStore.getState();
      
      // Reset queued reports
      store.queuedReports.length = 0;
      
      // Add loaded reports
      reports.forEach((report) => {
        store.addQueuedReport(report);
      });
    } catch (error) {
      console.error('Failed to load queued reports:', error);
      throw error;
    }
  };

  const forceSyncReport = async (reportId: string): Promise<boolean> => {
    try {
      const success = await SyncService.forceSyncReport(reportId);
      if (success) {
        // Reload reports to get updated status
        await loadQueuedReportsFromDB();
      }
      return success;
    } catch (error) {
      console.error('Force sync failed:', error);
      return false;
    }
  };

  const manualSync = async (): Promise<void> => {
    try {
      await SyncService.syncQueuedReports();
      // Reload reports to get updated status
      await loadQueuedReportsFromDB();
    } catch (error) {
      console.error('Manual sync failed:', error);
      throw error;
    }
  };

  const refreshReports = async (): Promise<void> => {
    try {
      await loadQueuedReportsFromDB();
    } catch (error) {
      console.error('Failed to refresh reports:', error);
      throw error;
    }
  };

  return {
    isOnline,
    queuedReports,
    unsyncedCount: queuedReports.filter((r) => !r.synced).length,
    isLoading,
    error,
    forceSyncReport,
    manualSync,
    refreshReports,
  };
};

import NetInfo from '@react-native-community/netinfo';
import { 
  loadUnsyncedReports, 
  markReportSynced as markReportSyncedDB,
  incrementSyncAttempts,
  isDatabaseReady 
} from '../libs/db';
import { submitTaskReport } from '../api/tasks';
import { useStore } from '../store/useStore';

class SyncService {
  private static instance: SyncService;
  private isSyncing = false;
  private syncInterval: NodeJS.Timeout | null = null;

  private constructor() {
    this.setupNetworkListener();
  }

  static getInstance(): SyncService {
    if (!SyncService.instance) {
      SyncService.instance = new SyncService();
    }
    return SyncService.instance;
  }

  private setupNetworkListener() {
    NetInfo.addEventListener((state) => {
      const isOnline = state.isConnected && state.isInternetReachable;
      useStore.getState().setIsOnline(isOnline ?? false);

      if (isOnline) {
        console.log('Network connected, starting sync...');
        this.syncQueuedReports();
      }
    });
  }

  startPeriodicSync(intervalMs: number = 60000) {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
    }

    this.syncInterval = setInterval(() => {
      const { isOnline } = useStore.getState();
      if (isOnline) {
        this.syncQueuedReports();
      }
    }, intervalMs);
  }

  stopPeriodicSync() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
  }

  async syncQueuedReports(): Promise<void> {
    if (this.isSyncing) {
      console.log('Sync already in progress, skipping...');
      return;
    }

    const { isOnline } = useStore.getState();
    if (!isOnline) {
      console.log('Device is offline, skipping sync');
      return;
    }

    // Check if database is ready
    if (!isDatabaseReady()) {
      console.log('Database not ready yet, skipping sync');
      return;
    }

    this.isSyncing = true;

    try {
      const unsyncedReports = await loadUnsyncedReports();
      console.log(`Syncing ${unsyncedReports.length} queued reports...`);

      if (unsyncedReports.length === 0) {
        console.log('No reports to sync');
        return;
      }

      let successCount = 0;
      let failureCount = 0;

      for (const report of unsyncedReports) {
        // Skip reports that have failed too many times
        if (report.syncAttempts >= 3) {
          console.log(`Skipping report ${report.id} - too many failed attempts`);
          continue;
        }

        try {
          await submitTaskReport({
            taskId: report.taskId,
            notes: report.notes,
            severity: report.severity,
            checklistData: report.checklistData,
            photos: report.photos,
            videos: report.videos,
          });

          // Mark as synced in DB
          await markReportSyncedDB(report.id);
          
          // Update store
          useStore.getState().markReportSynced(report.id);

          successCount++;
          console.log(`✅ Successfully synced report ${report.id}`);
        } catch (error) {
          failureCount++;
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          console.error(`❌ Failed to sync report ${report.id}:`, errorMessage);
          
          // Increment sync attempts
          await incrementSyncAttempts(report.id, errorMessage);
        }
      }

      console.log(`Sync completed: ${successCount} success, ${failureCount} failures`);
    } catch (error) {
      console.error('Sync failed:', error);
    } finally {
      this.isSyncing = false;
    }
  }

  async forceSyncReport(reportId: string): Promise<boolean> {
    try {
      if (!isDatabaseReady()) {
        console.error('Database not ready for force sync');
        return false;
      }

      const unsyncedReports = await loadUnsyncedReports();
      const report = unsyncedReports.find((r) => r.id === reportId);

      if (!report) {
        console.error(`Report ${reportId} not found in queue`);
        return false;
      }

      console.log(`Force syncing report ${reportId}...`);

      await submitTaskReport({
        taskId: report.taskId,
        notes: report.notes,
        severity: report.severity,
        checklistData: report.checklistData,
        photos: report.photos,
        videos: report.videos,
      });

      await markReportSyncedDB(report.id);
      useStore.getState().markReportSynced(report.id);

      console.log(`✅ Successfully force-synced report ${reportId}`);
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error(`❌ Failed to force-sync report ${reportId}:`, errorMessage);
      
      // Increment sync attempts even for force sync
      await incrementSyncAttempts(reportId, errorMessage);
      return false;
    }
  }

  async getQueueStatus(): Promise<{ total: number; pending: number; synced: number; failed: number }> {
    try {
      if (!isDatabaseReady()) {
        return { total: 0, pending: 0, synced: 0, failed: 0 };
      }

      const { getQueueStats } = require('../libs/db');
      return await getQueueStats();
    } catch (error) {
      console.error('Failed to get queue status:', error);
      return { total: 0, pending: 0, synced: 0, failed: 0 };
    }
  }
}

export default SyncService.getInstance();

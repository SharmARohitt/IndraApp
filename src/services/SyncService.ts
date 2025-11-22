import NetInfo from '@react-native-community/netinfo';
import { loadQueuedReports, markReportSynced as markReportSyncedDB } from '../libs/db';
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

    this.isSyncing = true;

    try {
      const queuedReports = await loadQueuedReports();
      console.log(`Syncing ${queuedReports.length} queued reports...`);

      for (const report of queuedReports) {
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

          console.log(`Successfully synced report ${report.id}`);
        } catch (error) {
          console.error(`Failed to sync report ${report.id}:`, error);
          // Continue with next report
        }
      }

      console.log('Sync completed');
    } catch (error) {
      // Silently fail if database not ready
      if (error instanceof Error && error.message.includes('Database not initialized')) {
        console.log('Database not ready yet, skipping sync');
      } else {
        console.error('Sync failed:', error);
      }
    } finally {
      this.isSyncing = false;
    }
  }

  async forceSyncReport(reportId: string): Promise<boolean> {
    try {
      const queuedReports = await loadQueuedReports();
      const report = queuedReports.find((r) => r.id === reportId);

      if (!report) {
        console.error(`Report ${reportId} not found in queue`);
        return false;
      }

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

      console.log(`Successfully force-synced report ${reportId}`);
      return true;
    } catch (error) {
      console.error(`Failed to force-sync report ${reportId}:`, error);
      return false;
    }
  }
}

export default SyncService.getInstance();

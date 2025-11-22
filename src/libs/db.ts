import * as SQLite from 'expo-sqlite';
import { Platform } from 'react-native';

const DB_NAME = 'indra.db';
const DB_VERSION = 2; // Increment when schema changes

let db: SQLite.SQLiteDatabase | null = null;
let isInitializing = false;
let initPromise: Promise<SQLite.SQLiteDatabase> | null = null;

export const initDatabase = async (): Promise<SQLite.SQLiteDatabase> => {
  // If already initialized, return existing database
  if (db) {
    return db;
  }

  // If initialization is in progress, wait for it
  if (isInitializing && initPromise) {
    return initPromise;
  }

  isInitializing = true;

  initPromise = (async () => {
    try {
      console.log('Initializing database...');
      
      // Open database with proper error handling
      db = await SQLite.openDatabaseAsync(DB_NAME, {
        enableChangeListener: true,
      });

      // Test database connection
      await db.execAsync('SELECT 1');

      // Check current database version
      const currentVersion = await getDatabaseVersion(db);
      console.log(`Current database version: ${currentVersion}, Target version: ${DB_VERSION}`);

      if (currentVersion < DB_VERSION) {
        await migrateDatabaseSchema(db, currentVersion, DB_VERSION);
      } else {
        // Create tables if they don't exist (fresh install)
        await createTables(db);
      }

      // Set the current version
      await setDatabaseVersion(db, DB_VERSION);

      console.log('Database initialized successfully');
      return db;
    } catch (error) {
      console.error('Failed to initialize database:', error);
      db = null;
      throw error;
    } finally {
      isInitializing = false;
    }
  })();

  return initPromise;
};

const getDatabaseVersion = async (database: SQLite.SQLiteDatabase): Promise<number> => {
  try {
    const result = await database.getAllAsync('PRAGMA user_version');
    return (result[0] as any)?.user_version || 0;
  } catch (error) {
    console.log('Could not get database version, assuming version 0');
    return 0;
  }
};

const setDatabaseVersion = async (database: SQLite.SQLiteDatabase, version: number): Promise<void> => {
  await database.execAsync(`PRAGMA user_version = ${version}`);
};

const createTables = async (database: SQLite.SQLiteDatabase): Promise<void> => {
  // Set PRAGMA settings first (outside of any transaction)
  await database.execAsync('PRAGMA journal_mode = WAL');
  await database.execAsync('PRAGMA foreign_keys = ON');
  await database.execAsync('PRAGMA synchronous = NORMAL');
  
  // Then create tables
  await createTablesWithoutPragma(database);
};

const migrateDatabaseSchema = async (
  database: SQLite.SQLiteDatabase, 
  fromVersion: number, 
  toVersion: number
): Promise<void> => {
  console.log(`Migrating database from version ${fromVersion} to ${toVersion}`);

  try {
    if (fromVersion < 1) {
      // Migration from version 0 to 1: Create initial tables
      await createTablesWithoutPragma(database);
      console.log('✅ Migration to version 1 completed');
    }

    if (fromVersion < 2) {
      // Migration from version 1 to 2: Add new columns
      console.log('🔄 Migrating to version 2: Adding new columns...');
      
      // Add new columns to tasks table
      try {
        await database.execAsync('ALTER TABLE tasks ADD COLUMN createdAt TEXT DEFAULT CURRENT_TIMESTAMP');
      } catch (error) {
        console.log('Column createdAt already exists or error:', error);
      }
      
      try {
        await database.execAsync('ALTER TABLE tasks ADD COLUMN updatedAt TEXT DEFAULT CURRENT_TIMESTAMP');
      } catch (error) {
        console.log('Column updatedAt already exists or error:', error);
      }

      // Add new columns to queued_reports table
      try {
        await database.execAsync('ALTER TABLE queued_reports ADD COLUMN syncAttempts INTEGER DEFAULT 0');
      } catch (error) {
        console.log('Column syncAttempts already exists or error:', error);
      }
      
      try {
        await database.execAsync('ALTER TABLE queued_reports ADD COLUMN lastSyncAttempt TEXT');
      } catch (error) {
        console.log('Column lastSyncAttempt already exists or error:', error);
      }
      
      try {
        await database.execAsync('ALTER TABLE queued_reports ADD COLUMN errorMessage TEXT');
      } catch (error) {
        console.log('Column errorMessage already exists or error:', error);
      }

      console.log('✅ Migration to version 2 completed');
    }

    console.log(`✅ Database migration completed successfully`);
  } catch (error) {
    console.error('❌ Database migration failed:', error);
    throw error;
  }
};

const createTablesWithoutPragma = async (database: SQLite.SQLiteDatabase): Promise<void> => {
  await database.execAsync(`
    CREATE TABLE IF NOT EXISTS tasks (
      id TEXT PRIMARY KEY,
      substationId TEXT NOT NULL,
      substationName TEXT NOT NULL,
      lat REAL,
      lng REAL,
      status TEXT NOT NULL DEFAULT 'assigned',
      priority TEXT NOT NULL DEFAULT 'medium',
      assignedAt TEXT NOT NULL,
      description TEXT,
      checklist TEXT DEFAULT '[]',
      syncedAt TEXT,
      createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
      updatedAt TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS queued_reports (
      id TEXT PRIMARY KEY,
      taskId TEXT NOT NULL,
      notes TEXT DEFAULT '',
      severity TEXT NOT NULL DEFAULT 'normal',
      photos TEXT DEFAULT '[]',
      videos TEXT DEFAULT '[]',
      checklistData TEXT DEFAULT '[]',
      createdAt TEXT NOT NULL,
      synced INTEGER DEFAULT 0,
      syncAttempts INTEGER DEFAULT 0,
      lastSyncAttempt TEXT,
      errorMessage TEXT
    );

    CREATE TABLE IF NOT EXISTS media_queue (
      id TEXT PRIMARY KEY,
      reportId TEXT NOT NULL,
      filePath TEXT NOT NULL,
      fileType TEXT NOT NULL,
      uploaded INTEGER DEFAULT 0,
      createdAt TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
    CREATE INDEX IF NOT EXISTS idx_tasks_priority ON tasks(priority);
    CREATE INDEX IF NOT EXISTS idx_queued_reports_synced ON queued_reports(synced);
    CREATE INDEX IF NOT EXISTS idx_queued_reports_taskId ON queued_reports(taskId);
  `);
};

export const getDatabase = async (): Promise<SQLite.SQLiteDatabase> => {
  if (!db) {
    console.log('Database not initialized, initializing now...');
    return await initDatabase();
  }
  return db;
};

export const isDatabaseReady = (): boolean => {
  return db !== null && !isInitializing;
};

// Task operations
export const saveTasks = async (tasks: any[]): Promise<void> => {
  try {
    const database = await getDatabase();
    
    // Use transaction for better performance and consistency
    await database.withTransactionAsync(async () => {
      for (const task of tasks) {
        await database.runAsync(
          `INSERT OR REPLACE INTO tasks (id, substationId, substationName, lat, lng, status, priority, assignedAt, description, checklist, syncedAt, updatedAt)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            task.id,
            task.substationId,
            task.substationName,
            task.lat || 0,
            task.lng || 0,
            task.status || 'assigned',
            task.priority || 'medium',
            task.assignedAt,
            task.description || '',
            JSON.stringify(task.checklist || []),
            new Date().toISOString(),
            new Date().toISOString(),
          ]
        );
      }
    });
    
    console.log(`Saved ${tasks.length} tasks to database`);
  } catch (error) {
    console.error('Failed to save tasks:', error);
    throw error;
  }
};

export const loadTasks = async (): Promise<any[]> => {
  try {
    const database = await getDatabase();
    const result = await database.getAllAsync('SELECT * FROM tasks ORDER BY assignedAt DESC');
    
    return result.map((row: any) => ({
      ...row,
      checklist: JSON.parse(row.checklist || '[]'),
      lat: Number(row.lat) || 0,
      lng: Number(row.lng) || 0,
    }));
  } catch (error) {
    console.error('Failed to load tasks:', error);
    return [];
  }
};

// Report queue operations
export const saveQueuedReport = async (report: any): Promise<void> => {
  try {
    const database = await getDatabase();
    
    await database.runAsync(
      `INSERT OR REPLACE INTO queued_reports (id, taskId, notes, severity, photos, videos, checklistData, createdAt, synced, syncAttempts)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        report.id,
        report.taskId,
        report.notes || '',
        report.severity || 'normal',
        JSON.stringify(report.photos || []),
        JSON.stringify(report.videos || []),
        JSON.stringify(report.checklistData || []),
        report.createdAt,
        report.synced ? 1 : 0,
        0, // syncAttempts
      ]
    );
    
    console.log(`Saved queued report ${report.id}`);
  } catch (error) {
    console.error('Failed to save queued report:', error);
    throw error;
  }
};

export const loadQueuedReports = async (): Promise<any[]> => {
  try {
    const database = await getDatabase();
    const result = await database.getAllAsync(
      'SELECT * FROM queued_reports ORDER BY createdAt DESC'
    );
    
    return result.map((row: any) => ({
      ...row,
      photos: JSON.parse(row.photos || '[]'),
      videos: JSON.parse(row.videos || '[]'),
      checklistData: JSON.parse(row.checklistData || '[]'),
      synced: row.synced === 1,
      syncAttempts: row.syncAttempts || 0,
    }));
  } catch (error) {
    console.error('Failed to load queued reports:', error);
    return [];
  }
};

export const loadUnsyncedReports = async (): Promise<any[]> => {
  try {
    const database = await getDatabase();
    const result = await database.getAllAsync(
      'SELECT * FROM queued_reports WHERE synced = 0 ORDER BY createdAt ASC'
    );
    
    return result.map((row: any) => ({
      ...row,
      photos: JSON.parse(row.photos || '[]'),
      videos: JSON.parse(row.videos || '[]'),
      checklistData: JSON.parse(row.checklistData || '[]'),
      synced: false,
      syncAttempts: row.syncAttempts || 0,
    }));
  } catch (error) {
    console.error('Failed to load unsynced reports:', error);
    return [];
  }
};

export const markReportSynced = async (reportId: string): Promise<void> => {
  try {
    const database = await getDatabase();
    await database.runAsync(
      'UPDATE queued_reports SET synced = 1, lastSyncAttempt = ?, errorMessage = NULL WHERE id = ?',
      [new Date().toISOString(), reportId]
    );
    console.log(`Marked report ${reportId} as synced`);
  } catch (error) {
    console.error('Failed to mark report as synced:', error);
    throw error;
  }
};

export const incrementSyncAttempts = async (reportId: string, errorMessage?: string): Promise<void> => {
  try {
    const database = await getDatabase();
    await database.runAsync(
      'UPDATE queued_reports SET syncAttempts = syncAttempts + 1, lastSyncAttempt = ?, errorMessage = ? WHERE id = ?',
      [new Date().toISOString(), errorMessage || null, reportId]
    );
  } catch (error) {
    console.error('Failed to increment sync attempts:', error);
  }
};

export const deleteQueuedReport = async (reportId: string): Promise<void> => {
  try {
    const database = await getDatabase();
    await database.runAsync('DELETE FROM queued_reports WHERE id = ?', [reportId]);
    console.log(`Deleted queued report ${reportId}`);
  } catch (error) {
    console.error('Failed to delete queued report:', error);
    throw error;
  }
};

export const clearSyncedReports = async (): Promise<void> => {
  try {
    const database = await getDatabase();
    const result = await database.runAsync('DELETE FROM queued_reports WHERE synced = 1');
    console.log(`Cleared ${result.changes} synced reports`);
  } catch (error) {
    console.error('Failed to clear synced reports:', error);
    throw error;
  }
};

export const getQueueStats = async (): Promise<{ total: number; synced: number; pending: number; failed: number }> => {
  try {
    const database = await getDatabase();
    const result = await database.getAllAsync(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN synced = 1 THEN 1 ELSE 0 END) as synced,
        SUM(CASE WHEN synced = 0 AND syncAttempts < 3 THEN 1 ELSE 0 END) as pending,
        SUM(CASE WHEN synced = 0 AND syncAttempts >= 3 THEN 1 ELSE 0 END) as failed
      FROM queued_reports
    `);
    
    const stats = result[0] as any;
    return {
      total: stats.total || 0,
      synced: stats.synced || 0,
      pending: stats.pending || 0,
      failed: stats.failed || 0,
    };
  } catch (error) {
    console.error('Failed to get queue stats:', error);
    return { total: 0, synced: 0, pending: 0, failed: 0 };
  }
};

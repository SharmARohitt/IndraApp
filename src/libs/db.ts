import * as SQLite from 'expo-sqlite';

const DB_NAME = 'indra.db';

let db: SQLite.SQLiteDatabase | null = null;

export const initDatabase = async () => {
  try {
    db = await SQLite.openDatabaseAsync(DB_NAME);

    // Create tables
    await db.execAsync(`
      PRAGMA journal_mode = WAL;
      
      CREATE TABLE IF NOT EXISTS tasks (
        id TEXT PRIMARY KEY,
        substationId TEXT,
        substationName TEXT,
        lat REAL,
        lng REAL,
        status TEXT,
        priority TEXT,
        assignedAt TEXT,
        description TEXT,
        checklist TEXT,
        syncedAt TEXT
      );

      CREATE TABLE IF NOT EXISTS queued_reports (
        id TEXT PRIMARY KEY,
        taskId TEXT,
        notes TEXT,
        severity TEXT,
        photos TEXT,
        videos TEXT,
        checklistData TEXT,
        createdAt TEXT,
        synced INTEGER DEFAULT 0
      );

      CREATE TABLE IF NOT EXISTS media_queue (
        id TEXT PRIMARY KEY,
        reportId TEXT,
        filePath TEXT,
        fileType TEXT,
        uploaded INTEGER DEFAULT 0,
        createdAt TEXT
      );
    `);

    console.log('Database initialized successfully');
    return db;
  } catch (error) {
    console.error('Failed to initialize database:', error);
    throw error;
  }
};

export const getDatabase = () => {
  if (!db) {
    throw new Error('Database not initialized. Call initDatabase() first.');
  }
  return db;
};

// Task operations
export const saveTasks = async (tasks: any[]) => {
  const database = getDatabase();
  
  for (const task of tasks) {
    await database.runAsync(
      `INSERT OR REPLACE INTO tasks (id, substationId, substationName, lat, lng, status, priority, assignedAt, description, checklist, syncedAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        task.id,
        task.substationId,
        task.substationName,
        task.lat,
        task.lng,
        task.status,
        task.priority,
        task.assignedAt,
        task.description,
        JSON.stringify(task.checklist || []),
        new Date().toISOString(),
      ]
    );
  }
};

export const loadTasks = async () => {
  const database = getDatabase();
  const result = await database.getAllAsync('SELECT * FROM tasks ORDER BY assignedAt DESC');
  
  return result.map((row: any) => ({
    ...row,
    checklist: JSON.parse(row.checklist || '[]'),
  }));
};

// Report queue operations
export const saveQueuedReport = async (report: any) => {
  const database = getDatabase();
  
  await database.runAsync(
    `INSERT INTO queued_reports (id, taskId, notes, severity, photos, videos, checklistData, createdAt, synced)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      report.id,
      report.taskId,
      report.notes,
      report.severity,
      JSON.stringify(report.photos),
      JSON.stringify(report.videos),
      JSON.stringify(report.checklistData),
      report.createdAt,
      report.synced ? 1 : 0,
    ]
  );
};

export const loadQueuedReports = async () => {
  const database = getDatabase();
  const result = await database.getAllAsync('SELECT * FROM queued_reports WHERE synced = 0');
  
  return result.map((row: any) => ({
    ...row,
    photos: JSON.parse(row.photos || '[]'),
    videos: JSON.parse(row.videos || '[]'),
    checklistData: JSON.parse(row.checklistData || '[]'),
    synced: row.synced === 1,
  }));
};

export const markReportSynced = async (reportId: string) => {
  const database = getDatabase();
  await database.runAsync('UPDATE queued_reports SET synced = 1 WHERE id = ?', [reportId]);
};

export const deleteQueuedReport = async (reportId: string) => {
  const database = getDatabase();
  await database.runAsync('DELETE FROM queued_reports WHERE id = ?', [reportId]);
};

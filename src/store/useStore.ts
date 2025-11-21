import { create } from 'zustand';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'worker';
}

export interface Task {
  id: string;
  substationId: string;
  substationName: string;
  lat: number;
  lng: number;
  status: 'assigned' | 'in_progress' | 'completed' | 'urgent';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assignedAt: string;
  description: string;
  checklist?: ChecklistItem[];
}

export interface ChecklistItem {
  id: string;
  label: string;
  checked: boolean;
  required: boolean;
}

export interface QueuedReport {
  id: string;
  taskId: string;
  notes: string;
  severity: 'normal' | 'warning' | 'critical';
  photos: string[];
  videos: string[];
  checklistData: ChecklistItem[];
  createdAt: string;
  synced: boolean;
}

interface AppState {
  // Auth
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  setUser: (user: User | null) => void;
  setAccessToken: (token: string | null) => void;
  logout: () => void;

  // Tasks
  tasks: Task[];
  setTasks: (tasks: Task[]) => void;
  updateTask: (taskId: string, updates: Partial<Task>) => void;

  // Offline queue
  queuedReports: QueuedReport[];
  addQueuedReport: (report: QueuedReport) => void;
  removeQueuedReport: (reportId: string) => void;
  markReportSynced: (reportId: string) => void;

  // Network status
  isOnline: boolean;
  setIsOnline: (online: boolean) => void;

  // Push token
  pushToken: string | null;
  setPushToken: (token: string | null) => void;
}

export const useStore = create<AppState>((set) => ({
  // Auth
  user: null,
  accessToken: null,
  isAuthenticated: false,
  setUser: (user) => set({ user, isAuthenticated: !!user }),
  setAccessToken: (token) => set({ accessToken: token }),
  logout: () => set({ user: null, accessToken: null, isAuthenticated: false }),

  // Tasks
  tasks: [],
  setTasks: (tasks) => set({ tasks }),
  updateTask: (taskId, updates) =>
    set((state) => ({
      tasks: state.tasks.map((task) =>
        task.id === taskId ? { ...task, ...updates } : task
      ),
    })),

  // Offline queue
  queuedReports: [],
  addQueuedReport: (report) =>
    set((state) => ({ queuedReports: [...state.queuedReports, report] })),
  removeQueuedReport: (reportId) =>
    set((state) => ({
      queuedReports: state.queuedReports.filter((r) => r.id !== reportId),
    })),
  markReportSynced: (reportId) =>
    set((state) => ({
      queuedReports: state.queuedReports.map((r) =>
        r.id === reportId ? { ...r, synced: true } : r
      ),
    })),

  // Network
  isOnline: true,
  setIsOnline: (online) => set({ isOnline: online }),

  // Push
  pushToken: null,
  setPushToken: (token) => set({ pushToken: token }),
}));

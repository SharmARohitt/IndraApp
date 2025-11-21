import api from './index';
import { Task } from '../store/useStore';

export interface TaskReport {
  taskId: string;
  notes: string;
  severity: 'normal' | 'warning' | 'critical';
  checklistData: any[];
  photos?: string[];
  videos?: string[];
}

export const fetchTasks = async (): Promise<Task[]> => {
  const response = await api.get<Task[]>('/worker/tasks');
  return response.data;
};

export const fetchTaskById = async (taskId: string): Promise<Task> => {
  const response = await api.get<Task>(`/worker/tasks/${taskId}`);
  return response.data;
};

export const submitTaskReport = async (report: TaskReport): Promise<void> => {
  const formData = new FormData();
  
  formData.append('taskId', report.taskId);
  formData.append('notes', report.notes);
  formData.append('severity', report.severity);
  formData.append('checklistData', JSON.stringify(report.checklistData));

  // Append photos
  if (report.photos) {
    for (let i = 0; i < report.photos.length; i++) {
      const uri = report.photos[i];
      const filename = uri.split('/').pop() || `photo_${i}.jpg`;
      
      formData.append('photos', {
        uri,
        name: filename,
        type: 'image/jpeg',
      } as any);
    }
  }

  // Append videos
  if (report.videos) {
    for (let i = 0; i < report.videos.length; i++) {
      const uri = report.videos[i];
      const filename = uri.split('/').pop() || `video_${i}.mp4`;
      
      formData.append('videos', {
        uri,
        name: filename,
        type: 'video/mp4',
      } as any);
    }
  }

  await api.post('/worker/reports', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

export const updateTaskStatus = async (
  taskId: string,
  status: 'in_progress' | 'completed'
): Promise<void> => {
  await api.patch(`/worker/tasks/${taskId}/status`, { status });
};

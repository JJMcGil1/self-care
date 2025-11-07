import { contextBridge, ipcRenderer } from 'electron';
import { WorkoutRecord } from '../shared/types';

const electronAPI = {
  getWorkout: (date: string): Promise<WorkoutRecord | null> =>
    ipcRenderer.invoke('get-workout', date),

  setWorkout: (date: string, workedOut: boolean): Promise<WorkoutRecord> =>
    ipcRenderer.invoke('set-workout', date, workedOut),

  getWorkoutsInRange: (startDate: string, endDate: string): Promise<WorkoutRecord[]> =>
    ipcRenderer.invoke('get-workouts-in-range', startDate, endDate),

  getAllWorkouts: (): Promise<WorkoutRecord[]> => ipcRenderer.invoke('get-all-workouts'),

  // Window controls
  minimizeWindow: () => ipcRenderer.invoke('window-minimize'),
  maximizeWindow: () => ipcRenderer.invoke('window-maximize'),
  closeWindow: () => ipcRenderer.invoke('window-close'),
};

contextBridge.exposeInMainWorld('electronAPI', electronAPI);

declare global {
  interface Window {
    electronAPI: typeof electronAPI;
  }
}


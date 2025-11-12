import { WorkoutRecord } from '../shared/types';

export interface ElectronAPI {
  getWorkout: (date: string) => Promise<WorkoutRecord | null>;
  setWorkout: (date: string, workedOut: boolean, weight?: number) => Promise<WorkoutRecord>;
  getWorkoutsInRange: (startDate: string, endDate: string) => Promise<WorkoutRecord[]>;
  getAllWorkouts: () => Promise<WorkoutRecord[]>;
  minimizeWindow: () => Promise<void>;
  maximizeWindow: () => Promise<void>;
  closeWindow: () => Promise<void>;
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}


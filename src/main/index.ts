import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'path';
import { workoutDb } from './database';
import { WorkoutRecord } from '../shared/types';

let mainWindow: BrowserWindow | null = null;

function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: 900,
    height: 700,
    minWidth: 600,
    minHeight: 500,
    backgroundColor: '#000000',
    titleBarStyle: process.platform === 'darwin' ? 'hiddenInset' : 'default',
    frame: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  // Load the app
  // In development, always try to load from Vite dev server
  const isDev = !app.isPackaged;
  if (isDev) {
    mainWindow.loadURL('http://localhost:3000');
    mainWindow.webContents.openDevTools();
    
    // Handle dev server not ready
    mainWindow.webContents.on('did-fail-load', () => {
      setTimeout(() => {
        mainWindow?.loadURL('http://localhost:3000');
      }, 1000);
    });
  } else {
    mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // Add keyboard shortcut for reload in development
  if (isDev) {
    mainWindow.webContents.on('before-input-event', (event, input) => {
      // Cmd+R or Ctrl+R to reload
      if ((input.control || input.meta) && input.key.toLowerCase() === 'r') {
        mainWindow?.reload();
      }
    });
  }
}

// Initialize database when app is ready
app.whenReady().then(() => {
  workoutDb.initialize();
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    workoutDb.close();
    app.quit();
  }
});

app.on('before-quit', () => {
  workoutDb.close();
});

// IPC Handlers
ipcMain.handle('get-workout', async (_event, date: string): Promise<WorkoutRecord | null> => {
  return workoutDb.getWorkout(date);
});

ipcMain.handle('set-workout', async (_event, date: string, workedOut: boolean, weight?: number): Promise<WorkoutRecord> => {
  return workoutDb.setWorkout(date, workedOut, weight);
});

ipcMain.handle('get-workouts-in-range', async (_event, startDate: string, endDate: string): Promise<WorkoutRecord[]> => {
  return workoutDb.getWorkoutsInRange(startDate, endDate);
});

ipcMain.handle('get-all-workouts', async (): Promise<WorkoutRecord[]> => {
  return workoutDb.getAllWorkouts();
});

// Window control handlers
ipcMain.handle('window-minimize', () => {
  mainWindow?.minimize();
});

ipcMain.handle('window-maximize', () => {
  if (mainWindow?.isMaximized()) {
    mainWindow.unmaximize();
  } else {
    mainWindow?.maximize();
  }
});

ipcMain.handle('window-close', () => {
  mainWindow?.close();
});


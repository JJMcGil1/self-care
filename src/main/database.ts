import Database from 'better-sqlite3';
import { app } from 'electron';
import path from 'path';
import { WorkoutRecord } from '../shared/types';

class WorkoutDatabase {
  private db: Database.Database | null = null;

  initialize(): void {
    const userDataPath = app.getPath('userData');
    const dbPath = path.join(userDataPath, 'workouts.db');

    this.db = new Database(dbPath);
    this.db.pragma('journal_mode = WAL'); // Write-Ahead Logging for better performance

    // Create workouts table if it doesn't exist
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS workouts (
        date TEXT PRIMARY KEY,
        workedOut INTEGER NOT NULL DEFAULT 0,
        createdAt INTEGER NOT NULL,
        updatedAt INTEGER NOT NULL
      );

      CREATE INDEX IF NOT EXISTS idx_workouts_date ON workouts(date);
    `);
  }

  getWorkout(date: string): WorkoutRecord | null {
    if (!this.db) throw new Error('Database not initialized');

    const row = this.db
      .prepare('SELECT * FROM workouts WHERE date = ?')
      .get(date) as any;

    if (!row) return null;

    return {
      date: row.date,
      workedOut: Boolean(row.workedOut),
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  }

  setWorkout(date: string, workedOut: boolean): WorkoutRecord {
    if (!this.db) throw new Error('Database not initialized');

    const now = Date.now();
    const existing = this.getWorkout(date);

    if (existing) {
      this.db
        .prepare('UPDATE workouts SET workedOut = ?, updatedAt = ? WHERE date = ?')
        .run(workedOut ? 1 : 0, now, date);

      return {
        ...existing,
        workedOut,
        updatedAt: now,
      };
    } else {
      this.db
        .prepare('INSERT INTO workouts (date, workedOut, createdAt, updatedAt) VALUES (?, ?, ?, ?)')
        .run(date, workedOut ? 1 : 0, now, now);

      return {
        date,
        workedOut,
        createdAt: now,
        updatedAt: now,
      };
    }
  }

  getWorkoutsInRange(startDate: string, endDate: string): WorkoutRecord[] {
    if (!this.db) throw new Error('Database not initialized');

    const rows = this.db
      .prepare('SELECT * FROM workouts WHERE date >= ? AND date <= ? ORDER BY date')
      .all(startDate, endDate) as any[];

    return rows.map((row) => ({
      date: row.date,
      workedOut: Boolean(row.workedOut),
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    }));
  }

  getAllWorkouts(): WorkoutRecord[] {
    if (!this.db) throw new Error('Database not initialized');

    const rows = this.db.prepare('SELECT * FROM workouts ORDER BY date').all() as any[];

    return rows.map((row) => ({
      date: row.date,
      workedOut: Boolean(row.workedOut),
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    }));
  }

  close(): void {
    if (this.db) {
      this.db.close();
      this.db = null;
    }
  }
}

export const workoutDb = new WorkoutDatabase();



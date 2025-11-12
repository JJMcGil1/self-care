import Database from 'better-sqlite3';
import { app } from 'electron';
import path from 'path';
import { WorkoutRecord } from '../shared/types';

class WorkoutDatabase {
  private db: Database.Database | null = null;

  initialize(): void {
    const userDataPath = app.getPath('userData');
    const dbPath = path.join(userDataPath, 'workouts.db');
    console.log(`[DB] Initializing database at: ${dbPath}`);

    this.db = new Database(dbPath);
    this.db.pragma('journal_mode = WAL'); // Write-Ahead Logging for better performance

    // Create workouts table if it doesn't exist
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS workouts (
        date TEXT PRIMARY KEY,
        workedOut INTEGER NOT NULL DEFAULT 0,
        weight REAL,
        createdAt INTEGER NOT NULL,
        updatedAt INTEGER NOT NULL
      );

      CREATE INDEX IF NOT EXISTS idx_workouts_date ON workouts(date);
    `);

    // Add weight column if it doesn't exist (for existing databases)
    try {
      this.db.exec('ALTER TABLE workouts ADD COLUMN weight REAL');
      console.log('[DB] Added weight column to existing database');
    } catch (e: any) {
      // Column already exists, this is expected
      if (e.message && !e.message.includes('duplicate column name')) {
        console.error('[DB] Error adding weight column:', e);
      }
    }

    // Verify schema is correct
    const tableInfo = this.db.pragma('table_info(workouts)');
    const hasWeightColumn = (tableInfo as any[]).some(col => col.name === 'weight');
    
    if (!hasWeightColumn) {
      console.error('[DB] CRITICAL: weight column is missing from schema!');
    } else {
      console.log('[DB] Schema validated: weight column exists');
    }
  }

  getWorkout(date: string): WorkoutRecord | null {
    if (!this.db) throw new Error('Database not initialized');

    const row = this.db
      .prepare('SELECT * FROM workouts WHERE date = ?')
      .get(date) as any;

    if (!row) return null;

    // IMPORTANT: Use null instead of undefined for "no weight" to prevent JSON serialization from stripping the property
    return {
      date: row.date,
      workedOut: Boolean(row.workedOut),
      weight: row.weight != null ? Number(row.weight) : null,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  }

  setWorkout(date: string, workedOut: boolean, weight?: number): WorkoutRecord {
    if (!this.db) throw new Error('Database not initialized');

    const now = Date.now();
    const existing = this.getWorkout(date);

    if (existing) {
      // Determine final weight value: use provided weight if given, otherwise keep existing
      // IMPORTANT: Use null (not undefined) so JSON serialization doesn't strip the property
      const finalWeight = weight !== undefined ? weight : (existing.weight !== null ? existing.weight : null);
      const sqlWeight = finalWeight; // Can be number or null, both valid for SQLite
      
      // Execute UPDATE
      const stmt = this.db.prepare('UPDATE workouts SET workedOut = ?, weight = ?, updatedAt = ? WHERE date = ?');
      const result = stmt.run(workedOut ? 1 : 0, sqlWeight, now, date);
      
      if (result.changes === 0) {
        throw new Error(`Failed to update workout record for ${date}: no rows affected`);
      }

      // Read back to verify persistence
      const verifyRow = this.db.prepare('SELECT * FROM workouts WHERE date = ?').get(date) as any;
      if (!verifyRow) {
        throw new Error(`Failed to read back workout record for ${date} after update`);
      }
      
      // IMPORTANT: Use null instead of undefined for "no weight"
      const dbWeight = verifyRow.weight != null ? Number(verifyRow.weight) : null;
      
      // CRITICAL: If weight was provided but not in DB, that's a data loss bug
      if (weight !== undefined && dbWeight === null) {
        throw new Error(`Failed to persist weight ${weight} to database for ${date}`);
      }
      
      // Always use DB value as source of truth after successful write
      return {
        date: verifyRow.date,
        workedOut: Boolean(verifyRow.workedOut),
        weight: dbWeight, // null or number, never undefined
        createdAt: verifyRow.createdAt,
        updatedAt: verifyRow.updatedAt,
      };
      
    } else {
      // INSERT new record
      // IMPORTANT: Use null (not undefined) for "no weight"
      const sqlWeight = weight !== undefined ? weight : null;
      
      const stmt = this.db.prepare('INSERT INTO workouts (date, workedOut, weight, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?)');
      const result = stmt.run(date, workedOut ? 1 : 0, sqlWeight, now, now);
      
      if (result.changes === 0) {
        throw new Error(`Failed to insert workout record for ${date}: no rows affected`);
      }

      // Read back to verify
      const verifyRow = this.db.prepare('SELECT * FROM workouts WHERE date = ?').get(date) as any;
      if (!verifyRow) {
        throw new Error(`Failed to read back workout record for ${date} after insert`);
      }
      
      const dbWeight = verifyRow.weight != null ? Number(verifyRow.weight) : null;
      
      // CRITICAL: If weight was provided but not in DB, that's a bug
      if (weight !== undefined && dbWeight === null) {
        throw new Error(`Failed to persist weight ${weight} to database for ${date}`);
      }

      return {
        date: verifyRow.date,
        workedOut: Boolean(verifyRow.workedOut),
        weight: dbWeight, // null or number, never undefined
        createdAt: verifyRow.createdAt,
        updatedAt: verifyRow.updatedAt,
      };
    }
  }

  getWorkoutsInRange(startDate: string, endDate: string): WorkoutRecord[] {
    if (!this.db) throw new Error('Database not initialized');

    const rows = this.db
      .prepare('SELECT * FROM workouts WHERE date >= ? AND date <= ? ORDER BY date')
      .all(startDate, endDate) as any[];

    // IMPORTANT: Use null instead of undefined for "no weight"
    return rows.map((row) => ({
      date: row.date,
      workedOut: Boolean(row.workedOut),
      weight: row.weight != null ? Number(row.weight) : null,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    }));
  }

  getAllWorkouts(): WorkoutRecord[] {
    if (!this.db) throw new Error('Database not initialized');

    const rows = this.db.prepare('SELECT * FROM workouts ORDER BY date').all() as any[];
    
    // IMPORTANT: Use null instead of undefined for "no weight" to prevent JSON serialization from stripping the property
    return rows.map((row) => ({
      date: row.date,
      workedOut: Boolean(row.workedOut),
      weight: row.weight != null ? Number(row.weight) : null,
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




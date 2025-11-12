export interface WorkoutRecord {
  date: string; // ISO date string (YYYY-MM-DD)
  workedOut: boolean;
  weight?: number | null; // weight in pounds (optional, only for Mondays). null = no weight, undefined = not set
  createdAt: number; // timestamp
  updatedAt: number; // timestamp
}

export interface CalendarDay {
  date: Date;
  workedOut: boolean;
  isToday: boolean;
  isCurrentMonth: boolean;
}




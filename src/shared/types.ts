export interface WorkoutRecord {
  date: string; // ISO date string (YYYY-MM-DD)
  workedOut: boolean;
  createdAt: number; // timestamp
  updatedAt: number; // timestamp
}

export interface CalendarDay {
  date: Date;
  workedOut: boolean;
  isToday: boolean;
  isCurrentMonth: boolean;
}



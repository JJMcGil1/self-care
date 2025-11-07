import { format, parseISO, subDays, startOfMonth, endOfMonth, addDays } from 'date-fns';

export interface StreakStats {
  currentStreak: number;
  longestStreak: number;
  totalWorkouts: number;
  totalDaysPassed: number; // Days since first workout
  monthPercentage: number; // Percentage of workouts this month
  allTimePercentage: number; // Percentage of workouts all time
  currentStreakStart?: string; // ISO date string
  longestStreakStart?: string; // ISO date string
  longestStreakEnd?: string; // ISO date string
  firstWorkoutDate?: string; // ISO date string
}

/**
 * Calculates workout streak statistics from workout data
 * 
 * @param workouts Map of date strings (YYYY-MM-DD) to boolean (worked out)
 * @returns Streak statistics
 */
export function calculateStreaks(workouts: Map<string, boolean>): StreakStats {
  const stats: StreakStats = {
    currentStreak: 0,
    longestStreak: 0,
    totalWorkouts: 0,
    totalDaysPassed: 0,
    monthPercentage: 0,
    allTimePercentage: 0,
  };

  if (workouts.size === 0) {
    return stats;
  }

  // Get all workout dates sorted
  const workoutDates = Array.from(workouts.entries())
    .filter(([_, workedOut]) => workedOut)
    .map(([date]) => parseISO(date))
    .sort((a, b) => a.getTime() - b.getTime());

  stats.totalWorkouts = workoutDates.length;

  if (workoutDates.length === 0) {
    return stats;
  }

  // Calculate current streak (from today backwards)
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  let currentStreakCount = 0;
  let checkDate = new Date(today);
  let streakStartDate: Date | undefined;

  // Check if today was worked out
  const todayStr = format(today, 'yyyy-MM-dd');
  if (workouts.get(todayStr)) {
    currentStreakCount = 1;
    streakStartDate = today;
    checkDate = subDays(checkDate, 1);
  } else {
    // Start from yesterday if today wasn't worked out
    checkDate = subDays(today, 1);
  }

  // Count backwards consecutive days
  while (true) {
    const checkDateStr = format(checkDate, 'yyyy-MM-dd');
    if (workouts.get(checkDateStr)) {
      currentStreakCount++;
      if (!streakStartDate) {
        streakStartDate = new Date(checkDate);
      }
      checkDate = subDays(checkDate, 1);
    } else {
      break;
    }
  }

  stats.currentStreak = currentStreakCount;
  if (streakStartDate) {
    stats.currentStreakStart = format(streakStartDate, 'yyyy-MM-dd');
  }

  // Calculate longest streak (across all time)
  let longestStreakCount = 1; // Minimum streak is 1 if there's at least one workout
  let longestStart: Date | undefined = workoutDates[0];
  let longestEnd: Date | undefined = workoutDates[0];
  let currentStreak = 1;
  let currentStart: Date = workoutDates[0];

  for (let i = 1; i < workoutDates.length; i++) {
    const currentDate = workoutDates[i];
    const prevDate = workoutDates[i - 1];
    const daysDiff = Math.round(
      (currentDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (daysDiff === 1) {
      // Consecutive day - continue the streak
      currentStreak++;
    } else {
      // Gap found - check if current streak is longest, then reset
      if (currentStreak > longestStreakCount) {
        longestStreakCount = currentStreak;
        longestStart = currentStart;
        longestEnd = prevDate;
      }
      // Start new streak
      currentStreak = 1;
      currentStart = currentDate;
    }
  }

  // Check if the last streak is the longest
  if (currentStreak > longestStreakCount) {
    longestStreakCount = currentStreak;
    longestStart = currentStart;
    longestEnd = workoutDates[workoutDates.length - 1];
  }

  stats.longestStreak = longestStreakCount;
  if (longestStart) {
    stats.longestStreakStart = format(longestStart, 'yyyy-MM-dd');
  }
  if (longestEnd) {
    stats.longestStreakEnd = format(longestEnd, 'yyyy-MM-dd');
  }

  // Calculate days passed since first workout
  if (workoutDates.length > 0) {
    const firstWorkout = workoutDates[0];
    stats.firstWorkoutDate = format(firstWorkout, 'yyyy-MM-dd');
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const daysPassed = Math.round(
      (today.getTime() - firstWorkout.getTime()) / (1000 * 60 * 60 * 24)
    ) + 1; // +1 to include the first day
    
    stats.totalDaysPassed = daysPassed;
    
    // Calculate all-time percentage
    stats.allTimePercentage = Math.round((stats.totalWorkouts / daysPassed) * 100);
  }

  // Calculate month percentage
  const now = new Date();
  const monthStart = startOfMonth(now);
  const monthEnd = endOfMonth(now);
  
  let monthWorkouts = 0;
  let monthDays = 0;
  
  let currentMonthDate = monthStart;
  while (currentMonthDate <= monthEnd && currentMonthDate <= now) {
    const dateStr = format(currentMonthDate, 'yyyy-MM-dd');
    if (workouts.get(dateStr)) {
      monthWorkouts++;
    }
    monthDays++;
    currentMonthDate = addDays(currentMonthDate, 1);
  }
  
  stats.monthPercentage = monthDays > 0 ? Math.round((monthWorkouts / monthDays) * 100) : 0;

  return stats;
}


import React, { useState, useEffect, useMemo } from 'react';
import Calendar from './components/Calendar';
import TitleBar from './components/TitleBar';
import StreakModal from './components/StreakModal';
import WeightModal from './components/WeightModal';
import { calculateStreaks } from './utils/streakCalculator';
import { getDay, parseISO } from 'date-fns';

function App() {
  const [workouts, setWorkouts] = useState<Map<string, boolean>>(new Map());
  const [weights, setWeights] = useState<Map<string, number>>(new Map());
  const [isLoading, setIsLoading] = useState(true);
  const [isStreakModalOpen, setIsStreakModalOpen] = useState(false);
  const [isWeightModalOpen, setIsWeightModalOpen] = useState(false);
  const [pendingWorkoutDate, setPendingWorkoutDate] = useState<string | null>(null);
  const [pendingWorkoutStatus, setPendingWorkoutStatus] = useState<boolean>(false);

  // Calculate streak stats whenever workouts change
  const streakStats = useMemo(() => calculateStreaks(workouts), [workouts]);

  useEffect(() => {
    loadWorkouts();
  }, []);

  const loadWorkouts = async () => {
    try {
      if (!window.electronAPI) {
        console.error('electronAPI not available');
        setIsLoading(false);
        return;
      }
      const records = await window.electronAPI.getAllWorkouts();
      const workoutMap = new Map<string, boolean>();
      const weightMap = new Map<string, number>();
      
      records.forEach((record) => {
        workoutMap.set(record.date, record.workedOut);
        if (record.weight !== null && record.weight !== undefined) {
          weightMap.set(record.date, record.weight);
        }
      });
      
      setWorkouts(workoutMap);
      setWeights(weightMap);
    } catch (error) {
      console.error('Failed to load workouts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleWorkout = async (date: string) => {
    const currentStatus = workouts.get(date) || false;
    const newStatus = !currentStatus;

    // Check if it's a Monday
    const dateObj = parseISO(date);
    const isMonday = getDay(dateObj) === 1; // 0 = Sunday, 1 = Monday

    // If it's Monday and we're checking off (not unchecking), show weight modal first
    if (isMonday && newStatus && !currentStatus) {
      setPendingWorkoutDate(date);
      setPendingWorkoutStatus(newStatus);
      setIsWeightModalOpen(true);
      return;
    }

    // Otherwise, proceed with normal toggle
    await saveWorkout(date, newStatus);
  };

  const saveWorkout = async (date: string, workedOut: boolean, weight?: number) => {
    try {
      const record = await window.electronAPI.setWorkout(date, workedOut, weight);
      
      // Update workout status
      setWorkouts((prev) => {
        const next = new Map(prev);
        next.set(date, workedOut);
        return next;
      });
      
      // Update weight: null means "no weight", so remove from map
      if (record.weight !== null && record.weight !== undefined) {
        setWeights((prev) => {
          const next = new Map(prev);
          next.set(date, record.weight!);
          return next;
        });
      } else {
        // Weight is null - remove from map if it exists
        setWeights((prev) => {
          if (prev.has(date)) {
            const next = new Map(prev);
            next.delete(date);
            return next;
          }
          return prev;
        });
      }
      
      return record;
    } catch (error) {
      console.error('Failed to save workout:', error);
      throw error;
    }
  };

  const handleWeightSave = async (weight: number) => {
    if (!pendingWorkoutDate) return;

    try {
      await saveWorkout(pendingWorkoutDate, pendingWorkoutStatus, weight);
      setPendingWorkoutDate(null);
      setPendingWorkoutStatus(false);
    } catch (error) {
      console.error('Failed to save workout with weight:', error);
      alert(`Failed to save weight: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleWeightModalClose = () => {
    setIsWeightModalOpen(false);
    setPendingWorkoutDate(null);
    setPendingWorkoutStatus(false);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col h-screen">
        <TitleBar currentStreak={0} />
        <div
          className="flex-1 flex items-center justify-center bg-white dark:bg-black"
          style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
        >
          <div className="text-gray-400 dark:text-gray-500">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col h-screen bg-white dark:bg-black overflow-hidden">
        <TitleBar 
          onStreakClick={() => setIsStreakModalOpen(true)} 
          currentStreak={streakStats.currentStreak}
        />
        <div
          className="flex-1 overflow-y-auto"
          style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
        >
          <div className="min-h-full flex items-start justify-center px-8 py-12">
            <Calendar workouts={workouts} weights={weights} onToggleWorkout={toggleWorkout} />
          </div>
        </div>
      </div>

      {/* Streak Modal */}
      <StreakModal
        isOpen={isStreakModalOpen}
        onClose={() => setIsStreakModalOpen(false)}
        stats={streakStats}
      />

      {/* Weight Modal */}
      {pendingWorkoutDate && (
        <WeightModal
          isOpen={isWeightModalOpen}
          onClose={handleWeightModalClose}
          onSave={handleWeightSave}
          date={pendingWorkoutDate}
          existingWeight={weights.get(pendingWorkoutDate)}
        />
      )}
    </>
  );
}

export default App;


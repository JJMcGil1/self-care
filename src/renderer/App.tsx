import React, { useState, useEffect, useMemo } from 'react';
import Calendar from './components/Calendar';
import TitleBar from './components/TitleBar';
import StreakModal from './components/StreakModal';
import { calculateStreaks } from './utils/streakCalculator';

function App() {
  const [workouts, setWorkouts] = useState<Map<string, boolean>>(new Map());
  const [isLoading, setIsLoading] = useState(true);
  const [isStreakModalOpen, setIsStreakModalOpen] = useState(false);

  // Calculate streak stats whenever workouts change
  const streakStats = useMemo(() => calculateStreaks(workouts), [workouts]);

  useEffect(() => {
    loadWorkouts();
  }, []);

  const loadWorkouts = async () => {
    try {
      // Check if electronAPI is available
      if (!window.electronAPI) {
        console.error('electronAPI not available');
        setIsLoading(false);
        return;
      }
      const records = await window.electronAPI.getAllWorkouts();
      const workoutMap = new Map<string, boolean>();
      records.forEach((record) => {
        workoutMap.set(record.date, record.workedOut);
      });
      setWorkouts(workoutMap);
    } catch (error) {
      console.error('Failed to load workouts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleWorkout = async (date: string) => {
    const currentStatus = workouts.get(date) || false;
    const newStatus = !currentStatus;

    try {
      await window.electronAPI.setWorkout(date, newStatus);
      setWorkouts((prev) => {
        const next = new Map(prev);
        next.set(date, newStatus);
        return next;
      });
    } catch (error) {
      console.error('Failed to save workout:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col h-screen">
        <TitleBar />
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
        <TitleBar onStreakClick={() => setIsStreakModalOpen(true)} />
        <div
          className="flex-1 overflow-y-auto"
          style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
        >
          <div className="h-full flex items-center justify-center px-8 py-12">
            <Calendar workouts={workouts} onToggleWorkout={toggleWorkout} />
          </div>
        </div>
      </div>

      {/* Streak Modal */}
      <StreakModal
        isOpen={isStreakModalOpen}
        onClose={() => setIsStreakModalOpen(false)}
        stats={streakStats}
      />
    </>
  );
}

export default App;


import React, { useEffect, useState } from 'react';
import { HiX } from 'react-icons/hi';
import { HiTrophy } from 'react-icons/hi2';
import { format, parseISO } from 'date-fns';
import { StreakStats } from '../utils/streakCalculator';

interface StreakModalProps {
  isOpen: boolean;
  onClose: () => void;
  stats: StreakStats;
}

const StreakModal: React.FC<StreakModalProps> = ({ isOpen, onClose, stats }) => {
  const [isAnimating, setIsAnimating] = useState(false);
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // First: Mount the component in closed state
      setShouldRender(true);
      setIsAnimating(false);
      
      // Then: Trigger animation after a short delay to ensure DOM has painted
      const timer = setTimeout(() => {
        setIsAnimating(true);
      }, 10); // 10ms delay ensures the browser has painted the initial state
      
      return () => clearTimeout(timer);
    } else {
      // Start closing animation
      setIsAnimating(false);
      
      // Wait for animation to complete before unmounting
      const timeout = setTimeout(() => {
        setShouldRender(false);
      }, 200); // Match transition duration
      
      return () => clearTimeout(timeout);
    }
  }, [isOpen]);
  // Handle ESC key to close modal
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  // Focus trap - focus the modal when it opens
  useEffect(() => {
    if (isOpen) {
      const modal = document.getElementById('streak-modal');
      modal?.focus();
    }
  }, [isOpen]);

  if (!shouldRender) return null;

  const formatDateRange = (start?: string, end?: string) => {
    if (!start) return 'N/A';
    if (!end || start === end) {
      return format(parseISO(start), 'MMM d, yyyy');
    }
    return `${format(parseISO(start), 'MMM d')} - ${format(parseISO(end), 'MMM d, yyyy')}`;
  };

  return (
    <div
      className={`
        fixed inset-0 z-50 flex items-center justify-center
        bg-black/50 backdrop-blur-sm
        transition-all duration-200 ease-out
        ${isAnimating ? 'opacity-100' : 'opacity-0'}
      `}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="streak-modal-title"
    >
      <div
        id="streak-modal"
        className={`
          relative w-full max-w-lg mx-4
          bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl
          border border-gray-200/80 dark:border-zinc-800
          transition-all duration-200 ease-out
          focus:outline-none focus-visible:outline-none focus:ring-0 focus-visible:ring-0 active:outline-none
          ${isAnimating ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-4'}
        `}
        onClick={(e) => e.stopPropagation()}
        tabIndex={-1}
        style={{ outline: 'none' }}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-white/5 smooth-transition text-gray-400 dark:text-gray-500 hover:text-gray-900 dark:hover:text-white focus:outline-none"
          aria-label="Close modal"
        >
          <HiX className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="px-8 pt-8 pb-6">
          <h2
            id="streak-modal-title"
            className="text-2xl font-light text-gray-900 dark:text-white tracking-tight"
          >
            Your Self-Care Stats
          </h2>
        </div>

        {/* Content - 2x3 Grid */}
        <div className="px-8 pb-8">
          <div className="grid grid-cols-2 gap-3">
            {/* Current Streak */}
            <div className="flex flex-col items-center justify-center py-8 px-4 bg-gray-50/50 dark:bg-white/[0.03] rounded-2xl border border-gray-100 dark:border-white/5">
              <span className="text-5xl font-extralight text-primary-500 dark:text-primary-400 mb-3 tracking-tight">
                {stats.currentStreak}
              </span>
              <span className="text-xs font-medium text-gray-500 dark:text-gray-500 uppercase tracking-wider">
                Current Streak
              </span>
            </div>

            {/* Longest Streak */}
            <div className="flex flex-col items-center justify-center py-8 px-4 bg-gray-50/50 dark:bg-white/[0.03] rounded-2xl border border-gray-100 dark:border-white/5">
              <span className="text-5xl font-extralight text-primary-500 dark:text-primary-400 mb-3 tracking-tight">
                {stats.longestStreak}
              </span>
              <span className="text-xs font-medium text-gray-500 dark:text-gray-500 uppercase tracking-wider">
                Longest Streak
              </span>
            </div>

            {/* Month Percentage */}
            <div className="flex flex-col items-center justify-center py-8 px-4 bg-gray-50/50 dark:bg-white/[0.03] rounded-2xl border border-gray-100 dark:border-white/5">
              <span className="text-5xl font-extralight text-primary-500 dark:text-primary-400 mb-3 tracking-tight">
                {stats.monthPercentage}%
              </span>
              <span className="text-xs font-medium text-gray-500 dark:text-gray-500 uppercase tracking-wider">
                Month Percentage
              </span>
            </div>

            {/* All Time Percentage */}
            <div className="flex flex-col items-center justify-center py-8 px-4 bg-gray-50/50 dark:bg-white/[0.03] rounded-2xl border border-gray-100 dark:border-white/5">
              <span className="text-5xl font-extralight text-primary-500 dark:text-primary-400 mb-3 tracking-tight">
                {stats.allTimePercentage}%
              </span>
              <span className="text-xs font-medium text-gray-500 dark:text-gray-500 uppercase tracking-wider">
                All Time Percentage
              </span>
            </div>

            {/* Self Care Days (Total Workouts) */}
            <div className="flex flex-col items-center justify-center py-8 px-4 bg-gray-50/50 dark:bg-white/[0.03] rounded-2xl border border-gray-100 dark:border-white/5">
              <span className="text-5xl font-extralight text-primary-500 dark:text-primary-400 mb-3 tracking-tight">
                {stats.totalWorkouts}
              </span>
              <span className="text-xs font-medium text-gray-500 dark:text-gray-500 uppercase tracking-wider">
                Self Care Days
              </span>
            </div>

            {/* Total Days Passed */}
            <div className="flex flex-col items-center justify-center py-8 px-4 bg-gray-50/50 dark:bg-white/[0.03] rounded-2xl border border-gray-100 dark:border-white/5">
              <span className="text-5xl font-extralight text-primary-500 dark:text-primary-400 mb-3 tracking-tight">
                {stats.totalDaysPassed}
              </span>
              <span className="text-xs font-medium text-gray-500 dark:text-gray-500 uppercase tracking-wider">
                Total Days Passed
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StreakModal;


import React, { useState, useMemo } from 'react';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, isSameMonth, isToday, addMonths, subMonths, isFuture, startOfDay, isSameYear, getDay } from 'date-fns';
import { HiChevronLeft, HiChevronRight } from 'react-icons/hi';
import { HiCheck } from 'react-icons/hi2';

interface CalendarProps {
  workouts: Map<string, boolean>;
  weights: Map<string, number>;
  onToggleWorkout: (date: string) => void;
}

const Calendar: React.FC<CalendarProps> = ({ workouts, weights, onToggleWorkout }) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const monthStart = startOfMonth(currentDate);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 });

  const days = useMemo(() => {
    const daysArray = [];
    let day = calendarStart;
    const targetEnd = addDays(calendarStart, 41); // Always 6 weeks (42 days)

    while (day <= targetEnd) {
      daysArray.push(day);
      day = addDays(day, 1);
    }

    return daysArray;
  }, [calendarStart]);

  const handlePreviousMonth = () => {
    setCurrentDate(subMonths(currentDate, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(addMonths(currentDate, 1));
  };

  const handleGoToToday = () => {
    setCurrentDate(new Date());
  };

  // Check if we're viewing the current month
  const today = new Date();
  const isCurrentMonth = isSameMonth(currentDate, today) && isSameYear(currentDate, today);

  const handleDayClick = (date: Date) => {
    // Don't allow clicking on future dates or days from other months
    if (isFuture(startOfDay(date)) || !isSameMonth(date, currentDate)) {
      return;
    }
    const dateString = format(date, 'yyyy-MM-dd');
    onToggleWorkout(dateString);
  };

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col">
      {/* Calendar Header - Sticky */}
      <div className="sticky top-0 z-10 flex items-center justify-between mb-12 px-1 bg-white dark:bg-black py-4">
        <button
          onClick={handlePreviousMonth}
          className="p-3 rounded-2xl hover:bg-gray-100 dark:hover:bg-white/10 smooth-transition text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white active:scale-[0.96] focus:outline-none focus-visible:outline-none focus:ring-0 focus-visible:ring-0 active:outline-none flex items-center justify-center"
          aria-label="Previous month"
          style={{ outline: 'none' }}
        >
          <HiChevronLeft className="w-6 h-6 stroke-[1.5]" />
        </button>

        <div className="flex items-center gap-3">
          <h2 
            key={`month-${format(currentDate, 'yyyy-MM')}`}
            className="text-3xl font-semibold text-gray-900 dark:text-white tracking-tight fade-in"
          >
            {format(currentDate, 'MMMM yyyy')}
          </h2>
          
          {!isCurrentMonth && (
            <button
              onClick={handleGoToToday}
              className="px-3 py-1.5 rounded-xl hover:bg-gray-100 dark:hover:bg-white/10 smooth-transition text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white active:scale-[0.96] focus:outline-none focus-visible:outline-none focus:ring-0 focus-visible:ring-0 active:outline-none"
              aria-label="Go to today"
              style={{ outline: 'none' }}
            >
              Today
            </button>
          )}
        </div>

        <button
          onClick={handleNextMonth}
          className="p-3 rounded-2xl hover:bg-gray-100 dark:hover:bg-white/10 smooth-transition text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white active:scale-[0.96] focus:outline-none focus-visible:outline-none focus:ring-0 focus-visible:ring-0 active:outline-none flex items-center justify-center"
          aria-label="Next month"
          style={{ outline: 'none' }}
        >
          <HiChevronRight className="w-6 h-6 stroke-[1.5]" />
        </button>
      </div>

      {/* Calendar Content Container */}
      <div className="relative" style={{ minHeight: '520px', width: '100%' }}>
        <div
          key={`calendar-${format(currentDate, 'yyyy-MM')}`}
          className="fade-in"
          style={{ width: '100%' }}
        >
          {/* Week Day Headers */}
          <div className="grid grid-cols-7 gap-3 mb-4">
            {weekDays.map((day) => (
              <div
                key={day}
                className="text-center text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 grid-rows-6 gap-3" style={{ minHeight: '480px' }}>
        {days.map((day, idx) => {
          const dateString = format(day, 'yyyy-MM-dd');
          const workedOut = workouts.get(dateString) || false;
          const weight = weights.get(dateString);
          const isCurrentMonth = isSameMonth(day, currentDate);
          const isTodayDate = isToday(day);
          const isFutureDate = isFuture(startOfDay(day));
          const isMonday = getDay(day) === 1; // 0 = Sunday, 1 = Monday
          
          // Debug logging for weight badge visibility
          if (isMonday && workedOut && isCurrentMonth) {
            console.log(`[Calendar] Monday ${dateString}: workedOut=${workedOut}, weight=${weight}, shouldShow=${weight !== undefined}`);
          }

          return (
              <button
              key={idx}
              onClick={() => handleDayClick(day)}
              className={`
                aspect-square rounded-2xl smooth-transition
                flex flex-col items-center justify-center
                relative
                p-3
                focus:outline-none focus-visible:outline-none focus:ring-0 focus-visible:ring-0 active:outline-none
                ${
                  !isCurrentMonth
                    ? 'text-gray-300 dark:text-gray-500 cursor-not-allowed opacity-40 dark:opacity-40 bg-transparent'
                    : isFutureDate
                    ? 'bg-gray-50/30 dark:bg-zinc-950/50 border border-gray-200/30 dark:border-white/5 cursor-not-allowed opacity-50'
                    : workedOut
                    ? 'bg-success-50/60 dark:bg-success-800/15 border border-success-400 dark:border-success-500 hover:border-success-500 dark:hover:border-success-400 hover:scale-[1.02] cursor-pointer'
                    : isTodayDate
                    ? 'bg-gray-50 dark:bg-zinc-900/80 border-2 border-gray-900 dark:border-gray-200 hover:border-gray-700 dark:hover:border-gray-300 hover:scale-[1.02] cursor-pointer shadow-sm dark:shadow-gray-950/30'
                    : 'bg-gray-50/50 dark:bg-zinc-950 border border-gray-200/50 dark:border-white/10 hover:border-gray-300 dark:hover:border-zinc-700 hover:shadow-lg hover:scale-105 cursor-pointer'
                }
              `}
              disabled={!isCurrentMonth || isFutureDate}
              style={{ outline: 'none' }}
            >
              {/* Date number */}
              <span
                className={`
                  text-2xl transition-all tracking-tight
                  ${isFutureDate ? 'text-gray-400 dark:text-gray-600 font-medium' : ''}
                  ${!isFutureDate && workedOut ? 'text-gray-800 dark:text-gray-100 font-medium' : ''}
                  ${!isFutureDate && !workedOut && isTodayDate ? 'text-gray-900 dark:text-white font-bold text-[26px] leading-none' : ''}
                  ${!isFutureDate && !workedOut && !isTodayDate ? 'text-gray-800 dark:text-gray-100 font-medium' : ''}
                  ${!isCurrentMonth ? 'text-gray-400 dark:text-gray-500' : ''}
                `}
              >
                {format(day, 'd')}
              </span>
              
              {/* Check icon for completed days */}
              {workedOut && (
                <div className="absolute bottom-2 right-2">
                  <div className="w-4 h-4 rounded-full bg-success-500 dark:bg-success-400 flex items-center justify-center">
                    <HiCheck className="w-2.5 h-2.5 text-white stroke-[2]" />
                  </div>
                </div>
              )}

              {/* Today label for completed day */}
              {isTodayDate && workedOut && (
                <div className="absolute top-2 left-2 z-20">
                  <div className="px-1 py-0.5 rounded bg-success-500 dark:bg-success-400 inline-flex items-center h-auto">
                    <span className="text-[10px] font-bold text-white uppercase tracking-[0.05em] leading-[1]" style={{ lineHeight: '1' }}>Today</span>
                  </div>
                </div>
              )}

              {/* Weight display for Mondays - only show when workout is checked off */}
              {isMonday && weight !== undefined && workedOut && (
                <div className="absolute bottom-2 left-2 z-10">
                  <div className="px-1.5 py-0.5 rounded-md bg-primary-50 dark:bg-primary-900/40 border border-primary-200/60 dark:border-primary-700/40 inline-flex items-center shadow-sm">
                    <span className="text-[9px] font-medium text-primary-700 dark:text-primary-300 leading-[1]" style={{ lineHeight: '1' }}>
                      {weight.toFixed(1)} lbs
                    </span>
                  </div>
                </div>
              )}

              {/* Today label (when not worked out) */}
              {isTodayDate && !workedOut && (
                <div className="absolute bottom-2.5 left-0 right-0 flex justify-center z-10">
                  <div className="px-1 py-0.5 rounded bg-gray-900 dark:bg-gray-100 inline-flex items-center h-auto">
                    <span className="text-[10px] font-bold text-white dark:text-gray-900 uppercase tracking-[0.05em] leading-[1]" style={{ lineHeight: '1' }}>Today</span>
                  </div>
                </div>
              )}
            </button>
          );
        })}
          </div>
        </div>
      </div>

    </div>
  );
};

export default Calendar;


import React, { useState, useMemo } from 'react';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, isSameMonth, isToday, addMonths, subMonths } from 'date-fns';
import { HiChevronLeft, HiChevronRight } from 'react-icons/hi';
import { HiCheck } from 'react-icons/hi2';

interface CalendarProps {
  workouts: Map<string, boolean>;
  onToggleWorkout: (date: string) => void;
}

const Calendar: React.FC<CalendarProps> = ({ workouts, onToggleWorkout }) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });

  const days = useMemo(() => {
    const daysArray = [];
    let day = calendarStart;

    while (day <= calendarEnd) {
      daysArray.push(day);
      day = addDays(day, 1);
    }

    return daysArray;
  }, [calendarStart, calendarEnd]);

  const handlePreviousMonth = () => {
    setCurrentDate(subMonths(currentDate, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(addMonths(currentDate, 1));
  };

  const handleDayClick = (date: Date) => {
    const dateString = format(date, 'yyyy-MM-dd');
    onToggleWorkout(dateString);
  };

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col">
      {/* Calendar Header */}
      <div className="flex items-center justify-between mb-12 px-1">
        <button
          onClick={handlePreviousMonth}
          className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-white/5 smooth-transition text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white active:scale-95 focus:outline-none focus-visible:outline-none focus:ring-0 focus-visible:ring-0 active:outline-none"
          aria-label="Previous month"
          style={{ outline: 'none' }}
        >
          <HiChevronLeft className="w-5 h-5" />
        </button>

        <h2 className="text-3xl font-semibold text-gray-900 dark:text-white tracking-tight">
          {format(currentDate, 'MMMM yyyy')}
        </h2>

        <button
          onClick={handleNextMonth}
          className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-white/5 smooth-transition text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white active:scale-95 focus:outline-none focus-visible:outline-none focus:ring-0 focus-visible:ring-0 active:outline-none"
          aria-label="Next month"
          style={{ outline: 'none' }}
        >
          <HiChevronRight className="w-5 h-5" />
        </button>
      </div>

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
      <div className="grid grid-cols-7 gap-3">
        {days.map((day, idx) => {
          const dateString = format(day, 'yyyy-MM-dd');
          const workedOut = workouts.get(dateString) || false;
          const isCurrentMonth = isSameMonth(day, currentDate);
          const isTodayDate = isToday(day);

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
                    ? 'text-gray-300 dark:text-gray-700 cursor-not-allowed opacity-15 dark:opacity-10 bg-transparent'
                    : workedOut
                    ? 'bg-gradient-to-br from-success-500 to-success-600 dark:from-success-600 dark:to-success-700 shadow-lg shadow-success-500/25 dark:shadow-success-900/40 hover:shadow-xl hover:shadow-success-500/35 dark:hover:shadow-success-900/50 hover:scale-105 cursor-pointer'
                    : isTodayDate
                    ? 'bg-gray-50 dark:bg-zinc-900/80 border-2 border-gray-900 dark:border-gray-200 hover:border-gray-700 dark:hover:border-gray-300 hover:scale-[1.02] cursor-pointer shadow-sm dark:shadow-gray-950/30'
                    : 'bg-gray-50/50 dark:bg-zinc-950 border border-gray-200/50 dark:border-white/10 hover:border-gray-300 dark:hover:border-zinc-700 hover:shadow-lg hover:scale-105 cursor-pointer'
                }
              `}
              disabled={!isCurrentMonth}
              style={{ outline: 'none' }}
            >
              {/* Date number */}
              <span
                className={`
                  text-2xl transition-all tracking-tight
                  ${workedOut ? 'text-white font-semibold' : ''}
                  ${!workedOut && isTodayDate ? 'text-gray-900 dark:text-white font-bold text-[26px] leading-none' : ''}
                  ${!workedOut && !isTodayDate ? 'text-gray-800 dark:text-gray-100 font-medium' : ''}
                  ${!isCurrentMonth ? 'opacity-30' : ''}
                `}
              >
                {format(day, 'd')}
              </span>
              
              {/* Check icon for completed days */}
              {workedOut && (
                <div className="absolute bottom-2 right-2">
                  <div className="w-6 h-6 rounded-full bg-white/25 backdrop-blur-sm flex items-center justify-center shadow-sm">
                    <HiCheck className="w-4 h-4 text-white stroke-[3]" />
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
              
              {/* Today label for completed day */}
              {isTodayDate && workedOut && (
                <div className="absolute top-2 left-2">
                  <div className="px-1.5 py-0.5 rounded-md bg-white/25 backdrop-blur-sm shadow-sm">
                    <span className="text-[9px] font-bold text-white uppercase tracking-[0.05em] leading-none">Today</span>
                  </div>
                </div>
              )}
            </button>
          );
        })}
      </div>

    </div>
  );
};

export default Calendar;


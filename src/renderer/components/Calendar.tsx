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
    <div className="w-full h-full flex flex-col">
      {/* Calendar Header */}
      <div className="flex items-center justify-between mb-12 px-1">
        <button
          onClick={handlePreviousMonth}
          className="p-2.5 rounded-full hover:bg-gray-100 dark:hover:bg-white/5 smooth-transition text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white active:scale-95"
          aria-label="Previous month"
        >
          <HiChevronLeft className="w-5 h-5" />
        </button>

        <h2 className="text-3xl font-light text-gray-900 dark:text-white tracking-tight">
          {format(currentDate, 'MMMM yyyy')}
        </h2>

        <button
          onClick={handleNextMonth}
          className="p-2.5 rounded-full hover:bg-gray-100 dark:hover:bg-white/5 smooth-transition text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white active:scale-95"
          aria-label="Next month"
        >
          <HiChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Week Day Headers */}
      <div className="grid grid-cols-7 gap-3 mb-4">
        {weekDays.map((day) => (
          <div
            key={day}
            className="text-center text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wider py-2"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-3 auto-rows-fr">
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
                min-h-[60px] rounded-2xl smooth-transition
                flex flex-col items-center justify-center
                relative
                ${
                  !isCurrentMonth
                    ? 'text-gray-300 dark:text-gray-700 cursor-not-allowed opacity-30 dark:opacity-20'
                    : 'text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-white/5 cursor-pointer active:scale-95'
                }
                ${
                  workedOut
                    ? 'bg-primary-500 dark:bg-primary-600 text-white hover:bg-primary-600 dark:hover:bg-primary-700 shadow-sm'
                    : ''
                }
                ${
                  isTodayDate && !workedOut
                    ? 'ring-2 ring-primary-400 dark:ring-primary-500 ring-offset-0 bg-primary-50/50 dark:bg-white/5'
                    : ''
                }
                ${
                  isTodayDate && workedOut
                    ? 'ring-2 ring-primary-300 dark:ring-primary-400 ring-offset-0'
                    : ''
                }
              `}
              disabled={!isCurrentMonth}
            >
              <span
                className={`
                  text-base font-medium
                  ${workedOut ? 'text-white' : 'text-gray-900 dark:text-white'}
                  ${!isCurrentMonth ? 'opacity-40 dark:opacity-30' : ''}
                `}
              >
                {format(day, 'd')}
              </span>
              {workedOut && (
                <HiCheck className="w-4 h-4 mt-0.5 text-white" />
              )}
            </button>
          );
        })}
      </div>

    </div>
  );
};

export default Calendar;


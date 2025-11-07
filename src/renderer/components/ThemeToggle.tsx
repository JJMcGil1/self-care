import React from 'react';
import { HiMoon, HiSun } from 'react-icons/hi';
import { useTheme } from '../contexts/ThemeContext';

const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="relative inline-flex items-center bg-gray-200 dark:bg-white/10 rounded-full p-0.5 smooth-transition cursor-pointer focus:outline-none focus-visible:outline-none focus:ring-0 focus-visible:ring-0 active:outline-none"
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
      type="button"
      style={{ outline: 'none', border: 'none' }}
    >
      {/* Sliding background indicator */}
      <div
        className={`
          absolute top-0.5 bottom-0.5 w-[calc(50%-0.125rem)] rounded-full
          bg-white dark:bg-white/20 shadow-sm
          smooth-transition pointer-events-none
          ${theme === 'light' ? 'left-0.5' : 'left-[calc(50%+0.0625rem)]'}
        `}
      />

      {/* Light mode icon */}
      <div
        className={`
          relative z-10 flex items-center justify-center
          w-7 h-7 rounded-full smooth-transition pointer-events-none
          ${
            theme === 'light'
              ? 'text-gray-900 dark:text-white'
              : 'text-gray-400 dark:text-gray-600'
          }
        `}
      >
        <HiSun className="w-3.5 h-3.5" />
      </div>

      {/* Dark mode icon */}
      <div
        className={`
          relative z-10 flex items-center justify-center
          w-7 h-7 rounded-full smooth-transition pointer-events-none
          ${
            theme === 'dark'
              ? 'text-gray-900 dark:text-white'
              : 'text-gray-400 dark:text-gray-600'
          }
        `}
      >
        <HiMoon className="w-3.5 h-3.5" />
      </div>
    </button>
  );
};

export default ThemeToggle;


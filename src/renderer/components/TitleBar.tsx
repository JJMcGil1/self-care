import React from 'react';
import { IoIosStats } from 'react-icons/io';
import ThemeToggle from './ThemeToggle';

// Extend CSSProperties to include WebKit-specific properties
interface WebKitCSSProperties extends React.CSSProperties {
  WebkitAppRegion?: 'drag' | 'no-drag';
  WebkitUserSelect?: 'none' | 'auto';
}

interface TitleBarProps {
  onStreakClick?: () => void;
}

const TitleBar: React.FC<TitleBarProps> = ({ onStreakClick }) => {
  const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;

  const handleMinimize = () => {
    window.electronAPI?.minimizeWindow();
  };

  const handleMaximize = () => {
    window.electronAPI?.maximizeWindow();
  };

  const handleClose = () => {
    window.electronAPI?.closeWindow();
  };

  return (
    <div
      className="flex items-center justify-between h-12 bg-gray-50/50 dark:bg-zinc-950 border-b border-gray-200/50 dark:border-white/10"
      style={{
        WebkitAppRegion: 'drag',
        WebkitUserSelect: 'none',
      } as WebKitCSSProperties}
    >
      {/* Left side - Window controls on macOS, empty on other platforms */}
      <div
        className="flex items-center h-full"
        style={{ WebkitAppRegion: 'no-drag' } as WebKitCSSProperties}
      >
        {isMac ? (
          // macOS traffic lights are handled by Electron's hiddenInset titleBarStyle
          // We just need to reserve space for them
          <div className="w-20 h-full" />
        ) : (
          // Windows/Linux: Custom window controls
          <div className="flex items-center h-full px-2 gap-1">
            <button
              onClick={handleMinimize}
              className="w-3 h-3 rounded-full bg-gray-300 hover:bg-gray-400 smooth-transition"
              aria-label="Minimize"
            />
            <button
              onClick={handleMaximize}
              className="w-3 h-3 rounded-full bg-gray-300 hover:bg-gray-400 smooth-transition"
              aria-label="Maximize"
            />
            <button
              onClick={handleClose}
              className="w-3 h-3 rounded-full bg-red-400 hover:bg-red-500 smooth-transition"
              aria-label="Close"
            />
          </div>
        )}
      </div>

      {/* Center - App title */}
      <div className="flex-1 text-center">
        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Self Care</span>
      </div>

      {/* Right side - Medal icon and Theme toggle */}
      <div
        className="flex items-center justify-end h-full px-4 gap-3"
        style={{ WebkitAppRegion: 'no-drag' } as WebKitCSSProperties}
      >
        {/* Stats button */}
        {onStreakClick && (
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onStreakClick();
            }}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 smooth-transition text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white focus:outline-none focus-visible:outline-none focus:ring-0 focus-visible:ring-0 active:outline-none"
            aria-label="View streak statistics"
            type="button"
            style={{ outline: 'none' }}
          >
            <IoIosStats className="w-4 h-4" />
            <span className="text-xs font-medium">Stats</span>
          </button>
        )}

        {/* Theme toggle switcher */}
        <ThemeToggle />
      </div>
    </div>
  );
};

export default TitleBar;


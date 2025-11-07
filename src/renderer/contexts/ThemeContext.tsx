import React, { createContext, useContext, useState, useEffect } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>(() => {
    // Load from localStorage with proper validation
    let saved: string | null = null;
    try {
      saved = localStorage.getItem('theme');
      console.log('Initial theme load from localStorage:', saved);
    } catch (error) {
      console.warn('Failed to read theme from localStorage:', error);
    }
    
    // Only accept 'light' or 'dark', default to 'light' otherwise
    const initialTheme: Theme = saved === 'dark' || saved === 'light' ? saved : 'light';
    console.log('Initial theme determined:', initialTheme);
    
    // Ensure we start with a clean slate - remove any existing theme classes
    if (typeof document !== 'undefined') {
      const root = document.documentElement;
      const beforeClasses = root.className;
      
      // Get all existing classes except theme classes
      const existingClasses = Array.from(root.classList).filter(
        (cls) => cls !== 'light' && cls !== 'dark'
      );
      
      // Set attribute directly
      root.setAttribute('class', [...existingClasses, initialTheme].join(' ').trim() || initialTheme);
      
      console.log('Initial DOM class application:', {
        before: beforeClasses,
        after: root.className,
        theme: initialTheme,
        allClasses: Array.from(root.classList),
      });
    }
    
    return initialTheme;
  });

  // Apply theme immediately on mount and whenever it changes
  useEffect(() => {
    if (typeof document !== 'undefined') {
      const root = document.documentElement;
      const currentClasses = root.className;
      
      // Get all existing classes except theme classes
      const existingClasses = Array.from(root.classList).filter(
        (cls) => cls !== 'light' && cls !== 'dark'
      );
      
      // Set attribute directly
      root.setAttribute('class', [...existingClasses, theme].join(' ').trim() || theme);
      
      console.log('useEffect theme update:', {
        theme,
        before: currentClasses,
        after: root.className,
        hasLight: root.classList.contains('light'),
        hasDark: root.classList.contains('dark'),
        allClasses: Array.from(root.classList),
      });
      
      // Save to localStorage
      try {
        localStorage.setItem('theme', theme);
        console.log('Saved theme to localStorage:', theme);
      } catch (error) {
        console.warn('Failed to save theme to localStorage:', error);
      }
    }
  }, [theme]);

  const toggleTheme = React.useCallback(() => {
    setTheme((prev) => {
      const newTheme = prev === 'light' ? 'dark' : 'light';
      console.log('=== THEME TOGGLE ===');
      console.log('Previous theme:', prev);
      console.log('New theme:', newTheme);
      
      // Immediately apply the theme to DOM (synchronous update)
      // This ensures the theme changes even if React batching delays the state update
      if (typeof document !== 'undefined') {
        const root = document.documentElement;
        const beforeClasses = root.className;
        
        // Get all existing classes except theme classes
        const existingClasses = Array.from(root.classList).filter(
          (cls) => cls !== 'light' && cls !== 'dark'
        );
        
        // Set attribute directly to ensure clean state
        root.setAttribute('class', [...existingClasses, newTheme].join(' ').trim() || newTheme);
        
        // Force a reflow to ensure CSS updates
        void root.offsetHeight;
        
        console.log('DOM update:', {
          before: beforeClasses,
          after: root.className,
          newTheme,
          hasLight: root.classList.contains('light'),
          hasDark: root.classList.contains('dark'),
          allClasses: Array.from(root.classList),
        });
      }
      
      return newTheme;
    });
  }, []); // Empty deps - we use prev from setState, so we don't need theme in deps

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};


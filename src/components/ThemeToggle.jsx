import React, { useState, useEffect } from 'react';
import { Moon, Sun } from 'lucide-react';

export const ThemeToggle = () => {
  const [theme, setTheme] = useState(() => {
    try {
      return localStorage.getItem('theme') || 'light';
    } catch {
      return 'light';
    }
  });

  useEffect(() => {
    try {
      document.documentElement.setAttribute('data-theme', theme);
      localStorage.setItem('theme', theme);
    } catch (e) {
      console.warn('Failed to update theme in localStorage:', e);
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === 'dark' ? 'light' : 'dark'));
  };

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs font-medium text-muted hover:text-text hover:bg-border/30 rounded transition-colors"
      title={theme === 'dark' ? 'Switch to Light mode' : 'Switch to Dark mode'}
      aria-label={theme === 'dark' ? 'Light mode' : 'Dark mode'}
    >
      {theme === 'dark' ? (
        <>
          <Sun className="h-3.5 w-3.5 text-amber-400 shrink-0" strokeWidth={1.5} />
          <span>Light mode</span>
        </>
      ) : (
        <>
          <Moon className="h-3.5 w-3.5 text-muted shrink-0" strokeWidth={1.5} />
          <span>Dark mode</span>
        </>
      )}
    </button>
  );
};

export default ThemeToggle;

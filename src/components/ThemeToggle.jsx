import React, { useState, useEffect } from 'react';
import { Moon, Sun } from 'lucide-react';

export const ThemeToggle = ({ collapsed = false }) => {
  const [theme, setTheme] = useState(() => {
    try {
      return (
        document.documentElement.getAttribute('data-theme') ||
        localStorage.getItem('theme') ||
        'light'
      );
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
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    document.documentElement.setAttribute('data-theme', nextTheme);
    try {
      localStorage.setItem('theme', nextTheme);
    } catch (e) {}
  };

  const isDark = theme === 'dark';

  // ---- Compact icon-only view when sidebar is collapsed ----
  // Rendered as a fixed-size square button so it can never overflow
  // the collapsed w-20 rail, and NO text/label is rendered at all.
  if (collapsed) {
    return (
      <button
        type="button"
        onClick={toggleTheme}
        className={`mx-auto flex items-center justify-center h-9 w-9 rounded-xl border transition-all duration-150 shadow-soft overflow-hidden shrink-0 ${
          isDark
            ? 'bg-emerald-950/40 text-amber-300 border-emerald-800/40 hover:bg-emerald-900/40'
            : 'bg-white text-slate-700 border-emerald-900/10 hover:bg-emerald-50/60'
        }`}
        title={isDark ? 'Switch to Light mode' : 'Switch to Dark mode'}
        aria-label={isDark ? 'Switch to Light mode' : 'Switch to Dark mode'}
      >
        {isDark ? (
          <Sun className="h-4 w-4 text-amber-400 shrink-0" strokeWidth={2} />
        ) : (
          <Moon className="h-4 w-4 text-slate-600 shrink-0" strokeWidth={2} />
        )}
      </button>
    );
  }

  // ---- Full view with label and switch (expanded sidebar / mobile drawer) ----
  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={`w-full flex items-center justify-between px-3 py-2 text-xs font-medium rounded-xl border transition-all duration-150 shadow-soft ${
        isDark
          ? 'bg-emerald-950/40 text-amber-300 border-emerald-800/40 hover:bg-emerald-900/40'
          : 'bg-white text-slate-700 border-emerald-900/10 hover:bg-emerald-50/60'
      }`}
      title={isDark ? 'Switch to Light mode' : 'Switch to Dark mode'}
      aria-label={isDark ? 'Switch to Light mode' : 'Switch to Dark mode'}
    >
      <span className="flex items-center gap-2">
        {isDark ? (
          <Sun className="h-4 w-4 text-amber-400 shrink-0" strokeWidth={2} />
        ) : (
          <Moon className="h-4 w-4 text-slate-600 shrink-0" strokeWidth={2} />
        )}
        <span className="font-semibold">{isDark ? 'Light mode' : 'Dark mode'}</span>
      </span>

      <span
        className={`inline-block w-8 h-4 rounded-full p-0.5 transition-colors ${
          isDark ? 'bg-amber-400' : 'bg-emerald-200'
        }`}
      >
        <span
          className={`block w-3 h-3 rounded-full bg-white shadow-soft transform transition-transform duration-150 ${
            isDark ? 'translate-x-4' : 'translate-x-0'
          }`}
        />
      </span>
    </button>
  );
};

export default ThemeToggle;
'use client';

import { useEffect, useState } from 'react';

export default function ThemeToggle() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    // Check local storage or system preference
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.setAttribute('data-theme', savedTheme);
    } else {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      setTheme(systemTheme);
      document.documentElement.setAttribute('data-theme', systemTheme);
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  return (
    <button
      onClick={toggleTheme}
      className="btn-icon"
      aria-label="Toggle Theme"
      title={theme === 'light' ? '다크 모드로 전환' : '라이트 모드로 전환'}
      style={{
        width: '40px',
        height: '40px',
        border: '1px solid var(--border-light)',
        cursor: 'pointer',
      }}
    >
      {theme === 'light' ? (
        // Moon Icon
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          style={{ width: '20px', height: '20px' }}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z"
          />
        </svg>
      ) : (
        // Sun Icon
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          style={{ width: '20px', height: '20px' }}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 3v2.25m0 13.5V21M9.75 15h.5M9.75 9h.5m4.75 6h.5M14.5 9h.5M3 12h2.25m13.5 0H21M5.75 5.75l1.586 1.586m10.428 10.428 1.586 1.586M5.75 18.25l1.586-1.586m10.428-10.428 1.586-1.586M12 7.5a4.5 4.5 0 1 0 0 9 4.5 4.5 0 0 0 0-9Z"
          />
        </svg>
      )}
    </button>
  );
}

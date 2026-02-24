/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        surface: {
          primary: '#0a0e14',
          secondary: '#111824',
          tertiary: '#1a2332',
          card: '#151b26',
        },
        border: {
          DEFAULT: '#1d2a3a',
          hover: '#2a3a4f',
        },
        content: {
          primary: '#e8eef6',
          secondary: '#a8b3c4',
          tertiary: '#6b7a8f',
        },
        accent: {
          DEFAULT: '#3b82f6',
          hover: '#2563eb',
          light: '#60a5fa',
        },
        severity: {
          critical: '#dc2626',
          high: '#ea580c',
          medium: '#f59e0b',
          low: '#3b82f6',
          info: '#6b7280',
        },
        status: {
          success: '#10b981',
          warning: '#f59e0b',
          danger: '#ef4444',
          info: '#06b6d4',
        },
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
      },
      boxShadow: {
        'soft': '0 1px 3px rgba(0, 0, 0, 0.08)',
        'medium': '0 4px 6px rgba(0, 0, 0, 0.1)',
        'prominent': '0 10px 25px rgba(0, 0, 0, 0.12)',
      },
      borderRadius: {
        '2xl': '0.875rem',
      },
      fontFamily: {
            inter: ['Inter', 'sans-serif'],
    },
    },
  },
  plugins: [],
};

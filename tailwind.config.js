/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        /* ─── Sentinel Amber Design System ─── */
        surface: {
          DEFAULT: '#fef9ee',
          dim: '#dfd9d0',
          bright: '#fef9ee',
          container: {
            DEFAULT: '#f3ede3',
            low: '#f9f3e9',
            lowest: '#ffffff',
            high: '#ede8dd',
            highest: '#e7e2d8',
          },
        },
        ink: '#1a1814',
        'on-surface': '#1d1c16',
        'on-surface-variant': '#4a463f',
        outline: '#7b766e',
        'outline-variant': '#ccc6bc',
        accent: '#d97706',
        'accent-container': '#ffdcc3',
        fraud: '#ba1a1a',
        'fraud-container': '#ffdad6',
        safe: '#16a34a',
        'safe-container': '#7ffc97',
        warning: '#904d00',
        /* Legacy compat aliases */
        dark: {
          bg: '#fef9ee',
          card: '#ffffff',
          border: '#e7e2d8',
          hover: '#f3ede3',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Manrope', 'Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        card: '12px',
      },
      boxShadow: {
        ambient: '0 12px 32px -4px rgba(29,28,22,0.06)',
        'ambient-lg': '0 16px 48px -8px rgba(29,28,22,0.08)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'pulse-slow': 'pulse 3s infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}

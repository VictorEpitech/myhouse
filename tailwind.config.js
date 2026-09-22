/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        timelord: {
          light: '#70b5ff',
          DEFAULT: '#4da3ff',
          dark: '#1e40af',
          bg: '#0b1622'
        },
        gatekeeper: {
          light: '#c084fc',
          DEFAULT: '#a855f7',
          dark: '#6b21a8',
          accent: '#fb923c',
          bg: '#160b22'
        },
        codecrafter: {
          light: '#bef264',
          DEFAULT: '#a3e635',
          dark: '#4d7c0f',
          accent: '#facc15',
          bg: '#10180a'
        },
        oracle: {
          light: '#f87171',
          DEFAULT: '#ff5a5a',
          dark: '#991b1b',
          accent: '#ef4444',
          bg: '#140707'
        }
      },
      animation: {
        'pulse-glow': 'pulseGlow 2.5s infinite ease-in-out',
        'float': 'float 4s ease-in-out infinite',
        'scanline': 'scanline 6s linear infinite',
      },
      keyframes: {
        pulseGlow: {
          '0%, 100%': { opacity: 0.7, transform: 'scale(1)' },
          '50%': { opacity: 1, transform: 'scale(1.03)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        scanline: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(1000%)' },
        }
      }
    },
  },
  plugins: [],
}

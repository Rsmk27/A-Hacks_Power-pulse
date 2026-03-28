/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Space Grotesk', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      colors: {
        accent: '#FF4500',
        safe: '#00FF94',
        warn: '#FF8C00',
        danger: '#FF1744',
        bg: '#0a0a0a',
        card: '#111111',
      },
      animation: {
        'pulse-slow': 'pulse 3s ease-in-out infinite',
        'pulse-border': 'pulse-border 2s infinite',
      },
      keyframes: {
        'pulse-border': {
          '0%': { boxShadow: '0 0 0 0 rgba(239, 68, 68, 0.4)' },
          '70%': { boxShadow: '0 0 0 10px rgba(239, 68, 68, 0)' },
          '100%': { boxShadow: '0 0 0 0 rgba(239, 68, 68, 0)' },
        },
      },
    },
  },
  plugins: [],
}

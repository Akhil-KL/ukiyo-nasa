/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        cosmic: {
          purple: '#8B5CF6',
          deep: '#000000',
          star: '#FFFFFF',
          dark: '#000000',
          accent: '#06B6D4',
          secondary: '#3B82F6',
          darker: '#000000',
          void: '#000000',
          glow: '#00F5FF',
          nebula: '#1E1B4B',
        },
        gradient: {
          cyan: {
            100: '#ECFEFF',
            200: '#CFFAFE',
            300: '#A5F3FC',
            400: '#67E8F9',
            500: '#22D3EE',
            600: '#0891B2',
            700: '#0E7490',
            800: '#155E75',
          },
          blue: {
            100: '#DBEAFE',
            200: '#BFDBFE',
            300: '#93C5FD',
            400: '#60A5FA',
            500: '#3B82F6',
            600: '#2563EB',
            700: '#1D4ED8',
            800: '#1E3A8A',
          },
          purple: {
            100: '#E6B3FF',
            200: '#CC66FF',
            300: '#B319FF',
            400: '#8B5CF6',
            500: '#7C3AED',
            600: '#6D28D9',
            700: '#5B21B6',
            800: '#4C1D95',
          }
        },
        space: {
          100: '#FFFFFF',
          200: '#F0F0F0',
          300: '#E0E0E0',
          400: '#C0C0C0',
          500: '#A0A0A0',
          600: '#808080',
          700: '#606060',
          800: '#404040',
          900: '#202020',
          950: '#000000',
        },
        dark: {
          100: '#1E293B',
          200: '#0F172A',
          300: '#020617',
          400: '#000000',
          500: '#000000',
        }
      },
      fontFamily: {
        sans: ['Space Grotesk', 'Exo 2', 'ui-sans-serif', 'system-ui'],
        display: ['Orbitron', 'Space Grotesk', 'ui-sans-serif', 'system-ui'],
        body: ['Space Grotesk', 'Exo 2', 'ui-sans-serif', 'system-ui'],
        mono: ['JetBrains Mono', 'ui-monospace', 'monospace'],
        nasa: ['Orbitron', 'monospace'],
        space: ['Space Grotesk', 'sans-serif'],
        future: ['Exo 2', 'sans-serif'],
      },
      screens: {
        'xs': '320px',
        'sm': '640px',
        'md': '768px',
        'lg': '1024px',
        'xl': '1280px',
        '2xl': '1536px',
        '3xl': '1920px',
        '4xl': '2560px',
      },
      maxWidth: {
        'content': '1400px',
        'readable': '75ch',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
        'twinkle': 'twinkle 4s ease-in-out infinite alternate',
        'drift': 'drift 20s linear infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        twinkle: {
          '0%': { opacity: '0.2' },
          '100%': { opacity: '0.8' },
        },
        drift: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100vw)' },
        }
      }
    },
  },
  plugins: [],
}
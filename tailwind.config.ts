import type { Config } from 'tailwindcss'
import typography from '@tailwindcss/typography'
import forms from '@tailwindcss/forms'

export default {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}'
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f5fbff',
          100: '#e6f4ff',
          200: '#cce9ff',
          300: '#99d4ff',
          400: '#66bfff',
          500: '#339aff',
          600: '#1f7ae6',
          700: '#165db3',
          800: '#114580',
          900: '#0d3159'
        }
      }
    }
  },
  plugins: [typography, forms]
} satisfies Config

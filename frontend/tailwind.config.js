/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        dark: {
          900: '#0B0F19', // Main background deep obsidian
          850: '#111827', // Card surface
          800: '#161F33', // Elevated card / border
          700: '#1F2942', // Interactive hover
          600: '#334155'
        },
        nova: {
          50: '#F5F7FF',
          100: '#EBF0FE',
          400: '#60A5FA',
          500: '#3B82F6', // Blue primary
          600: '#2563EB',
          accent: '#F59E0B', // Golden Nova coin accent
          accentLight: '#FBBF24'
        },
        usdt: '#26A17B' // Tether emerald green
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif']
      }
    },
  },
  plugins: [],
}


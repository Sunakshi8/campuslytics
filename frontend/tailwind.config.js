/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#fef3ee',
          100: '#fde3d3',
          200: '#fac4a6',
          300: '#f69d6e',
          400: '#f17842',
          500: '#e85d25',
          600: '#d9481a',
          700: '#b43718',
          800: '#8f2d19',
          900: '#742818',
        },
        ink: {
          900: '#14161a',
          800: '#1c1f26',
          700: '#262a33',
        },
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 2px rgba(16,24,40,0.06), 0 1px 3px rgba(16,24,40,0.08)',
      },
    },
  },
  plugins: [],
};

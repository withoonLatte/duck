/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        forest: {
          950: '#041B12',
          900: '#072E20',
          800: '#0C3B2E',
          700: '#144F3F',
          600: '#1C6652',
          100: '#E1F4EE',
          50: '#F0F9F5',
        },
        terracotta: {
          900: '#7C2D12',
          800: '#9A3412',
          700: '#C2410C',
          600: '#D9531E',
          500: '#EA580C',
          100: '#FFEDD5',
          50: '#FFF7ED',
        },
        limeacc: {
          600: '#65A30D',
          500: '#84CC16',
          400: '#A3E635',
          300: '#BEF264',
          100: '#ECFCCB',
        },
        cream: {
          50: '#FAF9F6',
          100: '#F4F1EA',
          200: '#E8E3D7',
        }
      },
      borderRadius: {
        '3xl': '1.5rem',
        '4xl': '2rem',
      },
      fontFamily: {
        sans: ['"LINE Seed Sans TH"', 'Prompt', 'Kanit', '"IBM Plex Sans Thai"', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
      }
    },
  },
  plugins: [],
}

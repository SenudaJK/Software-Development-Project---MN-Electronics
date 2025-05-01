/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#0052CC',
          dark: '#004099',
          light: '#4C9AFF'
        },
        secondary: '#FFFFFF',
        accent: {
          DEFAULT: '#FF5630',
          dark: '#DE350B',
          light: '#FF8F73'
        },
        success: {
          DEFAULT: '#36B37E',
          dark: '#006644',
          light: '#79F2C0'
        },
        warning: {
          DEFAULT: '#FFAB00',
          dark: '#FF8B00',
          light: '#FFE380'
        },
        error: {
          DEFAULT: '#FF5630',
          dark: '#DE350B',
          light: '#FF8F73'
        },
        text: {
          DEFAULT: '#172B4D',
          secondary: '#6B778C',
          light: '#97A0AF'
        },
        background: '#F4F5F7'
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        heading: ['Poppins', 'sans-serif']
      },
      boxShadow: {
        'sm': '0 1px 3px rgba(0,0,0,0.05), 0 1px 2px rgba(0,0,0,0.1)',
        'md': '0 4px 6px -1px rgba(0,0,0,0.05), 0 2px 4px -1px rgba(0,0,0,0.1)',
        'lg': '0 10px 15px -3px rgba(0,0,0,0.05), 0 4px 6px -2px rgba(0,0,0,0.1)'
      }
    },
  },
  plugins: [],
};
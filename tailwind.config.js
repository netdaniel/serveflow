/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f9fa',
          100: '#d9f0f2',
          200: '#b3e0e6',
          300: '#8cc9d1',
          400: '#66a8b3',
          500: '#1a5f6e',
          600: '#15525f',
          700: '#11454f',
          800: '#0d3840',
          900: '#092a30',
        },
        coral: {
          50: '#fdf2f0',
          100: '#f9e0db',
          200: '#f5c4ba',
          300: '#eca393',
          400: '#e86a56',
          500: '#d55a47',
          600: '#b84a3a',
          700: '#9b3d2f',
          800: '#7e3126',
          900: '#61251d',
        },
        navy: {
          50: '#f2f4f6',
          100: '#d9dde2',
          200: '#b3bcc5',
          300: '#8d9aa8',
          400: '#67788b',
          500: '#1a2a3a',
          600: '#162432',
          700: '#121e29',
          800: '#0e1821',
          900: '#0a1218',
        }
      }
    },
  },
  plugins: [],
}

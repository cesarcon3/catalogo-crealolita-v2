/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        cream: {
          100: '#FFF8E1',
          200: '#FAF3E0',
          300: '#F5F5DC',
        },
        gold: {
          light: '#E5C547',
          DEFAULT: '#D4AF37',
          dark: '#B8941F',
        },
        brand: {
          text: '#3D3D3D',
          muted: '#6B6B6B',
          border: '#E8D7C3'
        }
      },
      fontFamily: {
        serif: ['Georgia', 'Times New Roman', 'serif'],
        sans: ['system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
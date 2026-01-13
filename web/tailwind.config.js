/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Primary Backgrounds
        'pearl-white': '#FAFAFA',
        'snow': '#FFFFFF',
        'warm-ivory': '#F5F3F0',
        'mist': '#E8E6E3',
        'cream': '#F0EDE8',

        // Text Colors
        'charcoal': '#1A1A1A',
        'slate': '#4A4A4A',
        'stone': '#6B6B6B',
        'pebble': '#9B9B9B',

        // Brand Accents
        'sage': {
          DEFAULT: '#5B8C7D',
          light: '#7BA696',
          dark: '#4A7366',
        },
        'terracotta': {
          DEFAULT: '#C27B5F',
          light: '#D4937A',
        },

        // Supporting
        'sky-blue': '#B8D4E8',

        // Keep Strava orange for OAuth context
        'strava-orange': '#FC4C02',
      },
      fontFamily: {
        'display': ['Outfit', 'system-ui', 'sans-serif'],
        'body': ['Inter', 'SF Pro Text', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        'display-xl': ['4.5rem', { lineHeight: '1.1', letterSpacing: '-0.02em' }],
        'display-lg': ['3.5rem', { lineHeight: '1.1', letterSpacing: '-0.02em' }],
        'display-md': ['2.5rem', { lineHeight: '1.15', letterSpacing: '-0.01em' }],
        'body-lg': ['1.125rem', { lineHeight: '1.7' }],
      },
      spacing: {
        '18': '4.5rem',
        '22': '5.5rem',
        '26': '6.5rem',
        '30': '7.5rem',
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
      },
      boxShadow: {
        'soft': '0 4px 20px rgba(0, 0, 0, 0.05)',
        'medium': '0 10px 40px rgba(0, 0, 0, 0.08)',
        'sage': '0 10px 40px rgba(91, 140, 125, 0.15)',
      },
      animation: {
        'fade-in': 'fade-in 0.6s ease-out forwards',
        'fade-in-up': 'fade-in-up 0.6s ease-out forwards',
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'fade-in-up': {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}

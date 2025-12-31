const designSystem = require('@pepo/config');

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#FFF9E6',
          100: '#FFF3CC',
          200: '#FFE799',
          300: '#FFDB66',
          400: '#FFD15C',
          500: '#F4B400',
          600: '#E6A800',
          700: '#CC9600',
          800: '#B38400',
          900: '#996F00',
        },
        secondary: {
          50: '#E6F7EE',
          100: '#CCEFDD',
          200: '#99DFBB',
          300: '#66CF99',
          400: '#8AD4AE',
          500: '#6BBF8E',
          600: '#5AAC7D',
          700: '#4A996C',
          800: '#39865B',
          900: '#29734A',
        },
        neutral: designSystem.colors.neutral,
        background: designSystem.colors.background,
        info: designSystem.colors.info,
        warning: designSystem.colors.warning,
      },
      fontFamily: {
        sans: ['Poppins', 'system-ui', 'sans-serif'],
        display: ['Nunito', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        'sm': designSystem.borderRadius.small,
        'md': designSystem.borderRadius.medium,
        'lg': designSystem.borderRadius.large,
        'btn': designSystem.borderRadius.button,
      },
      boxShadow: {
        'soft': designSystem.shadows.soft,
        'medium': designSystem.shadows.medium,
        'card': designSystem.shadows.card,
      },
    },
  },
  plugins: [],
};


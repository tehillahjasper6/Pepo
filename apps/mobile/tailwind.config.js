const designSystem = require('@pepo/config');

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,jsx,ts,tsx}', './components/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: designSystem.colors.primary,
        secondary: designSystem.colors.secondary,
        neutral: designSystem.colors.neutral,
        background: designSystem.colors.background,
        info: designSystem.colors.info,
        warning: designSystem.colors.warning,
      },
    },
  },
  plugins: [],
};




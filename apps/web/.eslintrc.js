module.exports = {
  root: true,
  env: { browser: true, es2021: true, node: true },
  extends: ['next', 'next/core-web-vitals', 'eslint:recommended', 'plugin:@typescript-eslint/recommended'],
  parser: '@typescript-eslint/parser',
  parserOptions: { ecmaVersion: 2021, sourceType: 'module' },
  plugins: ['@typescript-eslint'],
  rules: { 'no-console': 'warn' },
};

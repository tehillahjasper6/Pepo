import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname),
      'lucide-react': path.resolve(__dirname, 'node_modules/lucide-react/index.js'),
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
  },
});

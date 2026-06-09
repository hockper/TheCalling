import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/vitest.setup.ts'],
    exclude: [
      '**/node_modules/**',
      '**/tests/e2e/**',
      '**/dist/**',
      '**/.next/**',
    ],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json-summary', 'html'],
      exclude: [
        'node_modules/**',
        'src/services/api/**',
        'src/vitest.setup.ts',
        'vitest.config.ts',
        'next.config.js',
        'postcss.config.js',
        'tailwind.config.js',
        '**/*.d.ts',
        '**/*.test.tsx',
        '**/*.test.ts',
        '**/*.spec.ts',
      ],
    },
  },
});

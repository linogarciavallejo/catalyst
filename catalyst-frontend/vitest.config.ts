import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react-swc';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    include: ['src/**/*.test.{ts,tsx}'],
    exclude: ['node_modules', 'dist'],
    testTimeout: 10000,
    hookTimeout: 10000,
    teardownTimeout: 10000,
    isolate: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'vitest.setup.ts',
        'playwright.config.ts',
        'vite.config.ts',
        'eslint.config.js',
        'coverage/**',
        'e2e/**',
        'src/services/**',
        'src/context/**',
        'src/components/features/**',
        'src/components/forms/**',
        'src/components/ui/**',
        'src/components/Layout/Sidebar.tsx',
        'src/hooks/**',
        'src/theme/**',
        'src/types/**',
        'src/utils/index.ts',
        'src/App.tsx',
        'src/main.tsx',
        'src/router.tsx',
        'src/pages/ChatPage.tsx',
        'src/pages/CreateEditIdeaPage.tsx',
        'src/pages/IdeaDetailPage.tsx',
        'src/pages/IdeasBrowsingPage.tsx',
        'src/pages/NotFoundPage.tsx',
        'src/pages/NotificationsPage.tsx',
        'src/pages/SettingsPage.tsx',
        'src/pages/UserProfilePage.tsx',
      ],
    },
  },
});

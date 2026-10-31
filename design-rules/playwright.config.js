import { defineConfig, devices } from '@playwright/test';

const PORT = 8099;

export default defineConfig({
  testDir: './rendered',
  outputDir: '../.design-report/results',
  reporter: [['list'], ['html', { outputFolder: '../.design-report/html', open: 'never' }]],
  fullyParallel: true,
  // The first page load waits for Metro to bundle the app.
  timeout: 120_000,
  use: { baseURL: `http://localhost:${PORT}` },
  // One project per M3 window size class to check.
  projects: [
    { name: 'compact', use: { ...devices['Desktop Chrome'], viewport: { width: 412, height: 915 } } },
    { name: 'expanded', use: { ...devices['Desktop Chrome'], viewport: { width: 1280, height: 800 } } },
  ],
  // The app through react-native-web (Expo's web target), in development mode
  // so design-rules/babel-plugin-source.cjs tags every element with its source.
  webServer: {
    command: `npx expo start --web --port ${PORT}`,
    cwd: '..',
    port: PORT,
    env: { BROWSER: 'none' },
    timeout: 180_000,
    reuseExistingServer: true,
  },
});

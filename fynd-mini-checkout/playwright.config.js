// @ts-check
const { defineConfig, devices } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './tests',
  fullyParallel: false, // Run deterministically
  forbidOnly: !!process.env.CI,
  retries: 0, // Retries 0 locally so flakiness is not hidden
  workers: 1, // Order-independent, clean isolated runs
  reporter: [
    ['list'],
    ['html', { outputFolder: 'playwright-report', open: 'never' }]
  ],
  outputDir: './test-results/artifacts', // Isolate execution artifacts from manual evidence

  use: {
    baseURL: 'http://localhost:4173',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'off'
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] }
    }
  ],

  webServer: {
    command: 'npm run start',
    url: 'http://localhost:4173',
    reuseExistingServer: !process.env.CI,
    timeout: 30000
  }
});

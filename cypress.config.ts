import { defineConfig } from 'cypress';

export default defineConfig({
  projectId: 'jitps9',
  defaultCommandTimeout: 10000,
  viewportWidth: 1000,
  viewportHeight: 1300,
  modifyObstructiveCode: false,
  chromeWebSecurity: false,
  retries: {
    runMode: 2,
    openMode: 0,
  },
  commands: {
    supportFile: 'webapp/cypress/commands.js',
  },
  e2e: {
    baseUrl: process.env.BASE_URL || 'http://localhost:3000',
    specPattern: 'webapp/cypress/e2e/**/*.{js,jsx,ts,tsx}',
    fixturesFolder: "webapp/cypress/fixtures",
    downloadsFolder: "webapp/cypress/downloads",
    screenshotsFolder: "webapp/cypress/screenshots",
    videosFolder: "webapp/cypress/videos",
    supportFile: "webapp/cypress/support/e2e.js"
  },
});

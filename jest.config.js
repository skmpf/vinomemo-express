module.exports = {
  testEnvironment: "node",
  testMatch: ["**/__tests__/**/*.test.ts"],
  preset: "ts-jest",
  globalSetup: "<rootDir>/__tests__/db/globalSetup.ts",
  globalTeardown: "<rootDir>/__tests__/db/globalTeardown.ts",
  setupFilesAfterEnv: ["<rootDir>/__tests__/db/setupFile.ts"],
};

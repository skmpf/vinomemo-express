module.exports = {
  testEnvironment: "node",
  testMatch: ["**/__tests__/**/*.test.ts"],
  preset: "ts-jest",
  globalSetup: "<rootDir>src/__tests__/db/globalSetup.ts",
  globalTeardown: "<rootDir>src/__tests__/db/globalTeardown.ts",
  setupFilesAfterEnv: ["<rootDir>src/__tests__/db/setupFile.ts"],
};

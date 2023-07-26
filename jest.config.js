module.exports = {
  testEnvironment: "node",
  testMatch: ["**/__tests__/**/*.test.ts"],
  preset: "ts-jest",
  globalSetup: "./__tests__/db/globalSetup.ts",
  globalTeardown: "./__tests__/db/globalTeardown.ts",
  setupFilesAfterEnv: ["./__tests__/db/setupFile.ts"],
};

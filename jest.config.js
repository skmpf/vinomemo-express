const path = require("path");

module.exports = {
  testEnvironment: "node",
  testMatch: ["**/__tests__/**/*.test.ts"],
  preset: "ts-jest",
  globalSetup: path.resolve(__dirname, "./__tests__/db/globalSetup.ts"),
  globalTeardown: path.resolve(__dirname, "./__tests__/db/globalTeardown.ts"),
  setupFilesAfterEnv: [path.resolve(__dirname, "./__tests__/db/setupFile.ts")],
};

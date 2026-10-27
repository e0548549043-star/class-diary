import { defineConfig } from "vitest/config";

// הבדיקות רצות מול מסד נתונים נפרד (לא מסד הפיתוח!) כי הן מוחקות נתונים
const testDatabaseUrl =
  process.env.TEST_DATABASE_URL ?? "postgresql://postgres:postgres@localhost:5432/class_diary_test?schema=public";

export default defineConfig({
  test: {
    globalSetup: ["./tests/globalSetup.ts"],
    fileParallelism: false,
    testTimeout: 20000,
    hookTimeout: 30000,
    env: {
      NODE_ENV: "test",
      DATABASE_URL: testDatabaseUrl,
      JWT_SECRET: "test-secret-for-automated-tests-only-0123456789",
      JWT_EXPIRES_IN: "1h",
      CORS_ORIGIN: "*",
      LOGIN_RATE_LIMIT: "1000",
    },
  },
});

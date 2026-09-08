import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    setupFiles: ["./src/test/setup.ts"],
    include: ["src/**/*.test.ts"],
    env: {
      NODE_ENV: "test",
      MONGODB_URI: "mongodb://127.0.0.1:27017/ecommercex-test",
      JWT_SECRET: "test-jwt-secret-key",
      JWT_EXPIRES_IN: "1h",
      CORS_ORIGIN: "http://localhost:3000",
    },
  },
});

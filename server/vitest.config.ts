import { defineConfig } from "vitest/config";

export default defineConfig({
    test: {
        globals: true,
        environment: "node",
        include: ["src/**/*.test.ts"],
        setupFiles: ["src/test/setup.ts"],
        testTimeout: 10_000,
        coverage: {
            provider: "v8",
            include: ["src/features/**/*.ts"],
            exclude: ["src/features/**/*.test.ts", "src/generated/**"]
        }
    }
});
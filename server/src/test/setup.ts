import { vi } from "vitest";

// Silence pino logs during tests
vi.mock("../lib/logger.js", () => ({
    default: {
        info: vi.fn(),
        error: vi.fn(),
        warn: vi.fn(),
        debug: vi.fn(),
        fatal: vi.fn(),
        child: vi.fn().mockReturnValue({
            info: vi.fn(),
            error: vi.fn(),
            warn: vi.fn(),
            debug: vi.fn(),
            fatal: vi.fn(),
        }),
    },
}));

// Silence pino-http request logger
vi.mock("../middleware/request-logger.js", () => ({
    requestLogger: (
        req: any,
        res: any,
        next: () => void,
    ) => {
        // Attach a no-op logger to req.log so error-handler doesn't crash
        req.log = {
            info: vi.fn(),
            error: vi.fn(),
            warn: vi.fn(),
            debug: vi.fn(),
            fatal: vi.fn(),
        };
        next();
    },
}));
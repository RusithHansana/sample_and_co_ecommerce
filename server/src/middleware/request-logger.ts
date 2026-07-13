import { pinoHttp } from "pino-http";
import { randomUUID } from "node:crypto";

import logger from "../lib/logger.js";

export const requestLogger = pinoHttp({
    logger,
    genReqId: (req, res) => {
        const existingId = req.headers["X-Request-Id"];

        if (existingId) return existingId as string;

        const id = randomUUID();

        res.setHeader("X-Request-Id", id);

        return id;
    }
});
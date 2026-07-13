import { pinoHttp } from "pino-http";
import { randomUUID } from "node:crypto";

import logger from "../lib/logger.js";

export const requestLogger = pinoHttp({
    logger,
    genReqId: (req, res) => {
        const existingId = req.headers["x-request-id"];

        if (existingId) return existingId as string;

        const id = randomUUID();

        res.setHeader("x-request-id", id);

        return id;
    }
});
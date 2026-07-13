import app from "./app.js";
import { config } from "./config/index.js";
import logger from "./lib/logger.js";

const server = app.listen(config.PORT,() => {
    logger.info(`Server is running on port:${config.PORT} `)
});

server.on("error", (err: NodeJS.ErrnoException) => {
    if (err.code === "EADDRINUSE") {
        logger.error(`Port ${config.PORT} is already in use.`);
    } else if (err.code === "EACCES") {
        logger.error(`Port ${config.PORT} requires elevated privileges.`);
    } else {
        logger.error({ err }, "Server failed to start.");
    }

    process.exit(1);
});
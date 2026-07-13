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

// Gracefully shutting down server
// with 10s of grace period for any unfinished requests to complete
// triggers when "SIGTERM" and "SIGINT"
function gracefulShutDown(signal: string) {
    logger.info(`Receieved ${signal}. Server is shutting down...`);

    server.close(async (err)=> {
        if (err){
            logger.error({err}, "Error during shutting down");
            process.exit(1);
        }

        logger.info("Server shutdown complete");

        // TODO: Close database connection pool here once a DB client is added
        // e.g. await db.end() / await pool.end() / await prisma.$disconnect()
        // Ensures no in-flight queries are abandoned and connections are
        // released cleanly back to Postgres before the process exits.

        logger.info("Cleanup Complete. Exiting process...");
        process.exit(0);
    });

    // grace period of 10s if the server hangs.
    setTimeout(() =>{
        logger.error("Forced shutdown.");
        process.exit(1);
    }, 10_000).unref(); // unref() tells node to allow the process to exit earlier if the server shutdown normally. if not this timeout will be triggered
}

process.on("SIGTERM", () => gracefulShutDown("SIGTERM"));
process.on("SIGINT", () => gracefulShutDown("SIGINT"));

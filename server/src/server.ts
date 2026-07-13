import app from "./app.js";
import { config } from "./config/index.js";
import logger from "./lib/logger.js";

app.listen(config.PORT,() => {
    logger.info(`Server is running on port:${config.PORT} `)
});
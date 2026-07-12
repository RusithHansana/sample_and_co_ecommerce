import express, { type Express, type Request, type Response, type NextFunction } from "express";
import helmet from "helmet";
import cors from "cors";


import { config } from "./config/index.ts";
import logger from "./lib/logger.ts";
import { requestLogger } from "./middleware/request-logger.ts";
import { errorHandler } from "./middleware/error-handler.ts";
import { notFoundHandler } from "./middleware/not-found-handler.ts";

const app: Express = express();

app.use(helmet());
app.use(cors({ origin: config.ALLOWED_ORIGIN, credentials: true}));
app.use(requestLogger);
 
app.get('/api/health', (req: Request, res: Response) => {
    res.send({data: {status: "ok"}});
});

app.use(notFoundHandler);
app.use(errorHandler);

app.listen(config.PORT, () => {
    logger.info(`The Server is running on port: ${config.PORT}`);
});

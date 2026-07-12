import express, { type Express, type Request, type Response, type NextFunction } from "express";
import helmet from "helmet";
import cors from "cors";


import { config } from "./config/index.ts";
import logger from "./lib/logger.ts";
import { requestLogger } from "./middleware/request-logger.ts";
import { errorHandler } from "./middleware/error-handler.ts";
import { notFoundHandler } from "./middleware/not-found-handler.ts";

const app: Express = express();

app.use(requestLogger);
app.use(helmet());
app.use(cors({ origin: config.ALLOWED_ORIGIN, credentials: true}));
app.use(express.json());
app.use(express.urlencoded());
 
app.get('/api/health', (req: Request, res: Response) => {
    res.send({data: {status: "ok"}});
});

app.use("/api/auth", express.Router());
app.use("/api/products", express.Router());
app.use("/api/cart", express.Router());
app.use("/api/checkout", express.Router());
app.use("/api/orders", express.Router());
app.use("/api/reviews", express.Router());
app.use("/api/admin", express.Router())

app.use(notFoundHandler);
app.use(errorHandler);

export default app;

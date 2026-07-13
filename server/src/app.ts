import express, { type Express, type Request, type Response, type NextFunction } from "express";
import helmet from "helmet";
import cors from "cors";


import { config } from "./config/index.js";
import { requestLogger } from "./middleware/request-logger.js";
import { errorHandler } from "./middleware/error-handler.js";
import { notFoundHandler } from "./middleware/not-found-handler.js";
import { limiter } from "./middleware/rate-limiter.js";

const app: Express = express();
app.use("/api/auth", express.Router());
app.use("/api/products", express.Router());
app.use("/api/cart", express.Router());
app.use("/api/checkout", express.Router());
app.use("/api/orders", express.Router());
app.use("/api/reviews", express.Router());
app.use("/api/admin", express.Router())
app.use(requestLogger);
app.use(helmet());
app.use(cors({ origin: config.ALLOWED_ORIGIN, credentials: true}));
app.use(express.json());
app.use(express.urlencoded({ extended: true}));
 
app.get('/api/health', (req: Request, res: Response) => {
    res.send({data: {status: "ok"}});
});

app.use("/api/auth",limiter, express.Router());
app.use("/api/products", express.Router());
app.use("/api/cart", express.Router());
app.use("/api/checkout", express.Router());
app.use("/api/orders", express.Router());
app.use("/api/reviews", express.Router());
app.use("/api/admin", express.Router())

app.use(notFoundHandler);
app.use(errorHandler);

export default app;

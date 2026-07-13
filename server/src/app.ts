import express, { type Express, type Request, type Response } from "express";
import helmet from "helmet";
import cors from "cors";


import { config } from "./config/index.js";
import { requestLogger } from "./middleware/request-logger.js";
import { errorHandler } from "./middleware/error-handler.js";
import { notFoundHandler } from "./middleware/not-found-handler.js";
import { limiter } from "./middleware/rate-limiter.js";
import { ForbiddenError } from "./types/app-error.ts";

import type { ApiSuccessResponse } from "./types/api-response.ts";

const app: Express = express();

// for getting the actual ip coming from "X-Forwarded-For" when using a reverse proxy.
app.set("trust proxy", 1);

app.use(requestLogger);
app.use(helmet());

app.use(cors({ 
    origin: (origin, callback) => {
        if(!origin || config.ALLOWED_ORIGIN.includes(origin)){
            return callback(null, true);
        }

        return callback(new ForbiddenError(`Origin: ${origin} is not allowed by CORS`))
    }, 
    credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true}));
 
app.get("/api/health", (req: Request, res: Response) => {
    const body: ApiSuccessResponse<{status: string}> = { data: { status: "ok"} };
    res.status(200).json(body);
});

app.use("/api/auth",limiter, express.Router());
app.use("/api/products", express.Router());
app.use("/api/cart", express.Router());
app.use("/api/checkout", express.Router());
app.use("/api/orders", express.Router());
app.use("/api/reviews", express.Router());
app.use("/api/admin", express.Router());

app.use(notFoundHandler);
app.use(errorHandler);

export default app;

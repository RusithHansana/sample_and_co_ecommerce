import express, { type Express, type Request, type Response, type NextFunction } from "express";

import { config } from "./config/index.ts";

const app: Express = express();
 
app.get('/api/health', (req: Request, res: Response) => {
    res.send({data: {status: "ok"}});
});

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    if (res.headersSent) {
        return next(err);
    }
    
    console.error(err);
    res.status(500).send({ error: { message: err.message}});
});

app.listen(config.PORT, () => {
    console.log(`server is running on port: ${config.PORT}`);
});

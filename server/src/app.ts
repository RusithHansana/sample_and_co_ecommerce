import express, { type Express, type Request, type Response, type NextFunction } from "express"

const app: Express = express();
const PORT = process.env.PORT ? Number(process.env.PORT) : 3000;

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

app.listen(PORT, () => {
    console.log(`server is running on port: ${PORT}`);
});

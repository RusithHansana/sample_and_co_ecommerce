import { PrismaClient } from "../generated/prisma/client.js";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { config } from "../config/index.js";
import logger from "./logger.js";

export const pool = new Pool({
    connectionString: config.DATABASE_URL,
});

pool.on("error", (err) => {
    logger.error(`Unexpected error occurred on idle client: ${err}`);
});

const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({ adapter });

export default prisma;
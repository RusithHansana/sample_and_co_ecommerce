import { PrismaClient } from "../src/generated/prisma/client.js";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { config } from "../src/config/index.js";
import logger from "../src/lib/logger.js";

const pool = new Pool({
    connectionString: config.DATABASE_URL
});

pool.on("error", (err) => {
    logger.error(`Unexpected error occurred on idle client: ${err}`);
});

const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({ adapter });

async function main() {
    // Seed data will be added in Epic 4 (Story 4.1)
    // - ADMIN user account (credentials from env vars)
    // - Demo products with variants, categories, images
    logger.info("Seed script placeholder — no data to seed yet.");
}

main()
    .catch((e) => {
        logger.error(`Seed failed with error: ${e}`);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
        await pool.end();
    });
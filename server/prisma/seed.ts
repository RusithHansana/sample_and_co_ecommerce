import { PrismaClient } from "../src/generated/prisma/client.js";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import bcrypt from "bcryptjs";
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

const SEED_PRODUCTS = [
    {
        name: "Classic Crew Tee",
        description:
            "A premium heavyweight crew-neck tee built for everyday wear. Pre-shrunk cotton with a relaxed fit that only gets better with time.",
        category: "T-Shirts",
        images: [
            "https://res.cloudinary.com/demo/image/upload/v1/sample-co/classic-crew-tee-1.jpg",
            "https://res.cloudinary.com/demo/image/upload/v1/sample-co/classic-crew-tee-2.jpg",
            "https://res.cloudinary.com/demo/image/upload/v1/sample-co/classic-crew-tee-3.jpg",
        ],
        variants: [
            { attributes: { size: "S", color: "Black" }, price: 24.99, stock: 20 },
            { attributes: { size: "M", color: "Black" }, price: 24.99, stock: 15 },
            { attributes: { size: "L", color: "Black" }, price: 26.99, stock: 0 },   // out of stock
            { attributes: { size: "S", color: "White" }, price: 24.99, stock: 8 },
            { attributes: { size: "M", color: "White" }, price: 24.99, stock: 5 },    // low stock
            { attributes: { size: "L", color: "White" }, price: 29.99, stock: 12 },
        ],
    },
    {
        name: "Essential Hoodie",
        description:
            "Mid-weight French terry hoodie with a kangaroo pocket and metal-tipped drawcord. Designed for layering.",
        category: "Hoodies",
        images: [
            "https://res.cloudinary.com/demo/image/upload/v1/sample-co/essential-hoodie-1.jpg",
            "https://res.cloudinary.com/demo/image/upload/v1/sample-co/essential-hoodie-2.jpg",
        ],
        variants: [
            { attributes: { size: "S", color: "Charcoal" }, price: 59.99, stock: 10 },
            { attributes: { size: "M", color: "Charcoal" }, price: 59.99, stock: 0 }, // out of stock
            { attributes: { size: "L", color: "Charcoal" }, price: 64.99, stock: 8 },
            { attributes: { size: "XL", color: "Charcoal" }, price: 69.99, stock: 3 }, // low stock
        ],
    },
    {
        name: "Relaxed Joggers",
        description:
            "Tapered-leg joggers with ribbed cuffs and a comfortable elastic waistband. Perfect for weekends.",
        category: "Bottoms",
        images: [
            "https://res.cloudinary.com/demo/image/upload/v1/sample-co/relaxed-joggers-1.jpg",
            "https://res.cloudinary.com/demo/image/upload/v1/sample-co/relaxed-joggers-2.jpg",
        ],
        variants: [
            { attributes: { size: "S", color: "Navy" }, price: 44.99, stock: 14 },
            { attributes: { size: "M", color: "Navy" }, price: 44.99, stock: 22 },
            { attributes: { size: "L", color: "Navy" }, price: 44.99, stock: 7 },
        ],
    },
    {
        name: "Logo Enamel Pin",
        description:
            "Die-cast zinc-alloy pin with a butterfly clutch back. The Sample & Co. ampersand in miniature.",
        category: "Accessories",
        images: [
            "https://res.cloudinary.com/demo/image/upload/v1/sample-co/logo-enamel-pin-1.jpg",
            "https://res.cloudinary.com/demo/image/upload/v1/sample-co/logo-enamel-pin-2.jpg",
        ],
        variants: [
            { attributes: { color: "Gold" }, price: 12.99, stock: 50 },
            { attributes: { color: "Silver" }, price: 12.99, stock: 35 },
        ],
    },
    {
        name: "Brand Sticker Pack",
        description:
            "Set of 5 vinyl die-cut stickers. Weather-resistant and dishwasher safe.",
        category: "Stickers",
        images: [
            "https://res.cloudinary.com/demo/image/upload/v1/sample-co/brand-sticker-pack-1.jpg",
            "https://res.cloudinary.com/demo/image/upload/v1/sample-co/brand-sticker-pack-2.jpg",
        ],
        // No-variant product → single default variant with empty attributes
        variants: [
            { attributes: {}, price: 4.99, stock: 100 },
        ],
    },
];

async function main() {
    const adminEmail = config.ADMIN_SEED_EMAIL?.trim();
    const adminPassword = config.ADMIN_SEED_PASSWORD?.trim();
    const adminName = config.ADMIN_SEED_NAME?.trim();

    if (!adminName || !adminEmail || !adminPassword) {
        logger.warn("Skipping admin seed: ADMIN_EMAIL, ADMIN_PASSWORD, or ADMIN_NAME is not set.");
    } else {
        const hashedPassword = await bcrypt.hash(adminPassword, config.BCRYPT_SALT_ROUNDS);

        await prisma.user.upsert({
            where: { email: adminEmail },
            update: {
                name: adminName,
                passwordHash: hashedPassword,
                role: "ADMIN",
            },
            create: {
                email: adminEmail,
                passwordHash: hashedPassword,
                name: adminName,
                role: "ADMIN",
            }
        });

        logger.info(`Admin user seeded for ${adminEmail}`);
    }

    for (const seedProduct of SEED_PRODUCTS) {
        const { variants, ...productFields } = seedProduct;

        const existingProduct = await prisma.product.findFirst({
            where: {
                name: seedProduct.name
            }
        });

        const product = existingProduct ?
            await prisma.product.update({
                where: { id: existingProduct.id },
                data: {
                    description: productFields.description,
                    images: productFields.images,
                    category: productFields.category,
                    isActive: true,
                }
            })
            : await prisma.product.create({
                data: { ...productFields }
            });

        for (const variantData of variants) {
            const existingVariant = await prisma.productVariant.findFirst({
                where: {
                    productId: product.id,
                    attributes: {
                        equals: variantData.attributes,
                    },
                },
            });

            if (existingVariant) {
                await prisma.productVariant.update({
                    where: { id: existingVariant.id },
                    data: {
                        price: variantData.price,
                        stock: variantData.stock,
                        isActive: true,
                    },
                });
            } else {
                await prisma.productVariant.create({
                    data: {
                        productId: product.id,
                        attributes: variantData.attributes,
                        price: variantData.price,
                        stock: variantData.stock,
                    },
                });
            }
        }

        logger.info(
            `Seeded product: "${product.name}" with ${variants.length} variant(s)`
        );
    }

    logger.info("Seed Completed Successfully");
}

main()
    .catch((e) => {
        logger.error(`Seed failed with error: ${e}`);
        process.exit(1);
    })
    .finally(async () => {
        try {
            await prisma.$disconnect();
        } catch (err) {
            logger.error(`Error disconnecting Prisma client: ${err}`);
        }
        try {
            await pool.end();
        } catch (err) {
            logger.error(`Error ending connection pool: ${err}`);
        }
    });
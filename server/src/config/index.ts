interface Config {
    DATABASE_URL: string;
    JWT_SECRET: string;
    JWT_REFRESH_SECRET: string;
    STRIPE_SECRET_KEY: string;
    STRIPE_WEBHOOK_SECRET: string;
    CLOUDINARY_URL: string;
    RESEND_API_KEY: string;
    ALLOWED_ORIGIN: string;
    PORT: number;
    NODE_ENV: "development" | "production" | "test";
}

function getEnv(key: string): string {
    const value = process.env[key];

    if (!value) {
        throw new Error(`Env variable ${key} is required`);
    }

    return value;
}

function getPort(fallback: number): number {
    const port = process.env["PORT"];

    if (!port) {
        return fallback;
    }

    const parsedPort = Number(port);

    if (isNaN(parsedPort)){
        throw new Error(`PORT must be a valid number.`)
    }

    return parsedPort;
}

export const config: Config = {
    DATABASE_URL: getEnv("DATABASE_URL"),
    JWT_SECRET: getEnv("JWT_SECRET"),
    JWT_REFRESH_SECRET: getEnv('JWT_REFRESH_SECRET'),
    STRIPE_SECRET_KEY: getEnv('STRIPE_SECRET_KEY'),
    STRIPE_WEBHOOK_SECRET: getEnv('STRIPE_WEBHOOK_SECRET'),
    CLOUDINARY_URL: getEnv('CLOUDINARY_URL'),
    RESEND_API_KEY: getEnv('RESEND_API_KEY'),
    ALLOWED_ORIGIN: getEnv('ALLOWED_ORIGIN'),
    PORT: getPort(3000),
    NODE_ENV: getEnv('NODE_ENV') as Config['NODE_ENV'],
}
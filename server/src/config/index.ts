import type { SignOptions } from "jsonwebtoken";

interface Config {
    DATABASE_URL: string;
    JWT_SECRET: string;
    JWT_REFRESH_SECRET: string;
    JWT_ACCESS_EXPIRY: SignOptions["expiresIn"];
    JWT_REFRESH_EXPIRY_DAYS: SignOptions["expiresIn"];
    STRIPE_SECRET_KEY: string;
    STRIPE_WEBHOOK_SECRET: string;
    CLOUDINARY_URL: string;
    RESEND_API_KEY: string;
    ALLOWED_ORIGIN: string[];
    BCRYPT_SALT_ROUNDS: number;
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

    if (isNaN(parsedPort)) {
        throw new Error(`PORT must be a valid number.`)
    }

    return parsedPort;
}

function getAllowedOrigins(): string[] {
    const allowedOrigins = (process.env["ALLOWED_ORIGIN"] ?? "").split(",").map((origin) => origin.trim()).filter(Boolean); // drop empty strings comming from trailling commas etc.

    if (allowedOrigins.length === 0) {
        throw new Error("Env variable ALLOWED_ORIGIN is required");
    }

    if (allowedOrigins.includes("*")) {
        throw new Error(`Invalid cors configuration: wildcard origin "*" is not allowed when credentials are required`)
    }

    return allowedOrigins
}

function getNodeEnv(): Config["NODE_ENV"] {
    const value = getEnv("NODE_ENV");

    if (value !== "development" && value !== "production" && value !== "test") {
        throw new Error(`NODE_ENV must be one of development, production, test — got "${value}"`);
    }
    return value;
}

export const config: Config = {
    DATABASE_URL: getEnv("DATABASE_URL"),
    JWT_SECRET: getEnv("JWT_SECRET"),
    JWT_REFRESH_SECRET: getEnv("JWT_REFRESH_SECRET"),
    JWT_ACCESS_EXPIRY: "15m",
    JWT_REFRESH_EXPIRY_DAYS: "7d",
    STRIPE_SECRET_KEY: getEnv("STRIPE_SECRET_KEY"),
    STRIPE_WEBHOOK_SECRET: getEnv("STRIPE_WEBHOOK_SECRET"),
    CLOUDINARY_URL: getEnv("CLOUDINARY_URL"),
    RESEND_API_KEY: getEnv("RESEND_API_KEY"),
    ALLOWED_ORIGIN: getAllowedOrigins(),
    BCRYPT_SALT_ROUNDS: 10,
    PORT: getPort(3000),
    NODE_ENV: getNodeEnv(),
}
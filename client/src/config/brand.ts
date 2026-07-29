// brand.config.ts
//
// Single source of truth for the storefront's identity. Swap the values
// below to launch a new niche/brand without touching component code —
// every place a brand name, color, or font appears in the app should pull
// from this file, not be hardcoded.
//
// Visual direction: minimalist mono — strict black/white/grey, with exactly
// ONE accent color allowed to break the rule (used sparingly: primary CTA,
// active states, price highlights).

export interface BrandLogo {
    symbol: string;
    wordmarkCase: "uppercase" | "titlecase";
    letterSpacing: string;
}

export interface BrandColors {
    background: string;
    foreground: string;
    muted: string;
    border: string;
    accent: string;
}

export interface BrandTypography {
    headingFont: string;
    bodyFont: string;
    letterSpacing: string;
}

export interface BrandVoice {
    tone: string;
    targetAudience: string;
}

export interface SeedCatalogHint {
    apparelDesigns: number;
    apparelVariants: string[];
    nonApparelProducts: number;
    noVariantProduct: number;
}

export interface BrandConfig {
    brandName: string;
    tagline: string;
    domain: string;
    supportEmail: string;
    logo: BrandLogo;
    colors: BrandColors;
    typography: BrandTypography;
    voice: BrandVoice;
    seedCatalogHint: SeedCatalogHint;
}

const brandConfig: BrandConfig = {
    brandName: "Sample & Co.",
    tagline: "Built to be replaced.",
    domain: "sampleandco.com",
    supportEmail: "hello@sampleandco.com",

    logo: {
        symbol: "&",
        wordmarkCase: "uppercase",
        letterSpacing: "0.06em",
    },

    colors: {
        background: "#0A0A0A",
        foreground: "#FAFAFA",
        muted: "#6B7280",
        border: "#27272A",
        accent: "#3B82F6",
    },

    typography: {
        headingFont: "'Manrope', sans-serif",
        bodyFont: "'Inter', sans-serif",
        letterSpacing: "0.04em",
    },

    voice: {
        tone: "neutral, demo-ready, intentionally placeholder",
        targetAudience: "demo placeholder — applicable to any product category",
    },

    seedCatalogHint: {
        apparelDesigns: 3,
        apparelVariants: ["size", "color"],
        nonApparelProducts: 1,
        noVariantProduct: 1,
    },
};

export function getBrandName(): string {
    return brandConfig.brandName;
}

export function getBrandColors(): BrandColors {
    return brandConfig.colors;
}

export function getBrandTypography(): BrandTypography {
    return brandConfig.typography;
}

export default brandConfig;
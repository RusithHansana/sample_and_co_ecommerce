// brand.config.js
//
// Single source of truth for the storefront's identity. Swap the values
// below to launch a new niche/brand without touching component code —
// every place a brand name, color, or font appears in the app should pull
// from this file, not be hardcoded.
//
// Visual direction: minimalist mono — strict black/white/grey, with exactly
// ONE accent color allowed to break the rule (used sparingly: primary CTA,
// active states, price highlights).

module.exports = {
  // Identity — dummy/demo brand chosen for development & screenshots.
  // Still fully swappable: relaunching under a real niche later means
  // editing these values only, no component changes.
  brandName: "Sample & Co.",
  tagline: "Built to be replaced.",
  domain: "sampleandco.com",
  supportEmail: "hello@sampleandco.com",

  // Logo
  logo: {
    symbol: "&",                   // ampersand mark, ties to the name without locking to a niche
    wordmarkCase: "uppercase",    // "uppercase" | "titlecase"
    letterSpacing: "0.06em",
  },

  // Color tokens — keep background/foreground/muted/border monochrome.
  // `accent` is the one sanctioned exception to the monochrome rule.
  colors: {
    background: "#0A0A0A",
    foreground: "#FAFAFA",
    muted: "#6B7280",
    border: "#27272A",
    accent: "#3B82F6",
  },

  // Typography
  typography: {
    headingFont: "'Manrope', sans-serif",
    bodyFont: "'Inter', sans-serif",
    letterSpacing: "0.04em",
  },

  // Brand voice — kept deliberately generic since Sample & Co. is a dummy
  // brand, not a committed niche. Used for copywriting consistency
  // (product descriptions, email tone, error messages).
  voice: {
    tone: "neutral, demo-ready, intentionally placeholder",
    targetAudience: "demo placeholder — applicable to any product category",
  },

  // Seed catalog shape — useful for scripting demo data per-niche.
  // Not required by the schema; just a convention for seed scripts.
  seedCatalogHint: {
    apparelDesigns: 3,
    apparelVariants: ["size", "color"],
    nonApparelProducts: 1, // confirms schema isn't apparel-locked
    noVariantProduct: 1,   // confirms UI handles products with no attributes
  },
};

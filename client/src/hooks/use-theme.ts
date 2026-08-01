import { useContext } from "react";
import { ThemeContext } from "@/contexts/theme-context-store";
import type { ThemeContextType } from "@/types/theme";

export function useTheme(): ThemeContextType {
    const context = useContext(ThemeContext);

    if (!context) {
        throw new Error(
            "useTheme must be used within an <ThemeProvider>. " +
            "Wrap your component tree with <ThemeProvider> in App.tsx.",
        );
    }

    return context;
}
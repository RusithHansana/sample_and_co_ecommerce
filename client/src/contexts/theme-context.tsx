import { useCallback, useEffect, useState, type ReactNode } from "react";
import { ThemeContext } from "@/contexts/theme-context-store";
import { type ResolvedTheme, type Theme, type ThemeContextType } from "@/types/theme";

const LOCAL_STORAGE_THEME_KEY = "sample-co-theme";

function getSystemTheme(): ResolvedTheme {
    return window.matchMedia('(prefers-color-scheme:dark)').matches ? 'dark' : 'light';
}

function getResolvedTheme(theme: Theme): ResolvedTheme {
    return theme === 'system' ? getSystemTheme() : theme;
}

function getStoredTheme(): Theme {
    if (typeof window === 'undefined') return 'system';
    const stored = localStorage.getItem(LOCAL_STORAGE_THEME_KEY);
    return (stored === 'light' || stored === 'dark' || stored === 'system') ? stored : 'system';
}

function applyResolvedTheme(theme: ResolvedTheme) {
    document.documentElement.classList.toggle('light', theme === 'light')
}

export function ThemeProvider({ children }: { children: ReactNode }) {
    const [themeState, setThemeState] = useState<Theme>(getStoredTheme);
    const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>(() => getResolvedTheme(getStoredTheme())
    );

    // whenever the 'themeState' changes
    useEffect(() => {
        const resolved = getResolvedTheme(themeState);
        setResolvedTheme(resolved);
        applyResolvedTheme(resolved);
    }, [themeState]);

    // for os level theme changes
    useEffect(() => {
        if (themeState !== 'system') return;

        const mediaQueryList = matchMedia('(prefers-color-schema: dark)');

        const handleChange = () => {
            const resolved = getSystemTheme();
            setResolvedTheme(resolved);
            applyResolvedTheme(resolved);
        }

        mediaQueryList.addEventListener('change', handleChange);

        return () => mediaQueryList.removeEventListener('change', handleChange);
    }, [themeState]);

    // cross-tab-sync
    useEffect(() => {
        const handleChange = (e: StorageEvent) => {
            if (e.key !== LOCAL_STORAGE_THEME_KEY) return;

            const next = e.newValue;

            if (next === 'light' || next === 'dark' || next === 'system') {
                setThemeState(next);
            }
        };

        window.addEventListener('storage', handleChange);
        return window.removeEventListener('storage', handleChange);
    }, [])

    const setTheme = useCallback((next: Theme) => {
        localStorage.setItem(LOCAL_STORAGE_THEME_KEY, next);
        setThemeState(next)
    }, []);

    const value: ThemeContextType = {
        theme: 'dark',
        resolvedTheme: 'dark',
        setTheme,
    }
    return (<ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>)
}
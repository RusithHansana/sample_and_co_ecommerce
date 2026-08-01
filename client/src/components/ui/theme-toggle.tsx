import { Button } from "@/components/ui/button"
import { useTheme } from "@/hooks/use-theme"
import { cn } from "@/lib/utils";
import type { Theme } from "@/types/theme";
import { Monitor, Moon, Sun } from "lucide-react";

const NEXT_THEME: Record<Theme, Theme> = {
    dark: 'light',
    light: 'system',
    system: 'dark',
};

const THEME_LABEL: Record<Theme, string> = {
    dark: 'Switch to light mode',
    light: 'Switch to system mode',
    system: 'Switch to dark mo""de',
};

const ICON_CLASS = 'absolute inset-0 h-5 w-5 transition-all duration-200 ease-in-out motion-reduce:duration-0 motion-reduce:transition-none';


function ThemeToggle() {
    const { theme, setTheme } = useTheme();

    return (<Button
        variant="ghost"
        size="icon"
        className="h-11 w-11"
        onClick={() => setTheme(NEXT_THEME[theme])}
        aria-label={THEME_LABEL[theme]}
    >
        <span className="relative block h-5 w-5">
            <Moon
                className={cn(ICON_CLASS, theme === 'dark' ? 'rotate-0 opacity-100' : 'rotate-180 opacity-0')}
            />
            <Sun
                className={cn(ICON_CLASS, theme === 'light' ? 'rotate-0 opacity-100' : 'rotate-180 opacity-0')}
            />
            <Monitor
                className={cn(ICON_CLASS, theme === 'system' ? 'rotate-0 opacity-100' : 'rotate-180 opacity-0')}
            />
        </span>
    </Button>)
}

export { ThemeToggle }
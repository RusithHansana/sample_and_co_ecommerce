import { useTheme } from "@/hooks/use-theme";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Theme } from "@/types/theme";
import { Monitor, Moon, Sun } from "lucide-react";

const NEXT_THEME: Record<Theme, Theme> = {
    dark: "light",
    light: "system",
    system: "dark",
};

const THEME_LABEL: Record<Theme, string> = {
    dark: "Switch to light mode",
    light: "Switch to system mode",
    system: "Switch to dark mode",
};

const THEME_ICONS = [
    { theme: "dark", Icon: Moon },
    { theme: "light", Icon: Sun },
    { theme: "system", Icon: Monitor },
] as const;

function ThemeToggle() {
    const { theme, setTheme } = useTheme();

    return (
        <Button
            variant="ghost"
            size="icon"
            className="h-11 w-11"
            onClick={() => setTheme(NEXT_THEME[theme])}
            aria-label={THEME_LABEL[theme]}
        >
            <span className="relative flex h-5 w-5 items-center justify-center">
                {THEME_ICONS.map(({ theme: iconTheme, Icon }) => {
                    const isActive = theme === iconTheme;

                    return (
                        <Icon
                            key={iconTheme}
                            className={cn(
                                "absolute h-5 w-5 transition-all duration-300 ease-in-out motion-reduce:duration-0 motion-reduce:transition-none",
                                isActive
                                    ? "rotate-0 scale-100 opacity-100"
                                    : "rotate-90 scale-0 opacity-0"
                            )}
                            aria-hidden="true"
                        />
                    );
                })}
            </span>
        </Button>
    );
}

export { ThemeToggle };
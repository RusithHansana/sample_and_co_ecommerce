import { useEffect, useState } from "react";

export function useMediaQuery(query: string): boolean {
    const [isMatch, setIsMatch] = useState<boolean>(() => {
        if (typeof window !== 'undefined') {
            return window.matchMedia(query).matches;
        }
        return false;
    });

    useEffect(() => {
        if (typeof window === 'undefined') return;

        const media = window.matchMedia(query);

        const listener = (event: MediaQueryListEvent) => {
            setIsMatch(event.matches);
        }

        setIsMatch(media.matches);

        media.addEventListener('change', listener);

        return () => media.removeEventListener('change', listener);
    }, [query]);

    return isMatch;
}
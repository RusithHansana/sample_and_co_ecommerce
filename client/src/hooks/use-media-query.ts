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

        const listner = (event: MediaQueryListEvent) => {
            setIsMatch(event.matches);
        }

        setIsMatch(media.matches);

        media.addEventListener('change', listner);

        return () => media.removeEventListener('change', listner);
    }, [query]);

    return isMatch;
}
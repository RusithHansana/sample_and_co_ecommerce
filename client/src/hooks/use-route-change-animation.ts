import { useEffect, useRef } from "react";
import { useLocation } from "react-router";

export function useRouteChangeAnimation<T extends HTMLElement>(className: string) {
    const location = useLocation();
    const ref = useRef<T>(null);

    useEffect(() => {
        const element = ref.current;

        if (!element) return;

        element.classList.remove(className);
        void element.offsetWidth;
        element.classList.add(className);
    }, [location.pathname, className])

    return ref;
}
import { getRouteTitle } from "@/lib/route-titles";
import { useEffect, useState } from "react";
import { useLocation } from "react-router";

export function RouteAnnouncer() {
    const location = useLocation();
    const [announcement, setAnnouncement] = useState<string>("");

    useEffect(() => {
        const pageTitle = getRouteTitle(location.pathname);
        setAnnouncement(pageTitle);
        document.title = pageTitle;
    }, [location.pathname]);

    return (
        <div
            role="status"
            aria-live="polite"
            aria-atomic="true"
            className="sr-only"
        >
            {announcement}
        </div>
    )
}
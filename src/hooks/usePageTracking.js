import { useLocation } from "react-router";
import { useEffect } from "react";

const ignoreViews = import.meta.env.VITE_IGNORE_VIEWS;

export function usePageTracking() {
    const location = useLocation();

    useEffect(() => {
        // 🚫 Ignore admin / dev traffic
        if (ignoreViews === "True") return;
        if (!window.gtag) return;

        window.gtag("config", window.GA_ID || "G-X8KBQ5CE84", {
            page_path: location.pathname + location.search,
        });
    }, [location.pathname, location.search]);
}

function getAPIForHostname(hostname) {
    if (hostname?.includes("luckydefenseguides")) {
        return "https://api.luckydefenseguides.com";
    }
    if (hostname?.includes("guidecodex")) {
        return "https://api.guidecodex.com";
    }
    // localhost / dev fallback
    return import.meta.env.VITE_SERVER || "";
}

// For server-side loaders that have a Request object
export function getAPIForRequest(request) {
    return getAPIForHostname(new URL(request.url).hostname);
}

// For client-side components — auto-detects from window.location
export const currentAPI =
    typeof window !== "undefined"
        ? getAPIForHostname(window.location.hostname)
        : import.meta.env.VITE_SERVER || "";

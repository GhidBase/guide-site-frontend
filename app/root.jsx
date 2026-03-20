import { Links, Meta, Outlet, Scripts, ScrollRestoration, useLocation } from "react-router";
import { useEffect } from "react";
import { AuthProvider } from "../src/contexts/AuthProvider";
import { ThemeProvider, DarkModeProvider } from "../src/contexts/ThemeProvider";
import "../src/index.css";
import "../src/tailwind.css";

export function Layout({ children }) {
    return (
        <html lang="en" translate="no">
            <head>
                <meta charSet="UTF-8" />
                <link rel="icon" type="image/png" href="/LDG_Logo.png" />
                <meta
                    name="viewport"
                    content="width=device-width, initial-scale=1.0"
                />
                <Meta />
                <Links />
                <script
                    async
                    src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-7281531232813347"
                    crossOrigin="anonymous"
                />
                <script
                    dangerouslySetInnerHTML={{
                        __html: `window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
window.GA_ID = window.location.hostname.includes('luckydefenseguides')
  ? 'G-X8KBQ5CE84'
  : 'G-XR5P6T66LS';`,
                    }}
                />
                <script
                    async
                    src="https://www.googletagmanager.com/gtag/js?id=G-X8KBQ5CE84"
                />
                <script
                    dangerouslySetInnerHTML={{
                        __html: `gtag('js', new Date());
gtag('config', window.GA_ID, { send_page_view: false });`,
                    }}
                />
            </head>
            <body>
                {children}
                <ScrollRestoration />
                <Scripts />
            </body>
        </html>
    );
}

function GATracker() {
    const location = useLocation();
    useEffect(() => {
        if (typeof window.gtag !== "function") return;
        window.gtag("event", "page_view", {
            page_path: location.pathname + location.search,
        });
    }, [location.pathname, location.search]);
    return null;
}

export default function Root() {
    return (
        <AuthProvider>
            <ThemeProvider>
                <DarkModeProvider>
                    <GATracker />
                    <Outlet />
                </DarkModeProvider>
            </ThemeProvider>
        </AuthProvider>
    );
}

import { useRouteLoaderData, useLocation } from "react-router";
import { useDarkMode } from "../contexts/ThemeProvider.jsx";
import GlassBar from "./GlassBar.jsx";
export default function Footer() {
    const { gameData, isLDG } = useRouteLoaderData("main");
    const { darkMode } = useDarkMode();
    const { pathname } = useLocation();
    if (pathname === "/") return (
        <GlassBar borderSide="top" style={{ padding: "1rem 2.5rem", display: "flex", alignItems: "center", justifyContent: "center", gap: "1.25rem", fontSize: "0.68rem", opacity: 0.75, boxShadow: "none" }}>
            <span>© {new Date().getFullYear()} GuideCodex</span>
            <span style={{ opacity: 0.4 }}>·</span>
            <a
                href="/pages/privacy-policy.html"
                style={{ color: "inherit", textDecoration: "none", transition: "opacity 0.2s" }}
                onMouseEnter={(e) => (e.currentTarget.style.opacity = 0.6)}
                onMouseLeave={(e) => (e.currentTarget.style.opacity = 1)}
            >
                Privacy Policy
            </a>
        </GlassBar>
    );
    const siteName = isLDG ? "LuckyDefenseGuides.com" : "GuideCodex";
    const gameName = gameData?.title ?? "this game";

    const linkStyle = { color: "inherit", textDecoration: "none", opacity: 0.85, transition: "opacity 0.2s" };

    return (
        <GlassBar as="footer" borderSide="top" style={{ padding: "1rem 2.5rem", display: "flex", alignItems: "center", justifyContent: "center", gap: "1.25rem", flexWrap: "wrap", fontSize: "0.68rem", boxShadow: "none" }}>
            <span>© {new Date().getFullYear()} {siteName}. Not affiliated with the creators of {gameName}.</span>
            <span style={{ opacity: 0.4 }}>·</span>
            <a href="https://guidecodex.com" target="_blank" rel="noopener noreferrer"
                style={linkStyle}
                onMouseEnter={(e) => (e.currentTarget.style.opacity = 1)}
                onMouseLeave={(e) => (e.currentTarget.style.opacity = 0.7)}
            >GuideCodex</a>
            <span style={{ opacity: 0.4 }}>·</span>
            <a href="/privacy-policy"
                style={linkStyle}
                onMouseEnter={(e) => (e.currentTarget.style.opacity = 1)}
                onMouseLeave={(e) => (e.currentTarget.style.opacity = 0.7)}
            >Privacy Policy</a>
            {gameData?.showSupportButton !== false && (
                <>
                    <span style={{ opacity: 0.4 }}>·</span>
                    <a
                        href="https://buymeacoffee.com/ghidward"
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ ...linkStyle, display: "flex", alignItems: "center", gap: "0.4rem" }}
                        onMouseEnter={(e) => (e.currentTarget.style.opacity = 1)}
                        onMouseLeave={(e) => (e.currentTarget.style.opacity = 0.7)}
                    >
                        <img
                            src="https://cdn.buymeacoffee.com/buttons/bmc-new-btn-logo.svg"
                            alt=""
                            style={{ width: "0.9rem", height: "0.9rem", filter: darkMode ? "brightness(0) invert(0.7)" : "brightness(0) opacity(0.5)" }}
                        />
                        Support the Developer
                    </a>
                </>
            )}
        </GlassBar>
    );
}

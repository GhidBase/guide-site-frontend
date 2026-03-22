import { useRouteLoaderData, useLocation } from "react-router";
import { useDarkMode } from "../contexts/ThemeProvider.jsx";

export default function Footer() {
    const { gameData, isLDG } = useRouteLoaderData("main");
    const { darkMode } = useDarkMode();
    const { pathname } = useLocation();
    if (pathname === "/") return (
        <div style={{
            borderTop: "1px solid rgba(232,213,183,0.14)",
            padding: "1rem 2.5rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "1.25rem",
            fontSize: "0.68rem",
            color: darkMode ? "rgba(232,213,183,0.65)" : "rgba(255,255,255,0.8)",
            background: "linear-gradient(180deg, rgba(10,8,6,0.38) 0%, rgba(10,8,6,0.72) 100%)",
            backdropFilter: "blur(28px) saturate(1.4)",
            WebkitBackdropFilter: "blur(28px) saturate(1.4)",
            boxShadow: "0 -4px 32px rgba(0,0,0,0.55)",
        }}>
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
        </div>
    );
    const siteName = isLDG ? "LuckyDefenseGuides.com" : "GuideCodex";
    const gameName = gameData?.title ?? "this game";

    return (
        <footer className="w-full border-t border-(--outline)/40 px-4 py-3" style={{ background: darkMode ? "#0f0c0a" : "var(--primary)" }}>
            <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-center gap-y-1 sm:gap-0 text-center text-xs text-amber-50/80 flex-wrap">
                <span>
                    © {new Date().getFullYear()} {siteName}. This site is not affiliated with or endorsed by the creators of {gameName}.
                </span>
                <span className="hidden sm:inline mx-2">|</span>
                <div className="flex items-center gap-0">
                    <a
                        href="https://guidecodex.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-amber-50 underline underline-offset-2"
                    >
                        GuideCodex
                    </a>
                    <span className="mx-2">|</span>
                    <a
                        href="/privacy-policy"
                        className="hover:text-amber-50 underline underline-offset-2"
                    >
                        Privacy Policy
                    </a>
                </div>
                {gameData?.showSupportButton !== false && (
                    <>
                        <span className="hidden sm:inline mx-2">|</span>
                        <a
                            href="https://buymeacoffee.com/ghidward"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1.5 hover:text-amber-50 text-amber-50/80 font-medium transition-colors mt-1 sm:mt-0"
                        >
                            <img
                                src="https://cdn.buymeacoffee.com/buttons/bmc-new-btn-logo.svg"
                                alt="Buy me a coffee"
                                className="w-4 h-4"
                                style={darkMode ? { filter: "brightness(0) invert(1)" } : undefined}
                            />
                            Support the Developer
                        </a>
                    </>
                )}
            </div>
        </footer>
    );
}

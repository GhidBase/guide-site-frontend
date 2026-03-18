import ldgLogo from "../assets/LDG_Title.webp";
import { useRouteLoaderData, useNavigate, Link, useMatches } from "react-router";
import { useEffect } from "react";
import { useAuth } from "../hooks/useAuth";
import { PanelTop, PanelLeft, LogOut, Moon, Sun } from "lucide-react";
import { useDarkMode } from "../contexts/ThemeProvider.jsx";

export default function TopBar({ navbarLayout, toggleNavbarLayout }) {
    const { pageData, pageSlug, gameData, isLDG } = useRouteLoaderData("main");
    const { isAuthenticated, user, logout } = useAuth();
    const { darkMode, toggleDarkMode } = useDarkMode();
    const navigate = useNavigate();
    const matches = useMatches();

    // Keep notFound redirect that was previously in Title
    useEffect(() => {
        if (pageData?.notFound) navigate("/404", { replace: true });
    }, [pageSlug]);

    const hardCodedTitle = matches?.find((m) => m.handle?.title)?.handle.title;
    const pageTitle = hardCodedTitle ?? pageData?.page?.title;
    const isLDGHomepage = pageTitle === "LD Homepage";

    return (
        <div className="flex items-center gap-3 px-4 h-14 shrink-0 bg-(--primary) border-b-2 border-(--outline)/40"
            style={{ textShadow: "none" }}>

            {/* Logo / site name */}
            <Link
                to={gameData ? (isLDG ? "/" : "/games/" + gameData.slug) : "/"}
                className="flex items-center shrink-0"
            >
                {isLDG ? (
                    <img src={ldgLogo} className="h-9 object-contain" alt="Lucky Defense Guides" />
                ) : (
                    <span className="text-amber-50 font-bold text-xl">
                        {gameData?.title ?? "GuideCodex"}
                    </span>
                )}
            </Link>

            {/* Page title — shown when not on homepage */}
            {pageTitle && !isLDGHomepage && (
                <span className="text-amber-50/40 text-sm hidden md:block truncate">
                    / {pageTitle}
                </span>
            )}

            <div className="flex-1" />

            {/* Auth */}
            <div className="flex items-center gap-2">
                {isAuthenticated ? (
                    <>
                        <span className="text-amber-50/80 text-sm font-medium hidden lg:block">{user?.username}</span>
                        <button
                            onClick={logout}
                            className="text-xs px-3 py-1.5 rounded border border-red-500/70 bg-red-700/60 text-red-100 hover:bg-red-700/80 transition-colors cursor-pointer font-medium"
                        >
                            <LogOut className="w-4 h-4" />
                        </button>
                    </>
                ) : (
                    <>
                        <Link to="/login" className="text-xs px-3 py-1.5 rounded border border-amber-50/30 text-amber-50 hover:bg-amber-50/10 transition-colors">
                            Log In
                        </Link>
                        <Link to="/signup" className="text-xs px-3 py-1.5 rounded bg-amber-50/20 border border-amber-50/30 text-amber-50 hover:bg-amber-50/30 transition-colors">
                            Sign Up
                        </Link>
                    </>
                )}

                {/* Dark mode toggle */}
                <button
                    onClick={toggleDarkMode}
                    title={darkMode ? "Switch to light mode" : "Switch to dark mode"}
                    className="p-1.5 rounded border border-amber-50/30 bg-amber-50/10 hover:bg-amber-50/20 text-amber-50 transition-colors cursor-pointer flex items-center justify-center"
                >
                    {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                </button>

                {/* Layout toggle — desktop only */}
                {gameData && (
                    <button
                        onClick={toggleNavbarLayout}
                        title={navbarLayout === "horizontal" ? "Switch to vertical sidebar" : "Switch to horizontal navbar"}
                        className="hidden lg:flex p-1.5 rounded border border-amber-50/30 bg-amber-50/10 hover:bg-amber-50/20 text-amber-50 transition-colors cursor-pointer"
                    >
                        {navbarLayout === "horizontal"
                            ? <PanelLeft className="w-4 h-4" />
                            : <PanelTop className="w-4 h-4" />
                        }
                    </button>
                )}
            </div>
        </div>
    );
}

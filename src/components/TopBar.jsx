import ldgLogo from "../assets/LDG_Title.webp";
import { useRouteLoaderData, useNavigate, Link, useMatches } from "react-router";
import { useEffect } from "react";
import { useAuth } from "../hooks/useAuth";
import { PanelTop, PanelLeft, Sun, Moon, LogOut, LogIn, UserPlus } from "lucide-react";
import { useDarkMode } from "../contexts/ThemeProvider.jsx";

export default function TopBar({ navbarLayout, toggleNavbarLayout }) {
    const { pageData, pageSlug, gameData, isLDG } = useRouteLoaderData("main");
    const { darkMode, toggleDarkMode } = useDarkMode();
    const { isAuthenticated, user, logout } = useAuth();
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
        <div
            className="flex items-center gap-3 px-4 h-14 shrink-0 border-b border-(--outline)/30"
            style={{ background: darkMode ? "#0f0c0a" : "var(--primary)", textShadow: "none", fontFamily: "'Outfit', sans-serif" }}
        >

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
                            title="Logout"
                            className="p-1.5 rounded border border-red-400/50 bg-red-800/40 text-red-200 hover:bg-red-700/60 transition-colors cursor-pointer flex items-center justify-center"
                        >
                            <LogOut className="w-4 h-4" />
                        </button>
                    </>
                ) : (
                    <>
                        <Link to="/login" title="Log In" className="p-1.5 rounded border border-amber-50/30 text-amber-50 hover:bg-amber-50/10 transition-colors flex items-center justify-center">
                            <LogIn className="w-4 h-4" />
                        </Link>
                        <Link to="/signup" title="Sign Up" className="p-1.5 rounded bg-amber-50/20 border border-amber-50/30 text-amber-50 hover:bg-amber-50/30 transition-colors flex items-center justify-center">
                            <UserPlus className="w-4 h-4" />
                        </Link>
                    </>
                )}

                {/* Dark mode toggle */}
                <button
                    onClick={toggleDarkMode}
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

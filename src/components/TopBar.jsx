import ldgLogo from "../assets/LDG_Title.webp";
import discordLogo from "../assets/icons8-discord-50.png";
import { useRouteLoaderData, useNavigate, Link, useMatches } from "react-router";
import { useEffect } from "react";
import { useAuth } from "../hooks/useAuth";
import { PanelTop, PanelLeft, Sun, Moon, LogOut, LogIn, UserPlus, Pencil, Eye, Settings } from "lucide-react";
import { useDarkMode } from "../contexts/ThemeProvider.jsx";
import { useEditMode } from "../contexts/EditModeContext.jsx";

export default function TopBar({ navbarLayout, toggleNavbarLayout }) {
    const { pageData, pageSlug, gameData, sectionsMap, isLDG } = useRouteLoaderData("main");
    const { darkMode, toggleDarkMode } = useDarkMode();
    const { adminMode, setAdminMode, dirtyBlocks, saveAll } = useEditMode();
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

            {adminMode && dirtyBlocks.size > 0 && saveAll && (
                <button
                    onClick={saveAll}
                    className="flex items-center gap-1.5 px-3 py-1 text-sm font-semibold text-white bg-green-700/70 hover:bg-green-600/80 rounded cursor-pointer transition-colors shrink-0"
                >
                    Save ({dirtyBlocks.size})
                </button>
            )}

            {/* Nav panel link — desktop, admin only */}
            {user?.role === "ADMIN" && (
                <a
                    href={isLDG || !gameData ? "/navigation-panel" : "/games/" + gameData.slug + "/navigation-panel"}
                    title="Navigation Panel"
                    className="hidden lg:flex p-1.5 rounded border border-amber-50/30 text-amber-50 hover:opacity-80 transition-colors items-center justify-center"
                    style={{ background: darkMode ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.12)" }}
                >
                    <Settings className="w-4 h-4" />
                </a>
            )}

            {/* Edit mode toggle — desktop, admin/contributor only */}
            {(user?.role === "ADMIN" || user?.role === "CONTRIBUTOR") && (
                <button
                    onClick={() => {
                        if (adminMode && dirtyBlocks.size > 0) {
                            if (!window.confirm("You have unsaved changes. Exit edit mode anyway?")) return;
                        }
                        setAdminMode(m => !m);
                    }}
                    title={adminMode ? "Exit edit mode" : "Enter edit mode"}
                    className="hidden lg:flex p-1.5 rounded border cursor-pointer items-center justify-center transition-colors"
                    style={{
                        background: adminMode ? "rgba(255,235,200,0.15)" : darkMode ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.12)",
                        borderColor: adminMode ? "rgba(255,235,200,0.4)" : "rgba(255,255,255,0.3)",
                        color: "#fef3c7",
                    }}
                >
                    {adminMode ? <Eye className="w-4 h-4" /> : <Pencil className="w-4 h-4" />}
                </button>
            )}

            {/* Discord — desktop only */}
            {gameData?.discordUrl && (
                <a
                    href={gameData.discordUrl}
                    title="Join the Discord"
                    className="hidden lg:flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded border border-[#5865f2]/50 text-white hover:opacity-80 transition-colors shrink-0"
                    style={{ background: "#5865f2" }}
                >
                    <img src={discordLogo} className="h-4 w-4 object-contain" alt="" />
                    <span className="text-xs font-semibold">Discord</span>
                </a>
            )}

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
                        <Link to="/login" title="Log In" className="p-1.5 rounded border border-amber-50/30 text-amber-50 hover:opacity-80 transition-colors flex items-center justify-center" style={{ background: darkMode ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.12)" }}>
                            <LogIn className="w-4 h-4" />
                        </Link>
                        <Link to="/signup" title="Sign Up" className="p-1.5 rounded border border-amber-50/30 text-amber-50 hover:opacity-80 transition-colors flex items-center justify-center" style={{ background: darkMode ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.12)" }}>
                            <UserPlus className="w-4 h-4" />
                        </Link>
                    </>
                )}

                {/* Dark mode toggle */}
                <button
                    onClick={toggleDarkMode}
                    title={darkMode ? "Switch to light mode" : "Switch to dark mode"}
                    className="p-1.5 rounded border border-amber-50/30 text-amber-50 hover:opacity-80 transition-colors cursor-pointer flex items-center justify-center"
                    style={{ background: darkMode ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.12)" }}
                >
                    {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                </button>

                {/* Layout toggle — desktop only */}
                {sectionsMap && (
                    <button
                        onClick={toggleNavbarLayout}
                        title={navbarLayout === "horizontal" ? "Switch to vertical sidebar" : "Switch to horizontal navbar"}
                        className="hidden lg:flex p-1.5 rounded border border-amber-50/30 text-amber-50 hover:opacity-80 transition-colors cursor-pointer"
                        style={{ background: darkMode ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.12)" }}
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

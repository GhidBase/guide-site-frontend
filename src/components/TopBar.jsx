import ldgLogo from "../assets/LDG_Title.webp";
import { useRouteLoaderData, useNavigate, Link, useMatches, useLocation } from "react-router";
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

    const { pathname } = useLocation();
    const isHomepage = pathname === "/";

    const hardCodedTitle = matches?.find((m) => m.handle?.title)?.handle.title;
    const pageTitle = hardCodedTitle ?? pageData?.page?.title;
    const isLDGHomepage = pageTitle === "LD Homepage";

    if (isHomepage) {
        return (
            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "1rem 2.5rem",
                    background: darkMode
                        ? "linear-gradient(180deg, rgba(10,8,6,0.72) 0%, rgba(10,8,6,0.38) 100%)"
                        : "rgba(255,240,215,0.45)",
                    backdropFilter: "blur(28px) saturate(1.6)",
                    WebkitBackdropFilter: "blur(28px) saturate(1.6)",
                    borderBottom: darkMode
                        ? "1px solid rgba(232,213,183,0.06)"
                        : "1px solid rgba(180,90,30,0.10)",
                    boxShadow: darkMode
                        ? "0 1px 0 rgba(255,255,255,0.03), 0 4px 32px rgba(0,0,0,0.55), 0 16px 48px rgba(0,0,0,0.2)"
                        : "none",
                    color: darkMode ? "#e8d5b7" : "#2d1206",
                    fontFamily: "'Outfit', sans-serif",
                    position: "relative",
                }}
            >
                <span style={{
                    fontSize: "0.58rem",
                    letterSpacing: "0.32em",
                    textTransform: "uppercase",
                    opacity: 0.6,
                    fontWeight: 700,
                    textShadow: "0 0 20px rgba(232,213,183,0.3)",
                }}>
                    GuideCodex
                </span>
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                    {user?.role === "ADMIN" && (
                        <a
                            href="/navigation-panel"
                            title="Navigation Panel"
                            style={{ opacity: 0.5, color: "inherit", display: "flex", alignItems: "center", transition: "opacity 0.2s" }}
                            onMouseEnter={(e) => (e.currentTarget.style.opacity = 0.8)}
                            onMouseLeave={(e) => (e.currentTarget.style.opacity = 0.5)}
                        >
                            <Settings size={13} />
                        </a>
                    )}
                    <button
                        onClick={toggleDarkMode}
                        title={darkMode ? "Switch to light mode" : "Switch to dark mode"}
                        style={{ opacity: 0.5, cursor: "pointer", background: "none", border: "none", color: "inherit", display: "flex", alignItems: "center", transition: "opacity 0.2s" }}
                        onMouseEnter={(e) => (e.currentTarget.style.opacity = 0.8)}
                        onMouseLeave={(e) => (e.currentTarget.style.opacity = 0.5)}
                    >
                        {darkMode ? <Sun size={13} /> : <Moon size={13} />}
                    </button>
                    {(user?.role === "ADMIN" || user?.role === "CONTRIBUTOR") && (
                        <button
                            onClick={() => {
                                if (adminMode && dirtyBlocks.size > 0) {
                                    if (!window.confirm("You have unsaved changes. Exit edit mode anyway?")) return;
                                }
                                setAdminMode(m => !m);
                            }}
                            title={adminMode ? "Exit edit mode" : "Enter edit mode"}
                            style={{ opacity: adminMode ? 0.9 : 0.5, cursor: "pointer", background: "none", border: "none", color: "inherit", display: "flex", alignItems: "center", transition: "opacity 0.2s" }}
                            onMouseEnter={(e) => (e.currentTarget.style.opacity = 0.9)}
                            onMouseLeave={(e) => (e.currentTarget.style.opacity = adminMode ? 0.9 : 0.5)}
                        >
                            {adminMode ? <Eye size={13} /> : <Pencil size={13} />}
                        </button>
                    )}
                    {isAuthenticated ? (
                        <>
                            <span style={{ fontSize: "0.68rem", opacity: 0.45 }}>{user?.username}</span>
                            <button
                                onClick={logout}
                                title="Logout"
                                style={{ opacity: 0.6, cursor: "pointer", background: "none", border: "none", color: "inherit", display: "flex", alignItems: "center", transition: "opacity 0.2s" }}
                                onMouseEnter={(e) => (e.currentTarget.style.opacity = 0.9)}
                                onMouseLeave={(e) => (e.currentTarget.style.opacity = 0.6)}
                            >
                                <LogOut size={13} />
                            </button>
                        </>
                    ) : (
                        <Link
                            to="/login"
                            title="Sign in"
                            style={{
                                color: "rgba(232,220,200,0.7)", textDecoration: "none",
                                border: "1px solid rgba(232,220,200,0.2)", borderRadius: "4px",
                                padding: "0.25rem 0.4rem", transition: "all 0.2s",
                                background: "rgba(255,255,255,0.05)", display: "flex", alignItems: "center",
                            }}
                            onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.1)"; e.currentTarget.style.color = "rgba(232,220,200,1)"; }}
                            onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.05)"; e.currentTarget.style.color = "rgba(232,220,200,0.7)"; }}
                        >
                            <LogIn size={13} />
                        </Link>
                    )}
                </div>
            </div>
        );
    }

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

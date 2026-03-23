import ldgLogo from "../assets/LDG_Title.webp";
import discordLogo from "../assets/icons8-discord-50.png";
import { useRouteLoaderData, useNavigate, Link, useMatches, useLocation } from "react-router";
import { useEffect } from "react";
import { useAuth } from "../hooks/useAuth";
import { PanelTop, PanelLeft, Sun, Moon, LogOut, LogIn, Pencil, Eye, Settings } from "lucide-react";
import { useDarkMode } from "../contexts/ThemeProvider.jsx";
import { useEditMode } from "../contexts/EditModeContext.jsx";
import GlassBar from "./GlassBar.jsx";

// ── Primitives ───────────────────────────────────────────────────────────────

function BarBtn({ onClick, title, className, resting = 1, children }) {
    return (
        <button
            onClick={onClick}
            title={title}
            className={className}
            style={{ opacity: resting, cursor: "pointer", background: "none", border: "none", color: "inherit", display: "flex", alignItems: "center", transition: "opacity 0.2s" }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = 0.65)}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = resting)}
        >
            {children}
        </button>
    );
}

function BarIconLink({ href, title, className, children }) {
    return (
        <a
            href={href}
            title={title}
            className={className}
            style={{ opacity: 1, color: "inherit", display: "flex", alignItems: "center", transition: "opacity 0.2s", textDecoration: "none" }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = 0.65)}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = 1)}
        >
            {children}
        </a>
    );
}

// ── Shared composed items ────────────────────────────────────────────────────

function BarSettings({ isLDG, gameData, className }) {
    const { user } = useAuth();
    if (user?.role !== "ADMIN") return null;
    const href = isLDG || !gameData ? "/navigation-panel" : `/games/${gameData.slug}/navigation-panel`;
    return (
        <BarIconLink href={href} title="Navigation Panel" className={className}>
            <Settings size={13} />
        </BarIconLink>
    );
}

function BarEditToggle({ className }) {
    const { adminMode, setAdminMode, dirtyBlocks } = useEditMode();
    const { user } = useAuth();
    if (user?.role !== "ADMIN" && user?.role !== "CONTRIBUTOR") return null;
    return (
        <BarBtn
            onClick={() => {
                if (adminMode && dirtyBlocks.size > 0) {
                    if (!window.confirm("You have unsaved changes. Exit edit mode anyway?")) return;
                }
                setAdminMode(m => !m);
            }}
            title={adminMode ? "Exit edit mode" : "Enter edit mode"}
            resting={1}
            className={className}
        >
            {adminMode ? <Eye size={13} /> : <Pencil size={13} />}
        </BarBtn>
    );
}

function BarDarkToggle() {
    const { darkMode, toggleDarkMode } = useDarkMode();
    return (
        <BarBtn onClick={toggleDarkMode} title={darkMode ? "Switch to light mode" : "Switch to dark mode"}>
            {darkMode ? <Sun size={13} /> : <Moon size={13} />}
        </BarBtn>
    );
}

function BarAuth({ showUsername = true }) {
    const { isAuthenticated, user, logout } = useAuth();
    if (isAuthenticated) {
        return (
            <>
                {showUsername && (
                    <span className="hidden lg:block" style={{ fontSize: "0.68rem" }}>{user?.username}</span>
                )}
                <BarBtn onClick={logout} title="Logout">
                    <LogOut size={13} />
                </BarBtn>
            </>
        );
    }
    return (
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
    );
}

// ── Main component ───────────────────────────────────────────────────────────

const BAR_STYLE = { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "1rem 2.5rem", position: "relative" };

export default function TopBar({ navbarLayout, toggleNavbarLayout }) {
    const { pageData, pageSlug, gameData, sectionsMap, isLDG } = useRouteLoaderData("main");
    const { adminMode, dirtyBlocks, saveAll } = useEditMode();
    const navigate = useNavigate();
    const matches = useMatches();

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
            <GlassBar style={BAR_STYLE}>
                <span style={{ fontSize: "0.58rem", letterSpacing: "0.32em", textTransform: "uppercase", opacity: 0.6, fontWeight: 700, textShadow: "0 0 20px rgba(232,213,183,0.3)" }}>
                    GuideCodex
                </span>
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                    <BarSettings isLDG={isLDG} gameData={gameData} />
                    <BarDarkToggle />
                    <BarEditToggle />
                    <BarAuth showUsername={false} />
                </div>
            </GlassBar>
        );
    }

    return (
        <GlassBar style={BAR_STYLE}>
            {/* Left: logo + page title */}
            <div style={{ display: "flex", alignItems: "baseline", gap: "0.6rem", minWidth: 0 }}>
                <Link
                    to={gameData ? (isLDG ? "/" : "/games/" + gameData.slug) : "/"}
                    style={{ display: "flex", alignItems: "center", flexShrink: 0, color: "inherit", textDecoration: "none" }}
                >
                    {isLDG ? (
                        <img src={ldgLogo} style={{ height: "2rem", objectFit: "contain" }} alt="Lucky Defense Guides" />
                    ) : (
                        <span style={{ fontWeight: 700, fontSize: "1rem", letterSpacing: "0.01em" }}>
                            {gameData?.title ?? "GuideCodex"}
                        </span>
                    )}
                </Link>
                {pageTitle && !isLDGHomepage && (
                    <span style={{ fontSize: "0.72rem", opacity: 0.6 }} className="hidden md:block truncate">
                        / {pageTitle}
                    </span>
                )}
            </div>

            {/* Right: actions */}
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                {adminMode && dirtyBlocks.size > 0 && saveAll && (
                    <button
                        onClick={saveAll}
                        style={{ cursor: "pointer", background: "rgba(21,128,61,0.55)", border: "none", color: "#fff", borderRadius: "4px", padding: "0.25rem 0.6rem", fontSize: "0.75rem", fontWeight: 600, transition: "background 0.2s" }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(21,128,61,0.8)")}
                        onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(21,128,61,0.55)")}
                    >
                        Save ({dirtyBlocks.size})
                    </button>
                )}
                {gameData?.discordUrl && (
                    <a
                        href={gameData.discordUrl}
                        title="Join the Discord"
                        className="hidden lg:flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded shrink-0"
                        style={{ background: "#5865f2", color: "#fff", textDecoration: "none", opacity: 0.9, transition: "opacity 0.2s" }}
                        onMouseEnter={(e) => (e.currentTarget.style.opacity = 1)}
                        onMouseLeave={(e) => (e.currentTarget.style.opacity = 0.9)}
                    >
                        <img src={discordLogo} className="h-4 w-4 object-contain" alt="" />
                        <span className="text-xs font-semibold">Discord</span>
                    </a>
                )}
                <BarSettings isLDG={isLDG} gameData={gameData} className="hidden lg:flex" />
                <BarEditToggle className="hidden lg:flex" />
                <BarAuth />
                <BarDarkToggle />
                {sectionsMap && (
                    <BarBtn
                        onClick={toggleNavbarLayout}
                        title={navbarLayout === "horizontal" ? "Switch to vertical sidebar" : "Switch to horizontal navbar"}
                        className="hidden lg:flex"
                    >
                        {navbarLayout === "horizontal" ? <PanelLeft size={13} /> : <PanelTop size={13} />}
                    </BarBtn>
                )}
            </div>
        </GlassBar>
    );
}

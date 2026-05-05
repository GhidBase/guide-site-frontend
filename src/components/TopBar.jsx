import ldgLogo from "../assets/LDG_Title.webp";
import discordLogo from "../assets/icons8-discord-50.png";
import { useRouteLoaderData, useNavigate, Link, useMatches } from "react-router";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { PanelTop, PanelLeft, Sun, Moon, LogOut, LogIn, Pencil, Eye, Settings, ChevronDown } from "lucide-react";
import { currentAPI } from "../config/api.js";
import { useDarkMode } from "../contexts/ThemeProvider.jsx";
import { useEditMode, useSaving } from "../contexts/EditModeContext.jsx";
import { useGlassBarStyle } from "../hooks/useGlassBarStyle.js";
import { useGameEditor } from "../contexts/GameEditorContext.jsx";

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

// ── Shared composed items ────────────────────────────────────────────────────

function BarDarkToggle() {
    const { darkMode, toggleDarkMode } = useDarkMode();
    return (
        <BarBtn onClick={toggleDarkMode} title={darkMode ? "Switch to light mode" : "Switch to dark mode"}>
            {darkMode ? <Sun size={16} /> : <Moon size={16} />}
        </BarBtn>
    );
}

function BarAuth({ showUsername = true }) {
    const { isAuthenticated, user, logout } = useAuth();
    if (isAuthenticated) {
        return (
            <>
                {showUsername && (
                    <span className="hidden lg:block" style={{ fontSize: "0.8rem" }}>{user?.username}</span>
                )}
                <BarBtn onClick={logout} title="Logout">
                    <LogOut size={16} />
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
            <LogIn size={16} />
        </Link>
    );
}

function BarAdminControls({ isLDG, gameData }) {
    const { user, isAuthenticated } = useAuth();
    const isAdmin = user?.role === "ADMIN";
    const isGlobalEditor = user?.role === "EDITOR";
    const { isPerGameEditor } = useGameEditor();
    const canEdit = isAdmin || isGlobalEditor || isPerGameEditor;
    const { adminMode, setAdminMode, dirtyBlocks } = useEditMode();

    if (!canEdit) return null;

    return (
        <>
            {isAdmin && (
                <a
                    href={isLDG || !gameData ? "/navigation-panel" : `/games/${gameData.slug}/navigation-panel`}
                    title="Navigation Panel"
                    style={{ opacity: 1, color: "inherit", display: "flex", alignItems: "center", transition: "opacity 0.2s", textDecoration: "none" }}
                    onMouseEnter={(e) => (e.currentTarget.style.opacity = 0.65)}
                    onMouseLeave={(e) => (e.currentTarget.style.opacity = 1)}
                >
                    <Settings size={16} />
                </a>
            )}
            <BarBtn
                onClick={() => {
                    if (adminMode && dirtyBlocks.size > 0) {
                        if (!window.confirm("You have unsaved changes. Exit edit mode anyway?")) return;
                    }
                    setAdminMode(m => !m);
                }}
                title={adminMode ? "Exit edit mode" : "Enter edit mode"}
            >
                {adminMode ? <Eye size={16} /> : <Pencil size={16} />}
            </BarBtn>
        </>
    );
}

// ── Game switcher ────────────────────────────────────────────────────────────

function GameSwitcher({ gameData, isLDG }) {
    const [open, setOpen] = useState(false);
    const [games, setGames] = useState(null);
    const ref = useRef(null);

    useEffect(() => {
        if (open && !games) {
            fetch(`${currentAPI}/games`)
                .then(r => r.json())
                .then(data => setGames(data.filter(g => g.isActive && g.slug)))
                .catch(() => setGames([]));
        }
    }, [open]);

    useEffect(() => {
        if (!open) return;
        function onDown(e) {
            if (ref.current && !ref.current.contains(e.target)) setOpen(false);
        }
        document.addEventListener("mousedown", onDown);
        return () => document.removeEventListener("mousedown", onDown);
    }, [open]);

    const label = isLDG ? null : (gameData?.title ?? "GuideCodex");

    return (
        <div ref={ref} style={{ position: "relative", flexShrink: 0 }}>
            <button
                onClick={() => setOpen(o => !o)}
                style={{ display: "flex", alignItems: "center", gap: "0.25rem", background: "none", border: "none", color: "inherit", cursor: "pointer", padding: 0 }}
            >
                {isLDG ? (
                    <img src={ldgLogo} style={{ height: "2rem", objectFit: "contain" }} alt="Lucky Defense Guides" />
                ) : (
                    <span style={{ fontWeight: 700, fontSize: "1.1rem", letterSpacing: "0.01em" }}>{label}</span>
                )}
                <ChevronDown size={13} style={{ opacity: 0.5, transition: "transform 0.2s", transform: open ? "rotate(180deg)" : "rotate(0deg)", marginTop: isLDG ? 0 : "1px" }} />
            </button>

            {open && (
                <div style={{
                    position: "absolute", top: "calc(100% + 8px)", left: 0, zIndex: 1000,
                    minWidth: "160px", borderRadius: "8px", overflow: "hidden",
                    background: "var(--surface-background)",
                    border: "1px solid var(--outline)",
                    boxShadow: "0 8px 24px rgba(0,0,0,0.3)",
                }}>
                    {!games ? (
                        <div style={{ padding: "0.6rem 1rem", fontSize: "0.8rem", opacity: 0.5 }}>Loading…</div>
                    ) : games.length === 0 ? (
                        <div style={{ padding: "0.6rem 1rem", fontSize: "0.8rem", opacity: 0.5 }}>No games found</div>
                    ) : (
                        games.map(g => (
                            <Link
                                key={g.id}
                                to={`/games/${g.slug}`}
                                onClick={() => setOpen(false)}
                                style={{
                                    display: "block", padding: "0.55rem 1rem",
                                    fontSize: "0.85rem", color: "inherit", textDecoration: "none",
                                    fontWeight: g.id === gameData?.id ? 600 : 400,
                                    background: g.id === gameData?.id ? "color-mix(in srgb, var(--primary) 15%, transparent)" : "transparent",
                                    transition: "background 0.15s",
                                }}
                                onMouseEnter={e => { if (g.id !== gameData?.id) e.currentTarget.style.background = "color-mix(in srgb, var(--primary) 8%, transparent)"; }}
                                onMouseLeave={e => { e.currentTarget.style.background = g.id === gameData?.id ? "color-mix(in srgb, var(--primary) 15%, transparent)" : "transparent"; }}
                            >
                                {g.title}
                            </Link>
                        ))
                    )}
                </div>
            )}
        </div>
    );
}

// ── Main component ───────────────────────────────────────────────────────────

const BAR_STYLE = { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0.6rem 1rem", position: "relative", zIndex: 1 };

export default function TopBar({ navbarLayout, toggleNavbarLayout }) {
    const { pageData, pageSlug, gameData, sectionsMap, isLDG } = useRouteLoaderData("main");
    const { adminMode, dirtyBlocks, saveAll } = useEditMode();
    const { setIsSaving } = useSaving();
    const navigate = useNavigate();
    const matches = useMatches();

    useEffect(() => {
        if (pageData?.notFound) navigate("/404", { replace: true });
    }, [pageSlug]);

    const glassStyle = useGlassBarStyle("bottom");
    const hardCodedTitle = matches?.find((m) => m.handle?.title)?.handle.title;
    const pageTitle = hardCodedTitle ?? pageData?.page?.title;
    const isLDGHomepage = pageTitle === "LD Homepage";

    if (!gameData) {
        return (
            <div style={{ ...glassStyle, ...BAR_STYLE }}>
                <span style={{ fontSize: "0.72rem", letterSpacing: "0.32em", textTransform: "uppercase", opacity: 0.6, fontWeight: 700, textShadow: "0 0 20px rgba(232,213,183,0.3)" }}>
                    GuideCodex
                </span>
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                    <BarAdminControls isLDG={isLDG} gameData={gameData} />
                    <BarDarkToggle />
                    <BarAuth showUsername={false} />
                </div>
            </div>
        );
    }

    return (
        <div style={{ ...glassStyle, ...BAR_STYLE }}>
            {/* Left: game switcher + page title */}
            <div style={{ display: "flex", alignItems: isLDG ? "center" : "baseline", gap: "0.6rem", minWidth: 0 }}>
                <GameSwitcher gameData={gameData} isLDG={isLDG} />
                {pageTitle && !isLDGHomepage && (
                    <span style={{ fontSize: "0.85rem", opacity: 0.6 }} className="truncate">
                        / {pageTitle}
                    </span>
                )}
            </div>

            {/* Right: actions — hidden on mobile (MobileBottomBar handles those) */}
            <div className="hidden lg:flex" style={{ alignItems: "center", gap: "0.75rem" }}>
                {adminMode && dirtyBlocks.size > 0 && saveAll && (
                    <button
                        onClick={async () => { setIsSaving(true); try { await saveAll(); } catch (err) { alert(err.message); } finally { setIsSaving(false); } }}
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
                <BarAuth />
                {!sectionsMap && <BarAdminControls isLDG={isLDG} gameData={gameData} />}
                <BarDarkToggle />
                {sectionsMap && (
                    <BarBtn
                        onClick={toggleNavbarLayout}
                        title={navbarLayout === "horizontal" ? "Switch to vertical sidebar" : "Switch to horizontal navbar"}
                        className="hidden lg:flex"
                    >
                        {navbarLayout === "horizontal" ? <PanelLeft size={16} /> : <PanelTop size={16} />}
                    </BarBtn>
                )}
            </div>
        </div>
    );
}

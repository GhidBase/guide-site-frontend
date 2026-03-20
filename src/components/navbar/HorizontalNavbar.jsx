import { useState, useRef, useEffect, useCallback } from "react";
import { useRouteLoaderData, useNavigate } from "react-router";
import { useAuth } from "@/hooks/useAuth";
import { useEditMode } from "../../contexts/EditModeContext.jsx";
import { useDarkMode } from "../../contexts/ThemeProvider.jsx";
import { ChevronDown, Search, X, Pencil, Eye, Trophy, LayoutDashboard, Map } from "lucide-react";

function HorizontalSearch({ gameData, isLDG, sectionsMap }) {
    const [query, setQuery] = useState("");
    const [open, setOpen] = useState(false);
    const [expanded, setExpanded] = useState(false);
    const containerRef = useRef(null);
    const inputRef = useRef(null);
    const navigate = useNavigate();

    const q = query.trim().toLowerCase();
    const results = q.length >= 2 && sectionsMap
        ? Array.from(sectionsMap.values()).flatMap((section) =>
            [...(section.pages ?? [])]
                .filter((page) =>
                    (page.navbarTitle || page.title)?.toLowerCase().includes(q) ||
                    section.title?.toLowerCase().includes(q)
                )
                .map((page) => ({
                    id: page.id,
                    title: page.navbarTitle || page.title,
                    slug: page.slug,
                    sectionTitle: section.title,
                }))
        )
        : [];

    useEffect(() => {
        function onClickOutside(e) {
            if (containerRef.current && !containerRef.current.contains(e.target)) {
                setOpen(false);
                setExpanded(false);
                setQuery("");
            }
        }
        function onKeyDown(e) {
            if (e.key === "Escape") { setOpen(false); setExpanded(false); setQuery(""); }
        }
        document.addEventListener("mousedown", onClickOutside);
        document.addEventListener("keydown", onKeyDown);
        return () => {
            document.removeEventListener("mousedown", onClickOutside);
            document.removeEventListener("keydown", onKeyDown);
        };
    }, []);

    function handleExpand() {
        setExpanded(true);
        setTimeout(() => inputRef.current?.focus(), 50);
    }

    function buildUrl(slug) {
        return isLDG ? "/" + slug : "/games/" + gameData?.slug + "/" + slug;
    }

    function handleSelect(result) {
        navigate(buildUrl(result.slug), { viewTransition: true });
        setQuery(""); setOpen(false); setExpanded(false);
    }

    return (
        <div ref={containerRef} className="relative flex items-center" style={{ textShadow: "none" }}>
            {expanded ? (
                <div className="flex items-center gap-2 px-2.5 py-1 rounded-lg bg-amber-50/15 border border-amber-50/30 w-48 transition-all">
                    <Search className="w-3.5 h-3.5 text-amber-50/50 shrink-0" />
                    <input
                        ref={inputRef}
                        type="text"
                        value={query}
                        placeholder="Search..."
                        onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
                        className="flex-1 min-w-0 bg-transparent text-amber-50 text-xs outline-none placeholder:text-amber-50/40"
                        style={{ textShadow: "none" }}
                    />
                    {query && (
                        <button onClick={() => { setQuery(""); setOpen(false); }} className="opacity-50 hover:opacity-90 cursor-pointer">
                            <X className="w-3.5 h-3.5 text-amber-50" />
                        </button>
                    )}
                </div>
            ) : (
                <button
                    onClick={handleExpand}
                    title="Search pages"
                    className="p-1.5 text-amber-50 cursor-pointer hover:opacity-70 transition-opacity"
                >
                    <Search className="w-4 h-4" />
                </button>
            )}
            {open && results.length > 0 && (
                <div className="absolute top-full mt-1 right-0 z-50 w-56 bg-(--primary) border-2 border-(--outline) rounded-lg shadow-xl max-h-64 overflow-y-auto" style={{ animation: "dropdown-in 150ms ease forwards" }}>
                    {results.map((r) => (
                        <button key={r.id} onClick={() => handleSelect(r)}
                            className="w-full text-left px-3 py-2 flex flex-col gap-0.5 hover:bg-amber-50/10 border-b border-(--outline)/40 last:border-b-0">
                            <span className="text-xs font-semibold text-amber-50" style={{ textShadow: "none" }}>{r.title}</span>
                            <span className="text-xs text-amber-50/50" style={{ textShadow: "none" }}>{r.sectionTitle}</span>
                        </button>
                    ))}
                </div>
            )}
            {open && query.trim().length >= 2 && results.length === 0 && (
                <div className="absolute top-full mt-1 right-0 z-50 w-56 bg-(--primary) border-2 border-(--outline) rounded-lg px-3 py-2 shadow-xl">
                    <span className="text-xs text-amber-50/70" style={{ textShadow: "none" }}>No results found.</span>
                </div>
            )}
        </div>
    );
}

export default function HorizontalNavbar() {
    const { gameData, sectionsMap, isLDG } = useRouteLoaderData("main");
    const { user, isAuthenticated } = useAuth();
    const isAdmin = user?.role === "ADMIN";
    const isContributor = isAuthenticated && !isAdmin;
    const { adminMode, setAdminMode, dirtyBlocks } = useEditMode();
    const { darkMode } = useDarkMode();
    const navigate = useNavigate();

    const [openSection, setOpenSection] = useState(null);
    const [moreOpen, setMoreOpen] = useState(false);
    const [visibleCount, setVisibleCount] = useState(Infinity);

    const navRef = useRef(null);         // whole bar — for click-outside
    const sectionsAreaRef = useRef(null); // flex-1 area sections live in
    const measureRef = useRef(null);      // hidden clone for measurement
    const moreRef = useRef(null);

    const sections = Array.from(sectionsMap?.values() ?? [])
        .sort((a, b) => a.order - b.order);

    // Click-outside closes all dropdowns
    useEffect(() => {
        function handler(e) {
            if (navRef.current && !navRef.current.contains(e.target)) {
                setOpenSection(null);
                setMoreOpen(false);
            }
        }
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    // Measure which sections fit in the available area
    const recalculate = useCallback(() => {
        const area = sectionsAreaRef.current;
        const measure = measureRef.current;
        if (!area || !measure) return;

        const areaWidth = area.offsetWidth;
        const MORE_BTN_WIDTH = 90; // px — approximate width of "More ▼" button
        const items = Array.from(measure.children);

        let used = 0;
        let count = 0;
        for (const item of items) {
            const w = item.getBoundingClientRect().width + 4; // +4 for gap-1
            if (used + w + MORE_BTN_WIDTH > areaWidth) break;
            used += w;
            count++;
        }

        setVisibleCount(count >= items.length ? Infinity : count);
    }, [sections]);

    useEffect(() => {
        const area = sectionsAreaRef.current;
        if (!area) return;
        recalculate();
        const ro = new ResizeObserver(recalculate);
        ro.observe(area);
        return () => ro.disconnect();
    }, [recalculate]);

    // Re-run when sections change (e.g. after load)
    useEffect(() => { recalculate(); }, [sections.length]);

    const visibleSections = visibleCount === Infinity ? sections : sections.slice(0, visibleCount);
    const overflowSections = visibleCount === Infinity ? [] : sections.slice(visibleCount);

    function buildSlug(pageSlug) {
        return isLDG ? "/" + pageSlug : "/games/" + gameData?.slug + "/" + pageSlug;
    }

    function navigateTo(slug) {
        navigate(slug, { viewTransition: true });
        setOpenSection(null);
        setMoreOpen(false);
    }

    function renderSectionButton(section) {
        const pages = [...(section.pages ?? [])].sort((a, b) => (a.sort ?? 0) - (b.sort ?? 0));
        return (
            <div key={section.id} className="relative shrink-0">
                <button
                    onClick={() => setOpenSection(openSection === section.id ? null : section.id)}
                    className={`flex items-center gap-1 px-3 py-1 text-sm text-amber-50 rounded-md transition-colors whitespace-nowrap font-medium
                        ${openSection === section.id ? "bg-amber-50/20" : "hover:bg-amber-50/10"}`}
                    style={{ textShadow: "none" }}
                >
                    {section.title}
                    <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${openSection === section.id ? "rotate-180" : ""}`} />
                </button>
                {openSection === section.id && pages.length > 0 && (
                    <div className="absolute top-full left-0 mt-1 z-50 bg-(--primary) border-2 border-(--outline) rounded-lg shadow-xl min-w-52 max-h-80 overflow-y-auto" style={{ animation: "dropdown-in 150ms ease forwards" }}>
                        {pages.map((page) => (
                            <button
                                key={page.id}
                                onClick={() => navigateTo(buildSlug(page.slug))}
                                className="w-full text-left px-4 py-2.5 text-sm text-amber-50 hover:bg-amber-50/10 border-b border-(--outline)/40 last:border-b-0 transition-colors"
                                style={{ textShadow: "none" }}
                            >
                                {page.navbarTitle || page.title}
                            </button>
                        ))}
                    </div>
                )}
            </div>
        );
    }

    return (
        <div ref={navRef} className="flex items-center gap-1 px-4 py-1.5 border-t-4 border-(--outline)"
            style={{ background: darkMode ? "#0f0c0a" : "var(--primary)", fontFamily: "'Outfit', sans-serif" }}>

            {/* Hidden measurement clone — renders all sections offscreen to measure widths */}
            <div
                ref={measureRef}
                className="fixed top-[-9999px] left-[-9999px] flex items-center gap-1 pointer-events-none invisible"
                aria-hidden="true"
            >
                {sections.map(section => (
                    <div key={section.id} className="flex items-center gap-1 px-3 py-1 text-sm font-medium whitespace-nowrap">
                        {section.title}
                        <span className="w-3.5 h-3.5 inline-block" />
                    </div>
                ))}
            </div>

            {/* Visible sections */}
            <div ref={sectionsAreaRef} className="flex items-center gap-1 flex-1 min-w-0">
                {visibleSections.map(renderSectionButton)}

                {/* More dropdown */}
                {overflowSections.length > 0 && (
                    <div ref={moreRef} className="relative shrink-0">
                        <button
                            onClick={() => setMoreOpen(o => !o)}
                            className={`flex items-center gap-1 px-3 py-1 text-sm text-amber-50 rounded-md transition-colors whitespace-nowrap font-medium
                                ${moreOpen ? "bg-amber-50/20" : "hover:bg-amber-50/10"}`}
                            style={{ textShadow: "none" }}
                        >
                            More
                            <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${moreOpen ? "rotate-180" : ""}`} />
                        </button>
                        {moreOpen && (
                            <div className="absolute top-full left-0 mt-1 z-50 bg-(--primary) border-2 border-(--outline) rounded-lg shadow-xl min-w-52 max-h-[80vh] overflow-y-auto" style={{ animation: "dropdown-in 150ms ease forwards" }}>
                                {overflowSections.map(section => {
                                    const pages = [...(section.pages ?? [])].sort((a, b) => (a.sort ?? 0) - (b.sort ?? 0));
                                    return (
                                        <div key={section.id}>
                                            <div className="px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-amber-50/40 border-b border-(--outline)/30 mt-1 first:mt-0">
                                                {section.title}
                                            </div>
                                            {pages.map(page => (
                                                <button
                                                    key={page.id}
                                                    onClick={() => navigateTo(buildSlug(page.slug))}
                                                    className="w-full text-left px-5 py-2 text-sm text-amber-50 hover:bg-amber-50/10 border-b border-(--outline)/20 last:border-b-0 transition-colors"
                                                    style={{ textShadow: "none" }}
                                                >
                                                    {page.navbarTitle || page.title}
                                                </button>
                                            ))}
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Right-side fixed items */}
            <div className="flex items-center gap-1 shrink-0">
                <button
                    onClick={() => navigateTo(buildSlug("leaderboard"))}
                    title="Leaderboard"
                    className="p-1.5 text-amber-50 cursor-pointer hover:opacity-70 transition-opacity"
                    style={{ textShadow: "none" }}
                >
                    <Trophy className="w-4 h-4" />
                </button>
                {isAdmin && (
                    <>
                        <button
                            onClick={() => navigateTo("/dashboard")}
                            title="Dashboard"
                            className="p-1.5 text-amber-50 cursor-pointer hover:opacity-70 transition-opacity"
                            style={{ textShadow: "none" }}
                        >
                            <LayoutDashboard className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => navigateTo(buildSlug("navigation-panel"))}
                            title="Nav Panel"
                            className="p-1.5 text-amber-50 cursor-pointer hover:opacity-70 transition-opacity"
                            style={{ textShadow: "none" }}
                        >
                            <Map className="w-4 h-4" />
                        </button>
                    </>
                )}

                <HorizontalSearch gameData={gameData} isLDG={isLDG} sectionsMap={sectionsMap} />

                {(isAdmin || isContributor) && (
                    <button
                        onClick={() => {
                            if (adminMode && dirtyBlocks.size > 0) {
                                if (!window.confirm("You have unsaved changes. Exit edit mode anyway?")) return;
                            }
                            setAdminMode(m => !m);
                        }}
                        title={adminMode ? "Exit edit mode" : "Enter edit mode"}
                        style={{ textShadow: "none" }}
                        className="p-1.5 text-amber-50 cursor-pointer hover:opacity-70 transition-opacity"
                    >
                        {adminMode ? <Eye className="w-4 h-4" /> : <Pencil className="w-4 h-4" />}
                        {adminMode && dirtyBlocks.size > 0 && (
                            <span className="ml-1.5 text-xs bg-green-600/60 px-1.5 py-0.5 rounded">
                                {dirtyBlocks.size} unsaved
                            </span>
                        )}
                    </button>
                )}
            </div>
        </div>
    );
}

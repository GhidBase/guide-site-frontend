import { useState, useRef, useEffect } from "react";
import { useRouteLoaderData, useNavigate } from "react-router";
import { ChevronDown, Search, X } from "lucide-react";
import { currentAPI } from "../../config/api";

function HorizontalSearch({ gameData, isLDG }) {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState([]);
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const debounceRef = useRef(null);
    const containerRef = useRef(null);
    const navigate = useNavigate();

    useEffect(() => {
        if (query.trim().length < 2) { setResults([]); setOpen(false); return; }
        clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(async () => {
            setLoading(true);
            try {
                const params = new URLSearchParams({ q: query.trim() });
                if (gameData?.id) params.set("gameId", gameData.id);
                const res = await fetch(currentAPI + "/search?" + params);
                const data = await res.json();
                setResults(data);
                setOpen(true);
            } catch { setResults([]); } finally { setLoading(false); }
        }, 300);
        return () => clearTimeout(debounceRef.current);
    }, [query]);

    useEffect(() => {
        function onClickOutside(e) {
            if (containerRef.current && !containerRef.current.contains(e.target)) setOpen(false);
        }
        document.addEventListener("mousedown", onClickOutside);
        return () => document.removeEventListener("mousedown", onClickOutside);
    }, []);

    function buildUrl(slug) {
        return isLDG ? "/" + slug : "/games/" + gameData?.slug + "/" + slug;
    }

    function handleSelect(result) {
        navigate(buildUrl(result.slug), { viewTransition: true });
        setQuery(""); setResults([]); setOpen(false);
    }

    return (
        <div ref={containerRef} className="relative w-56" style={{ textShadow: "none" }}>
            <div className="flex items-center gap-2 px-2.5 py-1 rounded-lg bg-amber-50/30 border border-amber-50/50">
                <Search className="w-3.5 h-3.5 text-amber-50/60 shrink-0" />
                <input
                    type="text"
                    value={query}
                    placeholder="Search..."
                    onChange={(e) => setQuery(e.target.value)}
                    onFocus={() => results.length > 0 && setOpen(true)}
                    className="flex-1 min-w-0 bg-transparent text-amber-50 text-xs outline-none placeholder:text-amber-50/50"
                    style={{ textShadow: "none" }}
                />
                {query && (
                    <button onClick={() => { setQuery(""); setResults([]); setOpen(false); }} className="opacity-60 hover:opacity-100 cursor-pointer">
                        <X className="w-3.5 h-3.5 text-amber-50" />
                    </button>
                )}
            </div>
            {open && results.length > 0 && (
                <div className="absolute top-full mt-1 left-0 right-0 z-50 bg-(--primary) border-2 border-(--outline) rounded-lg shadow-xl max-h-64 overflow-y-auto" style={{ animation: "dropdown-in 150ms ease forwards" }}>
                    {results.map((r) => (
                        <button key={r.id} onClick={() => handleSelect(r)}
                            className="w-full text-left px-3 py-2 flex flex-col gap-0.5 hover:bg-amber-50/10 border-b border-(--outline)/40 last:border-b-0">
                            <span className="text-xs font-semibold text-amber-50" style={{ textShadow: "none" }}>{r.title}</span>
                            <span className="text-xs text-amber-50/50" style={{ textShadow: "none" }}>{r.sectionTitle}</span>
                        </button>
                    ))}
                </div>
            )}
            {open && query.trim().length >= 2 && !loading && results.length === 0 && (
                <div className="absolute top-full mt-1 left-0 right-0 z-50 bg-(--primary) border-2 border-(--outline) rounded-lg px-3 py-2 shadow-xl">
                    <span className="text-xs text-amber-50/70" style={{ textShadow: "none" }}>No results found.</span>
                </div>
            )}
        </div>
    );
}

export default function HorizontalNavbar() {
    const { gameData, sectionsMap, isLDG } = useRouteLoaderData("main");
    const navigate = useNavigate();
    const [openSection, setOpenSection] = useState(null);
    const dropdownRef = useRef(null);

    const sections = Array.from(sectionsMap?.values() ?? [])
        .sort((a, b) => a.order - b.order);

    useEffect(() => {
        function onClickOutside(e) {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setOpenSection(null);
        }
        document.addEventListener("mousedown", onClickOutside);
        return () => document.removeEventListener("mousedown", onClickOutside);
    }, []);

    function buildSlug(pageSlug) {
        return isLDG ? "/" + pageSlug : "/games/" + gameData?.slug + "/" + pageSlug;
    }

    function navigateTo(slug) {
        navigate(slug, { viewTransition: true });
        setOpenSection(null);
    }

    return (
        <div ref={dropdownRef} className="flex items-center gap-1 px-4 py-1.5 border-t-4 border-(--outline) bg-(--primary)">
            <div className="flex items-center gap-1 flex-1 flex-wrap">
                {sections.map((section) => {
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
                })}
            </div>

            <HorizontalSearch gameData={gameData} isLDG={isLDG} />
        </div>
    );
}

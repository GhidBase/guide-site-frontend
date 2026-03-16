import { useState, useRef, useEffect } from "react";
import { useNavigate, useRouteLoaderData } from "react-router";
import { Search, X } from "lucide-react";
import { currentAPI } from "../config/api";

export default function SearchBar() {
    const { gameData, isLDG } = useRouteLoaderData("main");
    const navigate = useNavigate();
    const [query, setQuery] = useState("");
    const [results, setResults] = useState([]);
    const [open, setOpen] = useState(false);
    const [highlighted, setHighlighted] = useState(0);
    const [loading, setLoading] = useState(false);
    const inputRef = useRef(null);
    const containerRef = useRef(null);
    const debounceRef = useRef(null);

    function buildUrl(slug) {
        return isLDG
            ? "/" + slug
            : "/games/" + gameData?.slug + "/" + slug;
    }

    useEffect(() => {
        if (query.trim().length < 2) {
            setResults([]);
            setOpen(false);
            return;
        }

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
            } catch {
                setResults([]);
            } finally {
                setLoading(false);
            }
        }, 300);

        return () => clearTimeout(debounceRef.current);
    }, [query]);

    function handleSelect(result) {
        navigate(buildUrl(result.slug), { viewTransition: true });
        setQuery("");
        setResults([]);
        setOpen(false);
        inputRef.current?.blur();
    }

    function handleKeyDown(e) {
        if (e.key === "Escape") {
            setQuery("");
            setOpen(false);
            inputRef.current?.blur();
            return;
        }
        if (!open || results.length === 0) return;
        if (e.key === "ArrowDown") {
            e.preventDefault();
            setHighlighted((h) => (h + 1) % results.length);
        } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setHighlighted((h) => (h - 1 + results.length) % results.length);
        } else if (e.key === "Enter") {
            if (results[highlighted]) handleSelect(results[highlighted]);
        }
    }

    useEffect(() => {
        function handleClickOutside(e) {
            if (containerRef.current && !containerRef.current.contains(e.target)) {
                setOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    useEffect(() => {
        setHighlighted(0);
    }, [results]);

    const showNoResults = open && query.trim().length >= 2 && !loading && results.length === 0;

    return (
        <div ref={containerRef} className="relative w-full max-w-sm mx-auto" style={{ textShadow: "none" }}>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-(--surface-background) border border-(--outline-brown)/40">
                <Search className="w-4 h-4 text-(--text-color) opacity-70 shrink-0" />
                <input
                    ref={inputRef}
                    type="text"
                    value={query}
                    placeholder="Search pages..."
                    onChange={(e) => setQuery(e.target.value)}
                    onFocus={() => results.length > 0 && setOpen(true)}
                    onKeyDown={handleKeyDown}
                    className="flex-1 min-w-0 bg-transparent text-(--text-color) text-sm outline-none border-0 placeholder:text-(--primary) placeholder:opacity-100 placeholder:font-semibold"
                    style={{ textShadow: "none" }}
                />
                {query && (
                    <button
                        onClick={() => { setQuery(""); setResults([]); setOpen(false); }}
                        className="cursor-pointer opacity-40 hover:opacity-80"
                    >
                        <X className="w-4 h-4 text-(--text-color)" />
                    </button>
                )}
            </div>

            {open && results.length > 0 && (
                <div className="absolute top-full mt-1 left-0 right-0 z-50 bg-(--surface-background) border-2 border-(--outline) rounded-lg overflow-y-auto shadow-xl max-h-72">
                    {results.map((result, i) => (
                        <button
                            key={result.id}
                            onClick={() => handleSelect(result)}
                            onMouseEnter={() => setHighlighted(i)}
                            className={`w-full text-left px-4 py-2.5 flex flex-col gap-0.5 cursor-pointer border-b border-(--outline) last:border-b-0
                                ${i === highlighted ? "bg-(--primary)/20" : "hover:bg-(--primary)/10"}`}
                        >
                            <span className="text-sm font-semibold text-(--text-color)">
                                {result.title}
                            </span>
                            <span className="text-xs text-(--text-color) opacity-50">
                                {result.sectionTitle}
                            </span>
                        </button>
                    ))}
                </div>
            )}

            {showNoResults && (
                <div className="absolute top-full mt-1 left-0 right-0 z-50 bg-(--surface-background) border-2 border-(--outline) rounded-lg px-4 py-3 shadow-xl">
                    <span className="text-sm text-(--text-color)">No results found.</span>
                </div>
            )}
        </div>
    );
}

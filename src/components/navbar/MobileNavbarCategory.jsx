import { useLoaderData, useNavigate } from "react-router";
import { useRef } from "react";
import { useDarkMode } from "../../contexts/ThemeProvider.jsx";
import { ChevronDown } from "lucide-react";

export default function MobileNavbarCategory({
    section,
    toggleNav,
    isOpen,
    onToggle,
}) {
    const title = section.title;
    const pages = [...section.pages].sort((a, b) => (a.sort ?? 0) - (b.sort ?? 0));
    const linksRef = useRef(null);
    const { gameData, isLDG } = useLoaderData();
    const navigate = useNavigate();
    const { darkMode } = useDarkMode();

    return (
        <div id="mobile-menu-category" className="mb-[8px] w-full ">
            <button
                id="mobile-menu-cat-header"
                className="w-full flex items-center justify-between border-2 px-3 py-2.5 text-amber-50 font-medium text-xs tracking-widest uppercase"
                style={{
                    background: darkMode ? "rgba(255,255,255,0.04)" : "var(--primary)",
                    borderColor: darkMode ? "rgba(255,235,200,0.1)" : "var(--outline-brown)",
                }}
                onClick={onToggle}
            >
                <span>{title} ({pages.length})</span>
                <ChevronDown
                    className="w-3.5 h-3.5 opacity-60 transition-transform duration-300"
                    style={{ transform: isOpen ? "rotate(180deg)" : "rotate(0deg)" }}
                />
            </button>

            <div
                ref={linksRef}
                id="mobile-menu-links"
                className="border-2 border-t-0 overflow-hidden transition-all duration-300 ease-in-out"
                style={{
                    borderColor: darkMode ? "rgba(255,235,200,0.08)" : "var(--outline-brown)",
                    height: isOpen ? linksRef.current?.scrollHeight + "px" : "0px",
                }}
            >
                {pages.map((page) => {
                    var actualSlug;
                    if (isLDG) {
                        actualSlug = "/" + page.slug;
                    } else {
                        actualSlug =
                            "/games/" + gameData.slug + "/" + page.slug;
                    }
                    return (
                        <button
                            key={page.id}
                            className="block w-full text-left px-[12px] py-[10px] border-t-[1px] cursor-pointer"
                            style={{
                                borderColor: darkMode ? "rgba(255,235,200,0.08)" : "var(--outline-brown)",
                                color: darkMode ? "rgba(255,235,200,0.8)" : "var(--text-color)",
                            }}
                            onClick={() => {
                                toggleNav(false);
                                setTimeout(() => {
                                    navigate(actualSlug, { viewTransition: true });
                                }, 250);
                            }}
                        >
                            {page.title}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}

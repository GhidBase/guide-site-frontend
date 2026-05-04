import { useState } from "react";
import { LogOut } from "lucide-react";
import SearchBar from "../SearchBar";
import discordLogo from "../../assets/icons8-discord-50.png";
import MobileNavbarCategory from "./MobileNavbarCategory";
import { useLoaderData, Link } from "react-router";
import { Moon, Sun } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useDarkMode } from "../../contexts/ThemeProvider.jsx";

export default function MobileNavbar({ toggleNav, navOpen }) {
    console.log("navbar rendered");
    const { gameData, sectionsMap } = useLoaderData();
    const sections = Array.from(sectionsMap.values());
    const [openedSections, setOpenedSections] = useState(new Set(sections[0] ? [sections[0].id] : []));
    const allOpen = sections.every((s) => openedSections.has(s.id));

    function toggleSection(id) {
        setOpenedSections((prev) => {
            const next = new Set(prev);
            next.has(id) ? next.delete(id) : next.add(id);
            return next;
        });
    }
    function toggleAll() {
        setOpenedSections(allOpen ? new Set() : new Set(sections.map((s) => s.id)));
    }
    const { isAuthenticated, user, logout } = useAuth();
    const { darkMode, toggleDarkMode } = useDarkMode();

    const actualSections = sections.map((section) => ({
        ...section,
        pages: [...section.pages],
    }));


    async function handleLogout() {
        const res = await logout();
        //navigate("/");
        toggleNav(false);
    }

    return (
        <div
            className={`mobile-menu-overlay bg-black/40 w-full h-full fixed inset-0 z-50  ${navOpen ? "opacity-100" : "opacity-0 pointer-events-none"} transition-all lg:hidden text-[0.8em] duration-250 `}
            onClick={(e) => {
                if (e.target === e.currentTarget) {
                    toggleNav();
                }
            }}
        >
            <div
                id="mobile-menu-panel"
                className={`rounded-lg
                    fixed inset-4 top-16 bottom-16 z-[51]
                    items-stretch flex flex-col justify-start
                    bg-(--surface-background) border-(--outline-brown) border-[2px] shadow-lg shadow-black/50
                    transition-all duration-200
                    ${navOpen ? "translate-y-0" : "translate-y-full"} `}
            >
                <div
                    id="mobile-menu-header"
                    //className=" w-full text-left border-b-[2px] px-[12px] py-[12px] flex gap-[8px] border-(--outline-brown) "
                    className=" w-full text-left border-b-[2px] px-[12px] flex flex-col gap-[8px] border-(--outline-brown) "
                >
                    {sectionsMap && (
                        <div className="w-full pt-3 pb-1">
                            <SearchBar />
                        </div>
                    )}
                    {isAuthenticated ? (
                        <div className="w-full flex flex-col pt-3 bg-(--surface-background)">
                            <p className="text-xl text-(--text-color) text-center font-semibold mb-3">
                                {user?.username}
                            </p>
                            <div className="flex gap-2">
                                <button
                                    onClick={toggleDarkMode}
                                    className="flex-1 text-amber-50 rounded px-2 py-1 font-semibold cursor-pointer hover:opacity-90 text-sm h-8 flex items-center justify-center"
                                    style={{ background: darkMode ? "rgba(255,235,200,0.12)" : "var(--primary)" }}
                                >
                                    {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                                </button>
                                <button
                                    onClick={handleLogout}
                                    className="flex-1 rounded px-2 py-1 font-semibold cursor-pointer hover:opacity-90 text-sm h-8 flex items-center justify-center border border-red-500/70 bg-red-700/60 text-red-100"
                                >
                                    <LogOut className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="w-full flex gap-2 p-4 bg-(--surface-background)">
                            <button
                                onClick={toggleDarkMode}
                                className="text-amber-50 rounded px-2 py-1 cursor-pointer hover:opacity-90 h-8 flex items-center justify-center"
                                style={{ background: darkMode ? "rgba(255,235,200,0.12)" : "var(--primary)" }}
                            >
                                {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                            </button>
                            <Link
                                to="/login"
                                onClick={() => toggleNav(false)}
                                className="flex-1 text-center text-amber-50 rounded px-2 py-1 font-semibold cursor-pointer hover:opacity-90 text-sm"
                                style={{ background: darkMode ? "rgba(255,235,200,0.12)" : "var(--primary)" }}
                            >
                                Log In
                            </Link>
                            <Link
                                to="/signup"
                                onClick={() => toggleNav(false)}
                                className="flex-1 text-center text-amber-50 rounded px-2 py-1 font-semibold cursor-pointer hover:opacity-90 text-sm"
                                style={{ background: darkMode ? "rgba(255,235,200,0.12)" : "var(--primary)" }}
                            >
                                Sign Up
                            </Link>
                        </div>
                    )}
                </div>
                <div className="mobile-menu-feedback  "></div>
                <div
                    id="mobile-menu-categories"
                    className=" flex flex-col overflow-y-auto px-[12px] py-[8px] flex-1 "
                >
                    <button
                        onClick={toggleAll}
                        className="w-full text-xs py-1.5 px-3 flex items-center justify-end gap-1 cursor-pointer mb-1 transition-opacity hover:opacity-100"
                        style={{ color: darkMode ? "rgba(255,235,200,0.85)" : "var(--text-color)", opacity: darkMode ? 1 : 1 }}
                    >
                        {allOpen ? "Collapse all" : "Expand all"}
                    </button>
                    {actualSections.map((section) => (
                        <MobileNavbarCategory
                            key={section.id}
                            toggleNav={toggleNav}
                            section={section}
                            isOpen={openedSections.has(section.id)}
                            onToggle={() => toggleSection(section.id)}
                        />
                    ))}
                </div>
                <div
                    id="mobile-menu-persistent"
                    className="flex flex-col items-center pt-2.5 pb-2 text-(--text-color) px-3 border-t-2"
                    style={{ borderColor: "var(--outline-brown)" }}
                >
                    {gameData?.discordUrl && (
                        <div className="flex items-center gap-2 ">
                            <p className="  ">Join the community: </p>
                            <a
                                href={gameData.discordUrl}
                                className="flex items-center justify-center gap-2 bg-[#5865f2] py-2 px-4 rounded-md "
                            >
                                <img src={discordLogo} className="h-[1.25em] " />
                                <p className="text-white text-[0.8em] ">Discord</p>
                            </a>
                        </div>
                    )}
                    <div className="px-8 w-full my-2 ">
                        <hr className="w-full border-t" style={{ borderColor: darkMode ? "rgba(255,235,200,0.1)" : "rgba(139,90,43,0.3)" }} />
                    </div>
                    <div id="nav-footer" className=" text-[0.8em] text-center ">
                        © 2025 LuckyDefenseGuides.com. This site is not
                        affiliated with or endorsed by the creators of Lucky
                        Defense. |{" "}
                        <a
                            id="privacy-policy"
                            className=""
                            href="/pages/privacy-policy.html"
                        >
                            Privacy Policy
                        </a>
                        {gameData && (
                            <>
                                {" "}|{" "}
                                <Link
                                    to={`/games/${gameData.slug}/leaderboard`}
                                    onClick={() => toggleNav(false)}
                                    className=""
                                >
                                    Leaderboard
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

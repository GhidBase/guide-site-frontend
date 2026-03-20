import NavbarButton from "./NavbarButton";
import { LogOut, ChevronsUpDown } from "lucide-react";
import { useRouteLoaderData, Link, useNavigate } from "react-router";
import { Fragment, useState } from "react";
import NavbarSection from "./NavbarSection";
import NavbarEditButton from "./NavbarEditButton";
import { useAuth } from "@/hooks/useAuth";
import SearchBar from "../SearchBar";
import { useDarkMode } from "../../contexts/ThemeProvider.jsx";

export default function Navbar({
    className,
    obstructorClassName,
    toggleNav,
    closeClassName,
}) {
    const { gameData, sectionsMap, isLDG } = useRouteLoaderData("main");
    const { isAuthenticated, user, logout, isLoading } = useAuth();
    const { darkMode } = useDarkMode();
    const isAdmin = user?.role == "ADMIN";
    const navigate = useNavigate();
    const [editMode, setEditMode] = useState(false);
    const [collapsedSections, setCollapsedSections] = useState(new Set());
    const gameSlug = isLDG ? "" : "/games/" + gameData?.slug;

    function toggleSection(id) {
        setCollapsedSections((prev) => {
            const next = new Set(prev);
            next.has(id) ? next.delete(id) : next.add(id);
            return next;
        });
    }
    const navbarItems = [];

    function toggleEditMode() {
        setEditMode(!editMode);
    }

    async function handleLogout() {
        await logout();
        //navigate("/");
        toggleNav(false);
    }

    const navbar = [
        {
            id: 2,
            slug: gameSlug,
            navbarTitle: "Homepage",
            type: "page",
        },
        {
            id: 22,
            navbarTitle: "Fundamentals",
            type: "section",
        },
        {
            id: 3,
            slug: gameSlug + "/stun-guide",
            navbarTitle: "Stun Guide",
            type: "page",
        },
        {
            id: 4,
            slug: gameSlug + "/defense-reduction",
            navbarTitle: "Defense Reduction",
            type: "page",
        },
        {
            id: 5,
            slug: gameSlug + "/sb-mg",
            navbarTitle: "Safebox and Moneygun",
            type: "page",
        },
        {
            id: 6,
            slug: gameSlug + "/mythic-categories",
            navbarTitle: "Types of Mythics",
            type: "page",
        },
        {
            id: 7,
            slug: gameSlug + "/mp-regen",
            navbarTitle: "MP Regen Guide",
            type: "page",
        },
        {
            id: 8,
            slug: gameSlug + "/attack-speed",
            navbarTitle: "Attack Speed",
            type: "page",
        },
        {
            id: 28,
            navbarTitle: "General",
            type: "section",
        },
        {
            id: 27,
            slug: gameSlug + "/guardian-upgrade-costs",
            navbarTitle: "Guardian Upgrade Costs",
            type: "page",
        },
        {
            id: 23,
            navbarTitle: "Hard Mode",
            type: "section",
        },
        {
            id: 10,
            slug: gameSlug + "/unlock-order-hard",
            navbarTitle: "Mythic Unlock Order",
            type: "page",
        },
        {
            id: 31,
            navbarTitle: "Lance Kitty Strat",
            type: "page",
            slug: gameSlug + "/lance-kitty",
        },
        {
            id: 24,
            navbarTitle: "Hell Mode",
            type: "section",
        },
        {
            id: 11,
            slug: gameSlug + "/hell-mode-basics",
            navbarTitle: "Hell Mode Fundamentals",
            type: "page",
        },
        {
            id: 12,
            slug: gameSlug + "/hell-mode",
            navbarTitle: "Hell Mode Guide",
            type: "page",
        },
        {
            id: 13,
            slug: gameSlug + "/hell-mode-bosses",
            navbarTitle: "Hell Mode Bosses/Debuffs",
            type: "page",
        },
        {
            id: 14,
            slug: gameSlug + "/magic-hell-build",
            navbarTitle: "Magic Hell Build",
            type: "page",
        },
        { id: 30, navbarTitle: "Guild Battle", type: "section" },
        {
            id: 29,
            navbarTitle: "Guild Battle Guide",
            type: "page",
            slug: gameSlug + "/guild-battle",
        },
        {
            id: 25,
            navbarTitle: "Treasures",
            type: "section",
        },
        {
            id: 15,
            slug: gameSlug + "/exclusive-treasures",
            navbarTitle: "Exclusive Treasures",
            type: "page",
        },
        {
            id: 16,
            slug: gameSlug + "/treasure-upgrade-costs",
            navbarTitle: "Treasure Upgrade Costs",
            type: "page",
        },
        {
            id: 17,
            slug: gameSlug + "/unlock-treasures",
            navbarTitle: "How to Unlock Treasures",
            type: "page",
        },
        {
            id: 26,
            navbarTitle: "Other",
            type: "section",
        },
        {
            id: 18,
            slug: gameSlug + "/safe-box-table",
            navbarTitle: "Safe Box Earnings Table",
            type: "page",
        },
        {
            id: 19,
            slug: gameSlug + "/pets",
            navbarTitle: "List of Pets",
            type: "page",
        },
        {
            id: 20,
            slug: gameSlug + "/daily-fortunes",
            navbarTitle: "List of Daily Fortunes",
            type: "page",
        },

        {
            id: 21,
            slug: gameSlug + "/indy-treasures",
            navbarTitle: "Indy's Treasures",
            type: "page",
        },
        {
            id: 9,
            slug: gameSlug + "/newbie-quests",
            navbarTitle: "Help I'm New! Guide Quests",
            type: "page",
        },
        // {
        //     id: 501,
        //     navbarTitle: "Other Games",
        //     type: "section",
        // },
        // {
        //     id: 502,
        //     navbarTitle: "Coop TD",
        //     slug: "/coop-td",
        //     type: "page",
        // },
    ];

    const navbarSilksong = [
        {
            id: 401,
            slug: gameSlug + "/",
            navbarTitle: "Silksong Guides",
            type: "page",
        },
        {
            id: 402,
            slug: gameSlug + "/flea-guide",
            navbarTitle: "Flea Guide",
            type: "page",
        },
        {
            id: 403,
            navbarTitle: "Other Games",
            type: "section",
        },
        {
            id: 404,
            navbarTitle: "Lucky Defense",
            slug: "/lucky-defense",
            type: "page",
        },
    ];

    const navbarCoopTD = [
        {
            id: 201,
            slug: gameSlug + "/",
            navbarTitle: "Homepage",
            type: "page",
        },

        {
            id: 202,
            navbarTitle: "Other Games",
            type: "section",
        },
        {
            id: 203,
            navbarTitle: "Lucky Defense",
            slug: "https://luckydefenseguides.com/",
            type: "page",
        },
    ];

    // Add dev-only pages at the start
    if (isAuthenticated && isAdmin) {
        navbarItems.push(
            {
                id: "nav-panel",
                slug: "navigation-panel",
                navbarTitle: "Navigation Panel",
                type: "page",
                nonEditable: true,
            },
            {
                //id: "edit-nav",
                //type: "edit-button",
                //navbarTitle: "Edit Navbar",
                //nonEditable: true,
            },
        );
    }

    const dynamicNav = true;
    // Manual navbar
    if (!dynamicNav) {
        switch (gameData.slug) {
            case "silksong":
                navbarItems.push(navbarSilksong);
                console.log("SK");
                break;
            case "lucky-defense":
                navbarItems.push(navbar);
                console.log("LDG");
                break;
            case "coop-td":
                navbarItems.push(navbarCoopTD);
                console.log("coopTD");
                break;
            default:
                navbarItems.push(navbar);
                console.log("LDG");
                break;
        }
    } else {
        // dynamic navbar
        // Add sections and their pages from the map
        Array.from(sectionsMap.values())
            .sort((a, b) => a.order - b.order)
            .forEach((section, index) => {
                // Add section header
                if (
                    (index != 0 && gameData.title == "Lucky Defense") ||
                    gameData.title != "Lucky Defense"
                ) {
                    navbarItems.push({
                        id: section.id,
                        navbarTitle: section.title,
                        type: "section",
                    });
                }

                // Add pages under this section
                [...section.pages].sort((a, b) => (a.sort ?? 0) - (b.sort ?? 0)).forEach((page) => {
                    navbarItems.push({
                        id: page.id,
                        slug: page.slug,
                        navbarTitle: page.title,
                        type: "page",
                    });
                });
            });
    }

    navbarItems.push({
        id: "leaderboard",
        slug: "leaderboard",
        navbarTitle: "Leaderboard",
        type: "page",
        nonEditable: true,
    });

    return (
        <Fragment>
            <div id="nav-bar" className={className} style={{ fontFamily: "'Outfit', sans-serif", ...(darkMode ? { background: "#0f0c0a", color: "rgba(255,235,200,0.85)" } : {}) }}>
                <div className="w-full flex flex-col">
                    {!isLoading && (
                        <div className="w-full border-b-4 border-(--outline)" style={darkMode ? { borderColor: "rgba(255,235,200,0.08)" } : {}}>
                            {sectionsMap && (
                                <div className="px-3 py-2" style={{ background: darkMode ? "rgba(255,255,255,0.03)" : "var(--surface-background)" }}>
                                    <SearchBar />
                                </div>
                            )}
                            {isAuthenticated ? (
                                <div className="w-full flex flex-col p-4" style={{ background: darkMode ? "rgba(255,255,255,0.03)" : "var(--surface-background)" }}>
                                    <p className="text-xl text-center font-semibold mb-3" style={{ color: darkMode ? "rgba(255,235,200,0.7)" : "var(--text-color)" }}>
                                        {user?.username}
                                    </p>
                                    {isAdmin && (
                                        <button
                                            onClick={() => {
                                                navigate("/dashboard");
                                                toggleNav(false);
                                            }}
                                            className="w-full text-amber-50 rounded px-2 py-1 font-semibold cursor-pointer hover:opacity-90 text-sm mb-2"
                                            style={{ background: darkMode ? "rgba(255,235,200,0.12)" : "var(--primary)" }}
                                        >
                                            Dashboard
                                        </button>
                                    )}
                                    <button
                                        onClick={handleLogout}
                                        className="text-xs px-3 py-1.5 rounded border border-red-500/70 bg-red-700/60 text-red-100 hover:bg-red-700/80 transition-colors cursor-pointer font-medium flex items-center justify-center"
                                    >
                                        <LogOut className="w-4 h-4" />
                                    </button>
                                </div>
                            ) : (
                                <div className="w-full flex gap-2 p-4" style={{ background: darkMode ? "rgba(255,255,255,0.03)" : "var(--surface-background)" }}>
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
                    )}
                </div>
                {(() => {
                    // Group flat items into sections
                    const groups = [];
                    let cur = { sectionId: null, sectionTitle: null, items: [] };
                    groups.push(cur);
                    for (const item of navbarItems) {
                        if (item.type === "section") {
                            cur = { sectionId: item.id, sectionTitle: item.navbarTitle, items: [] };
                            groups.push(cur);
                        } else {
                            cur.items.push(item);
                        }
                    }
                    const sectionIds = groups.filter((g) => g.sectionId).map((g) => g.sectionId);
                    const allCollapsed = sectionIds.length > 0 && sectionIds.every((id) => collapsedSections.has(id));

                    return (
                        <>
                            {sectionIds.length > 0 && (
                                <button
                                    onClick={() => setCollapsedSections(allCollapsed ? new Set() : new Set(sectionIds))}
                                    className="w-full text-xs py-1.5 px-3 flex items-center justify-end gap-1 cursor-pointer transition-opacity hover:opacity-80 border-b"
                                    style={{ background: darkMode ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.1)", color: "rgba(255,235,200,0.35)", fontFamily: "'Outfit', sans-serif", letterSpacing: "0.08em", borderColor: darkMode ? "rgba(255,235,200,0.08)" : "var(--outline)" }}
                                >
                                    <ChevronsUpDown className="w-3 h-3" />
                                    {allCollapsed ? "Expand all" : "Collapse all"}
                                </button>
                            )}
                            {groups.map((group) => (
                                <Fragment key={group.sectionId ?? "__pre__"}>
                                    {group.sectionId && (
                                        <NavbarSection
                                            navbarTitle={group.sectionTitle}
                                            isCollapsed={collapsedSections.has(group.sectionId)}
                                            onToggle={() => toggleSection(group.sectionId)}
                                            darkMode={darkMode}
                                            className="w-full"
                                        />
                                    )}
                                    <div style={{
                                        display: "grid",
                                        gridTemplateRows: group.sectionId && collapsedSections.has(group.sectionId) ? "0fr" : "1fr",
                                        transition: "grid-template-rows 0.35s cubic-bezier(0.16,1,0.3,1)",
                                    }}><div style={{ overflow: "hidden" }}>
                                        {group.items.map((item) => {
                                            if (item.type === "page") return (
                                                <NavbarButton
                                                    key={item.id}
                                                    slug={item.slug}
                                                    navbarEditMode={editMode}
                                                    nonEditable={item.nonEditable}
                                                    navbarTitle={item.navbarTitle}
                                                    buttonData={item}
                                                    className={darkMode
                                                        ? "w-full h-20 flex items-center justify-center lg:h-15 border-b border-white/8 text-center text-amber-50/75 hover:text-amber-50 hover:bg-white/5 transition-colors"
                                                        : "w-full h-20 flex items-center justify-center lg:h-15 border-b-4 border-(--outline) text-center text-amber-50"
                                                    }
                                                    toggleNav={toggleNav}
                                                />
                                            );
                                            if (item.type === "edit-button") return (
                                                <NavbarEditButton
                                                    key={item.id}
                                                    toggleEditMode={toggleEditMode}
                                                    navbarEditMode={editMode}
                                                    navbarTitle={item.navbarTitle}
                                                    nonEditable={item.nonEditable}
                                                    buttonData={item}
                                                    className="w-full h-20 cursor-pointer flex items-center justify-center lg:h-15 border-b-4 border-(--outline)"
                                                />
                                            );
                                            return null;
                                        })}
                                    </div></div>
                                </Fragment>
                            ))}
                        </>
                    );
                })()}
            </div>
            <button onClick={toggleNav} className={closeClassName + " hidden"}>
                Close
            </button>
            <div
                id="navbar-obstructor"
                onClick={toggleNav}
                className={obstructorClassName + " lg:hidden"}
            ></div>
        </Fragment>
    );
}

import NavbarButton from "./NavbarButton";
import { Fragment } from "react";
import NavbarSection from "./NavbarSection";
import { Link, useNavigate } from "react-router";
import { useAuth } from "../../hooks/useAuth";

export default function Navbar({
    className,
    obstructorClassName,
    toggleNav,
    closeClassName,
}) {
    const navigate = useNavigate();
    const { isAuthenticated, user, logout, loading } = useAuth();

    const navbar = [
        ...(user?.role === "ADMIN"
            ? [
                  {
                      id: 1,
                      slug: "/page-manager",
                      navbarTitle: "Page Manager",
                      type: "page",
                  },
              ]
            : []),
        {
            id: 32,
            slug: "/immortal-guardians",
            navbarTitle: "Immortal Guardians",
            type: "page",
        },
        {
            id: 2,
            slug: "/",
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
            slug: "/stun-guide",
            navbarTitle: "Stun Guide",
            type: "page",
        },
        {
            id: 4,
            slug: "/defense-reduction",
            navbarTitle: "Defense Reduction",
            type: "page",
        },
        {
            id: 5,
            slug: "/sb-mg",
            navbarTitle: "Safebox and Moneygun",
            type: "page",
        },
        {
            id: 6,
            slug: "/mythic-categories",
            navbarTitle: "Types of Mythics",
            type: "page",
        },
        {
            id: 7,
            slug: "/mp-regen",
            navbarTitle: "MP Regen Guide",
            type: "page",
        },
        {
            id: 8,
            slug: "/attack-speed",
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
            slug: "/guardian-upgrade-costs",
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
            slug: "/unlock-order-hard",
            navbarTitle: "Mythic Unlock Order",
            type: "page",
        },
        {
            id: 31,
            navbarTitle: "Lance Kitty Strat",
            type: "page",
            slug: "/lance-kitty",
        },
        {
            id: 24,
            navbarTitle: "Hell Mode",
            type: "section",
        },
        {
            id: 11,
            slug: "/hell-mode-basics",
            navbarTitle: "Hell Mode Fundamentals",
            type: "page",
        },
        {
            id: 12,
            slug: "/hell-mode",
            navbarTitle: "Hell Mode Guide",
            type: "page",
        },
        {
            id: 13,
            slug: "/hell-mode-bosses",
            navbarTitle: "Hell Mode Bosses/Debuffs",
            type: "page",
        },
        {
            id: 14,
            slug: "/magic-hell-build",
            navbarTitle: "Magic Hell Build",
            type: "page",
        },
        { id: 30, navbarTitle: "Guild Battle", type: "section" },
        {
            id: 29,
            navbarTitle: "Guild Battle Guide",
            type: "page",
            slug: "/guild-battle",
        },
        {
            id: 25,
            navbarTitle: "Treasures",
            type: "section",
        },
        {
            id: 15,
            slug: "/exclusive-treasures",
            navbarTitle: "Exclusive Treasures",
            type: "page",
        },
        {
            id: 16,
            slug: "/treasure-upgrade-costs",
            navbarTitle: "Treasure Upgrade Costs",
            type: "page",
        },
        {
            id: 17,
            slug: "/unlock-treasures",
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
            slug: "/safe-box-table",
            navbarTitle: "Safe Box Earnings Table",
            type: "page",
        },
        {
            id: 19,
            slug: "/pets",
            navbarTitle: "List of Pets",
            type: "page",
        },
        {
            id: 20,
            slug: "/daily-fortunes",
            navbarTitle: "List of Daily Fortunes",
            type: "page",
        },
        {
            id: 21,
            slug: "/indy-treasures",
            navbarTitle: "Indy's Treasures",
            type: "page",
        },
        {
            id: 9,
            slug: "/newbie-quests",
            navbarTitle: "Help I'm New! Guide Quests",
            type: "page",
        },
    ];

    async function handleLogout() {
        await logout();
        navigate("/");
        toggleNav(false);
    }

    return (
        <Fragment>
            <div id="nav-bar" className={className}>
                <div className="w-full flex flex-col">
                    {!loading && (
                        <div className="w-full border-b-4 border-(--outline)">
                            {isAuthenticated ? (
                                <div className="w-full flex flex-col p-4 bg-(--surface-background)">
                                    <p className="text-xl text-(--text-color) text-center font-semibold mb-3">
                                        {user?.username}
                                    </p>
                                    {(user?.role === "ADMIN" ||
                                        user?.role === "EDITOR") && (
                                        <button
                                            onClick={() => {
                                                navigate("/dashboard");
                                                toggleNav(false);
                                            }}
                                            className="w-full text-amber-50 bg-(--primary) rounded px-2 py-1 font-semibold cursor-pointer hover:opacity-90 text-sm mb-2"
                                        >
                                            Dashboard
                                        </button>
                                    )}
                                    <button
                                        onClick={handleLogout}
                                        className="w-full text-amber-50 bg-(--primary) rounded px-2 py-1 font-semibold cursor-pointer hover:opacity-90 text-sm"
                                    >
                                        Logout
                                    </button>
                                </div>
                            ) : (
                                <div className="w-full flex gap-2 p-4 bg-(--surface-background)">
                                    <Link
                                        to="/login"
                                        onClick={() => toggleNav(false)}
                                        className="flex-1 text-center text-amber-50 bg-(--primary) rounded px-2 py-1 font-semibold cursor-pointer hover:opacity-90 text-sm"
                                    >
                                        Log In
                                    </Link>
                                    <Link
                                        to="/signup"
                                        onClick={() => toggleNav(false)}
                                        className="flex-1 text-center text-amber-50 bg-(--primary) rounded px-2 py-1 font-semibold cursor-pointer hover:opacity-90 text-sm"
                                    >
                                        Sign Up
                                    </Link>
                                </div>
                            )}
                        </div>
                    )}
                </div>
                {navbar.map((item, index, arr) => {
                    if (item.type === "page") {
                        return (
                            <NavbarButton
                                slug={item.slug}
                                navbarTitle={item.navbarTitle}
                                key={item.id}
                                className={`
                                    w-full h-20
                                    flex items-center justify-center
                                    lg:h-15 lg:border-b-4 border-(--outline)
                                    ${index < arr.length - 1 && "border-b-4"}`}
                                toggleNav={toggleNav}
                            />
                        );
                    }
                    if (item.type === "section") {
                        return (
                            <NavbarSection
                                navbarTitle={item.navbarTitle}
                                key={item.id}
                                className={`
                                    w-full h-15
                                    text-2xl font-bold underline
                                    flex items-center justify-center
                                    bg-(--surface-background) text-(--text-color) lg:border-b-4 border-(--outline)
                                    ${index < arr.length - 1 && "border-b-4"}`}
                            />
                        );
                    }
                })}
            </div>
            <button onClick={toggleNav} className={closeClassName}>
                Close
            </button>
            <div
                id="navbar-obstructor"
                onClick={toggleNav}
                className={obstructorClassName}
            ></div>
        </Fragment>
    );
}

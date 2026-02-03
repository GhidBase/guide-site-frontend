import NavbarButton from "./NavbarButton";
import { useLoaderData } from "react-router";
import { Fragment } from "react";
import NavbarSection from "./NavbarSection";
const env = import.meta.env.VITE_ENV;
const isLDG = import.meta.env.VITE_LDG == "True";

export default function Navbar({
    className,
    obstructorClassName,
    toggleNav,
    closeClassName,
}) {
    const { gameData } = useLoaderData();
    const gameSlug = isLDG ? "" : "/games/" + gameData?.slug;

    const navbar = [
        {
            id: 32,
            slug: gameSlug + "/immortal-guardians",
            navbarTitle: "Immortal Guardians",
            type: "page",
        },
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

    let curNav = {};
    switch (gameData.slug) {
        case "silksong":
            curNav = navbarSilksong;
            break;
        case "lucky-defense":
            curNav = navbar;
            break;
        case "coop-td":
            curNav = navbarCoopTD;
            break;
        default:
            curNav = navbar;
            break;
    }

    if (env == "DEV") {
        curNav.unshift(
            {
                id: 102,
                slug: gameSlug + "/game-manager",
                navbarTitle: "Game Manager",
                type: "page",
            },
            {
                id: 101,
                slug: gameSlug + "/page-manager",
                navbarTitle: "Page Manager",
                type: "page",
            },
        );
    }
    return (
        <Fragment>
            <div id="nav-bar" className={className}>
                {curNav.map((item, index, arr) => {
                    if (item.type == "page") {
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
                    if (item.type == "section") {
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

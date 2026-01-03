import NavbarButton from "./NavbarButton";
import { Fragment } from "react";
import NavbarSection from "./NavbarSection";

const navbar = [
    {
        id: 0,
        slug: null,
        navbarTitle: "General",
        type: "section",
    },
    {
        id: 1,
        slug: "/page-manager",
        navbarTitle: "Page Manager",
        type: "page",
    },
    {
        id: 2,
        slug: "/page-manager/56",
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
        slug: "/page-manager/57",
        navbarTitle: "Stun Guide",
        type: "page",
    },
    {
        id: 4,
        slug: "/page-manager/58",
        navbarTitle: "Defense Reduction",
        type: "page",
    },
    {
        id: 5,
        slug: "/page-manager/59",
        navbarTitle: "Safebox and Moneygun",
        type: "page",
    },
    {
        id: 6,
        slug: "/page-manager/60",
        navbarTitle: "Types of Mythics",
        type: "page",
    },
    {
        id: 7,
        slug: "/page-manager/61",
        navbarTitle: "MP Regen Guide",
        type: "page",
    },
    {
        id: 8,
        slug: "/page-manager/62",
        navbarTitle: "Attack Speed",
        type: "page",
    },
    {
        id: 23,
        navbarTitle: "Hard Mode",
        type: "section",
    },
    {
        id: 10,
        slug: "/page-manager/64",
        navbarTitle: "Hard Mode Guide",
        type: "page",
    },
    {
        id: 24,
        slug: "/page-manager/65",
        navbarTitle: "Hell Mode",
        type: "section",
    },
    {
        id: 11,
        slug: "/page-manager/65",
        navbarTitle: "Hell Mode Fundamentals",
        type: "page",
    },
    {
        id: 12,
        slug: "/page-manager/66",
        navbarTitle: "Hell Mode Guide",
        type: "page",
    },
    {
        id: 13,
        slug: "/page-manager/67",
        navbarTitle: "Hell Mode Bosses/Debuffs",
        type: "page",
    },
    {
        id: 14,
        slug: "/page-manager/68",
        navbarTitle: "Magic Hell Build",
        type: "page",
    },
    {
        id: 25,
        slug: "/page-manager/65",
        navbarTitle: "Treasures",
        type: "section",
    },
    {
        id: 15,
        slug: "/page-manager/69",
        navbarTitle: "Exclusive Treasures",
        type: "page",
    },
    {
        id: 16,
        slug: "/page-manager/70",
        navbarTitle: "Treasure Upgrade Costs",
        type: "page",
    },
    {
        id: 17,
        slug: "/page-manager/71",
        navbarTitle: "How to Unlock Treasures",
        type: "page",
    },
    {
        id: 26,
        slug: "/page-manager/65",
        navbarTitle: "Other",
        type: "section",
    },
    {
        id: 18,
        slug: "/page-manager/72",
        navbarTitle: "Safe Box Earnings Table",
        type: "page",
    },
    {
        id: 19,
        slug: "/page-manager/73",
        navbarTitle: "List of Pets",
        type: "page",
    },
    {
        id: 20,
        slug: "/page-manager/74",
        navbarTitle: "List of Daily Fortunes",
        type: "page",
    },

    {
        id: 21,
        slug: "/page-manager/75",
        navbarTitle: "Indy's Treasures",
        type: "page",
    },
    {
        id: 9,
        slug: "/page-manager/63",
        navbarTitle: "Help I'm New! Guide Quests",
        type: "page",
    },
];

export default function Navbar({
    className,
    obstructorClassName,
    toggleNav,
    navOpen,
    closeClassName,
}) {
    return (
        <Fragment>
            <div id="nav-bar" className={className}>
                {navbar.map((item) => {
                    if (item.type == "page") {
                        return (
                            <NavbarButton
                                slug={item.slug}
                                navbarTitle={item.navbarTitle}
                                key={item.id}
                                className={`w-full h-20 flex items-center justify-center`}
                            />
                        );
                    }
                    if (item.type == "section") {
                        return (
                            <NavbarSection
                                slug="test"
                                navbarTitle={item.navbarTitle}
                                key={item.id}
                                className={`
                                    w-full h-16
                                    text-3xl font-bold underline
                                    flex items-center justify-center
                                    bg-(--surface-background) text-(--text-color)`}
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

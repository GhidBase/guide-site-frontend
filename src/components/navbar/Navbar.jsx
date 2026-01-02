import NavbarButton from "./NavbarButton";

const navbar = [
    {
        id: 1,
        slug: "/page-manager",
        navbarTitle: "Page Manager",
    },
    {
        id: 2,
        slug: "/page-manager/56",
        navbarTitle: "Homepage",
    },
    {
        id: 3,
        slug: "/page-manager/57",
        navbarTitle: "Stun Guide",
    },
    {
        id: 4,
        slug: "/page-manager/58",
        navbarTitle: "Defense Reduction",
    },
    {
        id: 5,
        slug: "/page-manager/59",
        navbarTitle: "Safebox and Moneygun",
    },
    {
        id: 6,
        slug: "/page-manager/60",
        navbarTitle: "Types of Mythics",
    },
    {
        id: 7,
        slug: "/page-manager/61",
        navbarTitle: "MP Regen Guide",
    },
    {
        id: 8,
        slug: "/page-manager/62",
        navbarTitle: "Attack Speed",
    },
    {
        id: 9,
        slug: "/page-manager/63",
        navbarTitle: "Help I'm New! Guide Quests",
    },
    {
        id: 10,
        slug: "/page-manager/64",
        navbarTitle: "Hard Mode Guide",
    },
    {
        id: 11,
        slug: "/page-manager/65",
        navbarTitle: "Hell Mode Fundamentals",
    },
    {
        id: 12,
        slug: "/page-manager/66",
        navbarTitle: "Hell Mode Guide",
    },
    {
        id: 13,
        slug: "/page-manager/67",
        navbarTitle: "Hell Mode Bosses/Debuffs",
    },
    {
        id: 14,
        slug: "/page-manager/68",
        navbarTitle: "Magic Hell Build",
    },
    {
        id: 15,
        slug: "/page-manager/69",
        navbarTitle: "Exclusive Treasures",
    },
    {
        id: 16,
        slug: "/page-manager/70",
        navbarTitle: "Treasure Upgrade Costs",
    },
    {
        id: 17,
        slug: "/page-manager/71",
        navbarTitle: "How to Unlock Treasures",
    },
    {
        id: 18,
        slug: "/page-manager/72",
        navbarTitle: "Safe Box Earnings Table",
    },
    {
        id: 19,
        slug: "/page-manager/73",
        navbarTitle: "List of Pets",
    },
    {
        id: 20,
        slug: "/page-manager/74",
        navbarTitle: "List of Daily Fortunes",
    },

    {
        id: 21,
        slug: "/page-manager/75",
        navbarTitle: "Indy's Treasures",
    },
];

export default function Navbar({className}) {
    return (
        <div
            id="nav-bar"
            className={className}
        >
            {navbar.map((item) => {
                return (
                    <NavbarButton
                        slug={item.slug}
                        navbarTitle={item.navbarTitle}
                        key={item.id}
                    />
                );
            })}
        </div>
    );
}
